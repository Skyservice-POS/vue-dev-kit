# SkyCard

Shell-контейнер для карток: ribbon / header / body / footer — усе через слоти. Використовується у зв'язці з `SkyCardHeader`, `SkyCardRow`, а також [`SkyBadge`](/components/sky-badge) і [`SkyAlert`](/components/sky-alert).

## Демо

<ClientOnly>
  <SkyCardDemo />
</ClientOnly>

На цій сторінці зібрані три пов'язані компоненти: **`SkyCard`**, **`SkyCardHeader`** та **`SkyCardRow`**.

## Приклад композиції

```vue
<script setup>
import {
  SkyCard, SkyCardHeader, SkyCardRow,
  SkyBadge, SkyAlert, SkyButton,
} from '@skyservice-developers/vue-dev-kit'
</script>

<template>
  <SkyCard>
    <template #ribbon>Тимчасово закрито</template>
    <template #header>
      <SkyCardHeader
        title="Торгова точка"
        subtitle="вул. Хрещатик, 1"
        icon-src="/svg/home.svg"
      />
    </template>

    <SkyCardRow label="Статус">
      <SkyBadge tone="success" label="Активна" />
    </SkyCardRow>
    <SkyCardRow label="ID" value="12345" />

    <SkyAlert tone="error">Помилка синхронізації</SkyAlert>

    <template #footer>
      <SkyButton variant="primary" block>Налаштувати</SkyButton>
    </template>
  </SkyCard>
</template>
```

---

## SkyCard

Shell зі слотами. Сам по собі не має контенту — усе задається через слоти.

### Slots

| Slot | Опис |
|------|------|
| `ribbon` | Стрічка зверху (наприклад «Тимчасово закрито») |
| `header` | Шапка картки (часто `SkyCardHeader`) |
| `default` | Тіло картки (часто `SkyCardRow`, `SkyAlert`) |
| `footer` | Футер із кнопками |

### CSS змінні

```css
--sky-card-bg: #fff;
--sky-card-radius: 12px;
--sky-card-shadow: 0 1px 12px rgba(0,0,0,0.1);
--sky-card-ribbon-bg: #e65100;
--sky-card-ribbon-color: #fff;
--sky-card-padding-header: 24px 24px 0;
--sky-card-padding-body: 10px 24px 15px;
--sky-card-padding-footer: 0 24px 24px;
```

---

## SkyCardHeader

Готова шапка картки: іконка + заголовок + підзаголовок.

```vue
<!-- З зображенням -->
<SkyCardHeader title="Glovo" subtitle="Інтеграція доставки" icon-src="/svg/glovo.svg" />

<!-- Зі своєю іконкою замість img -->
<SkyCardHeader title="Меню">
  <template #icon>
    <MyCustomIcon />
  </template>
</SkyCardHeader>
```

### Props

| Prop | Тип | Обов'язково | Опис |
|------|-----|-------------|------|
| `title` | `String` | так | Заголовок |
| `subtitle` | `String` | ні | Підзаголовок |
| `iconSrc` | `String` | ні | Шлях до зображення іконки |

### Slots

| Slot | Опис |
|------|------|
| `icon` | Override іконки (замість `iconSrc`) |

### CSS змінні

```css
--sky-card-icon-size: 64px;
--sky-card-icon-radius: 12px;
--sky-card-icon-bg: #00c279;
--sky-card-icon-color: #fff;
```

---

## SkyCardRow

Рядок «label + value» (або довільний контент праворуч через слот).

```vue
<!-- Простий рядок -->
<SkyCardRow label="Store ID" value="12345" />

<!-- Зі своїм вмістом праворуч -->
<SkyCardRow label="Статус">
  <SkyBadge tone="success" label="Під'єднано" />
</SkyCardRow>
```

### Props

| Prop | Тип | Обов'язково | Опис |
|------|-----|-------------|------|
| `label` | `String` | так | Підпис зліва |
| `value` | `String \| Number` | ні | Значення справа (ігнорується, якщо є слот) |

### Slots

| Slot | Опис |
|------|------|
| `default` | Override правої колонки (перекриває `value`) |

---

## Патерн: список карток-інтеграцій

```vue
<div class="cards-grid">
  <SkyCard v-for="tp in tradepoints" :key="tp.tradepointId">
    <template #header>
      <SkyCardHeader :title="tp.tradepointName" :subtitle="tp.contacts.address" />
    </template>

    <SkyCardRow label="Store Address ID" :value="tp.storeId ?? '—'" />
    <SkyCardRow label="Статус інтеграції">
      <SkyBadge :tone="tp.connected ? 'success' : 'error'"
                :label="tp.connected ? 'Під'єднано' : 'Помилка'" />
    </SkyCardRow>

    <template #footer>
      <SkyButton variant="primary" block>Налаштувати</SkyButton>
    </template>
  </SkyCard>
</div>
```

## Пов'язане

- [SkyTileCard](/components/sky-tile-card) — легша тайл-картка для списків.
- [SkyBadge](/components/sky-badge) · [SkyAlert](/components/sky-alert) — статуси всередині картки.
