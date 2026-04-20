# @skyservice-developers/vue-dev-kit

Vue 3 developer toolkit для Skyservice mini-apps: UI компоненти + TypeScript SDK (iframe bridge + HTTP API клієнт).

> **v2.0.0 breaking changes:**
> - Vue 2 більше не підтримується (тільки Vue 3.4+).
> - Додано повноцінний SDK (`bridge` + `SkyserviceAPI`), раніше опублікований як окремий пакет `skyservice-sdk` (задепрекейтнутий).
> - Старі utils `shared/utils/parentBridge` та `shared/utils/webviewCheck` замінені типізованим SDK. Якщо ви імпортували їх напряму — переходьте на `@skyservice-developers/vue-dev-kit/sdk`.

## Встановлення

```bash
npm install @skyservice-developers/vue-dev-kit
```

## Підключення

### Компоненти + SDK (разом)

```js
import '@skyservice-developers/vue-dev-kit/style.css'
import {
  Header, Modal, Dialog, SkyButton, SkySelect,
  navigate, SkyserviceAPI, isInsideIframe,
} from '@skyservice-developers/vue-dev-kit'
```

### Тільки SDK (без Vue залежностей)

```ts
import {
  navigate, exit, getToken, getCompany,
  setRocketMode, notify, SkyserviceAPI,
  isInsideIframe, webviewCheck,
} from '@skyservice-developers/vue-dev-kit/sdk'
```

> Шлях `/vue3` залишено як alias на корінь для зворотної сумісності з v1.

---

## SDK

### Bridge — комунікація з Dashboard через iframe

Mini-app працює в iframe всередині Dashboard. Bridge обгортає `window.postMessage` типізованими функціями.

```ts
import {
  navigate, exit, getBack,
  getStoreData, getLocalStorageData, getWindowData,
  getCompany, getUser, getToken, getLang, getProductCategories,
  setLocalStorage, setRocketMode,
  trackVisit, openExternalLink, openCrispChat,
  notify, notifyError, notifyWarn,
  isInsideIframe, onMessage,
  setSenderId, getSenderId,
} from '@skyservice-developers/vue-dev-kit/sdk'

const token = await getToken()            // → string | null
const company = await getCompany()        // → об'єкт з Vuex store
setLocalStorage('userPref', { theme: 'dark' })
notify('Збережено')
navigate('/products/42')
```

Всі гетери повертають `Promise<T | null>` — `null` при таймауті або якщо додаток відкритий поза iframe. `null` не ламає `await` — просто треба перевірити результат.

### SkyserviceAPI — HTTP клієнт

Прямі запити до Skyservice API. Працює всюди (браузер, Node, edge), не потребує iframe.

```ts
import { SkyserviceAPI, getToken } from '@skyservice-developers/vue-dev-kit/sdk'

const token = await getToken()
const api = SkyserviceAPI.create({
  token,
  domain: 'api.skyservice.online',
  companyId,
  appId,
  // developerId: 'optional',
  // deploymentId + appName — тільки якщо користуєтесь setAppActive
  deploymentId: '4c3c7d32-2408-503b-c439-bff7332a238e',
  appName: 'glovo',
})

const tradepoints = await api.getTradepoints()
const categories = await api.getCategoryTree(tradepointId)
const products = await api.getProducts({ tradepointId })

// Активація/деактивація міні-додатку
await api.setAppActive({ isActive: true, title: 'Glovo', settings: { foo: 'bar' } })
await api.setAppActive({ isActive: false, title: 'Glovo' })
```

> `SkyserviceAPI.create()` — factory; прямий виклик `new SkyserviceAPI(...)` недоступний.
> `setAppActive` POST на `api.cabinet.developer.skyservice.online/index.php`. Якщо
> `deploymentId` + `appName` задані в конфізі — додатково шле `sendActiveApp`
> postMessage в parent (Dashboard) з відповіддю сервера та новим станом.

### Webview detection

```ts
import {
  isInsideIframe, isWebview,
  isIosWebview, isAndroidWebview, isCefWebview,
  webviewCheck,
} from '@skyservice-developers/vue-dev-kit/sdk'
```

---

## Компоненти

### Header

Шапка сторінки з кнопкою "Назад", дропдауном нещодавніх розділів та слотом для кнопок. Автоматично відправляє батьківському iframe сигнал `setRocketMode` при монтуванні та відновлює попередній стан при розмонтуванні.

```vue
<Header
  title="Товари"
  subtitle="Управління каталогом"
  :dropdown-items="recentPages"
  @navigate="goTo"
>
  <SkyButton @click="openDialog">+ Додати</SkyButton>
</Header>
```

#### Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `title` | `String` | `''` | Заголовок сторінки |
| `subtitle` | `String` | `''` | Підзаголовок |
| `showBackButton` | `Boolean` | `true` | Показувати кнопку "Назад" (тільки в iframe) |
| `backButtonTitle` | `String` | `'Назад'` | Tooltip кнопки "Назад" |
| `backEvent` | `Function` | `null` | Кастомна функція для кнопки "Назад" (замість iframe exit) |
| `dropdownItems` | `Array` | `[]` | Список нещодавніх розділів `[{ name, path, lastVisit }]` |
| `dropdownTitle` | `String` | `'Останні відвідані розділи'` | Заголовок дропдауну |
| `visitLabel` | `String` | `'Останнє відвідування'` | Підпис часу в дропдауні |
| `trackPageName` | `String` | `''` | Назва сторінки для трекінгу відвідувань |
| `trackPagePath` | `String` | `''` | Шлях сторінки для трекінгу |
| `appId` | `String` | `''` | Ідентифікатор додатку для iframe bridge |

#### Slots

| Slot | Опис |
|------|------|
| `default` | Кнопки та елементи справа |
| `title` | Кастомний заголовок |
| `subtitle` | Кастомний підзаголовок |

#### Events

| Event | Опис |
|-------|------|
| `back` | Клік на кнопку "Назад" |
| `navigate` | Вибір розділу з дропдауну |

---

### Modal

Модальне вікно з оверлеєм, шапкою, скролом у тілі та опціональним футером. Монтується в `<body>`.

```vue
<button @click="show = true">Відкрити</button>

<Modal v-model="show" title="Заголовок" subtitle="Підзаголовок">
  <p>Контент модального вікна</p>
  <template #footer>
    <button @click="show = false">Закрити</button>
  </template>
</Modal>
```

#### Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `modelValue` | `Boolean` | `false` | Стан відкриття (v-model) |
| `title` | `String` | `''` | Заголовок |
| `subtitle` | `String` | `''` | Підзаголовок |
| `closeTitle` | `String` | `'Закрити'` | Tooltip кнопки закриття |
| `closeOnOverlay` | `Boolean` | `true` | Закривати при кліку на оверлей |
| `closeOnEsc` | `Boolean` | `true` | Закривати при натисканні Esc |
| `width` | `String` | `'100%'` | Ширина модалки |
| `height` | `String` | `'100%'` | Висота модалки |

#### Slots

| Slot | Опис |
|------|------|
| `default` | Основний контент |
| `footer` | Футер з кнопками |

#### Events

| Event | Опис |
|-------|------|
| `update:modelValue` | Зміна стану |
| `close` | Закриття модалки |

---

### Dialog

Повноекранний діалог. Є два стилі: `next` (кнопка "Назад") та `classic` (кнопка ×). Якщо `mode` не вказано — визначається автоматично за URL-параметром `?rocketMode=`.

```vue
<Dialog v-model="show" mode="next" title="Новий товар" subtitle="Заповніть дані">
  <div style="padding: 20px">
    <input placeholder="Назва" />
  </div>
  <template #buttons>
    <button @click="show = false">Скасувати</button>
    <button @click="save">Зберегти</button>
  </template>
</Dialog>
```

#### Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `modelValue` | `Boolean` | `false` | Стан відкриття (v-model) |
| `title` | `String` | `''` | Заголовок |
| `subtitle` | `String` | `''` | Підзаголовок |
| `mode` | `String` | `null` | `'next'` \| `'classic'` \| `null` (авто) |
| `closeText` | `String` | `''` | Текст кнопки закриття |
| `closeOnEsc` | `Boolean` | `true` | Закривати при Esc |
| `zIndex` | `Number\|String` | `null` | Кастомний z-index |

#### Slots

| Slot | Опис |
|------|------|
| `default` | Основний контент |
| `buttons` | Кнопки у футері |

#### Events

| Event | Опис |
|-------|------|
| `update:modelValue` | Зміна стану |
| `close` | Закриття |
| `save` | Підтвердження |

---

### SkyButton

Кнопка з чотирма варіантами, станами loading/disabled, режимами block та icon.

```vue
<SkyButton variant="primary" @click="save">Зберегти</SkyButton>
<SkyButton variant="danger" :loading="deleting" @click="del">Видалити</SkyButton>
<SkyButton variant="outline" disabled>Недоступно</SkyButton>
<SkyButton variant="secondary" block>На всю ширину</SkyButton>

<!-- Іконка -->
<SkyButton variant="primary" icon title="Додати">
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>
</SkyButton>
```

#### Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `variant` | `String` | `'primary'` | `'primary'` \| `'danger'` \| `'secondary'` \| `'outline'` |
| `loading` | `Boolean` | `false` | Показує спінер, блокує клік |
| `disabled` | `Boolean` | `false` | Вимкнена кнопка |
| `block` | `Boolean` | `false` | Повна ширина |
| `icon` | `Boolean` | `false` | Квадратна кнопка для іконки |

#### CSS змінні

```css
--sky-btn-padding: 16px 20px
--sky-btn-radius: 6px
--sky-btn-font-size: 14px
--sky-btn-font-weight: 500

--sky-btn-primary-bg: #24973f
--sky-btn-danger-bg: #dc2626
--sky-btn-secondary-bg: #f3f4f6
--sky-btn-outline-bg: transparent
```

---

### SkySelect

Кастомний select з дропдауном, клавіатурною навігацією та підтримкою рядків і об'єктів як опцій.

```vue
<!-- Об'єкти -->
<SkySelect
  v-model="selected"
  :options="[
    { label: 'Готівка', value: 'cash' },
    { label: 'Картка', value: 'card' },
  ]"
  placeholder="Оберіть спосіб оплати"
/>

<!-- Рядки -->
<SkySelect v-model="selected" :options="['Кг', 'Шт', 'Л']" />

<!-- На всю ширину -->
<SkySelect v-model="selected" :options="options" block />
```

#### Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `modelValue` / `value` | `any` | `null` | Поточне значення (v-model) |
| `options` | `Array` | `[]` | `Array<{ label, value } \| string>` |
| `placeholder` | `String` | `''` | Текст-заглушка |
| `disabled` | `Boolean` | `false` | Вимкнений стан |
| `block` | `Boolean` | `false` | Повна ширина |
| `teleport` | `Boolean` | `false` | Рендерить дропдаун в `<body>` (для модалок/overflow:hidden контейнерів) |

#### Клавіатура

| Клавіша | Дія |
|---------|-----|
| `Enter` / `Space` | Відкрити дропдаун |
| `↑` / `↓` | Навігація по опціях |
| `Enter` | Вибрати поточну опцію |
| `Esc` | Закрити дропдаун |

#### CSS змінні

```css
--sky-select-padding: 10px 14px
--sky-select-radius: 6px
--sky-select-font-size: 14px
--sky-select-border: 1px solid #d1d5db
--sky-select-dropdown-shadow: 0 4px 12px rgba(0,0,0,0.1)
--sky-select-dropdown-max-height: 220px
--sky-select-option-hover-bg: #f3f4f6
--sky-select-option-selected-color: #24973f
```

---

## Теміzація

Всі компоненти підтримують кастомізацію через CSS змінні. Перевизначайте їх глобально або локально:

```css
/* Глобально */
:root {
  --sky-btn-primary-bg: #6366f1;
  --sky-btn-radius: 8px;
  --sky-select-radius: 8px;
  --sky-modal-z-index: 1000;
}

/* Локально для конкретного блоку */
.my-form {
  --sky-btn-padding: 12px 16px;
  --sky-select-padding: 8px 12px;
}
```

---

## Розробка

```bash
npm install

# Playground (live preview компонентів)
npm run playground

# Білд (компоненти + SDK → dist/)
npm run build
```

## Структура проекту

```
src/
├── index.ts           # публічний API (компоненти + SDK)
├── components/        # Vue 3 компоненти (.vue + index.ts)
├── sdk/               # TypeScript SDK
│   ├── bridge.ts      # iframe postMessage API
│   ├── api.ts         # SkyserviceAPI HTTP клієнт
│   ├── webview.ts     # детекція webview/iframe
│   ├── types.ts       # DTO типи (Tradepoint, Category, Product)
│   └── index.ts
└── styles/
```

## Ліцензія

MIT © Skyservice-POS
