<template>
  <b-alert
    show
    :variant="bsVariant"
    :dismissible="dismissible"
    v-bind="$attrs"
    @dismissed="$emit('dismissed')"
  >
    <slot />
  </b-alert>
</template>

<script>
  import { BAlert } from 'bootstrap-vue';
  import { toBsTone } from '../lib/map';

  export default {
    name: 'SkyAlert',
    components: { BAlert },
    inheritAttrs: false,
    props: {
      tone: {
        type: String,
        default: 'info',
        validator: (v) => ['success', 'error', 'warning', 'info'].includes(v),
      },
      // Vue 3-версія малює власну іконку; BootstrapVue іконок не має,
      // тож проп приймаємо заради паритету контракту, але він не діє.
      showIcon: { type: Boolean, default: true },
      dismissible: { type: Boolean, default: false },
    },
    computed: {
      bsVariant() {
        return toBsTone(this.tone);
      },
    },
  };
</script>
