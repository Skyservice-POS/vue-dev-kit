<template>
  <!--
    Vue 3-версія — фрагмент (<input> + <small>), у Vue 2 фрагментів немає.
    Щоб не додавати обгортку там, де її не було, і не зсунути верстку,
    без `hint` віддаємо голе поле.
  -->
  <b-form-input
    v-if="!hint"
    ref="input"
    :id="id"
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :state="bsState"
    v-bind="$attrs"
    @input="$emit('update:modelValue', $event); $emit('input', $event)"
    @change="$emit('change', $event)"
    @blur="$emit('blur', $event)"
    @focus="$emit('focus', $event)"
  />
  <div v-else class="sky-input-with-hint">
    <b-form-input
      ref="input"
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :state="bsState"
      v-bind="$attrs"
      @input="$emit('update:modelValue', $event); $emit('input', $event)"
      @change="$emit('change', $event)"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
    />
    <small class="setting-hint" :class="state">{{ hint }}</small>
  </div>
</template>

<script>
  import { BFormInput } from 'bootstrap-vue';
  import { toBsState } from '../lib/map';

  export default {
    name: 'SkyInput',
    components: { BFormInput },
    inheritAttrs: false,
    model: { prop: 'modelValue', event: 'update:modelValue' },
    props: {
      modelValue: { type: [String, Number], default: '' },
      type: { type: String, default: 'text' },
      placeholder: { type: String, default: '' },
      id: { type: String, default: undefined },
      disabled: { type: Boolean, default: false },
      state: { type: String, default: 'default' },
      hint: { type: String, default: '' },
    },
    computed: {
      bsState() {
        return toBsState(this.state);
      },
    },
    methods: {
      // Місця виклику керують фокусом програмно — контракт має це давати.
      focus() {
        this.$refs.input && this.$refs.input.focus();
      },
      blur() {
        this.$refs.input && this.$refs.input.blur();
      },
      select() {
        this.$refs.input && this.$refs.input.select();
      },
    },
  };
</script>
