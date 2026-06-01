import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Tetration',
  description: 'Documentation for the Tetration .tet tensor store, tet CLI, and tet-py.',
  base: '/tetration-docs/',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Format', link: '/format/' },
      { text: 'CLI', link: '/cli/' },
      { text: 'Rust', link: '/rust/' },
      { text: 'Python', link: '/python/' },
      { text: 'Guides', link: '/guides/' },
      {
        text: 'GitHub',
        items: [
          { text: 'tetration', link: 'https://github.com/Latka-Industries/tetration' },
          { text: 'tetration-docs', link: 'https://github.com/Latka-Industries/tetration-docs' },
        ],
      },
    ],
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
          items: [{ text: 'Specification', link: '/format/' }],
        },
      ],
      '/cli/': [
        {
          text: 'CLI',
          items: [{ text: 'Reference', link: '/cli/' }],
        },
      ],
      '/rust/': [
        {
          text: 'Rust',
          items: [{ text: 'Crate', link: '/rust/' }],
        },
      ],
      '/python/': [
        {
          text: 'Python',
          items: [{ text: 'tet-py', link: '/python/' }],
        },
      ],
      '/guides/': [
        {
          text: 'Guides',
          items: [{ text: 'Overview', link: '/guides/' }],
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
