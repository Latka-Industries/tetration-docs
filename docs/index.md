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

features:
  - title: One file, many chunks
    details: Portable tensor storage with a catalog, dataset index, and chunk-level mmap access.
  - title: Query in JSON or TOML
    details: Scalar and partial reductions, selections, transforms, and spill export — see the query engine guide.
  - title: Rust + Python
    details: Use as a crate with optional C ABI, or via tet-py for the Python ecosystem.
---

<HomeImpls />

::: info Pre-1.0
Layout v1 and query JSON/TOML may change before 1.0. Rust API reference: [docs.rs/tetration](https://docs.rs/tetration).
:::
