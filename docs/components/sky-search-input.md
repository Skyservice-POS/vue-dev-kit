# SkySearchInput

Поле пошуку з іконкою лупи та кнопкою очищення. Має режим `collapsible` — згорнуте до іконки, розгортається по кліку і згортається назад, коли клікнули поза ним і поле порожнє.

## Демо

<ClientOnly>
  <SkySearchInputDemo />
</ClientOnly>

## Приклад

```vue
<script setup>
import { ref, computed } from 'vue'
import { SkySearchInput } from '@skyservice-developers/vue-dev-kit'

const query = ref('')
const products = ['Кава', 'Капучино', 'Лате', 'Чай']

const filtered = computed(() =>
  products.filter((p) => p.toLowerCase().includes(query.value.trim().toLowerCase())),
)
</script>

<template>
  <SkySearchInput v-model="query" placeholder="Пошук товару…" />
  <SkySearchInput v-model="query" placeholder="Пошук…" collapsible />
</template>
```

## Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `modelValue` | `String` | `''` | Значення (v-model) |
| `placeholder` | `String` | `''` | Текст-заглушка |
| `id` | `String` | — | HTML id інпута |
| `disabled` | `Boolean` | `false` | Вимкнений стан |
| `collapsible` | `Boolean` | `false` | Згорнуте до іконки поле, що розгортається по кліку |
| `clearAriaLabel` | `String` | `'Очистити'` | `aria-label` кнопки очищення |

## Events

| Event | Payload | Опис |
|-------|---------|------|
| `update:modelValue` | `string` | Emit при введенні тексту і при очищенні |

## Режим `collapsible`

Зручний, коли пошук ділить рядок із кнопками — у згорнутому стані він займає ширину іконки.

```vue
<SkySearchInput v-model="query" collapsible placeholder="Пошук…" />
```

Правила поведінки:

| Дія | Результат |
|-----|-----------|
| Клік по згорнутому полю або по іконці | Розгортає і ставить фокус в інпут |
| Клік по іконці в розгорнутому стані | Згортає — але лише якщо поле порожнє |
| Клік поза компонентом | Згортає, якщо поле порожнє; із текстом лишається розгорнутим |
| Клік по «хрестику» з текстом | Очищає значення й лишає фокус в інпуті |
| Клік по «хрестику» на порожньому полі | Згортає поле |

Непорожній пошук ніколи не згортається сам — інакше користувач втратив би з очей активний фільтр.

## Пошук — відповідальність застосунку

Компонент лише відображає поле й керує його станом. Фільтрація даних робиться зовні — зазвичай через `computed`:

```js
const filtered = computed(() =>
  items.value.filter((i) => i.name.toLowerCase().includes(query.value.trim().toLowerCase())),
)
```

Для довгих серверних списків додайте debounce на боці застосунку — компонент емітить `update:modelValue` на кожен ввід.

## Пов'язане

- [SkySelectSearch](/components/sky-select-search) — пошук усередині дропдауна вибору.
- [SkyInput](/components/sky-input) — звичайне текстове поле зі станами валідації.
