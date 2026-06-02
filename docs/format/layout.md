# File layout

A v1 `.tet` file is a fixed **32-byte superblock** at offset 0, followed (when `dataset_count > 0`) by a dataset directory blob, an **8-byte-aligned** chunk index, and chunk payloads.

## Regions at a glance

| # | Region | Starts at | Size | When present |
|---|--------|-----------|------|--------------|
| 1 | **Superblock** | `0` | 32 B | always |
| 2 | **Dataset directory** | `32` | `8 + dataset_blob_len` | `dataset_count > 0` |
| 3 | **Padding** | `40 + dataset_blob_len` | 0–7 B | bytes needed for 8-byte alignment |
| 4 | **Chunk index** | `chunk_index_offset` | `32 + entry_count × 104` | `dataset_count > 0` |
| 5 | **Chunk payloads** | per index row | per `stored_byte_len` | one span per index row |

**Empty file** (`dataset_count = 0`): regions 2–5 are absent; `chunk_index_offset = 32`, `chunk_index_length = 0`; the file may end at byte 32.

**Populated file**: the reference writer packs payloads after the index, but v1 only requires `payload_offset + stored_byte_len ≤ file_len` for every row.

## Superblock (32 bytes)

| Offset | Size | Field | Notes |
|--------|------|-------|-------|
| 0 | 4 | `magic` | Must be `TETR` |
| 4 | 4 | `layout_version` | Must be `1` |
| 8 | 4 | `dataset_count` | Number of dataset records; **0** = no directory |
| 12 | 4 | `flags` | Bit **1**: optional history footer at EOF |
| 16 | 8 | `chunk_index_offset` | Byte offset to chunk index |
| 24 | 8 | `chunk_index_length` | Length of chunk index region |

Readers must ensure `chunk_index_offset + chunk_index_length` fits within the file.

## Alignment

`align8(n) = (n + 7) & !7` — round up to an 8-byte boundary. The chunk index base offset must equal `align8(40 + dataset_blob_len)` when datasets are present.

## Optional history footer

When superblock **`flags & 1`**, the file ends with a self-describing footer after all chunk payloads:

| Region (at EOF) | Notes |
|-----------------|-------|
| `history_json` | UTF-8 JSON: `{"history":[…], "metadata":{…}}` |
| `metadata_spill` | Optional spill for large metadata (> 64 KiB inline budget) |
| `history_json_len` | `u64` LE |
| `history_version` | `u32` LE; must be **1** |
| magic | ASCII **`THST`** |

The footer carries convert provenance (`history` rows) and per-dataset axis metadata (`dim_names`, `coords`, `attrs`). See [Catalog & datasets](/format/catalog-and-datasets).

## How regions connect

```
┌─────────────┐
│ Superblock  │  magic, version, index pointer
├─────────────┤
│  Datasets   │  name, dtype, shape, chunk_shape
├─────────────┤
│ Chunk index │  TIDX header + fixed 104 B rows
├─────────────┤
│  Payloads   │  raw or zstd tensor bytes
├─────────────┤
│ THST footer │  optional history + metadata
└─────────────┘
```

Each index row's `payload_offset` selects a byte span in the payload region. Dataset metadata supplies `shape`, `chunk_shape`, and `dtype` for interpreting those bytes.

## File health

Use **`tet verify`** to check superblock, catalog, index, payload bounds, and footer integrity. See [tet verify & repair](/cli/verify-repair).
