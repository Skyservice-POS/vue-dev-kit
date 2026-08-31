<script setup lang="ts">
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue';

/**
 * Trigger + popover shell shared by the filter chips (SkyCheckboxFilter,
 * SkySelectFilter). Owns only the shell concerns — open state, positioning,
 * dismissal and a11y — the content is entirely up to the caller.
 */
const props = withDefaults(
  defineProps<{
    /** Chip label, always visible. */
    title: string;
    /** Replaces the title when exactly one thing is picked (e.g. the option name). */
    summary?: string;
    /** Shown next to the title when several things are picked (e.g. the count). */
    badge?: string | number;
    disabled?: boolean;
    /** Which trigger edge the panel lines up with when it fits. */
    align?: 'start' | 'end';
    /** Panel width in px; the panel never grows past the viewport. */
    width?: number;
  }>(),
  {
    summary: '',
    badge: '',
    disabled: false,
    align: 'start',
    width: 280,
  },
);

const emit = defineEmits<{
  open: [];
  close: [];
}>();

const GAP = 5;
/** Below this the panel would be too cramped to be useful — flip it above instead. */
const MIN_PANEL_HEIGHT = 180;
const EDGE = 8;

const triggerRef = ref<HTMLButtonElement | null>(null);
const panelRef = ref<HTMLDivElement | null>(null);
const isOpen = ref(false);
const panelStyle = ref<Record<string, string>>({});

const label = computed(() => props.summary || props.title);
const hasBadge = computed(() => !props.disabled && props.badge !== '' && props.badge != null);

/**
 * Anchors the panel to the trigger. Runs on open and on every scroll/resize while
 * open — a position frozen at open time drifts as soon as anything scrolls, which
 * is the reason the old filter had to lock the page scroll instead.
 */
function updatePosition(): void {
  const trigger = triggerRef.value;
  if (!trigger) return;

  const rect = trigger.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const width = Math.min(props.width, vw - EDGE * 2);
  const left = props.align === 'end' ? rect.right - width : rect.left;

  const below = vh - rect.bottom - GAP - EDGE;
  const above = rect.top - GAP - EDGE;
  const flip = below < MIN_PANEL_HEIGHT && above > below;

  panelStyle.value = {
    left: `${Math.max(EDGE, Math.min(left, vw - width - EDGE))}px`,
    width: `${width}px`,
    maxHeight: `${Math.max(MIN_PANEL_HEIGHT, flip ? above : below)}px`,
    ...(flip ? { bottom: `${vh - rect.top + GAP}px` } : { top: `${rect.bottom + GAP}px` }),
  };
}

function open(): void {
  if (props.disabled || isOpen.value) return;
  isOpen.value = true;
  emit('open');
  void nextTick(updatePosition);
}

function close(): void {
  if (!isOpen.value) return;
  isOpen.value = false;
  emit('close');
}

function toggle(): void {
  if (isOpen.value) close();
  else open();
}

function onDocumentPointerDown(e: Event): void {
  const target = e.target as Node | null;
  if (!target) return;
  if (triggerRef.value?.contains(target) || panelRef.value?.contains(target)) return;
  close();
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    close();
    triggerRef.value?.focus();
  }
}

// Listeners live only while the panel is open, so a page full of filter chips does
// not keep N document listeners alive for nothing. Scroll is captured so that
// scrolling any ancestor container repositions the panel, not just the window.
function attachListeners(): void {
  document.addEventListener('pointerdown', onDocumentPointerDown, true);
  document.addEventListener('keydown', onKeydown);
  window.addEventListener('scroll', updatePosition, true);
  window.addEventListener('resize', updatePosition);
}

function detachListeners(): void {
  document.removeEventListener('pointerdown', onDocumentPointerDown, true);
  document.removeEventListener('keydown', onKeydown);
  window.removeEventListener('scroll', updatePosition, true);
  window.removeEventListener('resize', updatePosition);
}

watch(isOpen, (nowOpen) => (nowOpen ? attachListeners() : detachListeners()));

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) close();
  },
);

// Detach directly rather than relying on the watcher: watchers flush async, so an
// unmount while open would leave the document listeners behind.
onBeforeUnmount(detachListeners);

defineExpose({ open, close, toggle, isOpen });
</script>

<template>
  <div class="sky-filter-dropdown">
    <button
      ref="triggerRef"
      type="button"
      class="sky-filter-dropdown__trigger"
      :class="{ 'is-open': isOpen, 'is-disabled': disabled }"
      :disabled="disabled"
      aria-haspopup="dialog"
      :aria-expanded="isOpen"
      @click="toggle"
    >
      <span class="sky-filter-dropdown__title">{{ label }}</span>
      <span v-if="hasBadge" class="sky-filter-dropdown__badge">{{ badge }}</span>
      <svg
        class="sky-filter-dropdown__caret"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>

    <teleport to="body">
      <transition name="sky-filter-dropdown-fade">
        <div
          v-if="isOpen"
          ref="panelRef"
          class="sky-filter-dropdown__panel"
          role="dialog"
          :aria-label="title"
          :style="panelStyle"
        >
          <slot :close="close" />
        </div>
      </transition>
    </teleport>
  </div>
</template>

<style scoped>
.sky-filter-dropdown {
  display: inline-block;
}

.sky-filter-dropdown__trigger {
  display: flex;
  align-items: center;
  height: var(--sky-filter-trigger-height, 38px);
  padding: var(--sky-filter-trigger-padding, 0 10px);
  border: 1px solid var(--sky-filter-trigger-border-color, #ced4da);
  border-radius: var(--sky-filter-trigger-radius, 5px);
  background: var(--sky-filter-trigger-bg, transparent);
  color: var(--sky-filter-trigger-color, inherit);
  font: inherit;
  white-space: nowrap;
  cursor: pointer;
}

.sky-filter-dropdown__trigger:focus-visible {
  outline: 2px solid var(--sky-filter-accent, #106090);
  outline-offset: 1px;
}

.sky-filter-dropdown__title {
  font-size: var(--sky-filter-trigger-font-size, 12pt);
  font-weight: var(--sky-filter-trigger-font-weight, 500);
  overflow: hidden;
  text-overflow: ellipsis;
}

.sky-filter-dropdown__badge {
  margin-left: 4px;
  font-size: 12px;
  color: var(--sky-filter-badge-color, gray);
}

.sky-filter-dropdown__caret {
  flex-shrink: 0;
  margin-left: 4px;
  transition: transform 0.2s ease-in-out;
}

.sky-filter-dropdown__trigger.is-open,
.sky-filter-dropdown__trigger.is-disabled {
  color: var(--sky-filter-trigger-muted-color, #b4b4b4);
}

.sky-filter-dropdown__trigger.is-open .sky-filter-dropdown__caret {
  transform: rotate(180deg);
}

.sky-filter-dropdown__trigger.is-disabled {
  cursor: default;
}

.sky-filter-dropdown__trigger.is-disabled .sky-filter-dropdown__caret {
  opacity: 0.5;
}

/* Panel — teleported to <body>, so an ancestor with transform/filter cannot
   break the fixed positioning. */
.sky-filter-dropdown__panel {
  position: fixed;
  z-index: var(--sky-filter-panel-z-index, 1000);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: var(--sky-filter-panel-padding, 10px 15px);
  border-radius: var(--sky-filter-panel-radius, 5px);
  background: var(--sky-filter-panel-bg, #fff);
  box-shadow: var(--sky-filter-panel-shadow, 0 5px 8px rgba(0, 0, 0, 0.3));
}

.sky-filter-dropdown-fade-enter-active {
  animation: sky-filter-dropdown-in 0.2s;
}

.sky-filter-dropdown-fade-leave-active {
  animation: sky-filter-dropdown-in 0.2s reverse;
}

@keyframes sky-filter-dropdown-in {
  0% {
    transform: translate3d(0, -10px, 0);
    opacity: 0;
  }
  100% {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
}
</style>
