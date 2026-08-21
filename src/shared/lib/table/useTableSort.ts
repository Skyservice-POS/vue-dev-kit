import { ref, type Ref } from 'vue';
import type { SortState, SortDirection } from '../../ui/table/types';

export interface UseTableSortOptions {
  /** Початковий стан сортування. */
  initial?: Partial<SortState>;
  /**
   * Чи проходити через стан «без сортування» на третьому кліку.
   * За замовчуванням `false` — клік лише перемикає asc ⇄ desc, як у старій таблиці.
   */
  tristate?: boolean;
}

export interface UseTableSortReturn {
  sort: Ref<SortState>;
  /** Перемкнути сортування за полем. Повертає новий стан — зручно для запиту. */
  toggle: (field: string) => SortState;
  /** Напрям для конкретного поля (`''`, якщо сортуємо не за ним). */
  directionOf: (field: string) => SortDirection;
  reset: () => void;
}

/**
 * Стан сортування без будь-якої прив'язки до розмітки.
 *
 * Сортування тут *не виконується* — композабл лише тримає `{ of, ot }`.
 * Дані сортує сервер (або застосунок), як і в старій таблиці: на кожен toggle
 * ви робите запит із новим станом.
 */
export function useTableSort(
  options: UseTableSortOptions = {},
): UseTableSortReturn {
  const { initial = {}, tristate = false } = options;

  const sort = ref<SortState>({
    of: initial.of ?? '',
    ot: initial.ot ?? '',
  });

  function toggle(field: string): SortState {
    if (sort.value.of !== field) {
      sort.value = { of: field, ot: 'asc' };
    } else if (sort.value.ot === 'asc') {
      sort.value = { of: field, ot: 'desc' };
    } else if (sort.value.ot === 'desc') {
      sort.value = tristate ? { of: '', ot: '' } : { of: field, ot: 'asc' };
    } else {
      sort.value = { of: field, ot: 'asc' };
    }
    return { ...sort.value };
  }

  const directionOf = (field: string): SortDirection =>
    sort.value.of === field ? sort.value.ot : '';

  const reset = () => {
    sort.value = { of: '', ot: '' };
  };

  return { sort, toggle, directionOf, reset };
}
