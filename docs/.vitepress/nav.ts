import type { DefaultTheme } from 'vitepress/theme'

/** Card row for Lesse-style mega flyouts (v-html in VPMenuLink). */
function card(title: string, desc: string): string {
  return `<span class="nav-mega__card"><span class="nav-mega__title">${title}</span><span class="nav-mega__desc">${desc}</span></span>`
}

/** Top nav (VitePress default menu — applies `base` to links automatically). */
export const mainNav: DefaultTheme.NavItem[] = [
  { text: 'Getting started', link: '/getting-started' },
  {
    text: 'Format',
    items: [
      { text: card('Overview', 'What a .tet file is'), link: '/format/' },
      { text: card('File layout', 'Bytes on disk'), link: '/format/layout' },
      {
        text: card('Catalog & datasets', 'Named tensor tables'),
        link: '/format/catalog-and-datasets',
      },
      { text: card('Chunks', 'Payload blocks'), link: '/format/chunks' },
      {
        text: card('Embedded indexes', 'In-file lookup'),
        link: '/format/embedded-indexes',
      },
      { text: card('Versioning', 'Compat rules'), link: '/format/versioning' },
      {
        text: card('Design rationale', 'Why these choices'),
        link: '/format/design-rationale',
      },
    ],
  },
  {
    text: 'CLI',
    items: [
      { text: card('Overview', 'Commands and workflows'), link: '/cli/' },
      { text: card('info', 'Summarize a .tet file'), link: '/cli/info' },
      { text: card('query', 'Run JSON/TOML queries'), link: '/cli/query' },
      {
        text: card('verify & repair', 'Check and fix stores'),
        link: '/cli/verify-repair',
      },
      {
        text: card('convert & export', 'Import and export data'),
        link: '/cli/convert-export',
      },
      {
        text: card('ingest / publish / pack / gc', 'Package lifecycle'),
        link: '/cli/package',
      },
      { text: card('run', 'Execute job files'), link: '/cli/run' },
      { text: card('qhist', 'Query history log'), link: '/cli/qhist' },
      { text: card('semantics', 'Semantic checks'), link: '/cli/semantics' },
      {
        text: card('Exit codes & errors', 'Status codes'),
        link: '/cli/exit-codes',
      },
    ],
  },
  {
    text: 'Rust',
    items: [
      { text: card('Overview', 'Core crate & tet CLI'), link: '/rust/' },
      { text: card('Quick start', 'Open a file fast'), link: '/rust/quick-start' },
      {
        text: card('Open & inspect', 'Metadata and catalog'),
        link: '/rust/open-and-inspect',
      },
      { text: card('Chunk reads', 'Load payload blocks'), link: '/rust/chunk-reads' },
      {
        text: card('Store-backed reads', 'Package pins'),
        link: '/rust/store-backed-reads',
      },
      { text: card('Write path', 'Create and append'), link: '/rust/write-path' },
      { text: card('C ABI / FFI', 'Embed from C'), link: '/rust/ffi' },
    ],
  },
  {
    text: 'Python',
    items: [
      { text: card('Overview', 'tet-py bindings'), link: '/python/' },
      { text: card('Install', 'pip / uv setup'), link: '/python/install' },
      {
        text: card('Quick start', 'Open and read'),
        link: '/python/quick-start',
      },
      {
        text: card('Query operations', 'Run queries in Python'),
        link: '/python/operations',
      },
      {
        text: card('NumPy interchange', 'Arrays in and out'),
        link: '/python/numpy',
      },
      {
        text: card('Version alignment', 'Match crate versions'),
        link: '/python/version-alignment',
      },
    ],
  },
  {
    text: 'Query',
    items: [
      { text: card('Overview', 'Query model'), link: '/query/' },
      {
        text: card('Query document', 'JSON / TOML shape'),
        link: '/query/document',
      },
      { text: card('Operations', 'Ops catalog'), link: '/query/operations' },
      {
        text: card('Selections & metadata', 'Slices and fields'),
        link: '/query/selection-and-metadata',
      },
      {
        text: card('Execution strategies', 'How queries run'),
        link: '/query/execution',
      },
      { text: card('Cookbook', 'Ready patterns'), link: '/query/cookbook' },
    ],
  },
  {
    text: 'Guides',
    items: [
      { text: card('Overview', 'How-to index'), link: '/guides/' },
      {
        text: card('Format comparison', 'vs other stores'),
        link: '/guides/format-comparison',
      },
      {
        text: card('Mmap read patterns', 'Zero-copy reads'),
        link: '/guides/mmap-patterns',
      },
      { text: card('Job files', 'Batch workflows'), link: '/guides/job-files' },
      {
        text: card('Trust boundaries', 'Safety model'),
        link: '/guides/trust-boundaries',
      },
      { text: card('Semantics', 'Meaning of ops'), link: '/guides/semantics/' },
    ],
  },
  { text: 'Roadmap', link: '/roadmap' },
]
