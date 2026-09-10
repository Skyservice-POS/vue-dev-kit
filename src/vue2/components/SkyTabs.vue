<template>
  <!--
    Контракт кіта: смуга вкладок без панелей — вміст рендерить споживач
    сусідніми блоками. Тому b-tab тут порожні, а синхронізація йде за індексом.
  -->
  <b-tabs :value="activeIndex" v-bind="$attrs" @input="onIndexChange">
    <b-tab
      v-for="option in normalized"
      :key="option.value"
      :title="option.text"
      :disabled="disabled || option.disabled"
    />
  </b-tabs>
</template>

<script>
  import { BTabs, BTab } from 'bootstrap-vue';
  import { normalizeOptions } from '../lib/map';

  export default {
    name: 'SkyTabs',
    components: { BTabs, BTab },
    inheritAttrs: false,
    model: { prop: 'modelValue', event: 'update:modelValue' },
    props: {
      modelValue: { type: [String, Number], default: undefined },
      options: { type: Array, default: () => [] },
      disabled: { type: Boolean, default: false },
    },
    computed: {
      normalized() {
        return normalizeOptions(this.options);
      },
      activeIndex() {
        const index = this.normalized.findIndex((option) => option.value === this.modelValue);
        return index === -1 ? 0 : index;
      },
    },
    methods: {
      onIndexChange(index) {
        const option = this.normalized[index];
        if (option && option.value !== this.modelValue) {
          this.$emit('update:modelValue', option.value);
        }
      },
    },
  };
</script>
