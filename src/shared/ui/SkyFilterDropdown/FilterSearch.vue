<script setup lang="ts">
/**
 * The underlined search row used inside filter panels. Internal to the filter
 * family — not exported from the layer index; use SkySearchInput for a standalone
 * search field.
 */
defineProps<{
  modelValue: string;
  placeholder?: string;
  /** Rendered as the field's accessible name (the row has no visible label). */
  label?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [string];
}>();
</script>

<template>
  <div class="sky-filter-search">
    <input
      class="sky-filter-search__input"
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
      :aria-label="label || placeholder"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <button
      v-if="modelValue.trim()"
      type="button"
      class="sky-filter-search__clear"
      :aria-label="`${label || placeholder} ✕`"
      @click="emit('update:modelValue', '')"
    >
      ×
    </button>
  </div>
</template>

<style scoped>
.sky-filter-search {
  position: relative;
  display: flex;
  flex-shrink: 0;
  margin-bottom: 15px;
  border-bottom: 2px solid var(--sky-filter-search-border-color, #d3d3d3);
}

.sky-filter-search:has(.sky-filter-search__input:focus) {
  border-bottom-color: var(--sky-filter-accent, #106090);
  transition: border-color 200ms;
}

.sky-filter-search__input {
  flex-grow: 2;
  width: 100%;
  margin: 0;
  padding: 4px 24px 4px 0;
  /* Прибитий явно: успадкований від хоста line-height роздував рядок пошуку
     (в адмінці він рівно 28px). */
  line-height: 1.5;
  border: none;
  outline: none;
  background: transparent;
  font-size: 12px;
  color: inherit;
}

.sky-filter-search__clear {
  position: absolute;
  right: 5px;
  top: 0;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 16px;
  line-height: 1;
  color: var(--sky-filter-muted-color, #adb5bd);
  cursor: pointer;
}
</style>
