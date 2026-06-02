# Install

::: info Package status
**tet-py** is not yet published to PyPI. This page describes the planned install paths.
:::

## PyPI (planned)

```bash
pip install tet-py
```

Platform wheels will ship for common macOS, Linux, and Windows targets via maturin.

## Build from source (planned)

Once the tet-py repository is published:

```bash
git clone https://github.com/Latka-Industries/tet-py.git  # URL TBD
cd tet-py
pip install .
```

Build requirements:

- Rust toolchain (matching the pinned `tetration` crate version)
- `maturin` for wheel building

## Install the CLI today

While waiting for tet-py, install the `tet` CLI:

**macOS:**

```bash
brew tap Latka-Industries/tetration https://github.com/Latka-Industries/tetration
brew install tetration
```

**cargo:**

```bash
cargo install tetration
```

Then call `tet` from Python via `subprocess` for query and inspection workflows.

## FFI shared library

For custom bindings, build the C ABI directly:

```bash
cargo build --release --no-default-features --features tetration-ffi
```

See [C ABI / FFI](/rust/ffi).
