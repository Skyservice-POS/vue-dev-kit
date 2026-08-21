# SkyTable

Віртуал-скрол таблиця для великих списків: у DOM тримаються лише видимі рядки. Розмітка й стилі 1:1 з таблицею товарів POS — чекбокси, масові дії, сортування, зміна ширини та видимості колонок, розкриття вкладених рядків (модифікацій), inline-редагування комірок і теги.

## Демо

<ClientOnly>
  <SkyTableDemo />
</ClientOnly>

## Приклад

```vue
<script setup>
import { reactive } from 'vue'
import { SkyTable } from '@skyservice-developers/vue-dev-kit'

const items = [
  { id: 1, name: 'Кава', price: 45, status: 'Активний' },
  // ...
]

const params = reactive({
  id: 'id',                 // ім'я ключового поля рядка
  name: 'products',         // назва інстансу таблиці
  selected: [],             // обрані рядки (мутується всередині)
  allSelect: false,
  footer: false,            // показати футер-панель
  massActions: { delete: { value: 'delete', title: 'Видалити' } },
  sort: { of: '', ot: '' }, // of — поле, ot — напрям
  header: [
    { title: 'Назва', name: 'name', sort: 'name', width: 240, enable: true },
    { title: 'Ціна', name: 'price', sort: 'price', width: 130, enable: true, customItemComponent: 'itemInput' },
  ],
})

const json = { items, total: items.length }
</script>

<template>
  <SkyTable
    :params="params"
    :json="json"
    :main-json-data="items"
    @getData="loadData"
    @updateSelected="onSelected"
    @open="onOpenRow"
  />
</template>
```

::: warning Висота контейнера
Віртуал-скрол рахує, скільки рядків показати, від висоти батьківського елемента. Огорніть таблицю в контейнер із заданою висотою (`height: 380px`, `flex: 1` тощо) — інакше вона схлопнеться.
:::

## Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `params` | `Object` | `{}` | Конфіг таблиці (див. нижче) |
| `json` | `{ items: any[]; total: number }` | `{}` | Дані: `items` + загальна кількість `total` |
| `mainJsonData` | `Array` | `[]` | Масив рядків для рендеру (те, що бачить віртуал-скрол) |
| `justDeleted` | `String` | `''` | `id` щойно видаленого рядка — прибирає його з `selected` |

## `params` — конфіг таблиці

| Поле | Тип | Опис |
|------|-----|------|
| `id` | `String` | Ім'я ключового поля рядка (напр. `'id'`) |
| `name` | `String` | Назва інстансу таблиці |
| `selected` | `Array` | Обрані рядки (мутується компонентом) |
| `allSelect` | `Boolean` | Чи обрано всі |
| `footer` | `Boolean` | Показати футер-панель |
| `massActions` | `Record<string, { value: string; title: string }>` | Масові дії; порожньо або `{ none: … }` — приховати панель |
| `sort` | `{ of: string; ot: string }` | Поточне сортування: `of` — поле, `ot` — напрям |
| `header` | `Column[]` | Опис колонок (див. нижче) |

`params` передавайте як `reactive` — компонент пише в нього (`selected`, `allSelect`, ширини й видимість колонок).

## `header[]` — колонка

| Поле | Тип | Опис |
|------|-----|------|
| `title` | `String` | Заголовок колонки |
| `name` | `String` | Ключ у рядку даних |
| `sort` | `String \| false` | Поле сортування або `false` |
| `width` | `Number` | Фіксована ширина, px |
| `widthFr` | `Number` | Гнучка ширина (flex-частка), альтернатива `width` |
| `enable` | `Boolean` | Видимість колонки за замовчуванням |
| `customItemComponent` | `'itemInput' \| 'itemSelect' \| 'itemTags' \| 'itemTagEditor'` | Тип комірки; без нього — звичайний текст |
| `minWidthScreen` | `Number` | Ховати колонку на екранах, вужчих за це значення |

## Типи комірок

| `customItemComponent` | Поведінка | Пов'язаний event |
|-----------------------|-----------|------------------|
| — (не задано) | Звичайний текст | — |
| `itemInput` | Inline-редагування значення | `inputEdit` |
| `itemSelect` | Вибір зі списку прямо в комірці | `selectUpdate` |
| `itemTags` | Показ тегів + кнопка відкриття модалки | `openTagsModal`, `deleteTag` |
| `itemTagEditor` | Редактор тегів усередині комірки | `openTagsModal`, `deleteTag` |

## Events

| Event | Payload | Опис |
|-------|---------|------|
| `getData` | `{ of, ot }` | Запит даних (зміна сортування) |
| `updateSelected` | `any[]` | Змінився список обраних рядків |
| `updateMassactionData` | `{ action, items }` | Застосовано масову дію |
| `open` | `(item, isModification)` | Клік по рядку |
| `openContext` | `(item, { x, y })` | Контекстне меню (right-click / long-tap) |
| `inputEdit` | `(payload, columnName, handlers, item)` | Inline-редагування комірки `itemInput` |
| `selectUpdate` | `(columnName, item)` | Зміна в комірці `itemSelect` |
| `openTagsModal` | `item` | Відкрити модалку тегів (`itemTags`) |
| `deleteTag` | `(item, tag)` | Видалити тег |
| `deleteRow` | `item` | Видалити рядок (кнопка при `params.isShowDeleteRow`) |

Сортування — серверне: компонент не сортує масив сам, а емітить `getData` з новими `of` / `ot`, а застосунок вантажить дані й оновлює `json` та `mainJsonData`.

## Slots

| Slot | Props | Опис |
|------|-------|------|
| `cell-<name>` | `{ row, value, item }` | Кастомний рендер комірки колонки `<name>` |

```vue
<SkyTable :params="params" :json="json" :main-json-data="items">
  <template #cell-status="{ value }">
    <SkyBadge :tone="value === 'Активний' ? 'success' : 'default'" :label="value" />
  </template>
</SkyTable>
```

## Залежності й хост-середовище

::: tip Що треба врахувати перед інтеграцією
- **`vue-virtual-scroller` — зовнішня залежність.** Її треба встановити в застосунку: `npm i vue-virtual-scroller@^2.0.0-beta.8`.
- **i18n читається з `window.lang`** (з UA-фолбеками), як у Dashboard.
- **Частина ассетів — хостові**, за абсолютними шляхами (`/image/dragons/…`, `/svg/arrow_black.svg`). Вони навмисно не бандляться в бібліотеку (`vite.config` → `transformAssetUrls.includeAbsolute: false`), тож поза Skyservice-хостом ці іконки не завантажаться.
:::

## Пов'язане

- [SkyCheckboxFilter](/components/sky-checkbox-filter) — фільтри над таблицею.
- [SkySearchInput](/components/sky-search-input) — пошук по списку.
- [SkyBadge](/components/sky-badge) — статуси в комірках через слот `cell-<name>`.
