# Rust crate

Add to `Cargo.toml`:

```toml
[dependencies]
tetration = "0.1"
```

## API documentation

Full API reference: **[docs.rs/tetration](https://docs.rs/tetration)**

The crate exposes:

- Read/write helpers for `.tet` files
- Catalog and chunk access
- Optional C ABI for FFI (used by tet-py)

::: tip
Prefer docs.rs for type-level API detail; this site covers usage patterns and guides.
:::
