# Format specification

Tetration stores chunked tensor data in a single `.tet` file with a mmap-friendly layout.

## Overview

- **Catalog** — top-level index of datasets and metadata
- **Datasets** — named tensor collections with dtype/shape info
- **Chunks** — fixed-size regions for efficient partial reads

::: info
Detailed byte-level spec coming soon. See the [tetration repository](https://github.com/Latka-Industries/tetration) for the canonical implementation.
:::

## Design goals

- Single-file portability
- Memory-mapped reads without full deserialization
- Query-friendly metadata (JSON/TOML)
