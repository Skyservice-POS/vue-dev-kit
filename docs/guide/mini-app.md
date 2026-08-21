# Анатомія mini-app

Skyservice mini-app — це самостійний Vue 3 застосунок, який відкривається в `<iframe>` усередині Dashboard Skyservice. Ця сторінка пояснює, як влаштована взаємодія і де які частини `vue-dev-kit` вступають у гру.

## Загальна схема

```
┌─────────────────────────────────────────────┐
│  Skyservice Dashboard (host)                 │
│                                              │
│   window.postMessage ▲   │ postMessage       │
│                      │   ▼                   │
│   ┌──────────────────────────────────────┐  │
│   │  <iframe>  ваш mini-app              │  │
│   │                                      │  │
│   │   Bridge  ──►  navigate / getToken   │  │
│   │   Компоненти ──► Header / Modal ...   │  │
│   │   SkyserviceAPI ──► HTTP ──► api.*    │  │
│   └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
             │ HTTP (напряму, повз iframe)
             ▼
      api.skyservice.online
```

Є **два незалежні канали** комунікації:

1. **Bridge (postMessage)** — двосторонній зв'язок з Dashboard. Тільки в iframe. → [SDK / Bridge](/sdk/bridge)
2. **SkyserviceAPI (HTTP)** — прямі запити до Skyservice API. Працює будь-де. → [SDK / API](/sdk/api)

## Типовий життєвий цикл

### 1. Стартап: дізнатись, хто ми

При завантаженні mini-app зазвичай треба отримати токен і контекст компанії з Dashboard:

```ts
import { getToken, getCompany, getLang, isInsideIframe } from '@skyservice-developers/vue-dev-kit/sdk'

if (isInsideIframe()) {
  const token = await getToken()      // string | null
  const company = await getCompany()  // { ... } | null
  const lang = await getLang()         // 'uk' | 'en' | ... | null
}
```

Усі гетери повертають `Promise<T | null>` і завершуються `null` при таймауті (5 с) або поза iframe — тож логіку старту варто будувати захищено.

### 2. Робота: запити до API

Маючи токен, створюємо HTTP-клієнт і працюємо з бізнес-даними напряму (повз iframe):

```ts
import { SkyserviceAPI } from '@skyservice-developers/vue-dev-kit/sdk'

const api = SkyserviceAPI.create({
  token,
  domain: 'api.skyservice.online',
  companyId,
  appId,
})

const tradepoints = await api.getTradepoints()
```

### 3. UI: рідний вигляд

Обгортаємо сторінку в `Header` (він автоматично керує rocket-mode), використовуємо компоненти для форм і карток:

```vue
<Header title="Товари" :dropdown-items="recentPages" @navigate="goTo">
  <SkyButton variant="primary" @click="add">+ Додати</SkyButton>
</Header>
```

→ [Header](/components/header) шле `setRocketMode` при монтуванні й відновлює стан при розмонтуванні.

### 4. Фідбек: сповіщення

Два способи показати сповіщення:

- **Через Dashboard** (нативний тост хоста): `notify('Збережено')` з bridge.
- **Власний тост** усередині mini-app: `notificationModule.notify.success(...)`.

```ts
import { notify } from '@skyservice-developers/vue-dev-kit/sdk'
notify('Збережено')          // тост Dashboard
notifyError('Щось зламалось') // тост-помилка Dashboard
```

→ [Bridge / Сповіщення](/sdk/bridge#сповіщення) та [NotificationElement](/components/notifications).

### 5. Навігація та вихід

```ts
import { navigate, exit } from '@skyservice-developers/vue-dev-kit/sdk'

navigate('/products/42') // Dashboard змінює роут
exit()                    // вийти з mini-app на головну Dashboard
```

## Rocket mode

`rocketMode` — це «повноекранний» режим Dashboard (сховані сайдбар/хедер хоста). Керується двома шляхами:

- Компонент [`Header`](/components/header) вмикає його при монтуванні (`setRocketMode(true)`) і вимикає при розмонтуванні.
- [`Dialog`](/components/dialog) без явного `mode` читає URL-параметр `?rocketMode=` і обирає стиль (`next` або `classic`) автоматично.

## Poза iframe (локальна розробка)

Під час локальної розробки mini-app найчастіше відкритий **не** в iframe. Тоді:

- `isInsideIframe()` → `false`;
- усі гетери bridge миттєво резолвляться в `null` (без 5-секундного очікування);
- `navigate`/`exit`/`notify` — просто no-op (повідомлення нікому слухати);
- **компоненти й `SkyserviceAPI` працюють як завжди** — вони не залежать від iframe.

Тобто mini-app лишається повністю функціональним для розробки UI та роботи з API; специфічна для Dashboard поведінка просто «мовчить».

## Далі

- [SDK / Bridge](/sdk/bridge) — повний перелік функцій зв'язку.
- [SDK / API](/sdk/api) — методи HTTP-клієнта.
- [SDK / Webview](/sdk/webview) — детекція iOS/Android/CEF-обгорток.
