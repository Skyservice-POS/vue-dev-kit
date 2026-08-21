# Публічний API

Повний перелік того, що експортує пакет. Усе доступне з кореня `@skyservice-developers/vue-dev-kit`; SDK-частина додатково доступна з `/sdk` без Vue-залежностей.

## Компоненти (shared/ui)

| Export | Опис | Сторінка |
|--------|------|----------|
| `Header` | Шапка сторінки з back-кнопкою і дропдауном | [→](/components/header) |
| `Modal` | Модальне вікно з оверлеєм | [→](/components/modal) |
| `Dialog` | Повноекранний діалог (next / classic) | [→](/components/dialog) |
| `DialogModal` | Внутрішній варіант діалогу (classic) | [→](/components/dialog) |
| `DialogNext` | Внутрішній варіант діалогу (next) | [→](/components/dialog) |
| `BaseTeleport` | Обгортка-teleport у `<body>` | — |
| `SkyButton` | Кнопка з варіантами і станами | [→](/components/sky-button) |
| `SkyInput` | Текстовий інпут зі станами | [→](/components/sky-input) |
| `SkySearchInput` | Поле пошуку з очищенням і `collapsible` | [→](/components/sky-search-input) |
| `SkySelect` | Кастомний select | [→](/components/sky-select) |
| `SkySelectSearch` | Select із пошуком у дропдауні | [→](/components/sky-select-search) |
| `SkyCheckbox` | Чекбокс / switch | [→](/components/sky-checkbox) |
| `SkyTabs` | Сегментовані таби з анімованим індикатором | [→](/components/sky-tabs) |
| `SkyTable` | Віртуал-скрол таблиця | [→](/components/sky-table) |
| `SkyAlert` | Інформаційне повідомлення | [→](/components/sky-alert) |
| `SkyBadge` | Статус-лейбл | [→](/components/sky-badge) |
| `SkyLoader` | Фірмовий лоадер | [→](/components/sky-loader) |
| `SkyCard` | Shell-контейнер картки | [→](/components/sky-card) |
| `SkyCardHeader` | Шапка картки | [→](/components/sky-card) |
| `SkyCardRow` | Рядок label + value | [→](/components/sky-card) |
| `SkyTileCard` | Тайл-картка | [→](/components/sky-tile-card) |

## Features

| Export | Опис | Сторінка |
|--------|------|----------|
| `SkyCheckboxFilter` | Кнопка-фільтр з дропдауном і мульти-вибором | [→](/components/sky-checkbox-filter) |

## SDK (також доступне з `/sdk`)

### Bridge

`navigate`, `exit`, `getBack`, `getStoreData`, `getLocalStorageData`, `getWindowData`, `getCompany`, `getUser`, `getToken`, `getLang`, `getProductCategories`, `setLocalStorage`, `setRocketMode`, `trackVisit`, `openExternalLink`, `openCrispChat`, `notify`, `notifyError`, `notifyWarn`, `isInsideIframe`, `isInIframe`, `onMessage`, `setSenderId`, `getSenderId`

→ [SDK / Bridge](/sdk/bridge)

### API

`SkyserviceAPI` · тип `SkyserviceAPIConfig`

→ [SDK / API](/sdk/api)

### Webview

`webviewCheck`, `isWebview`, `isIosWebview`, `isAndroidWebview`, `isCefWebview` · тип `WebviewType`

→ [SDK / Webview](/sdk/webview)

### Типи

`Tradepoint`, `TradepointWorkDay`, `Category`, `RawCategory`, `Product`, `RawProduct`, `AppIntegration`, `PermsMap`

→ [SDK / Типи](/sdk/types)

## sky-service-ui-components (re-export)

| Export | Опис | Сторінка |
|--------|------|----------|
| `NotificationElement` | Web Component для тостів | [→](/components/notifications) |
| `notificationModule` | Програмний API тостів | [→](/components/notifications) |
| `globalStore` | Глобальний Pinia-стор бібліотеки | [→](/components/notifications) |

Бібліотека re-export-ує **весь** публічний API `sky-service-ui-components` та його `/modules`, тож окремо ставити цей пакет не потрібно.

## Entry-points

| Специфікатор | Вміст |
|--------------|-------|
| `@skyservice-developers/vue-dev-kit` | Усе вище |
| `@skyservice-developers/vue-dev-kit/sdk` | Тільки SDK (bridge + API + webview + типи) |
| `@skyservice-developers/vue-dev-kit/style.css` | CSS усіх компонентів |
| `@skyservice-developers/vue-dev-kit/vue3` | Alias на корінь (legacy v1) |
