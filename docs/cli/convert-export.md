# tet convert & export

Import external array formats into `.tet`, or export back to Zarr v3.

## tet convert

Convert HDF5, NetCDF, or Zarr v3 into a `.tet` file.

```bash
tet convert [OPTIONS] <INPUT> <OUTPUT>
```

### Supported inputs

| Format | Sniff / extensions |
|--------|-------------------|
| HDF5 | `.h5`, `.hdf5`, `.hdf`, `.he2`, `.he5`, or file signature |
| NetCDF | `.nc`, `.netcdf`, `.nc4`, `.nc3`, `.cdf`, or signature |
| Zarr v3 | Directory with root `zarr.json` |

### Flags

| Flag | Effect |
|------|--------|
| `--jobs N` | Parallel chunk read workers (`0` = host `available_parallelism`, capped at 64) |

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

Export a `.tet` file to a Zarr v3 directory store.

```bash
tet export <INPUT> <OUTPUT>
```

| Arg | Effect |
|-----|--------|
| `<INPUT>` | Source `.tet` file |
| `<OUTPUT>` | Zarr v3 directory; must be missing or **empty** |

Preserves per-dataset **raw** or **zstd** chunk bytes. Slash-separated dataset names become nested groups (`primary/f32`).

### Example

```bash
tet export volume.tet volume.zarr/
```

Progress (dataset count, chunks written, elapsed seconds) goes to stderr.

In Rust: [`export_tet_to_zarr`](https://docs.rs/tetration/latest/tetration/export/fn.export_tet_to_zarr.html).
