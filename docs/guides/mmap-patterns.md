# Mmap read patterns

Tetration is designed for partial I/O: mmap the file, touch only chunks that intersect your selection.

## Mental model

```
open .tet → mmap byte slice → plan query → chunk coords → payload offsets → decode tiles
```

The query engine handles this automatically. For custom readers, iterate the chunk index from [`read_tet_summary_v1`](https://docs.rs/tetration/latest/tetration/catalog/fn.read_tet_summary_v1.html).

## Rust: query with plan inspection

```rust
use tetration::catalog::TetFile;
use tetration::prelude::*;

let file = TetFile::open("data.tet")?;
let doc = parse_query_json(r#"{"dataset":"temperature","mean":[]}"#)?;
validate_query(&doc)?;

// Plan only — see which chunks would be touched
let plan = plan_query_with_tet_mmap(&doc, file.path(), file.mmap())?;
println!("chunks to read: {}", plan.read_plan.as_ref().map(|p| p.chunks.len()).unwrap_or(0));

// Execute — mmap + decode only intersecting tiles
let response = execute_query_document(
    &doc,
    file.path(),
    file.mmap(),
    ExecuteQueryOptions::execute_no_preview(),
    None,
)?;
```

## Rust: dense materialization

When you need the full selection in memory:

```rust
use tetration::query::{materialize_query_selection, MaterializeQueryOptions};

let outcome = materialize_query_selection(
    &doc,
    file.path(),
    file.mmap(),
    MaterializeQueryOptions::default(),
)?;
// outcome.data: dense buffer for the selection
```

## CLI: plan vs execute

```bash
# See read plan without decoding
tet query mean.toml -t data.tet --format plan

# Execute with stats (no chunk list in output)
tet query mean.toml -t data.tet -x --format stats

# Table output with preview sample
tet query slice.json -t data.tet -x --format table --preview 6
```

## Python (tet-py)

Prefer **tet-py** for mmap-backed queries and dense export:

```python
import tet

with tet.open("data.tet") as f:
    r = f.execute({"dataset": "temperature", "mean": []}, plan=True)
    arr = f.read_numpy("temperature", selection=tet.selection_slices(tet.axis_slice(0, 100)))

    # Transform sinks — spill (.bin) or sidecar (derived .tet beside source)
    side = f.transform.to_sidecar.zscore("temperature", path="temperature.zscore.tet")
    derived = side.open(f)   # or tet.open(side.path) once path is known
    arr = derived.read_numpy("temperature-zscore")
```

See [Python quick start](/python/quick-start) and [NumPy interchange](/python/numpy).

### CLI subprocess (no Python install)

```python
import json
import subprocess

def plan_query(tet_path: str, query: dict) -> dict:
    result = subprocess.run(
        ["tet", "query", json.dumps(query), "-t", tet_path, "--format", "plan"],
        capture_output=True, text=True, check=True,
    )
    return json.loads(result.stdout)
```

## Contiguous raw payloads

For full dense selections over **raw** (`codec = 0`) chunks, the engine may linear-scan contiguous payload bytes instead of per-chunk mmap when:

1. Payloads are sequential in the file
2. Total raw bytes match the selection size

Reference writers (`write_raw_array_file`, `tet convert`) produce this layout. Zstd chunks always decode per-chunk.

## Concurrency

Many processes can mmap-read the same sealed `.tet` simultaneously. The OS shares cold pages via the page cache. Scale out with **N processes × independent queries**, not by sharding one query inside the engine.

See [Versioning — concurrency](/format/versioning).
