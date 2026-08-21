import { computed, ref, unref, type ComputedRef, type Ref } from 'vue';

type MaybeRef<T> = T | Ref<T> | ComputedRef<T>;

export interface UseTableSelectionOptions<T> {
  /** Ключ ідентифікатора рядка або функція, що його дістає. */
  rowId?: string | ((row: T) => string | number);
  /** Рядки, які не можна обрати (напр. вкладені модифікації). */
  selectable?: (row: T) => boolean;
}

export interface UseTableSelectionReturn<T> {
  selected: Ref<T[]>;
  selectedIds: ComputedRef<(string | number)[]>;
  isSelected: (row: T) => boolean;
  /** Усі доступні для вибору рядки обрані. */
  allSelected: ComputedRef<boolean>;
  /** Обрано частину — для indeterminate-стану чекбокса в шапці. */
  someSelected: ComputedRef<boolean>;
  /** Перемкнути рядок. `shift: true` виділяє діапазон від попереднього кліку. */
  toggle: (row: T, index: number, options?: { shift?: boolean }) => void;
  toggleAll: () => void;
  clear: () => void;
  /** Прибрати рядок із вибору за id — напр. після видалення. */
  remove: (id: string | number) => void;
}

/**
 * Вибір рядків: одиночний, shift-діапазон і select-all.
 *
 * На відміну від старої таблиці, нічого не мутує в чужих пропсах — стан живе
 * тут, а назовні віддається через `selected`.
 */
export function useTableSelection<T extends Record<string, any>>(
  rows: MaybeRef<T[]>,
  options: UseTableSelectionOptions<T> = {},
): UseTableSelectionReturn<T> {
  const { rowId = 'id', selectable } = options;

  const idOf = (row: T): string | number =>
    typeof rowId === 'function' ? rowId(row) : row[rowId];

  const selected = ref<T[]>([]) as Ref<T[]>;
  const lastIndex = ref<number | null>(null);

  const selectableRows = computed(() =>
    unref(rows).filter((r) => (selectable ? selectable(r) : true)),
  );

  const selectedIds = computed(() => selected.value.map(idOf));

  const isSelected = (row: T) => selectedIds.value.includes(idOf(row));

  const allSelected = computed(
    () =>
      selectableRows.value.length > 0 &&
      selected.value.length >= selectableRows.value.length,
  );

  const someSelected = computed(
    () => selected.value.length > 0 && !allSelected.value,
  );

  function add(row: T) {
    if (!isSelected(row)) selected.value = [...selected.value, row];
  }

  function drop(row: T) {
    const id = idOf(row);
    selected.value = selected.value.filter((r) => idOf(r) !== id);
  }

  function toggle(row: T, index: number, opts: { shift?: boolean } = {}) {
    const shouldSelect = !isSelected(row);

    if (opts.shift && lastIndex.value !== null) {
      const list = unref(rows);
      const [from, to] = [lastIndex.value, index].sort((a, b) => a - b);
      for (let i = from; i <= to; i += 1) {
        const item = list[i];
        if (!item || (selectable && !selectable(item))) continue;
        shouldSelect ? add(item) : drop(item);
      }
    } else {
      shouldSelect ? add(row) : drop(row);
    }

    lastIndex.value = index;
  }

  function toggleAll() {
    selected.value = allSelected.value ? [] : [...selectableRows.value];
  }

  const clear = () => {
    selected.value = [];
    lastIndex.value = null;
  };

  const remove = (id: string | number) => {
    selected.value = selected.value.filter((r) => idOf(r) !== id);
  };

  return {
    selected,
    selectedIds,
    isSelected,
    allSelected,
    someSelected,
    toggle,
    toggleAll,
    clear,
    remove,
  };
}
