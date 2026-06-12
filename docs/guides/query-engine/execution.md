# Execution strategies

When you pass **`-x` / `--execute`**, the engine picks a **memory strategy** based on the operation tier, logical selection size, and resolved RAM budget. Strategy name appears in `execution.memory_strategy`.

Examples show **JSON** and **TOML** query documents.

## Memory budget resolution

Before decode, the engine resolves how much anonymous RAM dense paths may use:

1. Query `execution.memory_budget_bytes` (highest)
2. Per-file TIDX header `memory_budget_bytes`
3. Query `execution.memory_budget_percent` (100 = 100%)
4. Per-file TIDX `memory_budget_percent_bps` (0 = engine default **25%**)
5. **256 MiB** when host RAM cannot be probed

Host RAM is probed best-effort (Linux `MemAvailable`, macOS free+inactive). Results appear on `execution.memory_budget_bytes`, `execution.host_available_ram_bytes`, and `execution.logical_selection_bytes`.

Set budget in the query:

::: code-group

```json [budget.json]
{
  "dataset": "temperature",
  "mean": [],
  "execution": { "memory_budget_percent": 40 }
}
```

```toml [budget.toml]
dataset = "temperature"
mean = []

[execution]
memory_budget_percent = 40
```

:::

## Strategies

| Strategy | When | Behavior |
|----------|------|----------|
| **`streaming_fold`** | Tier-A/B `operation` | Single-pass fold; no full logical `Vec` |
| **`in_memory_materialize`** | Tier-C op; selection ≤ budget | Full decode into RAM |
| **`temp_spill_materialize`** | Tier-C op; selection > budget | Decode to engine temp file; deleted after op |
| **`mmap_spill`** | Top-level `"spill"` only | Full selection written dtype-native LE to caller path |
| **`transform_ram`** | Transform + `write`: `ram`/`switch`; fits budget | Pass-1 stats + pass-2 in RAM |
| **`transform_spill`** | Transform + spill or over budget | Pass-2 to caller or cache temp |
| **`transform_sidecar`** | Transform + `write`: `sidecar` | Draft `.tet` in cache → publish beside source |
| **`capped_in_memory`** | Preview only; fits budget | Bounded preview arrays, not full tensor |

When logical selection exceeds budget and neither `operation` nor spill is requested, execution fails with a validation error suggesting a higher budget, an operation, or spill output.

## Adaptive fold I/O

Tier-A/B **`streaming_fold`** picks an I/O regime by comparing logical selection bytes to ~**85%** of probed host RAM:

| Mode | When | Pattern |
|------|------|---------|
| **Parallel chunk fold** | In-core, multiple chunks | Rayon over chunks; SIMD bulk per slab |
| **Sequential chunk fold** | Single chunk, or `fold_parallel: false` | Chunks in catalog or offset order |
| **Linear scan** | Out-of-core + contiguous raw payloads | 64 MiB byte windows over one span |

Linear scan requires every touched chunk to use **raw codec 0**, abutting payloads, and total raw bytes = logical selection size. Multi-chunk converted `f32` grids often qualify; zstd or strided selections typically do not.

Response fields: `execution.io_regime` (`in_core` / `out_of_core`), `execution.fold_parallel`, `execution.fold_linear_scan`.

Force sequential visits (not linear scan):

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

## Spill paths

Spill targets come from `"spill": "path"` or `write.path` for transforms. **Relative paths** resolve against the **`.tet` parent directory**.

Default allowed roots (automatic with `-t` + `-x`):

1. Canonical `.tet` parent directory and descendants
2. Platform cache under `…/tetration/` (e.g. `~/.cache/tetration`, macOS `~/.local/cache/tetration`)

Add extra roots:

```bash
tet query spill.toml -t data.tet -x --spill-allow /scratch/jobs
```

Example beside the dataset:

::: code-group

```json [spill.json]
{ "dataset": "temperature", "spill": "slice.bin" }
```

```toml [spill.toml]
dataset = "temperature"
spill = "slice.bin"
```

:::

Sidecar drafts use cache temp paths before atomic publish beside the source via `fs_device`.

## Transforms and sidecar output

Transforms run in two passes: fold stats (pass 1), element-wise rewrite (pass 2). Output routing:

::: code-group

```json [sidecar.json]
{
  "dataset": "temperature",
  "transform": { "method": "zscore" },
  "write": { "target": "sidecar", "timestamp": false }
}
```

```toml [sidecar.toml]
dataset = "temperature"

[transform]
method = "zscore"

[write]
target = "sidecar"
timestamp = false
```

:::

| Target | Strategy | Output |
|--------|----------|--------|
| `ram` | `transform_ram` | Dense buffer; preview from RAM |
| `spill` | `transform_spill` | File at `write.path` |
| `switch` | RAM or spill by budget | Automatic |
| `sidecar` | `transform_sidecar` | One-chunk `.tet` beside source |

Sidecar filename default: `{stem}.{method}.{timestamp}.tet`. Set `"timestamp": false` / `timestamp = false` for stable names. Requires `-t` with a source `.tet` path.

Conceptually, sidecar is **persist a materialized transform as `.tet`** with engine-chosen defaults (name, metadata, publish beside source) — the same bytes could be written via `TetWriterSession`, but v1 uses a dedicated query-engine path ([THI-61](https://linear.app/thicclatka/issue/THI-61) tracks unification).

## GPU routing (experimental)

Optional tier-A/B acceleration for dense **`f32`** / **`f16`** (promoted to `f32` on device):

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
tet query gpu.toml -t data.tet -x --device auto
```

| Token | Behavior |
|-------|----------|
| `cpu` | Always host streaming fold |
| `auto` | Metal (macOS) or CUDA device 0 when built; skips GPU below 64 MiB |
| `metal` | Apple GPU when `tetration-metal` feature enabled |
| `cuda` / `cuda:N` | NVIDIA when `tetration-gpu` enabled |
| `cuda:multi` / `rocm:multi` | Shard chunks across visible devices |

CLI **`--device`** overrides `execution.device`.

Build features:

```bash
cargo build --release --features tetration-metal   # macOS
cargo build --release --features tetration-gpu     # NVIDIA
```

**CPU streaming fold remains the default** for large selections. GPU does not accelerate tier-C ops, partial-axis fold on `f16`, or dtypes other than `f32`/`f16`. **`var` / `std`** use host SIMD even when GPU is routed (numerical stability).

Fallback reasons appear in `execution.device_fallback_reason` (`gpu_feature_disabled`, `auto_below_size_threshold`, `gpu_unsupported_op`, …).

## Embedder dense export

Rust embedders needing a **full logical tensor** (not capped preview arrays):

| API | Use |
|-----|-----|
| `plan_read_for_document` | Planning only |
| `materialize_query_selection` | Selection-only dense buffer (all wire dtypes) |
| `materialize_query_transform_ram` | Transform + `write: ram` (`f32`/`f64`) |

These bypass the JSON preview cap but still require RAM sized to the logical selection. Sidecar publish uses `execute_query_json` / `tet query -x`.

Rust parse helpers accept both wire formats:

```rust
let doc = parse_query_json(r#"{"dataset":"temperature","mean":[]}"#)?;
let doc = parse_query_toml("dataset = \"temperature\"\nmean = []")?;
```

## Performance expectations

Tier-A/B scalar ops read every payload byte once. Wall time is dominated by page cache / disk bandwidth when out-of-core, or memory bandwidth + cores when in-core.

On a ~20 GiB `f32` fixture with warm page cache and sufficient RAM, full-tensor **mean** can complete in ~0.5–0.6 s (in-core parallel fold). On a memory-constrained host, out-of-core linear scan is ~3–4 s for the same op.

Check response fields after `-x`:

```bash
tet query mean.toml -t big.tet -x --format stats
tet query mean.json -t big.tet -x --format stats
# execution.memory_strategy: "streaming_fold"
# execution.io_regime: "in_core" | "out_of_core"
# execution.fold_parallel: true | false
```
