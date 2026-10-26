# SkyRadioFilter

Фільтр-чіп з **одиничним** вибором радіо-кнопками. На відміну від [`SkySelectFilter`](/components/sky-select-filter), вибір не закриває панель, є «Очистити» і «Готово», а окремим пунктам можна дати **числовий інпут** (`inputFor`) — як «Рух клієнтів» в адмінці. Оболонку тримає [`SkyFilterDropdown`](/components/sky-filter-dropdown), метрики рядків ті самі, що й у [`SkyCheckboxFilter`](/components/sky-checkbox-filter).

## Демо

<ClientOnly>
  <SkyRadioFilterDemo />
</ClientOnly>

## Приклад

```vue
<script setup>
import { ref } from 'vue'
import { SkyRadioFilter } from '@skyservice-developers/vue-dev-kit'

const payment = ref(null)
const options = [
  { value: 'cash', name: 'Готівка' },
  { value: 'card', name: 'Картка' },
]
</script>

<template>
  <SkyRadioFilter v-model="payment" title="Спосіб оплати" :options="options" />
</template>
```

### Пункти з числом

```vue
<script setup>
const motion = ref({ value: null, input: '' })
</script>

<template>
  <SkyRadioFilter
    v-model="motion"
    title="Рух клієнтів"
    :options="motionOptions"
    :input-for="['come', 'remove']"
    input-hint="клієнтів"
  />
</template>
```

З `inputFor` значення стає `{ value, input }`. Введення в інпут одночасно обирає пункт. Поки пункт з інпутом обрано, а числа немає, інпут підсвічується червоним, а тригер показує просто назву фільтра: фільтр ще не застосований. Перемикання на пункт без інпуту скидає число.

## Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `title` | `String` | — | Заголовок фільтра |
| `options` | `Array<{ value, name }>` | — | Варіанти |
| `modelValue` | `String \| Number \| null` / `{ value, input }` | `null` | Обране (v-model). Форма `{ value, input }` — коли задано `inputFor` |
| `inputFor` | `Array<String \| Number>` | `[]` | Пункти з числовим інпутом |
| `inputHint` | `String` | `''` | Підпис праворуч від інпуту |
| `clearable` | `Boolean` | `true` | Кнопка «Очистити» |
| `searchable` | `Boolean` | `false` | Пошук по списку — для довгих списків |
| `clearLabel` | `String` | `'Очистити'` | |
| `doneLabel` | `String` | `'Готово'` | |
| `searchPlaceholder` | `String` | `'Пошук'` | |
| `emptyLabel` | `String` | `'Нічого не знайдено'` | Коли пошук нічого не знайшов |
| `disabled` | `Boolean` | `false` | Вимкнений стан |

## Events

| Подія | Payload | Опис |
|-------|---------|------|
| `update:modelValue` | `value \| { value, input } \| null` | Змінився вибір |

## Тригер

- нічого не обрано — назва фільтра;
- обрано — назва варіанта (довша за 20 символів обрізається);
- з числом — назва варіанта + число бейджем.

## CSS-змінні

| Змінна | За замовчуванням | Опис |
|--------|------------------|------|
| `--sky-checkbox-accent` | `#28a745` | Колір обраного кружечка (спільний з чекбоксами) |
| `--sky-filter-option-font-size` | `10pt` | Розмір тексту варіантів |
| `--sky-filter-list-max-height` | — | Максимальна висота списку |

Решта — від [`SkyFilterDropdown`](/components/sky-filter-dropdown).

## Пов'язане

- [SkySelectFilter](/components/sky-select-filter) — одиничний вибір, що закривається одразу після кліку.
- [SkyFilters](/components/sky-filters) — рядок фільтрів; там це `type: 'radio'`.
