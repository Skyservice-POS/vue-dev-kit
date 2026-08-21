# SkyserviceAPI — HTTP-клієнт

Прямі запити до Skyservice API. Працює всюди (браузер, Node, edge) — **не потребує iframe**. На відміну від [bridge](/sdk/bridge), кидає помилки при збоях замість повернення `null`.

```ts
import { SkyserviceAPI, getToken } from '@skyservice-developers/vue-dev-kit/sdk'
```

## Створення інстансу

`SkyserviceAPI.create()` — фабрика. Прямий `new SkyserviceAPI(...)` **недоступний** (конструктор приватний).

```ts
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
```

### `SkyserviceAPIConfig`

| Поле | Тип | Обов'язково | Опис |
|------|-----|-------------|------|
| `token` | `string` | так | Токен доступу (зазвичай з [`getToken()`](/sdk/bridge#зручні-гетери)) |
| `domain` | `string` | так | Домен API. Підрядок `dashboard` автоматично замінюється на `api` |
| `companyId` | `string` | так | Id компанії |
| `appId` | `string` | так | Id додатку |
| `developerId` | `string` | ні | Id розробника (додається в body активації) |
| `deploymentId` | `string` | ні | Разом з `appName` вмикає `sendActiveApp` postMessage |
| `appName` | `string` | ні | Разом з `deploymentId` вмикає `sendActiveApp` postMessage |

::: tip Нормалізація домену
У конструкторі `domain` проходить `.replace('dashboard', 'api')`, а якщо не починається з `http` — до нього додається `https://`. Тобто `dashboard.skyservice.online` стане `https://api.skyservice.online`.
:::

## Методи

### `getTradepoints(options?)`

Усі торгові точки компанії. За замовчуванням **відфільтровує видалені та заморожені** (`deleted`, `frozen`).

```ts
const tradepoints = await api.getTradepoints()
const all = await api.getTradepoints({ includeDeleted: true })
```

| Параметр | Тип | За замовчуванням | Опис |
|----------|-----|------------------|------|
| `options.includeDeleted` | `boolean` | `false` | Не фільтрувати видалені/заморожені |

**Повертає** `Promise<`[`Tradepoint`](/sdk/types#tradepoint)`[]>`.

### `getCategoryTree(tradepointId?)`

Повне дерево категорій, очищене від POS-специфічного «сміття». Повертає лише поля, релевантні для побудови меню: `id`, `pid`, `name`, `active`, `background`, `show`, `img`, `children`.

Якщо передати `tradepointId` — фільтрує категорії, видимі для цієї торгової точки.

```ts
const tree = await api.getCategoryTree()
const forTp = await api.getCategoryTree(902062)
```

| Параметр | Тип | Опис |
|----------|-----|------|
| `tradepointId` | `number` | Фільтрувати за видимістю для точки |

**Повертає** `Promise<`[`Category`](/sdk/types#category)`[]>` (дерево, `children` вкладені рекурсивно).

### `getProducts(options?)`

Товари, очищені від POS-специфічних полів. За замовчуванням **відфільтровує інгредієнти** — повертає лише продавані позиції (`type` = `product` або `techcard`) і лише активні.

```ts
const products = await api.getProducts()
const forTp = await api.getProducts({ tradepointId: 902062 })
const withInactive = await api.getProducts({ includeInactive: true })
```

| Параметр | Тип | За замовчуванням | Опис |
|----------|-----|------------------|------|
| `options.tradepointId` | `number` | — | Обмежити конкретною точкою |
| `options.includeInactive` | `boolean` | `false` | Включити неактивні товари |

**Повертає** `Promise<`[`Product`](/sdk/types#product)`[]>`.

### `setAppActive({ isActive, title?, settings? })`

Активувати або деактивувати mini-app для поточної компанії.

```ts
// Активація
await api.setAppActive({ isActive: true, title: 'Glovo', settings: { foo: 'bar' } })

// Деактивація
await api.setAppActive({ isActive: false, title: 'Glovo' })
```

| Параметр | Тип | Опис |
|----------|-----|------|
| `isActive` | `boolean` | `true` → активувати, `false` → деактивувати |
| `title` | `string` | Назва (йде в `sendActiveApp` postMessage) |
| `settings` | `Record<string, unknown>` | Налаштування — надсилаються **тільки** при активації |

**Повертає** `Promise<`[`AppIntegration`](/sdk/types#appintegration)`>`.

Технічні деталі:

- POST на `https://api.cabinet.developer.skyservice.online/index.php`.
- `isActive: true` → `section=integrations&action=activateApp`; `false` → `deactivateApp`.
- Якщо в конфізі задані **обидва** `deploymentId` і `appName` **та** ми в iframe — додатково шле `sendActiveApp` postMessage у parent (Dashboard) з відповіддю сервера й новим станом.

### `getPerms(code?)`

Права доступу поточного користувача. Без аргументу повертає всю мапу, з кодом — булеве значення для нього.

```ts
await api.getPerms('9006') // → boolean — чи надано право 9006
await api.getPerms()       // → PermsMap: { '9006': true, '100': false, ... }
api.clearPermsCache()      // скинути кеш — наступний виклик перезапросить джерело
```

**Повертає** `Promise<boolean>` (з кодом) або `Promise<`[`PermsMap`](/sdk/types)`>` (без нього).

Джерело даних береться за пріоритетом:

1. **Стор Dashboard** через iframe bridge (`store.perms`) — миттєво, без токена, працює всередині iframe;
2. **HTTP fallback** `section=adminPanel&action=getStart` → `data.settings.perms` — поза iframe (standalone-сторінка, Node) або поки стор ще порожній.

::: tip Кеш і нормалізація
Результат кешується на інстансі — повторні виклики не роблять зайвих запитів і postMessage. Значення нормалізуються в `boolean` (бек може віддавати `0/1`), а відсутній код завжди означає `false`.
:::

## Обробка помилок

Методи кидають `Error` у двох випадках:

- HTTP-статус не `ok` → `Skyservice API error: <status>`;
- тіло відповіді має `status !== 'done'` → `Skyservice API returned status: <status>`.

```ts
try {
  const tradepoints = await api.getTradepoints()
} catch (e) {
  console.error('Не вдалося завантажити точки:', e.message)
}
```

## Повний приклад

```ts
import { SkyserviceAPI, getToken, getCompany, notifyError } from '@skyservice-developers/vue-dev-kit/sdk'

async function loadCatalog(companyId: string, appId: string) {
  const token = await getToken()
  if (!token) throw new Error('Немає токена')

  const api = SkyserviceAPI.create({
    token,
    domain: 'api.skyservice.online',
    companyId,
    appId,
  })

  try {
    const tradepoints = await api.getTradepoints()
    const firstTp = tradepoints[0]?.tradepointId

    const [categories, products] = await Promise.all([
      api.getCategoryTree(firstTp),
      api.getProducts({ tradepointId: firstTp }),
    ])

    return { tradepoints, categories, products }
  } catch (e) {
    notifyError('Помилка завантаження каталогу')
    throw e
  }
}
```

## Далі

- [Типи даних](/sdk/types) — структура `Tradepoint`, `Category`, `Product`, `AppIntegration`.
- [Bridge](/sdk/bridge) — звідки взяти `token` і `companyId`.
