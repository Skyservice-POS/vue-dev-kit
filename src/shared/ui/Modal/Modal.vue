<template>
  <BaseTeleport to="body">
    <div
      v-if="modelValue"
      class="sky-modal-overlay"
      @mousedown.self="handleOverlayClick"
    >
      <div
        class="sky-modal"
        :class="{ 'sky-modal--fullscreen': isFullscreen }"
        :style="modalStyle"
      >
        <div class="sky-modal-header" ref="modalHeaderRef">
          <button class="sky-modal-back" @click="close" :title="closeTitle">
            <svg
              width="15"
              height="15"
              viewBox="0 0 451.847 451.847"
              style="transform: rotate(90deg)"
            >
              <path
                fill="currentColor"
                d="M225.923,354.706c-8.098,0-16.195-3.092-22.369-9.263L9.27,151.157c-12.359-12.359-12.359-32.397,0-44.751c12.354-12.354,32.388-12.354,44.748,0l171.905,171.915l171.906-171.909c12.359-12.354,32.391-12.354,44.744,0c12.365,12.354,12.365,32.392,0,44.751L248.292,345.449C242.115,351.621,234.018,354.706,225.923,354.706z"
              />
            </svg>
          </button>
          <div class="sky-modal-title-wrapper">
            <slot name="title">
              <h4 class="sky-modal-title">{{ title }}</h4>
            </slot>
            <slot name="subtitle">
              <div v-if="subtitle" class="sky-modal-subtitle">
                {{ subtitle }}
              </div>
            </slot>
          </div>

          <div v-if="$slots['header-actions']" class="sky-modal-header-actions">
            <slot name="header-actions"></slot>
          </div>
        </div>

        <div
          class="sky-modal-body"
          :class="{ 'sky-modal-body--no-footer': !$slots.footer }"
        >
          <slot></slot>
        </div>

        <div v-if="$slots.footer" class="sky-modal-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </BaseTeleport>
</template>

<script setup>
import { computed, watch, onMounted, onUnmounted, ref, nextTick } from "vue";
import BaseTeleport from "../BaseTeleport/BaseTeleport.vue";
import { isAndroidWebview } from "../../../sdk";

// Найпоширеніший брейкпоінт "мобільного" в цьому пакеті (SkyTileCard, SkyCard, DialogModal, Header).
const MOBILE_BREAKPOINT = 500;

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "",
  },
  subtitle: {
    type: String,
    default: "",
  },
  closeTitle: {
    type: String,
    default: "Закрити",
  },
  closeOnOverlay: {
    type: Boolean,
    default: true,
  },
  closeOnEsc: {
    type: Boolean,
    default: true,
  },
  width: {
    type: String,
    default: "100%",
  },
  height: {
    type: String,
    default: "100%",
  },
  borderRadius: {
    type: String,
    default: "12px",
  },
});

const emit = defineEmits(["update:modelValue", "close"]);

const viewportWidth = ref(
  typeof window === "undefined" ? Infinity : window.innerWidth,
);
const updateViewportWidth = () => {
  viewportWidth.value = window.innerWidth;
};
const isNarrowViewport = computed(() => viewportWidth.value <= MOBILE_BREAKPOINT);

// На вузькому viewport модалка через max-width: 100% і так виглядає
// fullscreen незалежно від пропсів width/height — тож і safe-area padding,
// і border-radius:0 мають діяти в цьому випадку теж.
const isFullscreen = computed(
  () =>
    (props.width === "100%" && props.height === "100%") ||
    isNarrowViewport.value,
);

const modalStyle = computed(() => ({
  width: props.width,
  height: props.height,
  ...(isFullscreen.value ? {} : { borderRadius: props.borderRadius }),
}));

const modalHeaderRef = ref(null);

const isAndroid = computed(() => {
  try {
    return isAndroidWebview();
  } catch {
    return false;
  }
});

// Android WebView не прокидує window insets у env(safe-area-inset-top)
// (на відміну від iOS WKWebView), тож CSS-фолбек нижче там завжди дає 0 і
// заголовок наїжджає на статус-бар/виріз. Питаємо реальну висоту напряму
// в нативного хоста — той самий підхід, що й androidFix() в DialogModal.
const androidFix = () => {
  if (!isAndroid.value || !isFullscreen.value || !modalHeaderRef.value) return;

  try {
    if (typeof Android !== "undefined" && Android.getDisplayCutoutTop) {
      const cutoutTop = Android.getDisplayCutoutTop();
      if (cutoutTop && window.devicePixelRatio > 1.0) {
        const paddingTop = cutoutTop / window.devicePixelRatio;
        modalHeaderRef.value.style.paddingTop = `calc(16px + ${paddingTop}px)`;
      }
    }
  } catch {
    // Android interface not available
  }
};

const close = () => {
  emit("update:modelValue", false);
  emit("close");
};

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    close();
  }
};

const handleKeydown = (e) => {
  if (e.key === "Escape" && props.closeOnEsc && props.modelValue) {
    close();
  }
};

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      document.body.style.overflow = "hidden";
      nextTick(androidFix);
    } else {
      document.body.style.overflow = "";
    }
  },
);

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
  window.addEventListener("resize", updateViewportWidth);
  window.addEventListener("resize", androidFix);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("resize", updateViewportWidth);
  window.removeEventListener("resize", androidFix);
  document.body.style.overflow = "";
});
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
  border-radius: var(--sky-modal-radius, 12px);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.3),
    0 1px 2px rgba(0, 0, 0, 0.24);
  display: flex;
  flex-direction: column;
  max-width: 100%;
  max-height: 100%;
}

.sky-modal--fullscreen {
  border-radius: 0;
}

.sky-modal-header {
  display: flex;
  align-items: center;
  padding: var(--sky-modal-header-padding, 16px 20px);
  border-bottom: 1px solid var(--sky-modal-border-color, #dee2e6);
  flex-shrink: 0;
}

.sky-modal-back {
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
  color: var(--sky-modal-back-color, #374151);
  margin-right: 12px;
}

.sky-modal-back svg {
  display: block;
}

.sky-modal-back:hover {
  background-color: var(--sky-modal-back-hover-bg, #f8f9fa);
}

.sky-modal-back:active {
  background-color: var(--sky-modal-back-active-bg, #e9ecef);
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

.sky-modal-header-actions {
  display: flex;
  align-items: center;
  gap: var(--sky-modal-header-actions-gap, 8px);
  margin-left: 12px;
  flex-shrink: 0;
}

.sky-modal-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--sky-modal-body-padding, 14px);
}

/* Без футера контент впритул до низу модалки — додаємо запасний відступ */
.sky-modal-body--no-footer {
  padding-bottom: var(--sky-modal-body-padding-bottom-no-footer, 15px);
  margin-bottom: 10px;
}

.sky-modal-footer {
  padding: var(--sky-modal-footer-padding, 10px 14px);
  border-top: 1px solid var(--sky-modal-border-color, #dee2e6);
  display: flex;
  justify-content: flex-end;
  gap: var(--sky-modal-footer-gap, 14px);
  flex-shrink: 0;
}

/* iOS safe area — only when modal occupies the full viewport */
@supports (padding-top: env(safe-area-inset-top)) {
  .sky-modal--fullscreen .sky-modal-header {
    padding-top: calc(16px + env(safe-area-inset-top));
  }
  .sky-modal--fullscreen .sky-modal-footer {
    padding-bottom: calc(10px + env(safe-area-inset-bottom));
  }
  .sky-modal--fullscreen .sky-modal-body--no-footer {
    padding-bottom: calc(
      var(--sky-modal-body-padding-bottom-no-footer, 15px) +
        env(safe-area-inset-bottom)
    );
    margin-bottom: 10px;
  }
}
</style>
