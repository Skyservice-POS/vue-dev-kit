import type { ComputedRef, InjectionKey } from 'vue';

/** Опис колонки. Мінімум — `name`; решта опційна. */
export interface SkyTableColumn {
  /** Ключ у рядку даних і водночас ідентифікатор колонки. */
  name: string;
  /** Заголовок у шапці. Без нього колонка рендериться без підпису. */
  title?: string;
  /** Фіксована ширина в px. Має пріоритет над `widthFr`. */
  width?: number;
  /** Гнучка ширина (частка вільного простору), якщо `width` не заданий. */
  widthFr?: number;
  /** Поле сортування. `true` — сортувати за `name`, рядок — за іншим полем. */
  sortable?: boolean | string;
  /** Ховати колонку на екранах, вужчих за це значення (px). */
  minWidthScreen?: number;
  /** Вирівнювання вмісту комірки. */
  align?: 'left' | 'center' | 'right';
}

export type SortDirection = 'asc' | 'desc' | '';

export interface SortState {
  /** Поле, за яким сортуємо. */
  of: string;
  /** Напрям: `asc` | `desc` | `''` (без сортування). */
  ot: SortDirection;
}

export interface SkyTableContext {
  columns: ComputedRef<SkyTableColumn[]>;
  /** Значення grid-template-columns, спільне для шапки, рядків і футера. */
  gridTemplate: ComputedRef<string>;
}

/**
 * Контекст ділиться між Root і дочірніми примітивами, щоб колонки шапки й тіла
 * рахувались з одного джерела й не розʼїжджались.
 */
export const SKY_TABLE_CONTEXT: InjectionKey<SkyTableContext> =
  Symbol('sky-table');
