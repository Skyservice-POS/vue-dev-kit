<template>
  <div class="header-table-outer">
    <div
      ref="headerTable"
      class="header-table"
      :class="{ forceUpdated1: forceUpdating }"
      @mousemove="onMouseMove"
      @mouseleave="onMouseLeaveHeader"
      @mouseup="onMouseUpHeader"
    >
      <div v-if="params.massActions != null" class="ht ht-checkbox" style="flex: 0 0 40px">
        <SkyCheckbox v-model="check" @update:modelValue="toggleAll" />
      </div>
      <div
        class="header-table__content"
        :style="{ flex: params.massActions != null ? '0 0 calc(100% - 40px)' : '0 0 100%' }"
      >
        <template v-for="(item, i) in params.header" :key="i">
          <template
            v-if="
              (tableViewExpanded && selectedColumns[item.name]) ||
              (selectedColumns[item.name] && (item.minWidthScreen <= widthscreen || item.minWidthScreen === undefined))
            "
          >
            <template v-if="item.sort == false">
              <div
                class="ht"
                :class="item.name == 'logo' && 'logo'"
                :style="{ flex: calcWidthFlex(item) }"
                style="position: relative; white-space: nowrap"
                :data-name="item.name"
                :title="item.title"
              >
                {{ item.title }}
                <div v-if="!tableViewExpanded && params.canResize" class="resizer" @mousedown="onMouseDownResize">
                  &nbsp;
                </div>
              </div>
            </template>
            <template v-else>
              <div
                :style="{ flex: calcWidthFlex(item) }"
                style="position: relative; white-space: nowrap"
                :class="[item.sort ? sortArrow[item.sort] : sortArrow[item.name], 'ht sort']"
                :data-name="item.name"
                :title="item.title"
                @click="sorting(item.sort ? item.sort : item.name)"
              >
                {{ item.title }}
                <div v-if="!tableViewExpanded && params.canResize" class="resizer" @mousedown="onMouseDownResize">
                  &nbsp;
                </div>
                <i
                  v-if="item.tooltip"
                  v-b-tooltip.hover="{ variant: 'secondary' }"
                  style="margin-left: 5px; font-size: 16px; color: #ed2626"
                  class="icomoon icon-question"
                  :title="item.tooltip"
                />
              </div>
            </template>
          </template>
        </template>
        <div
          v-if="isShowToggleExpand"
          class="button-toggle-expand button-toggle-expand-all"
          :style="{ paddingRight: scroll ? '5px' : 0 }"
        >
          <b-button variant="light" class="btn-row-open" @click="toggle()">
            <span
              v-if="params.isAllExpanded != true"
              class="fs1"
              aria-hidden="true"
              data-icon=""
              style="color: var(--info-button-primary-color)"
            />
            <img
              v-if="params.isAllExpanded == true"
              src="/svg/arrow_black.svg"
              style="width: 15px; transform: rotate(180deg)"
            />
          </b-button>
        </div>
        <div
          v-if="params?.isShowDeleteRow"
          class="button-toggle-delete"
          :style="{ paddingRight: scroll ? '5px' : 0 }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUpdated } from 'vue';
import SkyCheckbox from '../SkyCheckbox';

const props = defineProps({
  params: {
    type: Object,
    default: () => ({}),
  },
  allSelect: {
    type: Boolean,
    default: false,
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
  scroll: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'checkbox',
  'sort',
  'changeWidthColumn',
  'changeTableSettingToDefault',
  'switchView',
  'changeHeaderWidth',
]);

const headerTable = ref(null);
const sortflag = ref({
  ot: 'asc',
  of: 'id',
});
const startOffset = ref(null);
const currentResizableEl = ref(null);
const currentResizableElColumnName = ref(null);
const mouseMoveEventActive = ref(true);
const mouseMoveLastX = ref(null);

const sortArrow = computed(() => {
  const g = {};
  const icon = sortflag.value.ot === 'asc' ? 'icon-arrow-down-2' : 'icon-arrow-up-2';
  g[sortflag.value.of] = icon;
  return g;
});

const check = computed({
  get: () => props.allSelect,
  set: () => {},
});

const widthscreen = computed(() => window.innerWidth);

function toggleAll(e) {
  emit('checkbox', e);
}

function toggle() {
  emit('switchView');
}

function sorting(e) {
  if (currentResizableEl.value) return;

  if (sortflag.value.of === e) {
    sortflag.value.ot = sortflag.value.ot === 'asc' ? 'desc' : 'asc';
  }
  sortflag.value.of = e;
  emit('sort', {
    ot: sortflag.value.ot,
    of: sortflag.value.of,
  });
}

function calcWidthFlex(head) {
  if (props.tableViewExpanded || props.widthColumns[widthscreen.value] === undefined) {
    if (head.width) {
      return `0 0 ${head.width}px`;
    } else if (head.widthFr) {
      return head.widthFr;
    } else if (head.name !== 'logo') {
      return '1';
    } else {
      return '';
    }
  }
  const width = props.widthColumns[widthscreen.value][head.name];
  if (width === undefined) {
    if (head.width) {
      return `0 0 ${head.width}px`;
    } else if (head.widthIfResizedNotCalculated) {
      return `0 0 ${head.widthIfResizedNotCalculated}px`;
    } else {
      return '0 0 120px';
    }
  }
  if (width.endsWith('px')) {
    return `0 0 ${width}`;
  } else if (width.endsWith('fr')) {
    return parseInt(width).toString();
  } else {
    return '1';
  }
}

function onMouseDownResize(e) {
  if (e.which !== 1) return;
  currentResizableEl.value = e.target.parentElement;
  startOffset.value = currentResizableEl.value.offsetWidth - e.x;
  currentResizableElColumnName.value = currentResizableEl.value.dataset['name'];
}

function onMouseMove(e) {
  if (currentResizableEl.value) {
    mouseMoveLastX.value = e.x;
    if (!mouseMoveEventActive.value) return;
    mouseMoveEventActive.value = false;
    const mouseMoveDelay = 100;

    let widthPx = startOffset.value + e.x;
    if (props.widthColumns[widthscreen.value] === undefined) {
      emit('changeWidthColumn', currentResizableElColumnName.value, widthPx, calcWidthPxAll());
    } else {
      emit('changeWidthColumn', currentResizableElColumnName.value, widthPx);
    }
    setTimeout(() => {
      if (mouseMoveLastX.value != null && mouseMoveLastX.value !== e.x) {
        widthPx = startOffset.value + mouseMoveLastX.value;
        if (props.widthColumns[widthscreen.value] === undefined) {
          emit('changeWidthColumn', currentResizableElColumnName.value, widthPx, calcWidthPxAll());
        } else {
          emit('changeWidthColumn', currentResizableElColumnName.value, widthPx);
        }
      }
      mouseMoveEventActive.value = true;
    }, mouseMoveDelay);
  }
}

function onMouseUpHeader(e) {
  if (e.which !== 1) return;
  if (currentResizableEl.value) {
    setTimeout(() => {
      emit('changeHeaderWidth', headerTable.value?.scrollWidth || 0);
      currentResizableEl.value = null;
      currentResizableElColumnName.value = null;
    }, 0);
  }
}

function onMouseLeaveHeader() {
  if (currentResizableEl.value) {
    setTimeout(() => {
      currentResizableEl.value = null;
      currentResizableElColumnName.value = null;
      emit('changeHeaderWidth', headerTable.value?.scrollWidth || 0);
    }, 0);
  }
}

function calcWidthPxAll() {
  const result = [];
  const resizerElements = headerTable.value?.querySelectorAll('.resizer') || [];
  for (const resizer of resizerElements) {
    const curColEl = resizer.parentElement;
    result.push({
      columnName: curColEl.dataset['name'],
      width: curColEl.offsetWidth,
    });
  }
  return result;
}

onMounted(() => {
  try {
    sortflag.value.ot = props.params.sort?.ot || 'asc';
    sortflag.value.of = props.params.sort?.of || 'id';
  } catch {}
  if (headerTable.value && currentResizableEl.value === null) {
    emit('changeHeaderWidth', headerTable.value.scrollWidth);
  }
});

onUpdated(() => {
  if (headerTable.value && currentResizableEl.value === null) {
    emit('changeHeaderWidth', headerTable.value.scrollWidth);
  }
});
</script>

<style>
.dynamic-scroller-table .header-table {
  font-weight: 500;
  cursor: default;
  line-height: 35px;
  position: relative;
  top: 0;
  margin-bottom: -1px;
  border-top: 1px solid #dee2e6;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  height: 40px;
  width: 100%;
}

.dynamic-scroller-table .header-table-outer {
  font-weight: 400;
  cursor: default;
  display: flex;
  min-height: 40px;
}

.dynamic-scroller-table .header-table__content {
  display: flex;
  flex: 0 0 calc(100% - 40px);
}

.dynamic-scroller-table .header-table .resizer {
  top: 3px;
  right: 0;
  bottom: 3px;
  width: 5px;
  position: absolute;
  cursor: col-resize;
}

.ht.logo {
  width: 67px;
  padding-right: 0 !important;
  flex: none !important;
}

.ht input {
  position: absolute;
  margin: 6px;
}

@media (hover: hover) and (pointer: fine) {
  .dynamic-scroller-table .header-table:hover .resizer {
    border-left: 1px solid #dee2e6;
  }
}

.dynamic-scroller-table .header-table .ht {
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0.375rem 1.2rem 0.375rem 0.5rem;
  padding-left: 8px;
  align-self: center;
  z-index: 0;
  color: #106090;
}

/* checkbox cell: center the SkyCheckbox, no text ellipsis/padding (the "..." fix) */
.dynamic-scroller-table .header-table .ht.ht-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  text-overflow: clip;
}

.dynamic-scroller-table .header-table .sort {
  cursor: pointer;
  color: #106090;
}

.dynamic-scroller-table .header-table-outer .btn-select-columns,
.dynamic-scroller-table .header-table-outer .btn-switch-view {
  position: fixed;
  right: 5px;
  color: #106090;
  margin-top: -40px;
  height: 30px;
  background: white;
  border: none;
  font-size: 14pt;
  text-align: center;
  padding: 0 5px;
}

@media only screen and (min-width: 1001px) {
  .dynamic-scroller-table .header-table-outer .btn-switch-view {
    right: 40px;
  }
}

.dynamic-scroller-table .header-table-outer .btn-select-columns.selected,
.dynamic-scroller-table .header-table-outer .btn-select-columns:hover,
.dynamic-scroller-table .header-table-outer .btn-switch-view:hover {
  color: #000;
  background: #def9ff;
  border-radius: 5px;
}

.dynamic-scroller-table .header-table-outer .selectColumns .custom-control-label {
  width: 100%;
}

.dynamic-scroller-table .header-table-outer .selectColumns {
  position: absolute;
  top: 0;
  right: 0;
  padding: 10px 15px;
  border-radius: 5px;
  background: white;
  box-shadow: 0 5px 8px rgba(0, 0, 0, 0.3);
  line-height: 1.5;
}

.dynamic-scroller-table .header-table-outer .selectColumns:before,
.dynamic-scroller-table .header-table-outer .btn-switch-view:before,
.dynamic-scroller-table .header-table-outer .btn-select-columns:before {
  display: flex;
}

.dynamic-scroller-table .header-table-outer .selectColumns .dialog-buttons {
  font-size: 1rem;
}

.dynamic-scroller-table .header-table-outer .dis .custom-control-input:checked ~ .custom-control-label::before {
  border-color: #adb5bd !important;
  background-color: #adb5bd !important;
}

.dynamic-scroller-table .header-table-outer .custom-control-input[disabled] ~ .custom-control-label,
.custom-control-input:disabled ~ .custom-control-label {
  color: #6c757d;
}

.dynamic-scroller-table .header-table-outer .dis .custom-control-label::before {
  border-color: #adb5bd !important;
  background-color: #adb5bd !important;
}

.dynamic-scroller-table .button-toggle-expand,
.dynamic-scroller-table .button-toggle-delete {
  flex: 0 0 42px;
  display: flex;
  justify-content: center;
}
</style>
