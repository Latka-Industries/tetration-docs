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

None of these enable a special runtime mode in the crate — they are facts and doc profile ids.

### Video / recording

Tracked fixture in the crate repo: `fixtures/small/tet/recording.tet`.

- Dataset: `frames`, shape `[6, 2, 2]`
- Attrs: `frame_rate=30`, `frame_rate_unit=Hz`, `time_axis=0`, `media_kind=video`, `semantics_profile=media_v1`
- History: a `semantics` provenance row

```bash
tet info fixtures/small/tet/recording.tet
tet semantics scaffold fixtures/small/tet/recording.tet
```

Sample policy stub (caller-side; crate does not load this by default):

```toml
[profiles.media_v1]
index_to_seconds = "index / frame_rate"
seconds_to_index = "floor(seconds * frame_rate)"

[units.Hz]
display = "Hz"
```

Map “2.5s–4s” to indices in the app **before** building a query document. Query answers stay index-based.

### Timeseries

```bash
tet semantics set signal.tet --dataset voltage \
  --set sample_rate=30000 --set sample_rate_unit=Hz \
  --set time_axis=0 --set media_kind=timeseries \
  --set units=uV --set semantics_profile=timeseries_v1

tet semantics scaffold signal.tet -o tet-semantics.toml
```

### Climate as attrs only

Declare CF-style strings and a doc profile id. There is **no** climate engine:

```bash
tet semantics set grid.tet --dataset tas \
  --set units=K --set standard_name=air_temperature \
  --set crs=EPSG:4326 --set semantics_profile=climate_v1
```

Display Kelvin as °C belongs in caller policy (`scale` / `offset`), not inside `packed.tet`.
