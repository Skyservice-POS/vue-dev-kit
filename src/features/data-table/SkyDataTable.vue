<script setup lang="ts" generic="TData extends Record<string, any>">
import { computed } from 'vue';
import { FlexRender, useTable } from '@tanstack/vue-table';
import type { ColumnDef, SortingState, TableFeatures } from '@tanstack/vue-table';
import SkyTableRoot from '../../shared/ui/table/SkyTableRoot.vue';
import SkyTableHeader from '../../shared/ui/table/SkyTableHeader.vue';
import SkyTableHead from '../../shared/ui/table/SkyTableHead.vue';
import SkyTableBody from '../../shared/ui/table/SkyTableBody.vue';
import SkyTableRow from '../../shared/ui/table/SkyTableRow.vue';
import SkyTableCell from '../../shared/ui/table/SkyTableCell.vue';
import SkyTableEmpty from '../../shared/ui/table/SkyTableEmpty.vue';
import SkySearchInput from '../../shared/ui/SkySearchInput/SkySearchInput.vue';
import { skyTableFeatures } from '../../shared/lib/table/tableFeatures';
import type { SkyTableColumn } from '../../shared/ui/table/types';

const props = withDefaults(
  defineProps<{
    /** Опис колонок у форматі TanStack. Ширину беремо з `size` / `meta.widthFr`. */
    columns: ColumnDef<any, TData, any>[];
    data: TData[];
    /**
     * Набір фіч. За замовчуванням — сортування, вибір, видимість колонок,
     * пагінація і фільтрація. Потрібно більше — зберіть свій через `tableFeatures()`.
     */
    features?: TableFeatures;
    /** Ключ рядка. Без нього TanStack бере індекс, і вибір «поїде» після сортування. */
    rowId?: string | ((row: TData) => string);
    /** Розмір сторінки. `0` вимикає пагінацію — рендеряться всі рядки. */
    pageSize?: number;
    /** Показати поле глобального пошуку в тулбарі. */
    searchable?: boolean;
    searchPlaceholder?: string;
    initialSorting?: SortingState;
    emptyText?: string;
    /** Курсор-вказівник і hover на рядках. */
    interactiveRows?: boolean;
  }>(),
  {
    features: undefined,
    rowId: undefined,
    pageSize: 0,
    searchable: false,
    searchPlaceholder: 'Пошук…',
    initialSorting: undefined,
    emptyText: 'Даних немає',
    interactiveRows: false,
  },
);

const emit = defineEmits<{
  'row-click': [row: TData];
}>();

const table = useTable({
  features: (props.features ?? skyTableFeatures) as typeof skyTableFeatures,
  columns: computed(() => props.columns),
  data: computed(() => props.data),
  getRowId:
    typeof props.rowId === 'function'
      ? (row: TData) => (props.rowId as (r: TData) => string)(row)
      : props.rowId
        ? (row: TData) => String(row[props.rowId as string])
        : undefined,
  initialState: {
    ...(props.initialSorting ? { sorting: props.initialSorting } : {}),
    ...(props.pageSize ? { pagination: { pageIndex: 0, pageSize: props.pageSize } } : {}),
  },
});

// Розкладку гріда беремо з визначень колонок: `size` → фіксовані px,
// `meta.widthFr` → гнучка частка. Так TanStack лишається headless, а вся
// геометрія живе в наших примітивах.
const gridColumns = computed<SkyTableColumn[]>(() =>
  table.getVisibleLeafColumns().map((column) => {
    const meta = (column.columnDef.meta ?? {}) as {
      widthFr?: number;
      align?: SkyTableColumn['align'];
      minWidthScreen?: number;
    };
    // meta.widthFr має пріоритет над size: columnSizingFeature підставляє
    // всім колонкам дефолтні 150px, тож `size` сам по собі не означає, що
    // ширину задали свідомо — а гнучку частку задають тільки навмисно.
    const size = column.columnDef.size;
    return {
      name: column.id,
      width: meta.widthFr ? undefined : typeof size === 'number' ? size : undefined,
      widthFr: meta.widthFr,
      align: meta.align,
      minWidthScreen: meta.minWidthScreen,
    };
  }),
);

const headers = computed(() => table.getHeaderGroups());
const rows = computed(() => table.getRowModel().rows);

const globalFilter = computed({
  get: () => (table.atoms.globalFilter?.get() as string) ?? '',
  set: (value: string) => table.setGlobalFilter(value),
});

const pagination = computed(() => table.atoms.pagination?.get());
const showPagination = computed(() => props.pageSize > 0 && table.getPageCount() > 1);

function alignOf(columnId: string): SkyTableColumn['align'] {
  return gridColumns.value.find((c) => c.name === columnId)?.align ?? 'left';
}

defineExpose({ table });
</script>

<template>
  <div class="sky-data-table">
    <slot name="toolbar" :table="table">
      <div v-if="searchable || $slots.actions" class="sky-data-table__toolbar">
        <div v-if="searchable" class="sky-data-table__search">
          <SkySearchInput v-model="globalFilter" :placeholder="searchPlaceholder" />
        </div>
        <slot name="actions" :table="table" />
      </div>
    </slot>

    <SkyTableRoot :columns="gridColumns" class="sky-data-table__table">
      <SkyTableHeader v-for="group in headers" :key="group.id">
        <SkyTableHead
          v-for="header in group.headers"
          :key="header.id"
          :column="{
            name: header.column.id,
            align: alignOf(header.column.id),
            sortable: header.column.getCanSort(),
          }"
          :sort="{
            of: header.column.getIsSorted() ? header.column.id : '',
            ot: header.column.getIsSorted() === 'desc' ? 'desc' : 'asc',
          }"
          @sort="header.column.toggleSorting()"
        >
          <FlexRender
            v-if="!header.isPlaceholder"
            :render="header.column.columnDef.header"
            :props="header.getContext()"
          />
        </SkyTableHead>
      </SkyTableHeader>

      <SkyTableBody>
        <SkyTableEmpty v-if="!rows.length" :text="emptyText">
          <slot name="empty" />
        </SkyTableEmpty>

        <SkyTableRow
          v-for="row in rows"
          :key="row.id"
          :selected="row.getIsSelected()"
          :interactive="interactiveRows"
          @click="emit('row-click', row.original)"
        >
          <SkyTableCell
            v-for="cell in row.getVisibleCells()"
            :key="cell.id"
            :align="alignOf(cell.column.id)"
            no-truncate
          >
            <FlexRender
              :render="cell.column.columnDef.cell"
              :props="cell.getContext()"
            />
          </SkyTableCell>
        </SkyTableRow>
      </SkyTableBody>
    </SkyTableRoot>

    <slot name="footer" :table="table">
      <div v-if="showPagination" class="sky-data-table__pagination">
        <span class="sky-data-table__count">
          Знайдено {{ table.getRowCount() }}
        </span>

        <div class="sky-data-table__pager">
          <button
            type="button"
            class="sky-data-table__page-btn"
            :disabled="!table.getCanPreviousPage()"
            @click="table.previousPage()"
          >
            ‹
          </button>
          <span class="sky-data-table__page">
            {{ (pagination?.pageIndex ?? 0) + 1 }} / {{ table.getPageCount() }}
          </span>
          <button
            type="button"
            class="sky-data-table__page-btn"
            :disabled="!table.getCanNextPage()"
            @click="table.nextPage()"
          >
            ›
          </button>
        </div>
      </div>
    </slot>
  </div>
</template>

<style scoped>
.sky-data-table {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.sky-data-table__toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: var(--sky-table-toolbar-padding, 8px 10px);
}

.sky-data-table__search {
  flex: 1;
  max-width: 320px;
}

.sky-data-table__table {
  flex: 1;
  min-height: 0;
}

.sky-data-table__pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: var(--sky-table-footer-padding, 6px 10px);
  border-top: 1px solid var(--sky-table-border-color, #dee2e6);
  font-size: 13px;
  color: var(--sky-table-head-color, #106090);
  flex-shrink: 0;
}

.sky-data-table__pager {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sky-data-table__page-btn {
  width: 28px;
  height: 28px;
  border: 1px solid var(--sky-table-border-color, #dee2e6);
  border-radius: 6px;
  background: #fff;
  color: inherit;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
}

.sky-data-table__page-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.sky-data-table__page-btn:not(:disabled):hover {
  background: var(--sky-table-row-hover-bg, #def9ff);
}
</style>
