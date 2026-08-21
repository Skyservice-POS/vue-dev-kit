import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import Demo from './Demo.vue'
import './custom.css'

// Авто-реєстрація всіх демо-компонентів із ./demos/*.vue як глобальних.
// Файл SkyButtonDemo.vue → тег <SkyButtonDemo />
const demoModules = import.meta.glob<{ default: any }>('./demos/*.vue', {
  eager: true,
})

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('Demo', Demo)
    for (const path in demoModules) {
      const name = path.split('/').pop()!.replace(/\.vue$/, '')
      app.component(name, demoModules[path].default)
    }
  },
} satisfies Theme
