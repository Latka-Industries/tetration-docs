import { defineConfig } from 'vitepress'
import tailwindcss from '@tailwindcss/vite'
import { mainNav } from './nav'

export default defineConfig({
  title: 'Tetration',
  description: 'Documentation for the Tetration .tet tensor store, tet CLI, and tet-py.',
  base: '/tetration-docs/',
  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap',
      },
    ],
  ],
  vite: {
    plugins: [tailwindcss()],
    server: {
      port: 5174,
    },
  },
  themeConfig: {
    search: {
      provider: 'local',
    },
    nav: mainNav,
    sidebar: {
      '/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Overview', link: '/' },
            { text: 'Getting started', link: '/getting-started' },
          ],
        },
      ],
      '/format/': [
        {
          text: 'Format',
          items: [
            { text: 'Overview', link: '/format/' },
            { text: 'File layout', link: '/format/layout' },
            { text: 'Catalog & datasets', link: '/format/catalog-and-datasets' },
            { text: 'Chunks', link: '/format/chunks' },
            { text: 'Versioning', link: '/format/versioning' },
            { text: 'Design rationale', link: '/format/design-rationale' },
          ],
        },
      ],
      '/cli/': [
        {
          text: 'CLI',
          items: [
            { text: 'Overview', link: '/cli/' },
            { text: 'tet info', link: '/cli/info' },
            { text: 'tet query', link: '/cli/query' },
            { text: 'tet verify & repair', link: '/cli/verify-repair' },
            { text: 'tet convert & export', link: '/cli/convert-export' },
            { text: 'tet qhist', link: '/cli/qhist' },
            { text: 'Exit codes & errors', link: '/cli/exit-codes' },
          ],
        },
      ],
      '/rust/': [
        {
          text: 'Rust',
          items: [
            { text: 'Overview', link: '/rust/' },
            { text: 'Quick start', link: '/rust/quick-start' },
            { text: 'Open & inspect', link: '/rust/open-and-inspect' },
            { text: 'Chunk reads', link: '/rust/chunk-reads' },
            { text: 'Write path', link: '/rust/write-path' },
            { text: 'C ABI / FFI', link: '/rust/ffi' },
          ],
        },
      ],
      '/python/': [
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
      ],
      '/guides/': [
        {
          text: 'Guides',
          items: [
            { text: 'Overview', link: '/guides/' },
            { text: 'Query engine', link: '/guides/query-engine/' },
            { text: 'Query cookbook', link: '/guides/query-cookbook' },
            { text: 'Format comparison', link: '/guides/format-comparison' },
            { text: 'Mmap read patterns', link: '/guides/mmap-patterns' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Latka-Industries/tetration-docs' },
    ],
    footer: {
      message: 'Latka Industries',
      copyright: 'Copyright © 2026 Latka Industries',
    },
  },
})
