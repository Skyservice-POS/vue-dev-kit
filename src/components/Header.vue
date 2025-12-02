<template>
  <header class="sky-header">
    <div class="header-content">
      <div class="header-top">
        <div class="header-title-wrapper">
          <button
            v-if="shouldShowBackButton"
            class="btn-back"
            @click="$emit('back')"
            :title="backButtonTitle"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="header-title-content">
            <slot name="title">
              <h4 class="header-title">{{ title }}</h4>
            </slot>
            <slot name="subtitle">
              <div v-if="subtitle" class="header-subtitle">{{ subtitle }}</div>
            </slot>
          </div>
        </div>

        <div class="header-actions">
          <slot></slot>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  showBackButton: {
    type: Boolean,
    default: true
  },
  backButtonTitle: {
    type: String,
    default: 'Назад'
  }
})

defineEmits(['back'])

// Перевіряємо чи сторінка в iframe
const isInIframe = computed(() => {
  try {
    return window.self !== window.top
  } catch (e) {
    return true
  }
})

// Показуємо кнопку тільки якщо showBackButton=true І сторінка в iframe
const shouldShowBackButton = computed(() => {
  return props.showBackButton && isInIframe.value
})
</script>

<style scoped>
.sky-header {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  background: var(--sky-header-bg, white);
  border-bottom: 1px solid var(--sky-header-border-color, #dee2e6);
  z-index: var(--sky-header-z-index, 100);
  padding: var(--sky-header-padding, 10px 0);
}

.header-content {
  padding: var(--sky-header-content-padding, 4px 14px);
  margin: 0 auto;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title-content {
  display: flex;
  flex-direction: column;
}

.btn-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s;
  color: var(--sky-header-back-btn-color, #374151);
}

.btn-back img,
.btn-back svg {
  display: block;
}

.btn-back:hover {
  background-color: var(--sky-header-back-btn-hover-bg, #f8f9fa);
}

.btn-back:active {
  background-color: var(--sky-header-back-btn-active-bg, #e9ecef);
}

.header-title {
  margin: 0;
  font-size: var(--sky-header-title-size, 18px);
  font-weight: var(--sky-header-title-weight, 500);
  color: var(--sky-header-title-color, #252525);
  line-height: 1.5;
  user-select: none;
}

.header-subtitle {
  font-size: var(--sky-header-subtitle-size, 14px);
  color: var(--sky-header-subtitle-color, #6c757d);
  font-weight: 400;
  line-height: 1.5;
}

.header-actions {
  display: flex;
  gap: var(--sky-header-actions-gap, 12px);
}

@media (max-width: 768px) {
  .header-content {
    padding: 12px 16px;
  }

  .header-top {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
