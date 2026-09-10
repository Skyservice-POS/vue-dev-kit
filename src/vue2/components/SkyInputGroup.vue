<template>
  <b-input-group :size="bsSize" :prepend="prepend" :append="append" v-bind="$attrs">
    <template v-if="$slots.prepend" #prepend><slot name="prepend" /></template>
    <template v-if="$slots.append" #append><slot name="append" /></template>
    <slot />
  </b-input-group>
</template>

<script>
  import { BInputGroup } from 'bootstrap-vue';
  import { toBsSize } from '../lib/map';

  export default {
    name: 'SkyInputGroup',
    components: { BInputGroup },
    inheritAttrs: false,
    props: {
      size: { type: String, default: 'md' },
      prepend: { type: String, default: undefined },
      append: { type: String, default: undefined },
    },
    computed: {
      bsSize() {
        return toBsSize(this.size);
      },
    },
  };
</script>
