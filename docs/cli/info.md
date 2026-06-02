# tet info

Summarize a `.tet` file. Default output is a dataset catalog table.

## Usage

```bash
tet info [OPTIONS] <PATH>
```

## Flags

| Flag | Effect |
|------|--------|
| _(default)_ | Dataset catalog table |
| `--json` | Full pretty JSON (superblock, catalog, chunks, history) |
| `-q`, `--quiet` | One-line summary |
| `--all` | All text sections |
| `--layout` | Superblock / layout fields |
| `--execution` | Per-file execution defaults from chunk index header |
| `--datasets` | Dataset catalog table |
| `--chunks` | Chunk index table |
| `--history` | Convert / provenance footer events |
| `--metadata` | Footer `dim_names` / `coords` previews under dataset rows |
| `-n`, `--limit N` | Max chunk rows with `--chunks` or `--all` (default 32; `0` = all) |
| `--dataset`, `--grep` | Case-insensitive filters on dataset name (and dtype for `--grep`) |

## Examples

```bash
# Quick overview
tet info data.tet

# One-line summary for scripts
tet info data.tet -q

# Full JSON dump (automation, jq)
tet info data.tet --json

# Show axis metadata from footer
tet info data.tet --metadata

# Inspect chunk index (first 32 rows)
tet info data.tet --chunks

# All chunk rows
tet info data.tet --chunks -n 0

# Filter datasets by name
tet info data.tet --dataset temp
```

## Output sections

- **Layout** — magic, `layout_version`, `dataset_count`, index offsets
- **Execution** — memory budget defaults stored in the chunk index header
- **Datasets** — name, dtype tag, shape, chunk shape
- **Chunks** — dataset id, grid coords, payload offset, codec, byte lengths
- **History** — convert provenance from the `THST` footer (not the same as `tet qhist`)

::: tip
`--history` shows footer provenance events. For recent query commands, use [`tet qhist`](/cli/qhist).
:::
