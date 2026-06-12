# Version alignment

**tet-py** releases pin a specific **`tetration`** crate version at build time. Python API version and Rust core version are reported separately.

## Current releases

| Component | Version |
|-----------|---------|
| **tet-py** (PyPI) | **0.1.0** |
| **tetration** crate (linked) | **0.1.9** |
| Layout version | **1** |
| C ABI version | **1** (`TET_ABI_VERSION`) |
| Python | **3.11+** (abi3 wheels) |
| NumPy | **2.x** |

## Alignment policy

| tet-py | tetration crate | Notes |
|--------|-----------------|-------|
| **0.1.0** | **0.1.9** | Initial PyPI release; query + NumPy ram/spill/sidecar + f32/f64 write |

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
tetration = "0.1.9"
```

**C ABI:**

```c
#include "tetration.h"
assert(tet_abi_version() == TET_ABI_VERSION);
```

## Upgrade notes

When upgrading tet-py:

1. Check the [tet-py releases](https://github.com/Latka-Industries/tet-py/releases) page for the pinned tetration version.
2. Re-run tests that depend on query wire shape or materialized dtypes.
3. If you also embed Rust directly, keep the **same tetration minor** as `tet.core_version()` unless you know the diff is compatible.

::: tip
Watch [tetration releases](https://github.com/Latka-Industries/tetration/releases) for layout and query engine changes that affect both the CLI and tet-py.
:::
