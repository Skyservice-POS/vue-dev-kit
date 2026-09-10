<template>
  <b-collapse
    :id="id"
    :visible="modelValue"
    :accordion="accordion"
    v-bind="$attrs"
    @input="$emit('update:modelValue', $event); $emit('input', $event)"
    @show="$emit('show')"
    @hidden="$emit('hide')"
  >
    <slot />
  </b-collapse>
</template>

<script>
  import { BCollapse } from 'bootstrap-vue';

  export default {
    name: 'SkyCollapse',
    components: { BCollapse },
    inheritAttrs: false,
    model: { prop: 'modelValue', event: 'update:modelValue' },
    props: {
      modelValue: { type: Boolean, default: false },
      id: { type: String, default: undefined },
      accordion: { type: String, default: undefined },
    },
  };
</script>
