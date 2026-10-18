# Format comparison

When does Tetration fit vs other array storage formats?

## Summary

| Format | Storage model | Best for |
|--------|---------------|----------|
| **`.tet`** | Single sealed file (or `.tet.d` package of sealed generations), chunked | Portable multi-array files, partial I/O, JSON/TOML queries, sealed packages on object stores |
| **Parquet** | Columnar, often many files | Tabular analytics, column pruning, SQL engines |
| **Zarr** | Directory of chunk blobs | Live cloud-native sharded writes, many concurrent writers on one prefix |
| **NPY/NPZ** | Single array (NPZ = zip of NPY) | Simple NumPy interchange, small datasets |

## `.tet` strengths

- **One file** to copy, archive, or attach — no directory tree for the sealed image
- **Partial I/O** — touch only intersecting regions (local mmap, or range-read a sealed `packed.tet` on S3)
- **Built-in query engine** — aggregates, transforms, QC counts via JSON/TOML
- **Packages** — multi-writer shards → publish → sealed generation; same protocol locally and on S3-compatible stores ([store-backed reads](/rust/store-backed-reads))
- **Import path** — `tet convert` from HDF5, NetCDF, Zarr (local or `s3://`)
- **Metadata footer** — axis names, coordinate labels, CF-style attrs

## When to choose something else

**Parquet** — if your workload is primarily tabular with heavy column filtering, joins, or DuckDB/Spark integration.

**Zarr** — if you need many concurrent writers appending chunks to a **live** cloud prefix, or deep integration with the Python xarray/dask ecosystem at write time. Tetration cloud writes are package ingest + CAS publish of a sealed generation, not a mutable directory of blobs.

**NPY** — if you have a single small array and just need NumPy load/save.

**HDF5/NetCDF directly** — if you need the full feature set of those formats (groups, unlimited dimensions, netCDF conventions tooling) without conversion.

## Hybrid workflows

A common pattern:

1. Convert HDF5/NetCDF/Zarr → `.tet` with `tet convert`
2. Query aggregates with `tet query` (no full load)
3. Export subsets back to Zarr with `tet export` when needed

## Design stance

Tetration combines **HDF5-shaped persistence** (many arrays in one file) with **Zarr-shaped chunking** (regular grid, per-chunk compression). Partial I/O is the default case — full-array loads into RAM are not required for planning or tier-A/B aggregates. Cloud support targets **sealed packages**, not Zarr-style live prefix mutation.

See [Design rationale](/format/design-rationale) for more detail.
