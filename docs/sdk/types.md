# Типи даних

DTO-типи, які повертає [`SkyserviceAPI`](/sdk/api), а також «сирі» типи відповідей сервера. Усі експортуються з `/sdk`.

```ts
import type {
  Tradepoint, TradepointWorkDay,
  Category, RawCategory,
  Product, RawProduct,
  AppIntegration,
} from '@skyservice-developers/vue-dev-kit/sdk'
```

## Tradepoint

Торгова точка. Повертається з [`getTradepoints()`](/sdk/api#gettradepoints-options).

```ts
interface Tradepoint {
  tradepointId: number
  tradepointName: string
  contacts: {
    address?: string
  }
  workTime: Record<string, TradepointWorkDay>
  deleted: boolean
  frozen: boolean
}
```

### TradepointWorkDay

```ts
interface TradepointWorkDay {
  name: string
  isOpen: boolean
  startTiem: string  // sic — так у API
  endTiem: string    // sic — так у API
}
```

::: warning Одруківка в API
Поля `startTiem` / `endTiem` названі саме так на боці Skyservice API — тип відображає реальну відповідь, а не виправляє її.
:::

## Category

Категорія товарів, очищена від POS-специфіки. Повертається з [`getCategoryTree()`](/sdk/api#getcategorytree-tradepointid). Дерево: `children` вкладені рекурсивно.

```ts
interface Category {
  id: number
  pid: number            // parent id
  name: string
  active: 0 | 1
  background: string
  show: boolean
  img?: string           // лише якщо є
  children?: Category[]  // лише якщо є вкладені
}
```

### RawCategory

«Сира» категорія з API — включає per-tradepoint видимість. `SkyserviceAPI` зводить її до `Category`, тож у прикладному коді вона зазвичай не потрібна.

```ts
interface RawCategory extends Category {
  tradepointShow: Record<string, boolean>
  tradepointsShow?: Record<string, unknown>
  children?: RawCategory[]
}
```

При виклику `getCategoryTree(tradepointId)` фільтрація відбувається саме по `tradepointShow[tradepointId]`.

## Product

Товар, очищений від POS-полів. Повертається з [`getProducts()`](/sdk/api#getproducts-options).

```ts
interface Product {
  id: number
  name: string
  price: number
  categoryId: number | null
  categoryName: string
  active: 0 | 1
  type: 'product' | 'techcard'
  unit: string
  logo: string  // '' якщо дефолтний placeholder
}
```

`getProducts()` залишає лише позиції з `type` = `product` або `techcard` (продавані), і за замовчуванням лише `active`. Дефолтний логотип (`/img/no.png`) замінюється на порожній рядок.

### RawProduct

«Сирий» товар з API з усіма POS-полями. Зводиться до `Product`.

```ts
interface RawProduct {
  id: number
  nomenclatureName: string
  nomenclatureCode: string
  nomenclatureId: number
  price: number
  categoryId: number | null
  categoryTitle: string
  active: 0 | 1
  defaultActive: 0 | 1
  type: string
  unit: string
  weight: number
  logo: string
  background: string
  workshopId: number
  activeProductAppearance: 0 | 1
  [key: string]: unknown
}
```

Мапінг `RawProduct` → `Product`:

| `Product` | ← `RawProduct` |
|-----------|----------------|
| `name` | `nomenclatureName` |
| `categoryName` | `categoryTitle` (або `''`) |
| `logo` | `logo` (крім дефолтного `/img/no.png` → `''`) |

## AppIntegration

Стан інтеграції mini-app із компанією. Повертається з [`setAppActive()`](/sdk/api#setappactive-isactive-title-settings).

```ts
interface AppIntegration {
  id: string
  company_id: string
  developer_id: string | null
  app_id: string
  is_active: 0 | 1
  settings: Record<string, unknown> | null
  created_at: string
  updated_at: string
}
```

## Числові булеві

Зверніть увагу: поля `active` / `is_active` мають тип `0 | 1`, а не `boolean` — так їх повертає Skyservice API. Для перевірки використовуйте `if (product.active)` (обидва `0`/`1` коректно приводяться до boolean).
