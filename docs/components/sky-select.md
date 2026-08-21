# SkySelect

Кастомний select із дропдауном, клавіатурною навігацією та підтримкою і рядків, і об'єктів як опцій.

## Демо

<ClientOnly>
  <SkySelectDemo />
</ClientOnly>

## Приклад

```vue
<script setup>
import { ref } from 'vue'
import { SkySelect } from '@skyservice-developers/vue-dev-kit'

const selected = ref(null)
</script>

<template>
  <!-- Об'єкти -->
  <SkySelect
    v-model="selected"
    :options="[
      { label: 'Готівка', value: 'cash' },
      { label: 'Картка', value: 'card' },
    ]"
    placeholder="Оберіть спосіб оплати"
  />

  <!-- Рядки -->
  <SkySelect v-model="selected" :options="['Кг', 'Шт', 'Л']" />

  <!-- На всю ширину -->
  <SkySelect v-model="selected" :options="options" block />
</template>
```

## Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `modelValue` / `value` | `any` | `null` | Поточне значення (v-model) |
| `options` | `Array` | `[]` | `Array<{ label, value } \| string>` |
| `placeholder` | `String` | `''` | Текст-заглушка |
| `disabled` | `Boolean` | `false` | Вимкнений стан |
| `block` | `Boolean` | `false` | Повна ширина |
| `teleport` | `Boolean` | `false` | Рендерить дропдаун у `<body>` |

## Формат опцій

`SkySelect` приймає два формати в одному масиві:

```ts
// Об'єкти { label, value }
:options="[{ label: 'Готівка', value: 'cash' }]"
// v-model отримає value ('cash')

// Рядки
:options="['Кг', 'Шт', 'Л']"
// v-model отримає сам рядок ('Кг')
```

## Клавіатура

| Клавіша | Дія |
|---------|-----|
| `Enter` / `Space` | Відкрити дропдаун |
| `↑` / `↓` | Навігація по опціях |
| `Enter` | Вибрати поточну опцію |
| `Esc` | Закрити дропдаун |

## Teleport для модалок

За замовчуванням дропдаун рендериться в потоці. У контейнерах з `overflow: hidden` (напр. усередині [`Modal`](/components/modal)) його може обрізати. Проп `teleport` рендерить дропдаун у `<body>`, оминаючи обрізання:

```vue
<Modal v-model="show" title="Форма">
  <SkySelect v-model="v" :options="options" teleport />
</Modal>
```

## CSS змінні

```css
--sky-select-padding: 10px 14px;
--sky-select-radius: 6px;
--sky-select-font-size: 14px;
--sky-select-border: 1px solid #d1d5db;
--sky-select-dropdown-shadow: 0 4px 12px rgba(0,0,0,0.1);
--sky-select-dropdown-max-height: 220px;
--sky-select-option-hover-bg: #f3f4f6;
--sky-select-option-selected-color: #24973f;
```

## SkySelect vs SkySelectSearch

| | [`SkySelect`](/components/sky-select) | [`SkySelectSearch`](/components/sky-select-search) |
|---|--------|----------------|
| Пошук у дропдауні | ні | так |
| Формат опцій | `{ label, value }` або рядок | `{ value, text }` |
| Teleport | так (`teleport`) | ні (тільки `position: absolute`) |
| Старі браузери | — | так (Chromium 84+) |
| Коли | Короткі списки | Довгі списки (міста, товари) |
