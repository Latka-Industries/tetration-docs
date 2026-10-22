# Design rationale

A `.tet` is one sealed file you can inspect and query without loading the whole tensor into memory. Chunks and indexes make partial I/O the default; JSON/TOML queries run aggregates and transforms under a memory budget.

Shape-wise: **HDF5-like** persistence (many arrays in one durable file) plus **Zarr-like** chunking (regular grid, per-chunk compression), as a single mmap-friendly file rather than a directory of blobs. Zarr stores chunks; it does not ship this sealed query path. Multi-writer and cloud use sealed generations (`.tet.d` packages), not a live mutable tree.

## Design goals

| Goal | How `.tet` / the engine achieves it |
|------|-------------------------------------|
| **Single-file portability** | One file to copy, archive, or attach to object storage |
| **Inspect before load** | Footer metadata (`tet info` / bindings): datasets, shapes, dtypes, attrs, without decoding payloads |
| **Speed via I/O avoidance** | Chunk index → touch only intersecting payloads; streaming tier-A/B folds (no full tensor); optional zone maps / value postings skip impossible chunks; adaptive fold I/O (parallel chunks, ordered visits, or linear scan). See [Execution strategies](/query/execution) |
| **Bounded memory** | Memory budget before dense decode; spill path allowlist; `write: switch` over budget uses ephemeral cache spills (deleted when the query ends) |
| **Safety by default** | Closed JSON/TOML wire (unknown keys fail); sealed generations never mutate in place |
| **Partial I/O by default** | Local mmap, or range-read a sealed `packed.tet` on a store |
| **Read-many / write-once (sealed)** | Immutable sealed files or generations; unlimited concurrent readers |
| **Multi-writer** | Immutable shards → single publish → sealed generation, not parallel updates to one live file ([writer protocol v2](https://github.com/Latka-Industries/tetration/blob/main/docs/writer_protocol_v2.md)) |
| **Cloud packages** | Same package protocol on S3-compatible stores: pin, range-read, stage, CAS-publish ([store-backed reads](/rust/store-backed-reads)) |

When to pick `.tet` vs Parquet / Zarr / NPY: [Format comparison](/guides/format-comparison).

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

- [Execution strategies](/query/execution): memory budget, adaptive fold I/O, spill / transform routing
- [Query engine overview](/query/): tiers, ops, selections
- [Store-backed reads](/rust/store-backed-reads): packages on local / memory / S3 stores
- [Format overview](/format/): packages, generation sidecars, SPEC pointers
- [Writer protocol v2](https://github.com/Latka-Industries/tetration/blob/main/docs/writer_protocol_v2.md): shards, generations, publish (upstream detail)
- [Query engine (crate)](https://github.com/Latka-Industries/tetration/blob/main/docs/query_engine.md): upstream implementation tables
