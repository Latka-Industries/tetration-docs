# Chunk reads

The query engine resolves logical selections to chunk coordinates and mmap's only intersecting payloads.

## Query-based reads

The primary read path goes through the query engine:

```rust
use tetration::catalog::TetFile;
use tetration::prelude::*;

let file = TetFile::open("data.tet")?;
let response = execute_query_json(
    r#"{"dataset":"temperature","mean":[]}"#,
    file.path(),
    file.mmap(),
    ExecuteQueryOptions::execute_no_preview(),
    None,
)?;
```

For plan-only (no decode):

```rust
let doc = parse_query_json(r#"{"dataset":"temperature","mean":[]}"#)?;
validate_query(&doc)?;
let response = plan_query_with_tet_mmap(&doc, file.path(), file.mmap())?;
// response.read_plan describes chunk coordinates and payload spans
```

## Dense materialization

When you need a full dense buffer (no preview cap):

```rust
use tetration::query::{materialize_query_selection, MaterializeQueryOptions};

let outcome = materialize_query_selection(
    &doc,
    file.path(),
    file.mmap(),
    MaterializeQueryOptions::default(),
)?;
// outcome.data holds the dense f32 (or typed) buffer
```

For transforms with `write: ram`:

```rust
use tetration::query::materialize_query_transform_ram;
```

See the upstream [query engine — embedder dense export](https://github.com/Latka-Industries/tetration/blob/main/docs/query_engine.md#embedder-dense-export).

## Low-level chunk access

For custom readers, use the catalog summary to iterate chunk index rows:

```rust
let summary = read_tet_summary_v1(file.mmap())?;
for chunk in &summary.chunks {
    // chunk.dataset_id, chunk.chunk_index, chunk.payload_offset,
    // chunk.raw_byte_len, chunk.stored_byte_len, chunk.codec
}
```

Decode a tile with [`ChunkPayloadCodecV1::decode_tile_payload`](https://docs.rs/tetration/latest/tetration/catalog/struct.ChunkPayloadCodecV1.html).

## Memory budget

The chunk index header stores per-file execution defaults (`memory_budget_percent_bps`, `memory_budget_bytes`). Query JSON `execution.memory_budget_*` overrides at runtime.

See [Mmap read patterns](/guides/mmap-patterns) for end-to-end examples.
