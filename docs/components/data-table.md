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
| `pageSize` | `Number` | `0` | Розмір сторінки; `0` — без пагінації. Підтримує `v-model:page-size` |
| `pageSizeOptions` | `Number[]` | як у `SkyPagination` | Варіанти селектора кількості |
| `pageAllLabel` | `(total) => String` | — | Підпис пункту «показати все» в селекторі; без нього пункту немає |
| `searchable` | `Boolean` | `false` | Поле глобального пошуку в тулбарі |
| `searchPlaceholder` | `String` | `'Пошук…'` | Placeholder пошуку |
| `initialSorting` | `SortingState` | — | Початкове сортування |
| `emptyText` | `String` | `'Даних немає'` | Текст порожнього стану |
| `interactiveRows` | `Boolean` | `false` | Курсор і hover на рядках |
| `virtual` | `Boolean \| SkyDataTableVirtualOptions` | `false` | Віртуалізація тіла — у DOM лише видиме вікно рядків |
| `fitRows` | `Boolean \| { rowHeight?, min? }` | `false` | Рахувати, скільки рядків вміщається в тіло (подія `fit-rows`); з пагінацією — ще й розмір сторінки |

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

## Віртуалізація

На кілька тисяч рядків браузер провисає не на даних, а на DOM. Проп `virtual` лишає в розмітці тільки видиме вікно:

```vue
<SkyDataTable :columns="columns" :data="rows" row-id="id" virtual />

<!-- або з налаштуваннями -->
<SkyDataTable
  :columns="columns"
  :data="rows"
  row-id="id"
  :virtual="{ estimateSize: 44, overscan: 8 }"
  @reach-end="loadMore"
/>
```

| Опція | Тип | За замовчуванням | Опис |
|-------|-----|------------------|------|
| `estimateSize` | `Number` | `40` | Очікувана висота рядка в px |
| `overscan` | `Number` | `6` | Скільки рядків тримати понад видиме вікно |
| `dynamic` | `Boolean` | `false` | Рядки різної висоти — вмикає вимірювання через ResizeObserver |

Змінюється рівно одне: хто вирішує, які рядки зараз у DOM. Сортування, фільтрація, вибір і `getRowCount()` працюють по всьому набору даних, а не по видимому вікну.

::: warning Потрібна обмежена висота
Скрол-контейнером є тіло таблиці. Якщо таблиця росте разом з контентом і скролиться сторінка, вікно ніколи не зсувається — у DOM залишаться перші кілька рядків і все. Дайте таблиці `height` або `flex: 1; min-height: 0`.
:::

::: tip Не поєднуйте з `pageSize`
На сторінці в кілька десятків рядків віртуалізувати нічого. Компонент попередить у консолі, якщо задати обидва. Природна пара до `virtual` — не пагінація, а довантаження за подією `reach-end`.
:::

`dynamic` вмикайте лише за потреби: з фіксованою висотою рядка геометрія рахується арифметикою, без читання з DOM.

## Slots

| Slot | Props | Опис |
|------|-------|------|
| `toolbar` | `{ table }` | Замінює весь тулбар |
| `actions` | `{ table }` | Кнопки тулбару, притиснуті до правого краю (напр. `SkyDataTableColumnToggle`) |
| `footer` | `{ table }` | Замінює футер із пагінацією (`SkyPagination` + «Знайдено N») |
| `empty` | — | Вміст порожнього стану |

## Events

| Event | Payload | Опис |
|-------|---------|------|
| `row-click` | `TData` | Клік по рядку |
| `reach-end` | — | Долистали тіло до кінця. Тільки у віртуальному режимі |
| `update:page` | `Number` | Перейшли на іншу сторінку (з одиниці) |
| `update:pageSize` | `Number` | Обрали іншу кількість на сторінці; таблиця сама повертається на першу сторінку |
| `fit-rows` | `Number` | Скільки рядків вміщається в тіло. Лише з `fitRows`; емітиться, коли число змінилось |

## Пагінація

З `pageSize > 0` у футері стоїть [`SkyPagination`](/components/sky-pagination): селектор кількості на сторінці й номери сторінок, праворуч — «Знайдено N». Сторінки рахуються на клієнті з усіх відфільтрованих рядків.

```vue
<SkyDataTable
  v-model:page-size="pageSize"
  :columns="columns"
  :data="products"
  :page-size-options="[10, 25, 50, 100]"
  :page-all-label="(n) => `Усі ${n}`"
  row-id="id"
/>
```

- Нова кількість на сторінці завжди повертає на першу сторінку — інакше поточна могла б опинитись за межами нового числа сторінок.
- `v-model:page-size` потрібен, лише якщо вибір треба пам'ятати (наприклад, у налаштуваннях користувача). Без нього таблиця тримає розмір сама.
- Пагінатор ховається сам, коли вибирати нічого: одна сторінка й один варіант розміру. Без рядків футера немає зовсім.

## Скільки рядків вміщається (`fitRows`)

Таблиця міряє вільну висоту тіла, ділить на висоту рядка й віддає результат подією `fit-rows`. Під неї зручно вішати запит на бек рівно з тією кількістю, що влізе, без скролу й без зайвих рядків.

```vue
<div style="height: 600px">
  <SkyDataTable
    :columns="columns"
    :data="rows"
    :page-size="25"
    fit-rows
    row-id="id"
    @fit-rows="(n) => { limit = n; load() }"
    @update:page="(p) => { page = p; load() }"
  />
</div>
```

- **Опційно**: без `fitRows` таблиця нічого не міряє.
- **Висота таблиці має бути обмежена** — батько з `height` або `flex` + `min-height: 0`. Інакше тіло росте разом з рядками, і міряти нема чого.
- Перераховується на зміну розміру (ResizeObserver) і після нових даних. Подія летить лише коли число змінилось.
- **З пагінацією** (`pageSize > 0`) таблиця сама ставить такий розмір сторінки й ховає селектор кількості. На ресайзі лишається біля того самого першого рядка, а не стрибає на першу сторінку.
- Висота рядка вимірюється з першого рядка; без рядків — з `--sky-table-row-height` (+1px рамки). Для рядків нестандартної висоти задайте `fitRows: { rowHeight: 56 }`; `min` — не менше стількох рядків, навіть якщо місця менше.
- З `virtual` не поєднується: віртуальне тіло й так тримає в DOM лише видиме (компонент попередить у консолі).

::: tip Серверна пагінація
`fitRows` лише рахує кількість — сторінки й сортування таблиця поки що рахує на клієнті з переданих `data`. Для повноцінної серверної пагінації (таблиця показує одну сторінку з бека, а `total` приходить окремо) потрібен окремий серверний режим.
:::

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
| Залежність | `@tanstack/vue-table` (+ `vue-virtual` з `virtual`) | немає | `@tanstack/vue-virtual` |
| Коли | типовий CRUD-екран зі списком | нестандартна розмітка | старі POS-екрани |
