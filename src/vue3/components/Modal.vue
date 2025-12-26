<template>
  <BaseTeleport to="body">
    <transition name="modal-fade">
      <div v-if="modelValue" class="sky-modal-overlay" @click.self="handleOverlayClick">
        <div class="sky-modal" :style="modalStyle">
          <div class="sky-modal-header">
            <button class="sky-modal-back" @click="close" :title="closeTitle">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="sky-modal-title-wrapper">
              <h4 class="sky-modal-title">{{ title }}</h4>
              <div v-if="subtitle" class="sky-modal-subtitle">{{ subtitle }}</div>
            </div>
          </div>

          <div class="sky-modal-body">
            <slot></slot>
          </div>

          <div v-if="$slots.footer" class="sky-modal-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </transition>
  </BaseTeleport>
</template>

<script setup>
import { computed, watch, onMounted, onUnmounted } from 'vue'
import BaseTeleport from './BaseTeleport.vue';


const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  closeTitle: {
    type: String,
    default: 'Закрити'
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  },
  closeOnEsc: {
    type: Boolean,
    default: true
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '100%'
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const modalStyle = computed(() => ({
  width: props.width,
  height: props.height
}))

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    close()
  }
}

const handleKeydown = (e) => {
  if (e.key === 'Escape' && props.closeOnEsc && props.modelValue) {
    close()
  }
}

watch(() => props.modelValue, (value) => {
  if (value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.sky-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
  z-index: var(--sky-modal-z-index, 9998);
  display: flex;
  justify-content: center;
  align-items: center;
}

.sky-modal {
  background: var(--sky-modal-bg, white);
  border-radius: var(--sky-modal-radius, 0);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.24);
  display: flex;
  flex-direction: column;
  max-width: 100%;
  max-height: 100%;
}

.sky-modal-header {
  display: flex;
  align-items: center;
  padding: var(--sky-modal-header-padding, 10px 14px);
  border-bottom: 1px solid var(--sky-modal-border-color, #dee2e6);
  flex-shrink: 0;
}

.sky-modal-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s;
  color: var(--sky-modal-back-color, #374151);
  margin-right: 12px;
}

.sky-modal-back:hover {
  background-color: var(--sky-modal-back-hover-bg, #f8f9fa);
}

.sky-modal-title-wrapper {
  flex: 1;
  min-width: 0;
}

.sky-modal-title {
  margin: 0;
  font-size: var(--sky-modal-title-size, 18px);
  font-weight: var(--sky-modal-title-weight, 500);
  color: var(--sky-modal-title-color, #252525);
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sky-modal-subtitle {
  font-size: var(--sky-modal-subtitle-size, 14px);
  color: var(--sky-modal-subtitle-color, #6c757d);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sky-modal-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--sky-modal-body-padding, 14px);
}

.sky-modal-footer {
  padding: var(--sky-modal-footer-padding, 10px 14px);
  border-top: 1px solid var(--sky-modal-border-color, #dee2e6);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-shrink: 0;
}

/* Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-active .sky-modal,
.modal-fade-leave-active .sky-modal {
  transition: transform 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .sky-modal {
  transform: translateY(-20px);
}

.modal-fade-leave-to .sky-modal {
  transform: translateY(20px);
}

/* Responsive */
@media (min-width: 768px) {
  .sky-modal {
    border-radius: var(--sky-modal-radius, 8px);
  }
}
</style>
