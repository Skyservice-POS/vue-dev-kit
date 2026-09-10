<template>
  <b-form-tags
    :value="modelValue"
    :placeholder="placeholder"
    :size="bsSize"
    :separator="separator"
    :add-on-change="addOnChange"
    :remove-on-delete="removeOnDelete"
    :duplicate-tag-text="duplicateTagText"
    :add-button-text="addButtonText"
    :input-id="inputId"
    :autofocus="autofocus"
    :no-outer-focus="noOuterFocus"
    v-bind="$attrs"
    @input="$emit('update:modelValue', $event); $emit('input', $event)"
  />
</template>

<script>
  import { BFormTags } from 'bootstrap-vue';
  import { toBsSize } from '../lib/map';

  export default {
    name: 'SkyTagsInput',
    components: { BFormTags },
    inheritAttrs: false,
    model: { prop: 'modelValue', event: 'update:modelValue' },
    props: {
      modelValue: { type: Array, default: () => [] },
      placeholder: { type: String, default: '' },
      size: { type: String, default: 'md' },
      separator: { type: [String, Array], default: undefined },
      addOnChange: { type: Boolean, default: false },
      removeOnDelete: { type: Boolean, default: false },
      duplicateTagText: { type: String, default: undefined },
      addButtonText: { type: String, default: undefined },
      inputId: { type: String, default: undefined },
      autofocus: { type: Boolean, default: false },
      noOuterFocus: { type: Boolean, default: false },
    },
    computed: {
      bsSize() {
        return toBsSize(this.size);
      },
    },
  };
</script>
