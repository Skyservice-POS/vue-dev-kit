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
| **Примітиви** `shared/ui/table` | `SkyTableRoot`, `SkyTableHeader`, `SkyTableHead`, `SkyTableBody`, `SkyTableRow`, `SkyTableCell`, `SkyTableEmpty` | завжди — це сама таблиця |
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
| `SkyTableBody` | — | Звичайне тіло зі скролом |
| `SkyTableRow` | `selected`, `interactive` | Рядок; підсвітка й hover |
| `SkyTableCell` | `align`, `noTruncate` | Комірка |
| `SkyTableEmpty` | `text` | Порожній стан + слот `illustration` |

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

Заміна `SkyTableBody` для великих списків — у DOM тримаються лише видимі рядки.

```vue
<TableVirtualBody :items="rows" key-field="id" @reach-end="loadMore">
  <template #default="{ item, index }">
    <SkyTableRow :selected="isSelected(item)">…</SkyTableRow>
  </template>
</TableVirtualBody>
```

::: warning Єдине місце із зовнішньою залежністю
Тільки цей компонент імпортує `vue-virtual-scroller` — його треба встановити в застосунку (`npm i vue-virtual-scroller@^2.0.0-beta.8`). Якщо віртуалізація не потрібна, беріть `SkyTableBody`, і залежність не знадобиться взагалі.
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
| `vue-virtual-scroller` | лише з `TableVirtualBody` | завжди |
| Inline-редагування комірок | своїми компонентами в слоті | `customItemComponent` |
| Коли | новий екран, потрібна частина функціоналу | екран у стилі POS-таблиці товарів |
