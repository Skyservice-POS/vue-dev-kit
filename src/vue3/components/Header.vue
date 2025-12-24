<template>
  <header class="sky-header">
    <div class="header-content">
      <div class="header-top">
        <div class="header-title-wrapper">
          <button
            v-if="shouldShowBackButton"
            class="btn-back"
            @click="handleBack"
            :title="backButtonTitle"
          >
            <svg width="15" height="15" viewBox="0 0 451.847 451.847" style="transform: rotate(90deg)">
              <path fill="currentColor" d="M225.923,354.706c-8.098,0-16.195-3.092-22.369-9.263L9.27,151.157c-12.359-12.359-12.359-32.397,0-44.751c12.354-12.354,32.388-12.354,44.748,0l171.905,171.915l171.906-171.909c12.359-12.354,32.391-12.354,44.744,0c12.365,12.354,12.365,32.392,0,44.751L248.292,345.449C242.115,351.621,234.018,354.706,225.923,354.706z"/>
            </svg>
          </button>
          <div class="header-title-content">
            <slot name="title">
              <h4 class="header-title">{{ title }} vue 3</h4>
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

// Обробник кнопки "Назад" - відправляє повідомлення батьківському вікну
const handleBack = () => {
  window.parent.postMessage({ type: 'exit' }, '*')
}
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
  /* .header-content {
    padding: 12px 16px;
  } */

  .header-top {
    flex-direction: column;
    align-items: flex-start;
    /* gap: 12px; */
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
