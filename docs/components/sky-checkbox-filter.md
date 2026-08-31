# SkyCheckboxFilter

Кнопка-фільтр із дропдауном, пошуком і мульти-вибором (на базі [`SkyCheckbox`](/components/sky-checkbox)). Оболонку — тригер, панель, позиціювання, закриття — тримає [`SkyFilterDropdown`](/components/sky-filter-dropdown). Стилі повторюють адмінку Skymarket 1:1.

## Демо

<ClientOnly>
  <SkyCheckboxFilterDemo />
</ClientOnly>

Це **feature**-компонент — складений блок, що оркеструє кілька базових компонентів.

## Приклад

```vue
<script setup>
import { ref } from 'vue'
import { SkyCheckboxFilter } from '@skyservice-developers/vue-dev-kit'

const selectedCategories = ref([])
const categoryOptions = [
  { value: 'alc', name: 'Алкоголь' },
  { value: 'food', name: 'Їжа' },
  { value: 'drink', name: 'Напої' },
]
</script>

<template>
  <SkyCheckboxFilter
    v-model="selectedCategories"
    title="Категорії"
    :options="categoryOptions"
  />
  <p>Обрано: {{ selectedCategories.length }}</p>
</template>
```

## Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `title` | `String` | — | Заголовок фільтра (показується у тригері) |
| `options` | `Array<{ value, name }>` | `[]` | Опції для вибору |
| `modelValue` | `Array<String \| Number>` | `[]` | Вибрані значення (v-model) |
| `selectAllLabel` | `String` | `'Обрати все'` | Лейбл кнопки «Вибрати всі» |
| `clearLabel` | `String` | `'Очистити'` | Лейбл кнопки «Очистити» |
| `doneLabel` | `String` | `'Готово'` | Лейбл кнопки «Готово» |
| `searchPlaceholder` | `String` | `'Пошук'` | Placeholder пошуку |
| `selectAll` | `Boolean` | `true` | Показувати «Обрати все». Вимикай, коли споживач приймає лише одне значення |
| `disabled` | `Boolean` | `false` | Вимкнений стан |

## Формат опцій

```ts
interface FilterOption {
  value: string | number  // потрапляє в v-model
  name: string            // показується користувачу, за ним іде пошук
}
```

## Що всередині

Компонент об'єднує кілька можливостей у готовий фільтр:

- **тригер-кнопка** з `title` і лічильником обраного;
- **дропдаун** з пошуком по `name`;
- **мульти-вибір** через `SkyCheckbox` (array-режим);
- кнопки **«Вибрати всі» / «Очистити» / «Готово»**.

Позиціювання, закриття по `Esc` / кліку поза межами та доступність приходять з
[`SkyFilterDropdown`](/components/sky-filter-dropdown). Скрол сторінки більше **не**
локиться: панель перепозиціюється на скрол, тож блокувати сторінку немає потреби.

## Кілька фільтрів поруч

Типовий сценарій — панель фільтрів над таблицею:

```vue
<script setup>
import { ref } from 'vue'
import { SkyCheckboxFilter } from '@skyservice-developers/vue-dev-kit'

const filterCategories = ref([])
const filterStatus = ref([])
</script>

<template>
  <div style="display: flex; gap: 5px; flex-wrap: wrap;">
    <SkyCheckboxFilter v-model="filterCategories" title="Категорії" :options="categoryOptions" />
    <SkyCheckboxFilter v-model="filterStatus" title="Статус" :options="statusOptions" />
  </div>
</template>
```

## Пов'язане

- [SkyFilterDropdown](/components/sky-filter-dropdown) — оболонка тригер + панель.
- [SkySelectFilter](/components/sky-select-filter) — той самий фільтр, але з одиничним вибором.
- [SkyCheckbox](/components/sky-checkbox) — базовий чекбокс, на якому побудований фільтр.
- [SkySelectSearch](/components/sky-select-search) — коли потрібне поле форми, а не фільтр-чіп.
