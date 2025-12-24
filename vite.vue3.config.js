import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import * as compiler from 'vue3/compiler-sfc'

export default defineConfig({
  resolve: {
    alias: {
      vue: 'vue3',
      'vue/compiler-sfc': 'vue3/compiler-sfc',
      'vue/dist': 'vue3/dist'
    }
  },
  plugins: [vue({ compiler })],
  build: {
    outDir: 'dist/vue3',
    lib: {
      entry: resolve(__dirname, 'src/vue3/index.js'),
      name: 'VueDevKit',
      formats: ['es', 'cjs'],
      fileName: 'vue-dev-kit'
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
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
