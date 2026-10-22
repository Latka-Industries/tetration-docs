# Embedded zone maps + indexes (0.7.0)

**0.7.0** carries the same UTF-8 `ZONE.json` / `INDEX.json` documents **inside** a sealed `.tet` as THST footer spills (`history_version = 2`). A standalone file can push down without a `.tet.d` package. `layout_version` stays **1**.

Normative detail: crate [`docs/embedded_indexes.md`](https://github.com/Latka-Industries/tetration/blob/main/docs/embedded_indexes.md) (THI-627).

## Why

Through **0.6.x**, zone maps and secondary indexes were **package sidecars** beside `packed.tet`. Opening only the `.tet` had no pushdown. Embed puts those blobs in the image so `tet query -t foo.tet` can skip chunks after convert / pack.

## Footer framing

When superblock `flags & 1` and `history_version = 2`:

```text
… chunk payloads …
[zone_maps_spill?]
[secondary_index_spill?]
[metadata_spill?]
history_json          # may include zone_maps_ref / secondary_index_ref
history_json_len
history_version = 2
THST
```

Spill order toward EOF is fixed: **zone → index → metadata → history_json → tail**. Readers that only know `history_version = 1` **refuse** version 2 (safe framing — not “ignore unknown keys”).

## Writers

| Surface | Behavior |
|---------|----------|
| `tet convert` / writer commit | **Auto-embed** into the standalone `.tet` |
| Package / store seal | Embed into `packed.tet`; sidecars **MAY** remain as mirrors |
| `tet index` / `tet index --clear` | Re-embed an older bare file, or drop spills |

Standalone embeds use generation **`0`** and an all-zero `packed_sha256` **placeholder** (query does not re-hash the image for embed usability). Package seal still hashes the pre-spill image for MANIFEST / sidecar binding.

## Discovery (query)

1. **Embedded** spills when `history_version = 2` and refs parse  
2. Else **generation sidecars** (`ZONE.json` / `INDEX.json` + MANIFEST rules)  
3. Else no pushdown  

Embedded wins when both exist. Answers stay correct if indexes are missing — only I/O changes.

## Compatibility

| Field | 0.7.0 |
|-------|-------|
| `layout_version` | **1** (unchanged) |
| `history_version` | **2** when embeds present |
| Pack / SPEC milestone | **0.7.0** |
| C ABI | Unchanged |
