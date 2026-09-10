/**
 * Класи кнопки — єдине джерело правди для обох збірок кіта.
 *
 * Vue 3-компонент і Vue 2-адаптер зобов'язані давати **однакову розмітку**:
 * адмінка під час міграції стилізує кнопки bootstrap-селекторами, і будь-яка
 * розбіжність між збірками означала б поламану верстку у фліп-день.
 *
 * Тому список класів рахується тут, а не в шаблонах. Продублювати його в двох
 * місцях означало б рано чи пізно їх розсинхронити.
 */

export type SkyButtonVariant = 'primary' | 'danger' | 'secondary' | 'outline';
export type SkyButtonSize = 'sm' | 'md' | 'lg';

export interface SkyButtonClassProps {
  variant?: SkyButtonVariant;
  size?: SkyButtonSize;
  block?: boolean;
  loading?: boolean;
  icon?: boolean;
  disabled?: boolean;
}

/** `md` — типовий розмір: у Bootstrap він виражається відсутністю класу. */
const isSized = (size?: SkyButtonSize): size is 'sm' | 'lg' => size === 'sm' || size === 'lg';

/**
 * Класи дизайн-системи. Їх розуміє власний CSS кіта, тож саме вони дають
 * вигляд кнопки в міні-застосунках, де Bootstrap CSS не підключений.
 */
export function skyButtonClasses(props: SkyButtonClassProps = {}): string[] {
  const { variant = 'primary', size = 'md', block, loading, icon } = props;

  const classes = ['sky-btn', `sky-btn-${variant}`];
  if (isSized(size)) classes.push(`sky-btn-${size}`);
  if (block) classes.push('sky-btn-block');
  if (loading) classes.push('sky-btn-loading');
  if (icon) classes.push('sky-btn-icon');

  return classes;
}

/**
 * Класи Bootstrap 4 — рівно ті, які обчислює `b-button`, і в тому ж порядку:
 * `btn`, `btn-{variant}`, `btn-{size}`, `btn-block`, `disabled`.
 *
 * Vue 2-збірка отримує їх від самого `b-button`; Vue 3-збірка мусить
 * відтворити їх сама, інакше стилі адмінки перестануть чіплятись.
 */
export function bootstrapButtonClasses(props: SkyButtonClassProps = {}): string[] {
  const { variant = 'primary', size = 'md', block, loading, disabled } = props;

  // У кіта `outline` — самостійний варіант, у Bootstrap — префікс до кольору.
  const classes = ['btn', `btn-${variant === 'outline' ? 'outline-primary' : variant}`];
  if (isSized(size)) classes.push(`btn-${size}`);
  if (block) classes.push('btn-block');
  // `loading` вимикає кнопку, а b-button на вимкненій ставить ще й клас.
  if (disabled || loading) classes.push('disabled');

  return classes;
}

/**
 * Повний список у тому самому порядку, що й у Vue 2-збірці.
 *
 * Порядок саме такий, бо `b-button` — функціональний компонент і зливає дані
 * через `mergeData`: спершу йдуть його власні класи, і лише потім ті, які
 * передали ззовні через `:class`. Перевірено тестом на живому `b-button`,
 * а не виведено з документації.
 */
export function buttonClasses(props: SkyButtonClassProps = {}): string[] {
  return [...bootstrapButtonClasses(props), ...skyButtonClasses(props)];
}

/** Класи спінера всередині кнопки — те, що дає `<b-spinner small>`. */
export const BUTTON_SPINNER_CLASSES = ['sky-btn-spinner', 'spinner-border', 'spinner-border-sm'];
