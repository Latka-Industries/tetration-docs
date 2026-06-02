# Quick start

::: info Coming soon
This page will expand when tet-py ships. Below is the planned API shape and a CLI workaround.
:::

## Planned usage

```python
import tetration  # module name TBD

# Open and inspect
file = tetration.open("data.tet")
for ds in file.datasets:
    print(ds.name, ds.dtype, ds.shape)

# Run a query
result = file.query({"dataset": "temperature", "mean": []})
print(result.execution.mean)
```

NumPy interchange (planned):

```python
import numpy as np

chunk = file.read_chunk("temperature", chunk_index=(0, 0))
arr = np.frombuffer(chunk.data, dtype=np.float32).reshape(chunk.shape)
```

## CLI workaround (available now)

```python
import json
import subprocess

def tet_query(tet_path: str, query: dict) -> str:
    result = subprocess.run(
        ["tet", "query", json.dumps(query), "-t", tet_path, "-x", "-q"],
        capture_output=True,
        text=True,
        check=True,
    )
    return result.stdout.strip()

print(tet_query("data.tet", {"dataset": "temperature", "mean": []}))
```

For catalog inspection:

```python
import subprocess

result = subprocess.run(
    ["tet", "info", "data.tet", "--json"],
    capture_output=True,
    text=True,
    check=True,
)
catalog = json.loads(result.stdout)
```

## Next steps

- [Install](/python/install) — when tet-py is available
- [Query cookbook](/guides/query-cookbook) — query document examples
- [Rust quick start](/rust/quick-start) — if embedding Rust directly
