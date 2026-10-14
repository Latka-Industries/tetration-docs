# Write path

Create `.tet` files programmatically with [`TetWriterSession`](https://docs.rs/tetration/latest/tetration/catalog/struct.TetWriterSession.html) or lower-level helpers.

## TetWriterSession (recommended)

```rust
use std::collections::BTreeMap;
use tetration::catalog::{CoordAxisV1, TetDatasetWrite, TetWriterSession};

let mut session = TetWriterSession::create("output.tet");
session.metadata.tool = Some("my-app".to_owned());
session.push_history_event("write", "my-app");

let mut ds = TetDatasetWrite::f32_row_major(
    "temperature",
    &[100, 200],      // shape
    &[32, 64],        // chunk_shape
    tensor_bytes,
)?;
ds.attrs.insert("units".to_owned(), "K".to_owned());
ds.dim_names = Some(vec!["time".to_owned(), "station".to_owned()]);
let mut coords = BTreeMap::new();
coords.insert("time".to_owned(), CoordAxisV1 {
    labels: vec!["2024-01-01".to_owned(), "2024-01-02".to_owned()],
});
ds.coords = Some(coords);

session.push_dataset(ds)?;
let path = session.commit()?;
```

## Dtype builders (0.1.10)

`f32_row_major` and `f64_row_major` are thin wrappers. `row_major` takes any layout-v1 wire dtype tag and stores the tensor with the raw chunk codec. Byte length must match `shape` and the dtype width (little-endian, row-major).

```rust
use tetration::catalog::{DATASET_DTYPE_TAG_V1, TetDatasetWrite};

let ds = TetDatasetWrite::row_major(
    "counts",
    DATASET_DTYPE_TAG_V1.i32,
    &[100, 200],
    &[32, 64],
    tensor_bytes,
)?;
```

| Builder | Dtype |
|---------|--------|
| `f32_row_major` | `f32` (tag 1) |
| `f64_row_major` | `f64` (tag 2) |
| `row_major(dtype, …)` | Any tag in `DATASET_DTYPE_TAG_V1` (`f32` … `u64`, tags 1–10) |

The same three builders exist on [`TetDatasetStreamSpec`](https://docs.rs/tetration/latest/tetration/catalog/struct.TetDatasetStreamSpec.html) when the full tensor should not sit in RAM. Queue it with `push_dataset_streaming`, then `commit_with_fill` supplies one chunk at a time:

```rust
use tetration::catalog::{DATASET_DTYPE_TAG_V1, TetDatasetStreamSpec, TetWriterSession};

let mut session = TetWriterSession::create("output.tet");
session.push_dataset_streaming(TetDatasetStreamSpec::row_major(
    "field",
    DATASET_DTYPE_TAG_V1.f64,
    &[128, 128],
    &[32, 32],
)?)?;
let path = session.commit_with_fill(1, |job, buf| {
    // Fill `buf` with this chunk's raw little-endian bytes.
    let _ = job;
    buf.fill(0);
    Ok(())
})?;
```

## Raw array write (lower level)

For single-dataset files without footer metadata:

```rust
use tetration::catalog::{
    CHUNK_PAYLOAD_CODEC_V1, DATASET_DTYPE_TAG_V1, RawArrayWrite, write_raw_array_file,
};

write_raw_array_file(
    "output.tet",
    &RawArrayWrite {
        name: "data",
        dtype: DATASET_DTYPE_TAG_V1.f32,
        shape: &[100, 200],
        chunk_shape: &[32, 64],
        chunk_codec: CHUNK_PAYLOAD_CODEC_V1.raw,  // or .zstd
        data: &tensor_bytes,
        file_execution: None,
    },
)?;
```

## Codecs

| Codec | Constant | Notes |
|-------|----------|-------|
| Raw | `CHUNK_PAYLOAD_CODEC_V1.raw` | `stored_byte_len == raw_byte_len` |
| Zstd | `CHUNK_PAYLOAD_CODEC_V1.zstd` | Compressed on disk |

## Concurrency

v1 supports **one writer, then many readers**. Finish `commit()` before other processes read the file. There is no on-disk locking or live-append protocol.

## Examples

```bash
cargo run --example session_write
cargo run --example streaming_write
```

For import from HDF5/NetCDF/Zarr, use the `convert` module or the `tet convert` CLI instead of writing raw bytes by hand.
