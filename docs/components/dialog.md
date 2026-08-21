# Dialog

Повноекранний діалог. Має два стилі: **`next`** (кнопка «Назад») та **`classic`** (кнопка ×). Якщо `mode` не вказано — визначається автоматично за URL-параметром `?rocketMode=`.

## Демо

<ClientOnly>
  <DialogDemo />
</ClientOnly>

## Приклад

```vue
<script setup>
import { ref } from 'vue'
import { Dialog } from '@skyservice-developers/vue-dev-kit'

const show = ref(false)
function save() { /* ... */ show.value = false }
</script>

<template>
  <Dialog v-model="show" mode="next" title="Новий товар" subtitle="Заповніть дані">
    <div style="padding: 20px">
      <input placeholder="Назва" />
    </div>
    <template #buttons>
      <button @click="show = false">Скасувати</button>
      <button @click="save">Зберегти</button>
    </template>
  </Dialog>
</template>
```

## Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `modelValue` | `Boolean` | `false` | Стан відкриття (v-model) |
| `title` | `String` | `''` | Заголовок |
| `subtitle` | `String` | `''` | Підзаголовок |
| `mode` | `String` | `null` | `'next'` \| `'classic'` \| `null` (авто) |
| `closeText` | `String` | `''` | Текст кнопки закриття |
| `closeOnEsc` | `Boolean` | `true` | Закривати при Esc |
| `zIndex` | `Number \| String` | `null` | Кастомний z-index |

## Slots

| Slot | Опис |
|------|------|
| `default` | Основний контент |
| `title` | Кастомний заголовок (замість пропа `title`) |
| `subtitle` | Кастомний підзаголовок (замість пропа `subtitle`) |
| `header-actions` | Елементи справа в шапці — кнопки, бейджі |
| `buttons` | Кнопки у футері |

### Слоти шапки

Працюють в обох режимах — `next` (кнопка «Назад» ліворуч) і `classic` (× праворуч). У `classic` вміст `#header-actions` стає ліворуч від ×, а заголовок звужується до `--sky-dialog-title-max-width-with-actions` (`50%`).

```vue
<Dialog v-model="show" mode="next">
  <template #title>Замовлення №1042</template>
  <template #subtitle>3 позиції · 1 240 ₴</template>
  <template #header-actions>
    <SkyButton variant="outline">Друк</SkyButton>
  </template>

  <div style="padding: 20px">Контент</div>
</Dialog>
```

`Dialog` — обгортка: вона прокидає **всі** слоти у вибраний внутрішній компонент (`DialogNext` / `DialogModal`), тож будь-який слот працює однаково незалежно від режиму.

| Змінна | За замовчуванням | Опис |
|--------|------------------|------|
| `--sky-dialog-header-actions-gap` | `8px` | Відступ між елементами в `#header-actions` |
| `--sky-dialog-title-max-width-with-actions` | `50%` | Ширина заголовка в `classic`, коли є `#header-actions` |

## Events

| Event | Опис |
|-------|------|
| `update:modelValue` | Зміна стану |
| `close` | Закриття |
| `save` | Підтвердження |

## Два стилі

### `next` — сучасний

Повний екран із кнопкою-стрілкою «Назад» у шапці. Використовується як стиль за замовчуванням у rocket-mode.

```vue
<Dialog v-model="show" mode="next" title="Dialog Next" subtitle="Сучасний повноекранний діалог">
  ...
</Dialog>
```

### `classic` — класичний

Повний екран із кнопкою × для закриття. Використовується, коли rocket-mode вимкнено.

```vue
<Dialog v-model="show" mode="classic" title="Dialog Classic">
  ...
</Dialog>
```

## Авто-визначення режиму

Якщо `mode` **не** передано, `Dialog` читає URL-параметр `?rocketMode=` і сам обирає стиль:

- rocket-mode увімкнено → `next`;
- rocket-mode вимкнено → `classic`.

Це дозволяє одному й тому ж коду виглядати доречно в обох контекстах Dashboard — не задавайте `mode` явно, якщо хочете таку поведінку.

```vue
<!-- Стиль підлаштується під ?rocketMode= автоматично -->
<Dialog v-model="show" title="Адаптивний діалог">
  ...
</Dialog>
```

::: details Внутрішня структура
`Dialog` — це обгортка, що делегує рендер одному з двох внутрішніх компонентів: `DialogNext` (стиль `next`) або `DialogModal` (стиль `classic`). Обидва також експортуються з пакета, але в прикладному коді зазвичай використовують саме `Dialog`.
:::

## Dialog vs Modal

Порівняння — див. [Modal → Modal vs Dialog](/components/modal#modal-vs-dialog).

## Пов'язане

- [Анатомія mini-app → Rocket mode](/guide/mini-app#rocket-mode)
- [Modal](/components/modal)
