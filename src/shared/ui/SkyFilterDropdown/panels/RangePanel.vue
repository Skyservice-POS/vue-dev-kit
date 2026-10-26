<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';

export interface RangeValue {
  from: number | null;
  to: number | null;
}

/**
 * Дуплекс-слайдер числового діапазону + два поля. Повзунок власний, без
 * <input type="range">: два накладені нативні range не можна точно звести з
 * відсотковою смугою (thumb ходить у межах track мінус свою ширину), і «from
 * не більше to» доводилось би правити вже після перетягування.
 *
 * Повний діапазон (обидва краї на min/max) — це «фільтр вимкнено», тож емітимо
 * `{ from: null, to: null }`, те саме, що й порожнє значення.
 */
const props = withDefaults(
  defineProps<{
    modelValue?: RangeValue;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
  }>(),
  {
    modelValue: () => ({ from: null, to: null }),
    min: 0,
    max: 100,
    step: 1,
    disabled: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [RangeValue];
}>();

const trackRef = ref<HTMLDivElement | null>(null);
const fromValue = ref<number | string>(props.modelValue.from ?? props.min);
const toValue = ref<number | string>(props.modelValue.to ?? props.max);
const isValid = ref(true);

watch(
  () => [props.modelValue.from, props.modelValue.to, props.min, props.max] as const,
  ([from, to, min, max]) => {
    fromValue.value = from ?? min;
    toValue.value = to ?? max;
    isValid.value = true;
  },
);

const span = computed(() => props.max - props.min);
const fromNum = computed(() => Number(fromValue.value) || props.min);
const toNum = computed(() => (toValue.value === '' ? props.max : Number(toValue.value)));

function clampPercent(p: number): number {
  return Math.min(100, Math.max(0, p));
}

const leftPercent = computed(() => (span.value ? clampPercent(((fromNum.value - props.min) / span.value) * 100) : 0));
const rightPercent = computed(() => (span.value ? clampPercent(((toNum.value - props.min) / span.value) * 100) : 100));

/** Знаки після коми беремо зі `step`: інакше 0.1 + 0.2 лишає хвіст IEEE 754. */
const decimals = computed(() => {
  const s = String(props.step);
  const dot = s.indexOf('.');
  return dot === -1 ? 0 : s.length - dot - 1;
});

function round(v: number): number {
  return Number(v.toFixed(decimals.value));
}

function currentValue(): RangeValue {
  const from = round(fromNum.value);
  const to = round(toNum.value);
  if (from <= props.min && to >= props.max) return { from: null, to: null };
  return { from, to };
}

function onFromInput(raw: string): void {
  const n = Number(raw);
  fromValue.value = raw;
  isValid.value = raw !== '' && !Number.isNaN(n) && n >= props.min && n <= toNum.value;
  if (isValid.value) emit('update:modelValue', currentValue());
}

function onToInput(raw: string): void {
  const n = Number(raw);
  toValue.value = raw;
  isValid.value = raw !== '' && !Number.isNaN(n) && n <= props.max && n >= fromNum.value;
  if (isValid.value) emit('update:modelValue', currentValue());
}

function valueAt(clientX: number): number {
  const rect = trackRef.value!.getBoundingClientRect();
  const percent = rect.width ? clampPercent(((clientX - rect.left) / rect.width) * 100) : 0;
  const raw = props.min + (percent / 100) * span.value;
  const stepped = Math.round(raw / props.step) * props.step;
  return round(Math.min(props.max, Math.max(props.min, stepped)));
}

let stop: (() => void) | null = null;

function startDrag(thumb: 'from' | 'to', e: PointerEvent): void {
  if (props.disabled) return;
  e.preventDefault();
  isValid.value = true;
  const move = (ev: PointerEvent) => {
    const v = valueAt(ev.clientX);
    if (thumb === 'from') fromValue.value = Math.min(v, toNum.value);
    else toValue.value = Math.max(v, fromNum.value);
  };
  const up = () => {
    stop?.();
    emit('update:modelValue', currentValue());
  };
  document.addEventListener('pointermove', move);
  document.addEventListener('pointerup', up);
  stop = () => {
    document.removeEventListener('pointermove', move);
    document.removeEventListener('pointerup', up);
    stop = null;
  };
}

onBeforeUnmount(() => stop?.());
</script>

<template>
  <div class="sky-range-panel" :class="{ 'is-disabled': disabled }">
    <div class="sky-range-panel__inputs">
      <input
        type="text"
        inputmode="decimal"
        class="sky-range-panel__input"
        :class="{ 'is-error': !isValid }"
        :value="fromValue"
        :disabled="disabled"
        aria-label="from"
        @input="onFromInput(($event.target as HTMLInputElement).value)"
      />
      <span class="sky-range-panel__dash">-</span>
      <input
        type="text"
        inputmode="decimal"
        class="sky-range-panel__input"
        :class="{ 'is-error': !isValid }"
        :value="toValue"
        :disabled="disabled"
        aria-label="to"
        @input="onToInput(($event.target as HTMLInputElement).value)"
      />
    </div>

    <div ref="trackRef" class="sky-range-panel__track-wrap">
      <div class="sky-range-panel__track" />
      <div class="sky-range-panel__selected" :style="{ left: `${leftPercent}%`, width: `${rightPercent - leftPercent}%` }" />
      <div class="sky-range-panel__thumb" :style="{ left: `${leftPercent}%` }" @pointerdown="startDrag('from', $event)" />
      <div class="sky-range-panel__thumb" :style="{ left: `${rightPercent}%` }" @pointerdown="startDrag('to', $event)" />
    </div>
  </div>
</template>

<style scoped>
.sky-range-panel {
  padding: 4px 2px 2px;
}

.sky-range-panel__inputs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.sky-range-panel__input {
  box-sizing: border-box;
  width: 80px;
  height: 32px;
  padding: 4px 6px;
  border: 1px solid rgba(128, 128, 128, 0.4);
  border-radius: 5px;
  font: inherit;
  font-size: 14px;
  text-align: center;
}

.sky-range-panel__input.is-error {
  border-color: #f90505;
}

.sky-range-panel__dash {
  color: gray;
}

.sky-range-panel__track-wrap {
  position: relative;
  height: 16px;
  margin: 6px 8px 12px;
}

.sky-range-panel__track,
.sky-range-panel__selected {
  position: absolute;
  top: 50%;
  height: 4px;
  border-radius: 2px;
  transform: translateY(-50%);
}

.sky-range-panel__track {
  left: 0;
  right: 0;
  background: #e0e0e0;
}

.sky-range-panel__selected {
  background: var(--sky-filter-range-accent, #28a745);
}

.sky-range-panel__thumb {
  position: absolute;
  top: 50%;
  box-sizing: border-box;
  width: 16px;
  height: 16px;
  border: 2px solid #fff;
  border-radius: 50%;
  background: var(--sky-filter-range-accent, #28a745);
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.15),
    0 1px 2px rgba(0, 0, 0, 0.2);
  transform: translate(-50%, -50%);
  cursor: pointer;
  /* Інакше перетягування пальцем одночасно скролить сторінку. */
  touch-action: none;
}

.sky-range-panel.is-disabled .sky-range-panel__thumb {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
