<script setup lang="ts">
import { inject } from 'vue';
import { SKY_TABLE_CONTEXT } from './types';

withDefaults(defineProps<{ sticky?: boolean }>(), { sticky: true });

const ctx = inject(SKY_TABLE_CONTEXT);
</script>

<template>
  <div
    class="sky-table__header"
    :class="{ 'is-sticky': sticky }"
    role="row"
    :style="{ gridTemplateColumns: ctx?.gridTemplate.value }"
  >
    <slot :columns="ctx?.columns.value ?? []" />
  </div>
</template>

<style scoped>
.sky-table__header {
  display: grid;
  align-items: stretch;
  background: var(--sky-table-head-bg, #fff);
  border-top: 1px solid var(--sky-table-border-color, #dee2e6);
  border-bottom: 1px solid var(--sky-table-border-color, #dee2e6);
  min-height: var(--sky-table-head-height, 40px);
  flex-shrink: 0;
}

.sky-table__header.is-sticky {
  position: sticky;
  top: 0;
  z-index: 2;
}
</style>
