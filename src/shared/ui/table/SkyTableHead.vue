<script setup lang="ts">
import { computed } from 'vue';
import type { SkyTableColumn, SortState } from './types';

const props = defineProps<{
  column: SkyTableColumn;
  /** Поточний стан сортування — щоб намалювати активну стрілку. */
  sort?: SortState;
}>();

const emit = defineEmits<{ sort: [field: string] }>();

/** Поле сортування: `sortable: true` → сортуємо за `name`. */
const sortField = computed(() => {
  const s = props.column.sortable;
  if (!s) return '';
  return typeof s === 'string' ? s : props.column.name;
});

const direction = computed(() =>
  sortField.value && props.sort?.of === sortField.value ? props.sort.ot : '',
);
</script>

<template>
  <div
    class="sky-table__head"
    :class="[`is-${column.align ?? 'left'}`, { 'is-sortable': sortField }]"
    role="columnheader"
    :aria-sort="
      direction === 'asc'
        ? 'ascending'
        : direction === 'desc'
          ? 'descending'
          : 'none'
    "
    @click="sortField && emit('sort', sortField)"
  >
    <slot>
      <span class="sky-table__head-title">{{ column.title }}</span>
    </slot>

    <svg
      v-if="sortField"
      class="sky-table__sort"
      :class="{ 'is-active': direction, 'is-desc': direction === 'desc' }"
      width="10"
      height="10"
      viewBox="0 0 451.847 451.847"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M225.923,354.706c-8.098,0-16.195-3.092-22.369-9.263L9.27,151.157c-12.359-12.359-12.359-32.397,0-44.751c12.354-12.354,32.388-12.354,44.748,0l171.905,171.915l171.906-171.909c12.359-12.354,32.391-12.354,44.744,0c12.365,12.354,12.365,32.392,0,44.751L248.292,345.449C242.115,351.621,234.018,354.706,225.923,354.706z"
      />
    </svg>
  </div>
</template>

<style scoped>
.sky-table__head {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  padding: var(--sky-table-head-padding, 0.375rem 0.5rem);
  font-weight: var(--sky-table-head-weight, 500);
  color: var(--sky-table-head-color, #106090);
  user-select: none;
}

.sky-table__head.is-center {
  justify-content: center;
}
.sky-table__head.is-right {
  justify-content: flex-end;
}

.sky-table__head.is-sortable {
  cursor: pointer;
}

.sky-table__head.is-sortable:hover {
  color: var(--sky-table-head-hover-color, #0b4468);
}

.sky-table__head-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sky-table__sort {
  flex-shrink: 0;
  opacity: 0;
  transition:
    opacity 0.15s ease,
    transform 0.2s ease;
}

.sky-table__head:hover .sky-table__sort {
  opacity: 0.4;
}

.sky-table__sort.is-active {
  opacity: 1;
  color: var(--sky-table-sort-active-color, #106090);
}

.sky-table__sort.is-desc {
  transform: rotate(180deg);
}
</style>
