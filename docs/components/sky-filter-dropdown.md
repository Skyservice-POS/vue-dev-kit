# SkyFilterDropdown

Оболонка фільтра: тригер-чіп + панель. Бере на себе тільки те, що спільне для всіх фільтрів — стан відкриття, позиціювання, закриття і доступність. Вміст панелі повністю за викликачем.

На ній побудовані [`SkyCheckboxFilter`](/components/sky-checkbox-filter) і [`SkySelectFilter`](/components/sky-select-filter). Бери її напряму, коли потрібен фільтр із власним вмістом — календар, дерево, слайдер діапазону.

## Що вона робить

- **Панель телепортується у `<body>`.** Інакше будь-який предок із `transform` / `filter` / `contain` ламає `position: fixed`.
- **Позиція перераховується на скрол і resize.** Панель прив'язана до тригера й не «відклеюється». Саме тому тут **немає лока скролу сторінки** — його не треба.
- **Панель не вилазить за екран:** притискається до країв, а якщо знизу тісно — розкривається вгору. Власну висоту обмежує сама, тож скролиться список усередині, а не сторінка.
- **Закриття:** клік поза межами, `Esc` (фокус повертається на тригер), `disabled` на льоту.
- **Доступність:** тригер — справжній `<button>` з `aria-haspopup` та `aria-expanded`, панель — `role="dialog"` з `aria-label`.
- **Слухачі живуть лише поки панель відкрита** — сторінка з десятком фільтрів не тримає десяток слухачів `document`.

## Приклад

```vue
<script setup>
import { SkyFilterDropdown } from '@skyservice-developers/vue-dev-kit'
</script>

<template>
  <SkyFilterDropdown title="Період" summary="Цей тиждень">
    <template #default="{ close }">
      <!-- будь-який вміст -->
      <button @click="close">Готово</button>
    </template>
  </SkyFilterDropdown>
</template>
```

## Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `title` | `String` | — | Лейбл чіпа |
| `summary` | `String` | `''` | Заміняє `title`, коли обрано рівно одне (напр. назва опції) |
| `badge` | `String \| Number` | `''` | Показується поруч із `title` (напр. кількість обраного) |
| `align` | `'start' \| 'end'` | `'start'` | До якого краю тригера притискається панель, поки вміщається |
| `width` | `Number` | `280` | Ширина панелі в px; більшу за екран не візьме |
| `disabled` | `Boolean` | `false` | Вимкнений стан; відкрита панель закривається |

## Slots

| Slot | Props | Опис |
|------|-------|------|
| `default` | `{ close }` | Вміст панелі. `close()` — закрити ззовні (напр. після вибору) |

## Events

| Event | Коли |
|-------|------|
| `open` | Панель відкрилась |
| `close` | Панель закрилась (будь-яким способом) |

## Expose

`open()`, `close()`, `toggle()`, `isOpen` — коли фільтром треба керувати ззовні.

## CSS-змінні

| Змінна | За замовчуванням | Опис |
|--------|------------------|------|
| `--sky-filter-trigger-height` | `38px` | Висота чіпа |
| `--sky-filter-trigger-padding` | `0 10px` | Падінги чіпа |
| `--sky-filter-trigger-border-color` | `#ced4da` | Бордер чіпа |
| `--sky-filter-trigger-radius` | `5px` | Радіус чіпа |
| `--sky-filter-trigger-bg` | `transparent` | Фон чіпа |
| `--sky-filter-trigger-color` | `inherit` | Колір тексту чіпа |
| `--sky-filter-trigger-font-size` | `12pt` | Розмір тексту чіпа |
| `--sky-filter-trigger-font-weight` | `500` | Насиченість тексту чіпа |
| `--sky-filter-trigger-muted-color` | `#b4b4b4` | Колір відкритого / вимкненого чіпа |
| `--sky-filter-badge-color` | `gray` | Колір бейджа |
| `--sky-filter-panel-bg` | `#fff` | Фон панелі |
| `--sky-filter-panel-radius` | `5px` | Радіус панелі |
| `--sky-filter-panel-padding` | `10px 15px` | Падінги панелі |
| `--sky-filter-panel-shadow` | `0 5px 8px rgba(0, 0, 0, 0.3)` | Тінь панелі |
| `--sky-filter-panel-z-index` | `1000` | z-index панелі |
| `--sky-filter-accent` | `#106090` | Акцент: фокус, лінки, обраний рядок |

## Пов'язане

- [SkyCheckboxFilter](/components/sky-checkbox-filter) — мульти-вибір на цій оболонці.
- [SkySelectFilter](/components/sky-select-filter) — одиничний вибір на цій оболонці.
