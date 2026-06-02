import DefaultTheme from 'vitepress/theme'
import HomeImpls from './components/HomeImpls.vue'
import './shadcn.css'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('HomeImpls', HomeImpls)
  },
}
