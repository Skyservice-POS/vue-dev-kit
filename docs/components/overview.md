# Компоненти — огляд

`vue-dev-kit` містить 21 UI-компонент із єдиним фірмовим стилем Skyservice. Усі імпортуються з кореня пакета й кастомізуються через [CSS-змінні](/guide/theming).

```ts
import '@skyservice-developers/vue-dev-kit/style.css'
import { SkyButton, Modal, SkyCard /* ... */ } from '@skyservice-developers/vue-dev-kit'
```

## Каталог

### Layout

| Компонент | Призначення |
|-----------|-------------|
| [`Header`](/components/header) | Шапка сторінки з back-кнопкою, дропдауном розділів, слотом для дій |
| [`Modal`](/components/modal) | Модальне вікно з оверлеєм, скролом, футером |
| [`Dialog`](/components/dialog) | Повноекранний діалог (стилі `next` / `classic`) |

### Форми

| Компонент | Призначення |
|-----------|-------------|
| [`SkyButton`](/components/sky-button) | Кнопка: 4 варіанти, loading/disabled, block, icon |
| [`SkyInput`](/components/sky-input) | Текстовий інпут зі станами default/success/error |
| [`SkySearchInput`](/components/sky-search-input) | Поле пошуку з очищенням і режимом `collapsible` |
| [`SkySelect`](/components/sky-select) | Кастомний select із клавіатурною навігацією |
| [`SkySelectSearch`](/components/sky-select-search) | Select із пошуком у дропдауні (для довгих списків) |
| [`SkyCheckbox`](/components/sky-checkbox) | Чекбокс або switch, boolean / масив |
| [`SkyTabs`](/components/sky-tabs) | Сегментовані таби з анімованим індикатором |

### Дані та статуси

| Компонент | Призначення |
|-----------|-------------|
| [`SkyDataTable`](/components/data-table) | Грід на TanStack Table v9: сортування, пошук, вибір, пагінація |
| [Примітиви таблиці](/components/table) | `SkyTableRoot` / `Header` / `Head` / `Body` / `Row` / `Cell` + композабли |
| [`SkyTable`](/components/sky-table) | Стара віртуал-скрол таблиця POS: масові дії, inline-редагування |
| [`SkyCard`](/components/sky-card) | Shell-контейнер картки (+ `SkyCardHeader`, `SkyCardRow`) |
| [`SkyTileCard`](/components/sky-tile-card) | Тайл-картка для списків інтеграцій/додатків |
| [`SkyAlert`](/components/sky-alert) | Інформаційне повідомлення (4 тональності) |
| [`SkyBadge`](/components/sky-badge) | Компактний статус-лейбл із крапкою |
| [`SkyLoader`](/components/sky-loader) | Фірмовий лоадер із двома кільцями |

### Features

| Компонент | Призначення |
|-----------|-------------|
| [`SkyCheckboxFilter`](/components/sky-checkbox-filter) | Кнопка-фільтр із дропдауном, пошуком і мульти-вибором |

### Сповіщення

| Компонент | Призначення |
|-----------|-------------|
| [`NotificationElement`](/components/notifications) | Web Component для тостів + `notificationModule` |

## Спільні конвенції

- **v-model** — інтерактивні компоненти (`Modal`, `Dialog`, `SkySelect`, `SkyInput`, `SkyCheckbox`) працюють через `v-model`.
- **Стани** — форми підтримують `disabled` та (де доречно) `state: 'default' | 'success' | 'error'`.
- **Слоти замість пропсів** — контент (іконки, кнопки, заголовки) передається слотами, а не рядковими пропсами, де потрібна гнучкість.
- **Тематизація через CSS** — кольори/радіуси/відступи задаються лише [CSS-змінними](/guide/theming), не пропсами.

## Демо

Усі компоненти в одному місці — на сторінці [Галерея](/components/gallery): живі, клікабельні, з посиланням на сторінку кожного.

Локально документація піднімається так:

```bash
npm run docs:dev
```
