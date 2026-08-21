import type { RowData } from '@tanstack/vue-table';
import {
  columnFilteringFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createCoreRowModel,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFns,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
} from '@tanstack/vue-table';

/**
 * Стабільний набір фіч для гріда — визначається один раз статично, поза
 * компонентом, як і радить TanStack v9. Сюди входять лише ті плагіни, що
 * реально потрібні продукту: сортування, вибір рядків, видимість колонок,
 * пагінація і фільтрація (колонкова + глобальний пошук).
 *
 * Разом із плагінами тут же живуть слоти row-моделей і реєстри функцій
 * (`sortFns` / `filterFns`) — їхні ключі стають валідними значеннями для
 * `sortFn` та `filterFn` у визначеннях колонок, з повним виведенням типів.
 *
 * Потрібно щось поза цим набором (групування, пінінг, розгортання рядків) —
 * зберіть власний обʼєкт через `tableFeatures()` і передайте в `SkyDataTable`
 * пропом `features`: те, чого немає в наборі, не потрапляє ні в типи, ні в бандл.
 */
export const skyTableFeatures = tableFeatures({
  columnFilteringFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,

  coreRowModel: createCoreRowModel(),
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),

  sortFns,
  filterFns,
});

export type SkyTableFeatures = typeof skyTableFeatures;

/**
 * Типізований помічник для опису колонок під наш набір фіч.
 *
 * ```ts
 * const column = createSkyColumnHelper<Product>()
 * const columns = [
 *   column.accessor('name', { header: 'Назва' }),
 *   column.display({ id: 'actions', cell: ({ row }) => h(RowActions, { row }) }),
 * ]
 * ```
 */
export function createSkyColumnHelper<TData extends RowData>() {
  return createColumnHelper<SkyTableFeatures, TData>();
}
