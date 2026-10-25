# Roadmap

**Status:** informal / prospective — not a commitment or release schedule.

Per-release notes: [crate CHANGELOG](https://github.com/Latka-Industries/tetration/blob/main/CHANGELOG.md) · [tet-py CHANGELOG](https://github.com/Latka-Industries/tet-py/blob/main/CHANGELOG.md) · [version alignment](/python/version-alignment).

Current packages: tetration / tet-py **0.8.3**.

---

## Shipped (reference)

| Area | Notes |
| ---- | ----- |
| Layout v1 | Superblock, catalog, chunk index, raw/zstd — [Format](/format/) |
| Query engine | Reductions, transforms, spill/sidecar, selections, `filter`, `group_by`, `window`, `pipeline` — [Query engine](/query/) |
| Convert / export | HDF5, NetCDF, Zarr v2/v3, NumPy, CSV/TSV, Parquet → `.tet`; export Zarr v3 / HDF5 / NetCDF — [CLI convert & export](/cli/convert-export) |
| Verify / repair | Quick + deep decode — [CLI verify](/cli/verify-repair) |
| Optional GPU | Experimental device routing for tier-A/B `f32`/`f16` |
| C ABI | `tetration-ffi` — [Rust / FFI](/rust/ffi) |
| Packages | `.tet.d` shards → publish → sealed generation — [CLI packages](/cli/package) |
| Cloud packages | `PackageStore` / `S3Store`, pin + range-read, CAS publish — [Store-backed reads](/rust/store-backed-reads) |
| Indexes | Zone maps, value postings, embedded ZONE/INDEX (`history_version = 2`) — [Embedded indexes](/format/embedded-indexes) |
| Python (tet-py) | NumPy sinks, packages, `s3://` — [Python](/python/) |
| Job files | `tet run` / `tet.run_job` — [Job files](/guides/job-files) |
| Trust boundaries | Verify-first / host-owned paths / spill allowlist — [Trust boundaries](/guides/trust-boundaries) |
| Distributed query | Thin protocol + localhost N-process harness (`tet worker`); dense materialize / transform; spill still refuse-only |
| Declared semantics | Footer attrs + wizard / one-file TOML apply; profile contracts / lint / `SEMANTICS.json` (+ `dim_names`) — [Semantics](/guides/semantics/) |
| SPEC + conformance | Crate `SPEC/` + `conformance/` |

---

## Prospective

Exploratory only — discuss on [issue #16](https://github.com/Latka-Industries/tetration/issues/16).

| Direction | Notes |
| --------- | ----- |
| Richer indexes | More optional index kinds; sidecars may demote once embed verify is primary |
| Distributed execution | Boundary + localhost harness + materialize / transform / tier-C shipped; network RPC / cluster / distributed spill still open |
| Query language | Window/align/label grouping shipped; richer metadata alignment without becoming SQL |
| Scientific semantics | Declared attrs + wizard / apply / scaffold shipped; CF/PROV/UCUM / in-tree policy interpreter / plugin host still open |

**Long-term qualities:** write-once sealed generations ([packages](/cli/package)); normative SPEC; decade-scale read compatibility.

Ship against documented layout and query wire only — not this page.
