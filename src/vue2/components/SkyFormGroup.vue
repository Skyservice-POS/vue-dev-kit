<template>
  <b-form-group
    :label="label"
    :label-for="labelFor"
    :description="description"
    :invalid-feedback="invalidFeedback"
    :state="bsState"
    :label-cols="labelCols"
    :content-cols="contentCols"
    v-bind="$attrs"
  >
    <template v-if="$slots.label" #label><slot name="label" /></template>
    <template v-if="$slots.description" #description><slot name="description" /></template>
    <slot />
  </b-form-group>
</template>

<script>
  import { BFormGroup } from 'bootstrap-vue';
  import { toBsState } from '../lib/map';

  export default {
    name: 'SkyFormGroup',
    components: { BFormGroup },
    inheritAttrs: false,
    props: {
      label: { type: String, default: '' },
      labelFor: { type: String, default: undefined },
      description: { type: String, default: '' },
      invalidFeedback: { type: String, default: '' },
      state: { type: String, default: 'default' },
      labelCols: { type: [String, Number], default: undefined },
      contentCols: { type: [String, Number], default: undefined },
    },
    computed: {
      bsState() {
        return toBsState(this.state);
      },
    },
  };
</script>
