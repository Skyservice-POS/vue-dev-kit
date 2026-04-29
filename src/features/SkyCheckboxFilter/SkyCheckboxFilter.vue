<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import SkyCheckbox from '@/shared/ui/SkyCheckbox/SkyCheckbox.vue';

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

const triggerRef = ref<HTMLDivElement | null>(null);
const dropdownStyle = ref<Record<string, string>>({});
const isOpen = ref(false);
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

const oneSelectedLabel = computed(() => {
  if (selected.value.length !== 1) return '';
  const found = props.options.find((o) => o.value === selected.value[0]);
  if (!found) return '';
  return found.name.length < 20 ? found.name : found.name.slice(0, 20) + '...';
});

function toggle() {
  if (props.disabled) return;
  if (isOpen.value) {
    close();
    return;
  }
  open();
}

function open() {
  isOpen.value = true;
  searchQuery.value = '';
  nextTick(() => {
    const el = triggerRef.value;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dropdownStyle.value = {
      left: `${rect.left}px`,
      top: `${rect.bottom + 5}px`,
    };
  });
}

function close() {
  isOpen.value = false;
  searchQuery.value = '';
}

function selectAll() {
  selected.value = props.options.map((o) => o.value);
}

function clearAll() {
  selected.value = [];
}

function clearSearch() {
  searchQuery.value = '';
}

function onDocumentClick(e: MouseEvent) {
  if (!isOpen.value) return;
  const target = e.target as Node;
  if (triggerRef.value?.contains(target)) return;
  const dropdown = document.querySelector('.sky-checkbox-filter__dropdown');
  if (dropdown && dropdown.contains(target)) return;
  close();
}

let prevBodyOverflow = '';

watch(isOpen, (open) => {
  if (open) {
    prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = prevBodyOverflow;
  }
});

onMounted(() => document.addEventListener('click', onDocumentClick));
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick);
  if (isOpen.value) document.body.style.overflow = prevBodyOverflow;
});
</script>

<template>
  <div class="sky-checkbox-filter">
    <div
      ref="triggerRef"
      :class="[
        'header-filter-block',
        { 'hf-check': isOpen, 'hf-disabled': disabled },
      ]"
      @click="toggle"
    >
      <span v-if="selected.length === 1" class="header-filter-block__title">
        {{ oneSelectedLabel || title }}
      </span>
      <span v-else class="header-filter-block__title">
        {{ title }}{{ selected.length > 0 ? ':' : '' }}
      </span>
      <div
        v-if="!disabled && selected.length > 1"
        class="header-filter-block__count"
      >
        {{ selected.length }}
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="sol-caret"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>

    <transition name="fade-select">
      <div
        v-if="isOpen"
        class="selectColumn selectHeaderFilter sky-checkbox-filter__dropdown"
        :style="dropdownStyle"
      >
        <div class="dialog-buttons">
          <span style="cursor: pointer" @click="selectAll">{{
            selectAllLabel
          }}</span>
          <span style="cursor: pointer" @click="clearAll">{{
            clearLabel
          }}</span>
        </div>
        <div class="filtersCurtain__innerWrap_middle">
          <input
            v-model="searchQuery"
            class="searchInput"
            type="text"
            :placeholder="searchPlaceholder"
          />
          <i
            v-if="searchQuery.trim()"
            class="filtersCurtain__innerWrap_middleIcon"
            @click="clearSearch"
            >×</i
          >
        </div>

        <div class="sky-checkbox-filter__options">
          <div
            v-for="opt in filteredOptions"
            :key="opt.value"
            class="filter-option"
          >
            <SkyCheckbox v-model="selected" :value="opt.value">
              {{ opt.name }}
            </SkyCheckbox>
          </div>
        </div>

        <hr style="margin-top: 0; margin-bottom: 2px" />
        <div class="dialog-buttons" style="padding-top: 10px; padding-bottom: 0">
          <span style="cursor: pointer" @click="close">{{ doneLabel }}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.sky-checkbox-filter {
  display: inline-block;
}

.header-filter-block {
  border: none !important;
  position: relative;
  display: flex;
  white-space: nowrap;
  line-height: 38px;
  cursor: pointer;
  padding: 0 10px;
  height: 38px;
  font-size: 16px;
  border: 1px solid #ced4da;
  border-radius: 5px;
}

.header-filter-block__title {
  font-size: 12pt;
  font-weight: 500;
}

.header-filter-block__count {
  margin-top: 1px;
  font-size: 12px;
  margin-left: 4px;
  color: gray;
}

.sol-caret {
  margin-left: 4px;
  transition: transform 0.2s ease-in-out;
  flex-shrink: 0;
  align-self: center;
}

.hf-check,
.hf-disabled {
  color: #b4b4b4;
}

.hf-check > .sol-caret {
  transform: rotate(180deg);
}

.hf-disabled {
  cursor: default;
}

.hf-disabled > .sol-caret {
  opacity: 0.5;
}

/* Dropdown */
.selectColumn.selectHeaderFilter {
  position: fixed;
  z-index: 1000;
  padding: 10px 15px;
  border-radius: 5px;
  background: white;
  box-shadow: 0 5px 8px rgba(0, 0, 0, 0.3);
  min-width: 280px;
}

.dialog-buttons {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 13px;
  color: #106090;
}

.dialog-buttons span:hover {
  text-decoration: underline;
}

.filtersCurtain__innerWrap_middle {
  position: relative;
  display: flex;
  flex-direction: row;
  margin-bottom: 15px;
  border-bottom: #d3d3d3 solid 2px;
  padding-left: unset;
}

.searchInput {
  margin: 0;
  outline: none;
  border: none;
  flex-grow: 2;
  font-size: 12px;
  padding: 4px 24px 4px 0;
  background: transparent;
  width: 100%;
}

.filtersCurtain__innerWrap_middle:has(.searchInput:focus) {
  transition: all 200ms;
  border-bottom: #106090 solid 2px;
}

.filtersCurtain__innerWrap_middleIcon {
  position: absolute;
  font-size: 16px;
  font-style: normal;
  right: 5px;
  top: 0;
  color: #adb5bd;
  cursor: pointer;
  line-height: 1;
}

.sky-checkbox-filter__options {
  max-height: 250px;
  overflow-y: auto;
}

.filter-option {
  padding: 0 4px;
  margin-bottom: 5px;
}

/* Transition */
.fade-select-enter-active {
  animation: fade-select-in 0.2s;
}

.fade-select-leave-active {
  animation: fade-select-in 0.2s reverse;
}

@keyframes fade-select-in {
  0% {
    transform: translate3d(0, -10px, 0);
    opacity: 0;
  }
  100% {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
}
</style>
