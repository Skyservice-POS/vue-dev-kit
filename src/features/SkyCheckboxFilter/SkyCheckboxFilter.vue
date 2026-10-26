<script setup lang="ts">
import { computed } from 'vue';
import SkyFilterDropdown from '@/shared/ui/SkyFilterDropdown/SkyFilterDropdown.vue';
import CheckboxPanel from '@/shared/ui/SkyFilterDropdown/panels/CheckboxPanel.vue';
import FilterDone from '@/shared/ui/SkyFilterDropdown/FilterDone.vue';

type OptionValue = string | number;

interface Option {
  value: OptionValue;
  name: string;
}

const props = withDefaults(
  defineProps<{
    title: string;
    options: Option[];
    modelValue?: OptionValue[];
    selectAllLabel?: string;
    clearLabel?: string;
    doneLabel?: string;
    searchPlaceholder?: string;
    /** Сховати «Обрати все» — коли споживач не може прийняти більше одного значення. */
    selectAll?: boolean;
    /** Сховати пошук — для коротких фіксованих списків він лише шумить. */
    searchable?: boolean;
    disabled?: boolean;
  }>(),
  {
    modelValue: () => [],
    selectAll: true,
    searchable: true,
    selectAllLabel: 'Обрати все',
    clearLabel: 'Очистити',
    doneLabel: 'Готово',
    searchPlaceholder: 'Пошук',
    disabled: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [OptionValue[]];
}>();

/** One pick reads better as the option's own name than as "Title: 1". */
const oneSelectedLabel = computed(() => {
  if (props.modelValue.length !== 1) return '';
  const found = props.options.find((o) => o.value === props.modelValue[0]);
  if (!found) return '';
  return found.name.length < 20 ? found.name : found.name.slice(0, 20) + '...';
});

const triggerSummary = computed(() => oneSelectedLabel.value);
const triggerBadge = computed(() => (props.modelValue.length > 1 ? props.modelValue.length : ''));
</script>

<template>
  <SkyFilterDropdown
    class="sky-checkbox-filter"
    :title="title"
    :summary="triggerSummary"
    :badge="triggerBadge"
    :disabled="disabled"
  >
    <template #default="{ close }">
      <CheckboxPanel
        :model-value="modelValue"
        :options="options"
        :title="title"
        :select-all="selectAll"
        :searchable="searchable"
        :select-all-label="selectAllLabel"
        :clear-label="clearLabel"
        :search-placeholder="searchPlaceholder"
        @update:model-value="emit('update:modelValue', $event)"
      />

      <FilterDone :label="doneLabel" @done="close" />
    </template>
  </SkyFilterDropdown>
</template>
