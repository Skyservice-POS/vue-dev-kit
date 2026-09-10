<template>
  <b-button
    :variant="bsVariant"
    :size="bsSize"
    :type="type"
    :block="block"
    :disabled="disabled || loading"
    :class="skyClasses"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <span v-if="loading" :class="spinnerClasses" aria-hidden="true"></span>
    <slot />
  </b-button>
</template>

<script>
  // Точковий шлях, а не `from 'bootstrap-vue'`: кореневий індекс тягне всю
  // бібліотеку разом із тост-плагіном і portal-vue, які кнопці не потрібні.
  import { BButton } from 'bootstrap-vue/esm/components/button';
  import { skyButtonClasses, BUTTON_SPINNER_CLASSES } from '../../shared/lib/button-classes';
  import { toBsButtonVariant, toBsSize } from '../lib/map';

  /**
   * Класи `sky-btn*` віддаємо самі, bootstrap-івські додає `b-button`.
   * Vue 2 ставить клас із зовнішнього `:class` попереду власних класів
   * компонента, тож на виході виходить рівно той порядок, який рахує
   * `buttonClasses()` — і рівно той, що й у Vue 3-збірці.
   *
   * Спінер малюємо вручну, а не через `<b-spinner>`: так розмітка й набір
   * класів збігаються з Vue 3-версією без залежності від внутрішніх
   * деталей BootstrapVue.
   */
  export default {
    name: 'SkyButton',
    components: { BButton },
    inheritAttrs: false,
    props: {
      variant: {
        type: String,
        default: 'primary',
        validator: (v) => ['primary', 'danger', 'secondary', 'outline'].includes(v),
      },
      size: {
        type: String,
        default: 'md',
        validator: (v) => ['sm', 'md', 'lg'].includes(v),
      },
      type: { type: String, default: 'button' },
      loading: { type: Boolean, default: false },
      disabled: { type: Boolean, default: false },
      block: { type: Boolean, default: false },
      icon: { type: Boolean, default: false },
    },
    computed: {
      bsVariant() {
        return toBsButtonVariant(this.variant);
      },
      bsSize() {
        return toBsSize(this.size);
      },
      skyClasses() {
        return skyButtonClasses(this.$props);
      },
      spinnerClasses() {
        return BUTTON_SPINNER_CLASSES;
      },
    },
  };
</script>
