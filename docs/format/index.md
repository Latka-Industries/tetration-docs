# Format specification

Tetration stores chunked tensor data in a **layout v1** `.tet` file — one mmap-friendly sealed image with a catalog, fixed-size chunk index, and raw or zstd payloads. Multi-writer and cloud use the **same** sealed bytes inside a `.tet.d` (or store) package: shards → publish → `generations/<G>/packed.tet`.

Current crates: tetration / tet-py **0.7.2**. Normative contract: crate [`SPEC/`](https://github.com/Latka-Industries/tetration/tree/main/SPEC) + [`conformance/`](https://github.com/Latka-Industries/tetration/tree/main/conformance) (pack milestone **0.7.0**).

## What a `.tet` file contains

| Region | Purpose |
|--------|---------|
| **Superblock** | Magic `TETR`, `layout_version = 1`, dataset count, chunk index pointer, optional footer flag |
| **Dataset directory** | Named datasets: dtype tag, shape, chunk grid |
| **Chunk index** (`TIDX`) | Fixed 104-byte rows: grid coords → payload offset / lengths / codec |
| **Chunk payloads** | Tensor bytes — codec **0** raw or **1** zstd |
| **History footer** (`THST`, optional) | Provenance `history` rows + per-dataset `dim_names` / `coords` / `attrs`; **0.7.0** may embed ZONE/INDEX spills (`history_version = 2`) |

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

## Zone maps + secondary indexes

| Location | Since | Role |
|----------|-------|------|
| **Embedded footer spills** | **0.7.0** | Same UTF-8 ZONE/INDEX bytes inside the sealed `.tet` (`history_version = 2`). Convert / writer auto-embed; `tet index` re-embeds. See [Embedded indexes](/format/embedded-indexes). |
| **Generation sidecars** | 0.4.0 / 0.4.5 | Optional `ZONE.json` / `INDEX.json` beside `packed.tet` under `generations/<G>/` (package seal may keep mirrors). Not a `layout_version` bump. |

`INDEX.json` kinds: value postings (`eq`); **0.6.5** `sorted_axis_range`; **0.6.6** `coord_label_postings`. Query prefers **embed → sidecar → missing**. Missing or unverifiable indexes fall back; answers stay correct.

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
- [Embedded indexes](/format/embedded-indexes) — ZONE/INDEX footer spills (0.7.0)
- [Versioning](/format/versioning) — version fields, packages, compatibility
- [Design rationale](/format/design-rationale) — why `.tet` vs directory stores

## Canonical source

The Rust crate in [Latka-Industries/tetration](https://github.com/Latka-Industries/tetration) is the reference implementation. Byte-level tables: upstream [`docs/layout_v1.md`](https://github.com/Latka-Industries/tetration/blob/main/docs/layout_v1.md). Secondary indexes: [`docs/secondary_indexes.md`](https://github.com/Latka-Industries/tetration/blob/main/docs/secondary_indexes.md). Embed: [`docs/embedded_indexes.md`](https://github.com/Latka-Industries/tetration/blob/main/docs/embedded_indexes.md).

::: warning Pre-1.0
Layout v1 and query JSON/TOML may change before the 1.0 release. Pin crate / CLI / tet-py versions in production. Prefer the SPEC + conformance pack over informal docs when implementing a third-party reader.
:::
