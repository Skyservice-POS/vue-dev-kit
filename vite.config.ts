import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import svgLoader from 'vite-svg-loader';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [
    // Leave absolute asset URLs (e.g. /image/..., /svg/...) as-is — they are served by the
    // host Skyservice app, not bundled into the library (only used in app-specific states).
    vue({ template: { transformAssetUrls: { includeAbsolute: false } } }),
    svgLoader({ defaultImport: 'url' }),
    dts({
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['playground/**'],
      tsconfigPath: resolve(__dirname, 'tsconfig.json'),
      rollupTypes: false,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  build: {
    outDir: 'dist',
    lib: {
      entry: {
        'vue-dev-kit': resolve(__dirname, 'src/index.ts'),
        sdk: resolve(__dirname, 'src/sdk/index.ts'),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['vue', 'ua-parser-js', 'vue-virtual-scroller'],
      output: {
        globals: {
          vue: 'Vue',
          'ua-parser-js': 'UAParser',
          'vue-virtual-scroller': 'VueVirtualScroller',
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'style.css';
          return assetInfo.name ?? '';
        },
        exports: 'named',
      },
    },
    cssCodeSplit: false,
  },
});
