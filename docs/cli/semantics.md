# `tet semantics`

Declare science/media attrs in the `.tet` footer, or scaffold a caller-policy stub. Not a plugin host — attrs do not change query answers by themselves.

Guide: [Declared semantics](/guides/semantics/).

## Subcommands

| Subcommand | Effect |
| ---------- | ------ |
| `scaffold <path.tet>` | Emit `tet-semantics.toml` (default) or `--format json`. With declared attrs → real stubs; with none → catalog + doc URLs only. `-o FILE` writes instead of stdout. |
| `set <path.tet> --dataset NAME --set KEY=VAL` | Declare attrs (repeatable `--set` / `--clear KEY`). Rewrites footer metadata; appends a `semantics` history row. |

```bash
tet semantics set data.tet --dataset frames --set frame_rate=30 --set time_axis=0
tet semantics scaffold data.tet -o tet-semantics.toml
tet semantics scaffold data.tet --format json
```

Full flags: `tet semantics -h` / `tet semantics scaffold -h`.
