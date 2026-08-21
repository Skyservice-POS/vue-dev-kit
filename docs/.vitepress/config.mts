import { defineConfig } from 'vitepress'
import { fileURLToPath } from 'node:url'
import svgLoader from 'vite-svg-loader'

const pkgVersion = '2.11.0'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'uk-UA',
  title: 'Vue Dev Kit',
  description:
    'Vue 3 компоненти + TypeScript SDK (iframe bridge + HTTP API) для Skyservice mini-apps',
  lastUpdated: true,
  cleanUrls: true,
  ignoreDeadLinks: false,

  // Дозволяємо рендерити живі демо з реальних компонентів бібліотеки:
  // svg-loader (SkyTileCard вантажить .svg), alias @ → src, кастомні web-component теги.
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag.startsWith('sky-'),
      },
      // SkyTable посилається на хостові ассети за абсолютними шляхами
      // (/image/dragons/…, /svg/…) — їх віддає застосунок-хост, не бандлимо.
      transformAssetUrls: { includeAbsolute: false },
    },
  },

  vite: {
    plugins: [svgLoader({ defaultImport: 'url' })],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('../../src', import.meta.url)),
      },
    },
  },

  head: [
    ['meta', { name: 'theme-color', content: '#24973f' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'Vue Dev Kit — документація' }],
    [
      'meta',
      {
        property: 'og:description',
        content:
          'Vue 3 компоненти + TypeScript SDK для Skyservice mini-apps',
      },
    ],
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: undefined,

    nav: [
      { text: 'Вступ', link: '/guide/introduction', activeMatch: '/guide/' },
      {
        text: 'Компоненти',
        link: '/components/overview',
        activeMatch: '/components/',
      },
      { text: 'SDK', link: '/sdk/overview', activeMatch: '/sdk/' },
      {
        text: `v${pkgVersion}`,
        items: [
          {
            text: 'Changelog',
            link: 'https://github.com/Skyservice-POS/vue-dev-kit/releases',
          },
          {
            text: 'npm',
            link: 'https://www.npmjs.com/package/@skyservice-developers/vue-dev-kit',
          },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Вступ',
          collapsed: false,
          items: [
            { text: 'Що це таке', link: '/guide/introduction' },
            { text: 'Швидкий старт', link: '/guide/getting-started' },
            { text: 'Анатомія mini-app', link: '/guide/mini-app' },
          ],
        },
        {
          text: 'Кастомізація',
          collapsed: false,
          items: [
            { text: 'Теми та CSS-змінні', link: '/guide/theming' },
            { text: 'Іконки', link: '/guide/icons' },
          ],
        },
        {
          text: 'Довідка',
          collapsed: false,
          items: [
            { text: 'Публічний API', link: '/guide/public-api' },
            { text: 'Міграція з v1', link: '/guide/migration' },
          ],
        },
      ],

      '/components/': [
        {
          text: 'Компоненти',
          items: [
            { text: 'Галерея — всі компоненти', link: '/components/gallery' },
            { text: 'Огляд', link: '/components/overview' },
          ],
        },
        {
          text: 'Layout',
          collapsed: false,
          items: [
            { text: 'Header', link: '/components/header' },
            { text: 'Modal', link: '/components/modal' },
            { text: 'Dialog', link: '/components/dialog' },
          ],
        },
        {
          text: 'Форми',
          collapsed: false,
          items: [
            { text: 'SkyButton', link: '/components/sky-button' },
            { text: 'SkyInput', link: '/components/sky-input' },
            { text: 'SkySearchInput', link: '/components/sky-search-input' },
            { text: 'SkySelect', link: '/components/sky-select' },
            { text: 'SkySelectSearch', link: '/components/sky-select-search' },
            { text: 'SkyCheckbox', link: '/components/sky-checkbox' },
            { text: 'SkyTabs', link: '/components/sky-tabs' },
          ],
        },
        {
          text: 'Дані та статуси',
          collapsed: false,
          items: [
            { text: 'SkyDataTable (TanStack)', link: '/components/data-table' },
            { text: 'Таблиця — примітиви', link: '/components/table' },
            { text: 'SkyTable', link: '/components/sky-table' },
            { text: 'SkyCard', link: '/components/sky-card' },
            { text: 'SkyTileCard', link: '/components/sky-tile-card' },
            { text: 'SkyAlert', link: '/components/sky-alert' },
            { text: 'SkyBadge', link: '/components/sky-badge' },
            { text: 'SkyLoader', link: '/components/sky-loader' },
          ],
        },
        {
          text: 'Features',
          collapsed: false,
          items: [
            {
              text: 'SkyCheckboxFilter',
              link: '/components/sky-checkbox-filter',
            },
          ],
        },
        {
          text: 'Сповіщення',
          collapsed: false,
          items: [
            { text: 'NotificationElement', link: '/components/notifications' },
          ],
        },
      ],

      '/sdk/': [
        {
          text: 'SDK',
          items: [
            { text: 'Огляд', link: '/sdk/overview' },
            { text: 'Bridge (iframe)', link: '/sdk/bridge' },
            { text: 'SkyserviceAPI', link: '/sdk/api' },
            { text: 'Детекція Webview', link: '/sdk/webview' },
            { text: 'Типи даних', link: '/sdk/types' },
          ],
        },
      ],
    },

    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/Skyservice-POS/vue-dev-kit',
      },
    ],

    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: 'Пошук',
            buttonAriaLabel: 'Пошук',
          },
          modal: {
            noResultsText: 'Нічого не знайдено',
            resetButtonTitle: 'Скинути пошук',
            footer: {
              selectText: 'вибрати',
              navigateText: 'навігація',
              closeText: 'закрити',
            },
          },
        },
      },
    },

    docFooter: {
      prev: 'Попередня',
      next: 'Наступна',
    },

    outline: {
      label: 'На цій сторінці',
      level: [2, 3],
    },

    returnToTopLabel: 'Догори',
    sidebarMenuLabel: 'Меню',
    darkModeSwitchLabel: 'Тема',
    lightModeSwitchTitle: 'Світла тема',
    darkModeSwitchTitle: 'Темна тема',

    editLink: {
      pattern:
        'https://github.com/Skyservice-POS/vue-dev-kit/edit/main/docs/:path',
      text: 'Редагувати цю сторінку на GitHub',
    },

    footer: {
      message: 'Опубліковано під ліцензією MIT.',
      copyright: 'Copyright © 2025-теперішній час Skyservice-POS',
    },
  },
})
