# Теми та CSS-змінні

Усі компоненти кастомізуються через **CSS Custom Properties**. Жодних пропсів для кольорів чи розмірів — тільки змінні. Це дозволяє перевизначати стиль глобально або точково, не форкаючи компоненти.

## Як перевизначати

### Глобально

Задайте змінні на `:root` (зазвичай у головному CSS після імпорту стилів пакета):

```css
:root {
  --sky-btn-primary-bg: #6366f1;
  --sky-btn-radius: 8px;
  --sky-select-radius: 8px;
}
```

### Локально для блоку

Змінні успадковуються, тож можна перевизначити їх на конкретному контейнері — вплине лише на компоненти всередині:

```css
.my-compact-form {
  --sky-btn-padding: 12px 16px;
  --sky-select-padding: 8px 12px;
}
```

```vue
<div class="my-compact-form">
  <SkyInput v-model="v" />
  <SkyButton variant="primary">Компактна</SkyButton>
</div>
```

::: tip Порядок підключення
Імпортуйте `style.css` пакета **до** ваших перевизначень, інакше специфічність/порядок можуть перекрити ваші значення.
:::

## Повний перелік змінних

### SkyButton

```css
--sky-btn-padding: 16px 20px;
--sky-btn-radius: 6px;
--sky-btn-font-size: 14px;
--sky-btn-font-weight: 500;

--sky-btn-primary-bg: #24973f;
--sky-btn-danger-bg: #dc2626;
--sky-btn-secondary-bg: #f3f4f6;
--sky-btn-outline-bg: transparent;
```

→ [SkyButton](/components/sky-button)

### SkySelect

```css
--sky-select-padding: 10px 14px;
--sky-select-radius: 6px;
--sky-select-font-size: 14px;
--sky-select-border: 1px solid #d1d5db;
--sky-select-dropdown-shadow: 0 4px 12px rgba(0,0,0,0.1);
--sky-select-dropdown-max-height: 220px;
--sky-select-option-hover-bg: #f3f4f6;
--sky-select-option-selected-color: #24973f;
```

→ [SkySelect](/components/sky-select)

### SkyCard

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

→ [SkyCard](/components/sky-card)

### SkyCardHeader

```css
--sky-card-icon-size: 64px;
--sky-card-icon-radius: 12px;
--sky-card-icon-bg: #00c279;
--sky-card-icon-color: #fff;
```

### SkyTileCard

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

→ [SkyTileCard](/components/sky-tile-card)

## Фірмова палітра

Основні кольори бренду, які використовуються за замовчуванням:

| Роль | HEX | Де застосовано |
|------|-----|----------------|
| Primary (green) | `#24973f` | `SkyButton primary`, вибрана опція селекта |
| Accent (mint) | `#00c279` | Фон іконок карток |
| Danger | `#dc2626` | `SkyButton danger` |
| Secondary | `#f3f4f6` | `SkyButton secondary`, hover опцій |
| Ribbon | `#e65100` | Стрічка `SkyCard` |

## Приклад: перебрендувати кнопки у фіолетовий

```css
:root {
  --sky-btn-primary-bg: #6366f1;
  --sky-btn-radius: 10px;
  --sky-select-option-selected-color: #6366f1;
  --sky-card-icon-bg: #6366f1;
}
```

Цього достатньо, щоб первинні кнопки, вибрані опції та іконки карток стали фіолетовими — без правок у компонентах.

## Далі

- [Іконки](/guide/icons) — як вантажаться SVG і в яких форматах.
- [Компоненти](/components/overview) — у кожного в кінці секція з його CSS-змінними.
