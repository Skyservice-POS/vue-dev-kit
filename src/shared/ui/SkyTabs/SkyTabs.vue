<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';

const props = defineProps<{
  modelValue?: string | number;
  options: { value: string | number; text: string }[];
  disabled?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

const tabsEl = ref<HTMLElement | null>(null);
const indicatorStyle = ref<Record<string, string>>({ opacity: '0' });
let animate = false;

function moveIndicator(): void {
  const root = tabsEl.value;
  const active = root?.querySelector<HTMLElement>('.sky-tabs__btn--active');
  if (!root || !active) return;
  const rootRect = root.getBoundingClientRect();
  const btnRect = active.getBoundingClientRect();
  indicatorStyle.value = {
    opacity: '1',
    width: `${btnRect.width}px`,
    transform: `translateX(${Math.round(btnRect.left - rootRect.left)}px)`,
    // Snap into place on first paint; animate only subsequent moves.
    ...(animate ? {} : { transition: 'none' }),
  };
}

function select(value: string | number): void {
  if (props.disabled) return;
  emit('update:modelValue', value);
}

watch(
  () => [props.modelValue, props.options.length] as const,
  () => void nextTick(moveIndicator),
);
onMounted(() => {
  void nextTick(() => {
    moveIndicator();
    requestAnimationFrame(() => {
      animate = true;
    });
  });
  window.addEventListener('resize', moveIndicator);
});
onBeforeUnmount(() => window.removeEventListener('resize', moveIndicator));
</script>

<template>
  <div ref="tabsEl" class="sky-tabs" :class="{ 'sky-tabs--disabled': disabled }" role="tablist">
    <span class="sky-tabs__indicator" :style="indicatorStyle" aria-hidden="true" />
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="tab"
      class="sky-tabs__btn"
      :class="{ 'sky-tabs__btn--active': modelValue === option.value }"
      :aria-selected="modelValue === option.value"
      :disabled="disabled"
      @click="select(option.value)"
    >
      {{ option.text }}
    </button>
  </div>
</template>

<style scoped>
.sky-tabs {
  position: relative;
  display: inline-flex;
  padding: 3px;
  background: #f1f3f5;
  border-radius: 8px;
}

.sky-tabs--disabled {
  opacity: 0.6;
  pointer-events: none;
}

.sky-tabs__indicator {
  position: absolute;
  top: 3px;
  bottom: 3px;
  left: 0;
  border-radius: 6px;
  background: #fff;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.06);
  transition:
    transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, width;
}

.sky-tabs__btn {
  position: relative;
  z-index: 1;
  padding: 6px 14px;
  border: none;
  background: transparent;
  color: #6c757d;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s ease;
}

.sky-tabs__btn--active {
  color: #212529;
}

.sky-tabs__btn:disabled {
  cursor: not-allowed;
}
</style>
