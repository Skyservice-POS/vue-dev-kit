<template>
  <div class="sky-card-row">
    <span class="sky-card-row-label">{{ label }}</span>
    <slot>
      <span class="sky-card-row-value">{{ value }}</span>
    </slot>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], default: '' },
});
</script>

<style scoped>
.sky-card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
}

.sky-card-row-label {
  font-size: 13px;
  color: #888;
  white-space: nowrap;
  flex-shrink: 0;
}

.sky-card-row-value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
</style>
