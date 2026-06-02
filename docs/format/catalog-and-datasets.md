# Catalog & datasets

When `dataset_count > 0`, bytes starting at offset **32** contain the dataset directory.

## Directory header

| Offset | Size | Field |
|--------|------|-------|
| 32 | 8 | `dataset_blob_len` — length of concatenated dataset records |
| 40 | * | `dataset_records` — exactly `dataset_count` records in order |

## Dataset record

Each record is variable length:

| Field | Type | Notes |
|-------|------|-------|
| `name_len` | `u32` LE | Byte length of UTF-8 name |
| `dtype` | `u32` LE | Wire tag 1–10 (see [Overview](/format/)) |
| `ndim` | `u32` LE | Rank in `1 … 8` |
| `reserved` | `u32` LE | Write **0** |
| `name` | `[u8]` | UTF-8 of length `name_len` |
| _padding_ | 0–7 B | Zero bytes so record length to `shape[0]` is 8-aligned |
| `shape` | `ndim × u64` LE | Global array shape |
| `chunk_shape` | `ndim × u64` LE | Chunk size along each axis (must tile `shape`) |

Records are concatenated in catalog order. The **`dataset_id`** in the chunk index is the **0-based index** into this list.

## Axis metadata

v1 dataset records carry **`shape`** and **`chunk_shape`** only. Richer metadata lives in the optional **`THST` footer** under `metadata.datasets[<name>]`:

```json
{
  "datasets": {
    "temperature": {
      "dim_names": ["time", "station"],
      "coords": {
        "time": { "labels": ["2024-01-01", "2024-01-02"] },
        "station": { "labels": ["A", "B"] }
      },
      "attrs": { "units": "K", "long_name": "surface temperature" }
    }
  }
}
```

### Dimension names vs coordinate labels

| Layer | What it names | Count | Example |
|-------|---------------|-------|---------|
| **Dimension names** | Each axis | `ndim` strings | `time`, `lat`, `lon` |
| **Coordinate labels** | Each position along one axis | `shape[d]` values | timestamps, station codes |

- **Dimension name** — enables `"mean": "time"` in query JSON/TOML instead of `"mean": 0`
- **Coordinate label** — enables slice/filter by value (`start_label` / `stop_label` in selections)

Analogues: NetCDF dimension name vs coordinate variable; pandas `Index.name` vs `Index` values; xarray `dims` vs `coords`.

## Inspecting the catalog

```bash
tet info file.tet                  # dataset table (default)
tet info file.tet --metadata       # footer dim_names / coord previews
tet info file.tet --json           # full dump
```

In Rust, use [`read_tet_summary_v1`](https://docs.rs/tetration/latest/tetration/catalog/fn.read_tet_summary_v1.html) on a mmap'd byte slice. See [Open & inspect](/rust/open-and-inspect).
