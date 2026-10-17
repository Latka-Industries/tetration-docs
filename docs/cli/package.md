# tet ingest / publish / compact / pack

Local concurrent ingest into a `.tet.d` package (writer protocol v2).

## Flow

```bash
tet ingest a.tet b.tet --out climate.tet.d --jobs 2
tet publish climate.tet.d
tet query '{"dataset":"temp","mean":[]}' -t climate.tet.d -x -q
tet pack climate.tet.d -o climate.tet
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

```bash
tet publish [OPTIONS] <PKG.tet.d>
```

| Flag | Effect |
|------|--------|
| `--generation G` | Generation id (default: `CURRENT+1`, or `1`) |
| `--parts ID,…` | Explicit part-id list (default: all sealed staging parts) |
| `-q` | Quiet |

## tet compact

Alias for `tet publish`. Compact/merge of parts happens **during** publish (not a separate visibility step).

```bash
tet compact climate.tet.d
```

## tet pack

Copy a sealed generation’s `packed.tet` to a standalone `.tet` (does not change `CURRENT`).

```bash
tet pack [OPTIONS] <PKG.tet.d> -o <OUT.tet>
```

| Flag | Effect |
|------|--------|
| `-o`, `--out` | Destination `.tet` path |
| `--generation G` | Generation to pack (default: `CURRENT`) |
| `-q` | Quiet |

## Library

[`ingest_tet_file`](https://docs.rs/tetration/latest/tetration/catalog/fn.ingest_tet_file.html), [`publish_parts`](https://docs.rs/tetration/latest/tetration/catalog/fn.publish_parts.html), [`TetPackage::pack_generation`](https://docs.rs/tetration/latest/tetration/catalog/struct.TetPackage.html). Spec: [writer protocol v2](https://github.com/Latka-Industries/tetration/blob/main/docs/writer_protocol_v2.md).
