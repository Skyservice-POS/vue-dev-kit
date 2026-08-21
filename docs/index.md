---
layout: home

hero:
  name: Vue Dev Kit
  text: Тулкіт для Skyservice mini-apps
  tagline: Vue 3 компоненти + типізований TypeScript SDK (iframe bridge + HTTP API) в одному пакеті.
  actions:
    - theme: brand
      text: Швидкий старт
      link: /guide/getting-started
    - theme: alt
      text: Компоненти
      link: /components/overview
    - theme: alt
      text: SDK
      link: /sdk/overview

features:
  - icon: 🧩
    title: 21 UI-компонент
    details: Кнопки, селекти, інпути, таби, віртуал-скрол таблиця, картки, модалки, діалоги, лоадер, бейджі — готові до продакшену, з єдиним фірмовим стилем Skyservice.
    link: /components/overview
    linkText: Переглянути всі
  - icon: 🔌
    title: Bridge для iframe
    details: Типізована обгортка над postMessage для комунікації mini-app із Dashboard — навігація, токени, дані стору, сповіщення.
    link: /sdk/bridge
    linkText: Дізнатись більше
  - icon: 🌐
    title: SkyserviceAPI
    details: HTTP-клієнт до Skyservice API. Працює будь-де — браузер, Node, edge. Торгові точки, категорії, товари, активація додатку.
    link: /sdk/api
    linkText: API-довідник
  - icon: 🎨
    title: Тематизація через CSS
    details: Кожен компонент кастомізується через CSS-змінні. Перевизначайте кольори, радіуси та відступи глобально або локально.
    link: /guide/theming
    linkText: Як налаштувати
  - icon: 📦
    title: Два entry-points
    details: Імпортуйте все разом або тільки SDK без Vue-залежностей через /sdk. Повна підтримка TypeScript та tree-shaking.
    link: /guide/public-api
    linkText: Публічний API
  - icon: 🔔
    title: Сповіщення з коробки
    details: Re-export sky-service-ui-components — тости через Web Component NotificationElement і програмний notificationModule.
    link: /components/notifications
    linkText: Сповіщення
---

## Встановлення

```bash
npm install @skyservice-developers/vue-dev-kit
```

```ts
import '@skyservice-developers/vue-dev-kit/style.css'
import { SkyButton, Modal, navigate, SkyserviceAPI } from '@skyservice-developers/vue-dev-kit'
```

<div style="margin-top: 2rem; padding: 1rem 1.25rem; border: 1px solid var(--vp-c-divider); border-radius: 12px; background: var(--vp-c-bg-soft);">

**Нове тут?** Почніть із [Швидкого старту](/guide/getting-started) → підключіть [компоненти](/components/overview) → інтегруйтесь із Dashboard через [SDK Bridge](/sdk/bridge).

</div>
