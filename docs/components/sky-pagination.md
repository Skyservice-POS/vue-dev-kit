# SkyPagination

Посторінкова навігація в стилі таблиць адмінки: селектор кількості на сторінці, далі номери зі згортанням у «…».

Компонент нічого не завантажує — лише повідомляє, що обрали. Дані тягне викликач.

## Демо

<ClientOnly>
  <SkyPaginationDemo />
</ClientOnly>

## Приклад

```vue
<script setup>
import { ref } from 'vue'
import { SkyPagination } from '@skyservice-developers/vue-dev-kit'

const page = ref(1)
const pageSize = ref(25)
const total = ref(0)

function reload() { /* запит із page і pageSize */ }
</script>

<template>
  <SkyPagination
    :total="total"
    :page="page"
    :page-size="pageSize"
    :all-label="(n) => `Усі ${n}`"
    @update:page="page = $event; reload()"
    @update:page-size="pageSize = $event; page = 1; reload()"
  />
</template>
```

**Скидай `page` на 1, коли змінився `pageSize`** — інакше поточна сторінка може опинитись за межами нової кількості. Компонент цього не робить сам: він не знає, чи ти хочеш лишитись приблизно на тому самому місці.

## Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `total` | `Number` | — | Скільки всього записів у вибірці, не на сторінці |
| `page` | `Number` | — | Поточна сторінка, з одиниці |
| `pageSize` | `Number` | — | Записів на сторінці |
| `pageSizeOptions` | `Number[]` | `[5, 10, 25, 50, 100, 200, 500, 750, 1000]` | Варіанти селектора; лишаються тільки менші за `total` |
| `allLabel` | `(total) => String` | — | Підпис пункту «показати все». Без нього пункту немає |
| `allLimit` | `Number` | `1000` | До якої кількості пропонувати «показати все» |
| `siblings` | `Number` | `1` | Скільки сусідніх сторінок показувати обабіч поточної |
| `disabled` | `Boolean` | `false` | Вимкнений стан (наприклад, поки триває запит) |

## Events

| Event | Payload | Коли |
|-------|---------|------|
| `update:page` | `Number` | Клік по номеру сторінки |
| `update:pageSize` | `Number` | Вибір у селекторі кількості |

## Коли не підійде

Потрібен **`total`**. Для курсорних джерел (Shopify GraphQL і подібні), де загальна кількість невідома, а вперед ведуть тільки курсори, номери сторінок неможливі в принципі — там потрібна навігація «назад / далі».

## CSS-змінні

| Змінна | За замовчуванням | Опис |
|--------|------------------|------|
| `--sky-pagination-height` | `48px` | Висота панелі |
| `--sky-pagination-font-size` | `12pt` | Розмір тексту |
| `--sky-pagination-accent` | `#106090` | Колір номерів і селектора |
| `--sky-pagination-current-border` | `#a9a9a9` | Рамка поточної сторінки |
| `--sky-pagination-current-color` | `#000` | Колір тексту поточної сторінки |
