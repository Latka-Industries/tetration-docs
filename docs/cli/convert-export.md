# tet convert & export

Import external array formats into `.tet`, or export back to Zarr / HDF5 / NetCDF.

## tet convert

Convert HDF5, NetCDF, or Zarr into a `.tet` file.

```bash
tet convert [OPTIONS] <INPUT> <OUTPUT>
```

### Supported inputs

| Format | Sniff / extensions |
|--------|-------------------|
| HDF5 | `.h5`, `.hdf5`, `.hdf`, `.he2`, `.he5`, or file signature |
| NetCDF | `.nc`, `.netcdf`, `.nc4`, `.nc3`, `.cdf`, or signature |
| Zarr v2 / v3 | Directory store (v3 root `zarr.json`, or v2 `.zarray` / `.zgroup`) |

### Flags

| Flag | Effect |
|------|--------|
| `--jobs N` | Parallel chunk read workers (`0` = host `available_parallelism`, capped at 64) |
| `--strict` | Exit with an error and do not write the `.tet` if any source array is skipped |

Unsupported arrays (strings, compounds, empty datasets, scalars) are left out of the file. Their paths and reasons are printed on stderr and included as `skipped` in the JSON report. Without `--strict`, convert still succeeds when at least one numeric array was written.

### Examples

```bash
tet convert volume.h5 volume.tet
tet convert data.nc data.tet
tet convert zarr_store/ output.tet
tet convert volume.h5 volume.tet --jobs 8
```

Convert populates the optional `THST` footer with `dim_names`, `coords`, and `attrs` from source metadata (CF-style attrs, coordinate variables, etc.).

::: info Dependencies
HDF5 and NetCDF convert require the `tetration-hdf5` and `tetration-netcdf` crate features (enabled by default). Install system dev libraries or use `cargo install tetration --no-default-features` for Zarr-only convert.
:::

## tet export

Export a `.tet` file to Zarr, HDF5, or NetCDF. Format is inferred from the output path (or use an explicit directory for Zarr).

```bash
tet export <INPUT> <OUTPUT>
```

| Arg | Effect |
|-----|--------|
| `<INPUT>` | Source `.tet` file |
| `<OUTPUT>` | Destination: Zarr directory (must be missing or **empty**), `.h5` / `.hdf5`, or `.nc` / `.netcdf` |

| Format | Behavior |
|--------|----------|
| **Zarr v3** | Preserves per-dataset **raw** or **zstd** chunk bytes; slash-separated names become nested groups |
| **HDF5** / **NetCDF** | Densifies each dataset (decode + scatter), then writes; carries `dim_names` and basic string attrs |

### Examples

```bash
tet export volume.tet volume.zarr/
tet export volume.tet volume.h5
tet export volume.tet volume.nc
```

Progress (dataset count, chunks/arrays written, elapsed seconds) goes to stderr.

In Rust: [`export_tet`](https://docs.rs/tetration/latest/tetration/export/fn.export_tet.html) (dispatches by path), plus [`export_tet_to_zarr`](https://docs.rs/tetration/latest/tetration/export/fn.export_tet_to_zarr.html), [`export_tet_to_hdf5`](https://docs.rs/tetration/latest/tetration/export/fn.export_tet_to_hdf5.html), and [`export_tet_to_netcdf`](https://docs.rs/tetration/latest/tetration/export/fn.export_tet_to_netcdf.html).

::: info Dependencies
HDF5 and NetCDF export need the same `tetration-hdf5` / `tetration-netcdf` features as convert (default). Zarr export is always available.
:::
