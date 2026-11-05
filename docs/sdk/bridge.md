# Bridge — комунікація з Dashboard

Mini-app працює в `<iframe>` усередині Dashboard. **Bridge** обгортає нативний `window.postMessage` типізованими функціями: навігація, читання даних хоста, сповіщення, дії.

```ts
import {
  navigate, goBack, exit, getBack,
  getStoreData, getLocalStorageData, getWindowData,
  getCompany, getUser, getToken, getLang, getProductCategories,
  setLocalStorage, setRocketMode,
  trackVisit, openExternalLink, openCrispChat,
  notify, notifyError, notifyWarn,
  isInsideIframe, isInIframe, onMessage,
  setSenderId, getSenderId,
  openModal, getModals,
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

### `goBack()`

Попросити Dashboard зробити крок назад по **його** історії переходів — туди, звідки користувач прийшов.

Mini-app в iframe не бачить URL батька, тому не може обчислити це сам: історію веде Dashboard (`src/navHistory.js`), він же й виконує перехід. Саме це викликає кнопка «Назад» у [`Header`](/components/header), коли їй не передали `backEvent`.

```ts
if (!(await goBack())) exit() // старий Dashboard про `back` не знає — виходимо на головну
```

| Параметр | Тип | За замовчуванням | Опис |
|----------|-----|------------------|------|
| `timeout` | `number` | `700` | Скільки мс чекати підтвердження від Dashboard |

Резолвиться в `true`, коли Dashboard підтвердив крок назад, і в `false` — коли додаток відкритий поза iframe або хост не відповів за `timeout`.

::: tip Потрібен Dashboard із підтримкою `back`
Старіші збірки хоста це повідомлення ігнорують — тоді `goBack()` віддає `false` через `timeout`, і треба самому вирішити, що робити далі (зазвичай `exit()`).
:::

### `exit()` / `getBack()`

Вийти з поточного mini-app на головну Dashboard. `getBack` — alias для `exit`.

```ts
exit()
```

Це не «назад», а саме «закрити застосунок»: веде на головну незалежно від того, звідки користувач зайшов. Для кроку назад — [`goBack()`](#goback).

## Модалки Dashboard

Документи — надходження, інвентаризацію, переміщення — проводять форми Dashboard. Mini-app не
копіює їх у себе, а просить Dashboard відкрити свою модалку **поверх iframe**, одразу заповнену:
точка, склад, документ-підстава. Iframe при цьому не вивантажується — стан застосунку лишається.

Ззовні відкривається лише ключ із реєстру Dashboard (`src/modals/registry.js`). Каталог ключів і
їхніх параметрів — тип `DashboardModals`.

### `openModal(key, context, params, options?)`

```ts
const result = await openModal(
  'coming.create',
  { tradepointId: order.tradepointId },
  { warehouseId: order.warehouseId, supplierOrderId: order.orderId },
)

if (result.status === 'done') reloadOrder()   // result.data.documentId — новий документ
```

| Параметр | Тип | Опис |
|----------|-----|------|
| `key` | `DashboardModalKey` | Ключ модалки, напр. `'coming.create'` |
| `context` | `DashboardModals[K]['context']` | Контекст; `tradepointId` Dashboard ставить поточною точкою на час модалки й потім повертає попередню |
| `params` | `DashboardModals[K]['params']` | Параметри модалки. Передавайте **ідентифікатори, а не знімки даних**: товари й ціни модалка підтягує сама |
| `options.ackTimeout` | `number` | Скільки мс чекати підтвердження, типово `1500` |

Промис **не відхиляється** і резолвиться, коли модалку закрили:

| `status` | Коли | Поля |
|----------|------|------|
| `done` | Документ створено / змінено | `data` — дані ключа, для `coming.create` — `{ documentId }` |
| `cancelled` | Закрили без результату | — |
| `error` | Модалка відкрилась, але дія неможлива | `reason`; для `create_failed` ще `error?` (код бека) і `message?` (текст Dashboard) |
| `refused` | Модалку не відкрито | `reason`, `field?` |

Причини `error`: `order_unavailable` (замовлення закрили чи скасували, поки форма була відкрита),
`create_failed` (бек не провів документ — модалка закривається, `error` і `message` кажуть чому).
Покажіть `message`, а без нього — свій загальний текст; `error` — для логів чи власних текстів за кодом.

Причини `refused`: `not_in_iframe`, `no_response` (Dashboard не підтвердив — старий), `unknown_modal`,
`no_permissions`, `invalid_params` (з `field`, напр. `params.warehouseId`), `busy` (уже відкрита інша модалка).

Протокол: `openModal` → одразу `DATA_RESPONSE` з `{ ok: true }` або `{ ok: false, reason, field? }` →
після закриття `modalClosed { requestId, status, data }`.

### Каталог

| Ключ | `context` | `params` | `data` при `done` |
|------|-----------|----------|-------------------|
| `coming.create` | `{ tradepointId }` | `warehouseId`, `supplierOrderId?`, `supplierId?`, `comment?` | `{ documentId: number \| null }` |

`coming.create` із `supplierOrderId` заповнює надходження із замовлення постачальнику: решта до
отримання, ціни, постачальник; точка, склад і замовлення заблоковані.

### `getModals(timeout?)`

Які ключі є в цьому Dashboard і чи дозволені користувачу — щоб вирішити, чи показувати кнопку.

```ts
const modals = await getModals()
const canCreateReceipt = !!modals?.['coming.create']?.allowed
```

Резолвиться в `null` поза iframe або коли Dashboard не відповів (старий, про модалки не знає).

::: tip Потрібен Dashboard із реєстром модалок
Старіші збірки хоста `openModal` ігнорують — тоді `openModal` віддає `refused` / `no_response`, а
`getModals` — `null`.
:::

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
