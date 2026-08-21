import { computed, ref, unref, watch, type ComputedRef, type Ref } from 'vue';
import type { SkyTableColumn } from '../../ui/table/types';

type MaybeRef<T> = T | Ref<T> | ComputedRef<T>;

export interface UseColumnVisibilityOptions {
  /**
   * Ключ у localStorage для збереження вибору користувача. Без нього
   * налаштування живуть лише до перезавантаження сторінки.
   */
  storageKey?: string;
  /** Колонки, приховані за замовчуванням. */
  hidden?: string[];
}

export interface UseColumnVisibilityReturn {
  /** Мапа `name → показувати`. Придатна для v-model у налаштуваннях колонок. */
  visibility: Ref<Record<string, boolean>>;
  /** Колонки, які треба віддати в SkyTableRoot. */
  visibleColumns: ComputedRef<SkyTableColumn[]>;
  toggle: (name: string) => void;
  reset: () => void;
}

/**
 * Видимість колонок із опційним збереженням у localStorage.
 *
 * Стара таблиця тримала це у внутрішньому стані й дублювала в `header[].enable`,
 * тож зовні дізнатись про вибір користувача було нічим.
 */
export function useColumnVisibility(
  columns: MaybeRef<SkyTableColumn[]>,
  options: UseColumnVisibilityOptions = {},
): UseColumnVisibilityReturn {
  const { storageKey, hidden = [] } = options;

  const defaults = (): Record<string, boolean> =>
    Object.fromEntries(
      unref(columns).map((c) => [c.name, !hidden.includes(c.name)]),
    );

  const restore = (): Record<string, boolean> => {
    const base = defaults();
    if (!storageKey || typeof localStorage === 'undefined') return base;
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      // Мержимо, а не підставляємо: у збереженій мапі може не бути колонок,
      // які додали в новій версії застосунку.
      return saved ? { ...base, ...saved } : base;
    } catch {
      return base;
    }
  };

  const visibility = ref<Record<string, boolean>>(restore());

  if (storageKey) {
    watch(
      visibility,
      (value) => {
        try {
          localStorage.setItem(storageKey, JSON.stringify(value));
        } catch {
          // приватний режим / переповнений сторедж — не критично
        }
      },
      { deep: true },
    );
  }

  const visibleColumns = computed(() =>
    unref(columns).filter((c) => visibility.value[c.name] !== false),
  );

  const toggle = (name: string) => {
    visibility.value = {
      ...visibility.value,
      [name]: !visibility.value[name],
    };
  };

  const reset = () => {
    visibility.value = defaults();
  };

  return { visibility, visibleColumns, toggle, reset };
}
