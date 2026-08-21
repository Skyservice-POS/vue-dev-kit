# Що це таке

**`@skyservice-developers/vue-dev-kit`** — це developer toolkit для розробки Skyservice mini-apps. Пакет об'єднує дві речі, які раніше жили окремо:

1. **UI-компоненти на Vue 3** — набір готових компонентів (кнопки, селекти, картки, модалки, діалоги тощо) з єдиним фірмовим стилем Skyservice.
2. **TypeScript SDK** — типізований шар для комунікації mini-app із Dashboard (iframe bridge) та прямих запитів до Skyservice API (HTTP-клієнт).

Пакет побудований за методологією **Feature-Sliced Design** і публікується як ESM + CJS з повними TypeScript-типами.

## Для чого це

Skyservice mini-app — це окремий Vue-додаток, який рендериться в `<iframe>` всередині Dashboard Skyservice. Щоб такий додаток виглядав рідним і міг взаємодіяти з хостом, йому потрібні:

- **однаковий візуальний стиль** — щоб компоненти не «випадали» з дизайну кабінету;
- **канал зв'язку з Dashboard** — отримати токен, дані компанії, показати сповіщення, змінити роут;
- **доступ до бізнес-даних** — торгові точки, категорії, товари.

`vue-dev-kit` закриває всі три потреби одним пакетом.

## Що входить

| Шар | Що це | Куди далі |
|-----|-------|-----------|
| **shared/ui** | 17 базових компонентів | [Компоненти](/components/overview) |
| **features** | Складені блоки (напр. фільтр з мульти-вибором) | [SkyCheckboxFilter](/components/sky-checkbox-filter) |
| **sdk** | Bridge + HTTP API + webview-детекція (без Vue) | [SDK](/sdk/overview) |
| **sky-service-ui-components** | Re-export тостів та сторів | [Сповіщення](/components/notifications) |

## Ключові принципи

- **Vue 3.4+ only** — Vue 2 не підтримується (див. [Міграцію з v1](/guide/migration)).
- **SDK без Vue-залежностей** — імпортуйте `/sdk` окремо в будь-якому середовищі (Node, edge, воркери).
- **Типізація всюди** — усі функції bridge та методи API мають строгі типи, DTO задекларовані в [`sdk/types`](/sdk/types).
- **Кастомізація через CSS-змінні** — жодних пропсів для кольорів, усе через [теми](/guide/theming).
- **Graceful degradation** — гетери bridge повертають `Promise<T | null>`, тож поза iframe додаток не падає.

## Далі

<div class="tip custom-block" style="padding-top: 8px">

Переходьте до [Швидкого старту](/guide/getting-started) — встановлення, підключення стилів і перший компонент за 2 хвилини.

</div>
