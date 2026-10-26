<script setup lang="ts">
import { computed } from 'vue';
import SkyFilterDropdown from '@/shared/ui/SkyFilterDropdown/SkyFilterDropdown.vue';
import FilterDone from '@/shared/ui/SkyFilterDropdown/FilterDone.vue';
import SearchPanel, { type SearchFetch } from '@/shared/ui/SkyFilterDropdown/panels/SearchPanel.vue';

type OptionValue = string | number;

interface Option {
  value: OptionValue;
  name: string;
}

const props = withDefaults(
  defineProps<{
    title: string;
    /** `({ page, search }) => Promise<{ items, hasMore }>` — сторінка результатів. */
    fetch: SearchFetch;
    /** Обрані рядки разом із назвами: після пошуку рядка може вже не бути у списку. */
    modelValue?: Option[];
    clearLabel?: string;
    doneLabel?: string;
    searchPlaceholder?: string;
    emptyLabel?: string;
    loadingLabel?: string;
    loadMoreLabel?: string;
    debounce?: number;
    width?: number;
    disabled?: boolean;
  }>(),
  {
    modelValue: () => [],
    clearLabel: 'Очистити',
    doneLabel: 'Готово',
    searchPlaceholder: 'Пошук',
    emptyLabel: 'Нічого не знайдено',
    loadingLabel: 'Завантаження…',
    loadMoreLabel: 'Показати ще',
    debounce: 400,
    width: 320,
    disabled: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [Option[]];
}>();

const summary = computed(() => {
  if (props.modelValue.length !== 1) return '';
  const name = props.modelValue[0].name;
  return name.length < 20 ? name : name.slice(0, 20) + '...';
});
const badge = computed(() => (props.modelValue.length > 1 ? props.modelValue.length : ''));
</script>

<template>
  <SkyFilterDropdown
    class="sky-search-filter"
    :title="title"
    :summary="summary"
    :badge="badge"
    :width="width"
    :disabled="disabled"
  >
    <template #default="{ close }">
      <SearchPanel
        :model-value="modelValue"
        :fetch="fetch"
        :title="title"
        :clear-label="clearLabel"
        :search-placeholder="searchPlaceholder"
        :empty-label="emptyLabel"
        :loading-label="loadingLabel"
        :load-more-label="loadMoreLabel"
        :debounce="debounce"
        @update:model-value="emit('update:modelValue', $event)"
      />
      <FilterDone :label="doneLabel" @done="close" />
    </template>
  </SkyFilterDropdown>
</template>
