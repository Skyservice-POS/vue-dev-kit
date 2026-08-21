<script setup lang="ts">
import { ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    /** Скільки рядків обрано. При 0 панель не рендериться. */
    count: number;
    /** Доступні масові дії. */
    actions: { value: string; title: string }[];
    placeholder?: string;
  }>(),
  { placeholder: 'Дія' },
);

const emit = defineEmits<{ action: [value: string] }>();

const current = ref('');

// Скидаємо вибір, коли панель ховається — інакше при наступному виділенні
// в селекті лишалась би попередня дія.
watch(
  () => props.count,
  (value) => {
    if (value === 0) current.value = '';
  },
);

function apply(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  if (!value) return;
  emit('action', value);
  current.value = '';
}
</script>

<template>
  <div v-if="count > 0" class="sky-table-mass">
    <span class="sky-table-mass__count">{{ count }}</span>
    <select v-model="current" class="sky-table-mass__select" @change="apply">
      <option value="">{{ placeholder }}</option>
      <option v-for="action in actions" :key="action.value" :value="action.value">
        {{ action.title }}
      </option>
    </select>
    <slot />
  </div>
</template>

<style scoped>
.sky-table-mass {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: var(--sky-table-mass-padding, 8px 10px);
  background: var(--sky-table-mass-bg, #f8f9fa);
  border-bottom: 1px solid var(--sky-table-border-color, #dee2e6);
}

.sky-table-mass__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  border-radius: 14px;
  background: var(--sky-table-mass-count-bg, #24973f);
  color: #fff;
  font-size: 13px;
  font-weight: 500;
}

.sky-table-mass__select {
  flex: 1;
  max-width: 260px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--sky-table-border-color, #dee2e6);
  border-radius: 6px;
  background: #fff;
  font-size: 13px;
  color: inherit;
}
</style>
