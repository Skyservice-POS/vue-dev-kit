import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import svgLoader from 'vite-svg-loader';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [
    vue(),
    svgLoader({ defaultImport: 'url' }),
    dts({
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['playground/**'],
      tsconfigPath: resolve(__dirname, 'tsconfig.json'),
      rollupTypes: false,
    }),
  ],
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
      external: ['vue', 'ua-parser-js'],
      output: {
        globals: {
          vue: 'Vue',
          'ua-parser-js': 'UAParser',
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
