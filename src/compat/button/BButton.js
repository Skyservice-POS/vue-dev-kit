/**
 * `b-button` без BootstrapVue.
 *
 * Мета шару `compat` — не новий API, а **зняття залежності**. Компоненти тут
 * повторюють контракт `b-*` повністю, щоб адмінка могла підмінити їх глобально
 * і викинути BootstrapVue, не чіпаючи жодного місця виклику. Тільки після цього
 * стає можливим `@vue/compat`, а за ним і Vue 3.
 *
 * Реалізація — порт вихідників BootstrapVue 2.21 (MIT), з якого прибрано
 * внутрішні утиліти бібліотеки. Поведінка звіряється з оригіналом
 * A/B-тестом на матриці пропів, а не «на око».
 *
 * Оригінал: https://github.com/bootstrap-vue/bootstrap-vue
 * Copyright (c) 2016-2020 BootstrapVue, MIT.
 */

const CODE_ENTER = 13;
const CODE_SPACE = 32;

const isTag = (value, tag) => String(value).toLowerCase() === String(tag).toLowerCase();

/** Кнопка стає посиланням, якщо задано href/to або тег явно `a`. */
const isLink = (props) => Boolean(props.href || props.to) || isTag(props.tag, 'a');

/** Тристанний `pressed` вмикає режим перемикача. */
const isToggle = (props) => typeof props.pressed === 'boolean';

const isButton = (props) => !(isLink(props) || (props.tag && !isTag(props.tag, 'button')));

const isNonStandardTag = (props) => !isLink(props) && !isButton(props);

const computeClass = (props) => [
  // Дефолт саме `secondary` — так у BootstrapVue, і місця виклику на це спираються.
  `btn-${props.variant || 'secondary'}`,
  {
    [`btn-${props.size}`]: Boolean(props.size),
    'btn-block': props.block,
    'rounded-pill': props.pill,
    'rounded-0': props.squared && !props.pill,
    disabled: props.disabled,
    active: props.pressed,
  },
];

const computeAttrs = (props, attrs) => {
  const button = isButton(props);
  const link = isLink(props);
  const toggle = isToggle(props);
  const nonStandardTag = isNonStandardTag(props);
  const hashLink = link && props.href === '#';
  const role = attrs && attrs.role ? attrs.role : null;
  const tabindex = attrs ? attrs.tabindex : null;

  return {
    // `type` має сенс лише на справжній кнопці.
    type: button && !link ? props.type : null,
    disabled: button ? props.disabled : null,
    // Довільному тегу й `href="#"` роль дописуємо самі — інакше зчитувач
    // не зрозуміє, що це кнопка.
    role: nonStandardTag || hashLink ? 'button' : role,
    'aria-disabled': nonStandardTag ? String(props.disabled) : null,
    'aria-pressed': toggle ? String(props.pressed) : null,
    // Без цього деякі браузери відновлюють попередній стан перемикача
    // при поверненні «назад».
    autocomplete: toggle ? 'off' : null,
    tabindex: props.disabled && !button ? '-1' : nonStandardTag || hashLink ? '0' : tabindex,
  };
};

export const BButton = {
  name: 'BButton',
  // class/style лишаються на корені автоматично, решта атрибутів
  // розкладається вручну — так само, як це робив функціональний оригінал.
  inheritAttrs: false,
  props: {
    active: { type: Boolean, default: false },
    block: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    href: { type: String, default: undefined },
    pill: { type: Boolean, default: false },
    /** `true` / `false` — перемикач; `null` — звичайна кнопка. */
    pressed: { type: Boolean, default: null },
    rel: { type: String, default: null },
    size: { type: String, default: undefined },
    squared: { type: Boolean, default: false },
    tag: { type: String, default: 'button' },
    target: { type: String, default: '_self' },
    to: { type: [String, Object], default: undefined },
    type: { type: String, default: 'button' },
    variant: { type: String, default: 'secondary' },
  },
  computed: {
    isLink() {
      return isLink(this.$props);
    },
    isToggle() {
      return isToggle(this.$props);
    },
    computedTag() {
      if (this.to) return 'router-link';
      if (this.isLink) return 'a';
      return this.tag;
    },
    /**
     * У режимі посилання оригінал вкладає кнопку в `b-link`, а той додає власні
     * `active`/`disabled` **перед** класами кнопки. Через це в розмітці
     * BootstrapVue `disabled` трапляється двічі — відтворюємо як є, щоб
     * порівняння з оригіналом було посимвольним.
     */
    computedClass() {
      const linkClasses = this.isLink ? [{ active: this.active, disabled: this.disabled }] : [];
      return [...linkClasses, ...computeClass(this.$props)];
    },
    /** Порожній `<a>` без href оригінал усе одно робить клікабельним. */
    computedHref() {
      if (this.href) return this.href;
      if (typeof this.to === 'string') return this.to || '/';
      return '#';
    },
    /** `target="_blank"` без явного `rel` дістає `noopener` — захист від window.opener. */
    computedRel() {
      return this.target === '_blank' && this.rel === null ? 'noopener' : this.rel || null;
    },
    computedAttrs() {
      const attrs = { ...this.$attrs, ...computeAttrs(this.$props, this.$attrs) };

      if (this.isLink && !this.to) {
        attrs.href = this.computedHref;
        attrs.rel = this.computedRel;
        attrs.target = this.target;
        if (this.disabled) attrs['aria-disabled'] = 'true';
      }

      // Ключі зі значенням null Vue у розмітку не виводить, але прибираємо
      // явно, щоб порівняння з оригіналом не залежало від цієї деталі.
      Object.keys(attrs).forEach((key) => {
        if (attrs[key] === null || attrs[key] === undefined) delete attrs[key];
      });

      return attrs;
    },
  },
  methods: {
    onClick(event) {
      if (this.disabled && event instanceof Event) {
        event.stopPropagation();
        event.preventDefault();
        return;
      }

      // Перемикач віддає новий стан через `.sync`.
      if (this.isToggle) this.$emit('update:pressed', !this.pressed);

      this.$emit('click', event);
    },
    onKeydown(event) {
      const nonStandardTag = isNonStandardTag(this.$props);
      const hashLink = this.isLink && this.href === '#';
      if (this.disabled || !(nonStandardTag || hashLink)) return;

      const { keyCode } = event;
      if (keyCode === CODE_SPACE || (keyCode === CODE_ENTER && nonStandardTag)) {
        const target = event.currentTarget || event.target;
        event.preventDefault();
        target.click();
      }
    },
    // Перемикач у фокусі має отримувати клас `focus` — на ньому тримається
    // підсвітка в Bootstrap.
    onFocusin(event) {
      if (this.isToggle) event.target.classList.add('focus');
    },
    onFocusout(event) {
      if (this.isToggle) event.target.classList.remove('focus');
    },
  },
  render(h) {
    const listeners = {
      ...this.$listeners,
      click: this.onClick,
      keydown: this.onKeydown,
    };

    if (this.isToggle) {
      listeners.focusin = this.onFocusin;
      listeners.focusout = this.onFocusout;
    }

    const data = {
      staticClass: 'btn',
      class: this.computedClass,
      attrs: this.computedAttrs,
    };

    if (this.to) {
      data.props = { to: this.to };
      data.nativeOn = listeners;
    } else {
      data.on = listeners;
    }

    return h(this.computedTag, data, this.$slots.default);
  },
};

export default BButton;
