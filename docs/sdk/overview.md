# SDK — огляд

TypeScript SDK — це шар без Vue-залежностей для комунікації mini-app зі світом. Складається з трьох незалежних частин:

| Частина | Що робить | Де працює |
|---------|-----------|-----------|
| [**Bridge**](/sdk/bridge) | `postMessage`-зв'язок із Dashboard | тільки в iframe |
| [**SkyserviceAPI**](/sdk/api) | HTTP-клієнт до Skyservice API | будь-де (браузер, Node, edge) |
| [**Webview**](/sdk/webview) | Детекція iOS/Android/CEF-обгорток | браузер / webview |

## Імпорт

SDK доступний двома шляхами:

```ts
// Без Vue-залежностей — рекомендовано для SDK-only коду
import { navigate, SkyserviceAPI, isInsideIframe } from '@skyservice-developers/vue-dev-kit/sdk'

// З кореня (разом із компонентами)
import { navigate, SkyserviceAPI, isInsideIframe } from '@skyservice-developers/vue-dev-kit'
```

Субпакет `/sdk` не тягне Vue, тож його можна використовувати у воркерах, серверному коді або будь-де поза Vue-застосунком.

## Два канали, дві філософії

**Bridge** і **SkyserviceAPI** вирішують різні задачі й часто використовуються разом:

```ts
import { getToken, getCompany, SkyserviceAPI } from '@skyservice-developers/vue-dev-kit/sdk'

// 1. Bridge дає контекст із Dashboard
const token = await getToken()

// 2. API використовує цей токен для прямих HTTP-запитів
const api = SkyserviceAPI.create({ token, domain: 'api.skyservice.online', companyId, appId })
const tradepoints = await api.getTradepoints()
```

- **Bridge** — асинхронний, залежить від iframe, повертає `null` поза ним. Ідеальний для «дізнатись, хто ми» та «сказати хосту зробити щось».
- **SkyserviceAPI** — звичайний HTTP, кидає помилки при збоях, не залежить від iframe. Ідеальний для роботи з бізнес-даними.

## Поведінка поза iframe

Головна особливість bridge — **безпечна деградація**:

- усі гетери (`getToken`, `getCompany`, …) миттєво резолвляться в `null`;
- усі команди (`navigate`, `notify`, …) стають no-op;
- `isInsideIframe()` повертає `false`.

Це означає, що ваш код на кшталт `const token = await getToken()` не зависне на 5 секунд і не впаде під час локальної розробки — просто отримаєте `null`.

`SkyserviceAPI` натомість працює завжди — йому iframe не потрібен.

## Деталі по частинах

<div class="tip custom-block" style="padding-top: 8px">

- [**Bridge**](/sdk/bridge) — навігація, дані стору, localStorage, сповіщення, підписка на повідомлення.
- [**SkyserviceAPI**](/sdk/api) — торгові точки, категорії, товари, активація додатку.
- [**Webview**](/sdk/webview) — визначення середовища запуску.
- [**Типи**](/sdk/types) — DTO: `Tradepoint`, `Category`, `Product`, `AppIntegration`.

</div>
