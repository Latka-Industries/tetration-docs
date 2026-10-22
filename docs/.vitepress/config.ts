import { defineConfig } from 'vitepress'
import tailwindcss from '@tailwindcss/vite'
import { mainNav } from './nav'

const SITE_URL = 'https://docs.tetration.sh'
const SITE_TITLE = 'Tetration'
const SITE_DESCRIPTION =
  'Documentation for the Tetration .tet tensor store, tet CLI, and tet-py.'
const OG_IMAGE = `${SITE_URL}/og-dark.png`
const OG_IMAGE_LIGHT = `${SITE_URL}/og-light.png`

export default defineConfig({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  // Custom domain docs.tetration.sh (GitHub Pages project site with CNAME).
  base: '/',
  head: [
    [
      'link',
      {
        rel: 'icon',
        href: '/icon-light.svg',
        type: 'image/svg+xml',
        media: '(prefers-color-scheme: light)',
      },
    ],
    [
      'link',
      {
        rel: 'icon',
        href: '/icon-dark.svg',
        type: 'image/svg+xml',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    // Fallback + VitePress-theme sync target (see theme/index.ts)
    ['link', { rel: 'icon', href: '/icon-light.svg', type: 'image/svg+xml' }],
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap',
      },
    ],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: SITE_TITLE }],
    ['meta', { property: 'og:url', content: `${SITE_URL}/` }],
    // Default social card is dark; light asset is listed second for clients that pick it.
    ['meta', { property: 'og:image', content: OG_IMAGE }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:image:alt', content: `${SITE_TITLE} documentation` }],
    ['meta', { property: 'og:image', content: OG_IMAGE_LIGHT }],
    ['meta', { property: 'og:image:alt', content: `${SITE_TITLE} documentation (light)` }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: OG_IMAGE }],
    ['meta', { name: 'twitter:image:alt', content: `${SITE_TITLE} documentation` }],
  ],
  transformPageData(pageData) {
    const title = pageData.title
      ? `${pageData.title} | ${SITE_TITLE}`
      : SITE_TITLE
    const description = pageData.description || SITE_DESCRIPTION
    const path = pageData.relativePath
      .replace(/(^|\/)index\.md$/, '$1')
      .replace(/\.md$/, '')
    const url = path ? `${SITE_URL}/${path}` : `${SITE_URL}/`

    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push(
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: description }],
    )
  },
  markdown: {
    // Dual Shiki themes tuned to the zinc/teal shell (not pure github-dark).
    theme: {
      light: 'github-light',
      dark: 'github-dark-dimmed',
    },
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      port: 5174,
    },
  },
  themeConfig: {
    logo: '/icon.svg',
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
            { text: 'Roadmap', link: '/roadmap' },
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
            { text: 'Embedded indexes', link: '/format/embedded-indexes' },
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
            { text: 'tet ingest / publish / pack / gc', link: '/cli/package' },
            { text: 'tet qhist', link: '/cli/qhist' },
            { text: 'tet semantics', link: '/cli/semantics' },
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
            { text: 'Store-backed reads', link: '/rust/store-backed-reads' },
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
      '/query/': [
        {
          text: 'Query',
          items: [
            { text: 'Overview', link: '/query/' },
            { text: 'Query document', link: '/query/document' },
            { text: 'Operations', link: '/query/operations' },
            {
              text: 'Selections & metadata',
              link: '/query/selection-and-metadata',
            },
            { text: 'Execution strategies', link: '/query/execution' },
            { text: 'Cookbook', link: '/query/cookbook' },
          ],
        },
      ],
      '/guides/': [
        {
          text: 'Guides',
          items: [
            { text: 'Overview', link: '/guides/' },
            { text: 'Format comparison', link: '/guides/format-comparison' },
            { text: 'Mmap read patterns', link: '/guides/mmap-patterns' },
            { text: 'Semantics', link: '/guides/semantics/' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Latka-Industries/tetration' },
      {
        icon: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><title>Email</title><path d="M1.5 8.67v8.58A2.25 2.25 0 0 0 3.75 19.5h16.5a2.25 2.25 0 0 0 2.25-2.25V8.67l-8.69 5.43a3 3 0 0 1-3.12 0L1.5 8.67Z"/><path d="M22.5 6.908V6.75a2.25 2.25 0 0 0-2.25-2.25H3.75A2.25 2.25 0 0 0 1.5 6.75v.158l9.44 5.9a1.5 1.5 0 0 0 1.62 0l9.44-5.9Z"/></svg>',
        },
        link: 'mailto:tensor@tetration.sh',
        ariaLabel: 'Email',
      },
    ],
    footer: {
      copyright: '© 2026 Latka Industries',
    },
  },
})
