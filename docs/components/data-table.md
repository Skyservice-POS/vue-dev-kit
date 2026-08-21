# SkyDataTable

Грід на [TanStack Table v9](https://tanstack.com/table/latest) — headless-ядро тримає стан і обчислення, а розмітка й стилі наші. Візуально це та сама таблиця, що й у POS; відрізняється тільки те, як вона збирається.

## Демо

<ClientOnly>
  <DataTableDemo />
</ClientOnly>

## Приклад

Колонки описуються один раз і повністю визначають таблицю — як у shadcn-ui:

```vue
<script setup lang="ts">
import { h } from 'vue'
import { SkyDataTable, SkyBadge, createSkyColumnHelper } from '@skyservice-developers/vue-dev-kit'

interface Product {
  id: number
  name: string
  price: number
  status: 'Активний' | 'Прихований'
}

const column = createSkyColumnHelper<Product>()

const columns = [
  column.accessor('name', { header: 'Назва', meta: { widthFr: 2 } }),
  column.accessor('price', {
    header: 'Ціна',
    size: 110,
    meta: { align: 'right' },
    cell: ({ getValue }) => `${getValue()} ₴`,
  }),
  column.accessor('status', {
    header: 'Статус',
    size: 150,
    enableSorting: false,
    cell: ({ getValue }) =>
      h(SkyBadge, { tone: getValue() === 'Активний' ? 'success' : 'default', label: getValue() }),
  }),
]
</script>

<template>
  <SkyDataTable :columns="columns" :data="products" :page-size="25" row-id="id" searchable />
</template>
```

## Набір фіч

Фічі TanStack v9 — це плагіни, які вмикаються явно. Кіт експортує стабільний набір `skyTableFeatures`, зібраний статично поза компонентом:

```ts
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
})
```

Разом із плагінами тут живуть слоти row-моделей і реєстри функцій: ключі `sortFns` / `filterFns` стають валідними значеннями `sortFn` і `filterFn` у колонках — з підказками в IDE.

Потрібно більше (групування, пінінг, розгортання рядків) — зберіть власний набір і передайте пропом:

```ts
import { tableFeatures, rowExpandingFeature, createExpandedRowModel } from '@tanstack/vue-table'

const features = tableFeatures({
  ...skyTableFeatures,
  rowExpandingFeature,
  expandedRowModel: createExpandedRowModel(),
})
```

```vue
<SkyDataTable :features="features" :columns="columns" :data="data" />
```

Те, чого немає в наборі, не потрапляє ні в типи, ні в бандл — саме тому набір визначається явно, а не «все і одразу».

## Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `columns` | `ColumnDef[]` | — | Опис колонок (TanStack) |
| `data` | `TData[]` | — | Дані |
| `features` | `TableFeatures` | `skyTableFeatures` | Свій набір фіч |
| `rowId` | `String \| (row) => string` | — | Ключ рядка |
| `pageSize` | `Number` | `0` | Розмір сторінки; `0` — без пагінації |
| `searchable` | `Boolean` | `false` | Поле глобального пошуку в тулбарі |
| `searchPlaceholder` | `String` | `'Пошук…'` | Placeholder пошуку |
| `initialSorting` | `SortingState` | — | Початкове сортування |
| `emptyText` | `String` | `'Даних немає'` | Текст порожнього стану |
| `interactiveRows` | `Boolean` | `false` | Курсор і hover на рядках |

::: warning rowId важливіший, ніж здається
Без нього TanStack ідентифікує рядки за індексом — після сортування або фільтрації вибір «переїде» на інші рядки. Завжди передавайте `row-id`.
:::

## Ширина колонок

Геометрію задають самі колонки, а рахує її наш `SkyTableRoot`:

| Що задати | Як | Результат |
|-----------|-----|-----------|
| Фіксована ширина | `size: 150` | `150px` |
| Гнучка частка | `meta: { widthFr: 2 }` | `2fr` |
| Вирівнювання | `meta: { align: 'right' }` | праворуч |
| Ховати на вузьких екранах | `meta: { minWidthScreen: 900 }` | колонка зникає під 900px |

## Slots

| Slot | Props | Опис |
|------|-------|------|
| `toolbar` | `{ table }` | Замінює весь тулбар |
| `actions` | `{ table }` | Кнопки праворуч від пошуку |
| `footer` | `{ table }` | Замінює футер із пагінацією |
| `empty` | — | Вміст порожнього стану |

## Events

| Event | Payload | Опис |
|-------|---------|------|
| `row-click` | `TData` | Клік по рядку |

## Доступ до інстансу таблиці

Компонент віддає інстанс через `defineExpose` — звідти доступний увесь API TanStack:

```vue
<script setup>
const tableRef = ref()
const selected = computed(() => tableRef.value?.table.getSelectedRowModel().rows ?? [])
</script>

<template>
  <SkyDataTable ref="tableRef" … />
</template>
```

Стан читається через атоми TanStack Store: `table.atoms.sorting.get()`, `table.atoms.pagination.get()`, `table.atoms.rowSelection.get()`. Vue-адаптер робить ці читання реактивними всередині `computed`, тож синхронізувати стан з URL чи сервером можна звичайним `watch`:

```ts
watch(
  () => tableRef.value?.table.atoms.sorting.get(),
  (sorting) => router.replace({ query: { sort: sorting?.[0]?.id } }),
)
```

## Колонка вибору

Робиться display-колонкою — рівно як у shadcn-ui:

```ts
column.display({
  id: 'select',
  size: 44,
  meta: { align: 'center' },
  header: ({ table }) => h(SkyCheckbox, {
    modelValue: table.getIsAllRowsSelected(),
    'onUpdate:modelValue': () => table.toggleAllRowsSelected(),
  }),
  cell: ({ row }) => h(SkyCheckbox, {
    modelValue: row.getIsSelected(),
    'onUpdate:modelValue': () => row.toggleSelected(),
  }),
})
```

## Що обрати

| | `SkyDataTable` | [Примітиви](/components/table) | [`SkyTable`](/components/sky-table) |
|---|---|---|---|
| Стан (сортування, вибір, пагінація) | TanStack | ваш, через композабли | всередині компонента |
| Опис таблиці | колонки | розмітка | обʼєкт `params` |
| Залежність | `@tanstack/vue-table` | немає | `vue-virtual-scroller` |
| Коли | типовий CRUD-екран зі списком | нестандартна розмітка | старі POS-екрани |
