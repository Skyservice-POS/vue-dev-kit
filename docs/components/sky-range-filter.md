# SkyRangeFilter

Фільтр-чіп для числового діапазону: два поля «від — до» і слайдер з двома повзунками. Оболонку тримає [`SkyFilterDropdown`](/components/sky-filter-dropdown).

## Демо

<ClientOnly>
  <SkyRangeFilterDemo />
</ClientOnly>

## Приклад

```vue
<script setup>
import { ref } from 'vue'
import { SkyRangeFilter } from '@skyservice-developers/vue-dev-kit'

const avgCheck = ref({ from: null, to: null })
</script>

<template>
  <SkyRangeFilter v-model="avgCheck" title="Середній чек" :min="0" :max="5000" :step="10" />
</template>
```

## Як поводиться

- Значення — `{ from, to }`. **Повний діапазон** (обидва краї на `min`/`max`) емітиться як `{ from: null, to: null }`: фільтр вимкнено, і в запит його слати не треба.
- Поля приймають лише валідне: число в межах `min…max`, і `from ≤ to`. Невалідне значення підсвічується червоним і **не** емітиться.
- Повзунок не дає перетягнути один край за інший. Значення округлюється до `step`; кількість знаків після коми береться зі `step` (`0.5` → 1 знак).
- Під час перетягування значення емітиться один раз, коли відпустиш повзунок, а з полів — на кожне валідне введення.
- Межі часто приходять з відповіді API — просто передавай нові `min`/`max`.

## Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `title` | `String` | — | Заголовок фільтра |
| `modelValue` | `{ from: number \| null, to: number \| null }` | `{ from: null, to: null }` | Діапазон (v-model) |
| `min` | `Number` | `0` | Нижня межа |
| `max` | `Number` | `100` | Верхня межа |
| `step` | `Number` | `1` | Крок |
| `doneLabel` | `String` | `'Готово'` | |
| `disabled` | `Boolean` | `false` | Вимкнений стан |

## Events

| Подія | Payload | Опис |
|-------|---------|------|
| `update:modelValue` | `{ from, to }` | Новий діапазон |

## Тригер

Назва фільтра; коли діапазон задано — бейдж `from - to`.

## CSS-змінні

| Змінна | За замовчуванням | Опис |
|--------|------------------|------|
| `--sky-filter-range-accent` | `#28a745` | Колір смуги й повзунків |

Решта — від [`SkyFilterDropdown`](/components/sky-filter-dropdown).

## Пов'язане

- [SkyFilters](/components/sky-filters) — рядок фільтрів; там це `type: 'range'`.
