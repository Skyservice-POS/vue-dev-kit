<template>
  <b-spinner :small="size === 'sm'" :variant="bsVariant" :label="text" v-bind="$attrs" />
</template>

<script>
  import { BSpinner } from 'bootstrap-vue';
  import { toBsTone } from '../lib/map';

  export default {
    name: 'SkyLoader',
    components: { BSpinner },
    inheritAttrs: false,
    props: {
      text: { type: String, default: '' },
      size: { type: String, default: 'md' },
      tone: { type: String, default: 'default' },
      inline: { type: Boolean, default: false },
    },
    computed: {
      bsVariant() {
        return toBsTone(this.tone);
      },
    },
  };
</script>
