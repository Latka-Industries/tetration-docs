# Design rationale

Tetration combines **HDF5-shaped persistence** (many large arrays in one durable file) with **Zarr-shaped chunking** (regular grid, per-chunk compression, parallel I/O) — in a **single mmap-friendly `.tet` file**, not a directory of shard blobs.

## Design goals

| Goal | How `.tet` achieves it |
|------|------------------------|
| **Single-file portability** | One file to copy, archive, or attach to object storage |
| **Partial I/O by default** | Chunk index → mmap only intersecting payloads |
| **Query-friendly metadata** | JSON/TOML control plane; footer carries axis names and attrs |
| **Read-many / write-once (sealed)** | Immutable sealed files or generations; unlimited concurrent readers |
| **Multi-writer (0.2+)** | Immutable shards → single publish → sealed generation — not parallel updates to one live file ([writer protocol v2](https://github.com/Latka-Industries/tetration/blob/main/docs/writer_protocol_v2.md)) |

## When to use `.tet`

Good fits:

- Large multi-dimensional arrays that benefit from chunk-level access
- Workflows that need a single portable artifact (not a Zarr directory tree)
- JSON/TOML queries for aggregates, transforms, and QC counts without loading full tensors

Less ideal:

- Tabular analytics with heavy columnar filtering → consider **Parquet**
- Full cloud object-store I/O → **0.3.1** ships `S3Store` ingest / CAS publish (embedder + tet-py); **0.3.2** adds an exclusive cross-host claim on `publishing/<G>`; **0.3.3** adds an optional download cache and single-file `s3://` convert; **0.3.4** opens a pinned `s3://` package (`tet query -t`, `tet.open`); **0.3.5** converts a Zarr prefix on `s3://` one chunk at a time; **0.3.6** ships local package cleanup (`pack --remove-package`, `gc`, `publish --abort`); **0.3.7** ships publish conflict UX (`--dry-run`, `--replace`, identical-byte overlap OK). Native cloud directory *writes* still favor **Zarr** (local multi-writer is shards + publish; see [writer protocol v2](https://github.com/Latka-Industries/tetration/blob/main/docs/writer_protocol_v2.md) and [store-backed reads](/rust/store-backed-reads))
- Simple single-array interchange → **NPY** may suffice
- SQL-on-files or ad-hoc relational queries → not a v1 goal

See the full [Format comparison](/guides/format-comparison) guide.

## Control plane vs storage

**JSON/TOML is the control plane**, not the storage encoding. Hosts validate input, cap size, and enforce spill path policy. The on-disk format is a fixed binary layout optimized for mmap.

Query documents are **flat** — e.g. `"mean": []` / `mean = []`. Nested `"operation"` objects are rejected.

## Non-goals (v1)

- SQL-on-files
- Arbitrary codec plugins in the file format
- GPU codecs in the on-disk layout (optional GPU is a query-time execution concern)
- Multiple concurrent writers on **one live** `.tet` / TIDX (still forbidden; use writer protocol v2 for multi-writer)

## Further reading

- [tetration README — Design stance](https://github.com/Latka-Industries/tetration#design-stance-short)
- [Query engine docs](https://github.com/Latka-Industries/tetration/blob/main/docs/query_engine.md) in the tetration repo
- [Writer protocol v2 (draft RFC)](https://github.com/Latka-Industries/tetration/blob/main/docs/writer_protocol_v2.md) — shards, generations, publish
