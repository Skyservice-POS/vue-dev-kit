<script setup lang="ts">
import { computed, provide, ref, onMounted, onBeforeUnmount } from 'vue';
import { SKY_TABLE_CONTEXT, type SkyTableColumn } from './types';

const props = withDefaults(
  defineProps<{
    /** Колонки таблиці — визначають розкладку для шапки, рядків і футера. */
    columns: SkyTableColumn[];
    /** Мінімальна ширина таблиці. `max-content` не дає колонкам злипнутись. */
    minWidth?: string;
  }>(),
  { minWidth: 'max-content' },
);

// Колонки з minWidthScreen ховаються на вузьких екранах. Слухаємо resize, а не
// читаємо innerWidth у computed — інакше значення застигає на першому рендері.
const viewport = ref(typeof window === 'undefined' ? Infinity : window.innerWidth);
const onResize = () => (viewport.value = window.innerWidth);
onMounted(() => window.addEventListener('resize', onResize));
onBeforeUnmount(() => window.removeEventListener('resize', onResize));

const columns = computed(() =>
  props.columns.filter(
    (c) => !c.minWidthScreen || viewport.value >= c.minWidthScreen,
  ),
);

const gridTemplate = computed(() =>
  columns.value
    .map((c) => (c.width ? `${c.width}px` : `${c.widthFr ?? 1}fr`))
    .join(' '),
);

provide(SKY_TABLE_CONTEXT, { columns, gridTemplate });

defineExpose({ visibleColumns: columns });
</script>

<template>
  <div class="sky-table" role="table">
    <div class="sky-table__viewport" :style="{ minWidth }">
      <slot :columns="columns" />
    </div>
  </div>
</template>

<style scoped>
.sky-table {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: auto;
  background: var(--sky-table-bg, #fff);
  font-size: var(--sky-table-font-size, 14px);
  color: var(--sky-table-color, #212529);
}

.sky-table__viewport {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
</style>
