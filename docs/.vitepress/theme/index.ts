import DefaultTheme from 'vitepress/theme'
import HomeImpls from './components/HomeImpls.vue'
import Layout from './Layout.vue'
import './fonts.css'
import './shadcn.css'
import './custom.css'
import './shadcn-nav-sidebar.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('HomeImpls', HomeImpls)
  },
}
