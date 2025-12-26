<template>
  <transition :name="enableAnimation ? 'dialog-slide' : ''">
    <div
      v-if="modelValue"
      class="sky-dialogbox sky-dialogbox-next"
      :style="[zIndex ? { 'z-index': zIndex } : null]"
    >
      <div class="sky-dialog-overlay" :class="{ 'sky-dialog-animate': enableAnimation }">
        <div ref="dialogContent" class="sky-dialog-content">
          <!-- Header -->
          <button class="sky-dialog-back" :title="closeText" @click="close">
            <svg width="15" height="15" viewBox="0 0 451.847 451.847" style="transform: rotate(90deg)">
              <path fill="currentColor" d="M225.923,354.706c-8.098,0-16.195-3.092-22.369-9.263L9.27,151.157c-12.359-12.359-12.359-32.397,0-44.751c12.354-12.354,32.388-12.354,44.748,0l171.905,171.915l171.906-171.909c12.359-12.354,32.391-12.354,44.744,0c12.365,12.354,12.365,32.392,0,44.751L248.292,345.449C242.115,351.621,234.018,354.706,225.923,354.706z"/>
            </svg>
          </button>

          <div class="sky-dialog-title" :class="{ 'sky-dialog-title-with-subtitle': subtitle }">
            {{ title }}
            <span v-if="subtitle" class="sky-dialog-subtitle">{{ subtitle }}</span>
          </div>

          <div class="sky-dialog-clearfix" />

          <!-- Body -->
          <div
            ref="dialogPaper"
            class="sky-dialog-paper"
            :class="{ 'sky-dialog-paper-no-footer': !showFooter }"
            @touchstart="handleTouchStart"
            @touchend="handleTouchEnd"
          >
            <!-- iOS swipe back area -->
            <div v-if="isIos" class="sky-dialog-swipe-area" />
            <slot></slot>
          </div>

          <!-- Footer -->
          <div v-if="showFooter" class="sky-dialog-footer" :class="{ 'sky-dialog-footer-animate': enableAnimation }">
            <slot name="buttons"></slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { isIosWebview, isAndroidWebview } from '../../shared/utils/webviewCheck'

export default {
  name: 'DialogNext',
  props: {
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
    zIndex: {
      type: [Number, String],
      default: null
    },
    closeText: {
      type: String,
      default: 'Назад'
    },
    enableAnimation: {
      type: Boolean,
      default: true
    },
    closeOnEsc: {
      type: Boolean,
      default: true
    },
    hasButtons: {
      type: Boolean,
      default: null
    }
  },
  data() {
    return {
      touchStartX: 0
    }
  },
  computed: {
    isIos() {
      try {
        return isIosWebview()
      } catch {
        return false
      }
    },
    isAndroid() {
      try {
        return isAndroidWebview()
      } catch {
        return false
      }
    },
    // Determine if footer should be shown
    showFooter() {
      // If hasButtons prop is explicitly set, use it
      if (this.hasButtons !== null) {
        return this.hasButtons
      }
      // Fallback to slot check (for direct usage without Dialog wrapper)
      return !!this.$slots.buttons
    }
  },
  watch: {
    // Body scroll lock
    modelValue(value) {
      if (value) {
        document.body.style.overflow = 'hidden'
        this.$nextTick(() => {
          this.androidFix()
        })
      } else {
        document.body.style.overflow = ''
      }
    }
  },
  mounted() {
    document.addEventListener('keydown', this.handleKeydown)
    window.addEventListener('resize', this.androidFix)
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.handleKeydown)
    window.removeEventListener('resize', this.androidFix)
    document.body.style.overflow = ''
  },
  methods: {
    close() {
      this.$emit('update:modelValue', false)
      this.$emit('close')
    },
    handleKeydown(e) {
      if (e.key === 'Escape' && this.closeOnEsc && this.modelValue) {
        this.close()
      }
      if (e.key === 'Enter' && this.modelValue) {
        this.$emit('save')
      }
    },
    // Touch handling for iOS swipe back
    handleTouchStart(e) {
      if (e.touches[0].clientX < 35) {
        this.touchStartX = e.touches[0].clientX
      }
    },
    handleTouchEnd(e) {
      if (this.touchStartX > 0 && this.touchStartX < 35) {
        const touchEndX = e.changedTouches[0].clientX
        if (touchEndX - this.touchStartX > 50) {
          this.close()
        }
      }
      this.touchStartX = 0
    },
    // Android notch fix
    androidFix() {
      if (!this.isAndroid || !this.$refs.dialogContent) return

      try {
        if (typeof Android !== 'undefined' && Android.getDisplayCutoutTop) {
          const cutoutTop = Android.getDisplayCutoutTop()
          if (cutoutTop && window.devicePixelRatio > 1.0) {
            const paddingTop = cutoutTop / window.devicePixelRatio
            this.$refs.dialogContent.style.paddingTop = paddingTop + 'px'
          }
        }
      } catch (err) {
        // Android interface not available
      }
    }
  }
}
</script>

<style>
/* Global styles (не scoped через баг з Teleport) */
.sky-dialogbox-next {
  display: block;
  position: fixed;
  padding: 0;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: var(--sky-dialog-z-index, 9998);
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
}
</style>

<style scoped>
.sky-dialog-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  padding: 0;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
}

.sky-dialog-content {
  background: var(--sky-dialog-bg, white);
  width: 100%;
  height: 100%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.24);
}

.sky-dialog-back {
  cursor: pointer;
  margin: 10px;
  padding: 14px 12px 6px;
  float: left;
  line-height: 1;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--sky-dialog-back-color, #374151);
  transition: background-color 0.2s;
}

.sky-dialog-back:hover {
  background-color: var(--sky-dialog-back-hover-bg, #f8f9fa);
}

.sky-dialog-title {
  max-width: calc(100% - 80px);
  font-size: var(--sky-dialog-title-size, 13pt);
  padding: 21px 0;
  padding-right: 0;
  float: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--sky-dialog-title-color, #252525);
}

.sky-dialog-title-with-subtitle {
  padding: 13px 0;
}

.sky-dialog-subtitle {
  display: block;
  font-size: var(--sky-dialog-subtitle-size, 12pt);
  line-height: 24px;
  color: var(--sky-dialog-subtitle-color, #6c757d);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sky-dialog-clearfix {
  clear: both;
}

.sky-dialog-paper {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  position: relative;
}

.sky-dialog-swipe-area {
  position: absolute;
  width: 35px;
  height: 100%;
  left: 0;
}

.sky-dialog-footer {
  padding: 5px 10px;
  display: flex;
  justify-content: center;
  width: 100%;
  transform: translateY(-52px);
  gap: 10px;
}

/* Кнопки в футері: 1 = 100%, 2 = по 50% */
.sky-dialog-footer > :deep(*) {
  flex: 1;
  min-width: 0;
}

.sky-dialog-footer:has(> :deep(*:only-child)) > :deep(*) {
  max-width: 100%;
}

.sky-dialog-footer:has(> :deep(*:nth-child(2)):not(:has(> :deep(*:nth-child(3))))) > :deep(*) {
  flex: 1 1 50%;
}

/* Desktop */
@media only screen and (min-width: 1400px) {
  .sky-dialog-content {
    width: 100%;
    margin: 0 auto;
  }
}

/* Tablet and Desktop */
@media screen and (min-width: 710px) {
  .sky-dialog-paper {
    height: calc(100% - 150px);
    max-height: calc(100% - 150px);
    background-color: #fff;
    margin: 0 10px 60px 10px;
  }

  /* Full height when no footer */
  .sky-dialog-paper-no-footer {
    height: calc(100% - 70px);
    max-height: calc(100% - 70px);
    margin-bottom: 10px;
  }
}

/* Mobile */
@media screen and (max-width: 709px) {
  .sky-dialog-paper {
    height: calc(100% - 142px);
    max-height: calc(100% - 142px);
    background-color: #fff;
    margin: 0 10px 10px 10px;
    max-width: 100vw !important;
  }

  /* Full height when no footer */
  .sky-dialog-paper-no-footer {
    height: calc(100% - 60px);
    max-height: calc(100% - 60px);
  }

  .sky-dialog-footer {
    transform: translateY(-6px);
  }
}

@media screen and (max-width: 500px) {
  .sky-dialog-subtitle {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sky-dialog-title-with-subtitle {
    padding: 12px 24px !important;
  }
}

@media screen and (max-width: 374px) {
  .sky-dialog-subtitle {
    font-size: 9pt;
  }
}

/* iPhone safe area support */
@supports (padding-top: env(safe-area-inset-top)) {
  .sky-dialog-paper {
    height: calc(100% - 150px - env(safe-area-inset-top));
  }

  /* Full height when no footer */
  .sky-dialog-paper-no-footer {
    height: calc(100% - 60px - env(safe-area-inset-top));
  }

  .sky-dialog-footer {
    padding-bottom: calc(env(safe-area-inset-bottom) + 8px);
  }
}

/* Animations */
.sky-dialog-animate {
  animation: sky-dialog-slide-in 0.4s ease-in-out;
}

.sky-dialog-footer-animate {
  animation: sky-dialog-footer-in 0.4s ease-in-out;
}

@keyframes sky-dialog-slide-in {
  0% {
    opacity: 0;
    margin-top: -1600px;
  }
  100% {
    opacity: 1;
    margin-top: 0;
  }
}

@keyframes sky-dialog-footer-in {
  0% {
    opacity: 0;
    bottom: -100px;
  }
  50% {
    opacity: 0.25;
    bottom: -50px;
  }
  100% {
    opacity: 1;
    bottom: 15px;
  }
}

/* Transition */
.dialog-slide-leave-active {
  animation: sky-dialog-slide-in 0.4s reverse;
}
</style>
