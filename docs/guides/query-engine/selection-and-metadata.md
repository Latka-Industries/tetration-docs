# Selections & metadata

The query engine resolves **selections** against catalog shape and optional **footer metadata** (`THST`). Two metadata layers enable human-friendly queries without changing the on-disk chunk layout.

Query examples below show **JSON** and **TOML** side by side.

## Selection geometry

Each axis in `selection` defines a half-open interval with optional stride:

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

| Rule | Constraint |
|------|------------|
| Bounds | `start` inclusive, `stop` exclusive |
| Step | Must be non-zero; default 1 |
| Ordering | When both set, `start < stop` |
| Rank | Must match dataset `ndim` (or use per-axis array form) |

Omit `selection` entirely to operate on the full dataset shape.

### Shorthand array form

For simple boxes, `start` and `stop` can be arrays aligned to axes:

::: code-group

```json [box.json]
{
  "dataset": "temperature",
  "selection": { "start": [0, 0], "stop": [2, 3] }
}
```

```toml [box.toml]
dataset = "temperature"

[selection]
start = [0, 0]
stop = [2, 3]
```

:::

### Striding and chunk touch policy

When any axis has `step ≠ 1`, the read plan uses **`strided_half_open`** chunk touch policy — only chunks intersecting the strided box are read. Unit-step selections use **`dense_half_open_unit_step`**.

Strided mean example:

::: code-group

```json [strided_mean.json]
{
  "dataset": "temperature",
  "selection": { "start": [0, 0], "stop": [10, 10], "step": [2, 1] },
  "mean": []
}
```

```toml [strided_mean.toml]
dataset = "temperature"
mean = []

[selection]
start = [0, 0]
stop = [10, 10]
step = [2, 1]
```

:::

## Dimension names (axis names)

Footer metadata can attach one name per axis (this is **file metadata**, JSON only in the `THST` footer):

```json
{
  "datasets": {
    "temperature": {
      "dim_names": ["time", "station"]
    }
  }
}
```

Use names instead of numeric indices in operation axes:

::: code-group

```json [named_axes.json]
{ "dataset": "temperature", "mean": "time" }
```

```toml [named_axes.toml]
dataset = "temperature"
mean = "time"
```

:::

::: code-group

```json [named_axes_multi.json]
{ "dataset": "temperature", "sum": ["time", "station"] }
```

```toml [named_axes_multi.toml]
dataset = "temperature"
sum = ["time", "station"]
```

:::

Inspect metadata:

```bash
tet info data.tet --metadata
```

**Size:** O(`ndim`) — always inline in footer attrs.

## Coordinate labels (index values)

One label per position along an axis — timestamps, station codes, variable names (footer metadata):

```json
{
  "datasets": {
    "temperature": {
      "dim_names": ["time", "station"],
      "coords": {
        "time": { "labels": ["2024-01-01", "2024-01-02", "2024-01-03"] },
        "station": { "labels": ["A", "B", "C"] }
      }
    }
  }
}
```

### Slice by label

Resolve half-open bounds by coordinate value at plan time:

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

Axis key for coords is `dim_names[d]` when present, otherwise `"0"`, `"1"`, …

**Size:** O(`shape[d]`) per labeled axis — may be large; stored in footer or referenced attrs.

## What metadata enables today

| Capability | Requires |
|------------|----------|
| `"mean": "time"` / `mean = "time"` | `dim_names` |
| Slice rows 100–200 by index | Numeric `selection` only |
| Slice by timestamp / station id | `coords` + `start_label` / `stop_label` |
| Fast lookup without scanning labels | Coords + optional index (deferred) |
| `GROUP BY station` | Coords + group-by op (deferred) |
| Join two datasets | Two queries or caller-side join (non-goal) |

**Filter-by-value** and **group-by** on coordinate labels remain deferred. Label slicing resolves labels to indices once at plan time.

## Read plan output

After planning (with `-t`), the response `read_plan` includes:

- `logical_selection_shape` — shape after selection/striding
- `chunk_count` — number of on-disk tiles touched
- `chunk_touch_policy` — `dense_half_open_unit_step` or `strided_half_open`
- `chunks[]` — per-chunk I/O rows (file offset, local slice geometry)

Decoded values are scattered into **logical row-major selection order** during materialization — not in chunk catalog order.

Plan-only inspect (either query file format):

```bash
tet query slice.toml -t data.tet --format plan
tet query slice.json -t data.tet --format plan
```

## Writing metadata

When creating `.tet` files, attach `dim_names` and `coords` via the writer session or convert pipeline so queries can use named axes and label slices. See [Catalog & datasets](/format/catalog-and-datasets) and [Rust write path](/rust/write-path).
