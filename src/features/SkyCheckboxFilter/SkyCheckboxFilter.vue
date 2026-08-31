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
    /** Сховати «Обрати все» — коли споживач не може прийняти більше одного значення. */
    selectAll?: boolean;
    disabled?: boolean;
  }>(),
  {
    modelValue: () => [],
    selectAll: true,
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

function selectAllOptions(): void {
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
        <button v-if="selectAll" type="button" class="sky-checkbox-filter__link" @click="selectAllOptions">
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
/* Метрики зняті з адмінки (Bootstrap 4.6 .custom-control + правила
   headerFiltersNew/Dashboard) і відтворені 1:1:
   .dialog-buttons  → 16px / 500 / #106090, знизу 10px у шапці, зверху 10px у футері
   .dialogHF        → padding-left: 3px
   рядок            → бокс 16px зі зсувом 4px, текст із 24px, крок між рядками 34.98px
   label            → 10pt / line-height 20px / padding-top 2px */
.sky-checkbox-filter__actions {
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
  gap: 12px;
  padding: 0 0 10px;
  font-size: var(--sky-filter-action-font-size, 1rem);
  font-weight: var(--sky-filter-action-font-weight, 500);
  white-space: nowrap;
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

/* Панель сама обмежує висоту, тож скролиться список, а не сторінка. */
.sky-checkbox-filter__options {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding-left: 3px;
}

.sky-checkbox-filter__option {
  /* flex, а не block: інлайновий SkyCheckbox інакше тягне за собою strut
     від line-height хоста, і крок рядків їде. */
  display: flex;
  /* Бокс 20px, не Bootstrap-івський дефолт 16: Dashboard.vue глобально перебиває
     .custom-checkbox > .custom-control-label::before на 20px !important. Текст при
     цьому лишається на 24px від краю рядка, тож зазор виходить 4px, а не 8. */
  --sky-checkbox-size: 20px;
  --sky-checkbox-gap: 4px;
  --sky-checkbox-font-size: 10pt;
  --sky-checkbox-line-height: 20px;
  --sky-checkbox-label-margin: 0;
  /* Текст центрується по боксу, а не як в адмінці. Там Bootstrap ставить ::before на
     top: 4px під розмір 16px, а Dashboard.vue роздуває бокс до 20px, не чіпаючи top —
     через це текст виявляється на 3px вище центру. Це баг, а не рішення, тож не
     копіюємо: у нас обидва по 20px і align-items: center дає рівно 0.
     Крок рядків лишається 35px (рядок 20 + 15). */
  margin-bottom: 15px;
}

/* Єдине свідоме відхилення від адмінки, і воно невидиме: там лейбл завширшки з
   текст, тож клік праворуч від напису нікуди не потрапляє. Розтягуємо його на
   весь рядок — позиція тексту та сама, ціль для кліка нормальна. */
.sky-checkbox-filter__option :deep(.sky-checkbox) {
  flex: 1;
  min-width: 0;
}

.sky-checkbox-filter__sep {
  flex-shrink: 0;
  margin: 0 0 2px;
  border: 0;
  border-top: 1px solid var(--sky-filter-separator-color, rgba(0, 0, 0, 0.1));
}
</style>
