# Declared semantics + caller policy

Optional **declared** science and media facts live in the `.tet` footer. **Interpretation** (unit convert, seconds↔index, geo crops) lives outside the file in a caller policy. The crate is not a plugin host and has no climate- or video-special mode.

Open, verify, and query stay valid when none of these keys are present. Declared attrs do **not** change fold or query answers by themselves.

## Two layers

| Layer | Where | What |
| ----- | ----- | ---- |
| **Declared** | Footer `dim_names` + `attrs` + append-only `history` | Facts about this sealed file |
| **Interpreted** | `tet-semantics.toml` (policy tables) | What the app does with those facts |

```text
.tet dim_names / attrs / history  →  facts
tet-semantics.toml profiles/units →  policy (fold-inert)
```

The same TOML file can hold **both** declare and policy. `tet semantics apply` stamps only declare facts into the footer; formulas and `[units.*]` stay in the file.

Lab-wide conversion graphs do **not** belong inside `packed.tet`. Optional package **`SEMANTICS.json`** (declare-only, beside `packed.tet` in `generations/<G>/`) mirrors declared attrs and `dim_names` for tools — ignore-unknown; must not change fold answers. `apply` targets a **mutable** `.tet` only; a sealed `.tet.d` generation is immutable — stamp, seal a **new** generation, then `tet semantics package-write`. Do not rewrite `packed.tet` in place.

## Layout

- Same optional **history footer** (`THST`). `layout_version` stays **1**. No new superblock flag.
- Dataset attrs remain string maps. Nested objects are not native attr values.
- Unknown attr keys are ignored (forward compatible).
- Absence of every recommended key is valid.

**Provenance** uses `history` rows (`op`, `source`, `at`, optional `parents` / `params`, optional PROV-shaped `agent` / `activity` / `entity`). Prefer history over inventing parallel provenance attrs. See [`prov_log.v1`](https://github.com/Latka-Industries/tetration/blob/main/docs/semantics_profiles.md#prov_logv1).

## Declared keys

Recommended attr names on a dataset. Values are strings; TOML apply coerces number/bool → string (e.g. `frame_rate = 30` → `"30"`).

| Key | Meaning | Example |
| --- | ------- | ------- |
| `units` | Physical or dimensionless unit token | `"K"`, `"uV"`, `"1"` |
| `frame_rate` | Samples along `time_axis` per `frame_rate_unit` | `"30"` |
| `frame_rate_unit` | Unit for `frame_rate` | `"Hz"` |
| `sample_rate` | Continuous-signal rate | `"30000"` |
| `sample_rate_unit` | Unit for `sample_rate` | `"Hz"` |
| `time_axis` | Axis index that advances in time | `"0"` |
| `crs` | Coordinate reference id | `"EPSG:4326"` |
| `media_kind` | Soft label | `"video"`, `"timeseries"` |
| `color_space` | Soft label when pixels are color | `"sRGB"` |
| `pixel_unit` | Soft label for spatial axes | `"px"` |
| `start_time` | ISO-8601 or epoch string | `"2026-10-20T15:00:00Z"` |
| `semantics_profile` | Doc profile id (not a Rust enum) | `"media.v1"` |
| `uncertainty_kind` | How uncertainty is attached | `"1sigma"` |
| `uncertainty_sibling` | Catalog name of an error / σ dataset | `"tas_err"` |
| `standard_name` | Optional CF-style name | `"air_temperature"` |

Also stampable via apply: **`dim_names`** (axis names in rank order). **`coords`** are deferred this cut — apply rejects them with a clear error.

## Recommended vocabulary

Not enforced on decode. Prefer these spellings when declaring:

- **Units:** `K`, `degC`, `uV`, `mV`, `Hz`, `1`, `px`
- **CRS:** `EPSG:####` when an EPSG code exists
- **Profile ids (canonical):** `media.v1`, `timeseries.v1`, `cf_lite.v1`, `prov_log.v1`. Aliases `media_v1` / `v1.media` (same pattern for the others; `climate_v1` → `cf_lite.v1`) still normalize. Open minting: any other string is allowed (advisory lint only). Registry: crate [`semantics_profiles.md`](https://github.com/Latka-Industries/tetration/blob/main/docs/semantics_profiles.md).

## One-file `tet-semantics.toml`

File name convention: **`tet-semantics.toml`**. The crate does **not** load it unless you pass `--from`. Canonical example (crate snippets): [`media.v1.toml`](https://github.com/Latka-Industries/tetration/blob/main/docs/semantics_snippets/media.v1.toml).

```toml
schema_version = 1

[datasets.frames]
dim_names = ["t", "y", "x"]

[datasets.frames.attrs]
semantics_profile = "media.v1"
media_kind = "video"
frame_rate = 30
frame_rate_unit = "Hz"
time_axis = 0
pixel_unit = "px"

[profiles.media.v1]
index_to_seconds = "index / frame_rate"
seconds_to_index = "floor(seconds * frame_rate)"

[units.Hz]
display = "Hz"
```

**What `apply` writes into the `.tet`:** `dim_names`, attrs (including `semantics_profile`).  
**What stays in the TOML:** `[profiles.*]` formulas and `[units.*]`.  
**Merge:** present fields overwrite; omitted fields stay untouched. `--from` is never rewritten.  
**Validate:** dataset exists; `dim_names.len() == rank`; `time_axis` in range when set.

Policy miss or missing file → behave as today (indices and raw dtype). Map wall-clock or display units to indices in the app **before** building a query document.

## Cold start

A bare `.tet` with no footer metadata is valid. Prefer convert / writer attrs when the source has them; otherwise **`tet semantics apply --from tet-semantics.toml`**, or `set` for individual keys. App-only policy (no footer write) is fine for one pipeline, weak for sharing. `scaffold` / `apply --annotate` emit the combined file; missing recommended keys are `# key =` comments. With nothing declared, scaffold prints catalog lines plus doc links — **no invented config**.

## CLI

```bash
tet semantics apply clip.tet --from tet-semantics.toml
tet semantics scaffold clip.tet -o tet-semantics.toml
tet semantics apply clip.tet --from tet-semantics.toml --annotate -o annotated.toml
tet semantics set clip.tet --dataset frames --set frame_rate=30 --set time_axis=0
tet semantics lint clip.tet
tet semantics package-write package.tet.d
```

`tet info` (default table and `--json`) shows stamped `dim_names` and attrs under each dataset — never policy formulas. Full flags: `tet semantics -h`. Command table: [`tet semantics`](/cli/semantics).

## Relation to query

Declared semantics do not change chunk planning or fold answers by themselves. Cell `filter`, zone maps, and value postings are unchanged. Policy may map wall-clock or display units to indices / dtype before a query document is built; that mapping is caller-side.

## Not in scope

- Plugin / dynamic code load inside the crate
- Mandatory semantics on every file
- Full CF / PROV compliance suite
- Built-in climate or media modes / UCUM engine
- Conversion tables stored inside `packed.tet`
- Executing policy at fold / query time
- Footer-embedded formulas
- Coords via apply
- Interactive metadata wizard

## Worked examples

None of these enable a special runtime mode in the crate — they are facts and doc profile ids.

### Video / recording

Tracked fixture: `fixtures/small/tet/recording.tet` in the crate repo.

- Dataset: `frames`, shape `[6, 2, 2]`, `dim_names = ["t", "y", "x"]`
- Attrs: `frame_rate=30`, `frame_rate_unit=Hz`, `time_axis=0`, `media_kind=video`, `semantics_profile=media.v1`, `pixel_unit=px`
- History: a `semantics` provenance row

```bash
tet info fixtures/small/tet/recording.tet
tet semantics scaffold fixtures/small/tet/recording.tet -o tet-semantics.toml
# or apply the canonical snippet:
# tet semantics apply clip.tet --from docs/semantics_snippets/media.v1.toml
```

### Timeseries

```bash
tet semantics apply signal.tet --from tet-semantics.toml
# where the TOML has [datasets.signal] dim_names + attrs with timeseries.v1
# and [profiles.timeseries.v1] rate formulas using sample_rate
```

Snippet: [`timeseries.v1.toml`](https://github.com/Latka-Industries/tetration/blob/main/docs/semantics_snippets/timeseries.v1.toml).

### Climate as attrs only

```bash
tet semantics set grid.tet --dataset tas \
  --set units=K --set standard_name=air_temperature \
  --set crs=EPSG:4326 --set semantics_profile=cf_lite.v1
```

Display Kelvin as °C belongs in caller policy (`scale` / `offset`), not inside `packed.tet`. Snippet: [`cf_lite.v1.toml`](https://github.com/Latka-Industries/tetration/blob/main/docs/semantics_snippets/cf_lite.v1.toml).

## Related

- [`tet semantics` CLI](/cli/semantics)
- [Format versioning](/format/versioning) — history footer / layout v1
- [Query document](/query/document) — wire stays index-based
- Crate notes: [`docs/semantics.md`](https://github.com/Latka-Industries/tetration/blob/main/docs/semantics.md)
- Profile registry: [`docs/semantics_profiles.md`](https://github.com/Latka-Industries/tetration/blob/main/docs/semantics_profiles.md)
