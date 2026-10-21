# Design rationale

Tetration combines **HDF5-shaped persistence** (many large arrays in one durable file) with **Zarr-shaped chunking** (regular grid, per-chunk compression, parallel I/O) — in a **single mmap-friendly `.tet` file**, not a directory of shard blobs. Multi-writer and cloud use the same sealed-generation model (`.tet.d` packages), not a live mutable tree.

## Design goals

| Goal | How `.tet` / the engine achieves it |
|------|-------------------------------------|
| **Single-file portability** | One file to copy, archive, or attach to object storage |
| **Speed via I/O avoidance** | Chunk index → touch only intersecting payloads; streaming tier-A/B folds (no full tensor); optional zone maps / value postings skip impossible chunks; adaptive fold I/O (parallel chunks, ordered visits, or linear scan) — see [Execution strategies](/guides/query-engine/execution) |
| **Safety by default** | Closed JSON/TOML wire (unknown keys fail); memory budget before dense decode; spill path allowlist; `write: switch` over budget uses ephemeral cache spills (deleted when the query ends); sealed generations never mutate in place |
| **Partial I/O by default** | Local mmap, or range-read a sealed `packed.tet` on a store |
| **Query-friendly metadata** | JSON/TOML control plane; footer carries axis names and attrs |
| **Read-many / write-once (sealed)** | Immutable sealed files or generations; unlimited concurrent readers |
| **Multi-writer** | Immutable shards → single publish → sealed generation — not parallel updates to one live file ([writer protocol v2](https://github.com/Latka-Industries/tetration/blob/main/docs/writer_protocol_v2.md)) |
| **Cloud packages** | Same package protocol on S3-compatible stores: pin, range-read, stage, CAS-publish ([store-backed reads](/rust/store-backed-reads)) |

**Speed** here means doing less work (skip chunks, stream folds, prefer sequential I/O when that is cheaper) — not a promise about absolute seconds on a given machine.

**Safety** means fail closed on the wire and refuse unbounded RAM / arbitrary write paths, while still allowing intentional durable exports (`write: spill` / explicit paths) and sidecar publishes.

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

- [Execution strategies](/guides/query-engine/execution) — memory budget, adaptive fold I/O, spill / transform routing
- [Query engine overview](/guides/query-engine/) — tiers, ops, selections
- [Store-backed reads](/rust/store-backed-reads) — packages on local / memory / S3 stores
- [Format overview](/format/) — packages, generation sidecars, SPEC pointers
- [Writer protocol v2](https://github.com/Latka-Industries/tetration/blob/main/docs/writer_protocol_v2.md) — shards, generations, publish (upstream detail)
- [Query engine (crate)](https://github.com/Latka-Industries/tetration/blob/main/docs/query_engine.md) — upstream implementation tables
