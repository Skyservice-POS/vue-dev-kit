/**
 * Контракт розмітки кнопки — спільна фікстура для обох збірок кіта.
 *
 * Vue 3-компонент і Vue 2-адаптер живуть у різних рантаймах, тож порівняти їх
 * в одному прогоні тестів не вийде. Натомість кожна збірка звіряється з цим
 * еталоном у своєму прогоні: якщо обидві збігаються з ним, вони збігаються
 * між собою.
 *
 * Еталон знято з реального `b-button` — саме таку розмітку адмінка стилізує
 * сьогодні. Класи `sky-btn*` додані понад неї: у міні-застосунках Bootstrap
 * CSS немає, і без них кнопки лишились би без вигляду.
 *
 * Якщо тест червоний — правити треба компонент, а не еталон. Еталон
 * змінюється лише свідомим рішенням змінити контракт.
 */

export interface ButtonDomCase {
  name: string;
  props: Record<string, unknown>;
  /** Нормалізована розмітка: атрибути за абеткою, коментарі прибрані. */
  html: string;
}

const SPINNER = '<span aria-hidden class="sky-btn-spinner spinner-border spinner-border-sm"></span>';

export const BUTTON_DOM_CASES: ButtonDomCase[] = [
  {
    name: 'дефолт — primary, розмір md, type=button',
    props: {},
    html: '<button class="btn btn-primary sky-btn sky-btn-primary" type="button">Текст</button>',
  },
  {
    name: 'variant=danger',
    props: { variant: 'danger' },
    html: '<button class="btn btn-danger sky-btn sky-btn-danger" type="button">Текст</button>',
  },
  {
    name: 'variant=secondary',
    props: { variant: 'secondary' },
    html: '<button class="btn btn-secondary sky-btn sky-btn-secondary" type="button">Текст</button>',
  },
  {
    name: 'variant=outline — у Bootstrap це префікс до кольору',
    props: { variant: 'outline' },
    html: '<button class="btn btn-outline-primary sky-btn sky-btn-outline" type="button">Текст</button>',
  },
  {
    name: 'size=sm',
    props: { size: 'sm' },
    html: '<button class="btn btn-primary btn-sm sky-btn sky-btn-primary sky-btn-sm" type="button">Текст</button>',
  },
  {
    name: 'size=lg',
    props: { size: 'lg' },
    html: '<button class="btn btn-primary btn-lg sky-btn sky-btn-primary sky-btn-lg" type="button">Текст</button>',
  },
  {
    name: 'size=md не додає класу розміру',
    props: { size: 'md' },
    html: '<button class="btn btn-primary sky-btn sky-btn-primary" type="button">Текст</button>',
  },
  {
    name: 'block',
    props: { block: true },
    html: '<button class="btn btn-primary btn-block sky-btn sky-btn-primary sky-btn-block" type="button">Текст</button>',
  },
  {
    name: 'icon',
    props: { icon: true },
    html: '<button class="btn btn-primary sky-btn sky-btn-primary sky-btn-icon" type="button">Текст</button>',
  },
  {
    name: 'disabled — атрибут і клас разом, як у b-button',
    props: { disabled: true },
    html: '<button class="btn btn-primary disabled sky-btn sky-btn-primary" disabled type="button">Текст</button>',
  },
  {
    name: 'loading — вимикає кнопку і додає спінер перед вмістом',
    props: { loading: true },
    html: `<button class="btn btn-primary disabled sky-btn sky-btn-primary sky-btn-loading" disabled type="button">${SPINNER}Текст</button>`,
  },
  {
    name: 'type=submit',
    props: { type: 'submit' },
    html: '<button class="btn btn-primary sky-btn sky-btn-primary" type="submit">Текст</button>',
  },
  {
    name: 'комбінація: outline + lg + block + disabled',
    props: { variant: 'outline', size: 'lg', block: true, disabled: true },
    html:
      '<button class="btn btn-outline-primary btn-lg btn-block disabled sky-btn sky-btn-outline sky-btn-lg sky-btn-block"' +
      ' disabled type="button">Текст</button>',
  },
];

/** Вміст слота в усіх кейсах — щоб порівнювати саме обгортку, а не текст. */
export const BUTTON_SLOT_TEXT = 'Текст';

/** Атрибути, які в DOM означають лише свою присутність. */
const BOOLEAN_ATTRS = new Set(['disabled', 'readonly', 'required', 'checked', 'selected', 'aria-hidden']);

/**
 * Зводить розмітку до порівнюваного вигляду.
 *
 * Прибирає те, у чому Vue 2 і Vue 3 розходяться без різниці для верстки:
 * scope-атрибути, порядок атрибутів, вузли-коментарі (плейсхолдери `v-if`)
 * і форму булевих атрибутів (`disabled="disabled"` проти `disabled=""`).
 */
export function normalizeDom(node: Node): string {
  if (node.nodeType === 3) return (node.textContent || '').replace(/\s+/g, ' ');
  if (node.nodeType !== 1) return ''; // коментарі та решта — геть

  const el = node as Element;
  const attrs = Array.from(el.attributes)
    .filter((attr) => !attr.name.startsWith('data-v-'))
    .sort((a, b) => (a.name < b.name ? -1 : 1))
    .map((attr) => {
      if (BOOLEAN_ATTRS.has(attr.name)) return attr.name;
      const value = attr.name === 'class' ? attr.value.trim().replace(/\s+/g, ' ') : attr.value;
      return `${attr.name}="${value}"`;
    });

  const open = [el.tagName.toLowerCase(), ...attrs].join(' ');
  const children = Array.from(el.childNodes).map(normalizeDom).join('');

  return `<${open}>${children}</${el.tagName.toLowerCase()}>`;
}
