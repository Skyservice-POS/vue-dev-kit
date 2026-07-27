<template>
  <div class="footer-table-outer">
    <div
      ref="footerTable"
      class="footer-table"
      :class="{ forceUpdated1: forceUpdating }"
      @mousemove="onMouseMove"
      @mouseleave="onMouseLeaveFooter"
      @mouseup="onMouseUpFooter"
    >
      <div class="footer-table__content" :style="{ flex: params.massActions != null ? '0 0 calc(100%)' : '0 0 100%' }">
        <template v-for="(item, i) in params.footer" :key="i">
          <template
            v-if="
              (item.minWidthScreen <= widthscreen || item.minWidthScreen === undefined) &&
              (item.maxWidthScreen >= widthscreen || item.maxWidthScreen === undefined)
            "
          >
            <div
              class="ht"
              :class="item.name == 'logo' && 'logo'"
              :style="{ flex: calcWidthFlex(item) }"
              style="position: relative; white-space: nowrap"
              :data-name="item.name"
              :title="item.title"
            >
              <span class="ht-content" :style="item.style ? item.style(item) : ''">
                {{ item.title }}: {{ item?.value }}
              </span>
              <div v-if="!tableViewExpanded && params.canResize" class="resizer" @mousedown="onMouseDownResize">
                &nbsp;
              </div>
            </div>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUpdated } from 'vue';

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

const footerTable = ref(null);
const startOffset = ref(null);
const currentResizableEl = ref(null);
const currentResizableElColumnName = ref(null);
const mouseMoveEventActive = ref(true);
const mouseMoveLastX = ref(null);

const widthscreen = computed(() => window.innerWidth);

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

function onMouseUpFooter(e) {
  if (e.which !== 1) return;
  if (currentResizableEl.value) {
    setTimeout(() => {
      emit('changeHeaderWidth', footerTable.value?.scrollWidth || 0);
      currentResizableEl.value = null;
      currentResizableElColumnName.value = null;
    }, 0);
  }
}

function onMouseLeaveFooter() {
  if (currentResizableEl.value) {
    setTimeout(() => {
      currentResizableEl.value = null;
      currentResizableElColumnName.value = null;
      emit('changeHeaderWidth', footerTable.value?.scrollWidth || 0);
    }, 0);
  }
}

function calcWidthPxAll() {
  const result = [];
  const resizerElements = footerTable.value?.querySelectorAll('.resizer') || [];
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
  if (footerTable.value && currentResizableEl.value === null) {
    emit('changeHeaderWidth', footerTable.value.scrollWidth);
  }
});

onUpdated(() => {
  if (footerTable.value && currentResizableEl.value === null) {
    emit('changeHeaderWidth', footerTable.value.scrollWidth);
  }
});
</script>

<style>
.dynamic-scroller-table .footer-table {
  font-weight: 500;
  cursor: default;
  line-height: 35px;
  position: relative;
  top: 0;
  margin-bottom: -1px;
  border-top: 1px solid #dee2e6;
  display: flex;
  height: 32px;
  width: 100%;
}

.dynamic-scroller-table .footer-table-outer {
  font-weight: 400;
  cursor: default;
  display: flex;
  min-height: 40px;
}

.dynamic-scroller-table .footer-table__content {
  display: flex;
  flex: 0 0 calc(100% - 40px);
}

.dynamic-scroller-table .footer-table .resizer {
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

@media (hover: hover) and (pointer: fine) {
  .dynamic-scroller-table .footer-table:hover .resizer {
    border-left: 1px solid #dee2e6;
  }
}

.dynamic-scroller-table .footer-table .ht {
  overflow: hidden;
  text-overflow: ellipsis;
  padding-left: 10px;
  align-self: center;
  z-index: 0;
}

.dynamic-scroller-table .footer-table .ht-content {
  font-weight: 700;
  cursor: default;
  line-height: 30px;
}

.dynamic-scroller-table .footer-table .sort {
  cursor: pointer;
  color: #106090;
}

.dynamic-scroller-table .button-toggle-expand {
  flex: 0 0 42px;
  display: flex;
  justify-content: center;
}
</style>
