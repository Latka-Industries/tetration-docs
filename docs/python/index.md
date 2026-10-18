# Python (tet-py)

**[tet-py](https://github.com/Latka-Industries/tet-py)** is the official Python package for Tetration. Install from PyPI, `import tet`, and use the same query engine and `.tet` layout as the Rust crate and `tet` CLI.

::: tip PyPI
**tet-py 0.3.4** on PyPI: [`pip install tet-py`](https://pypi.org/project/tet-py/)

Do **not** `pip install tetration` — that PyPI name is unrelated math code.
:::

## Naming

| Role | Value |
|------|-------|
| PyPI / GitHub | **`tet-py`** |
| Import | **`import tet`** |
| Rust core | [`tetration`](https://crates.io/crates/tetration) **0.3.4** (linked at build time) |
| Native extension | `tet._native` (PyO3 / maturin, abi3 `cp311+`) |

Python bindings use **PyO3 → tetration rlib**, not the C ABI layer. The C ABI remains in the tetration repo for Julia/R/Go embedders.

## What's shipped (0.3.x)

**0.3.4** pins tetration **0.3.4**. `tet.open("s3://bucket/prefix")` pins that package (`?generation=N` or `CURRENT`) and range-reads on query. **0.3.3** added single-file `tet.convert("s3://bucket/object.ext")` (full download, then the existing importer). **0.3.2** picked up the exclusive cross-host `publishing/<G>` claim with no new Python API. **0.3.1** added `S3Store` ingest / publish / pin. **0.3.0** added store URI open + generation pins. The table includes the full 0.2 feature set plus 0.3 additions.

| Topic | Status |
|-------|--------|
| PyPI wheels (Linux, macOS, Windows) | ✅ |
| Open `.tet`, catalog, `info()` / `summary()` | ✅ |
| Open `.tet.d` packages (pin `CURRENT` once; `TetFile.generation`) | ✅ |
| URI open (`file://`, `?generation=N`); `MemoryStore` + `memory://` | ✅ |
| `S3Store.connect` + ingest / publish / pin open | ✅ |
| `tet.ingest` / `tet.publish` | ✅ |
| Reductions + `QueryResult` (`preview=N` → `.preview` ndarray) | ✅ |
| TOML query strings + `memory_budget_*` kwargs | ✅ |
| `build_query`, selections | ✅ |
| NumPy **ram** — `read_numpy` (budget preflight), `transform.to_numpy` | ✅ |
| NumPy **spill** — `read_spill`, `transform.to_spill` | ✅ |
| NumPy **sidecar** — `transform.to_sidecar.*` | ✅ |
| NumPy **write** — `TetWriter`, `write_dataset` (layout-v1 floats + integers + `f16`) | ✅ |
| Zero-copy `read_numpy` — single-chunk or full-width multi-chunk raw → `numpy.memmap` | ✅ |
| `tet.convert` — `.npy` / `.npz` / `.csv` / `.tsv` | ✅ |
| `tet.convert` extras (`[h5]`, `[netcdf]`, `[zarr]`, `[parquet]`) | ✅ (optional deps) |
| `tet.convert("s3://bucket/file.ext")` — one object, then the local importer | ✅ |
| `tet.export` / `TetFile.export` (`[h5]`, `[netcdf]`, `[zarr]`, or `[export]`) | ✅ (optional deps) |
| `tet.open("s3://bucket/prefix")` — pin, then range-read (`?generation=N` optional) | ✅ |

## Sections

- [Install](/python/install) — PyPI and build from source
- [Quick start](/python/quick-start) — open, query, inspect
- [Query operations](/python/operations) — reductions, transforms, `QueryResult`
- [NumPy interchange](/python/numpy) — ram / spill / sidecar read and write
- [Version alignment](/python/version-alignment) — tet-py ↔ tetration crate

## When to use each sink

| Sink | Output | Typical use |
|------|--------|-------------|
| **ram** | `numpy.ndarray` in process | Notebooks, arrays that fit memory budget |
| **spill** | Row-major `.bin` beside source | Large transforms; reload with `.to_numpy()` |
| **sidecar** | One-chunk `.tet` beside source | Keep transformed data as a mmap-friendly `.tet` (re-query, share, append pipeline) |

Sidecar is **transform-only** (no top-level `read_sidecar` — the engine writes a derived `.tet`, then you `side.open(f)` or `tet.open(path)`). Spill is raw bytes; sidecar is a full catalog file. Sidecar vs `TetWriter`: sidecar presets path, naming, and provenance from the transform; `TetWriter` is general authoring from your array ([NumPy — sidecar vs TetWriter](/python/numpy#sidecar-transform-tet)).

## Minimal example

```python
import tet

with tet.open("data.tet") as f:
    print(tet.__version__, tet.core_version())
    print(f.mean("temperature"))
    r = f.mean("temperature", preview=32)   # QueryResult: scalar + capped preview
    arr = f.read_numpy("temperature")
    z = f.transform.to_numpy.zscore("temperature")
    side = f.transform.to_sidecar.zscore("temperature", path="temperature.zscore.tet")
    arr = side.to_numpy(f)
```

## Packages

```python
import tet
from tet import write_dataset

write_dataset("part.tet", "values", arr)
tet.ingest("demo.tet.d", "part.tet", create=True)
tet.publish("demo.tet.d", ["part"])
with tet.open("demo.tet.d") as f:
    f.mean("values")
```

`tet.open` on a `.tet.d` directory follows `CURRENT` and mmaps that generation's `packed.tet`. See [CLI packages](/cli/package) for the on-disk layout.

### S3-compatible store

```python
from tet import S3Store, write_dataset

write_dataset("part.tet", "values", arr)
store = S3Store.connect(
    endpoint="http://127.0.0.1:9000",
    bucket="tetration-test",
    access_key_id="tetration",
    secret_access_key="tetration-secret",
    prefix="demo",
)
store.ingest("part.tet", session_id="s0", part_id="values")
store.publish(["values"])
pinned = store.open("current")   # pin; later publish does not retarget
assert pinned.generation == 1
```

Endpoint and credentials are arguments to `S3Store.connect`, or `TETRATION_S3_*` for `tet.open("s3://bucket/prefix")`. That open pins the package and range-reads; it does not download `packed.tet`. `store.open("current")` still does. `tet.convert("s3://bucket/object.ext", "out.tet")` is a separate path: it downloads that one foreign file and runs the local importer. A Zarr prefix is rejected. See [store-backed reads](/rust/store-backed-reads#python-tet-py).

## When to use what

| Need | Use |
|------|-----|
| Python notebooks / NumPy / pandas | **tet-py** |
| HDF5 / NetCDF / Zarr / Parquet → `.tet` from Python | **`tet.convert`** with the matching optional extra |
| `.tet` → HDF5 / NetCDF / Zarr from Python | **`tet.export`** with `[h5]` / `[netcdf]` / `[zarr]` / `[export]` |
| Fast native convert / export without Python deps | **`tet convert`** / **`tet export`** CLI |
| Custom Rust service or lowest-level control | **`tetration`** crate |
| Other language bindings | [C ABI / FFI](/rust/ffi) |

## Related

- [Getting started](/getting-started) — CLI install and first queries
- [Query engine guide](/guides/query-engine/) — wire document schema (shared with CLI)
- [Rust crate](/rust/) — underlying implementation
- [tet-py repo](https://github.com/Latka-Industries/tet-py) — source, CI, issues
- [Roadmap](/roadmap) — shipped index and prospective directions
