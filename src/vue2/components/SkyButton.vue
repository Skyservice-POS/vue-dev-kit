<template>
  <b-button
    :variant="bsVariant"
    :size="bsSize"
    :type="type"
    :block="block"
    :disabled="disabled || loading"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <b-spinner v-if="loading" small class="sky-btn-spinner" />
    <slot />
  </b-button>
</template>

<script>
  import { BButton, BSpinner } from 'bootstrap-vue';
  import { toBsButtonVariant, toBsSize } from '../lib/map';

  export default {
    name: 'SkyButton',
    components: { BButton, BSpinner },
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
    },
  };
</script>
