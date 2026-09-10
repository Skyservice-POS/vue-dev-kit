<template>
  <b-badge :variant="bsVariant" :pill="pill" v-bind="$attrs">
    <slot>{{ label }}</slot>
  </b-badge>
</template>

<script>
  import { BBadge } from 'bootstrap-vue';
  import { toBsTone } from '../lib/map';

  export default {
    name: 'SkyBadge',
    components: { BBadge },
    inheritAttrs: false,
    props: {
      tone: { type: String, default: 'default' },
      label: { type: String, default: '' },
      // Крапка-індикатор є лише у Vue 3-версії; приймаємо заради паритету.
      dot: { type: Boolean, default: true },
      pill: { type: Boolean, default: false },
    },
    computed: {
      bsVariant() {
        return toBsTone(this.tone);
      },
    },
  };
</script>
