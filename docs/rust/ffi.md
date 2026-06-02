# C ABI / FFI

Stable **`extern "C"`** entry points for non-Rust runtimes. The Rust crate remains the full API; the shared library exposes a narrow subset.

## Status

**ABI v1** behind Cargo feature **`tetration-ffi`**:

| Symbol | Role |
|--------|------|
| `tet_abi_version` | Must match `#define TET_ABI_VERSION` in header |
| `tet_open` / `tet_close` | Read-only `.tet` handle |
| `tet_last_error` / `tet_clear_error` | Thread-local UTF-8 error text |
| `tet_summary_json` | Catalog summary JSON |
| `tet_query_json` | Query document JSON → `QueryResponse` JSON |
| `tet_verify_json` | Quick verify report JSON |
| `tet_string_free` | Free buffers from `*_json` |

Header: [`include/tetration.h`](https://github.com/Latka-Industries/tetration/blob/main/include/tetration.h)

## Build

```bash
# Lean shared library (no HDF5 / NetCDF)
cargo build --release --no-default-features --features tetration-ffi
```

Artifacts:

| Platform | Library |
|----------|---------|
| Linux | `target/release/libtetration.so` |
| macOS | `target/release/libtetration.dylib` |
| Windows | `target/release/tetration.dll` |

## C example

```bash
cargo build --release --no-default-features --features tetration-ffi

cc -std=c11 -Wall -Wextra -I include examples/ffi_query.c \
  -L target/release -ltetration -o target/release/ffi_query

# macOS
DYLD_LIBRARY_PATH=target/release target/release/ffi_query sample.tet
```

## Design principles

1. **JSON for documents** — query in and structured result out match `tet query -x`
2. **Opaque handles** — `TetHandle` owns mmap + path
3. **Lean library** — build with `default-features = false` when you only need open/query/verify
4. **`TET_ABI_VERSION`** — bump on breaking C symbol changes

**Out of v1 ABI:** convert/import, writer session, GPU device selection, query history.

## Python bindings

Official Python bindings (**tet-py**) will use this C ABI or PyO3 over the Rust crate. See [Python overview](/python/).

## Release archives

GitHub Releases attach per-platform FFI archives on tag push (`v*`). See upstream [`docs/ffi.md`](https://github.com/Latka-Industries/tetration/blob/main/docs/ffi.md).
