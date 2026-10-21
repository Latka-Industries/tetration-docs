# Format specification

Tetration stores chunked tensor data in a **layout v1** `.tet` file — one mmap-friendly sealed image with a catalog, fixed-size chunk index, and raw or zstd payloads. Multi-writer and cloud use the **same** sealed bytes inside a `.tet.d` (or store) package: shards → publish → `generations/<G>/packed.tet`.

Current crates: tetration / tet-py **0.6.4**. Normative contract: crate [`SPEC/`](https://github.com/Latka-Industries/tetration/tree/main/SPEC) + [`conformance/`](https://github.com/Latka-Industries/tetration/tree/main/conformance) (pack milestone **0.6.3**).

## What a `.tet` file contains

| Region | Purpose |
|--------|---------|
| **Superblock** | Magic `TETR`, `layout_version = 1`, dataset count, chunk index pointer, optional footer flag |
| **Dataset directory** | Named datasets: dtype tag, shape, chunk grid |
| **Chunk index** (`TIDX`) | Fixed 104-byte rows: grid coords → payload offset / lengths / codec |
| **Chunk payloads** | Tensor bytes — codec **0** raw or **1** zstd |
| **History footer** (`THST`, optional) | Provenance `history` rows + per-dataset `dim_names` / `coords` / `attrs` |

All multi-byte integers are **little-endian**.

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

## Packages vs a standalone `.tet`

| Artifact | Role |
|----------|------|
| **Standalone `.tet`** | One sealed layout-v1 image (convert output, pack output, or a single-writer session) |
| **`.tet.d` package** | Directory (or store prefix): staging parts → publish → `generations/<G>/packed.tet` + `CURRENT` |
| **`packed.tet`** | The sealed layout-v1 file readers open for generation `G` — same byte contract as a standalone `.tet` |

Readers **pin** a generation at open. Advancing `CURRENT` does not retarget an already-open handle. Detail: [CLI packages](/cli/package), [store-backed reads](/rust/store-backed-reads), upstream [writer protocol v2](https://github.com/Latka-Industries/tetration/blob/main/docs/writer_protocol_v2.md) (shipped with 0.2+).

## Generation sidecars (not inside the file)

Optional blobs live **beside** `packed.tet` under `generations/<G>/`. They are not superblock fields and do **not** bump `layout_version`:

| Sidecar | Since | Role |
|---------|-------|------|
| **`ZONE.json`** | 0.4.0 | Per-chunk min / max / null zone maps for `filter` chunk skip |
| **`INDEX.json`** | 0.4.5 | Optional value postings for exact `eq` on low-cardinality datasets |

A reader that only opens `packed.tet` (including older minors) still works. Missing or unverifiable indexes fall back to zone maps or a full scan. Manifest keys unknown to old readers are ignored.

## Interchange (into / out of `.tet`)

Convert and export are not regions of the layout; they produce or consume sealed images:

| Direction | Formats |
|-----------|---------|
| **Import** (`tet convert`) | HDF5, NetCDF, Zarr v2/v3, NumPy, CSV/TSV, Parquet; local paths or `s3://` (single object or Zarr prefix) |
| **Export** (`tet export`) | Zarr v3 directory, HDF5, NetCDF |

See [tet convert & export](/cli/convert-export). Declared science/media attrs in the footer: [Semantics](/guides/semantics/).

## Sections in this spec

- [File layout](/format/layout) — byte map from offset 0 through payloads
- [Catalog & datasets](/format/catalog-and-datasets) — naming, shapes, axis metadata
- [Chunks](/format/chunks) — index entries, codecs, mmap access
- [Versioning](/format/versioning) — version fields, packages, compatibility
- [Design rationale](/format/design-rationale) — why `.tet` vs directory stores

## Canonical source

The Rust crate in [Latka-Industries/tetration](https://github.com/Latka-Industries/tetration) is the reference implementation. Byte-level tables: upstream [`docs/layout_v1.md`](https://github.com/Latka-Industries/tetration/blob/main/docs/layout_v1.md). Secondary indexes: [`docs/secondary_indexes.md`](https://github.com/Latka-Industries/tetration/blob/main/docs/secondary_indexes.md).

::: warning Pre-1.0
Layout v1 and query JSON/TOML may change before the 1.0 release. Pin crate / CLI / tet-py versions in production. Prefer the SPEC + conformance pack over informal docs when implementing a third-party reader.
:::
