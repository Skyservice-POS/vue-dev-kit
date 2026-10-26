<script setup lang="ts">
/**
 * Розділювач + «Готово» внизу панелі фільтра. Внутрішній для родини фільтрів,
 * як і FilterSearch — не експортується з index шару.
 */
defineProps<{ label: string }>();
const emit = defineEmits<{ done: [] }>();
</script>

<template>
  <hr class="sky-filter-done__sep" />
  <div class="sky-filter-done">
    <button type="button" class="sky-filter-done__btn" @mousedown.prevent @click="emit('done')">
      {{ label }}
    </button>
  </div>
</template>

<style scoped>
/* .dialog-buttons адмінки: 16px / 500 / #106090, зверху 10px. */
.sky-filter-done__sep {
  flex-shrink: 0;
  margin: 0 0 2px;
  border: 0;
  border-top: 1px solid var(--sky-filter-separator-color, rgba(0, 0, 0, 0.1));
}

.sky-filter-done {
  display: flex;
  flex-shrink: 0;
  padding: 10px 0 0;
  font-size: var(--sky-filter-action-font-size, 1rem);
  font-weight: var(--sky-filter-action-font-weight, 500);
}

.sky-filter-done__btn {
  padding: 0;
  border: none;
  background: transparent;
  font: inherit;
  color: var(--sky-filter-accent, #106090);
  cursor: pointer;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.sky-filter-done__btn:hover {
  text-decoration: underline;
}

.sky-filter-done__btn:focus-visible {
  outline: 2px solid var(--sky-filter-accent, #106090);
  outline-offset: 2px;
}
</style>
