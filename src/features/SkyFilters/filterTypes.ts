import { markRaw, type Component } from 'vue';
import CheckboxPanel from '@/shared/ui/SkyFilterDropdown/panels/CheckboxPanel.vue';
import RadioPanel from '@/shared/ui/SkyFilterDropdown/panels/RadioPanel.vue';
import RangePanel from '@/shared/ui/SkyFilterDropdown/panels/RangePanel.vue';
import SearchPanel from '@/shared/ui/SkyFilterDropdown/panels/SearchPanel.vue';
import DatePanel from '@/shared/ui/SkyFilterDropdown/panels/DatePanel.vue';
import type { DateCheckContext } from '@/shared/ui/SkyFilterDropdown/panels/DatePanel.vue';
import { formatDateRange, type DatePreset, type DateRange } from '@/shared/lib/date/dateRange';
import type { RadioWithInput } from '@/shared/ui/SkyFilterDropdown/panels/RadioPanel.vue';
import type { RangeValue } from '@/shared/ui/SkyFilterDropdown/panels/RangePanel.vue';
import type { SearchFetch, SearchPage } from '@/shared/ui/SkyFilterDropdown/panels/SearchPanel.vue';

export type { RadioWithInput, RangeValue, SearchFetch, SearchPage, DateRange, DatePreset, DateCheckContext };

export type FilterOptionValue = string | number;

export interface FilterOption {
  value: FilterOptionValue;
  name: string;
}

export interface SkyFiltersLabels {
  allFilters: string;
  active: string;
  pcs: string;
  reset: string;
  ok: string;
  done: string;
  clear: string;
  selectAll: string;
  search: string;
  empty: string;
  loading: string;
  loadMore: string;
}

export const defaultSkyFiltersLabels: SkyFiltersLabels = {
  allFilters: 'Усі фільтри',
  active: 'Активно',
  pcs: 'шт.',
  reset: 'Скинути фільтри',
  ok: 'OK',
  done: 'Готово',
  clear: 'Очистити',
  selectAll: 'Обрати все',
  search: 'Пошук',
  empty: 'Нічого не знайдено',
  loading: 'Завантаження…',
  loadMore: 'Показати ще',
};

/** Як фільтр виглядає в тригері й у шторі. `count` — скільки обрано; 0 — фільтр вимкнено. */
export interface FilterDisplay {
  summary?: string;
  badge?: string | number;
  count: number;
}

export interface SkyFilterConfig {
  /** Ключ у v-model-об'єкті. */
  key: string;
  title: string;
  /** `checkbox` (за замовчуванням) | `radio` | `range` | `search` | `date` | свій, зареєстрований через registerFilterType. */
  type?: string;
  options?: FilterOption[];
  searchable?: boolean;
  /** checkbox: «Обрати все». */
  selectAll?: boolean;
  /** radio: кнопка «Очистити». */
  clearable?: boolean;
  /** radio: пункти з числовим інпутом; значення стає `{ value, input }`. */
  inputFor?: FilterOptionValue[];
  inputHint?: string;
  /** range: числові межі; date: межі дат `YYYY-MM-DD`. */
  min?: number | string;
  max?: number | string;
  step?: number;
  /** date: найдовший період у днях. */
  maxDays?: number;
  /** date: своє правило виключення дати. */
  disabledDate?: (date: string, ctx: DateCheckContext) => boolean;
  /** date: кнопки швидкого вибору; `[]` — без них. */
  presets?: DatePreset[];
  /** search: завантаження сторінки. */
  fetch?: SearchFetch;
  /** Ширина панелі дропдауна, px. */
  width?: number;
  /** У шторі секція згорнута, доки в ній нічого не обрано. */
  collapsed?: boolean;
  /** Показувати фільтр, навіть коли опцій нема. */
  keepEmpty?: boolean;
  disabled?: boolean;
  /** Свій вміст панелі — перекриває компонент типу. */
  component?: Component;
  emptyValue?: () => unknown;
  display?: (value: unknown, filter: SkyFilterConfig) => FilterDisplay;
  [extra: string]: unknown;
}

/**
 * Опис типу фільтра. `component` отримує `modelValue`, `disabled` і те, що поверне
 * `props(filter, labels)`; за замовчуванням — `{ filter, labels }`. Емітить
 * `update:modelValue`.
 */
export interface FilterTypeDef {
  component: Component;
  emptyValue: (filter: SkyFilterConfig) => unknown;
  display: (value: unknown, filter: SkyFilterConfig) => FilterDisplay;
  props?: (filter: SkyFilterConfig, labels: SkyFiltersLabels) => Record<string, unknown>;
  /** false — фільтр нема з чого обирати, рядок його ховає. */
  hasItems?: (filter: SkyFilterConfig) => boolean;
}

/** Довга назва в тригері розпирала б рядок — після 20 символів обрізаємо. */
function short(name: string): string {
  return name.length < 20 ? name : name.slice(0, 20) + '...';
}

function nameOf(filter: SkyFilterConfig, value: unknown): string {
  return filter.options?.find((o) => o.value === value)?.name ?? '';
}

function listDisplay(names: string[]): FilterDisplay {
  const count = names.length;
  return {
    count,
    summary: count === 1 && names[0] ? short(names[0]) : '',
    badge: count > 1 ? count : '',
  };
}

const hasOptions = (f: SkyFilterConfig) => (f.options?.length ?? 0) > 0;

const registry: Record<string, FilterTypeDef> = {
  checkbox: {
    component: markRaw(CheckboxPanel),
    emptyValue: () => [],
    hasItems: hasOptions,
    display: (v, f) => listDisplay(((v as FilterOptionValue[]) ?? []).map((x) => nameOf(f, x))),
    props: (f, l) => ({
      options: f.options ?? [],
      title: f.title,
      selectAll: f.selectAll ?? true,
      searchable: f.searchable ?? true,
      selectAllLabel: l.selectAll,
      clearLabel: l.clear,
      searchPlaceholder: l.search,
    }),
  },

  radio: {
    component: markRaw(RadioPanel),
    emptyValue: (f) => (f.inputFor?.length ? { value: null, input: '' } : null),
    hasItems: hasOptions,
    display: (v, f) => {
      if (f.inputFor?.length) {
        const c = (v ?? {}) as Partial<RadioWithInput>;
        if (c.value == null) return { count: 0 };
        const needsNumber = f.inputFor.includes(c.value);
        // Обрано пункт, що вимагає числа, а числа нема — фільтр ще не застосований.
        if (needsNumber && !c.input) return { count: 0 };
        return { count: 1, summary: short(nameOf(f, c.value)), badge: needsNumber ? c.input : '' };
      }
      if (v == null) return { count: 0 };
      return { count: 1, summary: short(nameOf(f, v)) };
    },
    props: (f, l) => ({
      options: f.options ?? [],
      title: f.title,
      inputFor: f.inputFor ?? [],
      inputHint: f.inputHint ?? '',
      clearable: f.clearable ?? true,
      searchable: f.searchable ?? false,
      clearLabel: l.clear,
      searchPlaceholder: l.search,
      emptyLabel: l.empty,
    }),
  },

  range: {
    component: markRaw(RangePanel),
    emptyValue: () => ({ from: null, to: null }),
    display: (v) => {
      const r = (v ?? {}) as Partial<RangeValue>;
      if (r.from == null || r.to == null) return { count: 0 };
      return { count: 1, badge: `${r.from} - ${r.to}` };
    },
    props: (f) => ({ min: Number(f.min ?? 0), max: Number(f.max ?? 100), step: f.step ?? 1 }),
  },

  date: {
    component: markRaw(DatePanel),
    emptyValue: () => ({ start: null, end: null }),
    display: (v) => {
      const r = (v ?? {}) as Partial<DateRange>;
      if (!r.start || !r.end) return { count: 0 };
      return { count: 1, badge: formatDateRange(r as DateRange) };
    },
    props: (f, l) => ({
      min: f.min as string | undefined,
      max: f.max as string | undefined,
      maxDays: f.maxDays,
      disabledDate: f.disabledDate,
      // Без пропа — стандартні кнопки панелі; undefined їх не перебиває.
      presets: f.presets,
      clearable: true,
      clearLabel: l.clear,
    }),
  },

  search: {
    component: markRaw(SearchPanel),
    emptyValue: () => [],
    display: (v) => listDisplay(((v as FilterOption[]) ?? []).map((o) => o.name)),
    props: (f, l) => ({
      fetch: f.fetch,
      title: f.title,
      clearLabel: l.clear,
      searchPlaceholder: l.search,
      emptyLabel: l.empty,
      loadingLabel: l.loading,
      loadMoreLabel: l.loadMore,
    }),
  },
};

/** Реєструє свій тип фільтра раз на застосунок — далі його вмикає `type: '<name>'` у конфігу. */
export function registerFilterType(name: string, def: FilterTypeDef): void {
  registry[name] = { ...def, component: markRaw(def.component) };
}

/** Опис типу з урахуванням перевизначень у самому конфігу фільтра. */
export function resolveFilterType(filter: SkyFilterConfig): FilterTypeDef {
  // Свій компонент без type — повністю свій фільтр, а не перефарбований checkbox.
  const base = filter.component && !filter.type ? undefined : registry[filter.type ?? 'checkbox'];
  if (!base && !filter.component) {
    throw new Error(`[SkyFilters] Невідомий тип фільтра "${filter.type}" (ключ "${filter.key}")`);
  }
  const def: FilterTypeDef = base ?? {
    component: filter.component!,
    emptyValue: () => null,
    display: (v) => ({ count: v == null || (Array.isArray(v) && !v.length) ? 0 : 1 }),
  };
  if (!filter.component && !filter.emptyValue && !filter.display) return def;
  return {
    ...def,
    // Свій компонент зі своїм API не отримує пропів вбудованого типу.
    ...(filter.component ? { component: markRaw(filter.component), props: undefined } : {}),
    ...(filter.emptyValue ? { emptyValue: filter.emptyValue } : {}),
    ...(filter.display ? { display: filter.display } : {}),
  };
}

export function panelProps(filter: SkyFilterConfig, def: FilterTypeDef, labels: SkyFiltersLabels): Record<string, unknown> {
  return def.props ? def.props(filter, labels) : { filter, labels };
}
