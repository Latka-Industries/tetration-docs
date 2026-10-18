# tet verify & repair

Check and repair `.tet` file integrity, or a `.tet.d` package (writer protocol v2).

## tet verify

Verify layout, catalog, chunk index, payloads, and footer — or package PROTOCOL / CURRENT / generations.

```bash
tet verify [OPTIONS] <PATH>
```

`PATH` may be a standalone `.tet` **or** a `.tet.d` directory (detected via `PROTOCOL`).

| Flag | Effect |
|------|--------|
| _(default)_ | Human-readable check list + summary (decodes up to **128** chunks on large files) |
| `--deep` | Decode **every** chunk payload (also applies to each sealed `packed.tet`) |
| `--repair` | After verify, apply safe in-place repairs |
| `--json` | Pretty JSON report (automation / CI) |
| `-q`, `--quiet` | One line (`status=ok` / `failed`) |

**Exit code 1** when verification fails (CI-friendly).

### Examples

```bash
# Quick scan
tet verify data.tet

# Package (protocol + CURRENT + MANIFEST + packed.tet)
tet verify climate.tet.d

# Full decode (large files)
tet verify --deep data.tet -q

# JSON report for CI
tet verify data.tet --json

# Verify and auto-repair
tet verify data.tet --repair
```

### What verify checks (`.tet`)

- Superblock magic and version fields
- Dataset directory structure and record counts
- Chunk index header and entry bounds
- Payload offsets, duplicate chunk coords, and byte lengths
- Optional decode integrity (sample or full with `--deep`)
- Dataset tensor-byte cross-check
- Footer/metadata limits when `THST` flag is set

### What verify checks (`.tet.d`)

- `PROTOCOL` present and `protocol_version == 2`
- `CURRENT` → `generations/<G>/packed.tet` + `MANIFEST.json`
- Manifest generation id, byte length, and SHA-256 vs `packed.tet`
- Layout-v1 verify on each sealed `packed.tet` (same rules as a standalone file)
- Incomplete / stale `publishing/<G>/` locks (**warn**; abort with `tet publish --abort`, or repair can quarantine)
- Orphan `staging/` sessions (**warn**; allowed after publish; optional `tet gc --apply`)

Missing staging parts after a sealed publish are **OK** when `packed.tet` verifies. Optional cleanup of leftover staging and generations older than `CURRENT` / `CURRENT-1` is `tet gc` (0.3.6; dry-run by default).

### Package finding `check` names

JSON reports (`tet verify --json`) use these `findings[].check` strings:

| `check` | Severity | Typical cause |
| ------- | -------- | ------------- |
| `protocol` | Error | Missing / bad `PROTOCOL` or `protocol_version ≠ 2` |
| `current` | Error | Unparseable `CURRENT`, or absent while sealed generations exist |
| `current_packed` / `generation_packed` | Error | Missing `packed.tet` for that generation |
| `current_manifest` / `generation_manifest` | Error | Missing / unreadable `MANIFEST.json` |
| `manifest_generation` / `manifest_protocol` | Error | MANIFEST id or protocol mismatch |
| `manifest_byte_len` / `manifest_sha256` | Error | Length or SHA-256 mismatch vs `packed.tet` |
| `packed_layout` | Error | Sealed image failed layout-v1 verify |
| `chunk_coords` | Error | Duplicate chunk coordinates inside `packed.tet` |
| `publishing_incomplete` | Warn | Live publish lock (prior `CURRENT` still valid) — `tet publish --abort --generation G` |
| `publishing_stale` | Warn | Stale lock — repair with `quarantine_publish` |
| `publishing` / `staging` / `generations` | Warn / Ok | Quarantine leftovers, orphan staging (`tet gc --apply`), odd dir names |

## tet repair

Plan or apply safe in-place fixes from verify recommendations.

```bash
tet repair [OPTIONS] <PATH>
```

| Flag | Effect |
|------|--------|
| _(default)_ | Plan from verify recommendations (no writes) |
| `--apply CODE` | Apply fix (repeatable): `footer_invalid`, `quarantine_publish` |
| `--dry-run` | With `--apply`, show changes without writing |
| `--json` | Pretty JSON plan or repair report |

### Examples

```bash
# Show repair plan
tet repair data.tet

# Apply footer fix
tet repair data.tet --apply footer_invalid

# Quarantine stale package publish locks
tet repair climate.tet.d --apply quarantine_publish

# Dry run
tet repair data.tet --apply footer_invalid --dry-run
```

Supported repairs:

- **`footer_invalid`** — truncate after chunk payloads when the `THST` JSON is corrupt
- **`quarantine_publish`** — rename aside stale `publishing/<G>/` locks on a `.tet.d` package

In Rust: [`verify_tet_file`](https://docs.rs/tetration/latest/tetration/verify/fn.verify_tet_file.html), [`verify_tet_package`](https://docs.rs/tetration/latest/tetration/verify/fn.verify_tet_package.html), [`repair_tet_file`](https://docs.rs/tetration/latest/tetration/repair/fn.repair_tet_file.html).
