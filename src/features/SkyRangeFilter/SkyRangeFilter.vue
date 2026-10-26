<script setup lang="ts">
import { computed } from 'vue';
import SkyFilterDropdown from '@/shared/ui/SkyFilterDropdown/SkyFilterDropdown.vue';
import FilterDone from '@/shared/ui/SkyFilterDropdown/FilterDone.vue';
import RangePanel, { type RangeValue } from '@/shared/ui/SkyFilterDropdown/panels/RangePanel.vue';

const props = withDefaults(
  defineProps<{
    title: string;
    /** `{ from: null, to: null }` — фільтр вимкнено (у тому числі повний діапазон). */
    modelValue?: RangeValue;
    min?: number;
    max?: number;
    step?: number;
    doneLabel?: string;
    disabled?: boolean;
  }>(),
  {
    modelValue: () => ({ from: null, to: null }),
    min: 0,
    max: 100,
    step: 1,
    doneLabel: 'Готово',
    disabled: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [RangeValue];
}>();

const badge = computed(() => {
  const { from, to } = props.modelValue;
  return from == null || to == null ? '' : `${from} - ${to}`;
});
</script>

<template>
  <SkyFilterDropdown class="sky-range-filter" :title="title" :badge="badge" :disabled="disabled">
    <template #default="{ close }">
      <RangePanel
        :model-value="modelValue"
        :min="min"
        :max="max"
        :step="step"
        @update:model-value="emit('update:modelValue', $event)"
      />
      <FilterDone :label="doneLabel" @done="close" />
    </template>
  </SkyFilterDropdown>
</template>
