# Operations reference

Each operation is a **top-level key** in the query document. Use `[]` for a **scalar** reduction over all selected elements, or an axis index / list for **partial** reductions.

Every example shows **JSON** and **TOML**. Population **`var` / `std`** use `ddof = 0`. **`norm_l2`** is √(sum of squares). Integer wire dtypes promote to **`f64`** in aggregate fields.

## Tier-A/B — streaming fold

Fast on large selections — no full tensor in RAM.

### Basic reductions

| Key | Scalar field | Partial fields |
|-----|--------------|----------------|
| `sum` | `operation_sum` | `operation_reduced_sum`, `operation_reduced_shape` |
| `mean` | `operation_mean` | `operation_reduced_mean`, … |
| `min` | `operation_min` | `operation_reduced_min`, … |
| `max` | `operation_max` | `operation_reduced_max`, … |
| `count` | `operation_element_count` | `operation_reduced_count`, … |
| `var` | `operation_var` | `operation_reduced_var`, … |
| `std` | `operation_std` | `operation_reduced_std`, … |
| `product` | `operation_product` | `operation_reduced_product`, … |
| `norm_l1` | `operation_norm_l1` | `operation_reduced_norm_l1`, … |
| `norm_l2` | `operation_norm_l2` | `operation_reduced_norm_l2`, … |

**Scalar mean:**

::: code-group

```json [mean.json]
{ "dataset": "temperature", "mean": [] }
```

```toml [mean.toml]
dataset = "temperature"
mean = []
```

:::

**Partial sum along axis 0:**

::: code-group

```json [sum_axis0.json]
{ "dataset": "a", "sum": 0 }
```

```toml [sum_axis0.toml]
dataset = "a"
sum = 0
```

:::

**Named axis mean:**

::: code-group

```json [mean_time.json]
{ "dataset": "temperature", "mean": "time" }
```

```toml [mean_time.toml]
dataset = "temperature"
mean = "time"
```

:::

### NaN-aware stats

| Key | Scalar field | Notes |
|-----|--------------|-------|
| `nan_mean` | `operation_nan_mean` | Mean over finite elements only |
| `nan_std` | `operation_nan_std` | Std over finite elements only |

::: code-group

```json [nan_mean.json]
{ "dataset": "temperature", "nan_mean": [] }
```

```toml [nan_mean.toml]
dataset = "temperature"
nan_mean = []
```

:::

### QC / finiteness

| Key | Scalar field | Partial fields |
|-----|--------------|----------------|
| `nan_count` | `operation_nan_count` | `operation_reduced_nan_count`, … |
| `inf_count` | `operation_inf_count` | integers contribute 0 |
| `any_inf` | `operation_any_inf` | boolean; integers contribute false |
| `any_nan` | `operation_any_nan` | boolean |
| `all_finite` | `operation_all_finite` | boolean |
| `null_count` | `operation_null_count` | fill from query `fill` or dataset attrs |

**Null count with custom fill:**

::: code-group

```json [null_count.json]
{
  "dataset": "temperature",
  "null_count": { "fill": 99, "axis": 0 }
}
```

```toml [null_count.toml]
dataset = "temperature"

[null_count]
fill = 99
axis = 0
```

:::

### Index ops

| Key | Scalar field | Partial fields |
|-----|--------------|----------------|
| `arg_min` | `operation_argmin_index` | `operation_reduced_argmin`, … |
| `arg_max` | `operation_argmax_index` | `operation_reduced_argmax`, … |

Scalar returns a logical row-major index into the selection; partial returns index within each reduced fiber.

## Tier-C — materialize-required

Need full logical tensor order (in RAM or temp spill when over budget).

| Key | Response fields | Notes |
|-----|-----------------|-------|
| `median` | `operation_median` / `operation_reduced_median` | Scalar + partial axes |
| `quantile` | `operation_quantile` (`q` field) / `operation_reduced_quantile` | Linear blend between adjacent ranks |
| `histogram` | `operation_histogram_counts`, `operation_histogram_edges` | Partial returns counts only (flat `out_len × bins`) |
| `covariance` | `operation_covariance`, `operation_covariance_order` | Rank-2 only; `axis` = observation dimension |
| `correlation` | `operation_correlation`, `operation_correlation_order` | Rank-2 only |

**Quantile:**

::: code-group

```json [quantile.json]
{ "dataset": "a", "quantile": { "q": 0.95 } }
```

```toml [quantile_scalar.toml]
dataset = "a"

[quantile]
q = 0.95
```

:::

::: code-group

```json [quantile_axis.json]
{ "dataset": "a", "quantile": { "q": 0.5, "axis": 0 } }
```

```toml [quantile_axis.toml]
dataset = "a"

[quantile]
q = 0.5
axis = 0
```

:::

**Histogram:**

::: code-group

```json [histogram.json]
{ "dataset": "a", "histogram": { "axis": 0, "bins": 10 } }
```

```toml [histogram.toml]
dataset = "a"

[histogram]
axis = 0
bins = 10
```

:::

Fixed bin edges (scalar; both `min` and `max` required when either is set):

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

**Covariance / correlation** (2-D datasets; `axis` selects the observation dimension):

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

Result is row-major `order × order` where `order` is the variable count (the non-observation axis length).

## Transforms

Shape-preserving element-wise rewrite. **`f32` / `f64` only.**

| Method | Description |
|--------|-------------|
| `zscore` | (x − mean) / std |
| `minmax` | Scale to [0, 1] using min/max |
| `l1` | L1 normalize |
| `l2` | L2 normalize |
| `center` | Subtract mean |
| `scale` | Divide by std |
| `log1p` | log(1 + x) |
| `sqrt` | √x |
| `softmax` | Softmax along axis |

Pass-1 fold stats appear in `operation_*` / `operation_reduced_*`. Zero denominator → **NaN** with capped `transform_div_by_zero_indices` warnings.

::: code-group

```json [transform.json]
{
  "dataset": "temperature",
  "transform": { "method": "zscore", "axis": 0 },
  "write": { "target": "sidecar", "timestamp": false }
}
```

```toml [transform.toml]
dataset = "temperature"

[transform]
method = "zscore"
axis = 0

[write]
target = "sidecar"
timestamp = false
```

:::

## Spill export (not an operation key)

Use top-level `"spill"` with **no** reduction key to write the full logical selection as dtype-native little-endian bytes:

::: code-group

```json [spill.json]
{ "dataset": "temperature", "spill": "export.bin" }
```

```toml [spill.toml]
dataset = "temperature"
spill = "export.bin"
```

:::

Response includes `execution.spill_*_path` and byte counts. Preview (when enabled) is read from the spilled file.

## Preview-only (no operation, no spill)

When `-x` is set but the document has no operation or spill, the engine materializes a **capped preview** of the selection into dtype-matched arrays (`f32_preview`, `u8_preview`, …). Cap controlled by `--preview`.

::: code-group

```json [preview.json]
{
  "dataset": "temperature",
  "selection": { "start": [0, 0], "stop": [2, 3] }
}
```

```toml [preview.toml]
dataset = "temperature"

[selection]
start = [0, 0]
stop = [2, 3]
```

:::

```bash
tet query preview.toml -t data.tet -x --format table --preview 6
```

## Response field cheat sheet

After execution (`-x`), check `execution` in the response:

| Field | When present |
|-------|--------------|
| `memory_strategy` | `streaming_fold`, `capped_in_memory`, `in_memory_materialize`, `temp_spill_materialize`, `mmap_spill`, `transform_*` |
| `io_regime` | `in_core` / `out_of_core` (streaming fold) |
| `fold_parallel` / `fold_linear_scan` | Fold I/O path details |
| `device_requested` / `device_used` / `device_fallback_reason` | GPU routing (experimental) |
| `memory_budget_bytes` / `logical_selection_bytes` | Budget resolution |
| `operation_*` | Scalar aggregates (never truncated by preview cap) |
| `operation_reduced_*` / `operation_reduced_shape` | Partial-axis results |
| `transform_method` | Transform pass-1 method name |

Use `--format stats` for aggregates without chunk lists or preview arrays; `--format quiet` for scripting.

## Fixture queries

The tetration repo ships paired `.json` / `.toml` fixtures in [`fixtures/queries/`](https://github.com/Latka-Industries/tetration/tree/main/fixtures/queries) — useful golden tests and starting points.
