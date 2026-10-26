<script setup lang="ts">
import { computed, ref } from 'vue';
import SkyFilterDropdown from '@/shared/ui/SkyFilterDropdown/SkyFilterDropdown.vue';
import DatePanel, { type DateCheckContext } from '@/shared/ui/SkyFilterDropdown/panels/DatePanel.vue';
import { defaultDatePresets, formatDateRange, type DatePreset, type DateRange } from '@/shared/lib/date/dateRange';

const props = withDefaults(
  defineProps<{
    title: string;
    /** `{ start: null, end: null }` — період не задано. Дати — `YYYY-MM-DD`. */
    modelValue?: DateRange;
    /** Найраніша дата, яку можна обрати. */
    min?: string;
    /** Найпізніша дата, яку можна обрати (`today()` — без майбутнього). */
    max?: string;
    /** Найдовший період у днях; після першого кліку решта вимикається. */
    maxDays?: number;
    /** Своє правило виключення дати. `ctx.start` без `ctx.end` — обирається кінець. */
    disabledDate?: (date: string, ctx: DateCheckContext) => boolean;
    /** Кнопки швидкого вибору; `[]` — без них. Повний контроль — слот `presets`. */
    presets?: DatePreset[];
    firstDayOfWeek?: 0 | 1;
    monthNames?: string[];
    weekdayNames?: string[];
    /** Підпис періоду в тригері. */
    formatLabel?: (range: DateRange) => string;
    clearLabel?: string;
    doneLabel?: string;
    width?: number;
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
    monthNames: undefined,
    weekdayNames: undefined,
    formatLabel: formatDateRange,
    clearLabel: 'Очистити',
    doneLabel: 'Готово',
    width: 320,
    disabled: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [DateRange];
}>();

defineSlots<{
  /** Замість кнопок швидкого вибору — див. DatePanel. «Очистити» й «Готово» слот не зачіпає. */
  presets(props: {
    presets: DatePreset[];
    select: (range: { start: string; end: string }) => void;
    isActive: (range: { start: string; end: string }) => boolean;
    isDisabled: (range: { start: string; end: string }) => boolean;
    value: DateRange;
  }): unknown;
}>();

const panelRef = ref<InstanceType<typeof DatePanel> | null>(null);

const badge = computed(() => (props.modelValue.start && props.modelValue.end ? props.formatLabel(props.modelValue) : ''));
const isEmpty = computed(() => !props.modelValue.start && !props.modelValue.end);

function clearAndClose(close: () => void): void {
  // Через панель: вона ж скидає й напівобраний початок, інакше той
  // повернувся б одноденним періодом на закритті.
  panelRef.value?.clear();
  close();
}
</script>

<template>
  <SkyFilterDropdown class="sky-date-filter" :title="title" :badge="badge" :width="width" :disabled="disabled">
    <template #default="{ close }">
      <DatePanel
        ref="panelRef"
        :model-value="modelValue"
        :min="min"
        :max="max"
        :max-days="maxDays"
        :disabled-date="disabledDate"
        :presets="presets"
        :first-day-of-week="firstDayOfWeek"
        :month-names="monthNames"
        :weekday-names="weekdayNames"
        @update:model-value="emit('update:modelValue', $event)"
      >
        <template v-if="$slots.presets" #presets="slotProps">
          <slot name="presets" v-bind="slotProps" />
        </template>
      </DatePanel>

      <!-- Футер — з SkyDateRangePicker: «Очистити» червоним, «Готово» зеленим. -->
      <div class="sky-date-filter__footer">
        <button
          type="button"
          class="sky-date-filter__btn sky-date-filter__btn--clear"
          :disabled="isEmpty"
          @mousedown.prevent
          @click="clearAndClose(close)"
        >
          {{ clearLabel }}
        </button>
        <button type="button" class="sky-date-filter__btn sky-date-filter__btn--done" @mousedown.prevent @click="close">
          {{ doneLabel }}
        </button>
      </div>
    </template>
  </SkyFilterDropdown>
</template>

<style scoped>
/* .datepicker-range-footer з SkyDateRangePicker: праворуч, uppercase, без ховера. */
.sky-date-filter__footer {
  display: flex;
  flex-shrink: 0;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

.sky-date-filter__btn {
  padding: 0 15px 0 0;
  border: none;
  background: transparent;
  font: inherit;
  font-weight: 500;
  text-transform: uppercase;
  cursor: pointer;
}

.sky-date-filter__btn--clear {
  color: var(--sky-date-clear-color, #dc3545);
}

.sky-date-filter__btn--clear:disabled {
  color: #dddddd;
  cursor: default;
}

.sky-date-filter__btn--done {
  color: var(--sky-date-done-color, #28a745);
}

.sky-date-filter__btn:focus-visible {
  outline: 2px solid var(--sky-filter-accent, #106090);
  outline-offset: 2px;
}
</style>
