# Python (tet-py)

**[tet-py](https://github.com/Latka-Industries/tet-py)** is the official Python package for Tetration. Install from PyPI, `import tet`, and use the same query engine and `.tet` layout as the Rust crate and `tet` CLI.

::: tip PyPI
**tet-py 0.1.0** is on PyPI: [`pip install tet-py`](https://pypi.org/project/tet-py/)

Do **not** `pip install tetration` — that PyPI name is unrelated math code.
:::

## Naming

| Role | Value |
|------|-------|
| PyPI / GitHub | **`tet-py`** |
| Import | **`import tet`** |
| Rust core | [`tetration`](https://crates.io/crates/tetration) **0.1.9** (linked at build time) |
| Native extension | `tet._native` (PyO3 / maturin, abi3 `cp311+`) |

Python bindings use **PyO3 → tetration rlib**, not the C ABI layer. The C ABI remains in the tetration repo for Julia/R/Go embedders.

## What's shipped (0.1.0)

| Topic | Status |
|-------|--------|
| PyPI wheels (Linux, macOS, Windows) | ✅ |
| Open `.tet`, catalog, `info()` / `summary()` | ✅ |
| Reductions (`mean`, `quantile`, `histogram`, …) | ✅ |
| `QueryResult`, `build_query`, selections | ✅ |
| NumPy **ram** — `read_numpy`, `transform.to_numpy` | ✅ |
| NumPy **spill** — `read_spill`, `transform.to_spill` | ✅ |
| NumPy **sidecar** — `transform.to_sidecar.*` | ✅ (transform → derived `.tet`) |
| NumPy **write** — `TetWriter`, `write_dataset` (f32/f64) | ✅ |
| `tet.convert` extras (h5py, zarr, …) | Planned |
| Zero-copy mmap → NumPy | Planned |
| Object-store paths (`s3://…`) | Upstream tetration Phase 12 |

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
    arr = f.read_numpy("temperature")
    z = f.transform.to_numpy.zscore("temperature")
    side = f.transform.to_sidecar.zscore("temperature", path="temperature.zscore.tet")
    arr = side.to_numpy(f)
```

## When to use what

| Need | Use |
|------|-----|
| Python notebooks / NumPy / pandas | **tet-py** |
| Fast HDF5/NetCDF/Zarr import on a machine with native libs | **`tet convert`** CLI |
| Custom Rust service or lowest-level control | **`tetration`** crate |
| Other language bindings | [C ABI / FFI](/rust/ffi) |

## Related

- [Getting started](/getting-started) — CLI install and first queries
- [Query engine guide](/guides/query-engine/) — wire document schema (shared with CLI)
- [Rust crate](/rust/) — underlying implementation
- [tet-py repo](https://github.com/Latka-Industries/tet-py) — source, CI, issue tracker (Linear canonical)
