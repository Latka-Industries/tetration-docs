# Trust boundaries

How to run tetration safely when query/job documents or `.tet` bytes come from outside your trust boundary. The crate is an **embeddable library** — auth, rate limits, and tenancy belong in your host, not inside tetration / tet-py.

Field-level threat model and wire limits: [crate JSON security](https://github.com/Latka-Industries/tetration/blob/main/docs/query_engine.md#json-security-input-and-output). Job-file notes: [crate job.md](https://github.com/Latka-Industries/tetration/blob/main/docs/job.md#trust-boundaries-jobs) · site [job files](/guides/job-files).

## Checklist

| Rule | Practice |
| ---- | -------- |
| **Verify before open** when bytes are external | Run `tet verify` (or a job `verify` step) before query/index on untrusted ingest. Advisory in trusted pipelines; not mandatory on every `open`. |
| **Host owns `.tet` / package paths** | Paths come from CLI flags, API args, or the job file **you** chose — never invent a store path from nested query-document fields alone. |
| **Spill allowlist; don’t widen casually** | `--spill-allow` / job `spill_allow` / `SpillPathAllowlist`. Keep default roots tight. |
| **Query/job JSON is data** | No shell, SQL, or path construction by concatenating raw document fields. |
| **Response labels are display text** | Dataset / axis names in responses are untrusted for HTML, logs, or `eval`. |
| **HTTP wrappers live outside the crate** | Auth, rate limits, body size caps, and dataset allowlists belong in your service. |

## Verify-then-query

Prefer `verify` before `query` on convert/ingest paths:

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
query = { dataset = "temp", mean = [] }
```

```bash
tet run job.toml
# or
tet convert raw/table.csv work/table.tet
tet verify work/table.tet
tet query '{"dataset":"temp","mean":[]}' -t work/table.tet -x -q
```

Same shape via `tet.run_job("job.toml")`. Fixture: [`csv_verify_query.toml`](https://github.com/Latka-Industries/tetration/blob/main/fixtures/jobs/csv_verify_query.toml).

## What this is not

- Not a multi-tenant auth product inside the library
- Not mandatory verify on every open
- Not full executor / `tet run` fuzz (parse/validate only for jobs)

Current line: tetration / tet-py **0.8.3**.
