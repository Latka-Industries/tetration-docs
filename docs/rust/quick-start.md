# Quick start

Minimal example: create a `.tet` file and run an in-process query.

## Cargo.toml

```toml
[dependencies]
tetration = "0.1.9"
```

## Create and query

```rust
use tetration::catalog::{TetDatasetWrite, TetFile, TetWriterSession};
use tetration::prelude::*;

const SHAPE: [u64; 2] = [2, 3];
const CHUNK_SHAPE: [u64; 2] = [2, 2];

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let path = std::env::temp_dir().join("example.tet");

    // Write
    let mut session = TetWriterSession::create(&path);
    session.push_dataset(TetDatasetWrite::f32_row_major(
        "temperature",
        &SHAPE,
        &CHUNK_SHAPE,
        f32_tensor_one_to_six(),
    )?)?;
    let path = session.commit()?;

    // Read + query
    let file = TetFile::open(&path)?;
    let doc = parse_query_json(r#"{"dataset":"temperature","mean":[]}"#)?;
    validate_query(&doc)?;
    let response = execute_query_document(
        &doc,
        file.path(),
        file.mmap(),
        ExecuteQueryOptions::execute_no_preview(),
        None,
    )?;
    println!(
        "{}",
        format_query_response(&response, QueryOutputFormat::Quiet)?
    );

    Ok(())
}

fn f32_tensor_one_to_six() -> Vec<u8> {
    let mut data = vec![0u8; 24];
    for (slot, n) in data.chunks_exact_mut(4).zip(1_u8..=6) {
        slot.copy_from_slice(&f32::from(n).to_le_bytes());
    }
    data
}
```

Run the upstream example:

```bash
cargo run --example create_and_query
```

## Query input formats

Flat JSON and TOML compile to the same [`QueryDocument`](https://docs.rs/tetration/latest/tetration/query/struct.QueryDocument.html):

```rust
let doc = parse_query_json(r#"{"dataset":"temperature","mean":[]}"#)?;
let doc = parse_query_toml("dataset = \"temperature\"\nmean = []")?;
let doc = parse_query_text(r#"{"dataset":"temperature","mean":[]}"#)?; // auto-detect
```

## Next steps

- [Open & inspect](/rust/open-and-inspect) — catalog summary without querying
- [Write path](/rust/write-path) — metadata, coords, history events
- [docs.rs/tetration](https://docs.rs/tetration) — full API
