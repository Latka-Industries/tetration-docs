# Python (tet-py)

**[tet-py](https://github.com/Latka-Industries/tet-py)** is the official Python package for Tetration. Install from PyPI, `import tet`, and use the same query engine and `.tet` layout as the Rust crate and `tet` CLI.

::: tip Current line
**tet-py 0.8.2** pins crates.io **tetration 0.8.2**. [`pip install tet-py`](https://pypi.org/project/tet-py/).
:::

## Naming

| Role | Value |
|------|-------|
| PyPI / GitHub | **`tet-py`** |
| Import | **`import tet`** |
| Native extension | `tet._native` (PyO3 / maturin, abi3 `cp311+`) |

Bindings are **PyO3 → tetration rlib**, not the C ABI. For Julia / R / Go, see [FFI](/rust/ffi). Pin map: [Version alignment](/python/version-alignment).

## What you get

- Open a `.tet`, `.tet.d` package, or `s3://` URI
- Same JSON/TOML queries as the CLI; NumPy sinks (ram / spill / sidecar)
- Write with `TetWriter` / `write_dataset`; convert / export via extras (`[h5]`, `[netcdf]`, `[zarr]`, `[parquet]`, `[export]`)
- Package helpers: ingest, publish, pack
- Job files: [`tet.run_job`](/guides/job-files#reading-the-report)

Details are in the sections below — not a per-release changelog.

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

Sidecar is **transform-only** (engine writes a derived `.tet`; open with `side.open(f)` or `tet.open`). Spill is raw bytes; sidecar is a full catalog file. Prefer sidecar for transform provenance; `TetWriter` for general authoring ([details](/python/numpy#sidecar-transform-tet)).

Convert / export: `tet.convert` / `tet.export` (+ extras). Same importers as the CLI without Python deps — [Install](/python/install), [CLI convert & export](/cli/convert-export).

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
tet.pack("demo.tet.d", "demo.tet")
# tet.pack("demo.tet.d", "demo.tet", remove_package=True)  # after verified copy
```

`tet.open` on a `.tet.d` directory follows `CURRENT` and mmaps that generation's `packed.tet`. `tet.pack` copies that sealed image to a standalone `.tet`; pass `remove_package=True` to delete the package only after verify (close pinned readers first). See [CLI packages](/cli/package) for the on-disk layout (`tet gc` / `tet publish --abort` are CLI-only today).

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

Credentials: `S3Store.connect(...)` args, or `TETRATION_S3_*` for `tet.open("s3://…")` / `tet.convert("s3://…")`.

| Path | Behavior |
| ---- | -------- |
| `tet.open("s3://bucket/prefix")` | Pin + range-read (no full download) |
| `store.open("current")` | Downloads `packed.tet` |
| `tet.convert("s3://…/file.ext")` | Download one object, then local import |
| `tet.convert("s3://…/store.zarr")` | Needs `[zarr]`; fetch chunks as needed |

More: [store-backed reads](/rust/store-backed-reads#python-tet-py).

## Related

- [Getting started](/getting-started) — CLI install and first queries
- [Query engine guide](/query/) — wire document schema (shared with CLI)
- [Rust crate](/rust/) — underlying implementation
- [tet-py repo](https://github.com/Latka-Industries/tet-py) — source, CI, issues
- [Roadmap](/roadmap) — shipped index and prospective directions
