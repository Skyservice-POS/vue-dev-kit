# SkyBadge

Компактний статус-лейбл із крапкою-індикатором.

## Демо

<ClientOnly>
  <SkyBadgeDemo />
</ClientOnly>

## Приклад

```vue
<script setup>
import { SkyBadge } from '@skyservice-developers/vue-dev-kit'
</script>

<template>
  <SkyBadge tone="success" label="Під'єднано" />
  <SkyBadge tone="error">Помилка</SkyBadge>
  <SkyBadge tone="pending" :dot="false" label="Очікування" />
</template>
```

## Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `tone` | `String` | `'default'` | `'success'` \| `'error'` \| `'warning'` \| `'pending'` \| `'info'` \| `'default'` |
| `label` | `String` | `''` | Текст (якщо не передаєте slot) |
| `dot` | `Boolean` | `true` | Показувати крапку-індикатор |

## Slots

| Slot | Опис |
|------|------|
| `default` | Альтернатива до `label` |

## Тональності

| `tone` | Типове значення |
|--------|-----------------|
| `success` | Активно, під'єднано, готово |
| `error` | Помилка, відключено |
| `warning` | Потребує уваги |
| `pending` | Очікування, в процесі |
| `info` | Інформаційний статус |
| `default` | Нейтральний (за замовчуванням) |

## Текст: проп чи слот

Два еквівалентні способи:

```vue
<SkyBadge tone="success" label="Під'єднано" />
<SkyBadge tone="success">Під'єднано</SkyBadge>
```

Слот має пріоритет — зручний, коли текст містить розмітку.

## Без крапки

```vue
<SkyBadge tone="pending" :dot="false" label="Очікування" />
```

## Всередині рядка картки

Типове застосування — статус у [`SkyCardRow`](/components/sky-card#skycardrow):

```vue
<SkyCardRow label="Статус інтеграції">
  <SkyBadge tone="success" label="Під'єднано" />
</SkyCardRow>
```

## Пов'язане

- [SkyAlert](/components/sky-alert#skyalert-vs-skybadge-vs-notificationelement) — коли обирати badge, alert чи toast.
