import { defineConfig } from 'vite';
import vue2 from '@vitejs/plugin-vue2';
// Компілятор беремо явно з Vue 2.7, який стоїть під аліасом `vue2`.
// Без цього плагін резолвить `vue/compiler-sfc` і натрапляє на Vue 3,
// що стоїть у цьому ж репозиторії для основної збірки.
import * as vue2Compiler from 'vue2/compiler-sfc';
import { resolve } from 'node:path';

// Vue 2-збірка кіта — тимчасовий міст для адмінки Skyservice POS.
// Компоненти тут не реалізовані, а адаптовані: вони обгортають форк
// BootstrapVue і віддають назовні контракт кіта. Див. src/vue2/README.md.
export default defineConfig({
  plugins: [vue2({ compiler: vue2Compiler })],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  build: {
    outDir: 'dist/vue2',
    // Чистить лише dist/vue2. Vue 3-збірка кладеться в dist/ і вичищає його
    // цілком, тож у `build` вона мусить іти першою — інакше знесе цей каталог.
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/vue2/index.js'),
      name: 'VueDevKitVue2',
      formats: ['es', 'cjs'],
      fileName: 'vue-dev-kit',
    },
    rollupOptions: {
      // `vue` і `bootstrap-vue` дає споживач. Для bootstrap-vue це принципово:
      // адмінка вже має його у своїх залежностях, і другий екземпляр у бандлі
      // означав би два незалежні реєстри компонентів і зламані модалки.
      // Регулярка, а не рядок: частина адаптерів імпортує компоненти точковими
      // шляхами (`bootstrap-vue/esm/components/...`), щоб не тягнути всю бібліотеку.
      external: ['vue', /^bootstrap-vue(\/|$)/],
      output: {
        globals: {
          vue: 'Vue',
          'bootstrap-vue': 'BootstrapVue',
        },
        exports: 'named',
      },
    },
    cssCodeSplit: false,
  },
});
