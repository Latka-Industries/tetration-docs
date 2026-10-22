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

/** Keep the non-media favicon in sync with VitePress appearance (navbar logo is VPImage). */
function syncFaviconToAppearance() {
  const dark = document.documentElement.classList.contains('dark')
  const href = dark ? '/icon-dark.svg' : '/icon-light.svg'

  for (const link of document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]')) {
    if (link.media) continue
    link.href = href
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

    syncFaviconToAppearance()
    new MutationObserver(syncFaviconToAppearance).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
  },
} satisfies Theme
