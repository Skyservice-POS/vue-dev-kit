# Детекція Webview

Утиліти для визначення середовища, у якому запущено mini-app: iOS-webview, Android-webview, CEF-webview чи звичайний браузер. Під капотом використовує `ua-parser-js` та перевірку глобальних об'єктів.

```ts
import {
  webviewCheck,
  isWebview,
  isIosWebview,
  isAndroidWebview,
  isCefWebview,
} from '@skyservice-developers/vue-dev-kit/sdk'
import type { WebviewType } from '@skyservice-developers/vue-dev-kit/sdk'
```

## `webviewCheck()`

Базова функція. Повертає тип середовища:

```ts
type WebviewType = 'ios_webview' | 'android_webview' | 'cef_webview' | 'browser'

const env = webviewCheck() // напр. 'ios_webview'
```

### Як визначається

| Результат | Умова |
|-----------|-------|
| `ios_webview` | Є `window.webkit.messageHandlers` **і** `ua-parser` бачить браузер `WebKit` |
| `android_webview` | Визначено глобальний `Android` |
| `cef_webview` | Визначено `window.cefQuery` |
| `browser` | Жодне з вище (також коли `window` недоступний — SSR) |

Перевірки виконуються саме в цьому порядку.

## Хелпери

Зручні булеві обгортки над `webviewCheck()`:

| Функція | Еквівалент |
|---------|------------|
| `isIosWebview()` | `webviewCheck() === 'ios_webview'` |
| `isAndroidWebview()` | `webviewCheck() === 'android_webview'` |
| `isCefWebview()` | `webviewCheck() === 'cef_webview'` |
| `isWebview()` | `webviewCheck() !== 'browser'` |

```ts
if (isWebview()) {
  // будь-яка мобільна/desktop-обгортка
}

if (isIosWebview()) {
  // специфіка iOS
}
```

## Приклад: адаптація поведінки

```ts
import { webviewCheck } from '@skyservice-developers/vue-dev-kit/sdk'

switch (webviewCheck()) {
  case 'ios_webview':
    // напр. інша обробка safe-area
    break
  case 'android_webview':
    // напр. апаратна кнопка «назад»
    break
  case 'cef_webview':
    // desktop-обгортка (CEF)
    break
  case 'browser':
    // звичайний браузер
    break
}
```

## Webview vs iframe

Не плутайте дві незалежні перевірки:

- [`isInsideIframe()`](/sdk/bridge#утиліти) — чи вікно всередині `<iframe>` (де живе [bridge](/sdk/bridge)).
- `isWebview()` — чи хост-браузер є мобільною/desktop-обгорткою.

Mini-app може бути **одночасно** в iframe і в webview (Dashboard, відкритий у мобільному застосунку Skyservice).

## SSR-безпека

`webviewCheck()` перевіряє `typeof window === 'undefined'` і повертає `'browser'` на сервері — можна безпечно викликати в універсальному коді.
