# Сповіщення (тости)

Бібліотека re-export-ує весь публічний API пакета [`sky-service-ui-components`](https://www.npmjs.com/package/sky-service-ui-components) — окремо встановлювати його не потрібно, він уже входить у залежності `vue-dev-kit`.

## Демо

<ClientOnly>
  <NotificationsDemo />
</ClientOnly>

Сюди входять три речі: **`NotificationElement`** (Web Component), **`notificationModule`** (програмний API) і **`globalStore`** (внутрішній стор).

::: tip Два види сповіщень
Ці тости рендеряться **всередині вашого mini-app**. Якщо потрібно показати нативний тост **Dashboard** (хоста) — використовуйте [`notify` / `notifyError` / `notifyWarn`](/sdk/bridge#сповіщення) з SDK.
:::

## Підключення

### 1. Імпортуйте елемент

Web Component реєструється автоматично при імпорті:

```ts
import { NotificationElement } from '@skyservice-developers/vue-dev-kit'
```

### 2. Додайте тег у розмітку

Додайте кастомний елемент один раз — у `index.html` або кореневому компоненті:

```html
<sky-toast-notification></sky-toast-notification>
```

Тепер будь-який виклик `notificationModule.notify.*` рендеритиме тост у цьому елементі.

## notificationModule

Програмний API для показу тостів. Кожен метод повертає `Promise<string | number | null>` — id тосту (або `null` при помилці).

```ts
import { notificationModule } from '@skyservice-developers/vue-dev-kit'

const { notify } = notificationModule
```

### Типи тостів

| Метод | Призначення |
|-------|-------------|
| `notify.default(config)` | Нейтральний |
| `notify.success(config)` | Успіх |
| `notify.error(config)` | Помилка |
| `notify.warning(config)` | Попередження |
| `notify.info(config)` | Інформація |
| `notify.loading(config)` | Завантаження (**не** закривається сам) |
| `notify.dismiss(id, elementId?)` | Прибрати конкретний тост |

### Базове використання

```ts
notify.success({ toastData: { title: 'Успішно збережено!' } })
notify.error({ toastData: { title: 'Помилка завантаження', description: 'Перевірте з\'єднання' } })
notify.warning({ toastData: { title: 'Увага! Перевірте дані' } })
notify.info({ toastData: { title: 'Нове повідомлення' } })
```

### Loading → dismiss

Тост `loading` не зникає автоматично — його треба прибрати вручну за id:

```ts
const id = await notify.loading({
  toastData: { title: 'Зберігається...', useCloseButton: false },
})

// коли операція завершилась
if (id !== null) notify.dismiss(id)
notify.success({ toastData: { title: 'Готово!' } })
```

### Тост із кнопками

`toastAdditionalInfo` додає ліву/праву кнопки з колбеками. Колбек отримує `{ close }` для закриття тосту:

```ts
notify.warning({
  toastData: { title: 'Видалити запис?', useCloseButton: false },
  toastAdditionalInfo: {
    leftBtn: {
      buttonText: 'Скасувати',
      buttonAction: ({ close }) => close(),
    },
    rightBtn: {
      buttonText: 'Видалити',
      buttonAction: ({ close }) => {
        close()
        notify.success({ toastData: { title: 'Видалено' } })
      },
    },
  },
})
```

### Позиція та тривалість

`toastOptions` керує позицією, тривалістю й паузою на hover:

```ts
notify.info({
  toastData: { title: 'Top-center позиція', description: 'duration: 6000' },
  toastOptions: { position: 'top-center', duration: 6000, pauseOnHover: true },
})
```

Доступні позиції: `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center`, `bottom-right`.

## Структура config

```ts
interface NotifyConfig {
  toastData: {
    title: string
    description?: string
    useCloseButton?: boolean   // показувати × (default true)
    // ...
  }
  toastOptions?: {
    position?: 'top-left' | 'top-center' | 'top-right'
              | 'bottom-left' | 'bottom-center' | 'bottom-right'
    duration?: number          // мс
    pauseOnHover?: boolean
    // ...
  }
  toastAdditionalInfo?: {
    leftBtn?: { buttonText: string; buttonAction: (ctx: { close: () => void }) => void }
    rightBtn?: { buttonText: string; buttonAction: (ctx: { close: () => void }) => void }
  }
}
```

## globalStore

Глобальний стор бібліотеки (Pinia store), який `notificationModule` використовує внутрішньо. Зазвичай напряму не потрібен:

```ts
import { globalStore } from '@skyservice-developers/vue-dev-kit'

const store = globalStore()
```

## Повний приклад у Vue

```vue
<script setup>
import { NotificationElement, notificationModule } from '@skyservice-developers/vue-dev-kit'

const { notify } = notificationModule

async function save() {
  const id = await notify.loading({ toastData: { title: 'Зберігається…', useCloseButton: false } })
  try {
    await api.save()
    if (id !== null) notify.dismiss(id)
    notify.success({ toastData: { title: 'Збережено' } })
  } catch {
    if (id !== null) notify.dismiss(id)
    notify.error({ toastData: { title: 'Не вдалося зберегти' } })
  }
}
</script>

<template>
  <button @click="save">Зберегти</button>
  <sky-toast-notification />
</template>
```

## Пов'язане

- [SDK / Bridge → Сповіщення](/sdk/bridge#сповіщення) — нативні тости Dashboard.
- [SkyAlert](/components/sky-alert) — inline-повідомлення в потоці сторінки.
