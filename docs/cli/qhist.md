# tet qhist

Recent `tet query` log stored in the platform cache — **not** in the `.tet` file footer.

## Usage

```bash
tet qhist [OPTIONS] [COMMAND]
```

Alias: **`tet hist`**

## Subcommands

| Subcommand | Effect |
|------------|--------|
| `list` _(default)_ | Compact table of recent queries |
| `run N` | Re-run saved row (`1` = newest in filtered view) |

## Flags

| Flag | Effect |
|------|--------|
| `--clear` | Remove the history file |
| `list --all` | Every retained row |
| `--dataset`, `--tet`, `--mode`, `--grep` | Filters on `list` |
| `--json` | Full JSON export on `list` |

`run N` honors today's `--format` / `-q`; `-t` / `-x` / `--plan` override saved values.

## Environment variables

| Variable | Effect |
|----------|--------|
| `TET_NO_QUERY_HISTORY` | Disable history recording |
| `TET_QUERY_HISTORY_FILE` | Override history file path |
| `TET_QUERY_HISTORY_MAX` | Max retained rows |

## Examples

```bash
# List recent queries
tet qhist

# Re-run newest query
tet qhist run 1

# Clear history
tet qhist --clear

# Filter by dataset
tet qhist list --dataset temperature
```

::: tip
For convert provenance stored in the `.tet` file itself, use [`tet info --history`](/cli/info).
:::
