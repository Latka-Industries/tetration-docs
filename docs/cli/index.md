# CLI reference

The **`tet`** binary ships with the [tetration](https://github.com/Latka-Industries/tetration) crate. It provides file inspection, JSON/TOML queries, format conversion, and file health tools.

## Commands

| Command | Alias | Role |
|---------|-------|------|
| [`tet info`](/cli/info) | — | Summarize a file (default: dataset table) |
| [`tet query`](/cli/query) | `q` | Validate and execute JSON/TOML queries |
| [`tet verify`](/cli/verify-repair) | — | Layout / `.tet.d` package health check (exit 1 on failure) |
| [`tet repair`](/cli/verify-repair) | — | Plan or apply safe in-place fixes (footer, stale publish) |
| [`tet convert`](/cli/convert-export) | — | HDF5 / NetCDF / Zarr / NumPy / CSV / Parquet → `.tet` (auto-embeds ZONE/INDEX) |
| [`tet index`](/cli/convert-export#tet-index) | — | (Re)embed or `--clear` ZONE/INDEX footer spills |
| `tet worker` | — | Localhost distributed harness: `WorkerJobV1` JSON → `WorkerPartialV1` (fold + dense materialize) |
| [`tet export`](/cli/convert-export) | — | `.tet` → Zarr v3 / HDF5 / NetCDF |
| [`tet ingest`](/cli/package) / [`publish`](/cli/package) / [`pack`](/cli/package) / [`gc`](/cli/package) | — | Local `.tet.d` package ingest → publish → pack / cleanup |
| [`tet qhist`](/cli/qhist) | `hist` | Recent queries (platform cache) |
| [`tet semantics`](/cli/semantics) | — | Apply one-file TOML / scaffold / set / lint / package SEMANTICS.json |

## Install

**macOS (Homebrew, recommended):**

```bash
brew tap Latka-Industries/tetration https://github.com/Latka-Industries/tetration
brew install tetration
```

**cargo install:**

```bash
cargo install tetration
```

Default features need system HDF5 and NetCDF dev libraries for `tet convert`. Without them:

```bash
cargo install tetration --no-default-features
```

`tet info`, `tet query`, and Zarr / NumPy / CSV / Parquet import still work (HDF5/NetCDF need the default features).

## First commands

```bash
tet convert volume.h5 volume.tet
tet info volume.tet
tet verify volume.tet
tet query '{"dataset":"temperature","mean":[]}' -t volume.tet -x -q

# Multi-writer package
tet ingest a.tet b.tet --out climate.tet.d --jobs 2
tet publish climate.tet.d --dry-run
tet publish climate.tet.d
tet query '{"dataset":"temp","mean":[]}' -t climate.tet.d -x -q
tet pack climate.tet.d -o climate.tet
tet gc climate.tet.d              # dry-run
```

## Live help

Full flag lists always match the installed binary:

```bash
tet --help
tet <command> --help
```

See [Exit codes & errors](/cli/exit-codes) for automation details.
