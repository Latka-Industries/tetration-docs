# Open & inspect

Mmap a `.tet` file and read its catalog — parity with `tet info`.

## Basic inspection

```rust
use tetration::catalog::{read_tet_summary_v1, TetFile};
use tetration::layout::mmap_file_read;

fn inspect(path: &std::path::Path) -> Result<(), Box<dyn std::error::Error>> {
    let mmap = mmap_file_read(path)?;
    let summary = read_tet_summary_v1(&mmap)?;

    println!(
        "layout_version={} datasets={} chunks={}",
        summary.superblock.layout_version,
        summary.datasets.len(),
        summary.chunks.len(),
    );

    for ds in &summary.datasets {
        let shape = ds.shape.iter().map(|d| d.to_string()).collect::<Vec<_>>().join("×");
        println!("  {}  dtype={}  shape={shape}", ds.name, ds.dtype);
    }

    Ok(())
}
```

## Using TetFile

```rust
use tetration::catalog::TetFile;

let file = TetFile::open("data.tet")?;
let mmap = file.mmap();

for ds in file.datasets()? {
    println!("{} dtype={}", ds.name, ds.dtype);
}
```

## Footer metadata

When the `THST` footer is present, `read_tet_summary_v1` resolves `metadata.datasets`:

```rust
if let Some(meta) = summary.metadata.datasets.get("temperature") {
    if let Some(dim_names) = &meta.dim_names {
        println!("dim_names: {}", dim_names.join(", "));
    }
    for (k, v) in &meta.attrs {
        println!("{k}: {v}");
    }
}
```

## History events

```rust
for ev in &summary.history {
    println!("{}  {}  {}", ev.op, ev.source, ev.at);
}
```

Run the upstream example:

```bash
cargo run --example inspect_catalog -- /path/to/file.tet
```

See also [`read_tet_summary_v1`](https://docs.rs/tetration/latest/tetration/catalog/fn.read_tet_summary_v1.html) on docs.rs.
