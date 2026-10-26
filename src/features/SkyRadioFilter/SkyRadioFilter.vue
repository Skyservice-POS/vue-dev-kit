<script setup lang="ts">
import { computed } from 'vue';
import SkyFilterDropdown from '@/shared/ui/SkyFilterDropdown/SkyFilterDropdown.vue';
import FilterDone from '@/shared/ui/SkyFilterDropdown/FilterDone.vue';
import RadioPanel, { type RadioWithInput } from '@/shared/ui/SkyFilterDropdown/panels/RadioPanel.vue';

type OptionValue = string | number;

interface Option {
  value: OptionValue;
  name: string;
}

const props = withDefaults(
  defineProps<{
    title: string;
    options: Option[];
    /** `null` — нічого не обрано. З `inputFor` — `{ value, input }`. */
    modelValue?: OptionValue | RadioWithInput | null;
    /** Пункти з числовим інпутом під лейблом. Без числа такий вибір не активний. */
    inputFor?: OptionValue[];
    /** Підпис праворуч від інпуту, напр. «клієнтів». */
    inputHint?: string;
    clearable?: boolean;
    searchable?: boolean;
    clearLabel?: string;
    doneLabel?: string;
    searchPlaceholder?: string;
    emptyLabel?: string;
    disabled?: boolean;
  }>(),
  {
    modelValue: null,
    inputFor: () => [],
    inputHint: '',
    clearable: true,
    searchable: false,
    clearLabel: 'Очистити',
    doneLabel: 'Готово',
    searchPlaceholder: 'Пошук',
    emptyLabel: 'Нічого не знайдено',
    disabled: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [OptionValue | RadioWithInput | null];
}>();

function short(name: string): string {
  return name.length < 20 ? name : name.slice(0, 20) + '...';
}

/** Обраний пункт замінює назву в тригері; введене число — бейдж поруч. */
const display = computed(() => {
  const v = props.modelValue;
  if (props.inputFor.length) {
    const c = (v && typeof v === 'object' ? v : { value: null, input: '' }) as RadioWithInput;
    if (c.value == null) return { summary: '', badge: '' };
    const needsNumber = props.inputFor.includes(c.value);
    // Пункт вимагає числа, а його ще нема — фільтр не застосований.
    if (needsNumber && !c.input) return { summary: '', badge: '' };
    const name = props.options.find((o) => o.value === c.value)?.name ?? '';
    return { summary: short(name), badge: needsNumber ? c.input : '' };
  }
  if (v == null) return { summary: '', badge: '' };
  const name = props.options.find((o) => o.value === v)?.name ?? '';
  return { summary: short(name), badge: '' };
});
</script>

<template>
  <SkyFilterDropdown
    class="sky-radio-filter"
    :title="title"
    :summary="display.summary"
    :badge="display.badge"
    :disabled="disabled"
  >
    <template #default="{ close }">
      <RadioPanel
        :model-value="modelValue"
        :options="options"
        :title="title"
        :input-for="inputFor"
        :input-hint="inputHint"
        :clearable="clearable"
        :searchable="searchable"
        :clear-label="clearLabel"
        :search-placeholder="searchPlaceholder"
        :empty-label="emptyLabel"
        @update:model-value="emit('update:modelValue', $event)"
      />
      <FilterDone :label="doneLabel" @done="close" />
    </template>
  </SkyFilterDropdown>
</template>
