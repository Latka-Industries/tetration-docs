# Roadmap

**Status:** informal / prospective — not a commitment or release schedule.

Tetration already covers efficient **partial I/O** over sealed `.tet` images (local mmap or store range-reads), JSON/TOML queries, streaming reductions, transforms, optional GPU, C ABI, **multi-writer packages** (`.tet.d`: shards → publish → sealed generation), and **S3-compatible package stores** (pin, ingest, CAS publish, convert, prune). What follows is less about missing flags and more about **what kind of system** Tetration should become.

Per-release notes: [crate CHANGELOG](https://github.com/Latka-Industries/tetration/blob/main/CHANGELOG.md) · [tet-py CHANGELOG](https://github.com/Latka-Industries/tet-py/blob/main/CHANGELOG.md) · [version alignment](/python/version-alignment).

---

## Shipped (reference)

| Area | Notes |
| ---- | ----- |
| Layout v1 | Superblock, catalog, chunk index, raw/zstd — [Format](/format/) |
| Query engine | Reductions, transforms, spill/sidecar, selections, closed `filter`, `group_by`, `pipeline` — [Query engine](/guides/query-engine/) |
| Convert / export | HDF5, NetCDF, Zarr (local + `s3://`) — [CLI convert & export](/cli/convert-export); Python `tet.convert` / `tet.export` |
| Verify / repair | Quick + deep decode — [CLI verify](/cli/verify-repair) |
| Optional GPU | Experimental device routing for tier-A/B `f32`/`f16` |
| C ABI | `tetration-ffi` — [Rust / FFI](/rust/ffi) |
| Packages | `.tet.d` shards → publish → sealed generation; pack, gc / abort, dry-run / replace — [CLI packages](/cli/package) |
| Cloud packages | `PackageStore` / `S3Store`, pin + range-read, stage / CAS publish, prune — [Store-backed reads](/rust/store-backed-reads) |
| Zone maps + filter | Per-chunk min/max/null; chunk skip then cell filter on kept chunks — [Query document](/guides/query-engine/document#filter) |
| Python (tet-py) | NumPy sinks, packages, `s3://` open / convert; query wire via JSON/TOML — [Python](/python/) |

Current packages: tetration / tet-py **0.4.4**. Next prospective cut after that: richer indexes (**0.4.5**).

---

## Prospective directions

### Smarter indexing

**Today:** geometric organization (logical → chunk coordinates) plus optional zone maps. Closed `filter` skips impossible chunks, then drops non-matching cells inside kept chunks. `group_by` partitions by dimension name. Grouping by repeated coordinate-label values remains deferred.

**Direction:** optional richer indexes beyond per-chunk zone maps (e.g. sorted coord lookup), still optional, verifiable, and evolvable without breaking v1 readers.

### Distributed execution

**Today:** one machine, many cores (Rayon), optional GPUs; scale-out is **N independent queries × N processes**, not one query sharded across nodes.

**Direction:** a coordinator splits a read plan across workers, merges associative partials (tier-A/B folds already compose), and handles spill/export policy cluster-wide.

Open product question: stay a **format + embeddable library** with a thin cluster protocol, or grow a full execution service. Streaming fold + chunk-local partials are the right merge semantics; multi-GPU sharding is a local prototype of the same pattern.

### Richer query language

**Today:** flat JSON/TOML documents — one dataset, selection, optional `filter` / `group_by` / operation / transform / write, or a closed `pipeline` that lowers onto that same document. SQL and arbitrary joins are explicit non-goals for v1.

**Direction:** richer declarative ops while keeping chunk-based execution — windowed stats and multi-dataset alignment — without becoming a general SQL engine. Extensions should declare tiers (scalar fold vs materialize) and stay JSON/TOML-serializable for agents and FFI.

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
| Richer indexes | Zone maps + closed `filter` + `group_by` | Keep wire closed; avoid SQL |
| Distributed query execution | Tier-A/B merge semantics | Product boundary vs “just a format” |
| Windowed stats, controlled joins | Axes + metadata; `group_by` / `pipeline` | Avoid full SQL complexity |
| Units, CRS, provenance, uncertainty | Footer history + attrs | Standards alignment (CF, PROV, …) |
| Normative spec + conformance suite | Layout + query wire freeze | Enables third-party implementations |

Themes are **not ordered commitments** — formal spec work can parallel indexing work, for example.

---

## How to use this page

- **Users / embedders:** treat prospective items as exploratory; ship against documented layout and query wire only.
- **Contributors:** pick a direction, open a design issue against constraints in [Format](/format/) and non-goals in the getting-started / design docs.
- **Discussion:** [GitHub issue #16](https://github.com/Latka-Industries/tetration/issues/16) (long-term architecture).
