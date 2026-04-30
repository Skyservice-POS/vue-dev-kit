<template>
  <span class="sky-badge" :class="`sky-badge-${tone}`">
    <span v-if="dot" class="sky-badge-dot"></span>
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup>
defineProps({
  tone: {
    type: String,
    default: "default",
    validator: (v) =>
      ["success", "error", "warning", "pending", "info", "default"].includes(v),
  },
  label: { type: String, default: "" },
  dot: { type: Boolean, default: true },
});
</script>

<style scoped>
.sky-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.3;
}

.sky-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

.sky-badge-success {
  background: #e8f5e9;
  color: #00c279;
}
.sky-badge-error {
  background: #ffebee;
  color: #c62828;
}
.sky-badge-warning {
  background: #fff8e1;
  color: #f57f17;
}
.sky-badge-pending {
  background: #fff8e1;
  color: #f57f17;
}
.sky-badge-info {
  background: #e3f2fd;
  color: #1565c0;
}
.sky-badge-default {
  background: #f5f5f5;
  color: #757575;
}
</style>
