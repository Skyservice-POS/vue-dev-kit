<script setup lang="ts">
// Порожній стан. Ілюстрацію свідомо не вшиваємо — стара таблиця тягнула
// /image/dragons/… з хоста, і поза Skyservice це була бита картинка.
withDefaults(defineProps<{ text?: string }>(), { text: 'Даних немає' });
</script>

<template>
  <div class="sky-table__empty">
    <slot name="illustration" />
    <slot>
      <p class="sky-table__empty-text">{{ text }}</p>
    </slot>
  </div>
</template>

<style scoped>
.sky-table__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex: 1;
  padding: var(--sky-table-empty-padding, 40px 20px);
  color: var(--sky-table-empty-color, #6c757d);
}

.sky-table__empty-text {
  margin: 0;
  font-size: 14px;
}
</style>
