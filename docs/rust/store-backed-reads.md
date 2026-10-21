# Store-backed reads

Query a sealed package without assuming a full local mmap up front: pin one generation, fetch the catalog and the chunks the query touches, then run the same engine as a mmap path. Backends cover a local `.tet.d` root, in-memory stores for tests, and optional S3-compatible object storage (`tetration-s3`). Publish is CAS on `CURRENT` with an exclusive `publishing/<G>` claim across hosts. Optional `CachingStore` remembers packed ranges by `(generation, offset)`.

Per-release history lives in the [crate CHANGELOG](https://github.com/Latka-Industries/tetration/blob/main/CHANGELOG.md), not here.

## API surface

| Piece | Role |
|-------|------|
| `PackageStore` | `ReadAt` / `WritePart` / `PublishGeneration` |
| `LocalStore` | Filesystem `.tet.d` root |
| `MemoryStore` | In-memory backend for tests / planners |
| `S3Store` / `S3Config` | S3-compatible backend (`tetration-s3`; path-style, ETag conditional put) |
| `stage_part` / `publish_staged_parts` | N writers upload parts; one CAS publish |
| `publishing/<G>` claim | Exclusive cross-host publish lock: heartbeat, stale window, force-only takeover |
| `BlockCache` / `CachingStore` | Optional packed-range cache keyed by `(generation, offset)`. A new pin does not reuse another generation. Off unless the store is wrapped |
| `parse_tet_uri` / `parse_s3_package_uri` | Paths, `file://`, `memory://`, `s3://bucket/prefix` (`?generation=N`) |
| `pin_packed_tet` / `TetPackagePin` | Resolve `CURRENT` once (or an explicit generation) and keep that object |
| `prune_store` | Drop leftover `staging/` and sealed generations older than `CURRENT` / `CURRENT-1`. Dry-run unless apply. Does not write `CURRENT` |
| `open_s3_package` / `query_opened_s3_package` | Pin an `s3://` package from `TETRATION_S3_*` and query it (feature `tetration-s3`) |

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

## Store prune

`prune_store` is local `tet gc` on `PackageStore`, including `S3Store` (path-style, `TETRATION_S3_*`). CLI: `tet gc s3://bucket/prefix` (feature `tetration-s3`). Dry-run unless `--apply` / `PruneOptions.apply`. It removes leftover staging sessions and sealed generations older than `CURRENT` and `CURRENT-1`. It does not write `CURRENT`. A sealed generation newer than `CURRENT` is kept. A live `publishing/<G>` claim (heartbeat not stale) keeps every staging session and that generation.

**Pin safety:** the store does not track open readers. Pass `pinned_generations`, `with_package_pins`, or `with_store_pins`. `CachingStore.prune` always protects that wrapper's pin. `tet gc` on `s3://` cannot see pins held by other processes; those `packed.tet` objects are removed if they are older than `CURRENT-1` unless you pass `--protect-generation G` or `?generation=G`. `CURRENT` and `CURRENT-1` are never candidates.

## Limits

- Assemble path caps at 64 MiB (sparse in-memory image). Larger objects need a non-assembling path later.
- The block cache is optional and in-memory. Wrap the store to turn it on.
- `tet query -t s3://bucket/prefix` and tet-py `tet.open("s3://bucket/prefix")` pin that package and range-read. `?generation=N` pins an explicit generation; otherwise `CURRENT` is read once. Credentials are `TETRATION_S3_*` (`ENDPOINT` required). The CLI needs the `tetration-s3` feature.
- `S3Store.open` (Rust and tet-py) still downloads the whole `packed.tet`.
- `tet convert s3://bucket/file.ext` (and tet-py `tet.convert`) downloads that one object, then the existing importer. A Zarr v2/v3 prefix on `s3://` is read one chunk at a time (tet-py needs `[zarr]`).

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
