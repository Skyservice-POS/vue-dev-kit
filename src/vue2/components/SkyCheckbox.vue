<template>
  <b-form-checkbox
    :id="id"
    :checked="modelValue"
    :value="value"
    :unchecked-value="uncheckedValue"
    :switch="switchMode"
    :disabled="disabled"
    :indeterminate="indeterminate"
    :size="bsSize"
    :name="name"
    v-bind="$attrs"
    @input="$emit('update:modelValue', $event); $emit('input', $event)"
    @change="$emit('change', $event)"
  >
    <slot />
  </b-form-checkbox>
</template>

<script>
  import { BFormCheckbox } from 'bootstrap-vue';
  import { toBsSize } from '../lib/map';

  export default {
    name: 'SkyCheckbox',
    components: { BFormCheckbox },
    inheritAttrs: false,
    model: { prop: 'modelValue', event: 'update:modelValue' },
    props: {
      modelValue: { type: [Boolean, Array, String, Number], default: false },
      value: { type: [String, Number, Boolean], default: true },
      uncheckedValue: { type: [String, Number, Boolean], default: false },
      // `switch` — зарезервоване слово, тому проп оголошено через `props` як рядок нижче.
      switch: { type: Boolean, default: false },
      disabled: { type: Boolean, default: false },
      indeterminate: { type: Boolean, default: false },
      size: { type: String, default: 'md' },
      name: { type: String, default: undefined },
      id: { type: String, default: undefined },
    },
    computed: {
      switchMode() {
        return this.$props.switch;
      },
      bsSize() {
        return toBsSize(this.size);
      },
    },
  };
</script>
