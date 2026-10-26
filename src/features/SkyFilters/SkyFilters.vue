<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import SkyFilterDropdown from '@/shared/ui/SkyFilterDropdown/SkyFilterDropdown.vue';
import FilterDone from '@/shared/ui/SkyFilterDropdown/FilterDone.vue';
import SkyFiltersCurtain from './SkyFiltersCurtain.vue';
import {
  defaultSkyFiltersLabels,
  panelProps,
  resolveFilterType,
  type SkyFilterConfig,
  type SkyFiltersLabels,
} from './filterTypes';

/**
 * Рядок фільтрів: рендерить фільтри з конфігу, тримає їхні значення в одному
 * v-model-об'єкті й ховає ті, що не влазять по ширині, у кнопку «Усі фільтри»,
 * яка відкриває штору зі всіма фільтрами.
 *
 * Сховані фільтри не видаляються з DOM, а лише виймаються з потоку
 * (`visibility: hidden; position: absolute`): так їхню реальну ширину — разом
 * із назвою обраного й бейджем — можна виміряти будь-коли, без окремого
 * «вимірювального» рядка з наближеними розмірами.
 */
const props = withDefaults(
  defineProps<{
    filters: SkyFilterConfig[];
    modelValue?: Record<string, unknown>;
    disabled?: boolean;
    labels?: Partial<SkyFiltersLabels>;
    /** Куди прилипає штора — див. SkyFiltersCurtain `anchor`. */
    curtainAnchor?: string | HTMLElement | null;
    curtainWidth?: number;
  }>(),
  {
    modelValue: () => ({}),
    disabled: false,
    labels: () => ({}),
    curtainAnchor: null,
    curtainWidth: 320,
  },
);

const emit = defineEmits<{
  'update:modelValue': [Record<string, unknown>];
  change: [{ key: string; value: unknown; values: Record<string, unknown> }];
  reset: [Record<string, unknown>];
}>();

const l = computed<SkyFiltersLabels>(() => ({ ...defaultSkyFiltersLabels, ...props.labels }));

const rootRef = ref<HTMLDivElement | null>(null);
const rowRef = ref<HTMLDivElement | null>(null);
const measureMoreRef = ref<HTMLElement | null>(null);
const measureResetRef = ref<HTMLElement | null>(null);
const itemEls = new Map<string, HTMLElement>();
const hiddenFrom = ref<number | null>(null);
const curtainOpen = ref(false);

const items = computed(() =>
  props.filters
    .map((f) => ({ f, def: resolveFilterType(f) }))
    // Фільтр, у якому нема з чого обирати, не показуємо зовсім.
    .filter(({ f, def }) => f.keepEmpty || !def.hasItems || def.hasItems(f))
    .map(({ f, def }) => {
      const value = props.modelValue[f.key] ?? def.emptyValue(f);
      return { f, def, value, display: def.display(value, f) };
    }),
);

const activeCount = computed(() => items.value.filter((i) => i.display.count > 0).length);
const hasOverflow = computed(() => hiddenFrom.value !== null);

function isHidden(index: number): boolean {
  return hiddenFrom.value !== null && index >= hiddenFrom.value;
}

function setItemEl(key: string, el: unknown): void {
  if (el instanceof HTMLElement) itemEls.set(key, el);
  else itemEls.delete(key);
}

/**
 * Скільки фільтрів влазить у рядок. Спершу пробуємо всі разом (плюс «Скинути
 * фільтри», якщо є що скидати); не влізли — резервуємо місце під «Усі фільтри»
 * і набираємо зліва направо, доки є місце. Порядок не перемішується: після
 * першого, що не вліз, ховаються й усі наступні.
 */
function recalc(): void {
  const row = rowRef.value;
  if (!row) return;
  const available = row.clientWidth;
  const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
  const widths = items.value.map((i) => itemEls.get(i.f.key)?.offsetWidth ?? 0);

  const total = widths.reduce((sum, w, i) => sum + w + (i ? gap : 0), 0);
  const resetWidth = activeCount.value > 0 ? (measureResetRef.value?.offsetWidth ?? 0) + gap : 0;
  if (total + resetWidth <= available) {
    hiddenFrom.value = null;
    return;
  }

  const moreWidth = (measureMoreRef.value?.offsetWidth ?? 0) + gap;
  let used = 0;
  let fit = 0;
  for (const w of widths) {
    const add = w + (fit ? gap : 0);
    // Перший фільтр лишається завжди: рядок з однієї кнопки «Усі фільтри» гірший.
    if (fit > 0 && used + add + moreWidth > available) break;
    used += add;
    fit++;
  }
  hiddenFrom.value = fit < widths.length ? fit : null;
}

let frame = 0;
function scheduleRecalc(): void {
  cancelAnimationFrame(frame);
  void nextTick(() => {
    frame = requestAnimationFrame(recalc);
  });
}

// Ширина тригера залежить від значення (назва обраного, бейдж) — перераховуємо.
watch(
  () => [props.filters, props.modelValue, props.labels],
  scheduleRecalc,
  { deep: true },
);

let observer: ResizeObserver | null = null;
onMounted(() => {
  recalc();
  if (typeof ResizeObserver !== 'undefined' && rootRef.value) {
    observer = new ResizeObserver(scheduleRecalc);
    observer.observe(rootRef.value);
  }
});

onBeforeUnmount(() => {
  observer?.disconnect();
  cancelAnimationFrame(frame);
});

function setValue(key: string, value: unknown): void {
  const values = { ...props.modelValue, [key]: value };
  emit('update:modelValue', values);
  emit('change', { key, value, values });
}

function resetAll(): void {
  const values = { ...props.modelValue };
  for (const f of props.filters) values[f.key] = resolveFilterType(f).emptyValue(f);
  emit('update:modelValue', values);
  emit('reset', values);
}

watch(
  () => props.disabled,
  (d) => {
    if (d) curtainOpen.value = false;
  },
);

defineExpose({ recalc, openCurtain: () => (curtainOpen.value = true), closeCurtain: () => (curtainOpen.value = false) });
</script>

<template>
  <div ref="rootRef" class="sky-filters">
    <div ref="rowRef" class="sky-filters__row">
      <div
        v-for="(item, index) in items"
        :key="item.f.key"
        :ref="(el) => setItemEl(item.f.key, el)"
        class="sky-filters__item"
        :class="{ 'is-hidden': isHidden(index) }"
        :aria-hidden="isHidden(index) || undefined"
      >
        <SkyFilterDropdown
          :title="item.f.title"
          :summary="item.display.summary"
          :badge="item.display.badge"
          :width="item.f.width ?? 280"
          :disabled="disabled || item.f.disabled || isHidden(index)"
        >
          <template #default="{ close }">
            <component
              :is="item.def.component"
              v-bind="panelProps(item.f, item.def, l)"
              :model-value="item.value"
              :disabled="disabled || item.f.disabled"
              @update:model-value="setValue(item.f.key, $event)"
            />

            <FilterDone :label="l.done" @done="close" />
          </template>
        </SkyFilterDropdown>
      </div>

      <button
        v-if="hasOverflow"
        type="button"
        class="sky-filters__more"
        data-sky-filters-more
        :disabled="disabled"
        :aria-expanded="curtainOpen"
        @click="curtainOpen = !curtainOpen"
      >
        <span>{{ l.allFilters }}</span>
        <span v-if="activeCount > 0" class="sky-filters__moreActive">{{ l.active }} {{ activeCount }} {{ l.pcs }}</span>
        <svg class="sky-filters__moreIcon" width="28" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="m17 5a3 3 0 1 1 3 3 3 3 0 0 1 -3-3zm-15 1h12a1 1 0 0 0 0-2h-12a1 1 0 0 0 0 2zm6 3a3 3 0 0 0 -2.82 2h-3.18a1 1 0 0 0 0 2h3.18a3 3 0 1 0 2.82-4zm14 2h-8a1 1 0 0 0 0 2h8a1 1 0 0 0 0-2zm-12 7h-8a1 1 0 0 0 0 2h8a1 1 0 0 0 0-2zm12 0h-3.18a3 3 0 1 0 0 2h3.18a1 1 0 0 0 0-2z"
            fill="currentColor"
          />
        </svg>
      </button>

      <!-- «Скинути фільтри» в рядку — лише коли «Усі фільтри» не показано: там
           скидання вже є в шторі. -->
      <button v-else-if="activeCount > 0" type="button" class="sky-filters__reset" :disabled="disabled" @click="resetAll">
        {{ l.reset }}
      </button>
    </div>

    <!-- Еталони для вимірювання. «Усі фільтри» міряємо одразу з «Активно N шт.»:
         інакше в момент першого вибору кнопка розширюється, і видимий фільтр
         раптово стрибає в штору. -->
    <div class="sky-filters__measure" aria-hidden="true">
      <span ref="measureMoreRef" class="sky-filters__more">
        <span>{{ l.allFilters }}</span>
        <span class="sky-filters__moreActive">{{ l.active }} {{ Math.max(activeCount, 1) }} {{ l.pcs }}</span>
        <span class="sky-filters__moreIcon" />
      </span>
      <span ref="measureResetRef" class="sky-filters__reset">{{ l.reset }}</span>
    </div>

    <SkyFiltersCurtain
      :open="curtainOpen"
      :filters="items.map((i) => i.f)"
      :values="modelValue"
      :labels="l"
      :disabled="disabled"
      :anchor="curtainAnchor"
      :width="curtainWidth"
      @update="setValue"
      @reset="resetAll"
      @close="curtainOpen = false"
    />
  </div>
</template>

<style scoped>
.sky-filters {
  position: relative;
  min-width: 0;
}

.sky-filters__row {
  position: relative;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  column-gap: var(--sky-filters-gap, 5px);
  /* overflow не hidden: ширину контролює recalc(), а обрізати тут нема чого. */
}

.sky-filters__item {
  flex-shrink: 0;
}

.sky-filters__item.is-hidden {
  position: absolute;
  top: 0;
  left: 0;
  visibility: hidden;
  pointer-events: none;
}

.sky-filters__more {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 4px;
  height: var(--sky-filter-trigger-height, 38px);
  padding: 0 10px;
  border: none;
  background: transparent;
  font: inherit;
  font-size: 16px;
  font-weight: 500;
  color: inherit;
  white-space: nowrap;
  cursor: pointer;
}

.sky-filters__more:disabled {
  color: var(--sky-filter-trigger-muted-color, #b4b4b4);
  cursor: default;
}

.sky-filters__moreActive {
  margin: 1px 0 0 4px;
  font-size: 12px;
  font-weight: 400;
  color: gray;
}

.sky-filters__moreIcon {
  display: inline-block;
  width: 28px;
  height: 18px;
  padding: 0 4px;
  box-sizing: content-box;
}

.sky-filters__reset {
  flex-shrink: 0;
  padding: 6px 10px;
  border: none;
  background: transparent;
  font: inherit;
  font-size: 12px;
  color: var(--sky-filters-reset-color, gray);
  text-decoration: underline;
  white-space: nowrap;
  cursor: pointer;
}

.sky-filters__reset:disabled {
  cursor: default;
  opacity: 0.5;
}

.sky-filters__measure {
  position: absolute;
  top: -9999px;
  left: -9999px;
  display: flex;
  visibility: hidden;
  pointer-events: none;
}
</style>
