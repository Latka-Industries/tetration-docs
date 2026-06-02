# tet verify & repair

Check and repair `.tet` file integrity.

## tet verify

Verify layout, catalog, chunk index, payloads, and footer.

```bash
tet verify [OPTIONS] <PATH>
```

| Flag | Effect |
|------|--------|
| _(default)_ | Human-readable check list + summary (decodes up to **128** chunks on large files) |
| `--deep` | Decode **every** chunk payload |
| `--repair` | After verify, apply safe in-place repairs |
| `--json` | Pretty JSON report (automation / CI) |
| `-q`, `--quiet` | One line (`status=ok` / `failed`) |

**Exit code 1** when verification fails (CI-friendly).

### Examples

```bash
# Quick scan
tet verify data.tet

# Full decode (large files)
tet verify --deep data.tet -q

# JSON report for CI
tet verify data.tet --json

# Verify and auto-repair
tet verify data.tet --repair
```

### What verify checks

- Superblock magic and version fields
- Dataset directory structure and record counts
- Chunk index header and entry bounds
- Payload offsets and byte lengths
- Optional decode integrity (sample or full with `--deep`)
- Dataset tensor-byte cross-check
- Footer/metadata limits when `THST` flag is set

## tet repair

Plan or apply safe in-place fixes from verify recommendations.

```bash
tet repair [OPTIONS] <PATH>
```

| Flag | Effect |
|------|--------|
| _(default)_ | Plan from verify recommendations (no writes) |
| `--apply CODE` | Apply fix (repeatable); today: `footer_invalid` |
| `--dry-run` | With `--apply`, show changes without writing |
| `--json` | Pretty JSON plan or repair report |

### Examples

```bash
# Show repair plan
tet repair data.tet

# Apply footer fix
tet repair data.tet --apply footer_invalid

# Dry run
tet repair data.tet --apply footer_invalid --dry-run
```

Currently supported repair: **`footer_invalid`** — truncate after chunk payloads when the `THST` JSON is corrupt.

In Rust: [`verify_tet_file`](https://docs.rs/tetration/latest/tetration/verify/fn.verify_tet_file.html), [`repair_tet_file`](https://docs.rs/tetration/latest/tetration/repair/fn.repair_tet_file.html).
