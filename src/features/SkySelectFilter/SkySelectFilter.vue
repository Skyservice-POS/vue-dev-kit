<script setup lang="ts">
import { computed, ref } from 'vue';
import SkyFilterDropdown from '@/shared/ui/SkyFilterDropdown/SkyFilterDropdown.vue';
import FilterSearch from '@/shared/ui/SkyFilterDropdown/FilterSearch.vue';

type OptionValue = string | number;

interface Option {
  value: OptionValue;
  name: string;
  /** Nesting level for tree-shaped lists; indents the row, nothing more. */
  depth?: number;
}

const props = withDefaults(
  defineProps<{
    title: string;
    options: Option[];
    /** `null` — nothing picked, i.e. the filter is off. */
    modelValue?: OptionValue | null;
    /** Label of the leading "no filter" row; omit to hide that row. */
    allLabel?: string;
    searchPlaceholder?: string;
    emptyLabel?: string;
    searchable?: boolean;
    disabled?: boolean;
  }>(),
  {
    modelValue: null,
    allLabel: '',
    searchPlaceholder: 'Пошук',
    emptyLabel: 'Нічого не знайдено',
    searchable: true,
    disabled: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [OptionValue | null];
}>();

const searchQuery = ref('');

const filteredOptions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return props.options;
  return props.options.filter((o) => o.name.toLowerCase().includes(q));
});

const selectedOption = computed(() =>
  props.modelValue == null ? undefined : props.options.find((o) => o.value === props.modelValue),
);

/** The trigger shows the pick itself; falling back to the title when nothing is picked. */
const triggerSummary = computed(() => {
  const name = selectedOption.value?.name;
  if (!name) return '';
  return name.length < 20 ? name : name.slice(0, 20) + '...';
});

function pick(value: OptionValue | null, close: () => void): void {
  emit('update:modelValue', value);
  close();
}
</script>

<template>
  <SkyFilterDropdown
    class="sky-select-filter"
    :title="title"
    :summary="triggerSummary"
    :disabled="disabled"
    @open="searchQuery = ''"
    @close="searchQuery = ''"
  >
    <template #default="{ close }">
      <FilterSearch
        v-if="searchable"
        v-model="searchQuery"
        :placeholder="searchPlaceholder"
        :label="title"
      />

      <div class="sky-select-filter__options" role="listbox" :aria-label="title">
        <button
          v-if="allLabel && !searchQuery.trim()"
          type="button"
          role="option"
          class="sky-select-filter__option"
          :class="{ 'is-selected': modelValue == null }"
          :aria-selected="modelValue == null"
          @click="pick(null, close)"
        >
          {{ allLabel }}
        </button>

        <button
          v-for="opt in filteredOptions"
          :key="opt.value"
          type="button"
          role="option"
          class="sky-select-filter__option"
          :class="{ 'is-selected': opt.value === modelValue }"
          :aria-selected="opt.value === modelValue"
          :style="{ paddingLeft: `${8 + (opt.depth ?? 0) * 14}px` }"
          @click="pick(opt.value, close)"
        >
          {{ opt.name }}
        </button>

        <p v-if="!filteredOptions.length" class="sky-select-filter__empty">{{ emptyLabel }}</p>
      </div>
    </template>
  </SkyFilterDropdown>
</template>

<style scoped>
/* The panel caps its own height, so the option list is what scrolls inside it. */
.sky-select-filter__options {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  margin: 0 -5px;
}

.sky-select-filter__option {
  display: block;
  width: 100%;
  padding: 6px 8px;
  border: none;
  border-radius: 4px;
  background: transparent;
  font: inherit;
  font-size: 14px;
  color: inherit;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.sky-select-filter__option:hover {
  background: var(--sky-filter-option-hover-bg, rgba(0, 0, 0, 0.05));
}

.sky-select-filter__option.is-selected {
  background: var(--sky-filter-option-selected-bg, rgba(16, 96, 144, 0.1));
  color: var(--sky-filter-accent, #106090);
  font-weight: 500;
}

.sky-select-filter__empty {
  margin: 0;
  padding: 8px;
  font-size: 13px;
  color: var(--sky-filter-muted-color, #adb5bd);
}
</style>
