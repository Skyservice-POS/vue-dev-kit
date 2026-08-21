<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import type { SkyTableColumn } from '../../shared/ui/table/types';

defineProps<{
  columns: SkyTableColumn[];
  /** Мапа `name → показувати` з useColumnVisibility. */
  modelValue: Record<string, boolean>;
  title?: string;
  resetLabel?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, boolean>];
  reset: [];
}>();

const open = ref(false);
const root = ref<HTMLElement | null>(null);

function toggleColumn(name: string, value: Record<string, boolean>) {
  emit('update:modelValue', { ...value, [name]: !value[name] });
}

function onOutside(e: MouseEvent) {
  if (open.value && root.value && !root.value.contains(e.target as Node)) {
    open.value = false;
  }
}

onMounted(() => document.addEventListener('mousedown', onOutside));
onBeforeUnmount(() => document.removeEventListener('mousedown', onOutside));
</script>

<template>
  <div ref="root" class="sky-table-columns">
    <button
      type="button"
      class="sky-table-columns__trigger"
      :aria-expanded="open"
      :title="title ?? 'Колонки'"
      @click="open = !open"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <path
          fill="currentColor"
          d="M2 2h3v12H2zM6.5 2h3v12h-3zM11 2h3v12h-3z"
          opacity="0.85"
        />
      </svg>
    </button>

    <div v-if="open" class="sky-table-columns__menu">
      <div class="sky-table-columns__header">{{ title ?? 'Колонки' }}</div>
      <label
        v-for="column in columns"
        :key="column.name"
        class="sky-table-columns__item"
      >
        <input
          type="checkbox"
          :checked="modelValue[column.name] !== false"
          @change="toggleColumn(column.name, modelValue)"
        />
        <span>{{ column.title ?? column.name }}</span>
      </label>
      <button
        type="button"
        class="sky-table-columns__reset"
        @click="emit('reset')"
      >
        {{ resetLabel ?? 'Скинути' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.sky-table-columns {
  position: relative;
}

.sky-table-columns__trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--sky-table-head-color, #6c757d);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.sky-table-columns__trigger:hover {
  background: var(--sky-table-row-hover-bg, #f8f9fa);
}

.sky-table-columns__menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  z-index: 10;
  min-width: 200px;
  padding: 6px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.sky-table-columns__header {
  padding: 6px 8px;
  font-size: 12px;
  color: var(--sky-table-head-color, #6c757d);
}

.sky-table-columns__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
}

.sky-table-columns__item:hover {
  background: var(--sky-table-row-hover-bg, #f8f9fa);
}

.sky-table-columns__reset {
  width: 100%;
  margin-top: 4px;
  padding: 6px 8px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--sky-table-sort-active-color, #24973f);
  font: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
}

.sky-table-columns__reset:hover {
  background: var(--sky-table-row-hover-bg, #f8f9fa);
}
</style>
