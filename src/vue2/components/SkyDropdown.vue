<template>
  <b-dropdown
    :text="text"
    :variant="bsVariant"
    :size="bsSize"
    :disabled="disabled"
    :right="align === 'right'"
    :block="block"
    :menu-class="menuClass"
    :icon="icon"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template v-if="$slots.trigger" #button-content><slot name="trigger" /></template>
    <slot />
  </b-dropdown>
</template>

<script>
  import { BDropdown } from 'bootstrap-vue';
  import { toBsButtonVariant, toBsSize } from '../lib/map';

  export default {
    name: 'SkyDropdown',
    components: { BDropdown },
    inheritAttrs: false,
    props: {
      text: { type: String, default: '' },
      variant: { type: String, default: 'secondary' },
      size: { type: String, default: 'md' },
      disabled: { type: Boolean, default: false },
      align: {
        type: String,
        default: 'left',
        validator: (v) => ['left', 'right'].includes(v),
      },
      block: { type: Boolean, default: false },
      menuClass: { type: [String, Array, Object], default: undefined },
      // Проп нашого форку BootstrapVue: виїжджає як `data-icon` на кнопці-тоглі.
      icon: { type: String, default: '' },
    },
    computed: {
      bsVariant() {
        return toBsButtonVariant(this.variant);
      },
      bsSize() {
        return toBsSize(this.size);
      },
    },
  };
</script>
