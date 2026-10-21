# Version alignment

**tet-py** releases pin a specific **`tetration`** crate version at build time. Python API version and Rust core version are reported separately.

## Current releases

| Component | Version |
|-----------|---------|
| **tet-py** (PyPI) | [**0.6.4**](https://pypi.org/project/tet-py/0.6.4/) |
| **tetration** crate (CLI / Rust / linked by tet-py) | [**0.6.4**](https://crates.io/crates/tetration/0.6.4) |
| Layout version | **1** |
| C ABI version | **1** (`TET_ABI_VERSION`) |
| Python | **3.11+** (abi3 wheels) |
| NumPy | **2.x** |

## Alignment policy

From **0.2.0** onward, tet-py and tetration share the same **minor** (e.g. tet-py **0.6.x** ↔ tetration **0.6.x**). Patch cuts on either side are usually **pin-only** for Python (same `import tet` surface).

- **Patch** tet-py releases may bump the pinned crate for bug fixes or crate-only work.
- **Minor** tet-py releases may add Python API or query wrappers without layout changes.
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
cargo add tetration
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
