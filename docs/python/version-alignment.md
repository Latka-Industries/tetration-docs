# Version alignment

**tet-py** releases pin a specific **`tetration`** crate version at build time. Python API version and Rust core version are reported separately.

## Current releases

| Component | Version |
|-----------|---------|
| **tet-py** (PyPI) | [**0.4.3**](https://pypi.org/project/tet-py/0.4.3/) |
| **tetration** crate (CLI / Rust / linked by tet-py) | [**0.4.3**](https://crates.io/crates/tetration/0.4.3) |
| Layout version | **1** |
| C ABI version | **1** (`TET_ABI_VERSION`) |
| Python | **3.11+** (abi3 wheels) |
| NumPy | **2.x** |

## Alignment policy

From **0.2.0** onward, tet-py and tetration share the same minor (e.g. tet-py **0.4.x** ↔ tetration **0.4.x**).

| tet-py | tetration crate | Notes |
|--------|-----------------|-------|
| **0.4.3** | **0.4.3** | Pin alignment. Crate: store prune (`prune_store`, `tet gc s3://bucket/prefix`). Dry-run unless apply. No new Python API |
| **0.4.2** | **0.4.2** | Pin alignment. Crate: closed `group_by` over dimension names and `pipeline` step lists. Both ride existing JSON/TOML on `execute`. No new Python API |
| **0.4.1** | **0.4.1** | Pin alignment. Crate: closed query `filter` + zone-map chunk skip (`ReadPlan.zone_filter_skipped_chunks`). No new Python API |
| **0.4.0** | **0.4.0** | Pin alignment. Crate: zone maps at compact/publish, `ReadPlan.logical_element_count`, removed deprecated `tetration::query` CLI re-exports. No new Python API |
| **0.3.8** | **0.3.8** | Pin alignment. Crate hygiene only: shared `f16`/`f64` materialize, structured package `CatalogError`s (same display text), deprecated `tetration::query` CLI formatters (removed in 0.4.0). No new Python API |
| **0.3.7** | **0.3.7** | `tet.publish(dry_run=, replace=)`; CLI `--dry-run` / `--replace`; clearer overlap rejects; identical-byte overlaps OK |
| **0.3.6** | **0.3.6** | `tet.pack` (optional `remove_package`); CLI `tet pack --remove-package`, `tet gc`, `tet publish --abort` on local `.tet.d` |
| **0.3.5** | **0.3.5** | `tet.convert` reads a Zarr v2/v3 prefix on `s3://` one chunk at a time (`[zarr]` extra). Single-file `s3://` convert and pinned package open are unchanged |
| **0.3.4** | **0.3.4** | `tet.open("s3://bucket/prefix")` and `tet query -t` pin that package (`?generation=N` or `CURRENT`) and range-read. Credentials stay in `TETRATION_S3_*`. `S3Store.open` still downloads `packed.tet` |
| **0.3.3** | **0.3.3** | `tet.convert("s3://bucket/file.ext")` downloads that one object, then the existing importer. Core optional `BlockCache` / `CachingStore` (generation + offset). `tet.open("s3://…")` was still unsupported |
| **0.3.2** | **0.3.2** | Exclusive cross-host claim on `publishing/<G>` (heartbeat, stale window, force-only takeover). No new Python API |
| **0.3.1** | **0.3.1** | `S3Store` ingest / publish / pin; core `tetration-s3` + `stage_part` / `publish_staged_parts` |
| **0.3.0** | **0.3.0** | Store URI open + generation pin (`MemoryStore`, `TetFile.generation`); core `PackageStore` / range planner |
| **0.2.3** | **0.2.3** | `tet.export` (h5/netcdf/zarr extras); pin CLI export HDF5/NetCDF |
| **0.2.2** | **0.2.2** | Convert extras (h5/netcdf/zarr/parquet) + CSV/TSV; `.tet.d` open/ingest/publish; multi-chunk zero-copy `read_numpy` |
| **0.2.1** | **0.2.1** | Pin alignment only (package verify hardening + package fuzz in core; no Python API change) |
| **0.2.0** | **0.2.0** | Zero-copy `read_numpy` (single-chunk raw → `memmap`); writer protocol v2 in core |

- **Patch** tet-py releases may bump the pinned crate for bug fixes.
- **Minor** tet-py releases may add Python API or query wrappers without layout changes.
- Layout v1 and query JSON/TOML may still change before 1.0 — pin versions in production.

## Checking versions

**Python:**

```python
import tet
print(tet.__version__)      # tet-py package version
print(tet.core_version())   # tetration crate compiled into the extension
```

**CLI:**

```bash
tet --version
```

**Rust (when embedding directly):**

```toml
[dependencies]
tetration = "0.3"
```

**C ABI:**

```c
#include "tetration.h"
assert(tet_abi_version() == TET_ABI_VERSION);
```

## Keeping in sync

1. Prefer the [tet-py releases](https://github.com/Latka-Industries/tet-py/releases) page for the pinned tetration version.
2. If you also embed Rust directly, keep the **same tetration minor** as `tet.core_version()`.
3. Watch [tetration releases](https://github.com/Latka-Industries/tetration/releases) for layout and query engine changes that affect both the CLI and tet-py.
