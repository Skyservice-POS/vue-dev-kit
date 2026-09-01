<script setup lang="ts" generic="TRow">
// Віртуалізоване тіло таблиці: у DOM живе тільки видиме вікно рядків.
//
// Контракт слотів і props навмисно збігається зі `SkyTableBody` — на цьому
// тримається перемикач `virtual` у SkyDataTable. Відрізняється лише те, хто
// вирішує, які рядки зараз рендеряться, тож розмітка рядка пишеться один раз.
//
// Рушій — headless `@tanstack/vue-virtual`: він не додає власного DOM і не
// тягне свого CSS, тому між тілом і `SkyTableRow` лишається рівно одна наша
// обгортка. Рядку це байдуже — `grid-template-columns` він бере з inject
// (`SKY_TABLE_CONTEXT`), а не від безпосереднього батька.
//
// Обовʼязкова умова: висота таблиці має бути обмежена (батько з `height`
// або `flex` + `min-height: 0`). Якщо тіло росте разом з контентом, скролиться
// сторінка, вікно ніколи не зсувається — і віртуалізація нічого не дає.
import { computed, ref, watch } from 'vue';
import { useVirtualizer } from '@tanstack/vue-virtual';

const props = withDefaults(
  defineProps<{
    /** Рядки. На відміну від SkyTableBody тут вони обовʼязкові. */
    rows: TRow[];
    /** Ключ рядка. Індекс за замовчуванням — лише для статичних списків. */
    rowKey?: (row: TRow, index: number) => string | number;
    /** Очікувана висота рядка в px — база для розрахунку вікна. */
    estimateSize?: number;
    /** Скільки рядків тримати в DOM понад видиме вікно. */
    overscan?: number;
    /**
     * Рядки різної висоти (перенос тексту, розкриті деталі). Вмикає вимірювання
     * кожного видимого рядка через ResizeObserver — точно, але дорожче.
     * Якщо висота фіксована, лишайте `false`: тоді геометрія рахується
     * арифметикою, без жодного читання з DOM.
     */
    dynamic?: boolean;
  }>(),
  {
    rowKey: (_row: TRow, index: number) => index,
    estimateSize: 40,
    overscan: 6,
    dynamic: false,
  },
);

const emit = defineEmits<{
  /** Останній рядок увійшов у вікно — зручно вішати довантаження. */
  'reach-end': [];
}>();

defineSlots<{
  default(props: { row: TRow; index: number }): unknown;
  empty(): unknown;
}>();

const scrollEl = ref<HTMLElement | null>(null);

const virtualizer = useVirtualizer(
  computed(() => ({
    count: props.rows.length,
    getScrollElement: () => scrollEl.value,
    estimateSize: () => props.estimateSize,
    overscan: props.overscan,
    // Ключ віддаємо віртуалізатору, щоб при зміні порядку рядків він
    // переставляв виміряні висоти разом з ними, а не за індексом.
    getItemKey: (index: number) => props.rowKey(props.rows[index], index),
  })),
);

const virtualRows = computed(() => virtualizer.value.getVirtualItems());
const totalSize = computed(() => virtualizer.value.getTotalSize());

// measureElement читає індекс з `data-index`, тому атрибут обовʼязковий.
// Приймаємо `unknown`: Vue типізує ref-функцію ширше (елемент або інстанс
// компонента), а міряти є сенс лише справжній DOM-вузол.
function measureRow(el: unknown) {
  if (el instanceof Element) virtualizer.value.measureElement(el);
}

// `reach-end` за появою останнього рядка у вікні, а не за подією скролу:
// спрацьовує на overscan раніше, тож довантаження встигає до порожнього місця.
watch(
  () => {
    const items = virtualRows.value;
    return items.length ? items[items.length - 1].index : -1;
  },
  (lastIndex) => {
    if (props.rows.length > 0 && lastIndex >= props.rows.length - 1) {
      emit('reach-end');
    }
  },
);
</script>

<template>
  <div ref="scrollEl" class="sky-table__body sky-table__body--virtual" role="rowgroup">
    <slot v-if="!rows.length" name="empty" />

    <!-- Розпірка задає повну висоту списку, щоб скролбар відповідав усім рядкам. -->
    <div v-else class="sky-table__virtual-sizer" :style="{ height: `${totalSize}px` }">
      <div
        v-for="virtualRow in virtualRows"
        :key="String(virtualRow.key)"
        :ref="dynamic ? measureRow : undefined"
        :data-index="virtualRow.index"
        class="sky-table__virtual-row"
        :style="{ transform: `translateY(${virtualRow.start}px)` }"
      >
        <slot :row="rows[virtualRow.index]" :index="virtualRow.index" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Скролить саме це тіло — його ж віртуалізатор бере як getScrollElement.
   Вкладеного скролера немає, тож двозначності «хто тут скрол-контейнер» теж. */
.sky-table__body--virtual {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.sky-table__virtual-sizer {
  position: relative;
  width: 100%;
  flex-shrink: 0;
}

/* Висоту свідомо не задаємо: у dynamic-режимі рядок має міряти себе сам. */
.sky-table__virtual-row {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}
</style>
