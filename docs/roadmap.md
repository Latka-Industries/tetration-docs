# Roadmap

**Status:** informal / prospective — not a commitment or release schedule.

Tetration already covers efficient **partial I/O** over sealed `.tet` images (local mmap or store range-reads), JSON/TOML queries, streaming reductions, transforms, optional GPU, C ABI, **multi-writer packages** (`.tet.d`: shards → publish → sealed generation), and **S3-compatible package stores** (pin, ingest, CAS publish, convert). What follows is less about missing flags and more about **what kind of system** Tetration should become.

---

## Shipped (reference)

| Area | Notes |
| ---- | ----- |
| Layout v1 | Superblock, catalog, chunk index, raw/zstd — [Format](/format/) |
| Query engine | Reductions, transforms, spill/sidecar, selections — [Query engine](/guides/query-engine/) |
| Convert / export | HDF5, NetCDF, Zarr (local + `s3://`) — [CLI convert & export](/cli/convert-export); Python `tet.convert` / `tet.export` |
| Verify / repair | Quick + deep decode — [CLI verify](/cli/verify-repair) |
| Optional GPU | Experimental device routing for tier-A/B `f32`/`f16` |
| C ABI | `tetration-ffi` — [Rust / FFI](/rust/ffi) |
| Writer protocol v2 (0.2+) | `.tet.d` packages, shard writers, publish, pack; **0.3.6** cleanup (`gc`, `--remove-package`, `--abort`); **0.3.7** publish conflict UX (`--dry-run`, `--replace`, identical-byte overlap) — [CLI packages](/cli/package) |
| Cloud packages (0.3.x) | `PackageStore` / `S3Store`, pin + range-read, stage / CAS publish, cross-host claim, optional block cache, `s3://` convert — [Store-backed reads](/rust/store-backed-reads) |
| Python (tet-py 0.4.3) | NumPy ram/spill/sidecar, package/URI pins, `S3Store` ingest/publish, pinned `s3://` package open, single-file + Zarr-prefix `s3://` convert, `tet.pack`, `tet.publish(dry_run=, replace=)`; query `filter`, `group_by`, and `pipeline` via JSON/TOML. Store prune stays on `tet gc` — [Python](/python/) |
| Zone maps + filter pushdown (0.4.0 / 0.4.1) | **0.4.0:** per-chunk min/max/null at compact/publish (`ZONE.json`). **0.4.1:** closed query `filter` skips impossible chunks (`ReadPlan.zone_filter_skipped_chunks`) — [Query engine](/guides/query-engine/) · [Store-backed reads](/rust/store-backed-reads) |
| Group-by + pipelines (0.4.2) | Closed `group_by` over dimension names (tier-A/B streams a fold per group) and a closed `pipeline` step list lowered onto one document — [Query document](/guides/query-engine/document) |

Near-term polish continues in the [query hardening notes](/guides/query-engine/) and [conversions](https://github.com/Latka-Industries/tetration/blob/main/docs/conversions.md) doc in the crate repo. Version-by-version cloud notes live on [Store-backed reads](/rust/store-backed-reads). **Shipped in 0.4.3:** store prune (`prune_store`, `tet gc s3://bucket/prefix`) drops leftover staging and sealed generations older than `CURRENT` / `CURRENT-1`. Dry-run by default. Open pins and a live publish claim are refused. Does not write `CURRENT`. tet-py **0.4.3** pins that crate with no new Python API. **0.4.4** (crate; PyPI tet-py stays **0.4.3** until that package is cut) applies `filter` to cells inside kept chunks. Chunk skip from **0.4.1** is unchanged. Richer indexes stay **0.4.5**. Own cuts, not store prune.

---

## Prospective directions

### Smarter indexing

**Today:** organization is **geometric** — logical coordinates → chunk coordinates. Footer metadata supports `dim_names`, coordinate labels, and attrs.

**Shipped in 0.4.0:** compact/publish writes per-chunk min/max/null zone maps to `generations/<G>/ZONE.json` and copies them onto `ReadPlan` chunks. Staging writers do not update those stats.

**Shipped in 0.4.1:** closed query `filter` predicates skip chunks whose zone stats cannot match (conservative; missing zones → no skip). `ReadPlan.zone_filter_skipped_chunks` reports those drops. That stat is chunk I/O, not the cell result.

**Shipped in 0.4.2:** `group_by` over dimension names. A tier-A/B reduction streams one fold per group; tier-C still materializes. `execution.group_count` is the product of the group-axis extents.

**Ships in 0.4.4:** the same `filter` drops non-matching cells inside a kept chunk. Folds accumulate matches only. Materialize and transform keep the selection shape: NaN for floats, the dataset fill for integers (refused when no fill is set).

**Direction:** optional richer indexes beyond per-chunk zone maps.

Indexes must stay optional, verifiable, and evolvable without breaking v1 readers. Label *slicing*, zone-map stats, value-filter chunk skip, cell filter, and dimension-name group-by are shipped or specified for **0.4.4**. Grouping by repeated coordinate-label values remains deferred. PyPI tet-py is still **0.4.3**.

### Distributed execution

**Today:** one machine, many cores (Rayon), optional GPUs; scale-out is **N independent queries × N processes**, not one query sharded across nodes.

**Direction:** a coordinator splits a read plan across workers, merges associative partials (tier-A/B folds already compose), and handles spill/export policy cluster-wide.

Open product question: stay a **format + embeddable library** with a thin cluster protocol, or grow a full execution service. Streaming fold + chunk-local partials are the right merge semantics; multi-GPU sharding is a local prototype of the same pattern.

### Richer query language

**Today:** flat JSON/TOML documents — one dataset, selection, optional operation / transform / write. **0.4.2** adds `group_by` and a closed `pipeline` that lowers onto that same document. SQL and arbitrary joins are explicit non-goals for v1.

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
| S3 / store prune (0.4.3) | `prune_store`, `tet gc s3://` | Never delete live pins; do not write `CURRENT` |
| Richer indexes (0.4.5) | Zone maps + chunk skip (0.4.1); cell filter (0.4.4); `group_by` (0.4.2) | Keep wire closed; avoid SQL |
| Distributed query execution | Tier-A/B merge semantics | Product boundary vs “just a format” |
| Windowed stats, controlled joins | Axes + metadata; `group_by` and `pipeline` shipped in 0.4.2 | Avoid full SQL complexity |
| Units, CRS, provenance, uncertainty | Footer history + attrs | Standards alignment (CF, PROV, …) |
| Normative spec + conformance suite | Layout + query wire freeze | Enables third-party implementations |

Themes are **not ordered commitments** — formal spec work can parallel store prune, for example.

---

## How to use this page

- **Users / embedders:** treat prospective items as exploratory; ship against documented layout and query wire only.
- **Contributors:** pick a direction, open a design issue against constraints in [Format](/format/) and non-goals in the getting-started / design docs.
- **Discussion:** [GitHub issue #16](https://github.com/Latka-Industries/tetration/issues/16) (long-term architecture).

When a direction ships, detail moves into Format, CLI, Query engine, or Rust docs, and the shipped table above is updated.
