# `tet run`

Run a job file — ordered stock `tet` steps, fail-fast. What it is / isn’t and a worked example: [Job files](/guides/job-files).

```bash
tet run job.toml
tet run job.toml --dry-run
tet run job.toml --root /data/run1
tet run job.toml --json > report.json   # JobReport on stdout; progress on stderr
```

| Flag | Effect |
| ---- | ------ |
| `--dry-run` | Parse, validate (including query docs), print the plan; execute nothing |
| `--root DIR` | Base for relative paths (default: the job file's parent) |
| `--json` | Pretty `JobReport` on **stdout**; progress / kv tables stay on stderr |

`s3://…` values (convert `from`, query `tet`, gc `target`) pass through untouched.

## Schema

`schema_version = 1` plus `[[step]]` / `"steps": [...]`. Each step needs `op = "…"`. Unknown keys / ops / fields are errors. JSON and TOML accept either `step` or `steps`.

**Query steps** take exactly one of `doc = "path"` or inline `query = { … }` (same document schema as `tet query`). Query history is **off** in jobs.

**`quiet` defaults (job-specific):** for `info` / `verify` / `query` only, an omitted `quiet` means quiet (one-line). `quiet = false` restores full CLI text. `json` / explicit `format` still win. Other ops default to notes on.

## Ops (closed set)

| `op` | CLI |
| ---- | --- |
| `info`, `verify`, `repair`, `query` | matching `tet` commands |
| `convert`, `export`, `index` | matching `tet` commands |
| `semantics.apply` / `scaffold` / `set` / `wizard` / `lint` / `package-write` | `tet semantics …` |
| `ingest`, `publish`, `compact`, `pack`, `gc` | matching `tet` commands |

**Not in v1:** `worker`, `qhist`, `semantics package-show`, Python / script steps.

Field names mirror CLI flags (`dry_run`, `remove_package`, …). Full per-op field list: crate [`docs/job.md`](https://github.com/Latka-Industries/tetration/blob/main/docs/job.md).

`semantics.wizard` needs a TTY (refused in pre-flight otherwise, including `--dry-run`). Library / tet-py callers leave interactive off by default.

## Execution

1. **Pre-flight** (also under `--dry-run`): schema, flag rules, load/validate every query doc, wizard rule. Failure here → no step ran.
2. **Run** in order; first error stops. Stderr: `error: step N (op) failed: …` (`N` is **1-based**); file ops append the resolved absolute path.
3. Progress on stderr: `[N/TOTAL] … ok 0.12s` (`plan` under `--dry-run`). Quiet one-liners nest as a light kv table.

Steps call the same library APIs as the CLI (no subprocess).

## `--json` / report shape

How to read `steps[].data` (Python + `jq`): [Job files — Reading the report](/guides/job-files#reading-the-report). Per-op `data` schemas: crate [`docs/job.md`](https://github.com/Latka-Industries/tetration/blob/main/docs/job.md#machine-readable-output).

Failure: exit 1. If a step completed, stdout may include those steps plus `error` (`index` **0-based**). First-step / parse / pre-flight → empty stdout. Always check the exit code.

## Bindings

- **tet-py:** `tet.run_job(...)` → same dict ([guide](/guides/job-files#python))
- **Rust:** `tetration::job::run_job_path`

Live flags: `tet run -h`.
