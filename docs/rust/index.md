# Rust crate

The **`tetration`** crate provides read/write helpers for `.tet` files, a query engine, format conversion, and an optional C ABI for FFI bindings.

## API documentation

Full type-level API reference: **[docs.rs/tetration](https://docs.rs/tetration)**

This site covers usage patterns and cookbooks. Prefer docs.rs for struct fields, trait bounds, and module listings.

## What the crate provides

| Module | Role |
|--------|------|
| `catalog` | File layout, `TetFile`, `TetWriterSession`, catalog summary |
| `query` | JSON/TOML parse, plan, execute, materialize |
| `convert` | HDF5 / NetCDF / Zarr v3 import |
| `export` | Zarr v3 export |
| `verify` / `repair` | File health |
| `ffi` | C ABI behind `tetration-ffi` feature |

## Current version

```toml
[dependencies]
tetration = "0.1.9"
```

Requires **Rust 1.95+**.

## Sections

- [Quick start](/rust/quick-start) — minimal read example
- [Open & inspect](/rust/open-and-inspect) — catalog access, dataset iteration
- [Chunk reads](/rust/chunk-reads) — mmap and partial read patterns
- [Write path](/rust/write-path) — creating `.tet` files programmatically
- [C ABI / FFI](/rust/ffi) — overview for binding authors

## Embedder flow

1. **Write** — `TetWriterSession::create` → `push_dataset` → `commit()`
2. **Read / aggregate** — `TetFile::open` → `execute_query_json` → `QueryResponse`
3. **Dense tensors** — `materialize_query_selection` or `materialize_query_transform_ram` → `DenseMaterializeOutcome`

## Examples in the repo

```bash
cargo run --example create_and_query
cargo run --example session_write
cargo run --example inspect_catalog
```
