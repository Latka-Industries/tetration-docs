# tet ingest / publish / compact / pack / gc

Local concurrent ingest into a `.tet.d` package (writer protocol v2): ingest → publish → optional pack / gc. Publish has dry-run, opt-in replace, and clearer overlap rejects. Identical-byte overlaps are allowed; differing bytes still reject.

## Flow

```bash
tet ingest a.tet b.tet --out climate.tet.d --jobs 2
tet publish climate.tet.d
tet query '{"dataset":"temp","mean":[]}' -t climate.tet.d -x -q
tet pack climate.tet.d -o climate.tet
tet pack climate.tet.d -o climate.tet --remove-package
tet gc climate.tet.d
tet gc climate.tet.d --apply
tet gc s3://bucket/prefix --apply --protect-generation 1
tet verify climate.tet.d
```

`tet info` / `tet query -t` accept a `.tet.d` path and pin the generation named by `CURRENT` once (advancing `CURRENT` mid-process does not retarget an open reader). Same pin rule in Python (`tet.open` / `TetFile.generation`). Library: `TetPackagePin` / [store-backed reads](/rust/store-backed-reads).

## tet ingest

Stage one or more sealed `.tet` files as package parts under `staging/`.

```bash
tet ingest [OPTIONS] <INPUT.tet>... --out <PKG.tet.d>
```

| Flag / arg | Effect |
|------------|--------|
| `<INPUT.tet>…` | Each file becomes one sealed staging part |
| `--out`, `-o` | Package directory (created if missing) |
| `--jobs N` | Parallel workers (`0` = host parallelism, capped at 64) |
| `--create` | Explicit create (default already creates when absent) |
| `-q` | Quiet |

Does **not** flip `CURRENT`. Differing-byte overlapping claims are rejected at publish time; identical-byte overlaps are allowed.

## tet publish

Freeze sealed staging parts → merge into `generations/<G>/packed.tet` → set `CURRENT`.

Publish takes an exclusive claim on `publishing/<G>` (heartbeat, stale window, force-only takeover) so a second host cannot flip `CURRENT` while the lock is live. Abort a stuck lock with `tet publish --abort --generation G` (removes `publishing/<G>/` without flipping `CURRENT`; refuses the generation named by `CURRENT`).

Default remains reject-on-differing-overlap:

- Overlap rejects include part ids, dataset name, and chunk ranges.
- `--dry-run` runs claim / schema checks only (no seal, no `CURRENT` flip).
- Identical-byte claim overlaps are allowed (idempotent retry); differing bytes still reject.
- `--replace DATASET` (repeatable) allows a dtype/shape change vs sealed `CURRENT` on G+1; sealed generations stay untouched.
- Disjoint shard claims (`DatasetClaim::ranges`) can tile one dataset across parts.

```bash
tet publish [OPTIONS] <PKG.tet.d>
tet publish climate.tet.d --dry-run
tet publish climate.tet.d --replace temp
tet publish climate.tet.d --abort --generation 2
```

| Flag | Effect |
|------|--------|
| `--generation G` | Generation id (default: `CURRENT+1`, or `1`; required with `--abort`) |
| `--parts ID,…` | Explicit part-id list (default: all sealed staging parts) |
| `--dry-run` | Claim / schema checks only; do not seal or flip `CURRENT` |
| `--replace DATASET` | Allow dtype/shape change for this name vs sealed `CURRENT` (repeatable; G+1 only) |
| `--abort` | Drop a stuck `publishing/<G>/` lock (`--generation` required; refuses `CURRENT`) |
| `-q` | Quiet |

## tet compact

Alias for `tet publish`. Compact/merge of parts happens **during** publish (not a separate visibility step).

```bash
tet compact climate.tet.d
```

## tet pack

Copy a sealed generation’s `packed.tet` to a standalone `.tet` (does not change `CURRENT`).

`--remove-package` deletes the `.tet.d` only after a verified copy (size + SHA-256 + layout verify). Default keeps the package. Close any readers pinned on that package first.

```bash
tet pack [OPTIONS] <PKG.tet.d> -o <OUT.tet>
tet pack climate.tet.d -o climate.tet --remove-package
```

| Flag | Effect |
|------|--------|
| `-o`, `--out` | Destination `.tet` path |
| `--generation G` | Generation to pack (default: `CURRENT`) |
| `--remove-package` | After verified copy, delete the package tree (opt-in) |
| `-q` | Quiet |

## tet gc

Drop leftover `staging/` sessions and sealed generations older than `CURRENT` / `CURRENT-1` (writer protocol decisions D + J). **Dry-run by default.** Does not change `CURRENT`.

A local `.tet.d` uses package GC. `s3://bucket/prefix` uses `prune_store` on `S3Store` (feature `tetration-s3`, credentials `TETRATION_S3_*`, path-style). Optional `?generation=G` on the URI protects that generation.

```bash
tet gc climate.tet.d
tet gc climate.tet.d --apply
tet gc s3://bucket/prefix
tet gc s3://bucket/prefix --apply --protect-generation 1
```

| Flag / arg | Effect |
|------------|--------|
| `PKG.tet.d` | Local package root |
| `s3://bucket/prefix` | Store prune. `TETRATION_S3_ENDPOINT` is required. |
| `--apply` | Actually delete (default: print the plan only) |
| `--protect-generation G` | Repeatable. `s3://` only. Keep generation `G` when an open pin this process cannot see still needs it |
| `-q` | Quiet |

Never deletes the generation named by `CURRENT` or `CURRENT-1`. A live publish claim keeps staging.

**Pin safety (`s3://`):** `tet gc` cannot see open pins in other processes. Generations older than `CURRENT-1` are deleted unless you name them with `--protect-generation` or `?generation=G`. Local `.tet.d` gc does not take that flag; it keeps `CURRENT` and `CURRENT-1` only.

## Library

[`ingest_tet_file`](https://docs.rs/tetration/latest/tetration/catalog/fn.ingest_tet_file.html), [`publish_parts`](https://docs.rs/tetration/latest/tetration/catalog/fn.publish_parts.html) / [`publish_parts_with_options`](https://docs.rs/tetration/latest/tetration/catalog/fn.publish_parts_with_options.html), [`dry_run_publish_parts`](https://docs.rs/tetration/latest/tetration/catalog/fn.dry_run_publish_parts.html), [`TetPackage::pack_generation`](https://docs.rs/tetration/latest/tetration/catalog/struct.TetPackage.html) / [`pack_generation_with`](https://docs.rs/tetration/latest/tetration/catalog/struct.TetPackage.html), [`TetPackage::gc`](https://docs.rs/tetration/latest/tetration/catalog/struct.TetPackage.html), [`TetPackage::abort_publish`](https://docs.rs/tetration/latest/tetration/catalog/struct.TetPackage.html). Spec: [writer protocol v2](https://github.com/Latka-Industries/tetration/blob/main/docs/writer_protocol_v2.md).
