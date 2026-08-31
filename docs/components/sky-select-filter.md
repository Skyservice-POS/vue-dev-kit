# SkySelectFilter

Кнопка-фільтр із дропдауном і **одиничним** вибором — сестра [`SkyCheckboxFilter`](/components/sky-checkbox-filter) для випадків, коли бекенд приймає рівно одне значення. Обидві побудовані на [`SkyFilterDropdown`](/components/sky-filter-dropdown), тож візуал адмінки в них спільний.

## Демо

<ClientOnly>
  <SkySelectFilterDemo />
</ClientOnly>

Це **feature**-компонент — складений блок, що оркеструє кілька базових компонентів.

## Приклад

```vue
<script setup>
import { ref } from 'vue'
import { SkySelectFilter } from '@skyservice-developers/vue-dev-kit'

const categoryId = ref(null)
const categories = [
  { value: 10, name: 'Напої', depth: 0 },
  { value: 11, name: 'Кава', depth: 1 },
  { value: 12, name: 'Чай', depth: 1 },
]
</script>

<template>
  <SkySelectFilter
    v-model="categoryId"
    title="Категорія"
    all-label="Усі категорії"
    :options="categories"
  />
</template>
```

## Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `title` | `String` | — | Заголовок фільтра; показується у тригері, поки нічого не обрано |
| `options` | `Array<{ value, name, depth? }>` | — | Опції для вибору |
| `modelValue` | `String \| Number \| null` | `null` | Обране значення (v-model); `null` — фільтр вимкнено |
| `allLabel` | `String` | `''` | Лейбл першого рядка «без фільтра». Порожній — рядок не показується |
| `searchPlaceholder` | `String` | `'Пошук'` | Placeholder пошуку |
| `emptyLabel` | `String` | `'Нічого не знайдено'` | Текст, коли пошук нічого не знайшов |
| `searchable` | `Boolean` | `true` | Показувати поле пошуку |
| `disabled` | `Boolean` | `false` | Вимкнений стан |

## Events

| Event | Payload | Коли |
|-------|---------|------|
| `update:modelValue` | `String \| Number \| null` | Обрано опцію або рядок «без фільтра». Дропдаун одразу закривається |

## Формат опцій

```ts
interface FilterOption {
  value: string | number  // потрапляє в v-model
  name: string            // показується користувачу, за ним іде пошук
  depth?: number          // рівень вкладеності: лише відступ рядка
}
```

`depth` **нічого не фільтрує** — вибір завжди точний, підкатегорії не розгортаються.
Якщо потрібне «разом із вкладеними», це має бути окремий вибір користувача, а розкриття
робить бекенд.

## CSS-змінні

Спільні з рештою фільтрів — див. [`SkyFilterDropdown`](/components/sky-filter-dropdown#css-змінні). Додатково:

| Змінна | За замовчуванням | Опис |
|--------|------------------|------|
| `--sky-filter-option-hover-bg` | `rgba(0, 0, 0, 0.05)` | Фон рядка під курсором |
| `--sky-filter-option-selected-bg` | `rgba(16, 96, 144, 0.1)` | Фон обраного рядка |
| `--sky-filter-accent` | `#106090` | Колір обраного рядка й фокусу пошуку |
| `--sky-filter-muted-color` | `#adb5bd` | Колір тексту «нічого не знайдено» |

## Пов'язане

- [SkyFilterDropdown](/components/sky-filter-dropdown) — оболонка тригер + панель.
- [SkyCheckboxFilter](/components/sky-checkbox-filter) — той самий фільтр, але з мульти-вибором.
- [SkySelectSearch](/components/sky-select-search) — коли потрібне поле форми, а не фільтр-чіп.
