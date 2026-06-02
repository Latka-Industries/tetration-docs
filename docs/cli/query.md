# tet query

Run a JSON or TOML query against a `.tet` file — plan only, or plan + execute.

See the [Query engine overview](/guides/query-engine/) for what operations are supported, memory strategies, and limitations.

## Usage

```bash
tet query [OPTIONS] [QUERY]
```

Alias: **`tet q`**

**QUERY**: path to `.json` / `.toml`, inline JSON/TOML, `-` for stdin, or omit to read stdin.

Format detection: file extension **`.json` / `.toml`**, else leading **`{`** → JSON, otherwise TOML.

## Key flags

| Flag | Effect |
|------|--------|
| `-t`, `--tet PATH` | Attach catalog / read plan (required for `-x`) |
| `-x`, `--execute` | Decode tiles, run operation, attach `execution` |
| `--format` | `full` (default), `json`, `stats`, `plan`, `quiet`, `table` |
| `-q`, `--quiet` | Shorthand for `--format quiet` |
| `--preview N` | Cap preview sample values when executing (default 64 for full/json, 0 for stats/plan/quiet/table) |
| `--device DEVICE` | Tier-A/B device routing (`cpu`, `auto`, `metal`, `cuda`, `cuda:N`, `rocm`, `rocm:N`, `cuda:multi`, `rocm:multi`) |
| `--spill-allow DIR` | Extra spill roots (repeatable; needs `-x` and `-t`) |

## Output formats

| `--format` | stdout |
|------------|--------|
| `full` (default) | Pretty JSON, full `QueryResponse` |
| `json` | Compact one-line JSON |
| `stats` | Slim JSON: status, aggregates — no chunk list or preview arrays |
| `plan` | Slim JSON: catalog + read_plan summary only |
| `quiet` / `-q` | One line: `dataset=… status=… op=…` + primary aggregate |
| `table` | ASCII tables: summary, plan, aggregates, optional preview |

Errors go to **stderr** with non-zero exit. See [Exit codes & errors](/cli/exit-codes).

## Query document shape

Queries are **flat** JSON or TOML. Nested `"operation"` objects are rejected.

::: code-group

```json [query.json]
{ "dataset": "temperature", "mean": [] }
```

```toml [query.toml]
dataset = "temperature"
mean = []
```

:::

Full wire format: [Query document](/guides/query-engine/document).

## Examples

```bash
# TOML file — plan + execute with quiet output
tet query mean.toml -t data.tet -x -q

# JSON file
tet query mean.json -t data.tet -x -q

# Inline JSON
tet query '{"dataset":"temperature","mean":[]}' -t data.tet -x -q

# Inline TOML
tet query 'dataset = "temperature"
mean = []' -t data.tet -x -q

# Plan only (no decode)
tet query mean.toml -t data.tet --format plan

# Table output with preview
tet query slice.toml -t data.tet -x --format table --preview 6

# Stats JSON (no chunk list)
tet query mean.toml -t data.tet -x --format stats
```

Transform with sidecar write:

::: code-group

```json [zscore.json]
{
  "dataset": "temperature",
  "transform": { "method": "zscore" },
  "write": { "target": "sidecar", "timestamp": false }
}
```

```toml [zscore.toml]
dataset = "temperature"

[transform]
method = "zscore"

[write]
target = "sidecar"
timestamp = false
```

:::

```bash
tet query zscore.toml -t data.tet -x -q
```

Export selection to binary:

::: code-group

```json [spill.json]
{ "dataset": "temperature", "spill": "slice.bin" }
```

```toml [spill.toml]
dataset = "temperature"
spill = "slice.bin"
```

:::

```bash
tet query spill.toml -t data.tet -x --format stats
```

More patterns: [Query cookbook](/guides/query-cookbook).

## Supported operations

### Tier-A/B — streaming (fast on large data)

Scalar and partial-axis: `sum`, `mean`, `min`, `max`, `count`, `var`, `std`, `product`, `norm_l1`, `norm_l2`, `nan_mean`, `nan_std`, `arg_min`, `arg_max`, `all_finite`, `any_nan`, `any_inf`, `nan_count`, `inf_count`, `null_count`.

Use `[]` for scalar over the selection; `0`, `[0, 1]`, or `"time"` / `mean = "time"` for partial axes.

### Tier-C — materialize-required

`median`, `quantile`, `histogram`, `covariance`, `correlation` — may use temp spill when selection exceeds RAM budget.

### Transforms (`f32` / `f64` only)

`zscore`, `minmax`, `l1`, `l2`, `center`, `scale`, `log1p`, `sqrt`, `softmax`.

### Export

Top-level `"spill": "path"` exports the full logical selection without a reduction key.

Full reference: [Operations](/guides/query-engine/operations).

## Transform write targets

With `-x` and `-t`:

| Target | Behavior |
|--------|----------|
| `ram` | Dense buffer in memory |
| `switch` | Route based on size (default) |
| `spill` | Write to spill path |
| `sidecar` | Publish a one-chunk `.tet` beside the source |

Sidecar default filename: `{stem}.{method}.{timestamp}.tet`. Set `"timestamp": false` for a stable name.

Details: [Execution strategies](/guides/query-engine/execution).

## GPU (experimental)

Use `--device auto` or set `execution.device` in the query document. Requires building with `tetration-metal` (macOS) or `tetration-gpu` (NVIDIA). CPU streaming fold remains the default for large selections.

Tier-A/B dense `f32`/`f16` only. `var`/`std` stay on host SIMD. See [Execution strategies — GPU](/guides/query-engine/execution#gpu-routing-experimental).

## Query history

Recent queries are stored in platform cache (not in the `.tet` file):

```bash
tet qhist list
tet qhist run 1
```

See [tet qhist](/cli/qhist).
