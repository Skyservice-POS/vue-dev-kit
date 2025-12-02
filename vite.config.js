import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: {
        'vue-dev-kit': resolve(__dirname, 'src/index.js'),
        'components': resolve(__dirname, 'src/components/index.js'),
        'api': resolve(__dirname, 'src/api/index.js')
      },
      name: 'VueDevKit',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['vue', 'axios'],
      output: {
        globals: {
          vue: 'Vue',
          axios: 'axios'
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
