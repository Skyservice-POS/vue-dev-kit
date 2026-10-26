<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import {
  addDays,
  defaultDatePresets,
  diffDays,
  parseISODate,
  toISODate,
  today,
  type DatePreset,
  type DateRange,
} from '@/shared/lib/date/dateRange';

/** Що вже обрано на момент перевірки: `start` без `end` — користувач обирає кінець. */
export interface DateCheckContext {
  start: string | null;
  end: string | null;
}

/**
 * Календар вибору періоду: перший клік — початок, другий — кінець (порядок
 * не важливий, переставляємо самі). Назовні йде лише завершений період:
 * напівобраний живе всередині, а якщо панель закрили на ньому, він стає
 * періодом з одного дня.
 *
 * Виключення дат — три рівні, від простого до будь-якого:
 *   • `min` / `max` — межі (напр. `max = today()` вимикає майбутнє);
 *   • `maxDays` — найдовший період: після першого кліку все далі ніж
 *     `maxDays - 1` днів в обидва боки вимикається;
 *   • `disabledDate(date, ctx)` — довільна функція; `ctx` каже, що вже обрано.
 */
const props = withDefaults(
  defineProps<{
    modelValue?: DateRange;
    min?: string;
    max?: string;
    maxDays?: number;
    disabledDate?: (date: string, ctx: DateCheckContext) => boolean;
    /** Кнопки швидкого вибору. `[]` — без них. Для повного контролю розмітки — слот `presets`. */
    presets?: DatePreset[];
    /** 1 — тиждень з понеділка, 0 — з неділі. */
    firstDayOfWeek?: 0 | 1;
    /** 12 назв місяців, із січня. */
    monthNames?: string[];
    /** 7 коротких назв днів, із понеділка. */
    weekdayNames?: string[];
    /** «Очистити» над календарем — для штори й рядка SkyFilters, де свого футера нема. */
    clearable?: boolean;
    clearLabel?: string;
    disabled?: boolean;
  }>(),
  {
    modelValue: () => ({ start: null, end: null }),
    min: undefined,
    max: undefined,
    maxDays: undefined,
    disabledDate: undefined,
    presets: () => defaultDatePresets(),
    firstDayOfWeek: 1,
    monthNames: () => [
      'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
      'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень',
    ],
    weekdayNames: () => ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'],
    clearable: false,
    clearLabel: 'Очистити',
    disabled: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [DateRange];
}>();

defineSlots<{
  /**
   * Замість кнопок швидкого вибору. `presets` — те, що прийшло в однойменний
   * проп (за замовчуванням стандартні), тож їх можна вивести й додати свої.
   */
  presets(props: {
    presets: DatePreset[];
    select: (range: { start: string; end: string }) => void;
    isActive: (range: { start: string; end: string }) => boolean;
    isDisabled: (range: { start: string; end: string }) => boolean;
    value: DateRange;
  }): unknown;
}>();

const pendingStart = ref<string | null>(null);
const hovered = ref<string | null>(null);

function initialView(): { year: number; month: number } {
  const anchor = props.modelValue.end ?? props.modelValue.start ?? (props.max && props.max < today() ? props.max : today());
  const d = parseISODate(anchor);
  return { year: d.getFullYear(), month: d.getMonth() };
}
const view = ref(initialView());

const todayStr = today();

const ctx = computed<DateCheckContext>(() =>
  pendingStart.value ? { start: pendingStart.value, end: null } : { start: props.modelValue.start, end: props.modelValue.end },
);

function isDisabledDate(date: string, c: DateCheckContext = ctx.value): boolean {
  if (props.min && date < props.min) return true;
  if (props.max && date > props.max) return true;
  if (props.maxDays && c.start && !c.end && Math.abs(diffDays(c.start, date)) > props.maxDays - 1) return true;
  return props.disabledDate ? props.disabledDate(date, c) : false;
}

const weekdays = computed(() => {
  const mondayFirst = props.weekdayNames;
  return props.firstDayOfWeek === 1 ? mondayFirst : [mondayFirst[6], ...mondayFirst.slice(0, 6)];
});

/** Завжди 6 тижнів — висота панелі не стрибає між місяцями. */
const cells = computed(() => {
  const first = new Date(view.value.year, view.value.month, 1);
  const shift = (first.getDay() - props.firstDayOfWeek + 7) % 7;
  const startStr = addDays(toISODate(first), -shift);
  return Array.from({ length: 42 }, (_, i) => {
    const date = addDays(startStr, i);
    return { date, day: Number(date.slice(8)), outside: parseISODate(date).getMonth() !== view.value.month };
  });
});

/** Підсвічений відрізок: обраний період або «початок → курсор», поки обирається кінець. */
const span = computed<[string, string] | null>(() => {
  const a = pendingStart.value ?? props.modelValue.start;
  const b = pendingStart.value ? (hovered.value ?? pendingStart.value) : props.modelValue.end;
  if (!a || !b) return null;
  return a <= b ? [a, b] : [b, a];
});

function cellClass(date: string) {
  const s = span.value;
  const isStart = !!s && date === s[0];
  const isEnd = !!s && date === s[1];
  return {
    'is-today': date === todayStr,
    'is-edge': isStart || isEnd,
    // Смуга до сусідньої клітинки — лише коли період довший за день.
    'is-start': isStart && s![0] !== s![1],
    'is-end': isEnd && s![0] !== s![1],
    'is-in-range': !!s && date > s[0] && date < s[1],
  };
}

function pick(date: string): void {
  if (props.disabled || isDisabledDate(date)) return;
  if (!pendingStart.value) {
    pendingStart.value = date;
    return;
  }
  const [start, end] = pendingStart.value <= date ? [pendingStart.value, date] : [date, pendingStart.value];
  pendingStart.value = null;
  emit('update:modelValue', { start, end });
}

function shiftMonth(delta: number): void {
  const d = new Date(view.value.year, view.value.month + delta, 1);
  view.value = { year: d.getFullYear(), month: d.getMonth() };
}

const canPrev = computed(() => !props.min || toISODate(new Date(view.value.year, view.value.month, 0)) >= props.min);
const canNext = computed(() => !props.max || toISODate(new Date(view.value.year, view.value.month + 1, 1)) <= props.max);

function selectRange(range: { start: string; end: string }): void {
  if (props.disabled || isRangeDisabled(range)) return;
  pendingStart.value = null;
  emit('update:modelValue', { start: range.start, end: range.end });
  const d = parseISODate(range.end);
  view.value = { year: d.getFullYear(), month: d.getMonth() };
}

function isRangeActive(range: { start: string; end: string }): boolean {
  return props.modelValue.start === range.start && props.modelValue.end === range.end;
}

/** Пресет недоступний, якщо його краї не можна було б обрати й руками. */
function isRangeDisabled(range: { start: string; end: string }): boolean {
  if (isDisabledDate(range.start, { start: null, end: null })) return true;
  return isDisabledDate(range.end, { start: range.start, end: null });
}

const presetItems = computed(() =>
  props.presets.map((p) => {
    const range = p.range();
    return { label: p.label, range, active: isRangeActive(range), disabled: isRangeDisabled(range) };
  }),
);

function clear(): void {
  pendingStart.value = null;
  emit('update:modelValue', { start: null, end: null });
}

// Панель закрили на півдорозі — обраний початок стає одноденним періодом,
// а не зникає мовчки.
onBeforeUnmount(() => {
  if (pendingStart.value) emit('update:modelValue', { start: pendingStart.value, end: pendingStart.value });
});

defineExpose({ clear });
</script>

<template>
  <div class="sky-date-panel" :class="{ 'is-disabled': disabled }">
    <div v-if="clearable" class="sky-date-panel__actions">
      <button
        type="button"
        class="sky-date-panel__link"
        :disabled="disabled || (!modelValue.start && !pendingStart)"
        @mousedown.prevent
        @click="clear"
      >
        {{ clearLabel }}
      </button>
    </div>

    <div class="sky-date-panel__head">
      <button type="button" class="sky-date-panel__nav" :disabled="!canPrev" aria-label="‹" @mousedown.prevent @click="shiftMonth(-1)">
        <span class="sky-date-panel__arrow sky-date-panel__arrow--left" />
      </button>
      <span class="sky-date-panel__title">{{ monthNames[view.month] }} {{ view.year }}</span>
      <button type="button" class="sky-date-panel__nav" :disabled="!canNext" aria-label="›" @mousedown.prevent @click="shiftMonth(1)">
        <span class="sky-date-panel__arrow sky-date-panel__arrow--right" />
      </button>
    </div>

    <div class="sky-date-panel__grid" role="grid" @mouseleave="hovered = null">
      <span v-for="w in weekdays" :key="w" class="sky-date-panel__weekday">{{ w }}</span>
      <button
        v-for="c in cells"
        :key="c.date"
        type="button"
        class="sky-date-panel__day"
        :class="[cellClass(c.date), { 'is-outside': c.outside }]"
        :disabled="disabled || isDisabledDate(c.date)"
        :aria-label="c.date"
        :aria-pressed="cellClass(c.date)['is-edge']"
        :data-date="c.date"
        @mousedown.prevent
        @mouseenter="hovered = c.date"
        @click="pick(c.date)"
      >
        <span class="sky-date-panel__num">{{ c.day }}</span>
      </button>
    </div>

    <div v-if="$slots.presets || presets.length" class="sky-date-panel__presets">
      <slot
        name="presets"
        :presets="presets"
        :select="selectRange"
        :is-active="isRangeActive"
        :is-disabled="isRangeDisabled"
        :value="modelValue"
      >
        <button
          v-for="p in presetItems"
          :key="p.label"
          type="button"
          class="sky-date-preset"
          :class="{ 'is-active': p.active }"
          :disabled="disabled || p.disabled"
          @mousedown.prevent
          @click="selectRange(p.range)"
        >
          {{ p.label }}
        </button>
      </slot>
    </div>
  </div>
</template>

<style scoped>
/* Вигляд — з FunctionalCalendar у SkyDateRangePicker (calendar.scss + глобальні
   правила пікера): коло дня 30px, період — суцільна смуга #8fd8ec з білим текстом,
   сьогодні — рожеве коло, ховер — сіре коло. Власне тут лише одне: недоступні
   дати перекреслені, а не просто бліді. */
.sky-date-panel {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  color: var(--sky-date-color, #000);
  user-select: none;
}

.sky-date-panel__actions {
  display: flex;
  padding: 0 0 10px;
  font-size: var(--sky-filter-action-font-size, 1rem);
  font-weight: var(--sky-filter-action-font-weight, 500);
}

.sky-date-panel__link {
  padding: 0;
  border: none;
  background: transparent;
  font: inherit;
  color: var(--sky-filter-accent, #106090);
  cursor: pointer;
}

.sky-date-panel__link:disabled {
  opacity: 0.5;
  cursor: default;
}

.sky-date-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.sky-date-panel__title {
  font-size: 18px;
  font-weight: normal;
}

/* .vfc-separately-navigation-buttons > div: квадрат 36px, тонка стрілка-куточок. */
.sky-date-panel__nav {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 0.25rem;
  background: transparent;
  cursor: pointer;
}

.sky-date-panel__nav:hover:not(:disabled) {
  background: rgb(241, 241, 241);
}

.sky-date-panel__nav:disabled {
  cursor: default;
}

.sky-date-panel__arrow {
  width: 10px;
  height: 10px;
  border-top: 2px solid #6e6e6e;
}

.sky-date-panel__arrow--left {
  position: relative;
  left: 2.5px;
  border-left: 2px solid #6e6e6e;
  transform: rotate(-45deg);
}

.sky-date-panel__arrow--right {
  position: relative;
  right: 2.5px;
  border-right: 2px solid #6e6e6e;
  transform: rotate(45deg);
}

.sky-date-panel__nav:disabled .sky-date-panel__arrow {
  border-color: #dddddd;
}

.sky-date-panel__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  row-gap: 3px;
}

.sky-date-panel__weekday {
  margin-bottom: 7px;
  color: #333333;
  text-align: center;
}

/* Клітинка тягне смугу періоду на всю ширину, сам день — коло всередині. */
.sky-date-panel__day {
  display: flex;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  font: inherit;
  color: inherit;
  cursor: pointer;
}

.sky-date-panel__num {
  width: 30px;
  line-height: 30px;
  border-radius: 50%;
  text-align: center;
}

.sky-date-panel__day.is-outside {
  color: #919191;
}

.sky-date-panel__day:hover:not(:disabled):not(.is-edge):not(.is-in-range) .sky-date-panel__num {
  background-color: #dadada;
}

.sky-date-panel__day.is-today .sky-date-panel__num {
  background-color: #ff8498;
  color: #ffffff;
}

.sky-date-panel__day.is-in-range {
  background: var(--sky-date-range-bg, #8fd8ec);
  color: #ffffff;
}

/* Краї: половинна смуга до сусіда (.vfc-base-start / .vfc-base-end) + коло. */
.sky-date-panel__day.is-start {
  background: linear-gradient(to right, transparent 50%, var(--sky-date-range-bg, #8fd8ec) 50%);
}

.sky-date-panel__day.is-end {
  background: linear-gradient(to left, transparent 50%, var(--sky-date-range-bg, #8fd8ec) 50%);
}

.sky-date-panel__day.is-edge .sky-date-panel__num {
  background-color: var(--sky-date-accent, #8fd8ec);
  color: #ffffff;
}

.sky-date-panel__day:disabled {
  color: rgba(0, 0, 0, 0.2);
  text-decoration: line-through;
  cursor: not-allowed;
}

.sky-date-panel__day:focus-visible {
  outline: none;
}

.sky-date-panel__day:focus-visible .sky-date-panel__num {
  outline: 2px solid var(--sky-filter-accent, #106090);
}

/* .footerCon + .datefilter з SkyDateRangePicker. */
.sky-date-panel__presets {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #cdcdce;
}

/* .datebutton / .selectedRangeWraper. Без ховера — лише курсор.
   Через :deep — щоб той самий клас працював і на кнопках зі слота `presets`. */
.sky-date-panel__presets :deep(.sky-date-preset) {
  padding: 5px;
  border: none;
  border-radius: 0.25rem;
  background: transparent;
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
  color: #003d62;
  cursor: pointer;
}

.sky-date-panel__presets :deep(.sky-date-preset.is-active) {
  background-color: #8fd8ec;
  color: #ffffff;
}

.sky-date-panel__presets :deep(.sky-date-preset:disabled) {
  color: #cccccc;
  cursor: not-allowed;
}
</style>
