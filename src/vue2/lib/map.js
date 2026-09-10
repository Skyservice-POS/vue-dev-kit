// Мапінг контракту кіта на пропи BootstrapVue.
// Тримаємо в одному місці: адаптерів багато, а правила перекладу спільні.

/** `state` кіта — рядок; у BootstrapVue це тристанний boolean. */
export const toBsState = (state) => {
  if (state === 'success') return true;
  if (state === 'error') return false;
  return null;
};

/** У кіта `outline` — самостійний варіант, у BootstrapVue — префікс. */
export const toBsButtonVariant = (variant) =>
  variant === 'outline' ? 'outline-primary' : variant;

/** `md` — типовий розмір BootstrapVue, він же відсутність пропа. */
export const toBsSize = (size) => (size === 'md' || !size ? null : size);

/** `tone` кіта → `variant` BootstrapVue. */
export const toBsTone = (tone) =>
  ({
    success: 'success',
    error: 'danger',
    warning: 'warning',
    info: 'info',
    pending: 'warning',
    default: 'secondary',
  }[tone] || 'info');

/**
 * BootstrapVue приймає опції в кількох формах, контракт кіта — лише
 * `{ value, text }`. Нормалізуємо на вході, щоб місця виклику могли
 * передавати і масив рядків.
 */
export const normalizeOptions = (options) =>
  (options || []).map((option) =>
    option !== null && typeof option === 'object'
      ? {
          value: option.value,
          text: option.text !== undefined ? option.text : String(option.value),
          disabled: Boolean(option.disabled),
        }
      : { value: option, text: String(option), disabled: false }
  );
