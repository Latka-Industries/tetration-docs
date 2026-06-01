# Getting started

## Install the CLI

```bash
cargo install tet --git https://github.com/Latka-Industries/tetration
```

Or from a local checkout:

```bash
git clone https://github.com/Latka-Industries/tetration.git
cd tetration
cargo install --path .
```

## Inspect a file

```bash
tet info path/to/file.tet
```

## Python (tet-py)

```bash
pip install tet-py
```

::: info
tet-py docs will expand in [/python/](/python/). Package availability may track the tetration release cadence.
:::

## Next steps

- [Format spec](/format/) — `.tet` on-disk layout
- [CLI reference](/cli/) — `tet` commands
- [Rust crate](/rust/) — library usage
- [Guides](/guides/) — when to use `.tet` vs Parquet, Zarr, etc.
