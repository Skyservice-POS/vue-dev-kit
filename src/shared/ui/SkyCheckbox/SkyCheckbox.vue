<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean | string[] | number[];
  value?: string | number;
  switch?: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean | string[] | number[]];
}>();

const switchMode = props.switch;

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (Array.isArray(props.modelValue)) {
    const arr = [...(props.modelValue as any[])];
    if (target.checked) arr.push(props.value);
    else arr.splice(arr.indexOf(props.value), 1);
    emit("update:modelValue", arr);
  } else {
    emit("update:modelValue", target.checked);
  }
}

const isChecked = () => {
  if (Array.isArray(props.modelValue)) {
    return (props.modelValue as any[]).includes(props.value);
  }
  return props.modelValue as boolean;
};
</script>

<template>
  <label
    class="sky-checkbox"
    :class="{
      'sky-checkbox--switch': switchMode,
      'sky-checkbox--disabled': disabled,
    }"
  >
    <input
      type="checkbox"
      class="sky-checkbox__input"
      :checked="isChecked()"
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
    </span>

    <span v-if="$slots.default" class="sky-checkbox__label">
      <slot />
    </span>
  </label>
</template>

<style scoped>
.sky-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 400;
  color: #212529;
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
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid #adb5bd;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out;
}

.sky-checkbox__check {
  width: 9px;
  height: 7px;
  opacity: 0;
  transition: opacity 0.1s ease-in-out;
}

.sky-checkbox__input:checked ~ .sky-checkbox__box {
  background-color: #28a745;
  border-color: #28a745;
}

.sky-checkbox__input:checked ~ .sky-checkbox__box .sky-checkbox__check {
  opacity: 1;
}

.sky-checkbox:not(.sky-checkbox--disabled):hover
  .sky-checkbox__input:not(:checked)
  ~ .sky-checkbox__box {
  border-color: #28a745;
}

.sky-checkbox__input:focus ~ .sky-checkbox__box {
  box-shadow: 0 0 0 0.25rem rgba(40, 167, 69, 0.25);
  border-color: #28a745;
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
  margin-left: 4px;
  flex: 1;
  min-width: 0;
}
</style>
