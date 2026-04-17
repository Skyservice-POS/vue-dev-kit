import type {
  SkyserviceResponse,
  Tradepoint,
  Category,
  RawCategory,
  Product,
  RawProduct,
} from './types';

export interface SkyserviceAPIConfig {
  token: string;
  domain: string;
  companyId?: string;
}

/**
 * HTTP client for Skyservice API.
 *
 * Works anywhere (browser, Node, edge) — no iframe dependency.
 *
 * @example
 * ```ts
 * const api = new SkyserviceAPI({ token, domain: 'api.skyservice.online' });
 * const tradepoints = await api.getTradepoints();
 * const categories = await api.getCategoryTree(tradepointId);
 * ```
 */
export class SkyserviceAPI {
  private baseUrl: string;
  private token: string;
  private companyId: string | undefined;

  constructor(config: SkyserviceAPIConfig) {
    this.token = config.token;
    this.companyId = config.companyId;
    // Ensure domain is api, not dashboard
    const domain = config.domain.replace('dashboard', 'api');
    this.baseUrl = domain.startsWith('http') ? domain : `https://${domain}`;
  }

  // --- Low-level ---

  private async request<T>(params: Record<string, string>): Promise<T> {
    const searchParams = new URLSearchParams({
      token: this.token,
      ...(this.companyId ? { companyId: this.companyId } : {}),
      ...params,
    });

    const response = await fetch(`${this.baseUrl}/?${searchParams}`);

    if (!response.ok) {
      throw new Error(`Skyservice API error: ${response.status}`);
    }

    const json: SkyserviceResponse<T> = await response.json();

    if (json.status !== 'done') {
      throw new Error(`Skyservice API returned status: ${json.status}`);
    }

    return json.data;
  }

  // --- Tradepoints ---

  /**
   * Get all tradepoints for the current company.
   * Filters out deleted and frozen by default.
   */
  async getTradepoints(options?: {
    includeDeleted?: boolean;
  }): Promise<Tradepoint[]> {
    const data = await this.request<{ items: Tradepoint[]; total: number }>({
      section: 'tradepoints',
      action: 'getTradepoints',
    });

    if (options?.includeDeleted) return data.items;
    return data.items.filter((tp) => !tp.deleted && !tp.frozen);
  }

  // --- Categories ---

  /**
   * Get the full category tree, cleaned from POS-specific bloat.
   *
   * Returns only fields relevant for menu building:
   * `id`, `pid`, `name`, `active`, `background`, `show`, `img`, `children`.
   *
   * If `tradepointId` is provided, filters to categories visible for that tradepoint.
   */
  async getCategoryTree(tradepointId?: number): Promise<Category[]> {
    const raw = await this.request<RawCategory[]>({
      section: 'productCategory',
      action: 'getCategories',
      ...(tradepointId ? { tradepointId: String(tradepointId) } : {}),
    });

    return stripCategories(raw, tradepointId);
  }

  // --- Products ---

  /**
   * Get products, cleaned from POS-specific fields.
   *
   * Filters out ingredients by default — returns only sellable items
   * (type `product` or `techcard`).
   *
   * If `tradepointId` is provided, scopes to that tradepoint.
   */
  async getProducts(options?: {
    tradepointId?: number;
    includeInactive?: boolean;
  }): Promise<Product[]> {
    const raw = await this.request<{
      items: RawProduct[];
      total: number;
    }>({
      section: 'products',
      action: 'getProducts',
      pagelimit: '9999',
      ot: 'desc',
      of: 'nomenclatureId',
      ...(options?.tradepointId
        ? { tradepointId: String(options.tradepointId) }
        : {}),
    });

    return stripProducts(raw.items, options?.includeInactive);
  }
}

// --- Helpers ---

function stripCategories(
  categories: RawCategory[],
  tradepointId?: number,
): Category[] {
  const result: Category[] = [];

  for (const raw of categories) {
    if (tradepointId != null) {
      const visible = raw.tradepointShow?.[String(tradepointId)];
      if (!visible) continue;
    }

    const category: Category = {
      id: raw.id,
      pid: raw.pid,
      name: raw.name,
      active: raw.active,
      background: raw.background,
      show: raw.show,
    };

    if (raw.img) {
      category.img = raw.img;
    }

    if (raw.children?.length) {
      category.children = stripCategories(raw.children, tradepointId);
    }

    result.push(category);
  }

  return result;
}

const SELLABLE_TYPES = new Set(['product', 'techcard']);
const DEFAULT_LOGO = '/img/no.png';

function stripProducts(
  products: RawProduct[],
  includeInactive?: boolean,
): Product[] {
  const result: Product[] = [];

  for (const raw of products) {
    if (!SELLABLE_TYPES.has(raw.type)) continue;
    if (!includeInactive && !raw.active) continue;

    result.push({
      id: raw.id,
      name: raw.nomenclatureName,
      price: raw.price,
      categoryId: raw.categoryId,
      categoryName: raw.categoryTitle || '',
      active: raw.active,
      type: raw.type as 'product' | 'techcard',
      unit: raw.unit,
      logo: raw.logo && raw.logo !== DEFAULT_LOGO ? raw.logo : '',
    });
  }

  return result;
}
