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