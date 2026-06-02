# Version alignment

When tet-py ships, its releases will pin a specific **`tetration`** crate version to ensure ABI and layout compatibility.

## Current tetration crate

| Component | Version |
|-----------|---------|
| `tetration` crate | **0.1.9** |
| Layout version | **1** |
| C ABI version | **1** (`TET_ABI_VERSION`) |

## Alignment policy (planned)

| tet-py version | tetration crate | Layout v1 | Notes |
|----------------|-----------------|-----------|-------|
| TBD | 0.1.9 | yes | Initial release target |

Patch releases of tet-py may bump the pinned crate for bug fixes. Minor releases may add query operations or Python API surface without layout changes.

## Checking versions

**CLI:**

```bash
tet --version
```

**Rust:**

```toml
# Cargo.toml — pin explicitly in production
tetration = "=0.1.9"
```

**C ABI:**

```c
#include "tetration.h"
assert(tet_abi_version() == TET_ABI_VERSION);
```

## Pre-1.0 caveat

Both the crate and tet-py are pre-1.0. Layout v1 and query JSON/TOML may change before 1.0. Pin versions in production and test after upgrades.

::: tip
Watch the [tetration releases](https://github.com/Latka-Industries/tetration/releases) page and the tet-py repo (TBD) for compatibility notes.
:::
