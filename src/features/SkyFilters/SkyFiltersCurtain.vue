<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import SkyButton from '@/shared/ui/SkyButton/SkyButton.vue';
import { panelProps, resolveFilterType, type SkyFilterConfig, type SkyFiltersLabels } from './filterTypes';

/**
 * Штора «Усі фільтри»: виїжджає зліва на всю висоту, праворуч — розмитий фон.
 * Показує всі фільтри (не лише ті, що не влізли в рядок), кожен — розгортною
 * секцією з тим самим вмістом панелі, що й у дропдауні рядка.
 *
 * Значень не тримає: кожна зміна йде нагору через `update`, тож SkyFilters
 * лишається єдиним місцем, звідки летить `change`.
 */
const props = withDefaults(
  defineProps<{
    open: boolean;
    filters: SkyFilterConfig[];
    values: Record<string, unknown>;
    labels: SkyFiltersLabels;
    disabled?: boolean;
    /**
     * Елемент (або CSS-селектор), до верхнього лівого кута якого прилипає штора —
     * напр. контентна область поруч із бічним меню. Без нього — край вікна.
     */
    anchor?: string | HTMLElement | null;
    width?: number;
  }>(),
  {
    disabled: false,
    anchor: null,
    width: 320,
  },
);

const emit = defineEmits<{
  close: [];
  reset: [];
  update: [key: string, value: unknown];
}>();

const curtainRef = ref<HTMLDivElement | null>(null);
const expanded = ref<Record<string, boolean>>({});
const origin = ref({ top: 0, left: 0 });

const sections = computed(() =>
  props.filters.map((f) => {
    const def = resolveFilterType(f);
    const value = props.values[f.key] ?? def.emptyValue(f);
    return { f, def, value, count: def.display(value, f).count };
  }),
);

function isExpanded(key: string, count: number, collapsed?: boolean): boolean {
  if (key in expanded.value) return expanded.value[key];
  return count > 0 || !collapsed;
}

function toggle(key: string, count: number, collapsed?: boolean): void {
  expanded.value = { ...expanded.value, [key]: !isExpanded(key, count, collapsed) };
}

function updateOrigin(): void {
  const el = typeof props.anchor === 'string' ? document.querySelector(props.anchor) : props.anchor;
  if (!el) {
    origin.value = { top: 0, left: 0 };
    return;
  }
  const rect = el.getBoundingClientRect();
  origin.value = { top: Math.max(0, rect.top), left: Math.max(0, rect.left) };
}

const curtainStyle = computed(() => ({
  top: `${origin.value.top}px`,
  left: `${origin.value.left}px`,
  width: `${props.width}px`,
  height: `calc(100vh - ${origin.value.top}px)`,
}));

const blurStyle = computed(() => {
  const left = origin.value.left + props.width;
  return { left: `${left}px`, width: `calc(100% - ${left}px)` };
});

// Кнопка «Усі фільтри» сама перемикає штору — клік по ній не вважаємо «ззовні»,
// інакше штора закрилась би й одразу відкрилась знову.
function onPointerDown(e: Event): void {
  const target = e.target as Element | null;
  if (!target || curtainRef.value?.contains(target)) return;
  if (target.closest?.('[data-sky-filters-more]')) return;
  // Панелі дропдаунів телепортовані в body — клік у них теж не «ззовні».
  if (target.closest?.('.sky-filter-dropdown__panel')) return;
  emit('close');
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') emit('close');
}

function attach(): void {
  document.addEventListener('pointerdown', onPointerDown, true);
  document.addEventListener('keydown', onKeydown);
  window.addEventListener('resize', updateOrigin);
}

function detach(): void {
  document.removeEventListener('pointerdown', onPointerDown, true);
  document.removeEventListener('keydown', onKeydown);
  window.removeEventListener('resize', updateOrigin);
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      // Згорнуте/розгорнуте скидається на кожне відкриття.
      expanded.value = {};
      updateOrigin();
      attach();
    } else {
      detach();
    }
  },
  { immediate: true },
);

onBeforeUnmount(detach);
</script>

<template>
  <teleport to="body">
    <transition name="sky-filters-curtain-slide">
      <div
        v-if="open"
        ref="curtainRef"
        class="sky-filters-curtain"
        role="dialog"
        :aria-label="labels.allFilters"
        :style="curtainStyle"
      >
        <div class="sky-filters-curtain__headline">
          <span>{{ labels.allFilters }}</span>
          <button type="button" class="sky-filters-curtain__close" aria-label="✕" @click="emit('close')">
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <div class="sky-filters-curtain__body">
          <section v-for="s in sections" :key="s.f.key" class="sky-filters-curtain__section">
            <button
              type="button"
              class="sky-filters-curtain__sectionHeader"
              :aria-expanded="isExpanded(s.f.key, s.count, s.f.collapsed)"
              @click="toggle(s.f.key, s.count, s.f.collapsed)"
            >
              <span class="sky-filters-curtain__sectionTitle">{{ s.f.title }}</span>
              <span v-if="s.count > 0" class="sky-filters-curtain__sectionBadge">{{ s.count }} {{ labels.pcs }}</span>
              <svg
                class="sky-filters-curtain__caret"
                :class="{ 'is-open': isExpanded(s.f.key, s.count, s.f.collapsed) }"
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

            <div v-if="isExpanded(s.f.key, s.count, s.f.collapsed)" class="sky-filters-curtain__sectionBody">
              <component
                :is="s.def.component"
                v-bind="panelProps(s.f, s.def, labels)"
                :model-value="s.value"
                :disabled="disabled || s.f.disabled"
                @update:model-value="emit('update', s.f.key, $event)"
              />
            </div>
          </section>
        </div>

        <div class="sky-filters-curtain__footer">
          <SkyButton variant="outline-secondary" @click="emit('reset')">{{ labels.reset }}</SkyButton>
          <SkyButton variant="outline-primary" @click="emit('close')">{{ labels.ok }}</SkyButton>
        </div>
      </div>
    </transition>

    <div v-if="open" class="sky-filters-curtain__blur" :style="blurStyle" />
  </teleport>
</template>

<style scoped>
/* Розміри — з FiltersCurtain/HeaderFiltersCurtain адмінки. */
.sky-filters-curtain {
  position: fixed;
  z-index: var(--sky-filters-curtain-z-index, 999);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: var(--sky-filters-curtain-bg, #fff);
  border-right: 1px solid #dee2e6;
  box-shadow: 10px 14px 16px 8px rgba(0, 0, 0, 0.1);
  color: var(--sky-filters-curtain-color, #212529);
  cursor: default;
}

.sky-filters-curtain__headline {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  border-bottom: 1px solid #cccaca73;
  font-size: 16px;
  font-weight: 600;
}

.sky-filters-curtain__close {
  display: flex;
  padding: 2px;
  border: none;
  background: transparent;
  color: #979797;
  cursor: pointer;
}

.sky-filters-curtain__body {
  flex: 1;
  overflow-y: auto;
  padding: 10px 15px;
  /* Список у секції обмежений, щоб довгий фільтр не з'їдав усю штору. */
  --sky-filter-list-max-height: 260px;
  /* Елементи дрібніші за заголовок секції (15px), щоб заголовок виділявся. */
  --sky-filter-option-font-size: 13px;
  --sky-filter-action-font-size: 13px;
  --sky-filter-action-font-weight: 400;
}

.sky-filters-curtain__body::-webkit-scrollbar {
  width: 6px;
}

.sky-filters-curtain__body::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.sky-filters-curtain__section {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.sky-filters-curtain__section:last-child {
  border-bottom: none;
}

.sky-filters-curtain__sectionHeader {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 10px 4px;
  border: none;
  background: transparent;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.sky-filters-curtain__sectionTitle {
  font-size: 15px;
  font-weight: 500;
}

.sky-filters-curtain__sectionBadge {
  font-size: 12px;
  color: gray;
}

.sky-filters-curtain__caret {
  flex-shrink: 0;
  margin-left: auto;
  transition: transform 0.2s ease-in-out;
}

.sky-filters-curtain__caret.is-open {
  transform: rotate(180deg);
}

.sky-filters-curtain__sectionBody {
  padding: 0 4px 10px;
}

.sky-filters-curtain__footer {
  display: flex;
  flex-shrink: 0;
  column-gap: 10px;
  padding: 15px;
}

.sky-filters-curtain__footer > * {
  flex: 1;
  justify-content: center;
}

.sky-filters-curtain__blur {
  position: fixed;
  top: 0;
  z-index: calc(var(--sky-filters-curtain-z-index, 999) - 1);
  height: 100vh;
  backdrop-filter: blur(15px);
  opacity: 0.2;
}

.sky-filters-curtain-slide-enter-active,
.sky-filters-curtain-slide-leave-active {
  transition: transform 0.3s;
}

.sky-filters-curtain-slide-enter-from,
.sky-filters-curtain-slide-leave-to {
  transform: translateX(-100%);
}
</style>
