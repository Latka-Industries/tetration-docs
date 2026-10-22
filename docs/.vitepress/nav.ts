import type { DefaultTheme } from 'vitepress/theme'

/** Top nav (VitePress default menu — applies `base` to links automatically). */
export const mainNav: DefaultTheme.NavItem[] = [
  { text: 'Getting started', link: '/getting-started' },
  {
    text: 'Format',
    items: [
      { text: 'Overview', link: '/format/' },
      { text: 'File layout', link: '/format/layout' },
      { text: 'Catalog & datasets', link: '/format/catalog-and-datasets' },
      { text: 'Chunks', link: '/format/chunks' },
      { text: 'Embedded indexes', link: '/format/embedded-indexes' },
      { text: 'Versioning', link: '/format/versioning' },
      { text: 'Design rationale', link: '/format/design-rationale' },
    ],
  },
  {
    text: 'CLI',
    items: [
      { text: 'Overview', link: '/cli/' },
      { text: 'tet info', link: '/cli/info' },
      { text: 'tet query', link: '/cli/query' },
      { text: 'tet verify & repair', link: '/cli/verify-repair' },
      { text: 'tet convert & export', link: '/cli/convert-export' },
      { text: 'tet ingest / publish / pack / gc', link: '/cli/package' },
      { text: 'tet qhist', link: '/cli/qhist' },
      { text: 'tet semantics', link: '/cli/semantics' },
      { text: 'Exit codes & errors', link: '/cli/exit-codes' },
    ],
  },
  {
    text: 'Rust',
    items: [
      { text: 'Overview', link: '/rust/' },
      { text: 'Quick start', link: '/rust/quick-start' },
      { text: 'Open & inspect', link: '/rust/open-and-inspect' },
      { text: 'Chunk reads', link: '/rust/chunk-reads' },
      { text: 'Store-backed reads', link: '/rust/store-backed-reads' },
      { text: 'Write path', link: '/rust/write-path' },
      { text: 'C ABI / FFI', link: '/rust/ffi' },
    ],
  },
  {
    text: 'Python',
    items: [
      { text: 'Overview', link: '/python/' },
      { text: 'Install', link: '/python/install' },
      { text: 'Quick start', link: '/python/quick-start' },
      { text: 'Query operations', link: '/python/operations' },
      { text: 'NumPy interchange', link: '/python/numpy' },
      { text: 'Version alignment', link: '/python/version-alignment' },
    ],
  },
  {
    text: 'Guides',
    items: [
      { text: 'Overview', link: '/guides/' },
      { text: 'Query engine', link: '/guides/query-engine/' },
      { text: 'Query document', link: '/guides/query-engine/document' },
      { text: 'Operations', link: '/guides/query-engine/operations' },
      {
        text: 'Selections & metadata',
        link: '/guides/query-engine/selection-and-metadata',
      },
      { text: 'Execution strategies', link: '/guides/query-engine/execution' },
      { text: 'Query cookbook', link: '/guides/query-cookbook' },
      { text: 'Format comparison', link: '/guides/format-comparison' },
      { text: 'Mmap read patterns', link: '/guides/mmap-patterns' },
      { text: 'Semantics', link: '/guides/semantics/' },
    ],
  },
  { text: 'Roadmap', link: '/roadmap' },
  { text: 'Contact', link: '/contact' },
]
