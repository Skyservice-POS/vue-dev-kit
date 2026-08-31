<script setup lang="ts">
import { computed, ref } from 'vue';
import SkyCheckbox from '@/shared/ui/SkyCheckbox/SkyCheckbox.vue';
import SkyFilterDropdown from '@/shared/ui/SkyFilterDropdown/SkyFilterDropdown.vue';
import FilterSearch from '@/shared/ui/SkyFilterDropdown/FilterSearch.vue';

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
    disabled?: boolean;
  }>(),
  {
    modelValue: () => [],
    selectAllLabel: 'Вибрати всі',
    clearLabel: 'Очистити',
    doneLabel: 'Готово',
    searchPlaceholder: 'Пошук',
    disabled: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [OptionValue[]];
}>();

const searchQuery = ref('');

const filteredOptions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return props.options;
  return props.options.filter((o) => o.name.toLowerCase().includes(q));
});

const selected = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

/** One pick reads better as the option's own name than as "Title: 1". */
const oneSelectedLabel = computed(() => {
  if (selected.value.length !== 1) return '';
  const found = props.options.find((o) => o.value === selected.value[0]);
  if (!found) return '';
  return found.name.length < 20 ? found.name : found.name.slice(0, 20) + '...';
});

const triggerSummary = computed(() => oneSelectedLabel.value);
const triggerBadge = computed(() => (selected.value.length > 1 ? selected.value.length : ''));

function selectAll(): void {
  selected.value = props.options.map((o) => o.value);
}

function clearAll(): void {
  selected.value = [];
}
</script>

<template>
  <SkyFilterDropdown
    class="sky-checkbox-filter"
    :title="title"
    :summary="triggerSummary"
    :badge="triggerBadge"
    :disabled="disabled"
    @open="searchQuery = ''"
    @close="searchQuery = ''"
  >
    <template #default="{ close }">
      <div class="sky-checkbox-filter__actions">
        <button type="button" class="sky-checkbox-filter__link" @click="selectAll">
          {{ selectAllLabel }}
        </button>
        <button type="button" class="sky-checkbox-filter__link" @click="clearAll">
          {{ clearLabel }}
        </button>
      </div>

      <FilterSearch v-model="searchQuery" :placeholder="searchPlaceholder" :label="title" />

      <div class="sky-checkbox-filter__options">
        <div v-for="opt in filteredOptions" :key="opt.value" class="sky-checkbox-filter__option">
          <SkyCheckbox v-model="selected" :value="opt.value">{{ opt.name }}</SkyCheckbox>
        </div>
      </div>

      <hr class="sky-checkbox-filter__sep" />
      <div class="sky-checkbox-filter__actions sky-checkbox-filter__actions--footer">
        <button type="button" class="sky-checkbox-filter__link" @click="close">
          {{ doneLabel }}
        </button>
      </div>
    </template>
  </SkyFilterDropdown>
</template>

<style scoped>
.sky-checkbox-filter__actions {
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 13px;
}

.sky-checkbox-filter__actions--footer {
  padding: 10px 0 0;
}

.sky-checkbox-filter__link {
  padding: 0;
  border: none;
  background: transparent;
  font: inherit;
  color: var(--sky-filter-accent, #106090);
  cursor: pointer;
}

.sky-checkbox-filter__link:hover {
  text-decoration: underline;
}

/* The panel caps its own height, so the option list is what scrolls inside it. */
.sky-checkbox-filter__options {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}

.sky-checkbox-filter__option {
  padding: 0 4px;
  margin-bottom: 5px;
}

.sky-checkbox-filter__sep {
  flex-shrink: 0;
  margin: 0 0 2px;
}
</style>
