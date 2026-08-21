<script setup lang="ts">
// Тіло таблиці для звичайного (невіртуалізованого) рендеру. Якщо рядків тисячі —
// беріть TableVirtualBody з features: він робить те саме, але через віртуал-скрол.
</script>

<template>
  <div class="sky-table__body" role="rowgroup">
    <slot />
  </div>
</template>

<style scoped>
.sky-table__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
</style>
