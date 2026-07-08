<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue";

interface SkySelectSearchOption {
  value: string | number;
  text: string;
}

const props = withDefaults(
  defineProps<{
    modelValue?: string | number;
    options: SkySelectSearchOption[];
    id?: string;
    disabled?: boolean;
    state?: "success" | "error" | "default";
    placeholder?: string;
    hint?: string;
    searchPlaceholder?: string;
    noResultsText?: string;
  }>(),
  {
    modelValue: undefined,
    id: undefined,
    disabled: false,
    state: "default",
    placeholder: "",
    hint: "",
    searchPlaceholder: "Пошук…",
    noResultsText: "Нічого не знайдено",
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string | number];
}>();

// Module-scoped counter замість crypto.randomUUID (немає в Chromium 84)
let uidCounter = 0;
const uid = `sky-select-search-${(uidCounter += 1)}`;

const wrapperRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const triggerRef = ref<HTMLButtonElement | null>(null);
const listRef = ref<HTMLElement | null>(null);

const open = ref(false);
const query = ref("");
const highlightedIndex = ref(-1);

const selectedText = computed<string>(() => {
  const match = props.options.find((o) => o.value === props.modelValue);
  return match ? match.text : "";
});

const filtered = computed<SkySelectSearchOption[]>(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return props.options;
  return props.options.filter((o) => String(o.text).toLowerCase().indexOf(q) !== -1);
});

const activeOptionId = computed<string>(() =>
  highlightedIndex.value >= 0 ? `${uid}-opt-${highlightedIndex.value}` : "",
);

function openDropdown(): void {
  if (props.disabled || open.value) return;
  open.value = true;
  query.value = "";
  // Підсвітити вже обрану опцію, інакше першу
  const selIdx = filtered.value.findIndex((o) => o.value === props.modelValue);
  highlightedIndex.value = selIdx !== -1 ? selIdx : filtered.value.length ? 0 : -1;
  nextTick(() => {
    if (inputRef.value) inputRef.value.focus();
    scrollHighlightedIntoView();
  });
}

function closeDropdown(refocusTrigger: boolean): void {
  if (!open.value) return;
  open.value = false;
  query.value = "";
  highlightedIndex.value = -1;
  if (refocusTrigger && triggerRef.value) triggerRef.value.focus();
}

function toggle(): void {
  if (props.disabled) return;
  if (open.value) closeDropdown(false);
  else openDropdown();
}

function selectOption(opt: SkySelectSearchOption): void {
  emit("update:modelValue", opt.value);
  closeDropdown(true);
}

function move(delta: number): void {
  const len = filtered.value.length;
  if (!len) return;
  let next = highlightedIndex.value + delta;
  if (next < 0) next = 0;
  if (next > len - 1) next = len - 1;
  highlightedIndex.value = next;
  nextTick(scrollHighlightedIntoView);
}

function scrollHighlightedIntoView(): void {
  if (!listRef.value || highlightedIndex.value < 0) return;
  const nodes = listRef.value.querySelectorAll(".sky-select-search__option");
  const el = nodes[highlightedIndex.value] as HTMLElement | undefined;
  // block:'nearest' підтримується з Chromium 62; behavior не передаємо (миттєвий скрол)
  if (el) el.scrollIntoView({ block: "nearest" });
}

function onTriggerKeydown(e: KeyboardEvent): void {
  if (props.disabled) return;
  if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
    e.preventDefault();
    openDropdown();
  }
}

function onInputKeydown(e: KeyboardEvent): void {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    move(1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    move(-1);
  } else if (e.key === "Enter") {
    e.preventDefault();
    const opt = filtered.value[highlightedIndex.value];
    if (opt) selectOption(opt);
  } else if (e.key === "Escape") {
    e.preventDefault();
    closeDropdown(true);
  } else if (e.key === "Tab") {
    closeDropdown(false);
  }
}

// При зміні фільтра тримаємо підсвітку в межах списку
watch(query, () => {
  highlightedIndex.value = filtered.value.length ? 0 : -1;
});

function onDocumentMousedown(e: MouseEvent): void {
  if (!open.value) return;
  const target = e.target as Node | null;
  if (wrapperRef.value && target && wrapperRef.value.contains(target)) return;
  closeDropdown(false);
}

onMounted(() => {
  document.addEventListener("mousedown", onDocumentMousedown);
});

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", onDocumentMousedown);
});
</script>

<template>
  <div ref="wrapperRef" class="sky-select-search" :class="{ 'is-open': open, 'is-disabled': disabled }">
    <div class="sky-select-search__control">
      <button
        ref="triggerRef"
        type="button"
        class="sky-select-search__trigger"
        :class="state"
        :id="id"
        :disabled="disabled"
        role="combobox"
        aria-haspopup="listbox"
        :aria-expanded="open ? 'true' : 'false'"
        :aria-controls="`${uid}-list`"
        @click="toggle"
        @keydown="onTriggerKeydown"
      >
        <span
          class="sky-select-search__value"
          :class="{ 'is-placeholder': !selectedText }"
        >
          {{ selectedText || placeholder }}
        </span>
      </button>

      <div v-if="open" class="sky-select-search__dropdown">
        <div class="sky-select-search__search">
          <input
            ref="inputRef"
            v-model="query"
            type="text"
            class="sky-select-search__input"
            :placeholder="searchPlaceholder"
            :aria-controls="`${uid}-list`"
            :aria-activedescendant="activeOptionId"
            autocomplete="off"
            @keydown="onInputKeydown"
          />
        </div>

        <ul :id="`${uid}-list`" ref="listRef" class="sky-select-search__list" role="listbox">
          <li
            v-for="(opt, i) in filtered"
            :id="`${uid}-opt-${i}`"
            :key="opt.value"
            class="sky-select-search__option"
            :class="{
              'is-active': i === highlightedIndex,
              'is-selected': opt.value === modelValue,
            }"
            role="option"
            :aria-selected="opt.value === modelValue ? 'true' : 'false'"
            @mousemove="highlightedIndex = i"
            @mousedown.prevent="selectOption(opt)"
          >
            {{ opt.text }}
          </li>
          <li v-if="!filtered.length" class="sky-select-search__empty">
            {{ noResultsText }}
          </li>
        </ul>
      </div>
    </div>

    <small v-if="hint" class="setting-hint" :class="state">
      {{ hint }}
    </small>
  </div>
</template>

<style scoped>
.sky-select-search {
  display: block;
  width: 100%;
}

.sky-select-search__control {
  position: relative;
}

/* --- Тригер: 1:1 зі стилем SkySelect --- */
.sky-select-search__trigger {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.375rem 2.25rem 0.375rem 0.75rem;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #212529;
  background-color: #fff;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px 12px;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  outline: none;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

.sky-select-search__value {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sky-select-search__value.is-placeholder {
  color: #6c757d;
}

.sky-select-search__trigger:focus,
.sky-select-search.is-open .sky-select-search__trigger {
  border-color: #28a745;
  box-shadow: 0 0 0 0.25rem rgba(40, 167, 69, 0.25);
}

.sky-select-search__trigger:disabled {
  background-color: #e9ecef;
  opacity: 1;
  cursor: not-allowed;
}

.sky-select-search__trigger.success {
  border-color: #28a745;
}

.sky-select-search__trigger.success:focus {
  border-color: #28a745;
  box-shadow: 0 0 0 0.25rem rgba(40, 167, 69, 0.25);
}

.sky-select-search__trigger.error {
  border-color: #dc3545;
}

.sky-select-search__trigger.error:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
}

/* --- Дропдаун --- */
.sky-select-search__dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 1050;
  background-color: #fff;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.sky-select-search__search {
  position: sticky;
  top: 0;
  padding: 8px;
  background-color: #fff;
  border-bottom: 1px solid #e9ecef;
}

.sky-select-search__input {
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: 6px 10px;
  font-family: inherit;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #212529;
  background-color: #fff;
  border: 1px solid #ced4da;
  border-radius: 4px;
  outline: none;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

.sky-select-search__input:focus {
  border-color: #28a745;
  box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.2);
}

.sky-select-search__list {
  list-style: none;
  margin: 0;
  padding: 4px;
  max-height: 220px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.sky-select-search__option {
  padding: 8px 12px;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #212529;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sky-select-search__option.is-active {
  background-color: #f3f4f6;
}

.sky-select-search__option.is-selected {
  color: #24973f;
  font-weight: 600;
}

.sky-select-search__empty {
  padding: 12px;
  text-align: center;
  color: #9ca3af;
  font-size: 0.9rem;
}

.setting-hint {
  color: #666;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.setting-hint.success {
  color: #28a745;
}

.setting-hint.error {
  color: #dc3545;
}
</style>
