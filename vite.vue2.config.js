import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
import { resolve } from 'path'

export default defineConfig({
  plugins: [createVuePlugin()],
  build: {
    outDir: 'dist/vue2',
    lib: {
      entry: resolve(__dirname, 'src/vue2/index.js'),
      name: 'VueDevKit',
      formats: ['es', 'cjs'],
      fileName: 'vue-dev-kit'
    },
    rollupOptions: {
      external: ['vue', 'portal-vue'],
      output: {
        globals: {
          vue: 'Vue',
          'portal-vue': 'PortalVue'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'style.css'
          }
          return assetInfo.name
        },
        exports: 'named'
      }
    },
    cssCodeSplit: false
  }
})
