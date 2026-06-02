# Exit codes & errors

## Exit codes

| Command | Code 0 | Code 1 |
|---------|--------|--------|
| `tet verify` | All checks pass | Verification failed |
| `tet query` | Success | Parse, validation, or execution error |
| `tet convert` / `tet export` | Success | I/O or format error |
| `tet repair` | Success | Repair failed or invalid code |
| `tet info` | Success | File not found or unreadable |

Most commands follow the convention: **0 = success, non-zero = failure**.

## Common failure modes

### File not found or unreadable

```
Error: No such file or directory
```

Verify the path and file permissions. `.tet` files must be fully written (sealed) before reading.

### Invalid query document

```
Error: query validation failed
```

Queries must be flat JSON/TOML. Check for nested `"operation"` objects, missing `"dataset"`, or unsupported keys. See the [Query cookbook](/guides/query-cookbook).

### Dataset not in catalog

The query references a dataset name that doesn't exist. Run `tet info file.tet` to list available datasets.

### Verify failures

| Finding | Typical cause |
|---------|---------------|
| Bad magic | File is not a `.tet` file |
| Index out of bounds | Truncated or corrupted file |
| Payload decode error | Corrupt chunk data or wrong codec |
| Footer invalid | Truncated `THST` JSON — repairable with `tet repair --apply footer_invalid` |

### Convert dependencies missing

HDF5/NetCDF convert requires system dev libraries. Install them or use `--no-default-features` and convert from Zarr only.

## Automation tips

```bash
# CI verify gate
tet verify data.tet -q || exit 1

# JSON report
tet verify data.tet --json | jq '.status'

# Quiet query in scripts
tet query mean.toml -t data.tet -x -q
```

Errors always go to **stderr**. Query success stdout is formatted by `--format`; use `-q` for one-line parsing.
