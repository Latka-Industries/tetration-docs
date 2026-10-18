# Store-backed reads (0.3.x)

**0.3.0** adds a package blob store and a range-read planner so embedders can query a sealed `packed.tet` without assuming a full local mmap up front. **0.3.1** adds an optional S3-compatible backend and store ingest / CAS publish. **0.3.2** adds an exclusive cross-host claim on `publishing/<G>` (heartbeat, stale window, force-only takeover). **0.3.3** adds an optional in-memory block cache and single-file `s3://` convert. **0.3.4** opens a pinned `s3://bucket/prefix` package through that planner (`tet query -t`, `open_s3_package`, tet-py `tet.open`). Local `.tet` / `.tet.d` paths are unchanged.

## What shipped

| Piece | Role |
|-------|------|
| `PackageStore` | `ReadAt` / `WritePart` / `PublishGeneration` |
| `LocalStore` | Filesystem `.tet.d` root |
| `MemoryStore` | In-memory backend for tests / planners |
| `S3Store` / `S3Config` | S3-compatible backend (`tetration-s3`; path-style, ETag conditional put) |
| `stage_part` / `publish_staged_parts` | N writers upload parts; one CAS publish (0.3.1) |
| `publishing/<G>` claim | Exclusive cross-host publish lock: heartbeat, stale window, force-only takeover (0.3.2) |
| `BlockCache` / `CachingStore` | Optional packed-range cache keyed by `(generation, offset)`. A new pin does not reuse another generation. Off unless the store is wrapped (0.3.3) |
| `parse_tet_uri` / `parse_s3_package_uri` | Paths, `file://`, `memory://`, `s3://bucket/prefix` (`?generation=N`) |
| `pin_packed_tet` / `TetPackagePin` | Resolve `CURRENT` once (or an explicit generation) and keep that object |
| `open_s3_package` / `query_opened_s3_package` | Pin an `s3://` package from `TETRATION_S3_*` and query it (feature `tetration-s3`, 0.3.4) |

## Flow

```text
parse_tet_uri → pin_packed_tet (CURRENT once or explicit G)
  → plan_catalog_fetch (superblock + TIDX [+ footer probe])
  → build_read_plan
  → plan_query_fetch (catalog ranges ∪ touched chunk payloads)
  → assemble_object_from_ranges → existing mmap query engine
```

Entry points: `pin_packed_tet`, `execute_query_with_store`, `execute_query_on_store_pin`, `open_s3_package`, `query_opened_s3_package`, `TetPackage::pin_current` / `pin_generation`.

## Pin / consistency

- Resolve `CURRENT` **once**. Advancing `CURRENT` under an open pin does not change which `packed.tet` the pin opens.
- Sealed generation bytes are immutable. If they change under the key, treat as verify failure.
- A lost CAS publish leaves the previous `CURRENT` and its `packed.tet` untouched.

## Limits

- Assemble path caps at 64 MiB (sparse in-memory image). Larger objects need a non-assembling path later.
- The block cache is optional and in-memory. Wrap the store to turn it on.
- `tet query -t s3://bucket/prefix` and tet-py `tet.open("s3://bucket/prefix")` pin that package and range-read. `?generation=N` pins an explicit generation; otherwise `CURRENT` is read once. Credentials are `TETRATION_S3_*` (`ENDPOINT` required). The CLI needs the `tetration-s3` feature.
- `S3Store.open` (Rust and tet-py) still downloads the whole `packed.tet`.
- `tet convert s3://bucket/file.ext` (and tet-py `tet.convert`) downloads that one object, then the existing importer. Zarr prefixes are rejected.

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
pinned = s3.open("current")                   # full download of packed.tet

with tet.open("s3://tetration-test/demo") as f:  # range-read; TETRATION_S3_* 
    assert f.generation == 1
    f.mean("values")
```

Advancing `CURRENT` under an open handle does not retarget that handle. Normative Rust detail: [query engine — store-backed reads](https://github.com/Latka-Industries/tetration/blob/main/docs/query_engine.md#store-backed-reads-030--phase-12-foundation).
