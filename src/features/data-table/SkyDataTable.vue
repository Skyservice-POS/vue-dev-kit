<script setup lang="ts" generic="TData extends Record<string, any>">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { FlexRender, useTable } from '@tanstack/vue-table';
import type { ColumnDef, SortingState, TableFeatures } from '@tanstack/vue-table';
import SkyTableRoot from '../../shared/ui/table/SkyTableRoot.vue';
import SkyTableHeader from '../../shared/ui/table/SkyTableHeader.vue';
import SkyTableHead from '../../shared/ui/table/SkyTableHead.vue';
import SkyTableBody from '../../shared/ui/table/SkyTableBody.vue';
import SkyTableVirtualBody from '../../shared/ui/table/SkyTableVirtualBody.vue';
import SkyTableRow from '../../shared/ui/table/SkyTableRow.vue';
import SkyTableCell from '../../shared/ui/table/SkyTableCell.vue';
import SkyTableEmpty from '../../shared/ui/table/SkyTableEmpty.vue';
import SkySearchInput from '../../shared/ui/SkySearchInput/SkySearchInput.vue';
import SkyPagination from '../../shared/ui/SkyPagination/SkyPagination.vue';
import { skyTableFeatures } from '../../shared/lib/table/tableFeatures';
import type { SkyTableColumn } from '../../shared/ui/table/types';

/** Налаштування підбору кількості рядків під висоту тіла (`fitRows`). */
export interface SkyDataTableFitOptions {
  /** Висота рядка в px. Без неї міряємо перший рядок, а без рядків — `--sky-table-row-height` + рамка. */
  rowHeight?: number;
  /** Не менше стількох рядків, навіть якщо місця менше. За замовчуванням 1. */
  min?: number;
}

/** Налаштування віртуалізації тіла — те саме, що приймає SkyTableVirtualBody. */
export interface SkyDataTableVirtualOptions {
  /** Очікувана висота рядка в px. За замовчуванням 40 — як `--sky-table-row-height`. */
  estimateSize?: number;
  /** Скільки рядків тримати в DOM понад видиме вікно. */
  overscan?: number;
  /** Рядки різної висоти. Вмикає вимірювання рядків — дорожче, лише за потреби. */
  dynamic?: boolean;
}

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
    /**
     * Розмір сторінки. `0` вимикає пагінацію — рендеряться всі рядки.
     * Підтримує `v-model:page-size`: вибір у селекторі пагінатора їде назовні.
     */
    pageSize?: number;
    /** Варіанти селектора кількості в пагінаторі (див. SkyPagination). */
    pageSizeOptions?: number[];
    /** Підпис пункту «показати все» в селекторі: `(n) => \`Усі ${n}\``. Без нього пункту немає. */
    pageAllLabel?: (total: number) => string;
    /** Показати поле глобального пошуку в тулбарі. */
    searchable?: boolean;
    searchPlaceholder?: string;
    initialSorting?: SortingState;
    emptyText?: string;
    /** Курсор-вказівник і hover на рядках. */
    interactiveRows?: boolean;
    /**
     * Віртуалізація тіла: в DOM лишається тільки видиме вікно рядків.
     * `true` — з дефолтами, обʼєкт — з налаштуваннями.
     *
     * Вимагає обмеженої висоти таблиці й несумісна з `pageSize`: на сторінці
     * в кілька десятків рядків віртуалізувати нічого. Природна пара до неї —
     * не пагінація, а довантаження за подією `reach-end`.
     */
    virtual?: boolean | SkyDataTableVirtualOptions;
    /**
     * Рахувати, скільки рядків вміщається в тіло, і віддавати це подією
     * `fit-rows` — під неї зручно вішати запит на бек з таким `limit`.
     * З пагінацією (`pageSize > 0`) таблиця ще й сама ставить такий розмір
     * сторінки, а селектор кількості ховає.
     *
     * Працює лише з обмеженою висотою таблиці (батько з `height` або
     * `flex` + `min-height: 0`): інакше тіло росте разом з рядками, і міряти
     * нема чого.
     */
    fitRows?: boolean | SkyDataTableFitOptions;
  }>(),
  {
    features: undefined,
    rowId: undefined,
    pageSize: 0,
    pageSizeOptions: undefined,
    pageAllLabel: undefined,
    searchable: false,
    searchPlaceholder: 'Пошук…',
    initialSorting: undefined,
    emptyText: 'Даних немає',
    interactiveRows: false,
  },
);

const emit = defineEmits<{
  'row-click': [row: TData];
  /** Долистали тіло до кінця. Емітиться лише у віртуальному режимі. */
  'reach-end': [];
  /** Перейшли на іншу сторінку (з одиниці). */
  'update:page': [page: number];
  /** Обрали іншу кількість рядків на сторінці. */
  'update:pageSize': [pageSize: number];
  /** Скільки рядків вміщається в тіло. Лише з `fitRows`; емітиться, коли число змінилось. */
  'fit-rows': [count: number];
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

// `rowPaginationFeature` у наборі завжди, тож getRowModel() — це вже нарізана
// сторінка, і без явного pageSize TanStack підставляє свої 10. Виходило, що
// «pageSize: 0» (задокументоване «без пагінації») мовчки показувало перші 10
// рядків без жодного пагінатора. Беремо допагінаційну модель — відсортовану
// й відфільтровану, але не обрізану.
const rows = computed(() =>
  props.pageSize > 0 ? table.getRowModel().rows : table.getPrePaginatedRowModel().rows,
);

const globalFilter = computed({
  get: () => (table.atoms.globalFilter?.get() as string) ?? '',
  set: (value: string) => table.setGlobalFilter(value),
});

const pagination = computed(() => table.atoms.pagination?.get());
const currentPage = computed(() => (pagination.value?.pageIndex ?? 0) + 1);
const currentPageSize = computed(() => pagination.value?.pageSize ?? props.pageSize);
// Пагінатор сам ховається, коли вибирати нічого (одна сторінка й один варіант
// розміру), тож тут лише вмикач режиму і порожня вибірка.
const showPagination = computed(() => props.pageSize > 0 && table.getRowCount() > 0);

function goToPage(page: number): void {
  table.setPageIndex(page - 1);
  emit('update:page', page);
}

// Нова кількість — завжди з першої сторінки: інакше поточна може опинитись за
// межами нового числа сторінок. SkyPagination свідомо цього не робить сам.
function changePageSize(size: number): void {
  table.setPageSize(size);
  table.setPageIndex(0);
  emit('update:pageSize', size);
}

// pageSize потрапляє в initialState лише на старті — зміну пропа (v-model або
// просто нове значення) доносимо до таблиці окремо.
watch(
  () => props.pageSize,
  (size) => {
    // Під fitRows розмір сторінки визначає висота, а не проп.
    if (props.fitRows) return;
    if (size > 0 && size !== currentPageSize.value) {
      table.setPageSize(size);
      table.setPageIndex(0);
    }
  },
);

function alignOf(columnId: string): SkyTableColumn['align'] {
  return gridColumns.value.find((c) => c.name === columnId)?.align ?? 'left';
}

// Ключ рядка беремо з TanStack, а не з індексу: після сортування чи фільтрації
// індекси зʼїжджають, і Vue перевикористав би DOM не тих рядків.
function rowKeyOf(row: { id: string }): string {
  return row.id;
}

const isVirtual = computed(() => Boolean(props.virtual));

const virtualProps = computed(() =>
  typeof props.virtual === 'object' && props.virtual !== null ? props.virtual : {},
);

// Разом вони безглузді: на сторінці в кілька десятків рядків віртуалізувати
// нічого, а мовчазний пріоритет одного над іншим потім ловиться годинами.
if (props.virtual && props.pageSize > 0) {
  console.warn(
    '[SkyDataTable] `virtual` і `pageSize` разом не мають сенсу: пагінація вже обмежує ' +
      'кількість рядків у DOM. Лишіть щось одне — pageSize={0} для віртуалізації.',
  );
}

// ── fitRows ────────────────────────────────────────────────────────────────
const tableRootRef = ref<{ $el: HTMLElement } | null>(null);
const fittedRows = ref(0);

const fitOptions = computed<SkyDataTableFitOptions>(() =>
  typeof props.fitRows === 'object' && props.fitRows !== null ? props.fitRows : {},
);

/** Висота рядка: явна, або виміряна з першого рядка, або з CSS-змінної. */
function rowHeightOf(body: HTMLElement): number {
  if (fitOptions.value.rowHeight) return fitOptions.value.rowHeight;
  const first = body.querySelector<HTMLElement>('.sky-table__row');
  if (first?.offsetHeight) return first.offsetHeight;
  // min-height рядка + його нижня рамка в 1px.
  const fromCss = parseFloat(getComputedStyle(body).getPropertyValue('--sky-table-row-height'));
  return (Number.isFinite(fromCss) && fromCss > 0 ? fromCss : 40) + 1;
}

function bodyEl(): HTMLElement | null {
  return tableRootRef.value?.$el?.querySelector<HTMLElement>('.sky-table__body') ?? null;
}

function recalcFit(): void {
  if (!props.fitRows) return;
  const body = bodyEl();
  if (!body) return;
  const count = Math.max(fitOptions.value.min ?? 1, Math.floor(body.clientHeight / rowHeightOf(body)));
  if (count === fittedRows.value) return;
  fittedRows.value = count;

  if (props.pageSize > 0) {
    // Лишаємось біля того самого першого рядка, а не стрибаємо на першу сторінку
    // на кожен ресайз вікна.
    const firstRow = (pagination.value?.pageIndex ?? 0) * currentPageSize.value;
    table.setPageSize(count);
    table.setPageIndex(Math.floor(firstRow / count));
  }
  emit('fit-rows', count);
}

let fitObserver: ResizeObserver | null = null;
let fitFrame = 0;

function scheduleFit(): void {
  cancelAnimationFrame(fitFrame);
  fitFrame = requestAnimationFrame(recalcFit);
}

function startFit(): void {
  stopFit();
  const body = bodyEl();
  if (!body) return;
  recalcFit();
  if (typeof ResizeObserver !== 'undefined') {
    fitObserver = new ResizeObserver(scheduleFit);
    fitObserver.observe(body);
  }
}

function stopFit(): void {
  fitObserver?.disconnect();
  fitObserver = null;
  cancelAnimationFrame(fitFrame);
}

onMounted(() => {
  if (props.fitRows) startFit();
});
onBeforeUnmount(stopFit);

watch(
  () => Boolean(props.fitRows),
  (on) => {
    if (on) void nextTick(startFit);
    else {
      stopFit();
      fittedRows.value = 0;
    }
  },
);

// Висоту рядка можна виміряти лише коли рядки є, тож після нових даних
// перевіряємо ще раз — число могло уточнитись.
watch(
  () => props.data,
  () => {
    if (props.fitRows) void nextTick(recalcFit);
  },
);

if (props.fitRows && props.virtual) {
  console.warn(
    '[SkyDataTable] `fitRows` і `virtual` разом не мають сенсу: віртуальне тіло й так ' +
      'тримає в DOM лише те, що видно. Лишіть щось одне.',
  );
}

defineExpose({ table, recalcFit, fittedRows });
</script>

<template>
  <div class="sky-data-table">
    <slot name="toolbar" :table="table">
      <div v-if="searchable || $slots.actions" class="sky-data-table__toolbar">
        <div v-if="searchable" class="sky-data-table__search">
          <SkySearchInput v-model="globalFilter" :placeholder="searchPlaceholder" />
        </div>
        <!-- Дії (налаштування колонок тощо) — завжди праворуч, хоч би якої ширини був пошук. -->
        <div v-if="$slots.actions" class="sky-data-table__actions">
          <slot name="actions" :table="table" />
        </div>
      </div>
    </slot>

    <SkyTableRoot ref="tableRootRef" :columns="gridColumns" class="sky-data-table__table">
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

      <component
        :is="isVirtual ? SkyTableVirtualBody : SkyTableBody"
        :rows="rows"
        :row-key="rowKeyOf"
        v-bind="isVirtual ? virtualProps : {}"
        @reach-end="emit('reach-end')"
      >
        <template #empty>
          <SkyTableEmpty :text="emptyText">
            <slot name="empty" />
          </SkyTableEmpty>
        </template>

        <template #default="{ row }">
          <SkyTableRow
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
        </template>
      </component>
    </SkyTableRoot>

    <slot name="footer" :table="table">
      <div v-if="showPagination" class="sky-data-table__pagination">
        <SkyPagination
          :total="table.getRowCount()"
          :page="currentPage"
          :page-size="currentPageSize"
          :page-size-options="fitRows ? [] : pageSizeOptions"
          :all-label="pageAllLabel"
          @update:page="goToPage"
          @update:page-size="changePageSize"
        />
        <span class="sky-data-table__count">Знайдено {{ table.getRowCount() }}</span>
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

.sky-data-table__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
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
  padding: var(--sky-table-footer-padding, 0 10px);
  border-top: 1px solid var(--sky-table-border-color, #dee2e6);
  flex-shrink: 0;
}

.sky-data-table__count {
  margin-left: auto;
  font-size: 13px;
  color: var(--sky-table-head-color, #106090);
  white-space: nowrap;
}
</style>
