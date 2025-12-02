# @skyservice-developers/vue-dev-kit

Vue 3 developer toolkit - компоненти для розробки.

## Встановлення

```bash
npm install @skyservice-developers/vue-dev-kit
```

## Підключення стилів

```js
// main.js
import '@skyservice-developers/vue-dev-kit/style.css'
```

---

## Компоненти

### Header

Компонент фіксованої шапки сторінки з вбудованою підтримкою кнопки "Назад" для iframe.

#### Імпорт

```js
import { Header } from '@skyservice-developers/vue-dev-kit'
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
import { Header } from '@skyservice-developers/vue-dev-kit'
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

```css
:root {
  --sky-header-bg: white;
  --sky-header-border-color: #dee2e6;
  --sky-header-z-index: 100;
  --sky-header-padding: 10px 0;
  --sky-header-content-padding: 4px 14px;
  --sky-header-title-size: 18px;
  --sky-header-title-weight: 500;
  --sky-header-title-color: #252525;
  --sky-header-subtitle-size: 14px;
  --sky-header-subtitle-color: #6c757d;
  --sky-header-back-btn-color: #374151;
  --sky-header-back-btn-hover-bg: #f8f9fa;
  --sky-header-back-btn-active-bg: #e9ecef;
  --sky-header-actions-gap: 12px;
}
```

#### Приклади

**Мінімальний**

```vue
<Header title="Користувачі" />
```

**З кнопками**

```vue
<Header title="Контейнери" subtitle="Керування Docker контейнерами">
  <button @click="refresh">Оновити</button>
  <button @click="create">Створити</button>
</Header>
```

---

### Modal

Модальне вікно в стилістиці проекту

#### Імпорт

```js
import { Modal } from '@skyservice-developers/vue-dev-kit'
```

#### Базове використання

```vue
<template>
  <button @click="showModal = true">Відкрити</button>

  <Modal v-model="showModal" title="Заголовок" subtitle="Підзаголовок">
    <p>Контент модального вікна</p>

    <template #footer>
      <button @click="showModal = false">Закрити</button>
    </template>
  </Modal>
</template>

<script setup>
import { ref } from 'vue'
import { Modal } from '@skyservice-developers/vue-dev-kit'

const showModal = ref(false)
</script>
```

#### Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `modelValue` | `Boolean` | `false` | Стан відкриття (v-model) |
| `title` | `String` | `''` | Заголовок модального вікна |
| `subtitle` | `String` | `''` | Підзаголовок |
| `closeTitle` | `String` | `'Закрити'` | Tooltip для кнопки закриття |
| `closeOnOverlay` | `Boolean` | `true` | Закривати при кліку на overlay |
| `closeOnEsc` | `Boolean` | `true` | Закривати при натисканні Esc |

#### Events

| Event | Опис |
|-------|------|
| `update:modelValue` | Зміна стану відкриття |
| `close` | Закриття модального вікна |

#### Slots

| Slot | Опис |
|------|------|
| `default` | Основний контент модального вікна |
| `footer` | Футер з кнопками (відображається тільки якщо заповнений) |

#### CSS змінні

```css
:root {
  --sky-modal-z-index: 9998;
  --sky-modal-bg: white;
  --sky-modal-radius: 0; /* на desktop 8px */
  --sky-modal-border-color: #dee2e6;
  --sky-modal-header-padding: 10px 14px;
  --sky-modal-body-padding: 14px;
  --sky-modal-footer-padding: 10px 14px;
  --sky-modal-title-size: 18px;
  --sky-modal-title-weight: 500;
  --sky-modal-title-color: #252525;
  --sky-modal-subtitle-size: 14px;
  --sky-modal-subtitle-color: #6c757d;
  --sky-modal-back-color: #374151;
  --sky-modal-back-hover-bg: #f8f9fa;
}
```

#### Приклади

**Простий діалог**

```vue
<Modal v-model="isOpen" title="Підтвердження">
  <p>Ви впевнені?</p>

  <template #footer>
    <button @click="isOpen = false">Скасувати</button>
    <button @click="confirm">Підтвердити</button>
  </template>
</Modal>
```
