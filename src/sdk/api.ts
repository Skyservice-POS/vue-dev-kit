import type {
  SkyserviceResponse,
  Tradepoint,
  Category,
  RawCategory,
  Product,
  RawProduct,
  AppIntegration,
  PermsMap,
} from './types';
import { getStoreData } from './bridge';

export interface SkyserviceAPIConfig {
  token: string;
  domain: string;
  companyId: string;
  appId: string;
  developerId?: string;
  deploymentId?: string;
  appName?: string;
}

const INTEGRATIONS_URL = 'https://api.cabinet.developer.skyservice.online/index.php';

/**
 * HTTP client for Skyservice API.
 *
 * Works anywhere (browser, Node, edge) — no iframe dependency.
 *
 * @example
 * ```ts
 * const api = SkyserviceAPI.create({
 *   token,
 *   domain: 'api.skyservice.online',
 *   companyId,
 *   appId,
 * });
 * const tradepoints = await api.getTradepoints();
 * ```
 */
export class SkyserviceAPI {
  private baseUrl: string;
  private token: string;
  private companyId: string;
  private appId: string;
  private developerId: string | undefined;
  private deploymentId: string | undefined;
  private appName: string | undefined;
  private permsCache: PermsMap | null = null;

  private constructor(config: SkyserviceAPIConfig) {
    this.token = config.token;
    this.companyId = config.companyId;
    this.appId = config.appId;
    this.developerId = config.developerId;
    this.deploymentId = config.deploymentId;
    this.appName = config.appName;
    const domain = config.domain.replace('dashboard', 'api');
    this.baseUrl = domain.startsWith('http') ? domain : `https://${domain}`;
  }

  /** Factory — create a new SkyserviceAPI instance. */
  static create(config: SkyserviceAPIConfig): SkyserviceAPI {
    return new SkyserviceAPI(config);
  }

  // --- Low-level ---

  private async get<T>(params: Record<string, string>): Promise<T> {
    const searchParams = new URLSearchParams({
      token: this.token,
      companyId: this.companyId,
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

  private async post<T>(
    url: string,
    params: Record<string, string>,
    body: Record<string, unknown>,
  ): Promise<T> {
    const searchParams = new URLSearchParams({
      token: this.token,
      ...params,
    });

    const response = await fetch(`${url}?${searchParams}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

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
    const data = await this.get<{ items: Tradepoint[]; total: number }>({
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
    const raw = await this.get<RawCategory[]>({
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
    const raw = await this.get<{
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

  // --- Integrations ---

  /**
   * Activate or deactivate the mini-app for the current company.
   *
   * Sends POST to `api.cabinet.developer.skyservice.online/index.php`:
   * - `isActive: true`  → `section=integrations&action=activateApp`
   * - `isActive: false` → `section=integrations&action=deactivateApp`
   *
   * `settings` are sent only when activating.
   *
   * If `deploymentId` and `appName` were provided in config, also sends a
   * `sendActiveApp` postMessage to Dashboard (parent window) with the new state.
   */
  async setAppActive({
    isActive,
    title,
    settings,
  }: {
    isActive: boolean;
    title?: string;
    settings?: Record<string, unknown>;
  }): Promise<AppIntegration> {
    const action = isActive ? 'activateApp' : 'deactivateApp';
    const body: Record<string, unknown> = {
      company_id: this.companyId,
      app_id: this.appId,
      ...(this.developerId !== undefined && { developer_id: this.developerId }),
      ...(isActive && settings !== undefined && { settings }),
    };

    const data = await this.post<AppIntegration>(
      INTEGRATIONS_URL,
      { section: 'integrations', action },
      body,
    );

    if (
      this.deploymentId &&
      this.appName &&
      typeof window !== 'undefined' &&
      window.self !== window.top
    ) {
      window.parent.postMessage(
        {
          type: 'sendActiveApp',
          id: data.id,
          is_active: isActive,
          deploymentId: this.deploymentId,
          appName: this.appName,
          title,
        },
        '*',
      );
    }

    return data;
  }

  // --- Permissions ---

  /**
   * Get access permissions for the current user.
   *
   * Source priority:
   * 1. Dashboard's Vuex store via iframe bridge (`getStoreData('perms')`) —
   *    instant, no token needed, includes Dashboard's computed perms. Used when
   *    running inside the Dashboard iframe.
   * 2. HTTP fallback `section=adminPanel&action=getStart` → `data.settings.perms`
   *    — used outside the iframe (standalone page, Node) or while the store is
   *    still empty.
   *
   * The resolved map is cached on the instance — repeated calls don't re-request.
   * Call {@link clearPermsCache} to force a refetch.
   *
   * @example
   * ```ts
   * await api.getPerms('9006') // → boolean — is permission 9006 granted?
   * await api.getPerms()       // → { '9006': true, '100': false, ... }
   * ```
   */
  async getPerms(): Promise<PermsMap>;
  async getPerms(code: string | number): Promise<boolean>;
  async getPerms(code?: string | number): Promise<PermsMap | boolean> {
    const perms = await this.loadPerms();
    if (code === undefined) return perms;
    return Boolean(perms[String(code)]);
  }

  /** Drop the cached permissions so the next {@link getPerms} call refetches. */
  clearPermsCache(): void {
    this.permsCache = null;
  }

  private async loadPerms(): Promise<PermsMap> {
    if (this.permsCache) return this.permsCache;

    // 1. Dashboard store via iframe bridge — instant, no token needed.
    //    `store.perms` always carries Dashboard's synthetic perms once loaded,
    //    so an empty object means "not loaded yet" → fall through to HTTP.
    if (typeof window !== 'undefined') {
      try {
        const fromStore = await getStoreData<Record<string, unknown>>('perms');
        if (fromStore && Object.keys(fromStore).length > 0) {
          this.permsCache = normalizePerms(fromStore);
          return this.permsCache;
        }
      } catch {
        // bridge unavailable / not in iframe — fall through to HTTP
      }
    }

    // 2. HTTP fallback — section=adminPanel&action=getStart.
    const data = await this.get<{
      settings?: { perms?: Record<string, unknown> };
    }>({
      section: 'adminPanel',
      action: 'getStart',
    });

    this.permsCache = normalizePerms(data?.settings?.perms);
    return this.permsCache;
  }
}

// --- Helpers ---

/** Coerce a raw perms object (boolean or 0/1 values) into a clean boolean map. */
function normalizePerms(raw: Record<string, unknown> | null | undefined): PermsMap {
  const result: PermsMap = {};
  if (!raw || typeof raw !== 'object') return result;

  for (const [code, value] of Object.entries(raw)) {
    result[code] = Boolean(value);
  }

  return result;
}

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
