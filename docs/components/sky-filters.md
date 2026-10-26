# SkyFilters

Рядок фільтрів з одним `v-model` на всі. Фільтри, що не влазять по ширині, ховаються в кнопку **«Усі фільтри»**, а вона відкриває штору (`SkyFiltersCurtain`) зі всіма фільтрами — як `HeaderFilters` в адмінці. Коли влазить усе й щось обрано, у рядку з'являється «Скинути фільтри».

Вбудовані типи: `checkbox`, `radio` (з опційним числовим інпутом), `range`, `search` (серверний пошук), `date` (період). Кожен є й окремим фільтр-чіпом зі своєю сторінкою: [`SkyCheckboxFilter`](/components/sky-checkbox-filter), [`SkyRadioFilter`](/components/sky-radio-filter), [`SkyRangeFilter`](/components/sky-range-filter), [`SkySearchFilter`](/components/sky-search-filter), [`SkyDateFilter`](/components/sky-date-filter). Свої типи додаються компонентом прямо в конфігу або через `registerFilterType`.

## Демо

Потягни повзунок ширини — фільтри почнуть ховатися в «Усі фільтри».

<ClientOnly>
  <SkyFiltersDemo />
</ClientOnly>

## Приклад

```vue
<script setup>
import { ref } from 'vue'
import { SkyFilters } from '@skyservice-developers/vue-dev-kit'

const values = ref({})
const filters = [
  { key: 'tradepoints', title: 'Торгова точка', options: tradepoints },
  { key: 'payment', title: 'Спосіб оплати', type: 'radio', options: payments },
  { key: 'avgCheck', title: 'Середній чек', type: 'range', min: 0, max: 5000, step: 10 },
  { key: 'clients', title: 'Клієнти', type: 'search', fetch: fetchClients },
]
</script>

<template>
  <div style="display: flex; align-items: center; gap: 5px">
    <SkyDateRangePicker v-model="range" />
    <!-- flex: 1 + min-width: 0 — інакше рядку нема від чого рахувати ширину -->
    <SkyFilters v-model="values" :filters="filters" style="flex: 1; min-width: 0" @change="load" />
  </div>
</template>
```

## Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `filters` | `SkyFilterConfig[]` | — | Конфіг фільтрів, порядок = порядок у рядку |
| `modelValue` | `Record<string, unknown>` | `{}` | Значення за ключами (v-model). Відсутній ключ = порожнє значення типу |
| `disabled` | `Boolean` | `false` | Вимикає всі фільтри |
| `labels` | `Partial<SkyFiltersLabels>` | укр. | Тексти: `allFilters`, `active`, `pcs`, `reset`, `ok`, `done`, `clear`, `selectAll`, `search`, `empty`, `loading`, `loadMore` |
| `curtainAnchor` | `string \| HTMLElement` | — | Елемент/селектор, до кута якого прилипає штора (напр. `'#content'` поруч із меню). Без нього — лівий верхній кут вікна |
| `curtainWidth` | `Number` | `320` | Ширина штори, px |

## SkyFilterConfig

| Поле | Типи | Опис |
|------|------|------|
| `key` | усі | Ключ у v-model |
| `title` | усі | Заголовок |
| `type` | — | `checkbox` (за замовчуванням) \| `radio` \| `range` \| `search` \| `date` \| свій |
| `options` | checkbox, radio | `{ value, name }[]`. Порожній — фільтр прихований (якщо не `keepEmpty`) |
| `searchable` | checkbox, radio | Пошук у списку. checkbox — `true`, radio — `false` |
| `selectAll` | checkbox | «Обрати все», `true` |
| `clearable` | radio | «Очистити», `true` |
| `inputFor` / `inputHint` | radio | Пункти з числовим інпутом і підпис до нього. Значення стає `{ value, input }`; без числа фільтр не активний |
| `min` / `max` / `step` | range | Межі й крок. Повний діапазон = `{ from: null, to: null }` |
| `min` / `max` | date | Межі дат `YYYY-MM-DD` (`max: today()` — без майбутнього) |
| `maxDays` / `disabledDate` / `presets` | date | Як у [`SkyDateFilter`](/components/sky-date-filter) |
| `fetch` | search | `({ page, search }) => Promise<{ items, hasMore }>` |
| `width` | усі | Ширина панелі дропдауна, px (280) |
| `collapsed` | усі | У шторі секція згорнута, доки в ній нічого не обрано |
| `keepEmpty` | checkbox, radio | Показувати без опцій |
| `disabled` | усі | Вимкнути один фільтр |
| `component` / `emptyValue` / `display` | свій | Див. нижче |

### Значення за типами

| Тип | Порожнє | Обране |
|-----|---------|--------|
| `checkbox` | `[]` | `[1, 2]` |
| `radio` | `null` | `'card'` |
| `radio` + `inputFor` | `{ value: null, input: '' }` | `{ value: 'come', input: '5' }` |
| `range` | `{ from: null, to: null }` | `{ from: 100, to: 900 }` |
| `search` | `[]` | `[{ value: 7, name: 'Клієнт 7' }]` — з назвою, бо рядка може вже не бути у списку |
| `date` | `{ start: null, end: null }` | `{ start: '2025-10-01', end: '2025-10-15' }` |

## Свій фільтр

Будь-який компонент з `modelValue` / `update:modelValue` (отримує ще `disabled`, `filter`, `labels`):

```js
{
  key: 'debt',
  title: 'Борг',
  component: DebtFilter,
  emptyValue: () => null,
  // count > 0 — фільтр активний; summary замінює назву в тригері, badge — поруч
  display: (v) => (v ? { count: 1, summary: 'З боргом' } : { count: 0 }),
}
```

Тип, що повторюється на багатьох сторінках, реєструється раз на застосунок:

```js
import { registerFilterType } from '@skyservice-developers/vue-dev-kit'

registerFilterType('date', {
  component: DateFilterPanel,
  emptyValue: () => null,
  display: (v) => (v ? { count: 1, badge: v } : { count: 0 }),
  // які пропи отримує компонент (за замовчуванням { filter, labels })
  props: (filter, labels) => ({ min: filter.min }),
})
// далі: { key: 'created', title: 'Дата', type: 'date' }
```

## Events

| Подія | Payload | Опис |
|-------|---------|------|
| `update:modelValue` | `values` | Новий об'єкт значень |
| `change` | `{ key, value, values }` | Змінився один фільтр (з рядка або зі штори) |
| `reset` | `values` | «Скинути фільтри» |

## Методи (ref)

| Метод | Опис |
|-------|------|
| `recalc()` | Перерахувати, що влазить (зазвичай не потрібно — є ResizeObserver) |
| `openCurtain()` / `closeCurtain()` | Відкрити/закрити штору |

## CSS-змінні

| Змінна | За замовчуванням | Опис |
|--------|------------------|------|
| `--sky-filters-gap` | `5px` | Відступ між фільтрами |
| `--sky-filters-reset-color` | `gray` | Колір «Скинути фільтри» |
| `--sky-filters-curtain-z-index` | `999` | z-index штори (блюр — на 1 нижче) |
| `--sky-filters-curtain-bg` | `#fff` | Фон штори |
| `--sky-filter-range-accent` | `#28a745` | Колір слайдера діапазону |
| `--sky-filter-list-max-height` | — / `260px` у шторі | Максимальна висота списку в панелі |

Решта (`--sky-filter-accent`, `--sky-filter-trigger-*`, `--sky-filter-panel-*`) — від [`SkyFilterDropdown`](/components/sky-filter-dropdown).
