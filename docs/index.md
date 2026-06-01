---
layout: home

hero:
  name: Tetration
  text: Single-file chunked tensor store.
  tagline: Mmap-friendly `.tet` layout with JSON/TOML queries — Rust crate, CLI, and Python bindings.
  actions:
    - theme: brand
      text: Get started
      link: /getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/Latka-Industries/tetration

features:
  - title: One file, many chunks
    details: Portable tensor storage with a catalog, dataset index, and chunk-level mmap access.
  - title: Query in JSON or TOML
    details: Inspect and slice data with the `tet` CLI without loading entire tensors into memory.
  - title: Rust + Python
    details: Use as a crate with optional C ABI, or via tet-py for the Python ecosystem.
---

## Ecosystem

| Component | Role |
|-----------|------|
| **[tetration](https://github.com/Latka-Industries/tetration)** | Rust crate + `tet` CLI |
| **tet-py** | Python package (PyPI) |
| **[ZahirScan](https://github.com/Latka-Industries/zahirscan)** | Metadata extraction for `.tet` in catalog workflows |

::: info Docs in progress
This site is being set up. Rust API reference: [docs.rs/tetration](https://docs.rs/tetration).
:::
