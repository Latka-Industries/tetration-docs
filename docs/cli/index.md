# CLI reference

The **`tet`** binary ships with the [tetration](https://github.com/Latka-Industries/tetration) crate. It provides file inspection, JSON/TOML queries, format conversion, and file health tools.

## Commands

| Command | Alias | Role |
|---------|-------|------|
| [`tet info`](/cli/info) | — | Summarize a file (default: dataset table) |
| [`tet query`](/cli/query) | `q` | Validate and execute JSON/TOML queries |
| [`tet verify`](/cli/verify-repair) | — | Layout health check (exit 1 on failure) |
| [`tet repair`](/cli/verify-repair) | — | Plan or apply safe in-place fixes |
| [`tet convert`](/cli/convert-export) | — | HDF5 / NetCDF / Zarr v3 → `.tet` |
| [`tet export`](/cli/convert-export) | — | `.tet` → Zarr v3 directory store |
| [`tet qhist`](/cli/qhist) | `hist` | Recent queries (platform cache) |

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

`tet info`, `tet query`, and Zarr import still work.

## First commands

```bash
tet convert volume.h5 volume.tet
tet info volume.tet
tet verify volume.tet
tet query '{"dataset":"temperature","mean":[]}' -t volume.tet -x -q
```

## Live help

Full flag lists always match the installed binary:

```bash
tet --help
tet <command> --help
```

See [Exit codes & errors](/cli/exit-codes) for automation details.
