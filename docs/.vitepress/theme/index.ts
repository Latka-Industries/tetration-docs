import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import HomeImpls from './components/HomeImpls.vue'
import HomePositioning from './components/HomePositioning.vue'
import HomeStability from './components/HomeStability.vue'
import Layout from './Layout.vue'
import './fonts.css'
import './shadcn.css'
import './custom.css'
import './shadcn-nav-sidebar.css'

function syncIconsToAppearance() {
  const dark = document.documentElement.classList.contains('dark')
  const href = dark ? '/icon-dark.svg' : '/icon-light.svg'

  for (const link of document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]')) {
    if (link.media) continue
    link.href = href
  }

  for (const img of document.querySelectorAll<HTMLImageElement>(
    '.VPNavBarTitle img, .VPNavScreenAppearance + * img, .logo',
  )) {
    if (img.src.includes('icon')) img.src = href
  }
}

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('HomeImpls', HomeImpls)
    app.component('HomePositioning', HomePositioning)
    app.component('HomeStability', HomeStability)

    if (import.meta.env.SSR) return

    syncIconsToAppearance()
    new MutationObserver(syncIconsToAppearance).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
  },
} satisfies Theme
