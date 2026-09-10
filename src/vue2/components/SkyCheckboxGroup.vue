<template>
  <b-form-checkbox-group
    :id="id"
    :checked="modelValue"
    :options="bsOptions"
    :name="name"
    :stacked="stacked"
    :disabled="disabled"
    :size="bsSize"
    v-bind="$attrs"
    @input="$emit('update:modelValue', $event); $emit('input', $event)"
    @change="$emit('change', $event)"
  >
    <slot />
  </b-form-checkbox-group>
</template>

<script>
  import { BFormCheckboxGroup } from 'bootstrap-vue';
  import { normalizeOptions, toBsSize } from '../lib/map';

  export default {
    name: 'SkyCheckboxGroup',
    components: { BFormCheckboxGroup },
    inheritAttrs: false,
    model: { prop: 'modelValue', event: 'update:modelValue' },
    props: {
      modelValue: { type: Array, default: () => [] },
      options: { type: Array, default: () => [] },
      name: { type: String, default: undefined },
      stacked: { type: Boolean, default: false },
      disabled: { type: Boolean, default: false },
      size: { type: String, default: 'md' },
      id: { type: String, default: undefined },
    },
    computed: {
      bsOptions() {
        return normalizeOptions(this.options);
      },
      bsSize() {
        return toBsSize(this.size);
      },
    },
  };
</script>
