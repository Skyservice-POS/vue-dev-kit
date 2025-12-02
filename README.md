# @skyservice/vue-dev-kit

Vue 3 developer toolkit - компоненти та утиліти для розробки.

## Встановлення

```bash
npm install @skyservice/vue-dev-kit
```

## Підключення стилів

```js
// main.js
import '@skyservice/vue-dev-kit/style.css'
```

---

## Компоненти

### Header

Компонент фіксованої шапки сторінки з вбудованою підтримкою кнопки "Назад" для iframe.

#### Імпорт

```js
import { Header } from '@skyservice/vue-dev-kit'
```

#### Базове використання

```vue
<template>
  <Header title="Назва сторінки" subtitle="Опис сторінки">
    <button @click="handleRefresh">Оновити</button>
    <button @click="handleCreate">Створити</button>
  </Header>
</template>

<script setup>
import { Header } from '@skyservice/vue-dev-kit'
</script>
```

#### Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `title` | `String` | `''` | Заголовок сторінки |
| `subtitle` | `String` | `''` | Підзаголовок сторінки |
| `showBackButton` | `Boolean` | `true` | Показувати кнопку "Назад" (відображається тільки в iframe) |
| `backButtonTitle` | `String` | `'Назад'` | Tooltip для кнопки "Назад" |

#### Slots

| Slot | Опис |
|------|------|
| `default` | Контент справа (кнопки, меню тощо) |
| `title` | Кастомний заголовок (замість `title` prop) |
| `subtitle` | Кастомний підзаголовок (замість `subtitle` prop) |

#### Особливості

**Автоматичне визначення iframe та кнопка "Назад"**

Кнопка "Назад" автоматично:
- Відображається тільки коли сторінка завантажена в iframe
- При кліку відправляє `postMessage({ type: 'exit' }, '*')` батьківському вікну

```vue
<!-- Кнопка з'явиться тільки в iframe -->
<Header title="Dashboard" />

<!-- Примусово приховати кнопку -->
<Header title="Dashboard" :show-back-button="false" />
```

#### CSS змінні

Компонент підтримує кастомізацію через CSS змінні:

```css
:root {
  /* Основні */
  --sky-header-bg: white;
  --sky-header-border-color: #dee2e6;
  --sky-header-z-index: 100;
  --sky-header-padding: 10px 0;
  --sky-header-content-padding: 4px 14px;

  /* Заголовок */
  --sky-header-title-size: 18px;
  --sky-header-title-weight: 500;
  --sky-header-title-color: #252525;

  /* Підзаголовок */
  --sky-header-subtitle-size: 14px;
  --sky-header-subtitle-color: #6c757d;

  /* Кнопка "Назад" */
  --sky-header-back-btn-color: #374151;
  --sky-header-back-btn-hover-bg: #f8f9fa;
  --sky-header-back-btn-active-bg: #e9ecef;

  /* Actions */
  --sky-header-actions-gap: 12px;
}
```

#### Приклади

**Мінімальний варіант**

```vue
<Header title="Користувачі" />
```

**З кнопками дій**

```vue
<Header title="Контейнери" subtitle="Керування Docker контейнерами">
  <button class="btn-secondary" @click="refresh">Оновити</button>
  <button class="btn-primary" @click="create">Створити</button>
</Header>
```

**Повністю кастомний заголовок**

```vue
<Header>
  <template #title>
    <div class="custom-title">
      <img src="/logo.svg" alt="Logo" />
      <span>My App</span>
    </div>
  </template>
  <UserMenu />
</Header>
```
