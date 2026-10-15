# tetration-docs

Documentation site for [Tetration](https://github.com/Latka-Industries/tetration) (`.tet` chunked tensor store) and **tet-py** (Python bindings).

**Site:** [https://docs.tetration.sh](https://docs.tetration.sh)

**Contact:** [tensor@tetration.sh](mailto:tensor@tetration.sh)

Built with [VitePress](https://vitepress.dev/).

## Local development

```bash
npm install
npm run docs:dev
```

Open [http://localhost:5174/](http://localhost:5174/) after `npm run docs:dev`.

## Build

```bash
npm run docs:build
npm run docs:preview
```

## Deployment

Pushes to `main` deploy to GitHub Pages via `.github/workflows/deploy.yml`. Custom domain via `docs/public/CNAME`.

| Environment | URL |
|-------------|-----|
| Production | [https://docs.tetration.sh](https://docs.tetration.sh) |
| GitHub Pages (legacy path) | `https://latka-industries.github.io/tetration-docs/` (retire after DNS cutover; `base` is now `/`) |

DNS: point `docs.tetration.sh` at GitHub Pages and set the custom domain on the **tetration-docs** Pages settings (enforce HTTPS).

## Site structure

| Path | Content |
|------|---------|
| `/` | Overview — what `.tet` is and when to use it |
| `/format/` | On-disk layout, chunks, catalog |
| `/cli/` | `tet` command reference |
| `/rust/` | Rust crate usage (links to docs.rs) |
| `/python/` | tet-py install, query API, NumPy ram/spill/sidecar |
| `/guides/` | Query engine, cookbook, comparisons |
| `/roadmap` | Shipped index + prospective directions (no release schedule) |
| `/contact` | Email and GitHub issue links |
