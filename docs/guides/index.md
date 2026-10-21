# Guides

Practical docs for choosing Tetration, reading data efficiently, and running queries.

## Available guides

| Guide | Description |
|-------|-------------|
| [Query engine](/guides/query-engine/) | Overview — what queries can do |
| [Query document](/guides/query-engine/document) | Wire fields, TOML equivalents, execution hints |
| [Operations](/guides/query-engine/operations) | Every op, response fields, examples |
| [Selections & metadata](/guides/query-engine/selection-and-metadata) | Slices, striding, dim names, coord labels |
| [Execution strategies](/guides/query-engine/execution) | Memory budget, spill, transforms, GPU |
| [Query cookbook](/guides/query-cookbook) | Copy-paste JSON/TOML examples |
| [Format comparison](/guides/format-comparison) | `.tet` vs Parquet vs Zarr vs NPY |
| [Mmap read patterns](/guides/mmap-patterns) | Partial chunk access in Rust and Python |
| [Semantics](/guides/semantics/) | Declared attrs vs caller policy; scaffold / set; worked examples |

## Quick links

- [Getting started](/getting-started) — install CLI or tet-py, first commands
- [Python (tet-py)](/python/) — PyPI install, query API, NumPy
- [Format spec](/format/) — on-disk layout
- [CLI reference](/cli/) — all `tet` commands
- [Roadmap](/roadmap) — shipped index and prospective directions
