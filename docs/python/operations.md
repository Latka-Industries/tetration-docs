# Query operations

`tet` exposes one method per query operation on [`TetFile`](/python/quick-start). Use [`build_query`](#selection-and-build_query) when you need the wire dict explicitly. The wire schema matches the [query engine guide](/guides/query-engine/) and `tet query`.

```python
import tet
from tet import axis_slice, build_query, selection_slices

with tet.open("data.tet") as f:
    ...
```

Full reference with every example lives in the [tet-py repo](https://github.com/Latka-Industries/tet-py/blob/main/docs/operations.md).

## Axis rules

List-style reductions (`mean`, `sum`, `min`, `max`, `count`, `std`, `var`, `product`, `norm_l1`, `norm_l2`, `median`, `all_finite`, `any_nan`, `any_inf`, `arg_min`, `arg_max`, `nan_count`, `inf_count`, `null_count`, `nan_mean`, `nan_std`) share the same `axis` / `axes` arguments.

| Call | Effect |
|------|--------|
| `f.mean("a")` | Reduce **all** axes → scalar |
| `f.mean("a", axis=0)` | Reduce axis 0 → `QueryResult` with `.reduced` |
| `f.mean("a", axes=[0, 1])` | Reduce multiple axes |
| `f.mean("a", axis="time")` | Resolve name from footer `dim_names` |

Pass **only one** of `axis` or `axes`, not both. `axis=1` becomes `axes=[1]` on the wire.

## QueryResult

| `raw` | Full reduction | Partial reduction |
|-------|----------------|-------------------|
| `False` (default) | Python `float` / `int` / `bool` | `QueryResult` — `.scalar`, `.reduced`, `.matrix`, … |
| `False` + `preview=N` | `QueryResult` — `.scalar` + `.preview` | `QueryResult` (same fields) |
| `True` | Full wire `dict` | Full wire `dict` |

```python
scalar = f.mean("a")
partial = f.max("a", axis=0)
partial.reduced

wire = f.mean("a", raw=True)
r = f.execute({"dataset": "a", "mean": []})
```

## Preview samples (`preview=N`)

While executing a reduction, optionally include up to **N** raw payload values (does not materialize the full tensor).

| Call | Returns |
|------|---------|
| `f.mean("a")` | `float` |
| `f.mean("a", preview=32)` | `QueryResult` — `.scalar` + `.preview` (`numpy.ndarray`, 1-D) |

```python
r = f.mean("a", preview=32)
r.scalar
r.preview              # capped raw samples
r.preview_truncated    # True when more values exist beyond N
```

`preview=N` works on list-style reducers, `quantile`, `histogram`, `null_count`, and `query_execute` / `execute`.

## List-style reductions

```python
f.mean("a")
f.sum("a", axis=0)
f.min("a", axes=[0, 1])
f.count("a")
f.std("a", axis=1)
f.var("a")
f.product("a")
f.norm_l1("a")
f.norm_l2("a")
f.median("a")
f.all_finite("a")
f.any_nan("a")
f.any_inf("a")
f.arg_min("a", axis=0)
f.arg_max("a", axis=0)
f.nan_count("a")
f.inf_count("a")
f.null_count("a")
f.nan_mean("a")
f.nan_std("a", axis=0)
```

## Tier-C ops

```python
f.quantile("a", 0.5)
f.quantile("a", 0.9, axis=0)

f.histogram("a", bins=32)
f.histogram("a", bins=[0.0, 1.0, 2.0])

# rank-2 datasets only
f.covariance("temperature")
f.correlation("temperature")
```

## Transform

Sink-first API: **`f.transform.to_<sink>.<method>(dataset, ...)`**

| Sink | Example | Returns |
|------|---------|---------|
| `to_numpy` | `f.transform.to_numpy.zscore("a")` | `numpy.ndarray` |
| `to_spill` | `f.transform.to_spill.softmax("a", path="out.bin")` | `SpillTransformResult` → `.to_numpy()` |
| `to_sidecar` | `f.transform.to_sidecar.center("a")` | `SidecarTransformResult` → `.to_numpy(f)` / `.open(f)` |

Methods on each sink: `zscore`, `minmax`, `l1`, `l2`, `center`, `scale`, `log1p`, `sqrt`, `softmax`.

Relative spill/sidecar paths resolve **beside the source `.tet`**. Sidecar writes a derived `.tet` (transform-only) — see [NumPy — sidecar](/python/numpy#sidecar-transform-tet). Ram budget rules: [memory budget](/python/numpy#memory-budget).

```python
arr = f.transform.to_numpy.zscore("a")
s = f.transform.to_spill.softmax("a", path="out.bin")
arr = s.to_numpy()
side = f.transform.to_sidecar.center("a", path="a.center.tet")
arr = side.to_numpy(f)
```

For arbitrary wire documents:

```python
f.execute(build_query("a", transform={"method": "zscore"}))
```

## Selection and `build_query`

```python
sel = selection_slices(
    axis_slice(0, 4),      # start inclusive, stop exclusive
    axis_slice(0, 4, 2),     # step 2
)

f.execute(build_query("a", selection=sel, mean=[]))
build_query("a", mean=[])              # all axes
build_query("a", mean=[0])             # axis 0 only
```

Coordinate labels work when footer coords exist:

```python
axis_slice(start_label="2020", stop_label="2024")
```

## Entry points (CLI parity)

| Python | CLI |
|--------|-----|
| `f.query(doc)` | `tet query -x` |
| `f.plan_only(doc)` | `tet query` (no `-x`) |
| `f.query_execute(doc, device=..., preview=N)` | execute with device + preview cap |
| `QueryResult.preview` | capped `execution.*_preview` → `ndarray` |
| `f.execute(doc, plan=True)` | plan only |
| `f.read_numpy(...)` | Materialize selection → ndarray |
| `f.read_spill(...)` | Spill selection → `SpillReadResult` |

`doc` may be a **`dict`** or **JSON string**.

## Errors

| Exception | When |
|-----------|------|
| `UnknownDatasetError` | Bad dataset name |
| `UnknownAxisError` | Bad index or `dim_names` label |
| `TetError` | Query parse, validation, or execution |
| `CatalogError` | File layout / catalog read / write validation |

## Quick reference

```text
mean, sum, min, max, count, numel, std, var, product,
norm_l1, norm_l2, median, all_finite, any_nan, any_inf,
arg_min, arg_max, nan_count, inf_count, null_count, nan_mean, nan_std,
quantile, histogram, covariance, correlation,
transform.to_numpy.*, transform.to_spill.*, transform.to_sidecar.*,
read_numpy, read_spill
```

Plus: `execute`, `query`, `query_execute`, `plan_only`, `dataset`, `summary`, `info`.

## Planned

| Topic | Tracking |
|-------|----------|
| `read_numpy` memory budget preflight | [tet-py#9](https://github.com/Latka-Industries/tet-py/issues/9), [tetration#19](https://github.com/Latka-Industries/tetration/issues/19) |
