# SkySelectSearch

Кастомний select **з полем пошуку** у дропдауні — для довгих списків опцій. Дизайн 1:1 зі [`SkySelect`](/components/sky-select), той самий набір станів, але інший формат опцій (`{ value, text }`).

## Демо

<ClientOnly>
  <SkySelectSearchDemo />
</ClientOnly>

::: tip Сумісність зі старими браузерами
Не використовує нативний `<select>` і навмисно уникає сучасних API (`flex gap`, `inset`, `:focus-visible`, `Array.at()` тощо), тож працює на старих браузерах — перевірено з **Chromium 84**.
:::

## Приклад

```vue
<script setup>
import { ref } from 'vue'
import { SkySelectSearch } from '@skyservice-developers/vue-dev-kit'

const selected = ref(null)
const cities = [
  { value: 'kyiv', text: 'Київ' },
  { value: 'lviv', text: 'Львів' },
  { value: 'odesa', text: 'Одеса' },
]
</script>

<template>
  <SkySelectSearch
    v-model="selected"
    :options="cities"
    placeholder="Оберіть місто"
    search-placeholder="Почніть вводити…"
  />
</template>
```

## Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `modelValue` | `string \| number` | `undefined` | Поточне значення (v-model) |
| `options` | `Array<{ value: string \| number; text: string }>` | — | Список опцій (**обов'язковий**) |
| `id` | `String` | `undefined` | `id` тригера |
| `disabled` | `Boolean` | `false` | Вимкнений стан |
| `state` | `'default' \| 'success' \| 'error'` | `'default'` | Візуальний стан |
| `placeholder` | `String` | `''` | Текст, коли нічого не обрано |
| `hint` | `String` | `''` | Підказка під полем |
| `searchPlaceholder` | `String` | `'Пошук…'` | Placeholder поля пошуку |
| `noResultsText` | `String` | `'Нічого не знайдено'` | Текст за відсутності збігів |

## Events

| Event | Payload | Опис |
|-------|---------|------|
| `update:modelValue` | `string \| number` | Emit при виборі опції |

## Формат опцій

На відміну від `SkySelect`, тут опції — це **завжди** об'єкти `{ value, text }`:

```ts
const options = [
  { value: 'kyiv', text: 'Київ' },
  { value: 'lviv', text: 'Львів' },
]
```

- `value` — те, що потрапляє в `v-model`;
- `text` — те, що бачить користувач і за чим фільтрує пошук.

## Клавіатура

| Клавіша | Дія |
|---------|-----|
| `Enter` / `Space` / `↓` | Відкрити дропдаун (на тригері) |
| `↑` / `↓` | Навігація по відфільтрованих опціях |
| `Enter` | Вибрати підсвічену опцію |
| `Esc` | Закрити дропдаун |
| `Tab` | Закрити і перейти далі |

## Стани

Так само як [`SkyInput`](/components/sky-input), підтримує `state` + `hint`:

```vue
<SkySelectSearch
  v-model="city"
  :options="cities"
  placeholder="Оберіть місто"
  state="error"
  hint="Оберіть значення"
/>
```

## Позиціонування

::: warning Немає teleport
Дропдаун позиціонується через `position: absolute` (без teleport), тож у контейнерах з `overflow: hidden` (напр. усередині [`Modal`](/components/modal)) його може обрізати — так само, як нативний select. Якщо потрібен teleport — використовуйте [`SkySelect`](/components/sky-select) з пропом `teleport`.
:::

## Коли обирати цей компонент

- Список **довгий** (десятки+ опцій) — пошук економить кліки.
- Потрібна підтримка **старих браузерів**.
- Не потрібен teleport (селект не в модалці з `overflow: hidden`).

В інших випадках — [`SkySelect`](/components/sky-select#skyselect-vs-skyselectsearch).
