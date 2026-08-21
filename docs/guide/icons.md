# Іконки

SVG-іконки бібліотеки лежать у `src/shared/assets/icons/`. Збірка відбувається через [`vite-svg-loader`](https://github.com/jpkleemans/vite-svg-loader), який за замовчуванням повертає **URL**, але дозволяє імпортувати SVG і як Vue-компонент, і як сирий рядок.

## Три формати імпорту

### URL (за замовчуванням)

Підходить для `<img :src>`:

```ts
import iconUrl from '@/shared/assets/icons/home.svg'
```

```vue
<img :src="iconUrl" alt="home" />
```

### Vue-компонент

Для inline-SVG, який можна стилізувати через `currentColor`, керувати розміром і кольором з CSS:

```ts
import IconHome from '@/shared/assets/icons/home.svg?component'
```

```vue
<IconHome class="icon" />
```

```css
.icon { width: 20px; color: var(--sky-btn-primary-bg); }
```

### Сирий вміст

Коли потрібен рядок з розміткою SVG (напр. для `v-html` чи вставки в canvas):

```ts
import iconRaw from '@/shared/assets/icons/home.svg?raw'
```

## Конфігурація loader

У `vite.config.ts` бібліотеки:

```ts
import svgLoader from 'vite-svg-loader'

export default defineConfig({
  plugins: [
    svgLoader({ defaultImport: 'url' }),
  ],
})
```

`defaultImport: 'url'` означає, що імпорт **без query** дає URL. Query `?component` та `?raw` перекривають цю поведінку для конкретного імпорту.

## Типи

Декларації для query-суфіксів (`?component`, `?raw`, `?url`) задекларовані в `src/vue-shim.d.ts`, тож TypeScript коректно виводить типи для всіх трьох форм імпорту.

## Іконки у власному mini-app

Наведене вище стосується розробки самої бібліотеки. У власному mini-app ви налаштовуєте `vite-svg-loader` (або будь-який SVG-loader) у своєму `vite.config` так само — компоненти на кшталт [`SkyButton`](/components/sky-button) чи [`SkyCardHeader`](/components/sky-card) приймають будь-яку розмітку/іконку через слоти:

```vue
<SkyButton variant="primary" icon title="Додати">
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>
</SkyButton>
```

::: tip currentColor
Використовуйте `stroke="currentColor"` / `fill="currentColor"` в SVG — тоді іконка автоматично успадкує колір тексту кнопки чи контейнера.
:::
