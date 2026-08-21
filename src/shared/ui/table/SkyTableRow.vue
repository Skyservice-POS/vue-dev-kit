<script setup lang="ts">
import { inject } from 'vue';
import { SKY_TABLE_CONTEXT } from './types';

withDefaults(
  defineProps<{
    /** Підсвітити рядок як обраний. */
    selected?: boolean;
    /** Курсор-вказівник і hover — коли рядок клікабельний. */
    interactive?: boolean;
  }>(),
  { selected: false, interactive: false },
);

const ctx = inject(SKY_TABLE_CONTEXT);
</script>

<template>
  <div
    class="sky-table__row"
    :class="{ 'is-selected': selected, 'is-interactive': interactive }"
    role="row"
    :aria-selected="selected || undefined"
    :style="{ gridTemplateColumns: ctx?.gridTemplate.value }"
  >
    <slot :columns="ctx?.columns.value ?? []" />
  </div>
</template>

<style scoped>
.sky-table__row {
  display: grid;
  align-items: center;
  border-bottom: 1px solid var(--sky-table-border-color, #dee2e6);
  min-height: var(--sky-table-row-height, 40px);
  transition: background-color 0.12s ease;
}

.sky-table__row.is-interactive {
  cursor: pointer;
}

.sky-table__row.is-interactive:hover {
  background: var(--sky-table-row-hover-bg, #def9ff);
}

.sky-table__row.is-selected {
  background: var(--sky-table-row-selected-bg, rgba(33, 130, 214, 0.2));
}
</style>
