# Declared semantics + caller policy

Optional **declared** science and media facts live in the `.tet` footer. **Interpretation** (unit convert, seconds↔index, geo crops) lives outside the file in a caller policy. The crate is not a plugin host and has no climate- or video-special mode.

Open, verify, and query stay valid when none of these keys are present. Declared attrs do **not** change fold or query answers by themselves.

## Two layers

| Layer | Where | What |
| ----- | ----- | ---- |
| **Declared** | Footer `metadata.datasets[<name>].attrs` + append-only `history` | Facts about this sealed file |
| **Interpreted** | `tet-semantics.toml` or `tet-semantics.json` beside the app | What the app does with those facts |

```text
.tet attrs/history  →  facts (units, frame_rate, crs, …)
tet-semantics.toml  →  policy (display °C, index↔seconds, …)
```

## Cold start

1. Prefer convert / writer attrs when the source has them.
2. Else `tet semantics set` (or session helpers) to declare facts.
3. Else app-only policy without writing the file.
4. Re-run `tet semantics scaffold` after declarations to get real stubs.

When no declared attrs exist, scaffold prints catalog lines plus doc links — **no invented commented config**.

## CLI

```bash
# Declare facts (rewrites footer metadata; appends a semantics history row)
tet semantics set data.tet --dataset frames \
  --set frame_rate=30 --set time_axis=0 --set media_kind=video

# Emit caller-policy stubs (toml default; or --format json / -o FILE)
tet semantics scaffold data.tet -o tet-semantics.toml
```

Full flag lists: `tet semantics -h`. Crate CLI table: [CLI reference](/cli/).

## Recommended declared keys

String attrs only (examples): `units`, `frame_rate` / `sample_rate` (+ `*_unit`), `time_axis`, `crs`, `media_kind`, `semantics_profile`, `uncertainty_kind` / `uncertainty_sibling`, `standard_name`.

Normative list and invariants: [crate `docs/semantics.md`](https://github.com/Latka-Industries/tetration/blob/main/docs/semantics.md).

## Worked examples

See [Semantics examples](/guides/semantics/examples) — video/recording fixture, timeseries, and climate-as-attrs-only.
