---
layout: home

hero:
  name: Tetration
  text: Single-file chunked tensor store.
  tagline: Sealed chunked tensors with JSON/TOML queries — local mmap or cloud packages, Rust crate, CLI, and Python bindings.
  actions:
    - theme: brand
      text: Get started
      link: /getting-started
    - theme: alt
      text: Python (tet-py)
      link: /python/

features:
  - title: One file, many chunks
    details: Portable tensor storage with a catalog, dataset index, and chunk-level partial I/O (mmap locally, range-read on stores).
  - title: Query in JSON or TOML
    details: Scalar and partial reductions, selections, transforms, and dense export to RAM, spill (`.bin`), or sidecar (derived `.tet`).
  - title: Rust + Python
    details: Use the tetration crate and CLI, or pip install tet-py for NumPy-friendly query and I/O — including S3-compatible packages.
---

<HomeImpls />

::: info Pre-1.0
Layout v1 and query JSON/TOML may change before 1.0. Rust API reference: [docs.rs/tetration](https://docs.rs/tetration).
:::
