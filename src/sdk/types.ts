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
