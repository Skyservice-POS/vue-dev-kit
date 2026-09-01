# SkyCheckbox

Чекбокс із двома режимами: класичний бокс або switch-перемикач. Підтримує `v-model` з `Boolean` (одиничний) або масивом значень (через проп `value`).

## Демо

<ClientOnly>
  <SkyCheckboxDemo />
</ClientOnly>

## Приклад

```vue
<script setup>
import { ref } from 'vue'
import { SkyCheckbox } from '@skyservice-developers/vue-dev-kit'

const agreed = ref(false)
const enabled = ref(true)
const selected = ref([])
const options = [
  { value: 'a', name: 'Опція A' },
  { value: 'b', name: 'Опція B' },
]
</script>

<template>
  <!-- Boolean -->
  <SkyCheckbox v-model="agreed">Погоджуюсь з умовами</SkyCheckbox>

  <!-- Масив значень -->
  <SkyCheckbox
    v-for="opt in options"
    :key="opt.value"
    v-model="selected"
    :value="opt.value"
  >
    {{ opt.name }}
  </SkyCheckbox>

  <!-- Switch -->
  <SkyCheckbox v-model="enabled" switch>Сповіщення</SkyCheckbox>

  <!-- Disabled -->
  <SkyCheckbox v-model="agreed" disabled>Заблоковано</SkyCheckbox>
</template>
```

## Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `modelValue` | `Boolean \| Array` | — | Стан / масив вибраних значень (v-model) |
| `value` | `String \| Number` | — | Значення для array-режиму (**обов'язкове** в ньому) |
| `switch` | `Boolean` | `false` | Режим switch замість чекбоксу |
| `disabled` | `Boolean` | `false` | Вимкнений стан |
| `indeterminate` | `Boolean` | `false` | Третій стан — «обрано частину» |

## Атрибути

Усе, що не `class` і не `style`, потрапляє на сам `<input>`: `name`, `required`,
`tabindex`, `autofocus`, `aria-*` стосуються контрола, і на `<label>` вони нічого
не роблять. `class` і `style` лишаються на корені — ними позиціонують обгортку.

```vue
<SkyCheckbox v-model="agreed" name="agree" required class="mt-2">Погоджуюсь</SkyCheckbox>
<!-- name і required → на <input>, mt-2 → на <label> -->
```

## Третій стан

`indeterminate` — це «обрано частину», класичний головний чекбокс над списком.
Як і в DOM, він **не** пов'язаний з `checked`: прапорець лишається таким, яким ви
його задали, змінюється лише вигляд.

```vue
<SkyCheckbox
  :model-value="allSelected"
  :indeterminate="someSelected && !allSelected"
  @update:model-value="toggleAll"
>
  Обрати всі
</SkyCheckbox>
```

## Slots

| Slot | Опис |
|------|------|
| `default` | Лейбл |

## Два режими v-model

### Boolean — одиничний прапорець

Коли `value` **не** задано, `v-model` працює як `Boolean`:

```vue
<SkyCheckbox v-model="agreed">Погоджуюсь</SkyCheckbox>
<!-- agreed: true | false -->
```

### Масив — група чекбоксів

Коли задано `value`, кожен чекбокс додає/прибирає своє значення зі спільного масиву в `v-model`:

```vue
<SkyCheckbox v-model="selected" value="a">A</SkyCheckbox>
<SkyCheckbox v-model="selected" value="b">B</SkyCheckbox>
<!-- selected: ['a'], ['a','b'], [] ... -->
```

::: warning `value` тут обов'язковий
У режимі масиву без `value` класти в список нема чого — компонент пропускає зміну
й пише попередження в консоль (у dev). Масив, який ви передали, не мутується:
завжди приходить новий.
:::

## Switch

`switch` міняє вигляд на перемикач (той самий v-model, інша візуалізація):

```vue
<SkyCheckbox v-model="enabled" switch>Push-сповіщення</SkyCheckbox>
```

Зручно для налаштувань on/off, де «чекбокс» семантично читається як «увімкнено».

## Пов'язане

- [SkyCheckboxFilter](/components/sky-checkbox-filter) — готовий фільтр із мульти-вибором на базі `SkyCheckbox`.
