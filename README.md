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
  // shared/ui
  Header, Modal, Dialog,
  SkyButton, SkySelect, SkySelectSearch, SkyInput, SkySearchInput, SkyCheckbox, SkyTabs,
  SkyAlert, SkyBadge, SkyLoader,
  SkyCard, SkyCardHeader, SkyCardRow,
  SkyTable,
  FunctionalCalendar, SkyDateRangePicker,
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

// Права доступу
const canInventory = await api.getPerms('204')  // → boolean
const allPerms = await api.getPerms()            // → PermsMap { '204': true, ... }

// Активація/деактивація міні-додатку
await api.setAppActive({ isActive: true, title: 'Glovo', settings: { foo: 'bar' } })
await api.setAppActive({ isActive: false, title: 'Glovo' })
```

> `SkyserviceAPI.create()` — factory; прямий виклик `new SkyserviceAPI(...)` недоступний.
> `setAppActive` POST на `api.cabinet.developer.skyservice.online/index.php`. Якщо
> `deploymentId` + `appName` задані в конфізі — додатково шле `sendActiveApp`
> postMessage в parent (Dashboard) з відповіддю сервера та новим станом.

#### Права доступу — `getPerms`

Повертає права поточного користувача. Джерело за пріоритетом:

1. **Стор Dashboard** через iframe bridge (`store.perms`) — миттєво, без токена, працює всередині iframe;
2. **HTTP fallback** `section=adminPanel&action=getStart` → `data.settings.perms` — поза iframe (standalone-сторінка, Node) або поки стор ще порожній.

```ts
await api.getPerms('9006')  // → boolean — чи надано право 9006
await api.getPerms()        // → PermsMap: { '9006': true, '100': false, ... }
api.clearPermsCache()       // скинути кеш (наступний getPerms перезапросить джерело)
```

> Результат кешується на інстансі — повторні виклики не роблять зайвих запитів/postMessage.
> Значення нормалізуються в `boolean` (бек може віддавати `0/1`); відсутній код → `false`.

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

Шапку можна зібрати слотами — так само як у `Header`: `#title` / `#subtitle`
перекривають відповідні props, `#header-actions` додає елементи справа
(кнопка "Назад" лишається на місці).

```vue
<Modal v-model="show">
  <template #title>
    <h4 style="margin: 0">Замовлення №1042 <SkyBadge tone="success" label="Оплачено" /></h4>
  </template>
  <template #subtitle>Оновлено щойно</template>
  <template #header-actions>
    <SkyButton variant="outline">Друк</SkyButton>
  </template>

  <p>Контент</p>
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
| `title` | Кастомний заголовок (замість пропа `title`) |
| `subtitle` | Кастомний підзаголовок (замість пропа `subtitle`) |
| `header-actions` | Елементи справа в шапці (кнопки, бейджі) |
| `footer` | Футер з кнопками |

#### CSS змінні

| Змінна | За замовчуванням | Опис |
|--------|------------------|------|
| `--sky-modal-header-actions-gap` | `8px` | Відступ між елементами в `#header-actions` |

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
| `title` | Кастомний заголовок (замість пропа `title`) |
| `subtitle` | Кастомний підзаголовок (замість пропа `subtitle`) |
| `header-actions` | Елементи справа в шапці (кнопки, бейджі) |
| `buttons` | Кнопки у футері |

Слоти шапки працюють в обох режимах — `next` (ліворуч кнопка "Назад") і
`classic` (праворуч ×); `#header-actions` рендериться ліворуч від ×.

```vue
<Dialog v-model="show" mode="next">
  <template #title>Замовлення №1042</template>
  <template #subtitle>3 позиції · 1 240 ₴</template>
  <template #header-actions>
    <SkyButton variant="outline">Друк</SkyButton>
  </template>

  <div style="padding: 20px">Контент</div>
</Dialog>
```

#### CSS змінні

| Змінна | За замовчуванням | Опис |
|--------|------------------|------|
| `--sky-dialog-header-actions-gap` | `8px` | Відступ між елементами в `#header-actions` |
| `--sky-dialog-title-max-width-with-actions` | `50%` | Ширина заголовка в `classic`, коли є `#header-actions` |

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

### SkySelectSearch

Кастомний select **з полем пошуку** у дропдауні — для довгих списків опцій. Дизайн 1:1 зі `SkySelect`, той самий формат опцій (`{ value, text }`) та стани. Не використовує нативний `<select>`, тому працює на старих браузерах (перевірено з Chromium 84): без `flex gap`, `inset`, `:focus-visible`, `Array.at()` тощо.

```vue
<SkySelectSearch
  v-model="selected"
  :options="[
    { value: 'kyiv', text: 'Київ' },
    { value: 'lviv', text: 'Львів' },
    { value: 'odesa', text: 'Одеса' },
  ]"
  placeholder="Оберіть місто"
  search-placeholder="Почніть вводити…"
/>
```

#### Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `modelValue` | `string \| number` | `undefined` | Поточне значення (v-model) |
| `options` | `Array<{ value: string \| number; text: string }>` | — | Список опцій (обов'язковий) |
| `id` | `String` | `undefined` | `id` тригера |
| `disabled` | `Boolean` | `false` | Вимкнений стан |
| `state` | `'default' \| 'success' \| 'error'` | `'default'` | Візуальний стан |
| `placeholder` | `String` | `''` | Текст, коли нічого не обрано |
| `hint` | `String` | `''` | Підказка під полем |
| `searchPlaceholder` | `String` | `'Пошук…'` | Placeholder поля пошуку |
| `noResultsText` | `String` | `'Нічого не знайдено'` | Текст за відсутності збігів |

#### Events

| Event | Payload | Опис |
|-------|---------|------|
| `update:modelValue` | `string \| number` | Emit при виборі опції |

#### Клавіатура

| Клавіша | Дія |
|---------|-----|
| `Enter` / `Space` / `↓` | Відкрити дропдаун (на тригері) |
| `↑` / `↓` | Навігація по відфільтрованих опціях |
| `Enter` | Вибрати підсвічену опцію |
| `Esc` | Закрити дропдаун |
| `Tab` | Закрити і перейти далі |

> **Примітка:** дропдаун позиціонується `position: absolute` (без teleport), тому в контейнерах з `overflow: hidden` (напр. усередині модалки) його може обрізати — так само, як і нативний `SkySelect`.

---

### SkyInput

Текстовий input з підтримкою станів `default | success | error` та опціональною підказкою.

```vue
<SkyInput v-model="name" placeholder="Імʼя" />
<SkyInput v-model="email" type="email" state="error" hint="Невалідний email" />
<SkyInput v-model="phone" disabled />
```

#### Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `modelValue` | `String\|Number` | `''` | Значення (v-model) |
| `type` | `String` | `'text'` | HTML-тип input |
| `placeholder` | `String` | `''` | Текст-заглушка |
| `id` | `String` | — | HTML id |
| `disabled` | `Boolean` | `false` | Вимкнений стан |
| `state` | `String` | `'default'` | `'default'` \| `'success'` \| `'error'` |
| `hint` | `String` | — | Підказка під input (фарбується в колір state) |

---

### SkySearchInput

Стилізоване поле пошуку (іконка-лупа + кнопка очищення) — 1:1 з дизайном пошуку в адмінках Skyservice. Компонент чисто UI: сам не фільтрує дані, лише віддає значення через `v-model` — умови пошуку прописує споживач компонента. Підтримує режим `collapsible`: поле згорнуте до іконки і розгортається по кліку, згортається назад по кліку поза межами компонента (якщо порожнє) або по кліку на іконку.

```vue
<SkySearchInput v-model="search" placeholder="Пошук..." />

<!-- Згорнутий режим: розгортається по кліку -->
<SkySearchInput v-model="search" placeholder="Пошук..." collapsible />
```

#### Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `modelValue` | `String` | `''` | Значення (v-model) |
| `placeholder` | `String` | `''` | Текст-заглушка |
| `id` | `String` | — | HTML id |
| `disabled` | `Boolean` | `false` | Вимкнений стан |
| `collapsible` | `Boolean` | `false` | Якщо `true` — поле за замовчуванням згорнуте до іконки, розгортається по кліку |
| `clearAriaLabel` | `String` | `'Очистити'` | `aria-label` кнопки очищення |

#### Events

| Event | Payload | Опис |
|-------|---------|------|
| `update:modelValue` | `string` | Emit при введенні тексту |

> **Примітка:** фільтрація/пошук по даних — відповідальність батьківського компонента (напр. `computed` з `.filter()`), `SkySearchInput` лише відображає поле і керує його розгорнутим/згорнутим станом.

---

### SkyCheckbox

Чекбокс з двома режимами: класичний бокс або switch-перемикач. Підтримує v-model з `Boolean` (одиничний) або масивом значень (через `value` prop).

```vue
<!-- Boolean -->
<SkyCheckbox v-model="agreed">Погоджуюсь з умовами</SkyCheckbox>

<!-- Масив значень -->
<SkyCheckbox v-for="opt in options" :key="opt.value" v-model="selected" :value="opt.value">
  {{ opt.name }}
</SkyCheckbox>

<!-- Switch -->
<SkyCheckbox v-model="enabled" switch>Сповіщення</SkyCheckbox>

<SkyCheckbox v-model="disabled" disabled>Заблоковано</SkyCheckbox>
```

#### Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `modelValue` | `Boolean\|Array` | — | Стан/масив вибраних значень (v-model) |
| `value` | `String\|Number` | — | Значення для array-режиму |
| `switch` | `Boolean` | `false` | Режим switch замість чекбоксу |
| `disabled` | `Boolean` | `false` | Вимкнений стан |

#### Slots

| Slot | Опис |
|------|------|
| `default` | Лейбл |

---

### SkyTabs

Сегментовані таби з анімованим індикатором: біла «пігулка» плавно переїжджає під активну опцію й підлаштовує ширину під довжину тексту.

```vue
<SkyTabs
  v-model="period"
  :options="[
    { value: 'day', text: 'День' },
    { value: 'week', text: 'Тиждень' },
    { value: 'month', text: 'Місяць' },
  ]"
/>
```

#### Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `modelValue` | `string \| number` | — | Активне значення (v-model) |
| `options` | `Array<{ value: string \| number; text: string }>` | — | Список табів (обов'язковий) |
| `disabled` | `Boolean` | `false` | Блокує весь набір |

#### Events

| Event | Payload | Опис |
|-------|---------|------|
| `update:modelValue` | `string \| number` | Emit при виборі таба |

> Індикатор вимірює активну кнопку через `getBoundingClientRect()`: на першому рендері стає на місце без анімації, далі — з переходом. Реагує на `resize` вікна і зміну кількості опцій. У прихованому контейнері (`display: none`) розміри нульові — позиція виправиться після показу.

---

### SkyAlert

Інформаційне повідомлення з 4 тональностями та опціональною іконкою.

```vue
<SkyAlert tone="success">Все збережено</SkyAlert>
<SkyAlert tone="error" :show-icon="false">Щось пішло не так</SkyAlert>
<SkyAlert tone="warning">Увага: дія незворотня</SkyAlert>
<SkyAlert tone="info">Підказка для користувача</SkyAlert>
```

#### Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `tone` | `String` | `'info'` | `'success'` \| `'error'` \| `'warning'` \| `'info'` |
| `showIcon` | `Boolean` | `true` | Показувати іконку ліворуч |

#### Slots

| Slot | Опис |
|------|------|
| `default` | Вміст повідомлення |

---

### SkyBadge

Компактний статус-лейбл з крапкою.

```vue
<SkyBadge tone="success" label="Під'єднано" />
<SkyBadge tone="error">Помилка</SkyBadge>
<SkyBadge tone="pending" :dot="false" label="Очікування" />
```

#### Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `tone` | `String` | `'default'` | `'success'` \| `'error'` \| `'warning'` \| `'pending'` \| `'info'` \| `'default'` |
| `label` | `String` | `''` | Текст (якщо не передаєте slot) |
| `dot` | `Boolean` | `true` | Показувати крапку-індикатор |

#### Slots

| Slot | Опис |
|------|------|
| `default` | Альтернатива до `label` |

---

### SkyCard

Shell-контейнер для карток: ribbon / header / body / footer — всі через slots. Використовуйте у зв'язці з `SkyCardHeader`, `SkyCardRow`, `SkyBadge`, `SkyAlert`.

```vue
<SkyCard>
  <template #ribbon>Тимчасово закрито</template>
  <template #header>
    <SkyCardHeader
      title="Торгова точка"
      subtitle="вул. Хрещатик, 1"
      icon-src="/svg/home.svg"
    />
  </template>

  <SkyCardRow label="Статус">
    <SkyBadge tone="success" label="Активна" />
  </SkyCardRow>
  <SkyCardRow label="ID" value="12345" />

  <SkyAlert tone="error">Помилка синхронізації</SkyAlert>

  <template #footer>
    <SkyButton variant="primary" block>Налаштувати</SkyButton>
  </template>
</SkyCard>
```

#### Slots

| Slot | Опис |
|------|------|
| `ribbon` | Стрічка зверху (наприклад "Тимчасово закрито") |
| `header` | Шапка картки (часто `SkyCardHeader`) |
| `default` | Тіло картки (часто `SkyCardRow`, `SkyAlert`) |
| `footer` | Футер з кнопками |

#### CSS змінні

```css
--sky-card-bg: #fff
--sky-card-radius: 12px
--sky-card-shadow: 0 1px 12px rgba(0,0,0,0.1)
--sky-card-ribbon-bg: #e65100
--sky-card-ribbon-color: #fff
--sky-card-padding-header: 24px 24px 0
--sky-card-padding-body: 10px 24px 15px
--sky-card-padding-footer: 0 24px 24px
```

---

### SkyCardHeader

Готова шапка картки: іконка + заголовок + підзаголовок.

```vue
<SkyCardHeader title="Glovo" subtitle="Інтеграція доставки" icon-src="/svg/glovo.svg" />

<!-- або свій slot замість img -->
<SkyCardHeader title="Меню">
  <template #icon>
    <MyCustomIcon />
  </template>
</SkyCardHeader>
```

#### Props

| Prop | Тип | Обов'язково | Опис |
|------|-----|-------------|------|
| `title` | `String` | так | Заголовок |
| `subtitle` | `String` | ні | Підзаголовок |
| `iconSrc` | `String` | ні | Шлях до зображення іконки |

#### Slots

| Slot | Опис |
|------|------|
| `icon` | Override іконки (якщо не хочете використовувати `iconSrc`) |

#### CSS змінні

```css
--sky-card-icon-size: 64px
--sky-card-icon-radius: 12px
--sky-card-icon-bg: #00c279
--sky-card-icon-color: #fff
```

---

### SkyLoader

Фірмовий лоадер: дві кільцеві анімації навколо літери "S", опціональний підпис.

`position: absolute` + `z-index: 20000` — центрується відносно найближчого позиціонованого батька.

```vue
<!-- В позиціонованому контейнері -->
<div style="position: relative; min-height: 300px;">
  <SkyLoader text="Завантаження..." />
</div>

<!-- Без підпису -->
<SkyLoader />
```

#### Props

| Prop | Тип | Обов'язково | Опис |
|------|-----|-------------|------|
| `text` | `String` | ні | Підпис під лоадером |

---

### SkyCardRow

Рядок "label + value" (або довільний контент через slot).

```vue
<SkyCardRow label="Store ID" value="12345" />

<!-- зі своїм вмістом праворуч -->
<SkyCardRow label="Статус">
  <SkyBadge tone="success" label="Під'єднано" />
</SkyCardRow>
```

#### Props

| Prop | Тип | Обов'язково | Опис |
|------|-----|-------------|------|
| `label` | `String` | так | Підпис зліва |
| `value` | `String \| Number` | ні | Значення справа (ігнорується якщо є slot) |

#### Slots

| Slot | Опис |
|------|------|
| `default` | Override правої колонки |

---

### SkyTileCard

Тайл-картка: зверху — іконка + заголовок + підзаголовок; знизу — довільний вміст через `default` slot. Підходить для списків інтеграцій / додатків / швидкого доступу.

```vue
<SkyTileCard
  title="Glovo"
  subtitle="Інтеграція з сервісом доставки"
  image-url="/image/glovo_logo.png"
/>

<!-- з додатковим контентом знизу -->
<SkyTileCard title="Glovo" subtitle="Інтеграція" image-url="/image/glovo_logo.png">
  <SkyBadge tone="success" label="Активно" />
  <SkyButton variant="outline" block>Налаштувати</SkyButton>
</SkyTileCard>

<!-- зі своєю іконкою -->
<SkyTileCard title="Налаштування">
  <template #icon>
    <SettingsIcon />
  </template>
</SkyTileCard>
```

#### Props

| Prop | Тип | Обов'язково | Опис |
|------|-----|-------------|------|
| `title` | `String` | так | Заголовок |
| `subtitle` | `String` | ні | Підзаголовок |
| `imageUrl` | `String` | ні | URL зображення |

#### Slots

| Slot | Опис |
|------|------|
| `icon` | Override іконки |
| `default` | Додатковий вміст під header (бейджі, кнопки тощо) |

#### CSS змінні

```css
--sky-tile-bg: #fff
--sky-tile-radius: 12px
--sky-tile-shadow: 0 1px 12px rgba(0,0,0,0.08)
--sky-tile-icon-size: 56px
--sky-tile-icon-radius: 12px
--sky-tile-icon-bg: #00c279
--sky-tile-icon-color: #fff
--sky-tile-title-color: #1a1a1a
--sky-tile-subtitle-color: #666
```

---

### SkyTable

Віртуал-скрол таблиця (на `vue-virtual-scroller`) для великих списків — у DOM тримаються лише видимі рядки. Розмітка й стилі 1:1 з таблицею товарів POS: чекбокси, масові дії, сортування, зміна ширини/видимості колонок, розкриття вкладених рядків (модифікацій), inline-редагування комірок і теги.

```vue
<SkyTable
  :params="params"
  :json="json"
  :main-json-data="items"
  @getData="loadData"
  @updateSelected="onSelected"
  @open="onOpenRow"
/>
```

```js
const items = [
  { id: 1, name: 'Кава', price: 45, status: 'Активний' },
  // ...
]
const params = reactive({
  id: 'id',                 // ім'я ключового поля рядка
  name: 'products',         // назва інстансу таблиці
  selected: [],             // обрані рядки (мутується всередині)
  allSelect: false,
  footer: false,            // показати футер-панель
  massActions: { delete: { value: 'delete', title: 'Видалити' } },
  sort: { of: '', ot: '' }, // of — поле, ot — напрям
  header: [
    { title: 'Назва', name: 'name', sort: 'name', width: 240, enable: true },
    { title: 'Ціна', name: 'price', sort: 'price', width: 130, enable: true, customItemComponent: 'itemInput' },
  ],
})
const json = { items, total: items.length }
```

#### Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `params` | `Object` | `{}` | Конфіг таблиці (див. нижче) |
| `json` | `{ items: any[]; total: number }` | `{}` | Дані: `items` + загальна кількість `total` |
| `mainJsonData` | `Array` | `[]` | Масив рядків для рендеру (те, що бачить віртуал-скрол) |
| `justDeleted` | `String` | `''` | `id` щойно видаленого рядка — прибирає його з `selected` |

#### `params` — конфіг таблиці

| Поле | Тип | Опис |
|------|-----|------|
| `id` | `String` | Ім'я ключового поля рядка (напр. `'id'`) |
| `name` | `String` | Назва інстансу таблиці |
| `selected` | `Array` | Обрані рядки (мутується компонентом) |
| `allSelect` | `Boolean` | Чи обрано всі |
| `footer` | `Boolean` | Показати футер-панель |
| `massActions` | `Record<string, { value: string; title: string }>` | Масові дії; порожньо або `{ none: … }` — приховати панель |
| `sort` | `{ of: string; ot: string }` | Поточне сортування: `of` — поле, `ot` — напрям |
| `header` | `Column[]` | Опис колонок (див. нижче) |

#### `header[]` — колонка

| Поле | Тип | Опис |
|------|-----|------|
| `title` | `String` | Заголовок колонки |
| `name` | `String` | Ключ у рядку даних |
| `sort` | `String \| false` | Поле сортування або `false` |
| `width` | `Number` | Фіксована ширина, px |
| `widthFr` | `Number` | Гнучка ширина (flex-частка), альтернатива `width` |
| `enable` | `Boolean` | Видимість колонки за замовчуванням |
| `customItemComponent` | `'itemInput' \| 'itemSelect' \| 'itemTags' \| 'itemTagEditor'` | Тип комірки; без нього — звичайний текст |
| `minWidthScreen` | `Number` | Ховати колонку на екранах, вужчих за це значення |

#### Events

| Event | Payload | Опис |
|-------|---------|------|
| `getData` | `{ of, ot }` | Запит даних (зміна сортування) |
| `updateSelected` | `any[]` | Змінився список обраних рядків |
| `updateMassactionData` | `{ action, items }` | Застосовано масову дію |
| `open` | `(item, isModification)` | Клік по рядку |
| `openContext` | `(item, { x, y })` | Контекстне меню (right-click / long-tap) |
| `inputEdit` | `(payload, columnName, handlers, item)` | Inline-редагування комірки `itemInput` |
| `selectUpdate` | `(columnName, item)` | Зміна в комірці `itemSelect` |
| `openTagsModal` | `item` | Відкрити модалку тегів (`itemTags`) |
| `deleteTag` | `(item, tag)` | Видалити тег |
| `deleteRow` | `item` | Видалити рядок (кнопка при `params.isShowDeleteRow`) |

#### Slots

| Slot | Props | Опис |
|------|-------|------|
| `cell-<name>` | `{ row, value, item }` | Кастомний рендер комірки колонки `<name>` |

> **Примітка:** компонент розрахований на хост-середовище Skyservice POS. Він читає словник i18n з `window.lang` (з UA-фолбеками) і використовує host-assets за абсолютними шляхами (`/image/dragons/…`, `/svg/arrow_black.svg`), які віддає застосунок-хост — тому в бібліотеці вони навмисно не бандляться (`vite.config` → `transformAssetUrls.includeAbsolute: false`). `vue-virtual-scroller` — зовнішня залежність: встанови її в застосунку-хості.

---

### FunctionalCalendar

Перенесено зі SkyMarket (`src/lib/functional-calendar`), стилі й розмітка 1:1. Форк [vue-functional-calendar](https://github.com/ManukMinasyan/vue-functional-calendar) під Vue 3 — пропси, події та слоти без змін відносно оригіналу.

```vue
<FunctionalCalendar
  :value="calendarData"
  @input="calendarData = $event"
  is-date-range
  is-modal
/>
```

### SkyDateRangePicker

Перенесено зі SkyMarket (`DatePickerRange.vue`) — готовий попап-піка діапазону дат на базі `FunctionalCalendar`: іконка-тригер, лейбл періоду, пресети (Сьогодні / Вчора / Тиждень / Місяць / Минулий-Поточний місяць / За весь час), стилі 1:1. На відміну від оригіналу, який читав `store`/`@/langs` конкретного застосунку, тут стан і тексти (з UA-фолбеками) локальні.

```vue
<SkyDateRangePicker v-model="range" @set-date="onPreset" />
```

```js
const range = reactive({ start: '', end: '' }) // { start, end } у форматі yyyy-mm-dd
```

---

## Features

### SkyCheckboxFilter

Кнопка-фільтр з дропдауном, пошуком і мульти-вибором (через `SkyCheckbox`). Лочить скрол сторінки, поки відкритий. Стилі повторюють адмінку Skymarket 1:1.

```vue
<SkyCheckboxFilter
  v-model="selectedCategories"
  title="Категорії"
  :options="[
    { value: 'alc', name: 'Алкоголь' },
    { value: 'food', name: 'Їжа' },
  ]"
/>
```

#### Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `title` | `String` | — | Заголовок фільтра (показується у тригері) |
| `options` | `Array<{ value, name }>` | `[]` | Опції для вибору |
| `modelValue` | `Array<String\|Number>` | `[]` | Вибрані значення (v-model) |
| `selectAllLabel` | `String` | `'Вибрати всі'` | Лейбл кнопки "Вибрати всі" |
| `clearLabel` | `String` | `'Очистити'` | Лейбл кнопки "Очистити" |
| `doneLabel` | `String` | `'Готово'` | Лейбл кнопки "Готово" |
| `searchPlaceholder` | `String` | `'Пошук'` | Placeholder пошуку |
| `disabled` | `Boolean` | `false` | Вимкнений стан |

---

## sky-service-ui-components

Бібліотека re-export-ує весь публічний API пакета `sky-service-ui-components`. Окремо встановлювати його не потрібно — він вже входить у залежності `vue-dev-kit`.

### NotificationElement (Web Component)

Кастомний HTML-елемент для відображення тостів. Реєструється автоматично при імпорті.

```ts
import { NotificationElement } from '@skyservice-developers/vue-dev-kit'
```

Додай елемент в `index.html` або кореневий компонент:

```html
<notification-element id="my-notifications"></notification-element>
```

### notificationModule

Програмний API для показу тостів.

```ts
import { notificationModule } from '@skyservice-developers/vue-dev-kit'

// Типи: default | success | error | warning | info | loading
await notificationModule.notify.success({ message: 'Збережено' })
await notificationModule.notify.error({ message: 'Помилка' })
await notificationModule.notify.warning({ message: 'Увага' })
await notificationModule.notify.info({ message: 'Підказка' })

const id = await notificationModule.notify.loading({ message: 'Завантаження...' })
// Прибрати конкретний тост
await notificationModule.notify.dismiss(id)
```

Метод повертає `Promise<string | number | null>` — id тосту або `null` при помилці.

### globalStore

Глобальний стор бібліотеки (Pinia store). Використовується внутрішньо `notificationModule`.

```ts
import { globalStore } from '@skyservice-developers/vue-dev-kit'

const store = globalStore()
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

## Іконки

SVG-іконки лежать у `src/shared/assets/icons/`. Збірка через `vite-svg-loader` — за замовчуванням повертає URL, опціонально можна імпортувати як Vue-компонент або сирий рядок:

```ts
// URL — для <img :src> (default)
import iconUrl from '@/shared/assets/icons/home.svg'

// Vue-компонент — для inline SVG, стилізації через currentColor
import IconHome from '@/shared/assets/icons/home.svg?component'

// Сирий вміст SVG
import iconRaw from '@/shared/assets/icons/home.svg?raw'
```

Типи для query-параметрів задекларовані в `src/vue-shim.d.ts`.

## Розробка

```bash
npm install

# Playground (live preview компонентів)
npm run playground

# Білд (компоненти + SDK → dist/)
npm run build
```

## Реліз

Публікація на npm автоматична — пуш у `main` запускає GitHub Action
`Publish to npm`, який збирає й публікує пакет. Руками `npm publish` не запускати.

| Що треба | Що зробити |
| --- | --- |
| Випустити нову версію | Бампнути `version` у `package.json` → змержити в `main` |
| Залити зміни без релізу | Не чіпати `version` — публікація пропуститься, CI лишиться зеленим |
| Опублікувати вручну | Actions → Publish to npm → Run workflow |

Публікація пропускається, якщо версія з `package.json` уже є в реєстрі. Пуші, що
зачіпають лише `**.md` або `.github/**`, воркфлоу не запускають — для них
є ручний запуск.

Поки версію не бампнули, споживачі змін не бачать: npm далі віддає попередню.

## Структура проекту

Організовано за Feature-Sliced Design:

```
src/
├── index.ts           # публічний API (shared/ui + features + sdk)
├── langs/             # словники i18n (fallback для window.lang, використовує SkyTable)
├── components/        # vendored UI-примітиви (shadcn tags-input) для SkyTable
├── shared/
│   ├── assets/
│   │   └── icons/     # SVG-іконки (vite-svg-loader)
│   └── ui/            # базові UI-компоненти
│       ├── index.ts
│       ├── Header/
│       ├── Modal/
│       ├── Dialog/ DialogModal/ DialogNext/
│       ├── BaseTeleport/
│       ├── SkyButton/
│       ├── SkySelect/ SkySelectSearch/ SkyInput/ SkySearchInput/ SkyCheckbox/
│       ├── SkyTabs/     # сегментовані таби з анімованим індикатором
│       ├── SkyAlert/
│       ├── SkyBadge/
│       ├── SkyCard/ SkyCardHeader/ SkyCardRow/
│       ├── SkyLoader/
│       ├── SkyTable/     # віртуал-скрол таблиця (Header/Row/Footer/DynamicScroller/items/*)
│       ├── SkyTileCard/
│       ├── functional-calendar/ # форк vue-functional-calendar, перенесений зі SkyMarket 1:1
│       ├── SkyDateRangePicker/  # DatePickerRange зі SkyMarket, store/langs → props/локальний стан
│       └── <Component>/
│           ├── <Component>.vue
│           └── index.ts
├── features/          # фічові блоки (orchestration shared/ui)
│   ├── index.ts
│   └── SkyCheckboxFilter/
├── sdk/               # TypeScript SDK (без Vue залежностей)
│   ├── bridge.ts      # iframe postMessage API
│   ├── api.ts         # SkyserviceAPI HTTP клієнт
│   ├── webview.ts     # детекція webview/iframe
│   ├── types.ts       # DTO типи (Tradepoint, Category, Product, AppIntegration, PermsMap)
│   └── index.ts
└── styles/
```

## Ліцензія

MIT © Skyservice-POS
