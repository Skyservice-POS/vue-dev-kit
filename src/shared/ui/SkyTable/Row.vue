<template>
  <div
    ref="itemRow"
    :class="[
      { gray: item.isGray, forceUpdated1: forceUpdating },
      'item-string',
      `nested-item-${item.nestedLevel}`,
    ]"
    :style="{ cursor: 'pointer', opacity: item.rowOpacity ?? 1 }"
    @click="toggleCheckbox"
    @contextmenu.prevent.stop="openContext"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <div
      v-if="params.massActions != null"
      class="item item--checkbox"
      :class="{ hidden: +item.parent > 0 || item.isNotCheckable }"
    >
      <SkyCheckbox v-model="checkbox" class="item-cell" />
    </div>
    <template v-for="(head, i) in params.header" :key="i">
      <component
        :is="getItemComponent(head)"
        v-if="
          (tableViewExpanded && selectedColumns[head.name]) ||
          (selectedColumns[head.name] &&
            (head.minWidthScreen <= widthscreen ||
              head.minWidthScreen === undefined))
        "
        :item="item"
        :params="head"
        class="item"
        :width-flex="calcWidthFlex(head)"
        :name="params.name"
        @open="open"
        @createNewComing="emit(head.emit, $event)"
        @inputEdit="inputEdit(head, $event)"
        @selectUpdate="selectUpdate(head, $event)"
        @openTagsModal="openTagsModal(head, $event)"
        @deleteTag="deleteTag(head, $event)"
      >
        <template v-if="$slots['cell-' + head.name]" #default="slotProps">
          <slot
            :name="'cell-' + head.name"
            :row="item"
            :value="item[head.name]"
            :item="item"
            v-bind="slotProps"
          />
        </template>
      </component>
    </template>
    <div v-if="isShowToggleExpand" class="button-toggle-expand">
      <b-button
        v-if="item.products?.length >= 1"
        variant="light"
        class="btn-row-open"
        @click="toggle()"
      >
        <span
          v-if="item.isExpanded != true"
          class="fs1"
          aria-hidden="true"
          data-icon=""
          style="color: var(--info-button-primary-color)"
        />
        <img
          v-if="item.isExpanded == true"
          src="/svg/arrow_black.svg"
          style="width: 15px; transform: rotate(180deg)"
        />
      </b-button>
    </div>
    <div v-if="params?.isShowDeleteRow" class="button-delete">
      <button
        type="button"
        class="btn btn-danger"
        @click="emit('deleteRow', item)"
      >
        ×
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

import itemDefault from "./items/itemDefault.vue";
import itemSelect from "./items/itemSelect.vue";
import itemInput from "./items/itemInput.vue";
import itemTags from "./items/itemTags.vue";
import itemTagEditor from "./items/itemTagEditor.vue";
import SkyCheckbox from "../SkyCheckbox";

const props = defineProps({
  index: {
    type: Number,
    default: null,
  },
  params: {
    type: Object,
    default: () => ({}),
  },
  item: {
    type: Object,
    default: () => ({}),
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

const emit = defineEmits([
  "checkbox",
  "open",
  "openContext",
  "inputEdit",
  "selectUpdate",
  "openTagsModal",
  "deleteTag",
  "deleteRow",
  "shrink",
  "expand",
]);

const touchTimeout = ref(null);

const components = {
  itemDefault,
  itemSelect,
  itemInput,
  itemTags,
  itemTagEditor,
};

function getItemComponent(head) {
  if (head.customItemComponent && components[head.customItemComponent]) {
    return components[head.customItemComponent];
  }
  return itemDefault;
}

const checkbox = computed({
  get() {
    let val = false;
    if (isModification(props.item)) return val;
    try {
      if (props.params.id) {
        const arr = props.selected.map((item) => item[props.params.id]);
        const checked = arr.indexOf(props.item[props.params.id]);
        if (checked !== -1) {
          val = true;
        }
      }
    } catch {}
    return val;
  },
  set(val) {
    if (isModification(props.item)) return;
    emit("checkbox", props.index, val, props.item);
  },
});

const widthscreen = computed(() => window.innerWidth);

const _isChild = computed(() => Number(props.item.parent) > 0);

function inputEdit(head, lastValue) {
  const columnName = head.name;
  let value = props.item[head.name];
  if (props.params.id) {
    emit(
      "inputEdit",
      {
        [props.params.id]: props.item[props.params.id],
        tPointItemId: props.item.tPointItemId,
        [columnName]: value,
      },
      columnName,
      {
        error: () => {
          value = lastValue;
        },
        updateField: (nameOpt, valueOpt) => {
          props.item[nameOpt] = valueOpt;
        },
      },
      props.item,
    );
  }
}

function selectUpdate(head, _lastValue) {
  const columnName = head.name;
  if (props.params.id) {
    emit("selectUpdate", columnName, props.item);
  }
}

function openTagsModal(_head, _lastValue) {
  emit("openTagsModal", props.item);
}

function deleteTag(head, tag) {
  emit("deleteTag", props.item, tag);
}

function toggleCheckbox(e) {
  // Ігноруємо кліки на інтерактивних елементах
  if (
    e.target.closest(
      "input, select, button, a, .item-cell, .tags-container, .custom-input",
    )
  )
    return;
  if (isModification(props.item) || props.item.isNotCheckable) return;
  if (!props.params.massActions) return;
  checkbox.value = !checkbox.value;
}

function open() {
  const isModificationFlag = isModification(props.item);

  if (props.item.products !== undefined) {
    return toggle();
  }

  emit("open", props.item, isModificationFlag);
}

function openContext(e) {
  let x, y;

  if (e.clientX && e.clientY) {
    x = e.clientX;
    y = e.clientY;
  }

  if (e?.touches?.[0]?.clientX && e?.touches?.[0]?.clientY) {
    x = e.touches[0].clientX;
    y = e.touches[0].clientY;
  }

  emit("openContext", props.item, { x, y });
}

function calcWidthFlex(head) {
  if (
    props.tableViewExpanded ||
    props.widthColumns[widthscreen.value] === undefined
  ) {
    if (head.width) {
      return `0 0 ${head.width}px`;
    } else if (head.widthFr) {
      return `${head.widthFr}`;
    } else {
      return "1";
    }
  }
  const width = props.widthColumns[widthscreen.value][head.name];
  if (width === undefined) {
    if (head.width) {
      return `0 0 ${head.width}px`;
    } else if (head.widthIfResizedNotCalculated) {
      return `0 0 ${head.widthIfResizedNotCalculated}px`;
    } else {
      return "0 0 120px";
    }
  }
  if (width.endsWith("px")) {
    return `0 0 ${width}`;
  } else if (width.endsWith("fr")) {
    return parseInt(width).toString();
  } else {
    return "1";
  }
}

function toggle() {
  if (props.params.id) {
    if (props.item.isExpanded) {
      emit("shrink", {
        id: props.item[props.params.id],
        plusSum: props.item.plusSum,
      });
    } else {
      emit("expand", {
        id: props.item[props.params.id],
        plusSum: props.item.plusSum,
      });
    }
  }
}

function isModification(item) {
  return item.parent > 0;
}

function handleTouchStart(e) {
  touchTimeout.value = setTimeout(() => {
    openContext(e);
  }, 500);
}

function handleTouchEnd() {
  clearTimeout(touchTimeout.value);
}
</script>

<style scoped>
.item-string {
  width: 100%;
  min-height: 40px;
  max-height: 40px;
  border-top: 1px solid #dee2e6;
  display: flex;
}

.item-string.gray {
  background: #f2f2f2;
}

.hover .item-string {
  background: #def9ff;
}

.item {
  padding-left: 10px;
  flex: 0 0 40px;
  position: sticky;
  left: 0;
  display: flex;
}

.item--checkbox {
  padding-left: 8px;
  align-items: center;
  justify-content: center;
}

.item-cell {
  overflow-y: hidden;
}

.hidden {
  visibility: hidden;
}

.unique-color {
  background: rgba(33, 130, 214, 0.2);
}

.button-toggle-expand {
  flex: 0 0 42px;
  display: flex;
  justify-content: center;
}

.nested-item-2 {
  background: rgba(40, 167, 69, 0.7);
  color: #fff;
  opacity: 1;
  visibility: visible;
}

.nested-item-2:hover {
  background: rgba(40, 167, 69, 0.8);
}

.btn-row:hover,
.btn-row:active,
.btn-row-open {
  background-color: transparent !important;
  border-color: transparent !important;
}

.button-delete {
  border: none;
  padding: 2px;
  width: 42px;
  max-width: 42px;
}
</style>
