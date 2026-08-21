import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [
    vue({
      // SkyTable references host-provided assets (/image/..., /svg/...) — leave them
      // as plain URLs instead of letting Rollup try (and fail) to resolve them locally.
      template: {
        transformAssetUrls: { includeAbsolute: false },
        compilerOptions: {
          // only the sky-* web components (e.g. sky-toast-notification) are custom
          // elements; kebab Vue components inside SkyTable must still resolve normally
          isCustomElement: tag => tag.startsWith('sky-'),
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
