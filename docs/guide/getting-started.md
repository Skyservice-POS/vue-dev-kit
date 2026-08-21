# Швидкий старт

## Вимоги

- **Node.js** 18+
- **Vue** 3.4+ (peer dependency)

## Встановлення

::: code-group

```bash [npm]
npm install @skyservice-developers/vue-dev-kit
```

```bash [pnpm]
pnpm add @skyservice-developers/vue-dev-kit
```

```bash [yarn]
yarn add @skyservice-developers/vue-dev-kit
```

:::

`sky-service-ui-components` та `ua-parser-js` уже входять у залежності — окремо їх ставити не потрібно.

## Підключення стилів

Стилі компонентів імпортуються **один раз** у точці входу застосунку (напр. `main.ts`):

```ts
import '@skyservice-developers/vue-dev-kit/style.css'
```

::: warning Без стилів компоненти будуть «голими»
CSS не інлайниться в компоненти — його треба підключити явно. Якщо забути, кнопки та селекти зʼявляться без оформлення.
:::

## Перший компонент

```vue
<script setup>
import { ref } from 'vue'
import { SkyButton, SkyInput } from '@skyservice-developers/vue-dev-kit'

const name = ref('')
</script>

<template>
  <SkyInput v-model="name" placeholder="Ваше ім'я" />
  <SkyButton variant="primary" @click="console.log(name)">
    Зберегти
  </SkyButton>
</template>
```

## Компоненти + SDK разом

Усе доступно з кореневого імпорту:

```ts
import '@skyservice-developers/vue-dev-kit/style.css'
import {
  // shared/ui
  Header, Modal, Dialog,
  SkyButton, SkySelect, SkySelectSearch, SkyInput, SkyCheckbox,
  SkyAlert, SkyBadge, SkyLoader,
  SkyCard, SkyCardHeader, SkyCardRow,
  // widgets
  SkyTileCard,
  // features
  SkyCheckboxFilter,
  // sdk
  navigate, SkyserviceAPI, isInsideIframe,
  // sky-service-ui-components
  NotificationElement,
  notificationModule, globalStore,
} from '@skyservice-developers/vue-dev-kit'
```

## Тільки SDK (без Vue)

Якщо потрібен лише зв'язок із Dashboard або HTTP-клієнт — імпортуйте субпакет `/sdk`. Він не тягне Vue і працює в будь-якому середовищі:

```ts
import {
  navigate, exit, getToken, getCompany,
  setRocketMode, notify, SkyserviceAPI,
  isInsideIframe, webviewCheck,
} from '@skyservice-developers/vue-dev-kit/sdk'
```

::: tip Alias /vue3
Шлях `@skyservice-developers/vue-dev-kit/vue3` залишено як alias на корінь для зворотної сумісності з v1. Нові проєкти мають імпортувати з кореня.
:::

## Entry-points

| Імпорт | Що дає | Vue-залежність |
|--------|--------|----------------|
| `@skyservice-developers/vue-dev-kit` | Компоненти + SDK + сповіщення | так |
| `@skyservice-developers/vue-dev-kit/sdk` | Тільки bridge + API + webview | ні |
| `@skyservice-developers/vue-dev-kit/style.css` | CSS усіх компонентів | — |
| `@skyservice-developers/vue-dev-kit/vue3` | Alias на корінь (legacy) | так |

## Що далі

- [Анатомія mini-app](/guide/mini-app) — як влаштований додаток в iframe і як він спілкується з Dashboard.
- [Компоненти](/components/overview) — повний каталог UI.
- [SDK → Bridge](/sdk/bridge) — отримати токен, дані компанії, показати сповіщення.
