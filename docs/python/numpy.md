# NumPy interchange

tet-py materializes dense selections and transforms through the same three sinks as the tetration query engine: **ram**, **spill**, and **sidecar**. Decode stays in Rust; Python receives `numpy.ndarray` (copy path in 0.1.x).

For a **small sample** while running a reduction (not full materialization), use [`preview=N`](/python/operations#preview-samples-previewn) on `mean` / `query_execute` — `QueryResult.preview` returns a 1-D capped array (`tet query -x --preview N`).

Requires **NumPy 2.x** (installed with `tet-py`).

## Read — ram

Materialize a full logical selection into RAM:

```python
import tet

with tet.open("data.tet") as f:
    arr = f.read_numpy("temperature")
    arr = f.dataset("temperature").to_numpy(f)

    # sub-selection (preferred for large tensors)
    arr = f.read_numpy("a", selection=tet.selection_slices(tet.axis_slice(0, 100)))
```

Integer dtypes (`i32`, `u8`, …) work where the engine materializes them. `f16` / `u32` / `u64` export is not yet available ([tetration#20](https://github.com/Latka-Industries/tetration/issues/20)).

::: warning No preflight on read_numpy
`read_numpy` decodes the **full logical selection** with no memory-budget check. For huge tensors, slice the selection or use [read_spill](#read-spill).
:::

## Transform — ram / spill / sidecar

```python
# ram — fails if logical selection exceeds memory_budget_bytes
arr = f.transform.to_numpy.zscore("a")

# spill — dense row-major LE bytes on disk
s = f.transform.to_spill.softmax("a", path="a_softmax.bin")
arr = s.to_numpy()

# sidecar — derived one-chunk .tet published beside the source
side = f.transform.to_sidecar.center("a", path="a.center.tet")
arr = side.to_numpy(f)
```

Omit `path` on spill/sidecar for engine temp files under the platform cache allowlist. Relative paths resolve beside the source `.tet`.

Transform methods: `zscore`, `minmax`, `l1`, `l2`, `center`, `scale`, `log1p`, `sqrt`, `softmax`.

`to_numpy` transforms support **`f32` / `f64`** only.

## Sidecar (transform → `.tet`)

A **sidecar** is a derived, one-chunk `.tet` file written next to the source file. The engine runs pass-1 fold stats, materializes the transform, and publishes a sealed `.tet` (dataset name is typically `{source}-{method}`, e.g. `a-zscore`).

```python
result = f.transform.to_sidecar.zscore("a", path="large.a.zscore.tet")
assert result.memory_strategy == "transform_sidecar"

# Load as ndarray
arr = result.to_numpy(f)

# Or reopen the sidecar as a normal TetFile (mmap, query, read_numpy)
derived = result.open(f)
list(derived)                    # e.g. ['a-zscore']
arr = derived.read_numpy("a-zscore")
```

CLI equivalent:

```json
{
  "dataset": "a",
  "transform": { "method": "zscore" },
  "write": { "target": "sidecar", "timestamp": false }
}
```

**Sidecar vs spill:** spill is opaque row-major bytes (`.bin`); sidecar is a full `.tet` you can mmap, re-query, and pass to other tools. **Sidecar vs ram:** sidecar avoids holding the full array in Python RAM and produces a persistent file.

**Sidecar vs `TetWriter`:** both produce a `.tet` on disk. Sidecar is the query engine writing a **transform result** with preset parameters (path beside source, dataset `{source}-{method}`, inherited metadata, transform history). `TetWriter` / `write_dataset` is **authoring** — you supply the NumPy array, name, chunks, and attrs with no source file or transform. Under the hood tetration today uses separate catalog write paths; unification is tracked in [Linear THI-61](https://linear.app/thicclatka/issue/THI-61).

There is no `read_sidecar` top-level op — only transforms can target the sidecar sink. To export a raw selection without a transform, use [`read_spill`](#read-spill) or slice + `read_numpy`.

## Read — spill

Top-level selection export (wire `mmap_spill`), not a transform:

```python
s = f.read_spill("a", path="a_full.bin")
arr = s.to_numpy()
```

## Memory budget

The query engine resolves **`memory_budget_bytes`** the same way as `tet query -x`:

1. Query `execution.memory_budget_bytes`
2. Per-file chunk-index header
3. Query `execution.memory_budget_percent`
4. Per-file header percent (0 → default **25%** of host RAM)

### transform.to_numpy (write: ram)

If the logical selection exceeds the budget, the engine returns **`TetError`** — use **`to_spill`** instead:

```python
arr = f.transform.to_numpy.zscore("a")   # in-RAM
s = f.transform.to_spill.zscore("a", path="a_zscore.bin")  # no RAM cap on output size
arr = s.to_numpy()
```

Inspect resolved budget via `f.execute(doc, raw=True)` → `execution.memory_budget_bytes`.

### Comparison

| API | Over budget |
|-----|-------------|
| `mean`, `sum`, streaming folds | Chunk streaming — no full dense buffer |
| `median`, `quantile`, `histogram` | Temp spill materialize or refuse |
| `transform.to_numpy` | **Refuse** — use `to_spill` |
| `read_numpy` | **No preflight** — slice or `read_spill` |

## Write

Row-major **`float32` / `float64`** NumPy arrays via `TetWriterSession`:

```python
import numpy as np
import tet

arr = np.arange(6, dtype=np.float32).reshape(2, 3)

# one-shot
tet.write_dataset("out.tet", "temperature", arr, chunk_shape=(2, 3))

# session — multiple datasets, history, footer metadata
w = tet.TetWriter.create("out.tet")
w.push_history_event("write", "notebook")
w.write_dataset(
    "temperature",
    arr,
    chunk_shape=(2, 3),
    attrs={"units": "K"},
    dim_names=("row", "col"),
    coords={"row": ("r0", "r1")},
)
w.commit()

# append to existing file
w = tet.TetWriter.open_append("out.tet")
w.write_dataset("humidity", arr)
w.commit()
```

On `commit`, footer `tool` is set to `tet-py`. Roundtrip: `write_dataset` → `read_numpy` → reductions.

Integer write dtypes beyond f32/f64 are planned ([tet-py#8](https://github.com/Latka-Industries/tet-py/issues/8)).

## Sink summary

| Sink | Read | Transform | Write |
|------|------|-----------|-------|
| **ram** | `read_numpy`, `Dataset.to_numpy()` | `transform.to_numpy.*` | — |
| **spill** | `read_spill` → `.to_numpy()` | `transform.to_spill.*` → `.to_numpy()` | — |
| **sidecar** | Reopen via `SidecarTransformResult.open()` or `tet.open(path)` | `transform.to_sidecar.*` → `.to_numpy(f)` | — (use `TetWriter` for author-written files) |

## Planned

| Topic | Tracking |
|-------|----------|
| Zero-copy mmap → NumPy | [tet-py#11](https://github.com/Latka-Industries/tet-py/issues/11) |
| `read_numpy` preflight | [tet-py#9](https://github.com/Latka-Industries/tet-py/issues/9) |
| Integer `write_dataset` | [tet-py#8](https://github.com/Latka-Industries/tet-py/issues/8) |
| `tet.convert` (h5py, zarr, …) | [tet-py#10](https://github.com/Latka-Industries/tet-py/issues/10) |

Use **`tet convert`** today for HDF5 / NetCDF / Zarr import when native libs are available.
