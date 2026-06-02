# Format comparison

When does Tetration fit vs other array storage formats?

## Summary

| Format | Storage model | Best for |
|--------|---------------|----------|
| **`.tet`** | Single file, chunked, mmap-friendly | Portable multi-array files, partial I/O, JSON/TOML queries |
| **Parquet** | Columnar, often many files | Tabular analytics, column pruning, SQL engines |
| **Zarr** | Directory of chunk blobs | Cloud-native sharded writes, many concurrent writers |
| **NPY/NPZ** | Single array (NPZ = zip of NPY) | Simple NumPy interchange, small datasets |

## `.tet` strengths

- **One file** to copy, archive, or attach — no directory tree
- **Chunk-level mmap** — touch only intersecting regions
- **Built-in query engine** — aggregates, transforms, QC counts via JSON/TOML
- **Import path** — `tet convert` from HDF5, NetCDF, Zarr v3
- **Metadata footer** — axis names, coordinate labels, CF-style attrs

## When to choose something else

**Parquet** — if your workload is primarily tabular with heavy column filtering, joins, or DuckDB/Spark integration.

**Zarr** — if you need many concurrent writers appending chunks to a cloud store, or deep integration with the Python xarray/dask ecosystem at write time.

**NPY** — if you have a single small array and just need NumPy load/save.

**HDF5/NetCDF directly** — if you need the full feature set of those formats (groups, unlimited dimensions, netCDF conventions tooling) without conversion.

## Hybrid workflows

A common pattern:

1. Convert HDF5/NetCDF/Zarr → `.tet` with `tet convert`
2. Query aggregates with `tet query` (no full load)
3. Export subsets back to Zarr with `tet export` when needed

## Design stance

Tetration combines **HDF5-shaped persistence** (many arrays in one file) with **Zarr-shaped chunking** (regular grid, per-chunk compression). Partial I/O is the default case — full-array loads into RAM are not required for planning or tier-A/B aggregates.

See [Design rationale](/format/design-rationale) for more detail.
