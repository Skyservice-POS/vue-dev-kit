import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => tag.includes('-'),
        },
      },
    }),
    svgLoader({ defaultImport: 'url' }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, '..', 'src'),
    },
  },
})
