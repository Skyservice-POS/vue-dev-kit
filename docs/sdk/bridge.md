# Bridge — комунікація з Dashboard

Mini-app працює в `<iframe>` усередині Dashboard. **Bridge** обгортає нативний `window.postMessage` типізованими функціями: навігація, читання даних хоста, сповіщення, дії.

```ts
import {
  navigate, exit, getBack,
  getStoreData, getLocalStorageData, getWindowData,
  getCompany, getUser, getToken, getLang, getProductCategories,
  setLocalStorage, setRocketMode,
  trackVisit, openExternalLink, openCrispChat,
  notify, notifyError, notifyWarn,
  isInsideIframe, isInIframe, onMessage,
  setSenderId, getSenderId,
} from '@skyservice-developers/vue-dev-kit/sdk'
```

## Модель роботи

Bridge шле повідомлення батьківському вікну через `window.parent.postMessage(msg, '*')`. Кожне повідомлення доповнюється полями `sender` (id вашого mini-app) і `target` (за замовчуванням `'DASHBOARD'`).

**Гетери** (`getStoreData`, `getToken`, …) працюють за request/response-схемою: шлють `DATA_REQUEST` із унікальним `requestId` і чекають на `DATA_RESPONSE`. Якщо відповіді немає за **5 секунд** — резолвляться в `null`.

::: warning Усі гетери повертають `Promise<T | null>`
`null` приходить при таймауті **або** якщо додаток відкритий поза iframe. Це не помилка — `await` не ламається, просто перевіряйте результат.
:::

## Навігація

### `navigate(path)`

Змінити роут Dashboard.

```ts
navigate('/products/42')
```

| Параметр | Тип | Опис |
|----------|-----|------|
| `path` | `string` | Шлях, на який перейде Dashboard |

### `exit()` / `getBack()`

Вийти з поточного mini-app на головну Dashboard. `getBack` — alias для `exit`.

```ts
exit()
```

## Читання даних хоста

Три низькорівневі гетери читають значення з різних джерел Dashboard за ключем:

### `getStoreData<T>(key)`

Значення з Vuex-стору Dashboard за dot-нотацією ключа.

```ts
const company = await getStoreData('company')
const nested = await getStoreData<number>('user.settings.limit')
```

### `getLocalStorageData<T>(key)`

Значення з `localStorage` Dashboard.

```ts
const token = await getLocalStorageData<string>('token')
```

### `getWindowData<T>(key)`

Значення з об'єкта `window` Dashboard.

```ts
const flag = await getWindowData<boolean>('someGlobalFlag')
```

Усі три повертають `Promise<T | null>`.

## Зручні гетери

Готові обгортки над трьома вище — для найчастіших даних:

| Функція | Джерело | Повертає |
|---------|---------|----------|
| `getCompany()` | `store.company` | `Promise<Record<string, unknown> \| null>` |
| `getUser()` | `store.user` | `Promise<Record<string, unknown> \| null>` |
| `getToken()` | `localStorage.token` | `Promise<string \| null>` |
| `getLang()` | `localStorage.lang` | `Promise<string \| null>` |
| `getProductCategories()` | `store.productCategories` | `Promise<unknown[] \| null>` |

```ts
const token = await getToken()
const company = await getCompany()
const lang = await getLang()
```

## Дії

Односторонні команди (без відповіді):

### `setLocalStorage(key, value)`

Записати значення в `localStorage` Dashboard.

```ts
setLocalStorage('userPref', { theme: 'dark' })
```

### `setRocketMode(value)`

Увімкнути/вимкнути rocket-mode (повноекранний режим) Dashboard.

```ts
setRocketMode(true)
```

::: tip
Компонент [`Header`](/components/header) робить це автоматично при монтуванні/розмонтуванні — вручну викликати зазвичай не потрібно.
:::

### `trackVisit(name, path?)`

Зафіксувати відвідування сторінки для аналітики.

```ts
trackVisit('Товари', '/products')
```

### `openExternalLink(url)`

Відкрити зовнішнє посилання (коректно обробляє webview-мости).

```ts
openExternalLink('https://skyservice.online')
```

### `openCrispChat()`

Відкрити чат підтримки Crisp.

```ts
openCrispChat()
```

## Сповіщення

Показати нативний тост **у Dashboard** (не всередині mini-app):

| Функція | Вигляд |
|---------|--------|
| `notify(text)` | Успіх |
| `notifyError(text)` | Помилка |
| `notifyWarn(text)` | Попередження |

```ts
notify('Збережено')
notifyError('Не вдалося зберегти')
notifyWarn('Перевірте дані')
```

::: tip Два види сповіщень
`notify*` з bridge показує тост **хоста** (Dashboard). Якщо потрібен власний тост усередині mini-app — використовуйте [`notificationModule`](/components/notifications).
:::

## Утиліти

### `isInsideIframe()` / `isInIframe()`

Чи запущено вікно в iframe (безпечно для cross-origin). `isInIframe` — alias.

```ts
if (isInsideIframe()) {
  const token = await getToken()
}
```

Повертає `boolean`. Реалізовано через `window.self !== window.top`; при cross-origin винятку повертає `true`.

### `onMessage(callback)`

Слухати сирі повідомлення від Dashboard. Повертає функцію-відписку.

```ts
const off = onMessage((data) => {
  console.log('Від Dashboard:', data)
})

// пізніше
off()
```

Викликається лише для повідомлень, де `data.sender === 'DASHBOARD'`.

### `setSenderId(id)` / `getSenderId()`

Керування id відправника — Dashboard використовує його, щоб маршрутизувати відповіді правильному mini-app.

```ts
setSenderId('my-app-instance')
const id = getSenderId() // якщо не задано — згенерується випадковий 'APP_xxxxxxxx'
```

За замовчуванням `getSenderId()` при першому виклику згенерує випадковий id вигляду `APP_ab12cd34`.

## Повний приклад

```ts
import {
  isInsideIframe, getToken, getCompany, getLang,
  navigate, notify, onMessage,
} from '@skyservice-developers/vue-dev-kit/sdk'

async function bootstrap() {
  if (!isInsideIframe()) {
    console.warn('Поза iframe — працюємо в dev-режимі')
    return
  }

  const [token, company, lang] = await Promise.all([
    getToken(),
    getCompany(),
    getLang(),
  ])

  if (!token) {
    notify('Не вдалося отримати токен')
    return
  }

  const off = onMessage((data) => {
    if (data?.type === 'refresh') location.reload()
  })

  return { token, company, lang, cleanup: off }
}
```

## Далі

- [SkyserviceAPI](/sdk/api) — використати отриманий токен для HTTP-запитів.
- [Webview](/sdk/webview) — визначити середовище запуску.
