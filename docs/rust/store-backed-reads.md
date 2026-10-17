# Store-backed reads (0.3.0)

**0.3.0** adds a package blob store and a range-read planner so embedders can query a sealed `packed.tet` without assuming a full local mmap up front. Local `.tet` / `.tet.d` CLI paths are unchanged.

## What shipped

| Piece | Role |
|-------|------|
| `PackageStore` | `ReadAt` / `WritePart` / `PublishGeneration` |
| `LocalStore` | Filesystem `.tet.d` root |
| `MemoryStore` | In-memory backend for tests / planners |
| `parse_tet_uri` | Paths, `file://`, `memory://`, `s3://` shape (S3 open is 0.3.1) |
| `pin_packed_tet` / `TetPackagePin` | Resolve `CURRENT` once (or an explicit generation) and keep that object |

## Flow

```text
parse_tet_uri → pin_packed_tet (CURRENT once or explicit G)
  → plan_catalog_fetch (superblock + TIDX [+ footer probe])
  → build_read_plan
  → plan_query_fetch (catalog ranges ∪ touched chunk payloads)
  → assemble_object_from_ranges → existing mmap query engine
```

Entry points: `pin_packed_tet`, `execute_query_with_store`, `execute_query_on_store_pin`, `TetPackage::pin_current` / `pin_generation`.

## Pin / consistency

- Resolve `CURRENT` **once**. Advancing `CURRENT` under an open pin does not change which `packed.tet` the pin opens.
- Sealed generation bytes are immutable. If they change under the key, treat as verify failure.

## Limits

- Assemble path caps at 64 MiB (sparse in-memory image). Larger objects need a non-assembling path later.
- No local block cache yet (planned 0.3.3).
- `s3://` is recognized in URI parse only until 0.3.1.

## Python (tet-py)

```python
import tet

with tet.open("climate.tet.d") as f:          # pins CURRENT
    print(f.generation, f.mean("temp"))

with tet.open("climate.tet.d?generation=1") as f:
    arr = f.read_numpy("temp")

store = tet.MemoryStore.from_package("climate.tet.d")
with store.open("memory://current") as f:     # in-memory pin; no S3
    assert f.generation == 1
```

Advancing `CURRENT` under an open handle does not retarget that handle. Normative Rust detail: [query engine — store-backed reads](https://github.com/Latka-Industries/tetration/blob/main/docs/query_engine.md#store-backed-reads-030--phase-12-foundation).
