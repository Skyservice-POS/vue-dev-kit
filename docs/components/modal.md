# Modal

Модальне вікно з оверлеєм, шапкою, скролом у тілі та опціональним футером. Монтується в `<body>` (через teleport), тож не залежить від `overflow` батьків.

## Демо

<ClientOnly>
  <ModalDemo />
</ClientOnly>

## Приклад

```vue
<script setup>
import { ref } from 'vue'
import { Modal } from '@skyservice-developers/vue-dev-kit'

const show = ref(false)
</script>

<template>
  <button @click="show = true">Відкрити</button>

  <Modal v-model="show" title="Заголовок" subtitle="Підзаголовок">
    <p>Контент модального вікна</p>
    <template #footer>
      <button @click="show = false">Закрити</button>
    </template>
  </Modal>
</template>
```

## Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `modelValue` | `Boolean` | `false` | Стан відкриття (v-model) |
| `title` | `String` | `''` | Заголовок |
| `subtitle` | `String` | `''` | Підзаголовок |
| `closeTitle` | `String` | `'Закрити'` | Tooltip кнопки закриття |
| `closeOnOverlay` | `Boolean` | `true` | Закривати при кліку на оверлей |
| `closeOnEsc` | `Boolean` | `true` | Закривати при натисканні Esc |
| `width` | `String` | `'100%'` | Ширина модалки |
| `height` | `String` | `'100%'` | Висота модалки |
| `borderRadius` | `String` | `'12px'` | Радіус заокруглення модалки (ігнорується в повноекранному режимі) |

## Slots

| Slot | Опис |
|------|------|
| `default` | Основний контент (скролиться) |
| `title` | Кастомний заголовок (замість пропа `title`) |
| `subtitle` | Кастомний підзаголовок (замість пропа `subtitle`) |
| `header-actions` | Елементи справа в шапці — кнопки, бейджі |
| `footer` | Футер із кнопками |

::: tip Футер рендериться лише зі слотом
Блок футера з'являється, **тільки** якщо передано слот `#footer`. Без нього тіло займає весь простір. Відступ між елементами футера — `14px`.
:::

## Слоти шапки

Шапку можна зібрати зі слотів — так само, як у [`Header`](/components/header). `#title` і `#subtitle` перекривають однойменні props, `#header-actions` додає елементи справа. Кнопка «Назад» лишається на місці.

```vue
<Modal v-model="show">
  <template #title>
    <h4 style="margin: 0">
      Замовлення №1042 <SkyBadge tone="success" label="Оплачено" />
    </h4>
  </template>
  <template #subtitle>Оновлено щойно</template>
  <template #header-actions>
    <SkyButton variant="outline">Друк</SkyButton>
    <SkyButton variant="primary">Зберегти</SkyButton>
  </template>

  <p>Контент</p>
</Modal>
```

Відступ між елементами в `#header-actions` — змінна `--sky-modal-header-actions-gap` (за замовчуванням `8px`).

## Events

| Event | Опис |
|-------|------|
| `update:modelValue` | Зміна стану |
| `close` | Закриття модалки |

## Розміри

За замовчуванням модалка повноекранна (`100% × 100%`). Для компактного центрованого вікна задайте `width` / `height`:

```vue
<Modal v-model="show" title="Швидкий перегляд" width="500px" height="300px">
  <div style="padding: 16px">Компактна модалка з фіксованими розмірами.</div>
  <template #footer>
    <button @click="show = false">Готово</button>
  </template>
</Modal>
```

## Способи закриття

| Дія | Керується пропом |
|-----|------------------|
| Кнопка × у шапці | завжди |
| Клік на оверлей | `closeOnOverlay` (за замовчуванням `true`) |
| Клавіша Esc | `closeOnEsc` (за замовчуванням `true`) |

```vue
<!-- Модалка, яку не закрити «випадково» -->
<Modal v-model="show" title="Підтвердіть" :close-on-overlay="false" :close-on-esc="false">
  ...
</Modal>
```

## Modal vs Dialog

| | [`Modal`](/components/modal) | [`Dialog`](/components/dialog) |
|---|------|--------|
| Вигляд | Вікно з оверлеєм | Повний екран |
| Розмір | Налаштовується (`width`/`height`) | Завжди повноекранний |
| Кнопка закриття | × у шапці | `next` (назад) / `classic` (×) |
| Коли | Форми, перегляди, підтвердження | Кроки-майстри, повноекранні редактори |
