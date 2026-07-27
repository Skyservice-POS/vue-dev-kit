<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    placeholder?: string;
    id?: string;
    disabled?: boolean;
    collapsible?: boolean;
    clearAriaLabel?: string;
  }>(),
  {
    modelValue: "",
    placeholder: "",
    id: undefined,
    disabled: false,
    collapsible: false,
    clearAriaLabel: "Очистити",
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const wrapperRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const expanded = ref(!props.collapsible);

function expand(): void {
  if (props.disabled || expanded.value) return;
  expanded.value = true;
  requestAnimationFrame(() => inputRef.value?.focus());
}

function collapse(): void {
  if (!props.collapsible || !expanded.value) return;
  if (props.modelValue) return;
  expanded.value = false;
  inputRef.value?.blur();
}

function onWrapperClick(): void {
  if (!props.collapsible || props.disabled) return;
  if (!expanded.value) expand();
}

function onIconClick(): void {
  if (!props.collapsible || props.disabled) return;
  if (expanded.value) collapse();
  else expand();
}

function onInput(e: Event): void {
  emit("update:modelValue", (e.target as HTMLInputElement).value);
}

function onClear(): void {
  if (props.disabled) return;
  if (props.modelValue) {
    emit("update:modelValue", "");
    inputRef.value?.focus();
    return;
  }
  if (props.collapsible) {
    expanded.value = false;
  }
}

function onDocumentMousedown(e: MouseEvent): void {
  if (!props.collapsible || !expanded.value) return;
  const target = e.target as Node | null;
  if (wrapperRef.value && target && wrapperRef.value.contains(target)) return;
  collapse();
}

onMounted(() => {
  document.addEventListener("mousedown", onDocumentMousedown);
});

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", onDocumentMousedown);
});
</script>

<template>
  <div
    ref="wrapperRef"
    class="sky-search"
    :class="{
      'is-collapsible': collapsible,
      'is-collapsed': collapsible && !expanded,
      'is-disabled': disabled,
    }"
    @click="onWrapperClick"
  >
    <input
      :id="id"
      ref="inputRef"
      type="text"
      class="sky-search__input"
      :class="{ 'has-value': modelValue }"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      autocomplete="off"
      @input="onInput"
    />
    <span class="sky-search__icon" aria-hidden="true" @click.stop="onIconClick">
      <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
        <path
          d="M15.504 13.616l-3.79-3.223c-0.392-0.353-0.811-0.514-1.149-0.499 0.895-1.048 1.435-2.407 1.435-3.893 0-3.314-2.686-6-6-6s-6 2.686-6 6 2.686 6 6 6c1.486 0 2.845-0.54 3.893-1.435-0.016 0.338 0.146 0.757 0.499 1.149l3.223 3.79c0.552 0.613 1.453 0.665 2.003 0.115s0.498-1.451-0.115-2.003zM6 10c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z"
        />
      </svg>
    </span>
    <button
      type="button"
      class="sky-search__clear"
      :aria-label="clearAriaLabel"
      :disabled="disabled"
      @click.stop="onClear"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path
          d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm5 13.6L15.6 17 12 13.4 8.4 17 7 15.6 10.6 12 7 8.4 8.4 7 12 10.6 15.6 7 17 8.4 13.4 12 17 15.6z"
        />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.sky-search {
  position: relative;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  width: 100%;
  transition: all 0.3s ease-in-out;
}

.sky-search__input {
  flex: 1;
  display: block;
  width: 100% !important;
  height: calc(1.5em + 0.75rem + 2px);
  padding: 0.375rem 45px;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #495057;
  background-color: transparent;
  background-clip: padding-box;
  border: none !important;
  border-radius: 0.25rem;
  outline: none;
  transition: all 0.3s ease-in-out;
}

.sky-search__input:focus {
  background-color: transparent;
  outline: 0;
}

.sky-search__input::placeholder {
  color: rgb(129, 129, 129) !important;
}

.sky-search__input:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.sky-search__icon {
  width: 22px;
  height: 22px;
  font-size: 18px;
  position: absolute;
  left: 17px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #495057;
  opacity: 1;
  z-index: 1;
  pointer-events: none;
  transition: all 0.3s ease-in-out;
}

.sky-search__input:focus + .sky-search__icon,
.sky-search__input.has-value + .sky-search__icon {
  color: #80bdff !important;
}

.sky-search.is-collapsible .sky-search__icon {
  pointer-events: auto;
  cursor: pointer;
}

.sky-search__clear {
  width: 50px;
  height: 38px;
  border: 0 solid #ced4da;
  color: #ced4da;
  position: absolute;
  right: 0;
  top: 0;
  font-size: 17pt;
  transition: all 0.2s ease-in-out;
  opacity: 1;
  z-index: 1;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  cursor: pointer;
}

.sky-search__clear:hover,
.sky-search__clear:focus {
  color: #000;
  outline: none;
  box-shadow: none;
}

.sky-search__clear:disabled {
  cursor: not-allowed;
}

/* --- Collapsible mode --- */
.sky-search.is-collapsible.is-collapsed {
  width: 55px;
  cursor: pointer;
}

.sky-search.is-collapsible.is-collapsed .sky-search__input {
  flex: none !important;
  width: 0 !important;
  padding-left: 30px;
  padding-right: 0;
  cursor: pointer;
}

.sky-search.is-collapsible.is-collapsed .sky-search__clear {
  opacity: 0;
  pointer-events: none;
}

.sky-search.is-disabled {
  opacity: 0.6;
  pointer-events: none;
}
</style>
