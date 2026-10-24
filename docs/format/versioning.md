# Versioning

## Layout version

- Bytes `0..4` of the superblock must be ASCII **`TETR`**
- Bytes `4..8` are **`layout_version`** (`u32` LE)
- Only **`1`** is defined today

The optional `layout_version` field in JSON/TOML query documents mirrors this value ([`QueryDocument`](https://docs.rs/tetration/latest/tetration/query/struct.QueryDocument.html)).

## Index version

The chunk index header carries **`index_version`** (`u32` LE at offset 4 within the index region). Must be **1**.

## History footer version

The optional `THST` footer ends with **`history_version`** (`u32` LE):

| Value | Meaning |
|-------|---------|
| **1** | History / metadata (and optional `metadata_ref`) only |
| **2** | May carry embedded ZONE/INDEX spills + refs — [Embedded indexes](/format/embedded-indexes) |

`layout_version` stays **1**. Readers that only implement version **1** refuse version **2**.

## Compatibility policy

| Change type | Approach |
|-------------|----------|
| New wire dtype tags | Extend v1 if readers can ignore unknown tags |
| Boolean as separate wire type | Reserved for layout v2 |
| Breaking layout changes | Bump `layout_version`; v1 readers reject unknown versions |
| Embedded ZONE/INDEX | `history_version = 2`; not a `layout_version` bump |
| Package sidecars (`ZONE.json`, `INDEX.json`) | Beside `packed.tet`; unknown manifest keys ignored; not a layout bump |
| Query wire (`filter`, `group_by`, `window`, …) | Versioned with the crate minor; SPEC / conformance milestone — not `layout_version` |

The normative contract (layout, writer protocol, query wire, C ABI) and the CI conformance pack live in the crate: [`SPEC/`](https://github.com/Latka-Industries/tetration/tree/main/SPEC) · [`conformance/`](https://github.com/Latka-Industries/tetration/tree/main/conformance). Current published line: **0.8.0**.

::: warning Pre-1.0
Tetration is still in development. Layout v1 and query JSON/TOML may change before 1.0. Pin crate and CLI versions in production workflows.
:::

## Concurrency model

A **sealed** layout-v1 `.tet` has **no** on-disk locking or live-append protocol:

| Pattern | Supported? |
|---------|------------|
| Sealed file, many readers | Yes — mmap read-only after `commit` / `tet convert` / pack |
| One writer, then readers | Yes |
| Parallel writers on one file | No (undefined behavior) |
| Read while another process writes | No (undefined behavior) |
| Multi-writer via package | Yes — shards → publish → new sealed generation |

Scale for a sealed file comes from **immutable bytes + mmap (or range-read) readers**.

**Multi-writer:** concurrent ingest uses **immutable shards → single publish → sealed generation**, then readers pin that generation (local `.tet.d` or store; optionally `tet pack` to a standalone `.tet`). See [CLI packages](/cli/package) and [writer protocol v2](https://github.com/Latka-Industries/tetration/blob/main/docs/writer_protocol_v2.md).

## Verification

`tet verify` checks that all version fields match expected values and that structural invariants hold. Use `--deep` to decode every chunk payload on large files (default quick scan: first 128 chunks).
