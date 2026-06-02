# Versioning

## Layout version

- Bytes `0..4` of the superblock must be ASCII **`TETR`**
- Bytes `4..8` are **`layout_version`** (`u32` LE)
- Only **`1`** is defined today

The optional `layout_version` field in JSON/TOML query documents mirrors this value ([`QueryDocument`](https://docs.rs/tetration/latest/tetration/query/struct.QueryDocument.html)).

## Index version

The chunk index header carries **`index_version`** (`u32` LE at offset 4 within the index region). Must be **1**.

## History footer version

The optional `THST` footer ends with **`history_version`** (`u32` LE). Must be **1**.

## Compatibility policy

| Change type | Approach |
|-------------|----------|
| New wire dtype tags | Extend v1 if readers can ignore unknown tags |
| Boolean as separate wire type | Reserved for layout v2 |
| Breaking layout changes | Bump `layout_version`; v1 readers reject unknown versions |

::: warning Pre-1.0
Tetration is still in development. Layout v1 and query JSON/TOML may change before 1.0. Pin crate and CLI versions in production workflows.
:::

## Concurrency model

v1 has **no** on-disk locking or live-append protocol:

| Pattern | Supported? |
|---------|------------|
| Sealed file, many readers | Yes — mmap read-only after `commit` / `tet convert` |
| One writer, then readers | Yes |
| Parallel writers on one file | No (undefined behavior) |
| Read while another process writes | No (undefined behavior) |

Scale comes from **immutable files + mmap readers**, not concurrent writers.

## Verification

`tet verify` checks that all version fields match expected values and that structural invariants hold. Use `--deep` to decode every chunk payload on large files (default quick scan: first 128 chunks).
