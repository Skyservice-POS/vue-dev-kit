<template>
  <div ref="scrollEl" class="scroller">
    <!-- Розпірка тримає повну висоту списку, щоб скролбар відповідав усім рядкам. -->
    <div class="scroller__sizer" :style="{ height: `${totalSize}px` }">
      <div
        v-for="virtualRow in virtualRows"
        :key="virtualRow.key"
        :ref="measureRow"
        :data-index="virtualRow.index"
        class="scroller__row"
        :style="{ transform: `translateY(${virtualRow.start}px)` }"
      >
        <rowTable
          :index="virtualRow.index"
          :item="indexedItems[virtualRow.index]"
          :params="params"
          :selected="selected"
          :selected-columns="selectedColumns"
          :width-columns="widthColumns"
          :table-view-expanded="tableViewExpanded"
          :force-updating="forceUpdating"
          :is-show-toggle-expand="isShowToggleExpand"
          @checkbox="(i, flag, item) => emit('checkbox', i, flag, item)"
          @getData="emit('getData')"
          @open="(...args) => emit('open', ...args)"
          @openContext="(...args) => emit('openContext', ...args)"
          @inputEdit="(...args) => emit('inputEdit', ...args)"
          @selectUpdate="(...args) => emit('selectUpdate', ...args)"
          @openTagsModal="(...args) => emit('openTagsModal', ...args)"
          @deleteTag="(...args) => emit('deleteTag', ...args)"
          @deleteRow="(...args) => emit('deleteRow', ...args)"
        >
          <template v-for="(_, name) in $slots" #[name]="slotData">
            <slot :name="name" v-bind="slotData ?? {}" />
          </template>
        </rowTable>
      </div>
    </div>
  </div>
</template>

<script setup>
// Віртуалізація на headless `@tanstack/vue-virtual`. Раніше тут був
// DynamicScroller з vue-virtual-scroller; публічний контракт компонента
// (props, emits, слоти) не змінився — помінявся лише рушій під ним.
import { computed, ref } from "vue";
import { useVirtualizer } from "@tanstack/vue-virtual";
import rowTable from "./Row.vue";

const props = defineProps({
  params: {
    type: Object,
    default: () => ({}),
  },
  items: {
    type: Array,
    default: () => [],
  },
  selected: {
    type: Array,
    default: () => [],
  },
  selectedColumns: {
    type: Object,
    default: () => ({}),
  },
  widthColumns: {
    type: Object,
    default: () => ({}),
  },
  tableViewExpanded: {
    type: Boolean,
    default: false,
  },
  forceUpdating: {
    type: Boolean,
    default: false,
  },
  isShowToggleExpand: {
    type: Boolean,
    default: false,
  },
});

const idField = computed(() => props.params?.id || "id");

const indexedItems = computed(() =>
  props.items.map((item, i) => {
    item._dsIndex = i;
    item.index = i;
    return item;
  }),
);

const scrollEl = ref(null);

const virtualizer = useVirtualizer(
  computed(() => ({
    count: indexedItems.value.length,
    getScrollElement: () => scrollEl.value,
    // Рядки різновисокі (розкриті деталі, теги), тож 30px — лише перша оцінка:
    // реальну висоту доміряє measureElement.
    estimateSize: () => 30,
    overscan: 6,
    getItemKey: (index) => {
      const item = indexedItems.value[index];
      return item?.[idField.value] ?? index;
    },
  })),
);

const virtualRows = computed(() => virtualizer.value.getVirtualItems());
const totalSize = computed(() => virtualizer.value.getTotalSize());

// measureElement читає індекс з `data-index`, тому атрибут обовʼязковий.
function measureRow(el) {
  if (el) virtualizer.value.measureElement(el);
}

const emit = defineEmits([
  "checkbox",
  "getData",
  "open",
  "openContext",
  "inputEdit",
  "selectUpdate",
  "openTagsModal",
  "deleteTag",
  "deleteRow",
]);
</script>

<style scoped>
.scroller {
  height: 100%;
  overflow: auto;
}

.scroller__sizer {
  position: relative;
  width: 100%;
}

/* Висоту не задаємо: рядок міряє себе сам через ResizeObserver. */
.scroller__row {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}
</style>
