<template>
  <b-form-file
    :value="modelValue"
    :accept="accept"
    :multiple="multiple"
    :placeholder="placeholder"
    :browse-text="browseText"
    :drop-placeholder="dropPlaceholder"
    :state="bsState"
    v-bind="$attrs"
    @input="$emit('update:modelValue', $event); $emit('input', $event)"
    @change="$emit('change', $event)"
  />
</template>

<script>
  import { BFormFile } from 'bootstrap-vue';
  import { toBsState } from '../lib/map';

  export default {
    name: 'SkyFileInput',
    components: { BFormFile },
    inheritAttrs: false,
    model: { prop: 'modelValue', event: 'update:modelValue' },
    props: {
      modelValue: { type: [Object, Array], default: null },
      accept: { type: String, default: '' },
      multiple: { type: Boolean, default: false },
      placeholder: { type: String, default: '' },
      browseText: { type: String, default: undefined },
      dropPlaceholder: { type: String, default: undefined },
      state: { type: String, default: 'default' },
    },
    computed: {
      bsState() {
        return toBsState(this.state);
      },
    },
  };
</script>
