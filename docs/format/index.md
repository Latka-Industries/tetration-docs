# Format specification

Tetration stores chunked tensor data in a single **`.tet`** file with a mmap-friendly layout. The current on-disk format is **layout v1**.

## What a `.tet` file contains

| Region | Purpose |
|--------|---------|
| **Superblock** | Magic, version, dataset count, chunk index pointer |
| **Dataset directory** | Named datasets with dtype, shape, and chunk grid |
| **Chunk index** | Fixed-size rows mapping grid coordinates → payload offsets |
| **Chunk payloads** | Raw or zstd-compressed tensor bytes |
| **History footer** *(optional)* | Provenance events and axis metadata (`dim_names`, `coords`, `attrs`) |

All multi-byte integers are **little-endian**. The file magic is ASCII **`TETR`**.

## Supported wire dtypes

Tags `1`–`10`, row-major within each chunk:

| Tag | Type |
|-----|------|
| 1 | `f32` |
| 2 | `f64` |
| 3 | `i32` |
| 4 | `i64` |
| 5 | `u8` |
| 6 | `u16` |
| 7 | `i16` |
| 8 | `u32` |
| 9 | `f16` |
| 10 | `u64` |

Booleans from HDF5, Zarr, and similar sources import as **`u8`** (0/1).

## Sections in this spec

- [File layout](/format/layout) — byte map from offset 0 through payloads
- [Catalog & datasets](/format/catalog-and-datasets) — naming, shapes, axis metadata
- [Chunks](/format/chunks) — index entries, codecs, mmap access
- [Versioning](/format/versioning) — format version field and compatibility policy
- [Design rationale](/format/design-rationale) — why `.tet` vs directory stores

## Canonical source

The Rust crate in [Latka-Industries/tetration](https://github.com/Latka-Industries/tetration) is the reference implementation. The upstream [`docs/layout_v1.md`](https://github.com/Latka-Industries/tetration/blob/main/docs/layout_v1.md) tracks byte-level details as the format evolves.

::: warning Pre-1.0
Layout v1 and query JSON/TOML may change before the 1.0 release. Check the tetration repo for the latest guarantees.
:::
