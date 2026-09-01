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
| `searchThreshold` | `Number` | `6` | Від скількох опцій показувати поле пошуку. `0` — завжди, `Infinity` — ніколи |

## Поле пошуку

Поле пошуку з'являється не завжди, а **від 6 опцій** — на списку з трьох рядків воно лише шумить, бо все видно й так. Поріг налаштовується через `searchThreshold`.

Рахуються **всі** опції, а не відфільтровані: інакше запит, який звузив список до пари рядків, ховав би поле прямо під час набору.

Коли поля немає, фокус лишається на тригері — і стрілками, `Enter` та `Esc` керує вже він. Клавіатура працює однаково в обох режимах.

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

Навігацію веде поле пошуку, а якщо його немає (див. `searchThreshold`) — тригер.

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

**Дропдаун не вилазить за нижній край екрана:** якщо знизу тісно (менше ніж 160px), він розкривається **вгору**. Сторону компонент обирає до першого рендера панелі, тож вона не встигає блимнути вниз, і переобирає її на кожен скрол чи ресайз, поки відкрита — інакше рішення, ухвалене в момент відкриття, застаріває, щойно щось прокрутили.

Висоту панель обмежує сама під доступне місце: скролиться список усередині, а не сторінка. Звичайна стеля списку — 220px, у тісноті менша. Поле пошуку при цьому лишається цілим — воно не стискається разом зі списком.

::: warning Немає teleport
Панель позиціонується через `position: absolute` (без teleport), тож у контейнерах з `overflow: hidden` (напр. усередині [`Modal`](/components/modal)) її все одно може обрізати — так само, як нативний select. Розкриття вгору рятує від краю **вікна**, а не від такого контейнера. Якщо потрібен teleport — беріть [`SkyFilterDropdown`](/components/sky-filter-dropdown), він телепортує панель у `body`.
:::

## Коли обирати цей компонент

- Список **довгий** (десятки+ опцій) — пошук економить кліки.
- Потрібна підтримка **старих браузерів**.
- Не потрібен teleport (селект не в модалці з `overflow: hidden`).

В інших випадках — [`SkySelect`](/components/sky-select#skyselect-vs-skyselectsearch).
