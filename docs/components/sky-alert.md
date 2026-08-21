# SkyAlert

Інформаційне повідомлення з 4 тональностями та опціональною іконкою.

## Демо

<ClientOnly>
  <SkyAlertDemo />
</ClientOnly>

## Приклад

```vue
<script setup>
import { SkyAlert } from '@skyservice-developers/vue-dev-kit'
</script>

<template>
  <SkyAlert tone="success">Все збережено</SkyAlert>
  <SkyAlert tone="error" :show-icon="false">Щось пішло не так</SkyAlert>
  <SkyAlert tone="warning">Увага: дія незворотня</SkyAlert>
  <SkyAlert tone="info">Підказка для користувача</SkyAlert>
</template>
```

## Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `tone` | `String` | `'info'` | `'success'` \| `'error'` \| `'warning'` \| `'info'` |
| `showIcon` | `Boolean` | `true` | Показувати іконку ліворуч |

## Slots

| Slot | Опис |
|------|------|
| `default` | Вміст повідомлення |

## Тональності

| `tone` | Застосування |
|--------|--------------|
| `success` | Успішна операція |
| `error` | Помилка, збій |
| `warning` | Попередження, потенційно небезпечна дія |
| `info` | Нейтральна підказка (за замовчуванням) |

## Без іконки

```vue
<SkyAlert tone="error" :show-icon="false">Компактне повідомлення без іконки</SkyAlert>
```

## Всередині картки

`SkyAlert` природно виглядає в тілі [`SkyCard`](/components/sky-card) для inline-статусів:

```vue
<SkyCard>
  <template #header><SkyCardHeader title="Торгова точка 2" /></template>
  <SkyCardRow label="Store Address ID" value="—" />
  <SkyAlert tone="error">Невалідний storeAddressId</SkyAlert>
</SkyCard>
```

## SkyAlert vs SkyBadge vs NotificationElement

| | [`SkyAlert`](/components/sky-alert) | [`SkyBadge`](/components/sky-badge) | [Toast](/components/notifications) |
|---|--------|---------|-------|
| Формат | Блок-повідомлення | Компактна pill | Спливаюче сповіщення |
| Місце | У потоці сторінки | Інлайн (статус) | Поверх усього |
| Коли | Пояснити стан блоку | Позначити статус елемента | Реакція на дію |
