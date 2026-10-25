# Version alignment

**tet-py** releases pin a specific **`tetration`** crate version at build time. Python API version and Rust core version are reported separately.

## Current releases

| Component | Version |
|-----------|---------|
| **tet-py** (package / GitHub) | [**0.8.2**](https://github.com/Latka-Industries/tet-py/releases/tag/v0.8.2) |
| **tetration** crate (CLI / Rust / linked by tet-py) | [**0.8.2**](https://crates.io/crates/tetration/0.8.2) |
| Layout version | **1** |
| C ABI version | **1** (`TET_ABI_VERSION`) |
| Python | **3.11+** (abi3 wheels) |
| NumPy | **2.x** |

## Alignment policy

tet-py and tetration share the same **minor** (e.g. tet-py **0.8.x** ↔ tetration **0.8.x**). Most patch cuts are **pin-only** for Python; some add a thin wrapper when the crate ships a new library surface (e.g. **0.8.2** `tet.run_job`).

- **Patch** tet-py releases may bump the pinned crate and/or expose a thin Rust API (no Python re-implementation of crate logic).
- **Minor** tet-py releases may add broader Python API without layout changes.
- Layout v1 and query JSON/TOML may still change before 1.0 — pin versions in production.

Release history: [tetration CHANGELOG](https://github.com/Latka-Industries/tetration/blob/main/CHANGELOG.md) · [tet-py CHANGELOG](https://github.com/Latka-Industries/tet-py/blob/main/CHANGELOG.md).

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

```bash
cargo add tetration@0.8
```

Pin the same minor as `tet.core_version()` when you need a locked build.

**C ABI:**

```c
#include "tetration.h"
assert(tet_abi_version() == TET_ABI_VERSION);
```

## Keeping in sync

1. Prefer the [tet-py releases](https://github.com/Latka-Industries/tet-py/releases) page for the pinned tetration version.
2. If you also embed Rust directly, keep the **same tetration minor** as `tet.core_version()`.
3. Watch [tetration releases](https://github.com/Latka-Industries/tetration/releases) for layout and query engine changes that affect both the CLI and tet-py.
