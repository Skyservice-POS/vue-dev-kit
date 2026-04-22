<template>
  <div class="sky-alert" :class="`sky-alert-${tone}`">
    <svg v-if="showIcon" class="sky-alert-icon" width="16" height="16" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z"
        fill="currentColor"
      />
    </svg>
    <span class="sky-alert-body">
      <slot />
    </span>
  </div>
</template>

<script setup>
defineProps({
  tone: {
    type: String,
    default: 'info',
    validator: (v) => ['success', 'error', 'warning', 'info'].includes(v),
  },
  showIcon: { type: Boolean, default: true },
});
</script>

<style scoped>
.sky-alert {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 12px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid;
  font-size: 13px;
  line-height: 1.4;
}

.sky-alert-icon {
  flex-shrink: 0;
  margin-top: 1px;
}

.sky-alert-body {
  min-width: 0;
  word-break: break-word;
}

.sky-alert-success {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #166534;
}
.sky-alert-error {
  background: #fff5f5;
  border-color: #ffcdd2;
  color: #c62828;
}
.sky-alert-warning {
  background: #fffbeb;
  border-color: #fde68a;
  color: #92400e;
}
.sky-alert-info {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1e40af;
}
</style>
