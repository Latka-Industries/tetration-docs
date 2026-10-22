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

- **One file** to copy, archive, or attach (no directory tree for the sealed image)
- **Partial I/O:** touch only intersecting regions (local mmap, or range-read a sealed `packed.tet` on S3)
- **Built-in query engine:** aggregates, transforms, QC counts via JSON/TOML
- **Packages:** multi-writer shards → publish → sealed generation; same protocol locally and on S3-compatible stores ([store-backed reads](/rust/store-backed-reads))
- **Import path:** `tet convert` from HDF5, NetCDF, Zarr v2/v3, NumPy, CSV/TSV, Parquet (local or `s3://`)
- **Export path:** `tet export` to Zarr v3, HDF5, or NetCDF
- **Metadata footer:** axis names, coordinate labels, CF-style / declared attrs

## When to choose something else

**Parquet** if your workload is primarily tabular with heavy column filtering, joins, or DuckDB/Spark integration.

**Zarr** if you need many concurrent writers appending chunks to a **live** cloud prefix, or deep integration with the Python xarray/dask ecosystem at write time. Tetration cloud writes are package ingest + CAS publish of a sealed generation, not a mutable directory of blobs.

**NPY** if you have a single small array and just need NumPy load/save.

**HDF5/NetCDF directly** if you need the full feature set of those formats (groups, unlimited dimensions, netCDF conventions tooling) without conversion.

## Hybrid workflows

A common pattern:

1. Convert HDF5/NetCDF/Zarr → `.tet` with `tet convert`
2. Query aggregates with `tet query` (no full load)
3. Export subsets back to Zarr / HDF5 / NetCDF with `tet export` when needed

Why this shape (HDF5-like / Zarr-like, sealed query path): [Design rationale](/format/design-rationale).
