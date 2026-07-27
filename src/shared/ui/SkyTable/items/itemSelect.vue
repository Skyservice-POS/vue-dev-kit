<template>
  <select
    v-if="params.select != null"
    v-model="item[params.name]"
    :disabled="
      params.disable
        ? !item[params.disable] && item[params.disable] !== 0
        : false
    "
    class="table-custom-select table__categories"
    :class="{ 'hidden-item': item[params.name] === undefined }"
    :style="selectStyle"
    @change="$emit('selectUpdate')"
  >
    <option
      v-if="params.select.default != null"
      :value="item[params.name] === null ? null : 0"
    >
      {{ params.select.default }}
    </option>
    <template v-for="(selectItem, selKey) in params.select.items" :key="selKey">
      <option :value="selectItem.id">
        {{
          selectItem.title
            ? selectItem.spacesh
              ? selectItem.spacesh + selectItem.title
              : selectItem.title
            : selectItem.spacesh
              ? selectItem.spacesh + selectItem.name
              : selectItem.name
        }}
      </option>
    </template>
  </select>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  index: { type: Number, default: null },
  params: { type: Object, default: () => ({}) },
  item: { type: Object, default: () => ({}) },
  widthFlex: { type: String, default: "" },
});

defineEmits(["selectUpdate"]);

const selectStyle = computed(() => {
  const base = `flex: ${props.widthFlex};`;
  if (!props.params.style) return base;
  return props.params.style(props.item[props.params.name], props.item) + base;
});
</script>

<style scoped>
.table-custom-select {
  border: 1px solid transparent;
  border-radius: 0.25rem;
  appearance: none;
  background: url(/svg/arrow_black.svg) no-repeat right;
  background-color: inherit;
  background-size: 19px 10px;
  padding: 0.375rem 1.2rem 0.375rem 0.5rem;
  display: flex;
  align-self: center;
  font-size: 12px;
  cursor: pointer;
}

.table-custom-select:focus {
  border: 1px solid #ced4da;
  box-shadow: none;
  outline: none;
}

.table__categories {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.table-custom-select option {
  background-color: #fff;
  color: initial;
}
</style>
