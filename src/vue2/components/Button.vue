<template>
  <button
    class="sky-btn"
    :class="[`sky-btn-${variant}`, { 'sky-btn-block': block, 'sky-btn-loading': loading }]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <span v-if="loading" class="sky-btn-spinner"></span>
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'Button',
  inheritAttrs: false,
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: (v) => ['primary', 'danger', 'secondary', 'outline'].includes(v)
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
    }
  }
}
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

.sky-btn-block {
  width: 100%;
}

.sky-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Primary */
.sky-btn-primary {
  background: var(--sky-btn-primary-bg, #24973f);
  color: var(--sky-btn-primary-color, #fff);
}
.sky-btn-primary:hover:not(:disabled) {
  background: var(--sky-btn-primary-hover-bg, #1e7a33);
}
.sky-btn-primary:active:not(:disabled) {
  background: var(--sky-btn-primary-active-bg, #196b2c);
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
