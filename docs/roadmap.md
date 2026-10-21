# Roadmap

**Status:** informal / prospective — not a commitment or release schedule.

Tetration already covers efficient **partial I/O** over sealed `.tet` images (local mmap or store range-reads), JSON/TOML queries, streaming reductions, transforms, optional GPU, C ABI, **multi-writer packages** (`.tet.d`: shards → publish → sealed generation), and **S3-compatible package stores** (pin, ingest, CAS publish, convert, prune). What follows is less about missing flags and more about **what kind of system** Tetration should become.

Per-release notes: [crate CHANGELOG](https://github.com/Latka-Industries/tetration/blob/main/CHANGELOG.md) · [tet-py CHANGELOG](https://github.com/Latka-Industries/tet-py/blob/main/CHANGELOG.md) · [version alignment](/python/version-alignment).

Current packages: tetration / tet-py **0.6.3**.

---

## Shipped (reference)

| Area | Notes |
| ---- | ----- |
| Layout v1 | Superblock, catalog, chunk index, raw/zstd — [Format](/format/) |
| Query engine | Reductions, transforms, spill/sidecar, selections, closed `filter`, `group_by`, `window`, `pipeline` — [Query engine](/guides/query-engine/) |
| Convert / export | HDF5, NetCDF, Zarr v2/v3, NumPy, CSV/TSV, Parquet → `.tet`; export Zarr v3 / HDF5 / NetCDF (local + `s3://` convert) — [CLI convert & export](/cli/convert-export); Python `tet.convert` / `tet.export` |
| Verify / repair | Quick + deep decode — [CLI verify](/cli/verify-repair) |
| Optional GPU | Experimental device routing for tier-A/B `f32`/`f16` |
| C ABI | `tetration-ffi` — [Rust / FFI](/rust/ffi) |
| Packages | `.tet.d` shards → publish → sealed generation; pack, gc / abort, dry-run / replace — [CLI packages](/cli/package) |
| Cloud packages | `PackageStore` / `S3Store`, pin + range-read, stage / CAS publish, prune — [Store-backed reads](/rust/store-backed-reads) |
| Zone maps + filter | Per-chunk min/max/null; chunk skip then cell filter on kept chunks — [Query document](/guides/query-engine/document#filter) |
| Optional value postings | Exact `eq` chunk allow-list when a low-cardinality dataset qualifies — same filter page |
| Python (tet-py) | NumPy sinks, packages, `s3://` open / convert; query wire via JSON/TOML — [Python](/python/) |
| Distributed fold (library) | Shard a `ReadPlan` across workers, merge tier-A/B partials, in-process harness — Rust `query::distributed`; no RPC cluster |
| Declared semantics | Optional footer attrs + caller policy; `tet semantics set` / `scaffold` — [Semantics](/guides/semantics/) |
| Normative SPEC + conformance | Layout / writer / query / ABI contract + CI pack — crate `SPEC/` + `conformance/` |

---

## Prospective directions

### Smarter indexing

**Today:** geometric organization (logical → chunk coordinates) plus optional zone maps and optional value postings. Closed `filter` skips impossible chunks via zone maps (`zone_filter_skipped_chunks`), may drop more with an exact `eq` posting list (`index_filter_skipped_chunks`), then applies the predicate to cells inside kept chunks. A missing or unusable index falls back to zone maps. `group_by` partitions by dimension name, or by distinct coordinate labels when `"by": "labels"` (0.6.2; requires footer `coords`).

**Direction:** more index kinds (e.g. sorted-axis range, coordinate-label postings), still optional, verifiable, and outside the v1 byte layout so old readers ignore them.

### Distributed execution

**Today (library):** Rust `query::distributed` splits a `ReadPlan` into contiguous or interleaved chunk shards, merges associative tier-A/B fold partials (same laws as parallel / multi-GPU host merge), and proves merge with an in-process harness. Workers must share one **pinned** generation. Spill/sidecar write targets are refused on this path (RAM partials only). Not exposed as a Python cluster API — use the Rust API or JSON worker job shapes.

**Not shipped:** RPC / cluster scheduler, distributed materialize or transform, worker-local spill files.

**Still open:** stay a **format + embeddable library** with a thin protocol (current stance), or grow a full execution service. Multi-GPU sharding remains the local prototype of the same pattern.

### Richer query language

**Today:** flat JSON/TOML documents — one dataset, selection, optional `filter` / `group_by` / `window` / operation / transform / write, or a closed `pipeline` that lowers onto that same document. SQL and arbitrary joins are explicit non-goals for v1. **0.6.0** added windowed stats along a named axis. **0.6.1** ships wire `mode` as **`bins`** (non-overlapping) / **`rolling`** (step 1), plus multi-dataset **`align`** checks (not a join). **0.6.2** adds label-value `group_by` (`by: labels`). **0.6.3** finishes the `window` wire (`pad` / `step` / `align` / `min_count`) and drops the f32-only gate.

**Direction:** richer alignment and grouping on metadata (still not SQL) — without becoming a general SQL engine. Extensions should declare tiers (scalar fold vs materialize) and stay JSON/TOML-serializable for agents and FFI.

### Scientific semantics

**Today (declared + policy):** optional declared science/media attrs in the footer, `tet semantics set` / `scaffold`, and caller policy outside the file. Spec and examples: [Semantics](/guides/semantics/). Climate is attrs / a doc profile id only — not a climate runtime. Declared attrs do not change query answers by themselves.

**Still open:** full CF/PROV suites, UCUM conversion graphs inside `packed.tet`, package `SEMANTICS.json`, plugin host, required in-tree policy interpreter.

**Direction:** richer meaning alongside bytes — convertible display units, geospatial CRS bindings, uncertainty — without becoming a plugin host.

---

## Cross-cutting qualities

Not always “more features.” Three qualities matter long-term:

**Transaction safety** — v1 is write-once / read-many on a single `.tet`. Multi-writer ingest is **shards → publish → sealed generation**, not multi-writer on one live index. See [packages](/cli/package).

**Formal specification** — crate `SPEC/` + `conformance/` pack (layout, writer protocol, query wire, C ABI, compatibility policy). Independent readers can implement without reading Rust. Pack coverage may grow without layout or query ABI breaks.

**Long-term compatibility** — read a file written today decades later: schema evolution, reserved fields, capability flags, and clear policy for query JSON and ABI versioning.

---

## Summary table

| Theme | Depends on | Risk / note |
| ----- | ---------- | ----------- |
| Richer indexes | Zone maps + closed `filter` + `group_by` | Keep wire closed; avoid SQL |
| Distributed query execution | Library path shipped; RPC / spill still open | Product boundary vs “just a format” |
| Windowed stats, controlled joins | Axes + metadata; `group_by` / `pipeline` | Avoid full SQL complexity |
| Units, CRS, provenance, uncertainty | Footer history + attrs | Standards alignment (CF, PROV, …) |
| Normative spec + conformance suite | Shipped (`SPEC/`, `conformance/`) | External readers; pack may grow |

Themes are **not ordered commitments** — formal spec work can parallel indexing work, for example.

---

## How to use this page

- **Users / embedders:** treat prospective items as exploratory; ship against documented layout and query wire only.
- **Contributors:** pick a direction, open a design issue against constraints in [Format](/format/) and non-goals in the getting-started / design docs.
- **Discussion:** [GitHub issue #16](https://github.com/Latka-Industries/tetration/issues/16) (long-term architecture).
