# SkyButton

Кнопка з чотирма варіантами, станами loading/disabled та режимами `block` і `icon`.

## Демо

<ClientOnly>
  <SkyButtonDemo />
</ClientOnly>

## Приклад

```vue
<script setup>
import { ref } from 'vue'
import { SkyButton } from '@skyservice-developers/vue-dev-kit'

const deleting = ref(false)
</script>

<template>
  <SkyButton variant="primary" @click="save">Зберегти</SkyButton>
  <SkyButton variant="danger" :loading="deleting" @click="del">Видалити</SkyButton>
  <SkyButton variant="outline" disabled>Недоступно</SkyButton>
  <SkyButton variant="secondary" block>На всю ширину</SkyButton>
</template>
```

## Варіанти

| `variant` | Призначення |
|-----------|-------------|
| `primary` | Основна дія (зелений) |
| `danger` | Деструктивна дія (червоний) |
| `secondary` | Другорядна дія (сірий) |
| `outline` | Мінімальний акцент (прозорий фон + рамка) |

```vue
<SkyButton variant="primary">Primary</SkyButton>
<SkyButton variant="danger">Danger</SkyButton>
<SkyButton variant="secondary">Secondary</SkyButton>
<SkyButton variant="outline">Outline</SkyButton>
```

## Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `variant` | `String` | `'primary'` | `'primary'` \| `'danger'` \| `'secondary'` \| `'outline'` |
| `loading` | `Boolean` | `false` | Показує спінер, блокує клік |
| `disabled` | `Boolean` | `false` | Вимкнена кнопка |
| `block` | `Boolean` | `false` | Повна ширина |
| `icon` | `Boolean` | `false` | Квадратна кнопка для іконки |

## Стани

### Loading

Показує спінер і блокує кліки. Зручно для async-дій:

```vue
<SkyButton variant="primary" :loading="saving" @click="save">Зберегти</SkyButton>
```

### Disabled

```vue
<SkyButton variant="primary" disabled>Недоступно</SkyButton>
```

### Block

Розтягує кнопку на всю ширину контейнера:

```vue
<SkyButton variant="primary" block>На всю ширину</SkyButton>
```

## Іконкова кнопка

`icon` робить кнопку квадратною під іконку. Передайте SVG у слот, `title` — для tooltip/доступності:

```vue
<SkyButton variant="primary" icon title="Додати">
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>
</SkyButton>
```

::: tip currentColor
`stroke="currentColor"` / `fill="currentColor"` в SVG змусить іконку успадкувати колір тексту кнопки — вона автоматично буде правильного кольору для кожного варіанта.
:::

## CSS змінні

```css
--sky-btn-padding: 16px 20px;
--sky-btn-radius: 6px;
--sky-btn-font-size: 14px;
--sky-btn-font-weight: 500;

--sky-btn-primary-bg: #24973f;
--sky-btn-danger-bg: #dc2626;
--sky-btn-secondary-bg: #f3f4f6;
--sky-btn-outline-bg: transparent;
```

Приклад перебрендування — див. [Теми → перебрендувати кнопки](/guide/theming#приклад-перебрендувати-кнопки-у-фіолетовий).
