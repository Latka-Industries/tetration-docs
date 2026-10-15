# Version alignment

**tet-py** releases pin a specific **`tetration`** crate version at build time. Python API version and Rust core version are reported separately.

## Current releases

| Component | Version |
|-----------|---------|
| **tet-py** (PyPI) | [**0.2.0**](https://pypi.org/project/tet-py/) |
| **tetration** crate (CLI / Rust / linked by tet-py) | [**0.2.0**](https://crates.io/crates/tetration/0.2.0) |
| Layout version | **1** |
| C ABI version | **1** (`TET_ABI_VERSION`) |
| Python | **3.11+** (abi3 wheels) |
| NumPy | **2.x** |

## Alignment policy

| tet-py | tetration crate | Notes |
|--------|-----------------|-------|
| **0.1.0** | **0.1.9** | Initial PyPI; query + NumPy ram/spill/sidecar + f32/f64 write |
| **0.1.1** | **0.1.9** | Query preview: `preview=N`, `QueryResult.preview` |
| **0.1.2** | **0.1.12** | Budgets, TOML, f16/u32/u64 export, integer write, convert npy/npz |
| **0.2.0** | **0.2.0** | Aligned minor; zero-copy `read_numpy` (single-chunk raw → `memmap`); writer protocol v2 in core |

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
tetration = "0.2"
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
