# Semantics examples

Worked patterns for declared attrs + caller policy. None of these enable a special runtime mode in the crate — they are facts and doc profile ids.

## Video / recording

Tracked fixture in the crate repo: `fixtures/small/tet/recording.tet`.

- Dataset: `frames`, shape `[6, 2, 2]`
- Attrs: `frame_rate=30`, `frame_rate_unit=Hz`, `time_axis=0`, `media_kind=video`, `semantics_profile=tetration.media.v1`
- History: a `semantics` provenance row

```bash
tet info fixtures/small/tet/recording.tet
tet semantics scaffold fixtures/small/tet/recording.tet
```

Sample policy stub (caller-side; crate does not load this by default):

```toml
[profiles."tetration.media.v1"]
index_to_seconds = "index / frame_rate"
seconds_to_index = "floor(seconds * frame_rate)"

[units.Hz]
display = "Hz"
```

Map “2.5s–4s” to indices in the app **before** building a query document. Query answers stay index-based.

## Timeseries

```bash
tet semantics set signal.tet --dataset voltage \
  --set sample_rate=30000 --set sample_rate_unit=Hz \
  --set time_axis=0 --set media_kind=timeseries \
  --set units=uV --set semantics_profile=tetration.timeseries.v1

tet semantics scaffold signal.tet -o tet-semantics.toml
```

## Climate as attrs only

Declare CF-style strings and a doc profile id. There is **no** climate engine:

```bash
tet semantics set grid.tet --dataset tas \
  --set units=K --set standard_name=air_temperature \
  --set crs=EPSG:4326 --set semantics_profile=tetration.climate.v1
```

Display Kelvin as °C belongs in caller policy (`scale` / `offset`), not inside `packed.tet`.

## See also

- [Semantics overview](/guides/semantics/)
- [crate `docs/semantics.md`](https://github.com/Latka-Industries/tetration/blob/main/docs/semantics.md)
