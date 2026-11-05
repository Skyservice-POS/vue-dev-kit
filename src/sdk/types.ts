// --- API response wrapper ---

export interface SkyserviceResponse<T> {
  status: string;
  data: T;
}

// --- Integrations ---

export interface AppIntegration {
  id: string;
  company_id: string;
  developer_id: string | null;
  app_id: string;
  is_active: 0 | 1;
  settings: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

// --- Permissions ---

/**
 * Access permissions map — access-code → granted.
 *
 * Mirrors Dashboard's `store.perms` (e.g. `{ '9006': true, '100': false }`).
 * A missing code means "not granted". Returned by `SkyserviceAPI.getPerms()`.
 */
export type PermsMap = Record<string, boolean>;

// --- Tradepoints ---

export interface Tradepoint {
  tradepointId: number;
  tradepointName: string;
  contacts: {
    address?: string;
  };
  workTime: Record<string, TradepointWorkDay>;
  deleted: boolean;
  frozen: boolean;
}

export interface TradepointWorkDay {
  name: string;
  isOpen: boolean;
  startTiem: string;
  endTiem: string;
}

// --- Categories ---

export interface Category {
  id: number;
  pid: number;
  name: string;
  active: 0 | 1;
  background: string;
  show: boolean;
  img?: string;
  children?: Category[];
}

/**
 * Raw category from Skyservice API — includes per-tradepoint visibility.
 * Stripped down to `Category` by SkyserviceAPI methods.
 */
export interface RawCategory extends Category {
  tradepointShow: Record<string, boolean>;
  tradepointsShow?: Record<string, unknown>;
  children?: RawCategory[];
}

// --- Products ---

export interface Product {
  id: number;
  name: string;
  price: number;
  categoryId: number | null;
  categoryName: string;
  active: 0 | 1;
  type: 'product' | 'techcard';
  unit: string;
  logo: string;
}

/**
 * Raw product from Skyservice API — includes POS-specific fields.
 * Stripped down to `Product` by SkyserviceAPI methods.
 */
export interface RawProduct {
  id: number;
  nomenclatureName: string;
  nomenclatureCode: string;
  nomenclatureId: number;
  price: number;
  categoryId: number | null;
  categoryTitle: string;
  active: 0 | 1;
  defaultActive: 0 | 1;
  type: string;
  unit: string;
  weight: number;
  logo: string;
  background: string;
  workshopId: number;
  activeProductAppearance: 0 | 1;
  [key: string]: unknown;
}

// ─── Модалки Dashboard (openModal) ───

/** Контекст модалки документа: Dashboard ставить цю точку поточною на час модалки */
export interface DashboardModalTradepointContext {
  tradepointId: number;
}

/**
 * Каталог модалок, які Dashboard відкриває поверх iframe (`openModal`).
 * Ключ — `документ.дія`; для кожного — контекст, параметри й дані успішного результату.
 *
 * Новий ключ з'являється тут разом із його адаптером у реєстрі Dashboard (`src/modals/registry.js`).
 * Правило версіонування: параметри лише додаються; зміна змісту — новий ключ.
 */
export interface DashboardModals {
  /** Нове надходження. З `supplierOrderId` товари (решта до отримання), ціни й постачальник — із замовлення */
  'coming.create': {
    context: DashboardModalTradepointContext;
    params: {
      warehouseId: number;
      /** Замовлення постачальнику — підстава надходження */
      supplierOrderId?: number;
      /** Постачальник (counterpartyId), коли замовлення немає */
      supplierId?: number;
      comment?: string;
    };
    data: {
      /** `null`, якщо Dashboard не повернув id нового документа */
      documentId: number | null;
    };
  };
}

export type DashboardModalKey = keyof DashboardModals;

/**
 * Чому модалку не відкрито.
 * `not_in_iframe`, `no_response` (Dashboard не підтвердив — старий) — визначає SDK; решту повертає Dashboard.
 */
export type DashboardModalRefusal =
  | 'not_in_iframe'
  | 'no_response'
  | 'unknown_modal'
  | 'no_permissions'
  | 'invalid_params'
  | 'busy';

export type DashboardModalResult<K extends DashboardModalKey = DashboardModalKey> =
  /** Документ створено / змінено */
  | { status: 'done'; data: DashboardModals[K]['data'] }
  /** Модалку закрили без результату */
  | { status: 'cancelled' }
  /**
   * Модалка відкрилась, але дія неможлива: `order_unavailable` чи `create_failed` (бек не провів документ).
   * `error` — сирий код помилки бека, `message` — текст, який показав би Dashboard (мовою користувача)
   */
  | { status: 'error'; reason: string; error?: string; message?: string }
  /** Модалку не відкрито. `field` — яке поле не пройшло для `invalid_params` */
  | { status: 'refused'; reason: DashboardModalRefusal | (string & {}); field?: string };

/** Відповідь `getModals`: які ключі є в цьому Dashboard і чи дозволені користувачу */
export type DashboardModalsAvailability = Partial<Record<DashboardModalKey | (string & {}), { allowed: boolean }>>;
