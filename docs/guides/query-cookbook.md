# Query cookbook

Copy-paste query patterns for common tasks. All examples assume a dataset named `temperature` in `data.tet` unless noted.

Query documents are **flat** — use `"mean": []` / `mean = []`, not nested `"operation"` objects. Every example below shows **JSON** and **TOML**; both compile to the same wire document.

See the [Query engine overview](/guides/query-engine/) for architecture and limits.

## Scalar reductions

**Mean:**

::: code-group

```json [mean.json]
{ "dataset": "temperature", "mean": [] }
```

```toml [mean.toml]
dataset = "temperature"
mean = []
```

:::

```bash
tet query mean.toml -t data.tet -x -q
# dataset=temperature status=ok op=mean mean=3.5
```

**Sum, min, max, count** — swap the operation key:

::: code-group

```json [sum.json]
{ "dataset": "temperature", "sum": [] }
```

```toml [sum.toml]
dataset = "temperature"
sum = []
```

:::

| Op | JSON | TOML |
|----|------|------|
| min | `"min": []` | `min = []` |
| max | `"max": []` | `max = []` |
| count | `"count": []` | `count = []` |

**Variance and standard deviation:**

::: code-group

```json [var.json]
{ "dataset": "a", "var": [] }
```

```toml [var.toml]
dataset = "a"
var = []
```

:::

::: code-group

```json [std.json]
{ "dataset": "a", "std": [] }
```

```toml [std.toml]
dataset = "a"
std = []
```

:::

**Product and norms:**

::: code-group

```json [norms.json]
{ "dataset": "a", "product": [] }
{ "dataset": "a", "norm_l1": [] }
{ "dataset": "a", "norm_l2": [] }
```

```toml [norms.toml]
dataset = "a"
product = []

# Separate files, or swap the key:
# norm_l1 = []
# norm_l2 = []
```

:::

**NaN-skipping mean/std:**

::: code-group

```json [nan_mean.json]
{ "dataset": "temperature", "nan_mean": [] }
```

```toml [nan_mean.toml]
dataset = "temperature"
nan_mean = []
```

:::

::: code-group

```json [nan_std.json]
{ "dataset": "temperature", "nan_std": [] }
```

```toml [nan_std.toml]
dataset = "temperature"
nan_std = []
```

:::

## Partial-axis reductions

Sum along axis 0:

::: code-group

```json [sum_axis0.json]
{ "dataset": "a", "sum": 0 }
```

```toml [sum_axis0.toml]
dataset = "a"
sum = 0
```

:::

Reduce over multiple axes:

::: code-group

```json [sum_axes.json]
{ "dataset": "a", "sum": [0, 1] }
```

```toml [sum_axes.toml]
dataset = "a"
sum = [0, 1]
```

:::

Mean along a named axis (requires footer `dim_names`):

::: code-group

```json [mean_time.json]
{ "dataset": "temperature", "mean": "time" }
```

```toml [mean_time.toml]
dataset = "temperature"
mean = "time"
```

:::

```bash
tet info data.tet --metadata   # check dim_names
```

## Selections and previews

Full 2×3 slice preview:

::: code-group

```json [slice.json]
{
  "dataset": "temperature",
  "selection": { "start": [0, 0], "stop": [2, 3] }
}
```

```toml [slice.toml]
dataset = "temperature"

[selection]
start = [0, 0]
stop = [2, 3]
```

:::

```bash
tet query slice.toml -t data.tet -x --format table --preview 6
```

2×2 sub-slice:

::: code-group

```json [slice_2x2.json]
{
  "dataset": "temperature",
  "selection": { "start": [0, 0], "stop": [2, 2] }
}
```

```toml [slice_2x2.toml]
dataset = "temperature"

[selection]
start = [0, 0]
stop = [2, 2]
```

:::

Strided selection:

::: code-group

```json [strided.json]
{
  "dataset": "temperature",
  "selection": [
    { "start": 0, "stop": 100, "step": 2 },
    { "start": 0, "stop": 48 }
  ],
  "mean": []
}
```

```toml [strided.toml]
dataset = "temperature"
mean = []

[[selection]]
start = 0
stop = 100
step = 2

[[selection]]
start = 0
stop = 48
```

:::

Slice by coordinate label (requires footer `coords`):

::: code-group

```json [label_slice.json]
{
  "dataset": "temperature",
  "selection": [
    { "start_label": "2024-01-01", "stop_label": "2024-01-03" },
    { "start": 0, "stop": 2 }
  ],
  "mean": []
}
```

```toml [label_slice.toml]
dataset = "temperature"
mean = []

[[selection]]
start_label = "2024-01-01"
stop_label = "2024-01-03"

[[selection]]
start = 0
stop = 2
```

:::

## QC counts

Scalar QC (swap the key for each op):

::: code-group

```json [qc.json]
{ "dataset": "temperature", "nan_count": [] }
```

```toml [qc.toml]
dataset = "temperature"
nan_count = []
```

:::

Also: `null_count`, `inf_count`, `any_inf`, `any_nan`, `all_finite` — same shape with `= []`.

Null count with explicit fill value:

::: code-group

```json [null_count.json]
{
  "dataset": "temperature",
  "null_count": { "fill": -999, "axis": 0 }
}
```

```toml [null_count.toml]
dataset = "temperature"

[null_count]
fill = -999
axis = 0
```

:::

Partial-axis QC:

::: code-group

```json [nan_count_axis.json]
{ "dataset": "temperature", "nan_count": 0 }
```

```toml [nan_count_axis.toml]
dataset = "temperature"
nan_count = 0
```

:::

## Index operations

::: code-group

```json [argmin.json]
{ "dataset": "temperature", "arg_min": [] }
```

```toml [argmin.toml]
dataset = "temperature"
arg_min = []
```

:::

::: code-group

```json [argmax_axis.json]
{ "dataset": "temperature", "arg_max": 0 }
```

```toml [argmax_axis.toml]
dataset = "temperature"
arg_max = 0
```

:::

## Quantiles and histograms

Median:

::: code-group

```json [median.json]
{ "dataset": "a", "median": [] }
```

```toml [median.toml]
dataset = "a"
median = []
```

:::

::: code-group

```json [median_axis.json]
{ "dataset": "a", "median": 0 }
```

```toml [median_axis.toml]
dataset = "a"
median = 0
```

:::

Quantile on axis 0:

::: code-group

```json [quantile.json]
{ "dataset": "a", "quantile": { "q": 0.95, "axis": 0 } }
```

```toml [quantile.toml]
dataset = "a"

[quantile]
q = 0.95
axis = 0
```

:::

Histogram with auto edges from data min/max:

::: code-group

```json [histogram.json]
{ "dataset": "a", "histogram": { "bins": 10, "axis": 0 } }
```

```toml [histogram.toml]
dataset = "a"

[histogram]
bins = 10
axis = 0
```

:::

Histogram with fixed range:

::: code-group

```json [histogram_range.json]
{ "dataset": "a", "histogram": { "bins": 10, "min": 0, "max": 1 } }
```

```toml [histogram_range.toml]
dataset = "a"

[histogram]
bins = 10
min = 0
max = 1
```

:::

## Covariance and correlation

For 2-D datasets where one axis is observations and the other is variables:

::: code-group

```json [covariance.json]
{ "dataset": "variables", "covariance": { "axis": 0 } }
```

```toml [covariance.toml]
dataset = "variables"

[covariance]
axis = 0
```

:::

::: code-group

```json [correlation.json]
{ "dataset": "variables", "correlation": 0 }
```

```toml [correlation.toml]
dataset = "variables"
correlation = 0
```

:::

## Transforms

Z-score with sidecar output (stable filename):

::: code-group

```json [zscore_sidecar.json]
{
  "dataset": "temperature",
  "transform": { "method": "zscore" },
  "write": { "target": "sidecar", "timestamp": false }
}
```

```toml [zscore_sidecar.toml]
dataset = "temperature"

[transform]
method = "zscore"

[write]
target = "sidecar"
timestamp = false
```

:::

```bash
tet query zscore_sidecar.toml -t data.tet -x -q
# Publishes temperature.zscore.tet beside data.tet
```

Other methods: `minmax`, `l1`, `l2`, `center`, `scale`, `log1p`, `sqrt`, `softmax`.

Transform along an axis:

::: code-group

```json [softmax.json]
{
  "dataset": "temperature",
  "transform": { "method": "softmax", "axis": 0 },
  "write": { "target": "ram" }
}
```

```toml [softmax.toml]
dataset = "temperature"

[transform]
method = "softmax"
axis = 0

[write]
target = "ram"
```

:::

Write to spill file when selection is large:

::: code-group

```json [transform_spill.json]
{
  "dataset": "temperature",
  "transform": { "method": "zscore" },
  "write": { "target": "spill", "path": "normalized.bin" }
}
```

```toml [transform_spill.toml]
dataset = "temperature"

[transform]
method = "zscore"

[write]
target = "spill"
path = "normalized.bin"
```

:::

## Spill export (full tensor slice)

Export logical selection to binary without a reduction:

::: code-group

```json [spill.json]
{
  "dataset": "temperature",
  "selection": { "start": [0, 0], "stop": [100, 48] },
  "spill": "slice.bin"
}
```

```toml [spill.toml]
dataset = "temperature"
spill = "slice.bin"

[selection]
start = [0, 0]
stop = [100, 48]
```

:::

Relative path resolves beside `data.tet`. Use `--spill-allow` for extra roots.

## Memory and execution hints

Raise RAM budget for tier-C ops on large selections:

::: code-group

```json [budget.json]
{
  "dataset": "temperature",
  "median": [],
  "execution": { "memory_budget_percent": 50 }
}
```

```toml [budget.toml]
dataset = "temperature"
median = []

[execution]
memory_budget_percent = 50
```

:::

Force sequential chunk I/O:

::: code-group

```json [fold_seq.json]
{
  "dataset": "temperature",
  "mean": [],
  "execution": { "fold_parallel": false }
}
```

```toml [fold_seq.toml]
dataset = "temperature"
mean = []

[execution]
fold_parallel = false
```

:::

Experimental GPU (requires built features):

::: code-group

```json [gpu.json]
{
  "dataset": "temperature",
  "mean": [],
  "execution": { "device": "auto" }
}
```

```toml [gpu.toml]
dataset = "temperature"
mean = []

[execution]
device = "auto"
```

:::

```bash
tet query gpu.toml -t data.tet -x --device auto -q
# --device CLI flag overrides execution.device when both are set
```

## Output format cheat sheet

Works with either `.json` or `.toml` query files:

```bash
tet query q.toml -t data.tet              # plan only, full JSON
tet query q.json -t data.tet -x -q       # execute, one-line output
tet query q.toml -t data.tet -x --format stats
tet query q.toml -t data.tet -x --format table --preview 6
tet query q.toml -t data.tet --format plan
```

## Re-run from history

```bash
tet qhist list --dataset temperature
tet qhist run 1    # re-run newest matching query
```

## Fixture queries

The tetration repo ships **paired** `.json` / `.toml` fixtures in [`fixtures/queries/`](https://github.com/Latka-Industries/tetration/tree/main/fixtures/queries):

| Fixture | Notes |
|---------|-------|
| `mean_temperature` | Scalar mean |
| `mean_strided_temperature` | Mean + strided selection |
| `slice_full_temperature` | Full 2×3 preview |
| `slice_2x2_temperature` | 2×2 sub-slice |
| `sum_a` / `sum_axis0_a` | Multi-chunk u8 dataset |
| `var_a` | Scalar variance |
| `quantile_axis0_a` | Quantile on axis 0 |

## Further reading

- [Operations reference](/guides/query-engine/operations) — every op and response field
- [Selections & metadata](/guides/query-engine/selection-and-metadata) — dim names, coord labels
- [Execution strategies](/guides/query-engine/execution) — memory, spill, GPU
- [tet query](/cli/query) — CLI flags
