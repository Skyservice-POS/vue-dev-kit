# SkyStatCard

Картка зі статистикою: іконка (необов'язкова), заголовок і значення. Може бути статичною (лише інформація) або клікабельною.

## Демо

<ClientOnly>
  <SkyStatCardDemo />
</ClientOnly>

## Приклад

```vue
<script setup>
import { SkyStatCard } from '@skyservice-developers/vue-dev-kit'
</script>

<template>
  <!-- клікабельна, з іконкою -->
  <SkyStatCard title="Всього чеків" value="128 шт" icon-src="/img/statistic-moneys.svg" clickable @click="openChecks" />

  <!-- статична, без іконки -->
  <SkyStatCard title="Виручка" value="12 400 ₴" />
</template>
```

## Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `title` | `String` | `''` | Підпис (сірий, зверху) |
| `value` | `String \| Number` | `''` | Значення (жирним) |
| `iconSrc` | `String` | `''` | Шлях до іконки. Без нього і без slot `icon` блок іконки не рендериться |
| `clickable` | `Boolean` | `false` | Hover-тінь, `role="button"`, `tabindex`, Enter/Space; емітить `click` |

## Slots

| Slot | Опис |
|------|------|
| `icon` | Своя іконка замість `iconSrc` |
| `default` | Замість `value` (напр. значення з розміткою) |

## Events

| Подія | Опис |
|-------|------|
| `click` | Лише коли `clickable`; також по Enter/Space |

## CSS-змінні

| Змінна | За замовчуванням |
|--------|------------------|
| `--sky-stat-card-bg` | `#fff` |
| `--sky-stat-card-border` | `#ededed` |
| `--sky-stat-card-title-color` | `#a3aed0` |
| `--sky-stat-card-value-color` | `#1b2559` |
| `--sky-stat-card-icon-bg` | `#f4f7fe` |
| `--sky-stat-card-icon-border` | `#e1eaff` |
| `--sky-stat-card-focus` | `#4318ff` |
