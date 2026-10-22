# tet convert & export

Import external array formats into `.tet`, or export back to Zarr / HDF5 / NetCDF.

## tet convert

Convert a foreign array file into a `.tet` file. The importer is chosen from the input path, then from the file signature when the extension is missing or unknown.

```bash
tet convert [OPTIONS] <INPUT> <OUTPUT>
```

### Supported inputs

Extension match is ASCII case-insensitive.

| Format | Extensions | Signature fallback |
|--------|------------|--------------------|
| HDF5 | `.h5`, `.hdf5`, `.hdf`, `.he2`, `.he5` | `\x89HDF\r\n\x1a\n` |
| NetCDF | `.nc`, `.netcdf`, `.nc4`, `.nc3`, `.cdf`, `.ncdf` | classic `CDF\x01` / `CDF\x02` only |
| Zarr v2 / v3 | `.zarr`, or any directory store | v3 root `zarr.json`, or v2 `.zgroup` / `.zarray` |
| NumPy | `.npy`, `.npz` | `\x93NUMPY` selects `.npy` only |
| CSV / TSV | `.csv` (comma), `.tsv` (tab) | none |
| Parquet | `.parquet`, `.pq` | `PAR1` |

Trailing compression suffixes (`.gz`, `.bz2`, `.xz`, `.zst`, `.zip`) are ignored when picking the importer, so `model.nc.gz` is NetCDF. They are not decompressed: the importer still opens the path as given. CSV and TSV also read the real suffix for the delimiter, so `table.csv.gz` is detected as CSV and then rejected.

### Detection caveats

- **NetCDF-4** is an HDF5 file. Give it a NetCDF extension (`.nc`, `.nc4`, …). A missing extension, or an HDF5 extension, selects the HDF5 importer because the HDF5 signature matches first.
- **`.npz` is extension-only.** A bare zip signature is not treated as NumPy. `.npy` can be recognized from the `\x93NUMPY` header when the name is wrong.
- **CSV and TSV are extension-only.** `.txt` and other names are rejected. The delimiter follows the suffix (comma vs tab), not the file contents.
- **Zarr** is a directory. v3 wins when both `zarr.json` and v2 markers are present. A non-directory path ending in `.zarr` is still classified as Zarr and fails when the store cannot be opened.
- **Parquet** matches `.parquet` / `.pq` or the `PAR1` magic.

### Flags

| Flag | Effect |
|------|--------|
| `--jobs N` | Parallel chunk read workers (`0` = host `available_parallelism`, capped at 64) |
| `--strict` | Exit with an error and do not write the `.tet` if any source array is skipped |
| `--chunk-mib N` | Retile every dataset to about *N* MiB along the leading axis (overrides a source chunk grid when set) |

Convert **auto-embeds** zone maps + optional secondary indexes into the output `.tet` (`history_version = 2`). See [Embedded indexes](/format/embedded-indexes).

### What gets written vs skipped

`.tet` stores dense numeric arrays. Anything else is either encoded as numbers, copied into footer metadata, or skipped.

| Source | Text / labels | Skipped |
|--------|---------------|---------|
| **CSV / TSV** | An all-text column becomes an `i64` category dataset. Codes start at `0` in first-seen order; blank → `-1`. Footer attr `tetration_categories` is `{"codes":{…},"missing":-1}` and must fit in one **1024-byte** attribute | Mixed number/text columns; category map over that 1024-byte cap; empty or all-blank columns |
| **Parquet** | UTF-8 / LargeUtf8 columns use the same category rule as CSV | Bool, timestamps, decimals, nested lists/structs, other Arrow types |
| **HDF5 / NetCDF / Zarr** | String **datasets** / char / VLEN / compounds are **not** imported. Scalar string attrs (`units`, `long_name`, …) and numeric coordinate labels can land in the `THST` footer | Scalars, 0-sized arrays, unsupported dtypes |
| **NumPy** | Object / pickled dtypes (`\|O`) **fail** the convert (not a soft skip). String and structured dtypes are skips | Scalars, empty arrays, big-endian, bool, complex, strings, structured dtypes |

CSV / TSV header rule: the first row is a header when any cell is non-numeric; otherwise columns are `col0`, `col1`, … and that row is data. Plain integers stay `i64`; a decimal / `nan` / `inf` / blank promotes the column to `f64` with `NaN` for blanks. Ragged rows and duplicate column names abort the whole convert.

Skipped paths and reasons go to stderr and to `skipped` in the JSON report. Without `--strict`, convert still succeeds when at least one numeric (or category) array was written. With `--strict`, any skip aborts before writing the `.tet`.

### Examples

```bash
tet convert volume.h5 volume.tet
tet convert data.nc data.tet
tet convert zarr_store/ output.tet
tet convert table.csv table.tet
tet convert volume.h5 volume.tet --jobs 8
tet convert s3://bucket/volume.h5 volume.tet
tet convert s3://bucket/store.zarr output.tet
```

A single-file `s3://bucket/object.ext` downloads the whole object, then uses the same importer. A Zarr v2 or v3 prefix on `s3://` is read one chunk at a time (same result as a local-directory convert). Both need the `tetration-s3` feature and `TETRATION_S3_ENDPOINT` (access key, secret, and region have MinIO defaults).


#### CSV categories

Given `table.csv`:

```csv
site,temp_c,flag
alpha,20.1,ok
beta,21.0,
alpha,19.8,warn
```

```bash
tet convert table.csv table.tet
tet info table.tet --metadata
```

That produces three 1-D datasets:

| Dataset | Dtype | Values | Notes |
|---------|-------|--------|-------|
| `site` | `i64` | `0, 1, 0` | Category: first-seen codes `alpha→0`, `beta→1` |
| `temp_c` | `f64` | `20.1, 21.0, 19.8` | Numeric |
| `flag` | `i64` | `0, -1, 1` | Category: `ok→0`, blank→`-1`, `warn→1` |

Footer attrs on `site` and `flag` include `tetration_categories`, for example:

```json
{"codes":{"alpha":0,"beta":1},"missing":-1}
```

A column that mixes numbers and text (e.g. `12` then `hot`) is skipped with reason `non-numeric`. A category map whose JSON exceeds 1024 bytes is skipped rather than truncated.

Convert also populates the optional `THST` footer with `dim_names`, `coords`, and `attrs` from source metadata (CF-style attrs, coordinate variables, etc.).

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
| `<OUTPUT>` | Destination path. Extension picks the format (ASCII case-insensitive): `.h5` / `.hdf5` / `.hdf` / `.he2` / `.he5`, `.nc` / `.netcdf` / `.nc4` / `.nc3` / `.cdf` / `.ncdf`, or `.zarr`. A directory, or a path with no extension, is Zarr and must be missing or **empty**. |

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

## tet index

(Re)build or drop embedded ZONE/INDEX spills on a sealed standalone `.tet`. Convert and writer commit already embed; use this for older bare files or a no-pushdown baseline. See [Embedded indexes](/format/embedded-indexes).

```bash
tet index volume.tet
tet index volume.tet --clear
```

| Flag / arg | Effect |
| ---------- | ------ |
| `<path.tet>` | Target sealed file |
| `--clear` | Drop embeds (`history_version = 1`; keep history/metadata) |
| `-q`, `--quiet` | Suppress the one-line summary |
