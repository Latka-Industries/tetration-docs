# Design rationale

Tetration combines **HDF5-shaped persistence** (many large arrays in one durable file) with **Zarr-shaped chunking** (regular grid, per-chunk compression, parallel I/O) — in a **single mmap-friendly `.tet` file**, not a directory of shard blobs. Multi-writer and cloud use the same sealed-generation model (`.tet.d` packages), not a live mutable tree.

## Design goals

| Goal | How `.tet` achieves it |
|------|------------------------|
| **Single-file portability** | One file to copy, archive, or attach to object storage |
| **Partial I/O by default** | Chunk index → touch only intersecting payloads (local mmap, or range-read a sealed `packed.tet` on a store) |
| **Query-friendly metadata** | JSON/TOML control plane; footer carries axis names and attrs |
| **Read-many / write-once (sealed)** | Immutable sealed files or generations; unlimited concurrent readers |
| **Multi-writer (0.2+)** | Immutable shards → single publish → sealed generation — not parallel updates to one live file ([writer protocol v2](https://github.com/Latka-Industries/tetration/blob/main/docs/writer_protocol_v2.md)) |
| **Cloud packages (0.3+)** | Same package protocol on S3-compatible stores: pin, range-read, stage, CAS-publish ([store-backed reads](/rust/store-backed-reads)) |

## When to use `.tet`

Good fits:

- Large multi-dimensional arrays that benefit from chunk-level access
- Workflows that need a single portable artifact (not a Zarr directory tree)
- JSON/TOML queries for aggregates, transforms, and QC counts without loading full tensors
- Cloud **sealed packages** on S3-compatible stores: pin a generation, range-read `packed.tet`, stage parts and CAS-publish `CURRENT` ([store-backed reads](/rust/store-backed-reads))

Less ideal:

- Tabular analytics with heavy columnar filtering → consider **Parquet**
- Many concurrent writers appending chunks to a **live** cloud prefix → prefer **Zarr** (Tetration multi-writer is shards → publish → sealed generation, not mutable directory writes; see [writer protocol v2](https://github.com/Latka-Industries/tetration/blob/main/docs/writer_protocol_v2.md))
- Simple single-array interchange → **NPY** may suffice
- SQL-on-files or ad-hoc relational queries → not a v1 goal

See the full [Format comparison](/guides/format-comparison) guide.

## Control plane vs storage

**JSON/TOML is the control plane**, not the storage encoding. Hosts validate input, cap size, and enforce spill path policy. The on-disk format is a fixed binary layout optimized for mmap (and for range-reading the same sealed bytes from a store).

Query documents are **flat** — e.g. `"mean": []` / `mean = []`. Nested `"operation"` objects are rejected.

## Non-goals (v1)

- SQL-on-files
- Arbitrary codec plugins in the file format
- GPU codecs in the on-disk layout (optional GPU is a query-time execution concern)
- Multiple concurrent writers on **one live** `.tet` / TIDX (still forbidden; use writer protocol v2 for multi-writer)
- Mutating a sealed generation in place (publish is always a new generation)

## Further reading

- [tetration README — Design stance](https://github.com/Latka-Industries/tetration#design-stance-short)
- [Query engine docs](https://github.com/Latka-Industries/tetration/blob/main/docs/query_engine.md) in the tetration repo
- [Writer protocol v2 (draft RFC)](https://github.com/Latka-Industries/tetration/blob/main/docs/writer_protocol_v2.md) — shards, generations, publish
- [Store-backed reads](/rust/store-backed-reads) — packages on local / memory / S3 stores
