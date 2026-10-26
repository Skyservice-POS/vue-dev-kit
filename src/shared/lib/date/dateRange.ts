/**
 * Дати як рядки `YYYY-MM-DD` у локальному часовому поясі. Рядок, а не Date:
 * саме так дати їдуть у запити, рядки порівнюються лексикографічно, і немає
 * зсуву на добу, який дає `toISOString()` (UTC) ввечері.
 */
export interface DateRange {
  start: string | null;
  end: string | null;
}

/** Кнопка швидкого вибору. `range` — функція, щоб «сьогодні» рахувалось у момент кліку. */
export interface DatePreset {
  label: string;
  range: () => { start: string; end: string };
}

export function toISODate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function parseISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function today(): string {
  return toISODate(new Date());
}

export function addDays(s: string, n: number): string {
  const d = parseISODate(s);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

/** Скільки днів від `a` до `b` (від'ємне, якщо `b` раніше). */
export function diffDays(a: string, b: string): number {
  // Через UTC: інакше перехід на літній час дає 23/25-годинну добу і дробовий результат.
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
}

/** `2026-10-26` → `26.10.2026`. */
export function formatDate(s: string): string {
  const [y, m, d] = s.split('-');
  return `${d}.${m}.${y}`;
}

/** Підпис періоду: один день — одна дата, інакше «від – до». */
export function formatDateRange(r: DateRange): string {
  if (!r.start || !r.end) return '';
  return r.start === r.end ? formatDate(r.start) : `${formatDate(r.start)} – ${formatDate(r.end)}`;
}

function monthBounds(year: number, month: number): { start: string; end: string } {
  return { start: toISODate(new Date(year, month, 1)), end: toISODate(new Date(year, month + 1, 0)) };
}

/** Будівельні блоки для своїх наборів кнопок. */
export const datePresets = {
  today: (label = 'Сьогодні'): DatePreset => ({ label, range: () => ({ start: today(), end: today() }) }),
  yesterday: (label = 'Вчора'): DatePreset => ({
    label,
    range: () => {
      const d = addDays(today(), -1);
      return { start: d, end: d };
    },
  }),
  /** Поточний тиждень, пн–нд. */
  thisWeek: (label = 'Тиждень'): DatePreset => ({
    label,
    range: () => {
      const t = today();
      const start = addDays(t, -((parseISODate(t).getDay() + 6) % 7));
      return { start, end: addDays(start, 6) };
    },
  }),
  /** З 1-го числа поточного місяця по сьогодні. */
  monthToDate: (label = 'Місяць'): DatePreset => ({
    label,
    range: () => ({ start: `${today().slice(0, 8)}01`, end: today() }),
  }),
  /** Останні `n` днів включно з сьогодні. */
  lastDays: (n: number, label = `${n} днів`): DatePreset => ({
    label,
    range: () => ({ start: addDays(today(), -(n - 1)), end: today() }),
  }),
  thisMonth: (label = 'Цей місяць'): DatePreset => ({
    label,
    range: () => {
      const d = new Date();
      return monthBounds(d.getFullYear(), d.getMonth());
    },
  }),
  lastMonth: (label = 'Минулий місяць'): DatePreset => ({
    label,
    range: () => {
      const d = new Date();
      return monthBounds(d.getFullYear(), d.getMonth() - 1);
    },
  }),
  /** Календарний квартал `q` (1–4) року `year`. */
  quarter: (year: number, q: 1 | 2 | 3 | 4, label = `${['I', 'II', 'III', 'IV'][q - 1]} кв. ${year}`): DatePreset => ({
    label,
    range: () => ({
      start: toISODate(new Date(year, (q - 1) * 3, 1)),
      end: toISODate(new Date(year, q * 3, 0)),
    }),
  }),
};

/** Набір за замовчуванням: Сьогодні, Вчора, Тиждень, Місяць. */
export function defaultDatePresets(): DatePreset[] {
  return [datePresets.today(), datePresets.yesterday(), datePresets.thisWeek(), datePresets.monthToDate()];
}

/** Чотири квартали року — податкові квартали в Україні збігаються з календарними. */
export function quarterPresets(year: number): DatePreset[] {
  return ([1, 2, 3, 4] as const).map((q) => datePresets.quarter(year, q));
}
