<template>
  <button
    class="sky-btn"
    :class="[
      `sky-btn-${variant}`,
      {
        'sky-btn-block': block,
        'sky-btn-loading': loading,
        'sky-btn-icon': icon,
      }
    ]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <span v-if="loading" class="sky-btn-spinner"></span>
    <slot></slot>
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'danger', 'secondary', 'outline', 'accent', 'warning', 'info', 'dark', 'outline-primary', 'outline-danger', 'outline-secondary', 'outline-accent', 'outline-warning', 'outline-info', 'outline-dark'].includes(v)
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  block: {
    type: Boolean,
    default: false
  },
  icon: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.sky-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: var(--sky-btn-padding, 16px 20px);
  border: var(--sky-btn-border, none);
  border-radius: var(--sky-btn-radius, 6px);
  font-size: var(--sky-btn-font-size, 14px);
  font-weight: var(--sky-btn-font-weight, 500);
  line-height: 1;
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
}

.sky-btn-icon {
  padding: var(--sky-btn-icon-padding, 10px);
  border-radius: var(--sky-btn-icon-radius, 6px);
}

.sky-btn-block {
  width: 100%;
}

.sky-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Primary */
.sky-btn-primary {
  background: var(--sky-btn-primary-bg, #00c279);
  color: var(--sky-btn-primary-color, #fff);
}
.sky-btn-primary:hover:not(:disabled) {
  background: var(--sky-btn-primary-hover-bg, #00a868);
}
.sky-btn-primary:active:not(:disabled) {
  background: var(--sky-btn-primary-active-bg, #008f5a);
}

/* Danger */
.sky-btn-danger {
  background: var(--sky-btn-danger-bg, #dc2626);
  color: var(--sky-btn-danger-color, #fff);
}
.sky-btn-danger:hover:not(:disabled) {
  background: var(--sky-btn-danger-hover-bg, #b91c1c);
}
.sky-btn-danger:active:not(:disabled) {
  background: var(--sky-btn-danger-active-bg, #991b1b);
}

/* Secondary */
.sky-btn-secondary {
  background: var(--sky-btn-secondary-bg, #f3f4f6);
  color: var(--sky-btn-secondary-color, #374151);
}
.sky-btn-secondary:hover:not(:disabled) {
  background: var(--sky-btn-secondary-hover-bg, #e5e7eb);
}
.sky-btn-secondary:active:not(:disabled) {
  background: var(--sky-btn-secondary-active-bg, #d1d5db);
}

/* Outline */
.sky-btn-outline {
  background: var(--sky-btn-outline-bg, transparent);
  color: var(--sky-btn-outline-color, #374151);
  border: var(--sky-btn-border, 1px solid #d1d5db);
}
.sky-btn-outline:hover:not(:disabled) {
  background: var(--sky-btn-outline-hover-bg, #f3f4f6);
}
.sky-btn-outline:active:not(:disabled) {
  background: var(--sky-btn-outline-active-bg, #e5e7eb);
}

/* Accent (bootstrap Primary) */
.sky-btn-accent {
  background: var(--sky-btn-accent-bg, #0d6efd);
  color: var(--sky-btn-accent-color, #fff);
}
.sky-btn-accent:hover:not(:disabled) {
  background: var(--sky-btn-accent-hover-bg, #0b5ed7);
}
.sky-btn-accent:active:not(:disabled) {
  background: var(--sky-btn-accent-active-bg, #0a58ca);
}

/* Warning (bootstrap Warning) */
.sky-btn-warning {
  background: var(--sky-btn-warning-bg, #ffc107);
  color: var(--sky-btn-warning-color, #000);
}
.sky-btn-warning:hover:not(:disabled) {
  background: var(--sky-btn-warning-hover-bg, #ffca2c);
}
.sky-btn-warning:active:not(:disabled) {
  background: var(--sky-btn-warning-active-bg, #ffcd39);
}

/* Info (bootstrap Info) */
.sky-btn-info {
  background: var(--sky-btn-info-bg, #0dcaf0);
  color: var(--sky-btn-info-color, #000);
}
.sky-btn-info:hover:not(:disabled) {
  background: var(--sky-btn-info-hover-bg, #31d2f2);
}
.sky-btn-info:active:not(:disabled) {
  background: var(--sky-btn-info-active-bg, #3dd5f6);
}

/* Dark (bootstrap Dark) */
.sky-btn-dark {
  background: var(--sky-btn-dark-bg, #212529);
  color: var(--sky-btn-dark-color, #fff);
}
.sky-btn-dark:hover:not(:disabled) {
  background: var(--sky-btn-dark-hover-bg, #1c1f23);
}
.sky-btn-dark:active:not(:disabled) {
  background: var(--sky-btn-dark-active-bg, #1a1e21);
}

/* Outline variants: прозорий фон, рамка й текст кольору варіанта; на hover заливаються */
.sky-btn-outline-primary {
  background: transparent;
  color: var(--sky-btn-outline-primary-color, var(--sky-btn-primary-bg, #00c279));
  border: 1px solid var(--sky-btn-outline-primary-color, var(--sky-btn-primary-bg, #00c279));
}
.sky-btn-outline-primary:hover:not(:disabled),
.sky-btn-outline-primary:active:not(:disabled) {
  background: var(--sky-btn-outline-primary-color, var(--sky-btn-primary-bg, #00c279));
  color: var(--sky-btn-outline-primary-hover-color, #fff);
}

.sky-btn-outline-danger {
  background: transparent;
  color: var(--sky-btn-outline-danger-color, var(--sky-btn-danger-bg, #dc2626));
  border: 1px solid var(--sky-btn-outline-danger-color, var(--sky-btn-danger-bg, #dc2626));
}
.sky-btn-outline-danger:hover:not(:disabled),
.sky-btn-outline-danger:active:not(:disabled) {
  background: var(--sky-btn-outline-danger-color, var(--sky-btn-danger-bg, #dc2626));
  color: var(--sky-btn-outline-danger-hover-color, #fff);
}

.sky-btn-outline-secondary {
  background: transparent;
  color: var(--sky-btn-outline-secondary-color, #6b7280);
  border: 1px solid var(--sky-btn-outline-secondary-color, #6b7280);
}
.sky-btn-outline-secondary:hover:not(:disabled),
.sky-btn-outline-secondary:active:not(:disabled) {
  background: var(--sky-btn-outline-secondary-color, #6b7280);
  color: var(--sky-btn-outline-secondary-hover-color, #fff);
}

.sky-btn-outline-accent {
  background: transparent;
  color: var(--sky-btn-outline-accent-color, var(--sky-btn-accent-bg, #0d6efd));
  border: 1px solid var(--sky-btn-outline-accent-color, var(--sky-btn-accent-bg, #0d6efd));
}
.sky-btn-outline-accent:hover:not(:disabled),
.sky-btn-outline-accent:active:not(:disabled) {
  background: var(--sky-btn-outline-accent-color, var(--sky-btn-accent-bg, #0d6efd));
  color: var(--sky-btn-outline-accent-hover-color, #fff);
}

.sky-btn-outline-warning {
  background: transparent;
  color: var(--sky-btn-outline-warning-color, var(--sky-btn-warning-bg, #ffc107));
  border: 1px solid var(--sky-btn-outline-warning-color, var(--sky-btn-warning-bg, #ffc107));
}
.sky-btn-outline-warning:hover:not(:disabled),
.sky-btn-outline-warning:active:not(:disabled) {
  background: var(--sky-btn-outline-warning-color, var(--sky-btn-warning-bg, #ffc107));
  color: var(--sky-btn-outline-warning-hover-color, #000);
}

.sky-btn-outline-info {
  background: transparent;
  color: var(--sky-btn-outline-info-color, var(--sky-btn-info-bg, #0dcaf0));
  border: 1px solid var(--sky-btn-outline-info-color, var(--sky-btn-info-bg, #0dcaf0));
}
.sky-btn-outline-info:hover:not(:disabled),
.sky-btn-outline-info:active:not(:disabled) {
  background: var(--sky-btn-outline-info-color, var(--sky-btn-info-bg, #0dcaf0));
  color: var(--sky-btn-outline-info-hover-color, #000);
}

.sky-btn-outline-dark {
  background: transparent;
  color: var(--sky-btn-outline-dark-color, var(--sky-btn-dark-bg, #212529));
  border: 1px solid var(--sky-btn-outline-dark-color, var(--sky-btn-dark-bg, #212529));
}
.sky-btn-outline-dark:hover:not(:disabled),
.sky-btn-outline-dark:active:not(:disabled) {
  background: var(--sky-btn-outline-dark-color, var(--sky-btn-dark-bg, #212529));
  color: var(--sky-btn-outline-dark-hover-color, #fff);
}

/* Loading spinner */
.sky-btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: sky-btn-spin 0.6s linear infinite;
  flex-shrink: 0;
}

@keyframes sky-btn-spin {
  to { transform: rotate(360deg); }
}
</style>
