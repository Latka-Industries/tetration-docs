# Job files (`tet run`)

Ordered stock `tet` steps in TOML or JSON. Run them with `tet run` or `tet.run_job` — same Rust engine, fail-fast.

**Not** a scheduler (no DAG, conditionals, loops, retries). **Not** query-pipeline ETL — chained transforms belong on the query [`pipeline`](/query/document) wire.

CLI flags and the closed op set: [`tet run`](/cli/run).

## Worked example

```toml
schema_version = 1

[[step]]
op = "convert"
from = "raw/table.csv"
to = "work/table.tet"

[[step]]
op = "verify"
path = "work/table.tet"

[[step]]
op = "query"
tet = "work/table.tet"
execute = true
query = { dataset = "a", mean = [] }
```

```bash
mkdir -p raw work
printf 'a,b\n1,2\n3,4\n' > raw/table.csv
tet run job.toml
tet run job.toml --json 2>/dev/null | jq '.steps[] | {op, data}'
```

Crate fixture: [`fixtures/jobs/csv_verify_query.toml`](https://github.com/Latka-Industries/tetration/blob/main/fixtures/jobs/csv_verify_query.toml).

## Reading the report

Both `tet run --json` (stdout) and `tet.run_job` return the same **`JobReport`** shape:

| Key | Meaning |
| --- | ------- |
| `dry_run` | `true` if nothing was executed |
| `root` | Directory used for relative paths |
| `elapsed_secs` | Wall clock (success); sum of finished steps on a CLI partial failure |
| `steps` | One entry per **completed** (or planned) step |

Each step:

| Key | Meaning |
| --- | ------- |
| `index` | 0-based |
| `op` | e.g. `"convert"` |
| `status` | `"ok"` or `"planned"` (`--dry-run` / `dry_run=True`) |
| `description` | One-line plan with resolved paths |
| `elapsed_secs` | That step only |
| `stdout` / `note` | Human text the CLI would print — optional |
| **`data`** | Structured result — use this, not `stdout` |

Under dry-run, every `data` is `null`. On success there is no top-level `ok` / `error` key — absence of an exception (Python) or exit 0 (CLI) means the job finished.

### Python

```python
import tet

report = tet.run_job("job.toml")
print(report["root"], report["elapsed_secs"])

# Index into steps
convert = report["steps"][0]["data"]
print(convert["dataset_count"], convert["dataset_names"])   # 2, ["a", "b"]
print(convert["output"])                                    # …/work/table.tet

verify = report["steps"][1]["data"]
assert verify["ok"] is True

query = report["steps"][2]["data"]
# QueryResponse — same shape as f.execute(..., raw=True)
print(query["status"], query.get("operation"))

# Or key by op (last wins if an op repeats)
by_op = {s["op"]: s["data"] for s in report["steps"]}
by_op["verify"]["summary"]["dataset_count"]

plan = tet.run_job("job.toml", dry_run=True)
assert all(s["data"] is None for s in plan["steps"])
```

`root=` matches CLI `--root`. Failures raise `TetError` (same messages as `tet run`); there is no partial `error` object in the Python return — the exception is the failure signal.

### CLI (`--json`)

```bash
tet run job.toml --json 2>/dev/null | jq '
  .steps[] | select(.op=="convert") | .data.dataset_names
'
```

Mid-job failure (exit 1): stdout may still hold completed steps plus `"error": { "index", "op", "message", "path" }` (`index` is 0-based). First-step / parse failures print nothing on stdout — check the exit code.

### What lives in `data`

Depends on `op`. For the example above: convert → `ConvertReport` (`dataset_count`, `datasets`, `output`, …); verify → `TetVerifyReport` (`ok`, `findings`, `summary`); query → `QueryResponse`. Full map: crate [`docs/job.md` — Machine-readable output](https://github.com/Latka-Industries/tetration/blob/main/docs/job.md#machine-readable-output).
