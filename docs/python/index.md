# Python (tet-py)

**tet-py** will provide Python bindings over the Tetration C ABI / Rust crate for the Python ecosystem.

::: warning Not yet published
Official Python bindings are **not** built from the tetration repository. A separate PyPI project (repository **TBD**) will ship wheels (PyO3 / maturin) that depend on a pinned **`tetration`** release.

Until tet-py ships, use the **`tet` CLI**, embed **Rust**, use the [C ABI](/rust/ffi), or implement read-only readers from the [format spec](/format/).
:::

## Planned scope

| Topic | Status |
|-------|--------|
| PyPI install | Pending package publish |
| Open `.tet`, inspect catalog | Planned |
| Read chunks / run queries | Planned |
| NumPy array interchange | Planned |
| Convert from h5py / zarr | Planned |

## Sections

- [Install](/python/install) — PyPI vs build from source
- [Quick start](/python/quick-start) — open, inspect, read (placeholder)
- [Version alignment](/python/version-alignment) — tet-py ↔ tetration crate

## Alternatives today

```bash
# CLI (works now)
pip install tet-py  # not yet available — use cargo/brew install tetration instead
tet info data.tet
tet query mean.toml -t data.tet -x -q

# Subprocess from Python
import subprocess
result = subprocess.run(
    ["tet", "query", '{"dataset":"temperature","mean":[]}', "-t", "data.tet", "-x", "-q"],
    capture_output=True, text=True, check=True,
)
print(result.stdout)
```

## Related

- [Rust crate](/rust/) — underlying implementation
- [C ABI / FFI](/rust/ffi) — what tet-py will wrap
- [Format spec](/format/) — `.tet` on-disk layout
