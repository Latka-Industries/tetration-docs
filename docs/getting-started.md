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

```bash
pip install tet-py
```

```python
import tet

with tet.open("volume.tet") as f:
    print(tet.__version__, tet.core_version())
    print(f.mean("temperature"))

    # Optional capped preview while querying (CLI: --preview N)
    r = f.mean("temperature", preview=32)
    r.scalar, r.preview.shape

    # Dense export — three sinks (same as the query engine)
    arr = f.read_numpy("temperature")                              # ram
    z = f.transform.to_numpy.zscore("temperature")                 # transform → ram
    spill = f.transform.to_spill.zscore("temperature", path="z.bin")
    spill.to_numpy()
    side = f.transform.to_sidecar.zscore("temperature", path="z.tet")  # sidecar → .tet
    side.to_numpy(f)
```

See [Python overview](/python/), [quick start](/python/quick-start), and [NumPy interchange](/python/numpy) (ram / spill / sidecar).

## Next steps

- [Format spec](/format/) — `.tet` on-disk layout
- [CLI reference](/cli/) — all `tet` commands
- [Query engine](/guides/query-engine/) — what queries can do
- [Query cookbook](/guides/query-cookbook) — copy-paste examples
- [Python (tet-py)](/python/) — PyPI install, query API, NumPy
- [Guides](/guides/) — format comparisons, mmap patterns, catalog integration
