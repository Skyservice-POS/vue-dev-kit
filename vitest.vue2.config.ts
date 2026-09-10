import { defineConfig } from 'vitest/config';
import vue2 from '@vitejs/plugin-vue2';
import * as vue2Compiler from 'vue2/compiler-sfc';
import { resolve } from 'node:path';

const root = import.meta.dirname;

/**
 * Окремий прогін для Vue 2-збірки.
 *
 * Два рантайми Vue в одному прогоні не вживаються: тут `vue` аліасом
 * веде на 2.7, а компілятор SFC передається плагіну явно — інакше він
 * підхопить `vue/compiler-sfc` від Vue 3, який стоїть у цьому ж репозиторії
 * для основної збірки.
 *
 * Порівняння між збірками йде не навпростець, а через спільну фікстуру:
 * кожна сторона звіряється з еталоном розмітки у своєму прогоні.
 */
export default defineConfig({
  plugins: [vue2({ compiler: vue2Compiler })],
  resolve: {
    alias: [
      // Точний збіг, щоб не зачепити `vue2/compiler-sfc` і `vue-template-compiler`.
      { find: /^vue$/, replacement: resolve(root, 'node_modules/vue2/dist/vue.runtime.common.js') },
      // За замовчуванням і BootstrapVue, і його portal-vue беруться CJS/UMD-збірками.
      // Вони читають `vue` через require, отримують ESM-неймспейс замість самого Vue
      // і падають на `Vue.extend is not a function`. ESM-збірки цієї проблеми не мають.
      // Стосується лише тестів: у самому коді імпорт лишається звичайним `'bootstrap-vue'`.
      {
        find: /^bootstrap-vue$/,
        replacement: resolve(root, 'node_modules/bootstrap-vue/dist/bootstrap-vue.esm.js'),
      },
      { find: /^portal-vue$/, replacement: resolve(root, 'node_modules/portal-vue/dist/portal-vue.esm.js') },
      { find: '@', replacement: resolve(root, 'src') },
    ],
  },
  test: {
    environment: 'happy-dom',
    include: ['src/vue2/**/*.test.ts'],
    server: {
      deps: {
        // BootstrapVue і його portal-vue постачаються як UMD/CJS і читають
        // `vue` через require. Без інлайну вони отримують ESM-неймспейс
        // замість самого Vue і падають на `Vue.extend is not a function`.
        inline: ['bootstrap-vue', 'portal-vue'],
      },
    },
  },
});
