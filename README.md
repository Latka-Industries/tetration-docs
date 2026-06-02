# tetration-docs

Documentation site for [Tetration](https://github.com/Latka-Industries/tetration) (`.tet` chunked tensor store) and **tet-py** (Python bindings).

Built with [VitePress](https://vitepress.dev/).

## Local development

```bash
npm install
npm run docs:dev
```

Open [http://localhost:5174/tetration-docs/](http://localhost:5174/tetration-docs/) (base path matches GitHub Pages).

## Build

```bash
npm run docs:build
npm run docs:preview
```

## Deployment

Pushes to `main` deploy to GitHub Pages via `.github/workflows/deploy.yml`.

| Environment | URL |
|-------------|-----|
| GitHub Pages (current) | `https://latka-industries.github.io/tetration-docs/` |
| Custom domain (future) | `https://tetration.dev` |

## Site structure

| Path | Content |
|------|---------|
| `/` | Overview — what `.tet` is and when to use it |
| `/format/` | On-disk layout, chunks, catalog |
| `/cli/` | `tet` command reference |
| `/rust/` | Rust crate usage (links to docs.rs) |
| `/python/` | tet-py install and API |
| `/guides/` | Query engine, cookbook, comparisons |
