import { BButton } from './button/BButton';

export { BButton };

/**
 * Шар сумісності з BootstrapVue.
 *
 * Мета — **зняти залежність**, а не запропонувати новий API. Компоненти тут
 * повторюють контракт `b-*` повністю, тож адмінка реєструє їх глобально
 * і викидає BootstrapVue, не чіпаючи жодного місця виклику:
 *
 *   import { BootstrapCompat } from '@skyservice-developers/vue-dev-kit/vue2';
 *   Vue.use(BootstrapCompat);
 *
 * Після цього `import BootstrapVue from 'bootstrap-vue'` і `Vue.use(BootstrapVue)`
 * прибираються. Коли так буде закрито всі компоненти, які використовує адмінка,
 * BootstrapVue зникає з залежностей — і відкривається шлях до `@vue/compat`,
 * бо саме він блокував перехід на Vue 3.
 *
 * Кожен компонент звіряється з оригіналом A/B-тестом на матриці пропів:
 * критерій — посимвольний збіг розмітки, а не «схоже».
 *
 * Реєструємо під тими самими іменами, що й BootstrapVue, включно з аліасами.
 */
const components = {
  BButton,
  BBtn: BButton,
};

export const BootstrapCompat = {
  install(Vue) {
    Object.keys(components).forEach((name) => Vue.component(name, components[name]));
  },
};

export default BootstrapCompat;
