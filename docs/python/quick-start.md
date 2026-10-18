# Quick start

## Install and open

```bash
pip install tet-py
```

```python
import tet

with tet.open("data.tet") as f:
    print(list(f))                    # dataset names
    ds = f.dataset("temperature")
    print(ds.shape, ds.dtype)
```

Paths support `~` expansion. A local file stays mapped. A `.tet.d` package path pins `CURRENT` once (`f.generation`). URI forms: `file://…`, `path?generation=N`, and `s3://bucket/prefix` (optional `?generation=N`). The `s3://` form pins that package from `TETRATION_S3_*` and range-reads. Use `tet.MemoryStore` for `memory://`, and `tet.S3Store.connect(...)` for ingest / publish (`S3Store.open` still downloads `packed.tet`). `tet.convert` accepts a single-file `s3://bucket/object.ext` and downloads that object. See [store-backed reads](/rust/store-backed-reads#python-tet-py).

## Reductions

Prefer methods on the file object — same wire schema as `tet query`:

```python
with tet.open("data.tet") as f:
    scalar = f.mean("temperature")           # float when all axes reduced
    partial = f.std("temperature", axis=0)   # QueryResult when axes remain
    partial.reduced                          # list along remaining axes

    f.quantile("temperature", 0.5)
    f.histogram("temperature", bins=32)
```

Partial vs full reduction: when `raw=False` (default), full reductions return Python scalars; partial reductions return a [`QueryResult`](/python/operations#queryresult).

Optional preview samples (parity with `tet query -x --preview N`):

```python
r = f.mean("temperature", preview=32)   # QueryResult: r.scalar + r.preview (ndarray)
```

## Generic queries

```python
doc = {"dataset": "temperature", "mean": []}
r = f.execute(doc)                         # QueryResult
r = f.execute(doc, preview=32)             # QueryResult with r.preview (ndarray)
wire = f.execute(doc, raw=True)            # full JSON dict (CLI -x parity)

# TOML strings work too (same Auto detect as `tet query`)
r = f.execute('dataset = "temperature"\nmean = []\n')

# Optional execution hints (CLI parity)
f.mean("temperature", memory_budget_percent=40, device="cpu")

f.plan_only(doc)                           # plan without executing
```

Use [`build_query`](/python/operations#selection-and-build_query) when you need selections or explicit axis lists.

## Catalog inspection

```python
info = f.info()                            # same dict as `tet info --json`
summary = f.summary()                      # alias

for name in f:
    print(f[name].shape)                   # f["temperature"] or f[0]
```

For REPL exploration, prefer `list(f)` or `f.dataset(name)` — `info()` includes every chunk row and can be large.

## NumPy (overview)

```python
arr = f.read_numpy("temperature")                    # ram — full selection
z = f.transform.to_numpy.zscore("temperature")       # transform → ndarray

spill = f.transform.to_spill.zscore("temperature", path="zscore.bin")
same = spill.to_numpy()                              # load spill file

side = f.transform.to_sidecar.center("temperature", path="derived.tet")
arr = side.to_numpy(f)
```

See [NumPy interchange](/python/numpy) for ram vs spill vs sidecar, memory budget, and write paths.

## Write a `.tet` file

```python
import numpy as np
import tet

arr = np.arange(6, dtype=np.float32).reshape(2, 3)
tet.write_dataset("out.tet", "temperature", arr, chunk_shape=(2, 3))
```

Multi-dataset sessions use `tet.TetWriter` — see [NumPy write](/python/numpy#write).

## IDE typing stubs

```python
stub = tet.typing_stub("data.tet")
# save as mydata_tet.pyi — Literal dataset names and dim_names when present
```

## CLI parity

| Python | CLI |
|--------|-----|
| `f.query(doc)` | `tet query -x` |
| `f.plan_only(doc)` | `tet query` (no `-x`) |
| `f.info()` | `tet info --json` |

Query document schema: [Query engine guide](/guides/query-engine/).

## Next steps

- [Query operations](/python/operations) — all reduction and transform methods
- [NumPy interchange](/python/numpy) — dense read/write sinks
- [Query cookbook](/guides/query-cookbook) — copy-paste wire examples
