<template>
  <!-- Без `hint` — голий select, щоб не додавати обгортку (див. SkyInput). -->
  <b-form-select
    v-if="!hint"
    :id="id"
    :value="modelValue"
    :options="bsOptions"
    :disabled="disabled"
    :state="bsState"
    v-bind="$attrs"
    @input="$emit('update:modelValue', $event); $emit('input', $event)"
    @change="$emit('change', $event)"
  >
    <template v-if="placeholder" #first>
      <b-form-select-option :value="''" disabled>{{ placeholder }}</b-form-select-option>
    </template>
    <slot />
  </b-form-select>
  <div v-else class="sky-select-with-hint">
    <b-form-select
      :id="id"
      :value="modelValue"
      :options="bsOptions"
      :disabled="disabled"
      :state="bsState"
      v-bind="$attrs"
      @input="$emit('update:modelValue', $event); $emit('input', $event)"
      @change="$emit('change', $event)"
    >
      <template v-if="placeholder" #first>
        <b-form-select-option :value="''" disabled>{{ placeholder }}</b-form-select-option>
      </template>
      <slot />
    </b-form-select>
    <small class="setting-hint" :class="state">{{ hint }}</small>
  </div>
</template>

<script>
  import { BFormSelect, BFormSelectOption } from 'bootstrap-vue';
  import { normalizeOptions, toBsState } from '../lib/map';

  export default {
    name: 'SkySelect',
    components: { BFormSelect, BFormSelectOption },
    inheritAttrs: false,
    model: { prop: 'modelValue', event: 'update:modelValue' },
    props: {
      modelValue: { type: [String, Number], default: undefined },
      options: { type: Array, default: () => [] },
      id: { type: String, default: undefined },
      disabled: { type: Boolean, default: false },
      state: { type: String, default: 'default' },
      placeholder: { type: String, default: '' },
      hint: { type: String, default: '' },
    },
    computed: {
      bsOptions() {
        return normalizeOptions(this.options);
      },
      bsState() {
        return toBsState(this.state);
      },
    },
  };
</script>
