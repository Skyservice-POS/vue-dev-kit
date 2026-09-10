<template>
  <b-progress
    :value="value"
    :max="max"
    :show-value="showValue"
    :precision="precision"
    :variant="bsVariant"
    :height="height"
    v-bind="$attrs"
  />
</template>

<script>
  import { BProgress } from 'bootstrap-vue';
  import { toBsTone } from '../lib/map';

  export default {
    name: 'SkyProgress',
    components: { BProgress },
    inheritAttrs: false,
    props: {
      value: { type: Number, default: 0 },
      max: { type: Number, default: 100 },
      showValue: { type: Boolean, default: false },
      precision: { type: Number, default: 0 },
      tone: { type: String, default: 'info' },
      height: { type: String, default: undefined },
    },
    computed: {
      bsVariant() {
        return toBsTone(this.tone);
      },
    },
  };
</script>
