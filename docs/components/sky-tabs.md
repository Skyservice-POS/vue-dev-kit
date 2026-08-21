# SkyTabs

Сегментовані таби (segmented control) з анімованим індикатором, який плавно переїжджає під активну опцію й підлаштовує ширину під довжину тексту.

## Демо

<ClientOnly>
  <SkyTabsDemo />
</ClientOnly>

## Приклад

```vue
<script setup>
import { ref } from 'vue'
import { SkyTabs } from '@skyservice-developers/vue-dev-kit'

const period = ref('week')
const periods = [
  { value: 'day', text: 'День' },
  { value: 'week', text: 'Тиждень' },
  { value: 'month', text: 'Місяць' },
]
</script>

<template>
  <SkyTabs v-model="period" :options="periods" />
</template>
```

## Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `modelValue` | `string \| number` | — | Активне значення (v-model) |
| `options` | `Array<{ value: string \| number; text: string }>` | — | Список табів (обов'язковий) |
| `disabled` | `Boolean` | `false` | Блокує весь набір: приглушує кольори і вимикає кліки |

## Events

| Event | Payload | Опис |
|-------|---------|------|
| `update:modelValue` | `string \| number` | Emit при виборі таба |

## Як працює індикатор

Компонент вимірює активну кнопку через `getBoundingClientRect()` і рухає `<span>`-індикатор через `transform: translateX()` + `width`. Кілька наслідків, які варто знати:

- **Перший рендер без анімації.** Індикатор стає на місце миттєво, анімуються лише подальші переходи — інакше при монтуванні він «прилітав» би зліва.
- **Реагує на `resize`** вікна і на зміну `options.length`, тож динамічний список табів не ламає позицію.
- Якщо таби рендеряться у прихованому контейнері (`display: none`), розміри будуть нульові — індикатор стане на місце після того, як контейнер покажуть і відбудеться `resize` або зміна `modelValue`.

## Доступність

Розмітка має `role="tablist"` на контейнері та `role="tab"` + `aria-selected` на кнопках. Якщо таби перемикають панелі контенту, додайте на панель `role="tabpanel"` і зв'яжіть її з активним табом на боці застосунку.

## Стилі

Компонент не має CSS-змінних — кольори зашиті під фірмовий стиль (світло-сірий фон `#f1f3f5`, біла «пігулка» індикатора, активний текст `#212529`). Ширина — `inline-flex`, тобто набір займає рівно стільки, скільки треба контенту.

## Пов'язане

- [SkySelect](/components/sky-select) — коли варіантів багато і вони не помістяться в рядок.
- [SkyCheckboxFilter](/components/sky-checkbox-filter) — коли потрібен мульти-вибір, а не один активний варіант.
