# SkyTileCard

Тайл-картка: зверху — іконка + заголовок + підзаголовок; знизу — довільний вміст через `default` слот. Підходить для списків інтеграцій, додатків або швидкого доступу.

## Демо

<ClientOnly>
  <SkyTileCardDemo />
</ClientOnly>

## Приклад

```vue
<script setup>
import { SkyTileCard, SkyBadge, SkyButton } from '@skyservice-developers/vue-dev-kit'
</script>

<template>
  <!-- Мінімум -->
  <SkyTileCard
    title="Glovo"
    subtitle="Інтеграція з сервісом доставки"
    image-url="/image/glovo_logo.png"
  />

  <!-- З додатковим контентом знизу -->
  <SkyTileCard title="Glovo" subtitle="Інтеграція" image-url="/image/glovo_logo.png">
    <SkyBadge tone="success" label="Активно" />
    <SkyButton variant="outline" block>Налаштувати</SkyButton>
  </SkyTileCard>

  <!-- Зі своєю іконкою -->
  <SkyTileCard title="Налаштування">
    <template #icon>
      <SettingsIcon />
    </template>
  </SkyTileCard>
</template>
```

## Props

| Prop | Тип | Обов'язково | Опис |
|------|-----|-------------|------|
| `title` | `String` | так | Заголовок |
| `subtitle` | `String` | ні | Підзаголовок |
| `imageUrl` | `String` | ні | URL зображення іконки |

## Slots

| Slot | Опис |
|------|------|
| `icon` | Override іконки (замість `imageUrl`) |
| `default` | Додатковий вміст під header (бейджі, кнопки тощо) |

## Іконка: три варіанти

1. **`imageUrl`** — зображення за URL:
   ```vue
   <SkyTileCard title="Glovo" image-url="/logo.png" />
   ```
2. **Слот `#icon`** — власна розмітка (SVG, компонент):
   ```vue
   <SkyTileCard title="Меню">
     <template #icon><MenuIcon /></template>
   </SkyTileCard>
   ```
3. **Нічого** — рендериться дефолтний плейсхолдер на фоні primary-кольору.

## CSS змінні

```css
--sky-tile-bg: #fff;
--sky-tile-radius: 12px;
--sky-tile-shadow: 0 1px 12px rgba(0,0,0,0.08);
--sky-tile-icon-size: 56px;
--sky-tile-icon-radius: 12px;
--sky-tile-icon-bg: #00c279;
--sky-tile-icon-color: #fff;
--sky-tile-title-color: #1a1a1a;
--sky-tile-subtitle-color: #666;
```

## SkyTileCard vs SkyCard

| | [`SkyTileCard`](/components/sky-tile-card) | [`SkyCard`](/components/sky-card) |
|---|----------|--------|
| Структура | Фіксована (іконка + title + slot) | Гнучка (ribbon/header/body/footer) |
| Ribbon / footer-слоти | ні | так |
| Коли | Сітка однотипних тайлів | Складніші картки з рядками даних |

## Пов'язане

- [SkyCard](/components/sky-card) — гнучкіший контейнер картки.
