# SkyInput

Текстовий input із підтримкою станів `default | success | error` та опціональною підказкою.

## Демо

<ClientOnly>
  <SkyInputDemo />
</ClientOnly>

## Приклад

```vue
<script setup>
import { ref } from 'vue'
import { SkyInput } from '@skyservice-developers/vue-dev-kit'

const name = ref('')
const email = ref('')
</script>

<template>
  <SkyInput v-model="name" placeholder="Ім'я" />
  <SkyInput v-model="email" type="email" state="error" hint="Невалідний email" />
  <SkyInput v-model="phone" disabled />
</template>
```

## Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `modelValue` | `String \| Number` | `''` | Значення (v-model) |
| `type` | `String` | `'text'` | HTML-тип input |
| `placeholder` | `String` | `''` | Текст-заглушка |
| `id` | `String` | — | HTML id |
| `disabled` | `Boolean` | `false` | Вимкнений стан |
| `state` | `String` | `'default'` | `'default'` \| `'success'` \| `'error'` |
| `hint` | `String` | — | Підказка під input (фарбується в колір state) |

## Стани валідації

`state` змінює колір рамки, а `hint` — колір тексту підказки під полем:

```vue
<SkyInput v-model="v" state="default" hint="Звичайна підказка" />
<SkyInput v-model="v" state="success" hint="Все добре" />
<SkyInput v-model="v" state="error" hint="Виправте помилку" />
```

| `state` | Застосування |
|---------|--------------|
| `default` | Нейтральний стан |
| `success` | Валідне значення |
| `error` | Помилка валідації |

## Типи input

Проп `type` пробрасується на нативний `<input>`, тож доступні всі HTML-типи:

```vue
<SkyInput v-model="email" type="email" />
<SkyInput v-model="password" type="password" />
<SkyInput v-model="amount" type="number" />
<SkyInput v-model="date" type="date" />
```

## Приклад: валідація на льоту

```vue
<script setup>
import { ref, computed } from 'vue'
import { SkyInput } from '@skyservice-developers/vue-dev-kit'

const email = ref('')
const valid = computed(() => /.+@.+\..+/.test(email.value))
const state = computed(() => (!email.value ? 'default' : valid.value ? 'success' : 'error'))
const hint = computed(() => (state.value === 'error' ? 'Невалідний email' : ''))
</script>

<template>
  <SkyInput v-model="email" type="email" placeholder="you@example.com" :state="state" :hint="hint" />
</template>
```

## Пов'язане

- [SkySelect](/components/sky-select) — вибір із фіксованого списку.
- [SkyCheckbox](/components/sky-checkbox) — булеві прапорці.
