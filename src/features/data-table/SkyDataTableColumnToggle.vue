<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

// Працює з будь-яким інстансом TanStack-таблиці: читає leaf-колонки і
// перемикає їхню видимість. Тримаємо тип широким, щоб компонент не залежав
// від конкретного набору фіч.
const props = withDefaults(
  defineProps<{
    table: any;
    title?: string;
    resetLabel?: string;
  }>(),
  { title: 'Колонки', resetLabel: 'Показати всі' },
);

const open = ref(false);
const root = ref<HTMLElement | null>(null);

const columns = computed(() =>
  props.table
    .getAllLeafColumns()
    .filter((column: any) => column.getCanHide?.() !== false && column.columnDef.header),
);

function onOutside(e: MouseEvent) {
  if (open.value && root.value && !root.value.contains(e.target as Node)) {
    open.value = false;
  }
}

onMounted(() => document.addEventListener('mousedown', onOutside));
onBeforeUnmount(() => document.removeEventListener('mousedown', onOutside));
</script>

<template>
  <div ref="root" class="sky-dt-columns">
    <button
      type="button"
      class="sky-dt-columns__trigger"
      :title="title"
      :aria-expanded="open"
      @click="open = !open"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <path fill="currentColor" d="M2 2h3v12H2zM6.5 2h3v12h-3zM11 2h3v12h-3z" />
      </svg>
    </button>

    <div v-if="open" class="sky-dt-columns__menu">
      <div class="sky-dt-columns__header">{{ title }}</div>
      <label
        v-for="column in columns"
        :key="column.id"
        class="sky-dt-columns__item"
      >
        <input
          type="checkbox"
          :checked="column.getIsVisible()"
          @change="column.toggleVisibility()"
        />
        <span>
          {{ typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id }}
        </span>
      </label>
      <button
        type="button"
        class="sky-dt-columns__reset"
        @click="table.resetColumnVisibility()"
      >
        {{ resetLabel }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.sky-dt-columns {
  position: relative;
}

.sky-dt-columns__trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid var(--sky-table-border-color, #dee2e6);
  border-radius: 6px;
  background: #fff;
  color: var(--sky-table-head-color, #106090);
  cursor: pointer;
}

.sky-dt-columns__trigger:hover {
  background: var(--sky-table-row-hover-bg, #def9ff);
}

.sky-dt-columns__menu {
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

.sky-dt-columns__header {
  padding: 6px 8px;
  font-size: 12px;
  color: #6c757d;
}

.sky-dt-columns__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
}

.sky-dt-columns__item:hover {
  background: var(--sky-table-row-hover-bg, #def9ff);
}

.sky-dt-columns__reset {
  width: 100%;
  margin-top: 4px;
  padding: 6px 8px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--sky-table-head-color, #106090);
  font: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
}

.sky-dt-columns__reset:hover {
  background: var(--sky-table-row-hover-bg, #def9ff);
}
</style>
