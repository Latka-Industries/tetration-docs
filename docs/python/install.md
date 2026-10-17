# Install

## PyPI (recommended)

```bash
pip install tet-py
```

Requires **Python 3.11+**. Wheels ship for common Linux (x86_64, aarch64), macOS (universal2), and Windows targets. The package depends on **NumPy 2.x**.

Verify:

```python
import tet
print(tet.__version__)       # tet-py release, e.g. 0.3.2
print(tet.core_version())    # linked tetration crate, e.g. 0.3.2
```

Optional convert / export extras (install what you need):

```bash
pip install "tet-py[h5]"        # HDF5 via h5py (convert + export)
pip install "tet-py[netcdf]"    # NetCDF via netCDF4 (convert + export)
pip install "tet-py[zarr]"      # Zarr (convert + export)
pip install "tet-py[parquet]"   # Parquet via pyarrow (convert only)
pip install "tet-py[export]"    # h5 + netcdf + zarr (export side)
pip install "tet-py[convert]"   # all convert extras (includes parquet)
```

Core `.npy` / `.npz` / `.csv` / `.tsv` convert needs no extras.

::: warning PyPI name collision
Install **`tet-py`**, not `tetration`. The PyPI project named `tetration` is unrelated.
:::

## Build from source

For development or unreleased fixes:

```bash
git clone https://github.com/Latka-Industries/tet-py.git
cd tet-py
```

**With uv (recommended in repo):**

```bash
uv sync --extra dev
uv run maturin develop
uv run pytest -q
```

**With pip:**

```bash
pip install maturin
maturin develop --release
pip install -e .
```

Build requirements:

- Python **3.11+**
- Rust **1.95+**
- [maturin](https://www.maturin.rs/) **1.7+**

Release builds pin **`tetration`** from [crates.io](https://crates.io/crates/tetration) (currently **0.3.2**, with the `tetration-s3` feature) — no sibling tetration checkout required.

## Install the CLI (optional)

tet-py does not require the `tet` binary, but it is useful for convert, verify, and shell workflows:

**macOS — Homebrew:**

```bash
brew tap Latka-Industries/tetration https://github.com/Latka-Industries/tetration
brew install tetration
```

**cargo:**

```bash
cargo install tetration
```

Default features need system HDF5 and NetCDF dev libraries for `tet convert`. Without them:

```bash
cargo install tetration --no-default-features
```

`tet info`, `tet query`, and Zarr import still work.

## Next steps

- [Quick start](/python/quick-start)
- [Version alignment](/python/version-alignment)
