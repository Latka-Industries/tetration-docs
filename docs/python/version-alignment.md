# Version alignment

**tet-py** releases pin a specific **`tetration`** crate version at build time. Python API version and Rust core version are reported separately.

## Current releases

| Component | Version |
|-----------|---------|
| **tet-py** (PyPI) | [**0.5.4**](https://pypi.org/project/tet-py/0.5.4/) |
| **tetration** crate (CLI / Rust / linked by tet-py) | [**0.5.4**](https://crates.io/crates/tetration/0.5.4) |
| Layout version | **1** |
| C ABI version | **1** (`TET_ABI_VERSION`) |
| Python | **3.11+** (abi3 wheels) |
| NumPy | **2.x** |

## Alignment policy

From **0.2.0** onward, tet-py and tetration share the same minor (e.g. tet-py **0.5.x** ↔ tetration **0.5.x**).

| tet-py | tetration | Notes |
|--------|-----------|-------|
| **0.5.4** | **0.5.4** | Crate hygiene + `parse_query_json` fuzz; pin-only for Python |
| **0.5.3** | **0.5.3** | Larger SPEC conformance accept / reject surface on the crate; pin-only for Python |
| **0.5.2** | **0.5.2** | Normative SPEC + conformance pack on the crate; pin-only for Python |
| **0.5.1** | **0.5.1** | Declared science/media attrs + `tet semantics` on the crate; pin-only for Python — no metadata ORM |
| **0.5.0** | **0.5.0** | Distributed fold library on the crate (`query::distributed`); pin-only for Python — no cluster wrapper |
| **0.4.5** | **0.4.5** | Optional value postings for exact `filter.eq` (`index_filter_skipped_chunks`). No new Python API |
| **0.4.4** | **0.4.4** | Cell filter on kept chunks (dense NaN / fill mask). No new Python API |
| **0.4.3** | **0.4.3** | Store prune (`prune_store`, `tet gc s3://`). No new Python API |
| **0.4.2** | **0.4.2** | Closed `group_by` / `pipeline` via JSON/TOML. No new Python API |
| **0.4.1** | **0.4.1** | Closed `filter` + zone-map chunk skip. No new Python API |
| **0.4.0** | **0.4.0** | Zone maps; `logical_element_count`; CLI re-exports removed from `query` |
| **0.3.x** | **0.3.x** | Store / S3 packages, convert, pack / gc / publish UX — see changelogs |
| **0.2.x** | **0.2.x** | Writer protocol v2, convert extras, zero-copy `read_numpy` — see changelogs |

Older patch notes: [tetration CHANGELOG](https://github.com/Latka-Industries/tetration/blob/main/CHANGELOG.md) · [tet-py CHANGELOG](https://github.com/Latka-Industries/tet-py/blob/main/CHANGELOG.md).

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
tetration = "0.5"
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
