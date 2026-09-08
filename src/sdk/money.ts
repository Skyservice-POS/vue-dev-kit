/**
 * Гроші: значок валюти й форматування суми. Живе в SDK, бо тут немає Vue —
 * адмінка на Vue 2 не може імпортувати компоненти кіта, а цей модуль може взяти.
 *
 * Формат зведений із адмінкою (`CurrencyFormatted` + `formatNumberWithSpaces`
 * у mathExtended.js): дві копійки, тисячі через пробіл, крапка як десятковий
 * роздільник. Локальні розділювачі свідомо не беремо — інакше та сама сума
 * виглядала б по-різному в адмінці й у міні-аппі.
 */

/** ISO → значок. Список курований під наші ринки, узятий з адмінки. */
export const CURRENCY_ICONS: Record<string, string> = {
  UAH: '₴',
  USD: '$',
  EUR: '€',
  KZT: '₸',
  GEL: 'ლ',
  THB: '฿',
  AMD: '֏',
  BYN: 'Br',
  AZN: '₼',
  GHS: '₵',
  KGS: 'с',
  PLN: 'zł',
  UZS: 'soʻm',
  PHP: '₱',
  IDR: 'Rp',
  TJS: 'с',
  DOP: '$',
  NZD: '$',
  TRY: '₺',
  SGD: '$',
  NGN: '₦',
  MVR: 'Rf',
  TMT: 'm',
  MDL: 'L',
  VND: '₫',
  CRC: '₡',
  INR: '₹',
  CNY: '¥',
  AED: '.د.إ',
  LKR: '₨',
  RON: 'L',
  GBP: '£',
  PKR: '₨',
  KRW: '₩',
  MYR: 'RM',
  ILS: '₪',
  ZAR: 'R',
  UGX: 'USh',
  KES: 'KSh',
  TZS: 'TSh',
  RSD: 'din',
  MXN: '$',
  VEF: 'BsF',
  CUP: '$',
  COP: '$',
  KWD: '.د.ك',
  CLP: '$',
  IQD: '.د.ع',
  AOA: 'Kz',
  GTQ: 'Q',
  CZK: 'Kč',
  XAF: 'CFA',
  CHF: 'Fr',
  RUR: '₽',
  SAR: 'SRls',
}

/** Невідомий код повертаємо як є — це краще за порожнечу біля ціни. */
export function currencyIcon(iso: string | null | undefined): string {
  if (!iso) return ''
  return CURRENCY_ICONS[iso.toUpperCase()] ?? iso
}

/**
 * Де стоїть значок, за правилами мови інтерфейсу. Українська, польська, німецька
 * ставлять після числа, англійська й турецька — перед. Питаємо `Intl` лише про
 * позицію: сам значок беремо свій, бо для більшості наших валют `Intl` віддає
 * ISO-код замість символу.
 */
function iconGoesFirst(iso: string, locale: string): boolean {
  try {
    const parts = new Intl.NumberFormat(locale, { style: 'currency', currency: iso }).formatToParts(1)
    const cur = parts.findIndex((p) => p.type === 'currency')
    const num = parts.findIndex((p) => p.type === 'integer')
    return cur !== -1 && num !== -1 && cur < num
  } catch {
    // невідомий ISO або локаль — ставимо після числа, як в адмінці
    return false
  }
}

export interface FormatMoneyOptions {
  /** ISO валюти. Без нього повертається лише число. */
  currency?: string | null
  /** Мова інтерфейсу — вирішує, з якого боку значок. Типово 'uk'. */
  locale?: string
  /** Знаків після коми. Типово 2. */
  decimals?: number
}

/**
 * Форматує суму: `formatMoney('1250', { currency: 'UAH' })` → `1 250.00 ₴`.
 * Нечислове значення повертається як є — краще показати сире, ніж `NaN`.
 *
 * Тисячі й значок відбиваються нерозривним пробілом, щоб ціна не переносилась
 * на два рядки посеред числа.
 */
export function formatMoney(
  value: string | number | null | undefined,
  { currency = null, locale = 'uk', decimals = 2 }: FormatMoneyOptions = {},
): string {
  if (value == null || value === '') return ''
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return String(value)

  const NBSP = '\u00a0'
  const [whole, frac] = Math.abs(n).toFixed(decimals).split('.')
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)
  const number = `${n < 0 ? '-' : ''}${grouped}${frac ? '.' + frac : ''}`

  const icon = currencyIcon(currency)
  if (!icon) return number
  // Спереду значок клеїться впритул ($110.00), ззаду — через нерозривний пробіл
  // (110.00 ₴). Так вимагає CLDR, і так це виглядає в обох випадках звично.
  return iconGoesFirst(currency!, locale) ? `${icon}${number}` : `${number}${NBSP}${icon}`
}
