# SkyDateFilter

Фільтр-чіп для **періоду дат**: календар, де перший клік задає початок, а другий — кінець. Внизу кнопки швидкого вибору (за замовчуванням Сьогодні / Вчора / Тиждень / Місяць) і футер **«Очистити» / «Готово»**. Окремі дати можна виключати: межами, найдовшим періодом або своєю функцією. Оболонку тримає [`SkyFilterDropdown`](/components/sky-filter-dropdown); у [`SkyFilters`](/components/sky-filters) це `type: 'date'`.

## Демо

<ClientOnly>
  <SkyDateFilterDemo />
</ClientOnly>

## Приклад

```vue
<script setup>
import { ref } from 'vue'
import { SkyDateFilter, today } from '@skyservice-developers/vue-dev-kit'

const period = ref({ start: null, end: null })
</script>

<template>
  <SkyDateFilter v-model="period" title="Період" :max="today()" />
</template>
```

## Значення

`{ start, end }` — рядки `YYYY-MM-DD` у локальному часі, або `null` в обох, коли період не задано. Назовні йде **лише завершений** період:

- перший клік лише запам'ятовує початок; другий завершує період (якщо клікнули раніше за початок — краї переставляються самі);
- якщо закрити панель після першого кліку, це **один день** (`start === end`), а не втрачений вибір;
- «Очистити» скидає період (і напівобраний початок) та закриває панель.

## Виключення дат

Від простого до будь-якого — їх можна поєднувати:

| Що треба | Як |
|----------|-----|
| Без майбутніх дат | `:max="today()"` |
| Не раніше певної дати | `min="2024-01-01"` |
| Період не довший за N днів | `:max-days="31"` — після першого кліку вимикається все далі ніж 30 днів в обидва боки |
| Будь-яке своє правило | `:disabled-date="(date, ctx) => boolean"` |

`disabledDate(date, ctx)` отримує дату `YYYY-MM-DD` і що вже обрано: `ctx.start` без `ctx.end` означає, що користувач зараз обирає кінець.

```js
import { diffDays } from '@skyservice-developers/vue-dev-kit'

// Усе, що далі 31 дня від першої обраної дати — до і після.
const within31 = (date, { start, end }) => !!start && !end && Math.abs(diffDays(start, date)) > 31

// Без вихідних.
const noWeekends = (date) => [0, 6].includes(new Date(date).getDay())
```

Перевіряються краї періоду, а не кожен день усередині. Для неперервних правил (`min`, `max`, `maxDays`, «±N днів») цього досить. Пресет, край якого не можна обрати руками, стає неактивним.

## Кнопки швидкого вибору

Пресет — `{ label, range: () => ({ start, end }) }`. `range` — функція, тож «сьогодні» рахується в момент кліку. Готові блоки:

| Хелпер | Період |
|--------|--------|
| `datePresets.today()` / `yesterday()` | Один день |
| `datePresets.thisWeek()` | Поточний тиждень, пн–нд |
| `datePresets.monthToDate()` | З 1-го числа по сьогодні |
| `datePresets.lastDays(n, label?)` | Останні `n` днів включно з сьогодні |
| `datePresets.thisMonth()` / `lastMonth()` | Календарний місяць |
| `datePresets.quarter(year, q, label?)` | Квартал `q` (1–4) |
| `defaultDatePresets()` | Сьогодні, Вчора, Тиждень, Місяць |
| `quarterPresets(year)` | Чотири квартали року (податкові квартали в Україні — календарні) |

**Додати свої до стандартних** — через проп:

```vue
<SkyDateFilter
  v-model="period"
  title="Період"
  :presets="[...defaultDatePresets(), datePresets.lastDays(30, '30 днів')]"
/>
```

**Повністю замінити** — проп `presets` (`[]` — без кнопок) або **слот `presets`** для своєї розмітки. Слот отримує `presets` (те, що в пропі), `select(range)`, `isActive(range)`, `isDisabled(range)` і `value`. Клас `sky-date-preset` (+ `is-active`) дає стандартний вигляд кнопки. **«Очистити» й «Готово» слот не зачіпає** — вони завжди лишаються у футері.

```vue
<SkyDateFilter v-model="period" title="Квартал" :presets="quarterPresets(year)">
  <template #presets="{ presets, select, isActive, isDisabled }">
    <button
      v-for="q in presets"
      :key="q.label"
      class="sky-date-preset"
      :class="{ 'is-active': isActive(q.range()) }"
      :disabled="isDisabled(q.range())"
      @click="select(q.range())"
    >
      {{ q.label }}
    </button>
  </template>
</SkyDateFilter>
```

## Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `title` | `String` | — | Заголовок фільтра |
| `modelValue` | `{ start, end }` | `{ start: null, end: null }` | Період (v-model) |
| `min` / `max` | `String` (`YYYY-MM-DD`) | — | Межі дат |
| `maxDays` | `Number` | — | Найдовший період у днях |
| `disabledDate` | `(date, ctx) => boolean` | — | Своє правило виключення |
| `presets` | `DatePreset[]` | `defaultDatePresets()` | Кнопки швидкого вибору; `[]` — без них |
| `firstDayOfWeek` | `0 \| 1` | `1` | Тиждень з понеділка (1) чи неділі (0) |
| `monthNames` | `String[12]` | укр. | Назви місяців |
| `weekdayNames` | `String[7]` | `Пн…Нд` | Короткі назви днів, з понеділка |
| `formatLabel` | `(range) => string` | `01.10.2025 – 15.10.2025` | Підпис періоду в тригері |
| `clearLabel` / `doneLabel` | `String` | `'Очистити'` / `'Готово'` | Тексти футера |
| `width` | `Number` | `320` | Ширина панелі |
| `disabled` | `Boolean` | `false` | Вимкнений стан |

## Slots

| Слот | Props | Опис |
|------|-------|------|
| `presets` | `{ presets, select, isActive, isDisabled, value }` | Замість кнопок швидкого вибору |

## Events

| Подія | Payload | Опис |
|-------|---------|------|
| `update:modelValue` | `{ start, end }` | Завершений період або `{ start: null, end: null }` |

## Тригер

Назва фільтра; коли період задано — бейдж `01.10.2025 – 15.10.2025` (один день — одна дата).

## CSS-змінні

| Змінна | За замовчуванням | Опис |
|--------|------------------|------|
| `--sky-date-accent` | `#8fd8ec` | Коло на краях періоду |
| `--sky-date-range-bg` | `#8fd8ec` | Смуга періоду |
| `--sky-date-color` | `#000` | Колір цифр |
| `--sky-date-clear-color` | `#dc3545` | «Очистити» |
| `--sky-date-done-color` | `#28a745` | «Готово» |

Вигляд календаря — як у `SkyDateRangePicker` (FunctionalCalendar): коло дня 30px, період — блакитна смуга з білими цифрами, сьогодні — рожеве коло. Недоступні дати перекреслені. Кнопки швидкого вибору й футера без ховера — лише курсор.

Решта — від [`SkyFilterDropdown`](/components/sky-filter-dropdown).

## Пов'язане

- `SkyDateRangePicker` — календар адмінки, перенесений 1:1 (окремої сторінки в доках поки нема; опис — у README).
- [SkyFilters](/components/sky-filters) — рядок фільтрів; там це `{ type: 'date', min, max, maxDays, disabledDate, presets }`.
