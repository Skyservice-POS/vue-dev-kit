<script setup lang="ts">
import { computed, useAttrs } from "vue";

const props = defineProps<{
  modelValue: boolean | (string | number)[];
  /** Обов'язковий, коли `modelValue` — масив: саме він кладеться/знімається. */
  value?: string | number;
  switch?: boolean;
  disabled?: boolean;
  /**
   * Третій стан нативного чекбокса — «обрано частину». Візуально це риска
   * замість галочки; на `checked` не впливає, як і в DOM.
   */
  indeterminate?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean | (string | number)[]];
}>();

defineOptions({ inheritAttrs: false });

// class/style лишаються на корені (споживачі позиціонують саме обгортку), решта
// атрибутів їде на <input> — name, required, tabindex, aria-* стосуються контрола,
// і на <label> вони просто нічого не роблять.
const attrs = useAttrs();
const rootAttrs = computed(() => ({ class: attrs.class, style: attrs.style }));
const inputAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

// computed, а не значення з setup: props реактивні за контрактом Vue, тож
// зчитане один раз перемикання перестало б відповідати пропу після зміни.
const switchMode = computed(() => props.switch);

const isChecked = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(props.value as string | number);
  }
  return props.modelValue;
});

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement;

  if (!Array.isArray(props.modelValue)) {
    emit("update:modelValue", target.checked);
    return;
  }

  // Без `value` у режимі масиву класти в список нема чого: раніше туди їхав
  // undefined і мовчки псував дані споживача.
  if (props.value === undefined) {
    console.warn(
      "[SkyCheckbox] `modelValue` є масивом, але проп `value` не заданий — класти в список " +
        "нема чого, зміну проігноровано.",
    );
    return;
  }

  const next = [...props.modelValue];
  if (target.checked) {
    if (!next.includes(props.value)) next.push(props.value);
  } else {
    const at = next.indexOf(props.value);
    // splice(-1, 1) зрізав би останній елемент — тобто зняття галочки з
    // відсутнього значення видаляло б чужий, ні до чого не причетний запис.
    if (at !== -1) next.splice(at, 1);
  }
  emit("update:modelValue", next);
}
</script>

<template>
  <label
    v-bind="rootAttrs"
    class="sky-checkbox"
    :class="{
      'sky-checkbox--switch': switchMode,
      'sky-checkbox--disabled': disabled,
    }"
  >
    <input
      v-bind="inputAttrs"
      type="checkbox"
      class="sky-checkbox__input"
      :checked="isChecked"
      :indeterminate.prop="indeterminate"
      :disabled="disabled"
      @change="handleChange"
    />

    <!-- Switch -->
    <span v-if="switchMode" class="sky-checkbox__track">
      <span class="sky-checkbox__thumb" />
    </span>

    <!-- Classic checkbox -->
    <span v-else class="sky-checkbox__box">
      <svg class="sky-checkbox__check" viewBox="0 0 10 8" fill="none">
        <path
          d="M1 4L3.5 6.5L9 1"
          stroke="white"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span class="sky-checkbox__dash" />
    </span>

    <span v-if="$slots.default" class="sky-checkbox__label">
      <slot />
    </span>
  </label>
</template>

<style scoped>
.sky-checkbox {
  display: inline-flex;
  align-items: var(--sky-checkbox-align, center);
  gap: var(--sky-checkbox-gap, 8px);
  cursor: pointer;
  user-select: none;
  font-size: var(--sky-checkbox-font-size, 14px);
  line-height: var(--sky-checkbox-line-height, 1.5);
  font-weight: 400;
  color: var(--sky-checkbox-color, #212529);
  margin-bottom: 0;
}

.sky-checkbox--disabled {
  opacity: 0.5;
  cursor: default;
  pointer-events: none;
}

.sky-checkbox__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

/* ── Classic checkbox ── */
.sky-checkbox__box {
  position: relative; /* якір для .sky-checkbox__dash */
  flex-shrink: 0;
  box-sizing: border-box;
  width: var(--sky-checkbox-size, 16px);
  height: var(--sky-checkbox-size, 16px);
  margin-top: var(--sky-checkbox-box-offset, 0);
  border-radius: var(--sky-checkbox-radius, 4px);
  border: 1px solid var(--sky-checkbox-border-color, #adb5bd);
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out;
}

.sky-checkbox__check {
  /* Пропорція галочки до бокса (9×7 при 16px) — щоб вона їхала разом із розміром. */
  width: calc(var(--sky-checkbox-size, 16px) * 0.5625);
  height: calc(var(--sky-checkbox-size, 16px) * 0.4375);
  opacity: 0;
  transition: opacity 0.1s ease-in-out;
}

/* Риска для третього стану — «обрано частину». */
.sky-checkbox__dash {
  position: absolute;
  width: calc(var(--sky-checkbox-size, 16px) * 0.5);
  height: 2px;
  border-radius: 1px;
  background: #fff;
  opacity: 0;
  transition: opacity 0.1s ease-in-out;
}

.sky-checkbox__input:checked ~ .sky-checkbox__box,
.sky-checkbox__input:indeterminate ~ .sky-checkbox__box {
  background-color: var(--sky-checkbox-accent, #28a745);
  border-color: var(--sky-checkbox-accent, #28a745);
}

/* indeterminate б'є checked, як і в DOM: третій стан видно навіть на checked. */
.sky-checkbox__input:indeterminate ~ .sky-checkbox__box .sky-checkbox__check {
  opacity: 0;
}

.sky-checkbox__input:indeterminate ~ .sky-checkbox__box .sky-checkbox__dash {
  opacity: 1;
}

.sky-checkbox__input:checked ~ .sky-checkbox__box .sky-checkbox__check {
  opacity: 1;
}

.sky-checkbox:not(.sky-checkbox--disabled):hover
  .sky-checkbox__input:not(:checked)
  ~ .sky-checkbox__box {
  border-color: var(--sky-checkbox-accent, #28a745);
}

.sky-checkbox__input:focus ~ .sky-checkbox__box {
  box-shadow: 0 0 0 0.25rem rgba(40, 167, 69, 0.25);
  border-color: var(--sky-checkbox-accent, #28a745);
}

/* ── Switch ── */
.sky-checkbox__track {
  flex-shrink: 0;
  position: relative;
  width: 40px;
  height: 20px;
  border-radius: 999px;
  border: 1px solid #dee2e6;
  transition:
    background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out;
}

.sky-checkbox__thumb {
  position: absolute;
  top: 2px;
  left: 3px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #d6d6d6;
  transition:
    transform 0.15s ease-in-out,
    background-color 0.15s ease-in-out;
}

.sky-checkbox__input:checked ~ .sky-checkbox__track {
  background-color: #28a745;
  border-color: #28a745;
}

.sky-checkbox__input:checked ~ .sky-checkbox__track .sky-checkbox__thumb {
  background: #fff;
  transform: translateX(18px);
}

.sky-checkbox__input:focus ~ .sky-checkbox__track {
  box-shadow: 0 0 0 0.25rem rgba(40, 167, 69, 0.25);
}

/* ── Label ── */
.sky-checkbox__label {
  margin-left: var(--sky-checkbox-label-margin, 4px);
  padding-top: var(--sky-checkbox-label-offset, 0);
  flex: 1;
  min-width: 0;
}
</style>
