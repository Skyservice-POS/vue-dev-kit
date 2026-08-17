<template>
  <div class="table-container dynamic-scroller-table">
    <div class="dynamic-scroller-table__right">
      <div class="dynamic-scroller-table__content listContainer">
        <!-- Масові дії -->
        <div
          v-if="
            selected.length > 0 &&
            params.massActions != null &&
            !params.massActions.hasOwnProperty('none')
          "
          class="dynamic-scroller-table__mass-action"
        >
          <div class="dynamic-scroller-table__mass-count">
            {{ selected.length }}
          </div>
          <select
            v-model="mass"
            name="dynamic-scroller-table__mass-select"
            class="dynamic-scroller-table__mass-select custom-select"
            style="width: calc(100% - 60px)"
            @change="actionMass($event)"
          >
            <option value="empty">{{ lang["dejstvie"] || "Дія" }}</option>
            <template v-for="(item, i) in params.massActions" :key="i">
              <option v-if="item" :value="item.value">{{ item.title }}</option>
            </template>
          </select>
        </div>

        <!-- Таблиця -->
        <div v-if="total" class="dynamic-scroller-table__table">
          <!-- max-content замість суми оголошених ширин: браузер міряє реально
               відрендерені колонки, тож шапка й тіло не розʼїжджаються, коли
               клітинка ширша за свою оголошену частку. Явний minTableWidth
               лишається як override. -->
          <div
            class="dynamic-scroller-table__table-wrapper"
            :style="{
              'min-width': params.minTableWidth
                ? params.minTableWidth + 'px'
                : 'max-content',
            }"
          >
            <header-table
              v-if="total != 0"
              class="dynamic-scroller-table__header"
              :params="params"
              :all-select="allSelect"
              :selected-columns="selectedColumns"
              :width-columns="widthColumns"
              :table-view-expanded="tableViewExpanded"
              :force-updating="forceUpdating"
              :scroll="scrollBar"
              :is-show-toggle-expand="visibleToggleExpand"
              @checkbox="toggleAll"
              @sort="sortData"
              @changeWidthColumn="changeWidthColumn"
              @changeTableSettingToDefault="changeTableSettingToDefault"
              @switchView="switchView"
              @changeHeaderWidth="changeHeaderWidth"
            />

            <div v-if="total != 0" class="dynamic-scroller-table__body">
              <dynamic-scroller
                v-if="json.items != null"
                :items="jsonData"
                :params="params"
                :selected="selected"
                :selected-columns="selectedColumns"
                :width-columns="widthColumns"
                :table-view-expanded="tableViewExpanded"
                :force-updating="forceUpdating"
                :is-show-toggle-expand="visibleToggleExpand"
                @checkbox="checked"
                @getData="emit('getData', getParameters())"
                @selectUpdate="(...args) => emit('selectUpdate', ...args)"
                @open="(...args) => emit('open', ...args)"
                @openContext="(...args) => emit('openContext', ...args)"
                @inputEdit="(...args) => emit('inputEdit', ...args)"
                @openTagsModal="(...args) => emit('openTagsModal', ...args)"
                @deleteTag="(...args) => emit('deleteTag', ...args)"
                @deleteRow="(...args) => emit('deleteRow', ...args)"
              >
                <template v-for="(_, name) in $slots" #[name]="slotData">
                  <slot :name="name" v-bind="slotData ?? {}" />
                </template>
              </dynamic-scroller>
            </div>

            <footer-table
              v-if="total != 0 && params.footer"
              class="dynamic-scroller-table__footer"
              :params="params"
              :all-select="allSelect"
              :selected-columns="selectedColumns"
              :width-columns="widthColumns"
              :table-view-expanded="tableViewExpanded"
              :force-updating="forceUpdating"
              :scroll="scrollBar"
              :is-show-toggle-expand="visibleToggleExpand"
              @checkbox="toggleAll"
              @sort="sortData"
              @changeWidthColumn="changeWidthColumn"
              @changeTableSettingToDefault="changeTableSettingToDefault"
              @switchView="switchView"
              @changeHeaderWidth="changeHeaderWidth"
            />

            <div v-else class="dynamic-scroller-table__footer-found">
              <span class="dynamic-scroller-table__footer-content">
                {{ `${lang["najdeno"] || "Знайдено"} ${!total ? "-" : total}` }}
              </span>
            </div>
          </div>
        </div>

        <!-- Немає даних -->
        <div v-if="json && total == 0">
          <center class="no-data">
            <img
              class="no-data-img"
              src="/image/dragons/Dragon_5_400.png"
              width="200"
            />
            <h5 class="no-data-text" style="color: gray">
              {{ lang["NoDataSadDino"] || "Даних немає" }}
            </h5>
          </center>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";

import dynamicScroller from "./DynamicScroller.vue";
import headerTable from "./Header.vue";
import footerTable from "./Footer.vue";

const props = defineProps({
  params: {
    type: Object,
    default: () => ({}),
  },
  json: {
    type: Object,
    default: () => ({}),
  },
  mainJsonData: {
    type: Array,
    default: () => [],
  },
  justDeleted: {
    type: String,
    default: "",
  },
});

const emit = defineEmits([
  "getData",
  "updateSelected",
  "updateMassactionData",
  "open",
  "openContext",
  "inputEdit",
  "selectUpdate",
  "openTagsModal",
  "deleteTag",
  "deleteRow",
]);

// Reactive state
const scrollH = ref(0);
const clientH = ref(0);
const shift = ref(false);
const tableViewExpanded = ref(false);
const forceUpdating = ref(false);
const selectedColumns = ref({});
const widthColumns = ref({});
const mass = ref("empty");
const sort = ref({ of: "", ot: "" });
const lastCheckbox = ref(0);

// Computed properties
const selected = computed({
  get: () => props.params.selected || [],
  set: (val) => {
    props.params.selected = val;
  },
});

const allSelect = computed({
  get: () => props.params.allSelect || false,
  set: (val) => {
    props.params.allSelect = val;
  },
});

const total = computed(() => {
  try {
    return props.json?.total || 0;
  } catch {
    return 0;
  }
});

const lang = computed(() => window.lang || {});

const scrollBar = computed(() => scrollH.value > clientH.value);

const jsonData = computed(() => props.mainJsonData);

const visibleToggleExpand = computed(() => {
  return props.json?.items?.some((item) => item.products?.length >= 1) || false;
});

// Watchers
// Тримаємо header[].enable у синхроні з видимістю колонок. Ширину таблиці тут
// більше не рахуємо: сума оголошених `width` / `widthFr * 100` була лише
// оцінкою і розходилася з реальним рендером — тепер обгортка бере max-content.
watch(
  selectedColumns,
  (_value) => {
    props.params.header?.forEach((item) => {
      item.enable = selectedColumns.value[item.name];
    });
  },
  { deep: true },
);

watch(
  () => props.justDeleted,
  (value) => {
    if (value !== "") {
      selected.value = selected.value.filter(
        (element) => element[props.params.id] != value,
      );
    }
  },
);

// Methods
function toggleAll() {
  const selectableItems = jsonData.value.filter(
    (item) => !(Number(item.parent) > 0),
  );
  const allSelected =
    selected.value.length >= selectableItems.length &&
    selectableItems.length > 0;

  if (allSelected) {
    // All selected → clear all
    props.params.selected = [];
    props.params.allSelect = false;
  } else {
    // Not all selected → select all
    props.params.selected = [];
    jsonData.value.forEach((item) => {
      if (!(Number(item.parent) > 0)) {
        props.params.selected.push(item);
      }
    });
    props.params.allSelect = true;
  }
  emit("updateSelected", JSON.parse(JSON.stringify(props.params.selected)));
}

function checked(i, flag, item) {
  const arr = selected.value.map((item) => item[props.params.id]);
  const index = arr.indexOf(item[props.params.id]);

  if ((flag === true && index === -1) || (flag === false && index !== -1)) {
    if (shift.value) {
      shiftFunc(i, flag);
    } else {
      if (flag === false && index !== -1) {
        selected.value.splice(index, 1);
      } else if (flag === true && index === -1) {
        selected.value.push(item);
      }
    }
    lastCheckbox.value = i;
    const selectableCount = jsonData.value.filter(
      (item) => !(Number(item.parent) > 0),
    ).length;
    allSelect.value = selected.value.length >= selectableCount;
  }
  emit("updateSelected", JSON.parse(JSON.stringify(selected.value)));
}

function shiftFunc(item, flag) {
  const increment =
    item > lastCheckbox.value ? 1 : item < lastCheckbox.value ? -1 : null;
  if (increment != null) {
    let i = lastCheckbox.value;
    const data = props.json.items;
    const id = props.params.sort.of;
    while (true) {
      if (flag === false) {
        const uncheck = selected.value.indexOf(data[i][id]);
        if (uncheck !== -1) {
          selected.value.splice(uncheck, 1);
        }
      } else if (selected.value.indexOf(data[i][id]) === -1) {
        selected.value.push(data[i]);
      }
      if (i === item) {
        break;
      }
      i += increment;
    }
  }
  selected.value = selected.value.filter(
    (value, index, arr) =>
      index ===
      arr.findIndex((t) => t[props.params.id] === value[props.params.id]),
  );
}

function getParameters() {
  return {
    ot: sort.value.ot,
    of: sort.value.of,
  };
}

function actionMass(event) {
  const massactiondata = {
    action: event.target.value,
    items: selected.value.filter(
      (value, index, arr) =>
        index ===
        arr.findIndex((t) => t[props.params.id] === value[props.params.id]),
    ),
  };
  emit("updateMassactionData", massactiondata);
  mass.value = "empty";
}

function changeWidthColumn(columnName, newWidth, allColumnsWidth = []) {
  const screenWidth = window.innerWidth;
  if (!widthColumns.value[screenWidth]) {
    widthColumns.value[screenWidth] = {};
    for (const col of allColumnsWidth) {
      widthColumns.value[screenWidth][col.columnName] = col.width + "px";
    }
  }
  widthColumns.value[screenWidth][columnName] = newWidth + "px";
  forceUpdating.value = !forceUpdating.value;
}

function changeTableSettingToDefault() {
  const tempSelectedColumns = {};
  for (const element in props.params.header) {
    const elem = props.params.header[element];
    const colName = elem.name;
    tempSelectedColumns[colName] = elem.enableDefault;
  }
  selectedColumns.value = tempSelectedColumns;
  widthColumns.value = {};
  changeHeaderWidth(0);
}

function switchView(isExpanded = !tableViewExpanded.value) {
  tableViewExpanded.value = isExpanded;
  if (!isExpanded) {
    changeHeaderWidth(0);
  }
}

function changeHeaderWidth(_newWidth) {
  // Header width change logic
}

function sortData(e) {
  sort.value.ot = e.ot;
  sort.value.of = e.of;
  emit("getData", getParameters());
}

// Lifecycle
onMounted(() => {
  if (props.params.sort) {
    sort.value.of = props.params.sort.of;
    sort.value.ot = props.params.sort.ot;
  }

  // Initialize selected columns
  for (const element in props.params.header) {
    const elem = props.params.header[element];
    const colName = elem.name;
    if (selectedColumns.value[colName] == null) {
      selectedColumns.value[colName] = elem.enable;
    }
  }
});

// Keyboard events for shift selection
if (typeof window !== "undefined") {
  window.addEventListener("keydown", (e) => {
    if (e.key === "Shift") shift.value = true;
  });
  window.addEventListener("keyup", (e) => {
    if (e.key === "Shift") shift.value = false;
  });
}
</script>

<style scoped>
.no-data-img {
  margin-bottom: 10px;
}

.dynamic-scroller-table {
  display: flex;
  height: 100%;
}

.dynamic-scroller-table__right {
  height: 100%;
  flex: 1;
  overflow: hidden;
}

.dynamic-scroller-table__content {
  position: relative;
  display: flex;
  gap: 10px;
  flex-direction: column;
  align-items: stretch;
  height: 100%;
  width: 100%;
}

.dynamic-scroller-table__mass-action {
  display: flex;
  justify-content: space-between;
  gap: 5px;
  padding: 0px 10px 10px;
}

.dynamic-scroller-table__mass-count {
  border: 1px solid rgb(173, 181, 189);
  max-width: 55px;
  min-width: 55px;
  background: rgb(222, 226, 230);
  border-radius: 0.25rem;
  align-items: center;
  display: flex;
  justify-content: center;
}

.dynamic-scroller-table__mass-select {
  flex: 1;
}

.dynamic-scroller-table__mass-select:focus {
  border-color: #ced4da !important;
  box-shadow: none !important;
  outline: none !important;
}

.dynamic-scroller-table__table {
  font-size: 12px;
  max-width: 100%;
  overflow-x: auto;
  height: 100%;
  min-height: 0;
}

.dynamic-scroller-table__table-wrapper {
  height: 100%;
  min-height: 0;
  display: flex;
  position: relative;
  flex-direction: column;
}

.dynamic-scroller-table__header {
  font-weight: 400;
  cursor: default;
  display: flex;
  min-height: 40px;
}

.dynamic-scroller-table__footer {
  font-weight: 400;
  cursor: default;
  display: flex;
  min-height: 34px;
}

.dynamic-scroller-table__body {
  flex: 1;
  min-height: 0;
  position: relative;
  overflow: hidden;
}

.dynamic-scroller-table__footer-found {
  font-weight: bold;
  cursor: default;
  flex: auto 0 0;
  line-height: 30px;
  bottom: 0;
  margin-top: -1px;
  border-top: 1px solid #dee2e6;
  border-bottom: 1px solid #dee2e6;
}

.dynamic-scroller-table__footer-content {
  padding-left: 10px;
  flex-grow: 1;
  position: sticky;
  left: 0;
}

.dynamic-scroller-table .item {
  overflow-x: hidden;
  word-wrap: break-word;
}

.dynamic-scroller-table .hidden-item {
  visibility: hidden;
}
</style>

<style>
/* VUE SCROLL */
.dynamic-scroller-table .vue-recycle-scroller {
  position: relative;
}

.dynamic-scroller-table
  .vue-recycle-scroller.direction-vertical:not(.page-mode) {
  overflow-y: auto;
}

.dynamic-scroller-table
  .vue-recycle-scroller.direction-horizontal:not(.page-mode) {
  overflow-x: auto;
}

.dynamic-scroller-table .vue-recycle-scroller.direction-horizontal {
  display: flex;
}

.vue-recycle-scroller__slot {
  flex: auto 0 0;
}

.vue-recycle-scroller__item-wrapper {
  flex: 1;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
}

.dynamic-scroller-table
  .vue-recycle-scroller.ready
  .vue-recycle-scroller__item-view {
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform;
}

.dynamic-scroller-table
  .vue-recycle-scroller.direction-vertical
  .vue-recycle-scroller__item-wrapper {
  width: 100%;
}

.dynamic-scroller-table
  .vue-recycle-scroller.direction-horizontal
  .vue-recycle-scroller__item-wrapper {
  height: 100%;
}

.dynamic-scroller-table
  .vue-recycle-scroller.ready.direction-vertical
  .vue-recycle-scroller__item-view {
  width: 100%;
}

.dynamic-scroller-table
  .vue-recycle-scroller.ready.direction-horizontal
  .vue-recycle-scroller__item-view {
  height: 100%;
}

.dynamic-scroller-table .resize-observer {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  pointer-events: none;
  display: block;
  overflow: hidden;
  opacity: 0;
}

/* Checkbox size */
.dynamic-scroller-table .form-check-input {
  width: 20px;
  height: 20px;
  cursor: pointer;
  margin: 4px;
}

.dynamic-scroller-table__mass-select.custom-select {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 4px 8px;
}
</style>
