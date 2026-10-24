# `tet semantics`

Declare science/media facts in the `.tet` footer: interactive wizard, one-file TOML apply/scaffold, or `set`. Not a plugin host — attrs do not change query answers by themselves.

Guide: [Declared semantics](/guides/semantics/) — including how **wizard · TOML · set** compose as one stamp process. Profile registry: crate [`semantics_profiles.md`](https://github.com/Latka-Industries/tetration/blob/main/docs/semantics_profiles.md).

## Subcommands

| Subcommand | Effect |
| ---------- | ------ |
| `wizard <path.tet>` | Interactive prompts: name dims, pick profile / attrs, confirm. Writes combined TOML (default `tet-semantics.toml` beside the `.tet`; `-o FILE`) and applies unless `--no-apply`. `--dataset NAME` skips the dataset picker when set. Mutable `.tet` only. |
| `apply <path.tet> --from FILE` | Stamp `dim_names` and attrs from one-file TOML. Prints what was stamped vs left in the TOML (profiles and units are not written). Does not rewrite `--from`. Refuses a sealed `.tet.d`. `--annotate` prints a combined TOML with live values and `# key =` comments for missing recommended attrs; `-o FILE` writes that copy and must not be `--from`. |
| `scaffold <path.tet>` | Emit combined `tet-semantics.toml` (default) or `--format json`: declare sections plus policy. Missing recommended keys are TOML comments. With none → catalog lines + doc URLs only. `-o FILE` writes instead of stdout. |
| `set <path.tet> --dataset NAME --set KEY=VAL` | Declare attrs (repeatable `--set` / `--clear KEY`). Rewrites footer metadata; appends a `semantics` history row. |
| `package-write <path.tet.d>` | Write declare-only `generations/<G>/SEMANTICS.json` from packed footer attrs and `dim_names` (default `CURRENT`; `--generation N`; `--no-manifest` skips MANIFEST stamp). Does not rewrite `packed.tet`. |
| `package-show <path.tet.d>` | Print `SEMANTICS.json` for a sealed generation (default `CURRENT`). |
| `lint <path.tet\|.tet.d>` | Advisory profile-contract lint (missing recommended attrs). Does not refuse open; exit 0 always. |

```bash
# Interactive first stamp (TOML + apply)
tet semantics wizard clip.tet
tet semantics wizard clip.tet --no-apply -o draft.toml   # draft only, then edit / apply

# Batch TOML
tet semantics scaffold clip.tet -o tet-semantics.toml
tet semantics apply clip.tet --from tet-semantics.toml
tet semantics apply clip.tet --from tet-semantics.toml --annotate -o annotated.toml

# One-off patch (no TOML update)
tet semantics set clip.tet --dataset frames --set frame_rate=30 --set time_axis=0

tet semantics lint clip.tet
tet semantics package-write package.tet.d
```

Flows (wizard → TOML → set): [How to stamp](/guides/semantics/#how-to-stamp). Fixture: `fixtures/small/tet/recording.tet`. Snippet: [`media.v1.toml`](https://github.com/Latka-Industries/tetration/blob/main/docs/semantics_snippets/media.v1.toml).

Full flags: `tet semantics -h` / `tet semantics wizard -h` / `tet semantics apply -h` / `tet semantics scaffold -h`.
