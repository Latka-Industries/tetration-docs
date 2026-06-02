# Chunks

The chunk index maps logical grid coordinates to on-disk payload bytes. This is what makes partial I/O and mmap reads efficient.

## Chunk index header (32 bytes)

Starts at `chunk_index_offset` (= `align8(40 + dataset_blob_len)`).

| Offset | Size | Field | Notes |
|--------|------|-------|-------|
| 0 | 4 | magic | ASCII **`TIDX`** |
| 4 | 4 | `index_version` | Must be **1** |
| 8 | 8 | `entry_count` | Number of fixed-size entries |
| 16 | 2 | `memory_budget_percent_bps` | Basis points (10000 = 100%); **0** = engine default (25%) |
| 18 | 2 | reserved | Write **0** |
| 20 | 4 | `memory_budget_bytes` | Fixed RAM cap; **0** = use percent of host RAM |
| 24 | 8 | reserved | Write **0** |

Total index length: `32 + entry_count × 104`.

## Chunk index entry (104 bytes)

| Field | Type | Notes |
|-------|------|-------|
| `dataset_id` | `u64` | Index into dataset directory |
| `chunk_index[8]` | eight `u64` | Grid coordinates `i0 … i7`; unused slots are **0** |
| `payload_offset` | `u64` | File offset to stored bytes |
| `raw_byte_len` | `u64` | Logical uncompressed size |
| `stored_byte_len` | `u64` | Bytes on disk at `payload_offset` |
| `codec` | `u32` | **0** = raw, **1** = zstd |
| `reserved` | `u32` | **0** |

Payload bytes must satisfy: `payload_offset + stored_byte_len ≤ file_len`.

## Codecs

| Codec | `stored_byte_len` vs `raw_byte_len` | On-disk bytes |
|-------|--------------------------------------|---------------|
| **0** raw | must be equal | tensor payload (LE bytes for dataset dtype) |
| **1** zstd | `stored` = compressed, `raw` = decoded size | zstd frame |

## Mmap-friendly access

The query engine resolves a logical selection to chunk coordinates, then mmap's only the intersecting payload spans:

```
dataset name → dataset_id → chunk coords → index row → mmap payload
```

For a **full dense** selection over raw (`codec = 0`) payloads, the engine may treat contiguous payloads as one logical byte stream when:

1. Each chunk's `payload_offset + raw_byte_len` equals the next chunk's `payload_offset` (in read-plan order)
2. The sum of `raw_byte_len` equals the logical selection size

Reference writers append payloads sequentially, so converted multi-chunk grids typically satisfy this for full-file scans.

## Inspecting chunks

```bash
tet info file.tet --chunks           # index table (default 32 rows)
tet info file.tet --chunks -n 0      # all rows
tet info file.tet --all              # layout + datasets + chunks + history
```

See [Mmap read patterns](/guides/mmap-patterns) for Rust and Python examples.
