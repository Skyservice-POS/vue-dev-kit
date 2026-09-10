<template>
  <b-form-textarea
    :id="id"
    :value="modelValue"
    :rows="rows"
    :max-rows="maxRows"
    :placeholder="placeholder"
    :disabled="disabled"
    :state="bsState"
    v-bind="$attrs"
    @input="$emit('update:modelValue', $event); $emit('input', $event)"
    @change="$emit('change', $event)"
    @blur="$emit('blur', $event)"
  />
</template>

<script>
  import { BFormTextarea } from 'bootstrap-vue';
  import { toBsState } from '../lib/map';

  export default {
    name: 'SkyTextarea',
    components: { BFormTextarea },
    inheritAttrs: false,
    model: { prop: 'modelValue', event: 'update:modelValue' },
    props: {
      modelValue: { type: [String, Number], default: '' },
      rows: { type: [String, Number], default: 3 },
      maxRows: { type: [String, Number], default: undefined },
      placeholder: { type: String, default: '' },
      id: { type: String, default: undefined },
      disabled: { type: Boolean, default: false },
      state: { type: String, default: 'default' },
    },
    computed: {
      bsState() {
        return toBsState(this.state);
      },
    },
  };
</script>
