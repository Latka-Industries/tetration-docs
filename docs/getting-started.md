# Getting started

## Install the CLI

### macOS — Homebrew (recommended)

```bash
brew tap Latka-Industries/tetration https://github.com/Latka-Industries/tetration
brew install tetration
tet --help
```

### cargo install

```bash
cargo install tetration
```

Default features need system HDF5 and NetCDF dev libraries for `tet convert`. Without them:

```bash
cargo install tetration --no-default-features
```

`tet info`, `tet query`, and Zarr import still work.

### From source

```bash
git clone https://github.com/Latka-Industries/tetration.git
cd tetration
cargo build --release
export PATH="$PWD/target/release:$PATH"
```

## Convert a file

```bash
tet convert volume.h5 volume.tet     # HDF5
tet convert data.nc data.tet         # NetCDF
tet convert zarr_store/ output.tet   # Zarr v3 directory
```

## Inspect a file

```bash
tet info volume.tet
tet info volume.tet --metadata       # axis names and coord labels
tet verify volume.tet                # health check
```

## Run a query

Query documents are flat JSON or TOML — same wire shape, either format:

::: code-group

```json [mean.json]
{ "dataset": "temperature", "mean": [] }
```

```toml [mean.toml]
dataset = "temperature"
mean = []
```

:::

```bash
# Inline JSON
tet query '{"dataset":"temperature","mean":[]}' -t volume.tet -x -q

# TOML file
tet query mean.toml -t volume.tet -x -q

# Table preview
tet query mean.toml -t volume.tet -x --format table --preview 6
```

## Rust library

```toml
[dependencies]
tetration = "0.1.9"
```

```rust
use tetration::prelude::*;
// TetWriterSession, TetFile, execute_query_json, …
```

See [Rust quick start](/rust/quick-start).

## Python (tet-py)

::: info
tet-py is not yet published to PyPI. Use the CLI or Rust crate for now. See [Python overview](/python/).
:::

## Next steps

- [Format spec](/format/) — `.tet` on-disk layout
- [CLI reference](/cli/) — all `tet` commands
- [Query engine](/guides/query-engine/) — what queries can do
- [Query cookbook](/guides/query-cookbook) — copy-paste examples
- [Guides](/guides/) — format comparisons, mmap patterns, catalog integration
