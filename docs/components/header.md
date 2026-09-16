# Header

Шапка сторінки з кнопкою «Назад», дропдауном нещодавніх розділів та слотом для кнопок дій.

## Демо

<ClientOnly>
  <HeaderDemo />
</ClientOnly>

::: tip Інтеграція з Dashboard
`Header` автоматично шле батьківському iframe сигнал [`setRocketMode`](/sdk/bridge#setrocketmode-value) при монтуванні та відновлює попередній стан при розмонтуванні. Тобто на сторінках із `Header` Dashboard переходить у повноекранний режим сам.
:::

## Приклад

```vue
<script setup>
import { Header, SkyButton } from '@skyservice-developers/vue-dev-kit'

const recentPages = [
  { name: 'Товари', path: '/products', lastVisit: Date.now() },
  { name: 'Замовлення', path: '/orders', lastVisit: Date.now() - 3600_000 },
]

function goTo(item) {
  // навігація до item.path
}
</script>

<template>
  <Header
    title="Товари"
    subtitle="Управління каталогом"
    :dropdown-items="recentPages"
    @navigate="goTo"
  >
    <SkyButton variant="primary" @click="openDialog">+ Додати</SkyButton>
  </Header>
</template>
```

## Props

| Prop | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `title` | `String` | `''` | Заголовок сторінки |
| `subtitle` | `String` | `''` | Підзаголовок |
| `showBackButton` | `Boolean` | `true` | Показувати кнопку «Назад» (тільки в iframe) |
| `backButtonTitle` | `String` | `'Назад'` | Tooltip кнопки «Назад» |
| `backEvent` | `Function` | `null` | Кастомна функція для кнопки «Назад» (замість iframe exit) |
| `dropdownItems` | `Array` | `[]` | Нещодавні розділи `[{ name, path, lastVisit }]` |
| `dropdownTitle` | `String` | `'Останні відвідані розділи'` | Заголовок дропдауну |
| `visitLabel` | `String` | `'Останнє відвідування'` | Підпис часу в дропдауні |
| `trackPageName` | `String` | `''` | Назва сторінки для трекінгу відвідувань |
| `trackPagePath` | `String` | `''` | Шлях сторінки для трекінгу (за замовчуванням `/apps/{trackPageName}`; актуальний дашборд підставляє свій реальний маршрут) |
| `appId` | `String` | `''` | Ідентифікатор додатку для iframe bridge |

### Формат `dropdownItems`

```ts
interface DropdownItem {
  name: string       // назва розділу
  path: string       // шлях (payload події navigate)
  lastVisit: number  // timestamp останнього відвідування
}
```

## Slots

| Slot | Опис |
|------|------|
| `default` | Кнопки та елементи справа |
| `title` | Кастомний заголовок (замість пропа `title`) |
| `subtitle` | Кастомний підзаголовок |

## Events

| Event | Payload | Опис |
|-------|---------|------|
| `back` | — | Клік на кнопку «Назад» |
| `navigate` | `item` | Вибір розділу з дропдауну |

## Кнопка «Назад»: три сценарії

Логіка back-кнопки залежить від пропсів:

1. **`backEvent` задано** → викликається ваша функція (напр. локальний роутинг).

   ```vue
   <Header title="Профіль" :back-event="() => router.push('/settings')" />
   ```

2. **`backEvent` не задано, ми в iframe** → викликається [`goBack()`](/sdk/bridge#goback) — Dashboard робить крок назад по своїй історії переходів. Якщо Dashboard старий і про `back` не знає, спрацьовує [`exit()`](/sdk/bridge#exit-getback) — вихід на головну.

3. **`showBackButton: false`** → кнопки немає взагалі.

::: tip Чому крок назад робить Dashboard
Mini-app в iframe не бачить URL батька, тож не може знати, куди веде «назад». До 3.1.0 хедер вгадував це сам — брав найсвіжіший розділ зі списку «останніх відвіданих» (`componentStats`). Той список відсортований за часом останнього візиту, а не за порядком переходів, тому кнопка кидала користувача між двома останніми сторінками замість руху вглиб історії.
:::

## Дропдаун нещодавніх розділів

Дропдаун показує список `dropdownItems` із часом останнього відвідування. Вибір елемента емітить `navigate` з цим елементом — обробіть подію, щоб перейти на потрібний роут.

Це зручно поєднувати з [`trackVisit()`](/sdk/bridge#trackvisit-name-path) з SDK: фіксуйте відвідування, зберігайте список і передавайте його назад у `dropdownItems`.

## Пов'язане

- [SDK / Bridge → setRocketMode](/sdk/bridge#setrocketmode-value)
- [SDK / Bridge → goBack](/sdk/bridge#goback)
- [SDK / Bridge → exit](/sdk/bridge#exit-getback)
- [Анатомія mini-app → Rocket mode](/guide/mini-app#rocket-mode)
