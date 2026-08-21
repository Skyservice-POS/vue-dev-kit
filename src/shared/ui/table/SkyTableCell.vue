<script setup lang="ts">
withDefaults(
  defineProps<{
    align?: 'left' | 'center' | 'right';
    /** Не обрізати вміст трикрапкою (для комірок із контролами чи тегами). */
    noTruncate?: boolean;
  }>(),
  { align: 'left', noTruncate: false },
);
</script>

<template>
  <div
    class="sky-table__cell"
    :class="[`is-${align}`, { 'is-truncate': !noTruncate }]"
    role="cell"
  >
    <slot />
  </div>
</template>

<style scoped>
.sky-table__cell {
  display: flex;
  align-items: center;
  min-width: 0;
  padding: var(--sky-table-cell-padding, 0 10px);
}

.sky-table__cell.is-center {
  justify-content: center;
}
.sky-table__cell.is-right {
  justify-content: flex-end;
}

/* Обрізаємо саме текст усередині, щоб не ламати flex-контроли в комірці. */
.sky-table__cell.is-truncate > :deep(*),
.sky-table__cell.is-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
