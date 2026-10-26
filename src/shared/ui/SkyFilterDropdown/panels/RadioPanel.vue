<script setup lang="ts">
import { computed, ref } from 'vue';
import FilterSearch from '../FilterSearch.vue';

type OptionValue = string | number;

interface Option {
  value: OptionValue;
  name: string;
}

/** Складене значення, коли в частини пунктів є числовий інпут (`inputFor`). */
export interface RadioWithInput {
  value: OptionValue | null;
  input: string;
}

/**
 * Одиничний вибір радіо-кнопками. На відміну від SkySelectFilter, вибір не закриває
 * панель і є «Очистити». Пункти з `inputFor` отримують числовий інпут під лейблом:
 * введення в нього одночасно обирає пункт, а без числа такий вибір не вважається
 * застосованим (dynamicFilter «прийшли/пішли N клієнтів» в адмінці).
 */
const props = withDefaults(
  defineProps<{
    options: Option[];
    modelValue?: OptionValue | RadioWithInput | null;
    title?: string;
    /** Пункти, що мають числовий інпут. Якщо задано — значення стає `{ value, input }`. */
    inputFor?: OptionValue[];
    /** Підпис праворуч від інпуту (напр. «клієнтів»). */
    inputHint?: string;
    clearable?: boolean;
    searchable?: boolean;
    clearLabel?: string;
    searchPlaceholder?: string;
    emptyLabel?: string;
    disabled?: boolean;
  }>(),
  {
    modelValue: null,
    title: '',
    inputFor: () => [],
    inputHint: '',
    clearable: true,
    searchable: false,
    clearLabel: 'Очистити',
    searchPlaceholder: 'Пошук',
    emptyLabel: 'Нічого не знайдено',
    disabled: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [OptionValue | RadioWithInput | null];
}>();

// Ім'я групи — щоб стрілки клавіатури ходили лише в межах цього фільтра.
const groupName = `sky-radio-${Math.random().toString(36).slice(2, 9)}`;
const searchQuery = ref('');

const hasInput = computed(() => props.inputFor.length > 0);

const composite = computed<RadioWithInput>(() => {
  const v = props.modelValue;
  if (v && typeof v === 'object') return v;
  return { value: null, input: '' };
});

const selectedValue = computed(() => (hasInput.value ? composite.value.value : (props.modelValue as OptionValue | null)));

const filteredOptions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return props.options;
  return props.options.filter((o) => o.name.toLowerCase().includes(q));
});

function pick(value: OptionValue): void {
  if (!hasInput.value) {
    emit('update:modelValue', value);
    return;
  }
  // Перемикання на пункт без інпуту скидає раніше введене число.
  const input = props.inputFor.includes(value) && composite.value.value === value ? composite.value.input : '';
  emit('update:modelValue', { value, input });
}

function onInput(value: OptionValue, raw: string): void {
  emit('update:modelValue', { value, input: raw.replace(/[^\d]/g, '') });
}

function inputValueFor(value: OptionValue): string {
  return composite.value.value === value ? composite.value.input : '';
}

/** Обрано пункт, що вимагає числа, а числа ще нема — підсвічуємо інпут. */
function isPending(value: OptionValue): boolean {
  return selectedValue.value === value && !inputValueFor(value);
}

function clear(): void {
  emit('update:modelValue', hasInput.value ? { value: null, input: '' } : null);
}
</script>

<template>
  <div class="sky-radio-panel">
    <div v-if="clearable" class="sky-radio-panel__actions">
      <button type="button" class="sky-radio-panel__link" :disabled="disabled" @mousedown.prevent @click="clear">
        {{ clearLabel }}
      </button>
    </div>

    <FilterSearch v-if="searchable" v-model="searchQuery" :placeholder="searchPlaceholder" :label="title" />

    <div class="sky-radio-panel__options" role="radiogroup" :aria-label="title">
      <div v-for="opt in filteredOptions" :key="opt.value" class="sky-radio-panel__row">
        <label class="sky-radio-panel__option" :class="{ 'is-disabled': disabled }">
          <input
            type="radio"
            class="sky-radio-panel__input"
            :name="groupName"
            :checked="selectedValue === opt.value"
            :disabled="disabled"
            @change="pick(opt.value)"
          />
          <span class="sky-radio-panel__circle" />
          <span class="sky-radio-panel__label">{{ opt.name }}</span>
        </label>

        <div v-if="inputFor.includes(opt.value)" class="sky-radio-panel__companion">
          <input
            type="text"
            inputmode="numeric"
            class="sky-radio-panel__number"
            :class="{ 'is-error': isPending(opt.value) }"
            :value="inputValueFor(opt.value)"
            :disabled="disabled"
            :aria-label="`${opt.name} ${inputHint}`"
            @input="onInput(opt.value, ($event.target as HTMLInputElement).value)"
          />
          <span v-if="inputHint">{{ inputHint }}</span>
        </div>
      </div>

      <p v-if="!filteredOptions.length" class="sky-radio-panel__empty">{{ emptyLabel }}</p>
    </div>
  </div>
</template>

<style scoped>
/* Метрики — ті самі, що в CheckboxPanel: шапка 16px/500/#106090, рядок 20px,
   крок 35px, текст 10pt. Радіо відрізняється від чекбокса лише формою бокса. */
.sky-radio-panel {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
}

.sky-radio-panel__actions {
  display: flex;
  flex-shrink: 0;
  padding: 0 0 10px;
  font-size: var(--sky-filter-action-font-size, 1rem);
  font-weight: var(--sky-filter-action-font-weight, 500);
  white-space: nowrap;
}

.sky-radio-panel__link {
  padding: 0;
  border: none;
  background: transparent;
  font: inherit;
  color: var(--sky-filter-accent, #106090);
  cursor: pointer;
  outline: none;
}

.sky-radio-panel__link:focus-visible {
  outline: 2px solid var(--sky-filter-accent, #106090);
  outline-offset: 2px;
}

.sky-radio-panel__link:hover:not(:disabled) {
  text-decoration: underline;
}

.sky-radio-panel__link:disabled {
  opacity: 0.5;
  cursor: default;
}

.sky-radio-panel__options {
  flex: 1 1 auto;
  min-height: 0;
  max-height: var(--sky-filter-list-max-height, none);
  overflow-y: auto;
  padding-top: 3px;
  padding-left: 3px;
}

.sky-radio-panel__row {
  margin-bottom: 15px;
}

.sky-radio-panel__option {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--sky-filter-option-font-size, 10pt);
  line-height: 20px;
  cursor: pointer;
  user-select: none;
}

.sky-radio-panel__option.is-disabled {
  opacity: 0.5;
  cursor: default;
}

.sky-radio-panel__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.sky-radio-panel__circle {
  position: relative;
  flex-shrink: 0;
  box-sizing: border-box;
  width: 20px;
  height: 20px;
  border: 1px solid var(--sky-checkbox-border-color, #adb5bd);
  border-radius: 50%;
  background: #fff;
  transition:
    background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out;
}

.sky-radio-panel__circle::after {
  content: '';
  position: absolute;
  inset: 5px;
  border-radius: 50%;
  background: #fff;
  opacity: 0;
}

.sky-radio-panel__input:checked + .sky-radio-panel__circle {
  background: var(--sky-checkbox-accent, #28a745);
  border-color: var(--sky-checkbox-accent, #28a745);
}

.sky-radio-panel__input:checked + .sky-radio-panel__circle::after {
  opacity: 1;
}

.sky-radio-panel__input:focus-visible + .sky-radio-panel__circle {
  outline: 2px solid var(--sky-filter-accent, #106090);
  outline-offset: 2px;
}

.sky-radio-panel__label {
  min-width: 0;
}

/* Окремим рядком під лейблом, з відступом під кружечок: довгий лейбл переноситься,
   і інпут в одному рядку з ним ламав верстку. */
.sky-radio-panel__companion {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 4px 0 0 24px;
  font-size: var(--sky-filter-option-font-size, 10pt);
}

.sky-radio-panel__number {
  width: 60px;
  padding: 2px 0;
  border: none;
  border-bottom: 2px solid #d3d3d3;
  outline: none;
  background: transparent;
  font: inherit;
  text-align: center;
  transition: border-color 200ms;
}

.sky-radio-panel__number:focus {
  border-bottom-color: var(--sky-filter-accent, #106090);
}

.sky-radio-panel__number.is-error {
  border-bottom-color: #f90505;
}

.sky-radio-panel__empty {
  margin: 4px 0;
  font-size: 13px;
  color: var(--sky-filter-badge-color, gray);
}
</style>
