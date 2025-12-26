# @skyservice-developers/vue-dev-kit

Vue developer toolkit - компоненти для розробки. Підтримує Vue 2 та Vue 3.

## Встановлення

```bash
npm install @skyservice-developers/vue-dev-kit
```

## Використання з Vue 3 (за замовчуванням)

```js
// main.js
import { createApp } from 'vue'
import '@skyservice-developers/vue-dev-kit/vue3/style.css'
import { Header, Modal, Dialog } from '@skyservice-developers/vue-dev-kit'
// або явно:
// import { Header, Modal, Dialog } from '@skyservice-developers/vue-dev-kit/vue3'

const app = createApp(App)
app.mount('#app')
```

## Використання з Vue 2

```js
// main.js
import Vue from 'vue'
import '@skyservice-developers/vue-dev-kit/vue2/style.css'
import { Header, Modal, Dialog } from '@skyservice-developers/vue-dev-kit/vue2'

new Vue({
  render: h => h(App)
}).$mount('#app')
```

**Важливо для Vue 2:** Бібліотека використовує `portal-vue` для телепортації компонентів. Якщо у вас проблеми з модалками, додатково встановіть:

```bash
npm install portal-vue
```

## Швидкий старт

| Версія | Імпорт компонентів | Стилі |
|--------|-------------------|-------|
| **Vue 3** | `from '@skyservice-developers/vue-dev-kit'` або `from '@skyservice-developers/vue-dev-kit/vue3'` | `@skyservice-developers/vue-dev-kit/vue3/style.css` |
| **Vue 2** | `from '@skyservice-developers/vue-dev-kit/vue2'` | `@skyservice-developers/vue-dev-kit/vue2/style.css` |

**Доступні компоненти:** `Header`, `Modal`, `Dialog`, `BaseTeleport`

---

## Компоненти

### Header

Компонент фіксованої шапки сторінки з вбудованою підтримкою кнопки "Назад" для iframe.

#### Імпорт

```js
// Vue 3
import { Header } from '@skyservice-developers/vue-dev-kit'

// Vue 2
import { Header } from '@skyservice-developers/vue-dev-kit/vue2'
```

#### Базове використання

**Vue 3 (Composition API)**
```vue
<template>
  <Header title="Назва сторінки" subtitle="Опис сторінки">
    <button @click="handleRefresh">Оновити</button>
    <button @click="handleCreate">Створити</button>
  </Header>
</template>

<script setup>
import { Header } from '@skyservice-developers/vue-dev-kit'

const handleRefresh = () => console.log('Refresh')
const handleCreate = () => console.log('Create')
</script>
```

**Vue 2 (Options API)**
```vue
<template>
  <Header title="Назва сторінки" subtitle="Опис сторінки">
    <button @click="handleRefresh">Оновити</button>
    <button @click="handleCreate">Створити</button>
  </Header>
</template>

<script>
import { Header } from '@skyservice-developers/vue-dev-kit/vue2'

export default {
  components: { Header },
  methods: {
    handleRefresh() {
      console.log('Refresh')
    },
    handleCreate() {
      console.log('Create')
    }
  }
}
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
// Vue 3
import { Modal } from '@skyservice-developers/vue-dev-kit'

// Vue 2
import { Modal } from '@skyservice-developers/vue-dev-kit/vue2'
```

#### Базове використання

**Vue 3 (Composition API)**
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

**Vue 2 (Options API)**
```vue
<template>
  <div>
    <button @click="showModal = true">Відкрити</button>

    <Modal v-model="showModal" title="Заголовок" subtitle="Підзаголовок">
      <p>Контент модального вікна</p>

      <template #footer>
        <button @click="showModal = false">Закрити</button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { Modal } from '@skyservice-developers/vue-dev-kit/vue2'

export default {
  components: { Modal },
  data() {
    return {
      showModal: false
    }
  }
}
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

---

## TypeScript

Бібліотека включає TypeScript типи. Типи автоматично підключаються при імпорті компонентів.

```typescript
import type { Component } from 'vue'
import { Header, Modal } from '@skyservice-developers/vue-dev-kit'
```

---

## Troubleshooting

### Vue 2: Модальні вікна не відображаються

Переконайтеся що у вас встановлена залежність `portal-vue`:

```bash
npm install portal-vue
```

### TypeScript помилки

Якщо TypeScript не знаходить типи, додайте в `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["@skyservice-developers/vue-dev-kit"]
  }
}
```

### Конфлікт залежностей при встановленні

Використовуйте прапорець `--legacy-peer-deps`:

```bash
npm install @skyservice-developers/vue-dev-kit --legacy-peer-deps
```

---

## Розробка

```bash
# Встановлення залежностей
npm install --legacy-peer-deps

# Білд для Vue 2
npm run build:vue2

# Білд для Vue 3
npm run build:vue3

# Білд обох версій
npm run build
```

## Ліцензія

MIT © Skyservice-POS