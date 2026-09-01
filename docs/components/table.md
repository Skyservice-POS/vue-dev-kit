# Таблиця (композиційна)

Набір примітивів і композаблів, з яких таблиця збирається під конкретний екран. Береш тільки те, що треба: без вибору рядків, без масових дій, без віртуалізації — і нічого з цього не потрапить у бандл.

Це альтернатива готовому [`SkyTable`](/components/sky-table), який лишається як є для екранів у стилі POS.

## Демо

<ClientOnly>
  <TableDemo />
</ClientOnly>

## Мінімальна таблиця

Три примітиви — і таблиця готова. Жодних `params`, жодних залежностей:

```vue
<script setup>
import {
  SkyTableRoot, SkyTableHeader, SkyTableHead,
  SkyTableBody, SkyTableRow, SkyTableCell,
} from '@skyservice-developers/vue-dev-kit'

const columns = [
  { name: 'name', title: 'Товар', widthFr: 2 },
  { name: 'price', title: 'Ціна', width: 90, align: 'right' },
]

const rows = [
  { id: 1, name: 'Кава', price: '45 ₴' },
  { id: 2, name: 'Капучино', price: '60 ₴' },
]
</script>

<template>
  <SkyTableRoot :columns="columns">
    <SkyTableHeader>
      <SkyTableHead v-for="c in columns" :key="c.name" :column="c" />
    </SkyTableHeader>

    <SkyTableBody>
      <SkyTableRow v-for="row in rows" :key="row.id">
        <SkyTableCell>{{ row.name }}</SkyTableCell>
        <SkyTableCell align="right">{{ row.price }}</SkyTableCell>
      </SkyTableRow>
    </SkyTableBody>
  </SkyTableRoot>
</template>
```

## Що з чого складається

| Шар | Що там | Коли підключати |
|-----|--------|-----------------|
| **Примітиви** `shared/ui/table` | `SkyTableRoot`, `SkyTableHeader`, `SkyTableHead`, `SkyTableBody`, `SkyTableVirtualBody`, `SkyTableRow`, `SkyTableCell`, `SkyTableEmpty` | завжди — це сама таблиця |
| **Композабли** `shared/lib/table` | `useTableSort`, `useTableSelection`, `useColumnVisibility` | коли потрібна відповідна поведінка |
| **Фічі** `features/table` | `TableMassActions`, `TableColumnSettings`, `TableVirtualBody` | опційно, кожна окремо |

Примітиви нічого не знають про дані: вони лише малюють розкладку. Уся логіка — у композаблах, які повертають звичайні `ref`/`computed` і не диктують розмітку.

## Примітиви

### SkyTableRoot

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `columns` | `SkyTableColumn[]` | — | Колонки; задають `grid-template-columns` для шапки й рядків |
| `minWidth` | `String` | `'max-content'` | Мінімальна ширина таблиці |

Колонки з `minWidthScreen` ховаються на вузьких екранах — компонент слухає `resize`.

### SkyTableColumn

```ts
interface SkyTableColumn {
  name: string                      // ключ у рядку даних
  title?: string                    // підпис у шапці
  width?: number                    // фіксована ширина, px
  widthFr?: number                  // гнучка частка (за замовчуванням 1fr)
  sortable?: boolean | string       // true → сортувати за name; рядок → за іншим полем
  minWidthScreen?: number           // ховати на екранах, вужчих за це значення
  align?: 'left' | 'center' | 'right'
}
```

### Решта примітивів

| Компонент | Props | Опис |
|-----------|-------|------|
| `SkyTableHeader` | `sticky` (`true`) | Рядок шапки; липне до верху при скролі |
| `SkyTableHead` | `column`, `sort` | Комірка шапки; емітить `sort` із полем, якщо колонка сортована |
| `SkyTableBody` | `rows`, `rowKey` | Звичайне тіло зі скролом |
| `SkyTableVirtualBody` | `rows`, `rowKey`, `estimateSize`, `overscan`, `dynamic` | Те саме, але в DOM лише видиме вікно рядків |
| `SkyTableRow` | `selected`, `interactive` | Рядок; підсвітка й hover |
| `SkyTableCell` | `align`, `noTruncate` | Комірка |
| `SkyTableEmpty` | `text` | Порожній стан + слот `illustration` |

### Тіло: два режими, один контракт

`SkyTableBody` працює у двох режимах. Без `rows` це прозора обгортка — рядки складаєте самі (як у прикладі вище). З `rows` тіло ітерує саме й віддає scoped-слот:

```vue
<SkyTableBody :rows="rows" :row-key="row => row.id">
  <template #empty><SkyTableEmpty text="Даних немає" /></template>
  <template #default="{ row }">
    <SkyTableRow>
      <SkyTableCell>{{ row.name }}</SkyTableCell>
    </SkyTableRow>
  </template>
</SkyTableBody>
```

`SkyTableVirtualBody` приймає **ті самі** `rows` / `rowKey` і віддає **той самий** слот — тож перемикання віртуалізації це заміна одного тега на інший, без переписування розмітки рядка:

```vue
<component :is="virtual ? SkyTableVirtualBody : SkyTableBody" :rows="rows" :row-key="row => row.id">
  <template #default="{ row }">…</template>
</component>
```

Саме так влаштований проп `virtual` у [`SkyDataTable`](/components/data-table).

### SkyTableVirtualBody

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `rows` | `TRow[]` | — | Рядки (обовʼязково) |
| `rowKey` | `(row, index) => string \| number` | індекс | Ключ рядка |
| `estimateSize` | `Number` | `40` | Очікувана висота рядка в px |
| `overscan` | `Number` | `6` | Скільки рядків тримати понад видиме вікно |
| `dynamic` | `Boolean` | `false` | Рядки різної висоти — вмикає вимірювання через ResizeObserver |

Подія `reach-end` — коли останній рядок увійшов у вікно; зручно вішати довантаження.

::: warning Потрібна обмежена висота
Віртуалізація рахує вікно від висоти скрол-контейнера, а ним є саме тіло. Якщо таблиця росте разом з контентом і скролиться сторінка, вікно ніколи не зсувається — у DOM залишаться перші кілька рядків і все. Дайте таблиці `height` або `flex: 1; min-height: 0`.
:::

`dynamic` вмикайте лише за потреби: з фіксованою висотою геометрія рахується арифметикою, без жодного читання з DOM.

## Композабли

### useTableSort

```ts
const { sort, toggle, directionOf, reset } = useTableSort({
  initial: { of: 'name', ot: 'asc' },
  tristate: false, // true → третій клік скидає сортування
})

function onSort(field) {
  const next = toggle(field)   // → { of, ot }
  loadData(next)               // сортування виконує сервер
}
```

Композабл **не сортує дані** — він лише тримає стан. Це навмисно: у POS-екранах сортування серверне, а для локальних даних достатньо власного `computed`.

### useTableSelection

```ts
const {
  selected, selectedIds, isSelected,
  allSelected, someSelected,
  toggle, toggleAll, clear, remove,
} = useTableSelection(rows, {
  rowId: 'id',                               // або (row) => row.uuid
  selectable: (row) => !(Number(row.parent) > 0),
})

toggle(row, index)                  // звичайний клік
toggle(row, index, { shift: true }) // діапазон від попереднього кліку
```

На відміну від `SkyTable`, нічого не мутує в чужих пропсах — стан живе в композаблі.

### useColumnVisibility

```ts
const { visibility, visibleColumns, toggle, reset } = useColumnVisibility(columns, {
  storageKey: 'products-table-columns', // збереже вибір користувача
  hidden: ['id'],                       // приховані за замовчуванням
})
```

`visibleColumns` віддавайте в `SkyTableRoot`, а `visibility` — у `TableColumnSettings` через `v-model`.

## Фічі

### TableMassActions

Панель масових дій; сама ховається, коли нічого не обрано.

```vue
<TableMassActions
  :count="selected.length"
  :actions="[{ value: 'delete', title: 'Видалити' }]"
  @action="onMassAction"
/>
```

### TableColumnSettings

```vue
<TableColumnSettings v-model="visibility" :columns="columns" @reset="reset" />
```

### TableVirtualBody

Сумісна обгортка над [`SkyTableVirtualBody`](#skytablevirtualbody) зі старим контрактом (`items` + слот `{ item, index }`).

```vue
<TableVirtualBody :items="rows" key-field="id" @reach-end="loadMore">
  <template #default="{ item, index }">
    <SkyTableRow :selected="isSelected(item)">…</SkyTableRow>
  </template>
</TableVirtualBody>
```

::: tip У новому коді беріть примітив
`TableVirtualBody` лишається тільки заради тих, хто вже його імпортує. Для нового екрана беріть `SkyTableVirtualBody` (той самий контракт, що й у `SkyTableBody`) або проп `virtual` у [`SkyDataTable`](/components/data-table). Проп `sizeDependencies` більше ні на що не впливає: висоту рядків стежить ResizeObserver.
:::

## CSS змінні

```css
--sky-table-bg: #fff;
--sky-table-color: #212529;
--sky-table-font-size: 13px;
--sky-table-border-color: #dee2e6;
--sky-table-cell-padding: 8px 10px;
--sky-table-row-height: 36px;
--sky-table-row-hover-bg: #f8f9fa;
--sky-table-row-selected-bg: #eef7f0;
--sky-table-head-bg: #fff;
--sky-table-head-color: #6c757d;
--sky-table-head-weight: 500;
--sky-table-sort-active-color: #24973f;
--sky-table-empty-color: #6c757d;
```

## Коли що брати

| | Композиційна таблиця | [`SkyTable`](/components/sky-table) |
|---|---|---|
| Розмітка | ваша, з примітивів | фіксована, 1:1 з POS |
| Конфіг | props компонентів | один обʼєкт `params` |
| Масові дії, вибір, віртуалізація | опційні | вбудовані |
| Віртуалізація | `SkyTableVirtualBody` замість `SkyTableBody` | завжди |
| Inline-редагування комірок | своїми компонентами в слоті | `customItemComponent` |
| Коли | новий екран, потрібна частина функціоналу | екран у стилі POS-таблиці товарів |
