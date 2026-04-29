import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [vue(), svgLoader({ defaultImport: 'url' })],
  resolve: {
    alias: {
      '@': resolve(__dirname, '..', 'src'),
    },
  },
})
