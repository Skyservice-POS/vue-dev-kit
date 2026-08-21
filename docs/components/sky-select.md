# SkySelect

Нативний `<select>` у фірмовому стилі Skyservice, зі станами `default | success | error` та підказкою під полем.

## Демо

<ClientOnly>
  <SkySelectDemo />
</ClientOnly>

## Приклад

```vue
<script setup>
import { ref } from 'vue'
import { SkySelect } from '@skyservice-developers/vue-dev-kit'

const payment = ref('')

const payments = [
  { value: 'cash', text: 'Готівка' },
  { value: 'card', text: 'Картка' },
]
</script>

<template>
  <SkySelect
    v-model="payment"
    :options="payments"
    placeholder="Оберіть спосіб оплати"
  />

  <SkySelect v-model="payment" :options="payments" state="error" hint="Оберіть спосіб" />
  <SkySelect v-model="payment" :options="payments" disabled />
</template>
```

## Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `modelValue` | `string \| number` | — | Поточне значення (v-model) |
| `options` | `Array<{ value: string \| number; text: string }>` | — | Список опцій (обов'язковий) |
| `id` | `String` | — | HTML id |
| `disabled` | `Boolean` | `false` | Вимкнений стан |
| `state` | `'default' \| 'success' \| 'error'` | `'default'` | Візуальний стан рамки |
| `placeholder` | `String` | `''` | Текст-заглушка (рендериться як `disabled hidden` опція) |
| `hint` | `String` | `''` | Підказка під полем, фарбується в колір `state` |

## Events

| Event | Payload | Опис |
|-------|---------|------|
| `update:modelValue` | `string \| number` | Emit при виборі опції |

## Формат опцій

Тільки об'єкти `{ value, text }` — так само, як у [`SkySelectSearch`](/components/sky-select-search):

```ts
:options="[
  { value: 'cash', text: 'Готівка' },
  { value: 'card', text: 'Картка' },
]"
// v-model отримає value ('cash')
```

::: warning Масив рядків не працює
`:options="['Кг', 'Шт', 'Л']"` і формат `{ label, value }` дають **порожні пункти**: компонент читає `option.value` та `option.text`, а їх у таких елементах немає. Якщо дані приходять масивом рядків — змапте їх:

```ts
const options = units.map((u) => ({ value: u, text: u }))
```
:::

## Ширина

Компонент розтягується на всю ширину контейнера (`width: 100%`). Щоб зробити його вужчим, обмежуйте батьківський блок:

```vue
<div style="max-width: 240px">
  <SkySelect v-model="unit" :options="units" />
</div>
```

## Клавіатура і дропдаун

Список малює браузер/ОС, тож клавіатурна навігація, пошук по першій літері та поведінка на мобільних — рідні для платформи. З цього ж випливає, що дропдаун **не обрізається** контейнерами з `overflow: hidden` і не потребує teleport усередині [`Modal`](/components/modal).

## SkySelect vs SkySelectSearch

| | [`SkySelect`](/components/sky-select) | [`SkySelectSearch`](/components/sky-select-search) |
|---|--------|----------------|
| Реалізація | нативний `<select>` | кастомний дропдаун |
| Пошук у списку | ні | так |
| Формат опцій | `{ value, text }` | `{ value, text }` |
| Обрізання в `overflow: hidden` | неможливе | можливе (`position: absolute`) |
| Коли | Короткі списки | Довгі списки (міста, товари) |
