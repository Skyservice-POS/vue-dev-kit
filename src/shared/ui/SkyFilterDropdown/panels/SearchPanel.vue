<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import SkyCheckbox from '@/shared/ui/SkyCheckbox/SkyCheckbox.vue';
import FilterSearch from '../FilterSearch.vue';

type OptionValue = string | number;

interface Option {
  value: OptionValue;
  name: string;
}

export interface SearchPage {
  items: Option[];
  /** Чи є ще сторінки — показує «Показати ще». */
  hasMore?: boolean;
}

export type SearchFetch = (query: { page: number; search: string }) => Promise<SearchPage>;

/**
 * Мульти-вибір із серверним пошуком і посторінковим довантаженням — для списків,
 * яких не віддати цілими (клієнти, зміни). Значення — масив `{ value, name }`, а не
 * голі id: обраний рядок може зникнути зі списку після пошуку, а назву все одно
 * треба показати в тригері.
 */
const props = withDefaults(
  defineProps<{
    fetch: SearchFetch;
    modelValue?: Option[];
    title?: string;
    clearLabel?: string;
    searchPlaceholder?: string;
    emptyLabel?: string;
    loadingLabel?: string;
    loadMoreLabel?: string;
    /** Затримка перед запитом під час набору, мс. */
    debounce?: number;
    disabled?: boolean;
  }>(),
  {
    modelValue: () => [],
    title: '',
    clearLabel: 'Очистити',
    searchPlaceholder: 'Пошук',
    emptyLabel: 'Нічого не знайдено',
    loadingLabel: 'Завантаження…',
    loadMoreLabel: 'Показати ще',
    debounce: 400,
    disabled: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [Option[]];
}>();

const search = ref('');
const items = ref<Option[]>([]);
const page = ref(1);
const hasMore = ref(false);
const loading = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;
// Відповідь на застарілий запит (користувач уже набрав інше) не має перезаписати свіжу.
let requestId = 0;

const selectedValues = computed(() => props.modelValue.map((o) => o.value));

async function load(nextPage: number): Promise<void> {
  const id = ++requestId;
  loading.value = true;
  try {
    const res = await props.fetch({ page: nextPage, search: search.value.trim() });
    if (id !== requestId) return;
    items.value = nextPage === 1 ? res.items : [...items.value, ...res.items];
    page.value = nextPage;
    hasMore.value = Boolean(res.hasMore);
  } catch (err) {
    if (id === requestId) hasMore.value = false;
    console.error('[SkyFilters] search fetch failed', err);
  } finally {
    if (id === requestId) loading.value = false;
  }
}

function onSearch(v: string): void {
  search.value = v;
  clearTimeout(timer);
  timer = setTimeout(() => load(1), props.debounce);
}

function toggle(values: (string | number)[] | boolean): void {
  if (!Array.isArray(values)) return;
  const known = new Map<OptionValue, Option>();
  for (const o of props.modelValue) known.set(o.value, o);
  for (const o of items.value) known.set(o.value, o);
  emit('update:modelValue', values.map((v) => known.get(v)!).filter(Boolean));
}

onMounted(() => load(1));
onBeforeUnmount(() => clearTimeout(timer));
</script>

<template>
  <div class="sky-search-panel">
    <div class="sky-search-panel__actions">
      <button
        type="button"
        class="sky-search-panel__link"
        :disabled="disabled || !modelValue.length"
        @mousedown.prevent
        @click="emit('update:modelValue', [])"
      >
        {{ clearLabel }}
      </button>
    </div>

    <FilterSearch :model-value="search" :placeholder="searchPlaceholder" :label="title" @update:model-value="onSearch" />

    <div class="sky-search-panel__options">
      <div v-for="opt in items" :key="opt.value" class="sky-search-panel__option">
        <SkyCheckbox :model-value="selectedValues" :value="opt.value" :disabled="disabled" @update:model-value="toggle">
          {{ opt.name }}
        </SkyCheckbox>
      </div>

      <p v-if="!loading && !items.length" class="sky-search-panel__note">{{ emptyLabel }}</p>
      <p v-if="loading" class="sky-search-panel__note">{{ loadingLabel }}</p>
      <button
        v-else-if="hasMore"
        type="button"
        class="sky-search-panel__more"
        @mousedown.prevent
        @click="load(page + 1)"
      >
        {{ loadMoreLabel }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.sky-search-panel {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
}

.sky-search-panel__actions {
  display: flex;
  flex-shrink: 0;
  padding: 0 0 10px;
  font-size: var(--sky-filter-action-font-size, 1rem);
  font-weight: var(--sky-filter-action-font-weight, 500);
}

.sky-search-panel__link {
  padding: 0;
  border: none;
  background: transparent;
  font: inherit;
  color: var(--sky-filter-accent, #106090);
  cursor: pointer;
}

.sky-search-panel__link:hover:not(:disabled) {
  text-decoration: underline;
}

.sky-search-panel__link:disabled {
  opacity: 0.5;
  cursor: default;
}

.sky-search-panel__options {
  flex: 1 1 auto;
  min-height: 0;
  max-height: var(--sky-filter-list-max-height, 260px);
  overflow-y: auto;
  padding-top: 3px;
  padding-left: 3px;
}

/* Ті самі метрики рядка, що й у CheckboxPanel. */
.sky-search-panel__option {
  display: flex;
  --sky-checkbox-size: 20px;
  --sky-checkbox-gap: 4px;
  --sky-checkbox-font-size: var(--sky-filter-option-font-size, 10pt);
  --sky-checkbox-line-height: 20px;
  --sky-checkbox-label-margin: 0;
  margin-bottom: 15px;
}

.sky-search-panel__option :deep(.sky-checkbox) {
  flex: 1;
  min-width: 0;
}

.sky-search-panel__note {
  margin: 4px 0 8px;
  font-size: 13px;
  color: var(--sky-filter-badge-color, gray);
}

.sky-search-panel__more {
  width: 100%;
  padding: 6px 0;
  border: none;
  background: transparent;
  font: inherit;
  font-size: 13px;
  color: var(--sky-filter-badge-color, gray);
  text-decoration: underline;
  cursor: pointer;
}
</style>
