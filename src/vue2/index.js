export * from './components';
export * from './directives';

// Шар сумісності з BootstrapVue — див. src/compat/index.js.
// Саме він, а не адаптери вище, знімає залежність від bootstrap-vue.
export { BootstrapCompat, BButton } from '../compat';

/**
 * Плагін-хелпер: реєструє всі компоненти й директиви глобально —
 * зручно, коли адмінка переїжджає з глобально зареєстрованого BootstrapVue.
 *
 *   import SkyKit from '@skyservice-developers/vue-dev-kit/vue2';
 *   Vue.use(SkyKit);
 */
import * as components from './components';
import { directives } from './directives';

export default {
  install(Vue) {
    Object.keys(components).forEach((name) => Vue.component(name, components[name]));
    Object.keys(directives).forEach((name) => Vue.directive(name, directives[name]));
  },
};
