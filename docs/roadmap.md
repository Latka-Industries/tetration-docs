# Roadmap

**Status:** informal / prospective — not a commitment or release schedule.

Tetration already covers efficient **partial I/O** over a local mmap-friendly `.tet` file (chunk index, JSON/TOML queries, streaming reductions, transforms, optional GPU, C ABI) and **multi-writer packages** (`.tet.d`: shards → publish → sealed generation). What follows is less about missing flags and more about **what kind of system** Tetration should become.

---

## Shipped (reference)

| Area | Notes |
| ---- | ----- |
| Layout v1 | Superblock, catalog, chunk index, raw/zstd — [Format](/format/) |
| Query engine | Reductions, transforms, spill/sidecar, selections — [Query engine](/guides/query-engine/) |
| Convert / export | HDF5, NetCDF, Zarr — [CLI convert & export](/cli/convert-export); Python `tet.convert` / `tet.export` |
| Verify / repair | Quick + deep decode — [CLI verify](/cli/verify-repair) |
| Optional GPU | Experimental device routing for tier-A/B `f32`/`f16` |
| C ABI | `tetration-ffi` — [Rust / FFI](/rust/ffi) |
| Writer protocol v2 (0.2) | `.tet.d` packages, shard writers, publish, pack — [CLI packages](/cli/package) |
| Python (tet-py 0.2) | NumPy ram/spill/sidecar, zero-copy memmap for single-chunk raw — [Python](/python/) |

Near-term polish continues in the [query hardening notes](/guides/query-engine/) and [conversions](https://github.com/Latka-Industries/tetration/blob/main/docs/conversions.md) doc in the crate repo.

---

## Prospective directions

### Cloud-native reads

**Today:** queries assume a **local** `.tet` path; the engine mmaps a sealed byte image.

**Direction:** object stores (S3, GCS, Azure Blob) as first-class targets — URI-shaped opens and range reads aligned to chunk boundaries, without downloading whole files.

**Why it is hard:** object stores are not POSIX. Latency, caching, and consistency differ from mmap. Needs a planner that minimizes round trips (index + footer first, then payload ranges) and clear semantics when the object is replaced mid-read.

Chunk index + fixed payload offsets are a good foundation; the gap is transport and cache policy.

### Smarter indexing

**Today:** organization is **geometric** — logical coordinates → chunk coordinates. Footer metadata supports `dim_names`, coordinate labels, and attrs, but there is no secondary index for value predicates.

**Direction:** optional metadata indexes so predicates such as `temperature > 100` or `region = Arizona` can skip most chunks (zone maps / statistics style).

Indexes must stay optional, verifiable, and evolvable without breaking v1 readers. Label *slicing* is already shipped; value filters and group-by remain deferred.

### Distributed execution

**Today:** one machine, many cores (Rayon), optional GPUs; scale-out is **N independent queries × N processes**, not one query sharded across nodes.

**Direction:** a coordinator splits a read plan across workers, merges associative partials (tier-A/B folds already compose), and handles spill/export policy cluster-wide.

Open product question: stay a **format + embeddable library** with a thin cluster protocol, or grow a full execution service. Streaming fold + chunk-local partials are the right merge semantics; multi-GPU sharding is a local prototype of the same pattern.

### Richer query language

**Today:** flat JSON/TOML documents — one dataset, selection, optional operation / transform / write. SQL and arbitrary joins are explicit non-goals for v1.

**Direction:** richer declarative ops while keeping chunk-based execution — group-by over named dimensions, windowed stats, multi-dataset alignment, composable pipelines — without becoming a general SQL engine. Extensions should declare tiers (scalar fold vs materialize) and stay JSON/TOML-serializable for agents and FFI.

### Scientific semantics

**Today:** users think in chunk coordinates and axis indices; footer metadata carries labels and attrs but not full domain semantics.

**Direction:** first-class **meaning** alongside bytes — units, CRS, provenance, uncertainty, domain vocabularies — with invariants in footer history + dataset attrs. Many scientific workflows fail on metadata and lineage, not raw throughput.

---

## Cross-cutting qualities

Not always “more features.” Three qualities matter long-term:

**Transaction safety** — v1 is write-once / read-many on a single `.tet`. Multi-writer ingest is **shards → publish → sealed generation**, not multi-writer on one live index. See [packages](/cli/package).

**Formal specification** — complete binary layout, compatibility rules, stated invariants, and a shared conformance suite so independent readers (Julia, Go, WASM) can exist without reading Rust.

**Long-term compatibility** — read a file written today decades later: schema evolution, reserved fields, capability flags, and clear policy for query JSON and ABI versioning.

---

## Summary table

| Theme | Depends on | Risk / note |
| ----- | ---------- | ----------- |
| Object-store / cloud-native reads | Stable layout v1 | Cache + consistency semantics |
| Predicate indexes / chunk skipping | Metadata + planner | Index maintenance on write; verify story |
| Distributed query execution | Tier-A/B merge semantics | Product boundary vs “just a format” |
| Group-by, pipelines, controlled joins | Axes + metadata | Avoid full SQL complexity |
| Units, CRS, provenance, uncertainty | Footer history + attrs | Standards alignment (CF, PROV, …) |
| Normative spec + conformance suite | Layout + query wire freeze | Enables third-party implementations |

Themes are **not ordered commitments** — formal spec work can parallel cloud reads, for example.

---

## How to use this page

- **Users / embedders:** treat prospective items as exploratory; ship against documented layout and query wire only.
- **Contributors:** pick a direction, open a design issue against constraints in [Format](/format/) and non-goals in the getting-started / design docs.
- **Discussion:** [GitHub issue #16](https://github.com/Latka-Industries/tetration/issues/16) (long-term architecture).

When a direction ships, detail moves into Format, CLI, Query engine, or Rust docs, and the shipped table above is updated.
