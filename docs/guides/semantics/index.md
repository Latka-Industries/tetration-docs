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

Lab-wide conversion graphs do **not** belong inside `packed.tet`. A package-level `SEMANTICS.json` sidecar is not defined yet.

## Layout

- Same optional **history footer** as today (`THST`). `layout_version` stays **1**. No new superblock flag.
- Dataset attrs remain string maps (`BTreeMap<String, String>`). Nested objects are not native attr values.
- Unknown attr keys are ignored (forward compatible). Readers that do not know this guide still open the file.
- Absence of every key below is valid.

**Provenance** uses existing `history` rows (`op`, `source`, `at`, optional `parents` / `params`). Prefer richer `params` (tool, version) over inventing parallel provenance attrs.

Convert may already copy source attrs (`units`, …). That is import, not a domain engine.

## Declared keys

Recommended attr names on a dataset. Values are strings; numeric rates are decimal text (e.g. `"30"`).

| Key | Meaning | Example |
| --- | ------- | ------- |
| `units` | Physical or dimensionless unit token | `"K"`, `"uV"`, `"1"` |
| `frame_rate` | Samples along `time_axis` per `frame_rate_unit` (video / imaging) | `"30"` |
| `frame_rate_unit` | Unit for `frame_rate` | `"Hz"` |
| `sample_rate` | Same idea for continuous signals | `"30000"` |
| `sample_rate_unit` | Unit for `sample_rate` | `"Hz"` |
| `time_axis` | Axis index that advances in time (decimal) | `"0"` |
| `crs` | Coordinate reference id for geo axes | `"EPSG:4326"` |
| `media_kind` | Soft label for docs/tools | `"video"`, `"timeseries"` |
| `color_space` | Soft label when pixels are color | `"sRGB"` |
| `pixel_unit` | Soft label for spatial pixel axes | `"px"` |
| `start_time` | ISO-8601 or epoch string for time origin | `"2026-10-20T15:00:00Z"` |
| `semantics_profile` | Doc profile id (not a Rust enum) | `"media_v1"` |
| `uncertainty_kind` | How uncertainty is attached | `"1sigma"` |
| `uncertainty_sibling` | Catalog name of an error / σ dataset | `"tas_err"` |
| `standard_name` | Optional CF-style name (string only) | `"air_temperature"` |

Uncertainty is two flat string keys because attrs are strings. Do not require a JSON object in one attr.

## Recommended vocabulary

Not enforced on decode. Prefer these spellings when declaring:

- **Units:** `K`, `degC`, `uV`, `mV`, `Hz`, `1`, `px`
- **CRS:** `EPSG:####` when an EPSG code exists; otherwise a short WKT or authority string
- **Profile ids:** `media_v1`, `timeseries_v1`, `climate_v1` (documentation anchors; TOML-safe bare keys)

## Caller policy

File name convention: **`tet-semantics.toml`** (JSON equivalent allowed). The crate does **not** load this file unless a helper is given an explicit path. Sample shape:

```toml
# tet-semantics.toml — outside the .tet

[profiles.media_v1]
index_to_seconds = "index / frame_rate"
seconds_to_index = "floor(seconds * frame_rate)"

[units.K]
display = "°C"
scale = 1.0
offset = -273.15

[units.Hz]
display = "Hz"
```

Policy miss or missing file → behave as today (indices and raw dtype). Map “2.5s–4s” to indices in the app **before** building a query document; query answers stay index-based.

## Cold start

A bare `.tet` with no footer metadata is valid.

1. Prefer convert / writer attrs when the source has them.
2. Else `tet semantics set` (or session helpers) to declare facts.
3. Else app-only policy without writing the file (fine for one pipeline; weak for sharing).
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

Full flag lists: `tet semantics -h`. Command table: [`tet semantics`](/cli/semantics).

## Relation to query

Declared semantics do not change chunk planning or fold answers by themselves. Cell `filter`, zone maps, and value postings are unchanged. Policy may map wall-clock or display units to indices / dtype before a query document is built; that mapping is caller-side.

## Not in scope

- Plugin / dynamic code load inside the crate
- Mandatory semantics on every file
- Full CF / PROV compliance suite
- Built-in climate or media modes / UCUM engine
- Conversion tables stored inside `packed.tet`
- Package `SEMANTICS.json` sidecar
- Required in-tree policy interpreter (this sample is enough)

## Worked examples

None of these enable a special runtime mode in the crate — they are facts and doc profile ids.

### Video / recording

Tracked fixture in the crate repo: `fixtures/small/tet/recording.tet`.

- Dataset: `frames`, shape `[6, 2, 2]`
- Attrs: `frame_rate=30`, `frame_rate_unit=Hz`, `time_axis=0`, `media_kind=video`, `semantics_profile=media_v1`
- History: a `semantics` provenance row

```bash
tet info fixtures/small/tet/recording.tet
tet semantics scaffold fixtures/small/tet/recording.tet -o tet-semantics.toml
```

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

## Related

- [`tet semantics` CLI](/cli/semantics)
- [Format versioning](/format/versioning) — history footer / layout v1
- [Query document](/guides/query-engine/document) — wire stays index-based
- Crate notes (same contract): [`docs/semantics.md`](https://github.com/Latka-Industries/tetration/blob/main/docs/semantics.md)
