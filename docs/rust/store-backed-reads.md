# Store-backed reads (0.3.x)

**0.3.0** adds a package blob store and a range-read planner so embedders can query a sealed `packed.tet` without assuming a full local mmap up front. **0.3.1** adds an optional S3-compatible backend and store ingest / CAS publish. Local `.tet` / `.tet.d` CLI paths are unchanged.

## What shipped

| Piece | Role |
|-------|------|
| `PackageStore` | `ReadAt` / `WritePart` / `PublishGeneration` |
| `LocalStore` | Filesystem `.tet.d` root |
| `MemoryStore` | In-memory backend for tests / planners |
| `S3Store` / `S3Config` | S3-compatible backend (`tetration-s3`; path-style, ETag conditional put) |
| `stage_part` / `publish_staged_parts` | N writers upload parts; one CAS publish (0.3.1) |
| `parse_tet_uri` | Paths, `file://`, `memory://`, `s3://` shape |
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
- A lost CAS publish leaves the previous `CURRENT` and its `packed.tet` untouched.

## Limits

- Assemble path caps at 64 MiB (sparse in-memory image). Larger objects need a non-assembling path later.
- No local block cache yet (planned 0.3.3).
- `tet open s3://…` / convert-from-`s3://` are not wired yet (planned 0.3.3). Use `S3Store::connect` (or tet-py `S3Store.connect`) with endpoint + credentials.

## Python (tet-py)

```python
import tet

with tet.open("climate.tet.d") as f:          # pins CURRENT
    print(f.generation, f.mean("temp"))

with tet.open("climate.tet.d?generation=1") as f:
    arr = f.read_numpy("temp")

store = tet.MemoryStore.from_package("climate.tet.d")
with store.open("memory://current") as f:
    assert f.generation == 1

s3 = tet.S3Store.connect(
    endpoint="http://127.0.0.1:9000",
    bucket="tetration-test",
    access_key_id="tetration",
    secret_access_key="tetration-secret",
    prefix="demo",
)
s3.ingest("part.tet", session_id="s0", part_id="values")
s3.publish(["values"])
pinned = s3.open("current")                   # pin; later publish does not retarget
```

Advancing `CURRENT` under an open handle does not retarget that handle. Normative Rust detail: [query engine — store-backed reads](https://github.com/Latka-Industries/tetration/blob/main/docs/query_engine.md#store-backed-reads-030--phase-12-foundation).
