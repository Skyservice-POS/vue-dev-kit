# SkySearchFilter

Фільтр-чіп з мульти-вибором і **серверним пошуком**: для списків, які не віддати цілими (клієнти, зміни, контрагенти). Сторінки довантажуються кнопкою «Показати ще», пошук іде на сервер із затримкою. Оболонку тримає [`SkyFilterDropdown`](/components/sky-filter-dropdown), рядки — як у [`SkyCheckboxFilter`](/components/sky-checkbox-filter).

## Демо

<ClientOnly>
  <SkySearchFilterDemo />
</ClientOnly>

## Приклад

```vue
<script setup>
import { ref } from 'vue'
import { SkySearchFilter } from '@skyservice-developers/vue-dev-kit'

const clients = ref([])

async function fetchClients({ page, search }) {
  const res = await api.getAllClients({ page, pagelimit: 20, search })
  return {
    items: res.items.map((c) => ({ value: c.clientId, name: `${c.clientName} - ${c.clientPhone}` })),
    hasMore: Boolean(res.nextpage),
  }
}
</script>

<template>
  <SkySearchFilter v-model="clients" title="Клієнти" :fetch="fetchClients" />
</template>
```

## `fetch`

```ts
type SearchFetch = (query: { page: number; search: string }) => Promise<{
  items: { value: string | number; name: string }[]
  hasMore?: boolean // показати «Показати ще»
}>
```

- Перша сторінка вантажиться, коли відкриваєш панель; щоразу заново — свіжий список.
- `page: 1` замінює список, наступні сторінки дописуються в кінець.
- Пошук — із затримкою `debounce` мс. Відповідь на застарілий запит (поки чекали, користувач набрав інше) відкидається.
- Помилка запиту пишеться в консоль, список лишається як був.

## Значення

Масив `{ value, name }`, а не голі id: після пошуку обраного рядка може вже не бути у списку, а назву все одно треба показати в тригері. Для запиту бери `clients.map((c) => c.value)`.

## Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `title` | `String` | — | Заголовок фільтра |
| `fetch` | `SearchFetch` | — | Завантаження сторінки |
| `modelValue` | `Array<{ value, name }>` | `[]` | Обрані рядки (v-model) |
| `debounce` | `Number` | `400` | Затримка пошуку, мс |
| `width` | `Number` | `320` | Ширина панелі, px |
| `clearLabel` | `String` | `'Очистити'` | |
| `doneLabel` | `String` | `'Готово'` | |
| `searchPlaceholder` | `String` | `'Пошук'` | |
| `emptyLabel` | `String` | `'Нічого не знайдено'` | |
| `loadingLabel` | `String` | `'Завантаження…'` | |
| `loadMoreLabel` | `String` | `'Показати ще'` | |
| `disabled` | `Boolean` | `false` | Вимкнений стан |

## Events

| Подія | Payload | Опис |
|-------|---------|------|
| `update:modelValue` | `Array<{ value, name }>` | Новий вибір |

## Тригер

Як у `SkyCheckboxFilter`: один рядок — його назва, кілька — кількість бейджем.

## CSS-змінні

| Змінна | За замовчуванням | Опис |
|--------|------------------|------|
| `--sky-filter-list-max-height` | `260px` | Максимальна висота списку |
| `--sky-filter-option-font-size` | `10pt` | Розмір тексту рядків |

Решта — від [`SkyFilterDropdown`](/components/sky-filter-dropdown).

## Пов'язане

- [SkyCheckboxFilter](/components/sky-checkbox-filter) — коли список невеликий і приходить цілим.
- [SkyFilters](/components/sky-filters) — рядок фільтрів; там це `type: 'search'`.
