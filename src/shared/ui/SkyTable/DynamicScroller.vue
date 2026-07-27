<template>
  <DynamicScroller
    :items="indexedItems"
    :min-item-size="30"
    class="scroller"
    :key-field="keyField"
  >
    <template v-slot="{ item, index, active }">
      <DynamicScrollerItem :item="item" :active="active" :data-index="index">
        <rowTable
          :index="index"
          :item="item"
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
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
</template>

<script setup>
import { computed } from "vue";
import { DynamicScroller, DynamicScrollerItem } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
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

const keyField = computed(() => {
  if (props.items.length > 0 && props.items[0][idField.value] != null) {
    return idField.value;
  }
  return "_dsIndex";
});

const indexedItems = computed(() =>
  props.items.map((item, i) => {
    item._dsIndex = i;
    item.index = i;
    return item;
  }),
);

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
</style>
