# tet ingest / publish / compact / pack / gc

Local concurrent ingest into a `.tet.d` package (writer protocol v2). **0.3.6** adds optional cleanup the protocol already allowed: `pack --remove-package`, `publish --abort`, and `tet gc`.

## Flow

```bash
tet ingest a.tet b.tet --out climate.tet.d --jobs 2
tet publish climate.tet.d
tet query '{"dataset":"temp","mean":[]}' -t climate.tet.d -x -q
tet pack climate.tet.d -o climate.tet
tet pack climate.tet.d -o climate.tet --remove-package
tet gc climate.tet.d
tet gc climate.tet.d --apply
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

Does **not** flip `CURRENT`. Overlapping dataset claims are rejected at publish time.

## tet publish

Freeze sealed staging parts → merge into `generations/<G>/packed.tet` → set `CURRENT`.

**0.3.2** takes an exclusive claim on `publishing/<G>` (heartbeat, stale window, force-only takeover) so a second host cannot flip `CURRENT` while the lock is live.

**0.3.6** exposes abort for a stuck lock: `tet publish --abort --generation G` removes `publishing/<G>/` without flipping `CURRENT`. Refuses the generation named by `CURRENT`.

```bash
tet publish [OPTIONS] <PKG.tet.d>
tet publish climate.tet.d --abort --generation 2
```

| Flag | Effect |
|------|--------|
| `--generation G` | Generation id (default: `CURRENT+1`, or `1`; required with `--abort`) |
| `--parts ID,…` | Explicit part-id list (default: all sealed staging parts) |
| `--abort` | Drop a stuck `publishing/<G>/` lock (`--generation` required; refuses `CURRENT`) |
| `-q` | Quiet |

## tet compact

Alias for `tet publish`. Compact/merge of parts happens **during** publish (not a separate visibility step).

```bash
tet compact climate.tet.d
```

## tet pack

Copy a sealed generation’s `packed.tet` to a standalone `.tet` (does not change `CURRENT`).

**0.3.6:** `--remove-package` deletes the `.tet.d` only after a verified copy (size + SHA-256 + layout verify). Default keeps the package. Close any readers pinned on that package first.

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

**0.3.6.** Drop leftover `staging/` sessions and sealed generations older than `CURRENT` / `CURRENT-1` (writer protocol decisions D + J). **Dry-run by default.** Local `.tet.d` only — not S3 prune.

```bash
tet gc climate.tet.d
tet gc climate.tet.d --apply
```

| Flag / arg | Effect |
|------------|--------|
| `PKG.tet.d` | Package root |
| `--apply` | Actually delete (default: print the plan only) |
| `-q` | Quiet |

Never deletes the generation named by `CURRENT` or `CURRENT-1`.

## Library

[`ingest_tet_file`](https://docs.rs/tetration/latest/tetration/catalog/fn.ingest_tet_file.html), [`publish_parts`](https://docs.rs/tetration/latest/tetration/catalog/fn.publish_parts.html), [`TetPackage::pack_generation`](https://docs.rs/tetration/latest/tetration/catalog/struct.TetPackage.html) / [`pack_generation_with`](https://docs.rs/tetration/latest/tetration/catalog/struct.TetPackage.html), [`TetPackage::gc`](https://docs.rs/tetration/latest/tetration/catalog/struct.TetPackage.html), [`TetPackage::abort_publish`](https://docs.rs/tetration/latest/tetration/catalog/struct.TetPackage.html). Spec: [writer protocol v2](https://github.com/Latka-Industries/tetration/blob/main/docs/writer_protocol_v2.md).
