# Job files (`tet run`)

Ordered stock `tet` steps in TOML or JSON. `tet run job.toml` runs them top to bottom and **stops at the first failure**.

**Not** a scheduler (no DAG, conditionals, loops, retries). **Not** query-pipeline ETL — chained transforms belong on the query [`pipeline`](/query/document) wire. Jobs only sequence whole CLI verbs.

Flags, ops, `--json`: [`tet run`](/cli/run).

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
tet run job.toml                 # relative paths resolve against the job file's directory
tet run job.toml --dry-run       # plan only
tet run job.toml --json 2>/dev/null | jq '.steps[].op'
```

Crate fixture (convert → verify → query): [`fixtures/jobs/csv_verify_query.toml`](https://github.com/Latka-Industries/tetration/blob/main/fixtures/jobs/csv_verify_query.toml).

## Python

Same engine via tet-py (no Python step DSL):

```python
import tet

report = tet.run_job("job.toml")                 # dict JobReport
plan = tet.run_job("job.toml", dry_run=True)
```

`root=` matches CLI `--root`. Failures raise `TetError` with the same messages as `tet run`.
