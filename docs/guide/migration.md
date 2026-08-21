# Міграція з v1

`v2.0.0` містить breaking changes. Ця сторінка допоможе перейти з v1.

## Що змінилось

### 1. Vue 2 більше не підтримується

Пакет тепер вимагає **Vue 3.4+**. Підтримку Vue 2 повністю прибрано.

```json
// peerDependencies
"vue": "^3.4.0"
```

Якщо ваш проєкт ще на Vue 2 — залишайтесь на v1 або мігруйте застосунок на Vue 3.

### 2. З'явився повноцінний SDK

Раніше SDK публікувався як окремий пакет **`skyservice-sdk`** (тепер задепрекейчено). Тепер `bridge` + `SkyserviceAPI` входять у `vue-dev-kit`:

```ts
// Було (окремий пакет)
import { navigate } from 'skyservice-sdk'

// Стало
import { navigate } from '@skyservice-developers/vue-dev-kit/sdk'
// або з кореня
import { navigate } from '@skyservice-developers/vue-dev-kit'
```

### 3. Старі utils замінені типізованим SDK

`shared/utils/parentBridge` та `shared/utils/webviewCheck` більше не існують — їх замінив типізований SDK.

```ts
// Було
import { parentBridge } from '.../shared/utils/parentBridge'
import { webviewCheck } from '.../shared/utils/webviewCheck'

// Стало
import { navigate, getToken /* ... */ } from '@skyservice-developers/vue-dev-kit/sdk'
import { webviewCheck } from '@skyservice-developers/vue-dev-kit/sdk'
```

## Чек-лист міграції

1. Оновіть Vue до 3.4+.
2. Видаліть залежність `skyservice-sdk`, якщо була.
3. Замініть імпорти `parentBridge` / `webviewCheck` на `@skyservice-developers/vue-dev-kit/sdk`.
4. Переконайтесь, що `style.css` імпортується з нового пакета.
5. Перевірте, що всі виклики bridge очікують `Promise<T | null>` (гетери можуть повертати `null`).

## Alias /vue3

Шлях `@skyservice-developers/vue-dev-kit/vue3` навмисно залишено як alias на корінь — старі імпорти з v1 продовжать працювати. Проте нові проєкти мають імпортувати з кореня `@skyservice-developers/vue-dev-kit`.

```ts
// Обидва рядки еквівалентні
import { SkyButton } from '@skyservice-developers/vue-dev-kit/vue3'
import { SkyButton } from '@skyservice-developers/vue-dev-kit'
```

## Далі

- [Публічний API](/guide/public-api) — актуальний перелік експортів.
- [SDK / Bridge](/sdk/bridge) — нові типізовані функції зв'язку.
