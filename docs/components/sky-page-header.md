# SkyPageHeader

Шапка сторінки: заголовок, опис і slot під ними для кнопок, фільтрів чи табів.

## Демо

<ClientOnly>
  <SkyPageHeaderDemo />
</ClientOnly>

## Приклад

```vue
<script setup>
import { SkyPageHeader, SkyButton } from '@skyservice-developers/vue-dev-kit'
</script>

<template>
  <SkyPageHeader title="Замовлення" description="Усі замовлення за період">
    <template #header>
      <SkyButton>Новий</SkyButton>
    </template>
  </SkyPageHeader>
</template>
```

## Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `title` | `String` | `''` | Заголовок |
| `description` | `String` | `''` | Опис під заголовком |
| `position` | `String` | `'bottom'` | Де slot `header`: `'bottom'` — під описом, `'side'` — збоку в одному рядку (праворуч від заголовка; на вузьких екранах переноситься вниз) |

## Slots

| Slot | Опис |
|------|------|
| `header` | Вміст під заголовком (кнопки, фільтри, таби) |

## CSS-змінні

| Змінна | За замовчуванням | Опис |
|--------|------------------|------|
| `--sky-page-header-gap` | `1rem` | Відступ між описом і slot (для `position="bottom"`) |
| `--sky-page-header-title-color` | `#09090b` | Колір заголовка |
| `--sky-page-header-description-color` | `#6b7280` | Колір опису |
