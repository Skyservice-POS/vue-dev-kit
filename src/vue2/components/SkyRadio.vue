<template>
  <b-form-radio
    :id="id"
    :checked="modelValue"
    :value="value"
    :name="name"
    :disabled="disabled"
    :size="bsSize"
    v-bind="$attrs"
    @input="$emit('update:modelValue', $event); $emit('input', $event)"
    @change="$emit('change', $event)"
  >
    <slot />
  </b-form-radio>
</template>

<script>
  import { BFormRadio } from 'bootstrap-vue';
  import { toBsSize } from '../lib/map';

  export default {
    name: 'SkyRadio',
    components: { BFormRadio },
    inheritAttrs: false,
    model: { prop: 'modelValue', event: 'update:modelValue' },
    props: {
      modelValue: { type: [String, Number, Boolean], default: null },
      value: { type: [String, Number, Boolean], required: true },
      name: { type: String, default: undefined },
      disabled: { type: Boolean, default: false },
      size: { type: String, default: 'md' },
      id: { type: String, default: undefined },
    },
    computed: {
      bsSize() {
        return toBsSize(this.size);
      },
    },
  };
</script>
