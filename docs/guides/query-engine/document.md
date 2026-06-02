# Query document

Query documents are **flat** JSON or TOML profiles. The wire format accepts exactly **one** top-level operation key per document. Nested `"operation": { … }` and `"output": { … }` objects are **rejected** at parse time.

TOML is converted to a JSON value tree, then the same wire parser runs — both formats are first-class.

## Required field

| Field | JSON | TOML |
|-------|------|------|
| `dataset` | `"dataset": "temperature"` | `dataset = "temperature"` |

Must name a dataset in the `.tet` catalog; non-empty.

## Operation keys (pick one)

Use any single key from the [operations reference](/guides/query-engine/operations).

| Meaning | JSON | TOML |
|---------|------|------|
| Scalar mean | `"mean": []` | `mean = []` |
| Mean along axis 0 | `"mean": 0` | `mean = 0` |
| Partial over axes 0 and 1 | `"sum": [0, 1]` | `sum = [0, 1]` |
| Mean along named axis | `"mean": "time"` | `mean = "time"` |
| 95th percentile on axis 0 | `"quantile": { "q": 0.95, "axis": 0 }` | `[quantile]` / `q = 0.95` / `axis = 0` |
| Histogram | `"histogram": { "bins": 10, "axis": 0 }` | `[histogram]` / `bins = 10` / `axis = 0` |
| Transform | `"transform": { "method": "zscore" }` | `[transform]` / `method = "zscore"` |
| Spill export | `"spill": "slice.bin"` | `spill = "slice.bin"` |

Parametric ops (`quantile`, `histogram`, `transform`, `null_count`, …) use inline JSON objects or TOML inline/subtables.

## Selection

Optional half-open box per axis. Omitted selection means the full dataset shape.

::: code-group

```json [selection.json]
{
  "dataset": "temperature",
  "selection": [
    { "start": 0, "stop": 100, "step": 2 },
    { "start": 0, "stop": 3 }
  ],
  "mean": []
}
```

```toml [selection.toml]
dataset = "temperature"
mean = []

[[selection]]
start = 0
stop = 100
step = 2

[[selection]]
start = 0
stop = 3
```

:::

| Field | Notes |
|-------|-------|
| `start` | Inclusive lower bound (default 0) |
| `stop` | Exclusive upper bound (default axis length) |
| `step` | Stride; must be non-zero (default 1) |
| `start_label` / `stop_label` | Resolve to indices via footer `coords` |

Shorthand box form:

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

See [Selections & metadata](/guides/query-engine/selection-and-metadata) for dimension names, coordinate labels, and striding behavior.

## Execution hints

Optional `"execution"` object controls memory and I/O:

::: code-group

```json [execution.json]
{
  "dataset": "temperature",
  "mean": [],
  "execution": {
    "memory_budget_percent": 40,
    "fold_parallel": false,
    "device": "auto"
  }
}
```

```toml [execution.toml]
dataset = "temperature"
mean = []

[execution]
memory_budget_percent = 40
fold_parallel = false
device = "auto"
```

:::

| Field | Effect |
|-------|--------|
| `memory_budget_bytes` | Hard cap on anonymous RAM for dense paths (highest precedence) |
| `memory_budget_percent` | Percent of host RAM (100 = 100%; stored as basis points internally) |
| `fold_parallel` | `false` forces sequential chunk visits; does not enable linear scan |
| `device` | `cpu`, `auto`, `metal`, `cuda`, `cuda:N`, `rocm`, `cuda:multi`, … (needs `-x`) |

Precedence for memory budget: query `memory_budget_bytes` → per-file TIDX header → query `memory_budget_percent` → TIDX percent → **256 MiB** fallback.

CLI **`--device`** overrides `execution.device`. CLI **`-t`** supplies the `.tet` path — there is no `.tet` path field inside the query document.

## Transform output routing

When using `"transform"`, optional `"write"` controls where pass-2 output goes:

::: code-group

```json [transform_write.json]
{
  "dataset": "temperature",
  "transform": { "method": "zscore", "axis": 0 },
  "write": { "target": "sidecar", "timestamp": false }
}
```

```toml [transform_write.toml]
dataset = "temperature"

[transform]
method = "zscore"
axis = 0

[write]
target = "sidecar"
timestamp = false
```

:::

| Target | Behavior |
|--------|----------|
| `switch` (default) | RAM when selection fits budget; spill otherwise |
| `ram` | Dense buffer in memory |
| `spill` | Write to caller path (`write.path` or top-level spill semantics) |
| `sidecar` | Publish a one-chunk `.tet` beside the source file |

Sidecar auto filename: `{stem}.{method}[.{timestamp}].tet`. Catalog dataset name: `{source}-{method}` (e.g. `temperature-zscore`).

`write` is mutually exclusive with top-level `"spill"`.

## Spill export (no operation)

Export the full logical selection without a reduction key:

::: code-group

```json [spill.json]
{
  "dataset": "temperature",
  "spill": "slice.bin"
}
```

```toml [spill.toml]
dataset = "temperature"
spill = "slice.bin"
```

:::

Relative paths resolve against the **`.tet` file's directory**, not the shell cwd. Paths must lie under the spill allowlist (see [Execution strategies](/guides/query-engine/execution)).

## Input format detection

| Source | Detection |
|--------|-----------|
| File `.json` / `.toml` | Extension |
| Inline or stdin | Leading `{` → JSON; otherwise TOML |
| `-` or omitted QUERY | Read stdin |

```bash
# TOML file
tet query mean.toml -t data.tet -x -q

# Inline JSON
tet query '{"dataset":"temperature","mean":[]}' -t data.tet -x -q

# Inline TOML (no leading brace)
tet query 'dataset = "temperature"
mean = []' -t data.tet -x -q

# Stdin TOML
echo 'dataset = "temperature"
mean = []' | tet query - -t data.tet -x -q
```

## Validation limits

Untrusted input is bounded:

- Payload size ≤ **1 MiB**
- JSON nesting depth ≤ **64**
- Unknown top-level fields rejected (`deny_unknown_fields`)
- `selection` rank and `operation.axes` count ≤ **8** (`MAX_NDIM`)
- Axis tokens: non-negative decimal indices or dimension names — not arbitrary expressions

Treat echoed `dataset` names and axis labels as untrusted display data in logs and UIs.

## TOML patterns for nested wire shapes

| Wire shape | TOML |
|------------|------|
| Scalar op | `mean = []` |
| Single axis index | `mean = 0` |
| Multiple axes | `sum = [0, 1]` |
| Named axis | `mean = "time"` |
| Parametric op | `[quantile]` subtable with fields |
| Per-axis selection | `[[selection]]` array-of-tables |
| Box selection | `[selection]` with `start = […]`, `stop = […]` |
| Execution block | `[execution]` subtable |

**Not supported in either format:** nested `"operation"` / `"output"` objects.
