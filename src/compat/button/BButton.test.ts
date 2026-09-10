import { describe, it, expect } from 'vitest';
import Vue from 'vue';
import { BButton as BButtonOriginal } from 'bootstrap-vue';
import { BButton } from './BButton';
import { normalizeDom } from '../../shared/ui/SkyButton/button-dom-contract';

/**
 * Наш `b-button` звіряється **напряму з оригіналом** із BootstrapVue.
 *
 * Це можливо саме тут: обидва — Vue 2, тож рендеряться в одному прогоні й
 * порівнюються без проміжного еталона. Оригінал підключений лише як
 * devDependency — у зібраний пакет він не потрапляє.
 *
 * Мета шару `compat` — щоб адмінка могла підмінити компоненти глобально і
 * викинути BootstrapVue, не чіпаючи 1065 місць виклику. Тому критерій тут
 * жорсткіший за «схоже»: розмітка має збігатися посимвольно.
 */

type Props = Record<string, unknown>;

function render(component: unknown, props: Props, data: Props = {}) {
  const vm = new Vue({
    render: (h) => h(component as never, { props, ...data }, ['Текст']),
  }).$mount();

  return vm;
}

/** Матриця охоплює всі гілки computeClass/computeAttrs оригіналу. */
const CASES: { name: string; props: Props; data?: Props }[] = [
  { name: 'дефолт (variant=secondary)', props: {} },
  { name: 'variant=primary', props: { variant: 'primary' } },
  { name: 'variant=success', props: { variant: 'success' } },
  { name: 'variant=info', props: { variant: 'info' } },
  { name: 'variant=outline-success', props: { variant: 'outline-success' } },
  { name: 'variant=link', props: { variant: 'link' } },
  { name: 'variant=transparent (нестандартний)', props: { variant: 'transparent' } },
  { name: 'size=sm', props: { size: 'sm' } },
  { name: 'size=lg', props: { size: 'lg' } },
  { name: 'block', props: { block: true } },
  { name: 'pill', props: { pill: true } },
  { name: 'squared', props: { squared: true } },
  { name: 'squared разом із pill — pill перемагає', props: { squared: true, pill: true } },
  { name: 'disabled', props: { disabled: true } },
  { name: 'type=submit', props: { type: 'submit' } },
  { name: 'type=reset', props: { type: 'reset' } },
  { name: 'pressed=false — перемикач вимкнений', props: { pressed: false } },
  { name: 'pressed=true — перемикач увімкнений', props: { pressed: true } },
  { name: 'tag=div — нестандартний тег', props: { tag: 'div' } },
  { name: 'tag=div + disabled', props: { tag: 'div', disabled: true } },
  { name: 'href — рендериться як <a>', props: { href: '/settings' } },
  { name: 'href="#"', props: { href: '#' } },
  { name: 'href + target', props: { href: '/x', target: '_blank' } },
  { name: 'href + disabled', props: { href: '/x', disabled: true } },
  { name: 'tag=a без href', props: { tag: 'a' } },
  {
    name: 'комбінація: outline-success + lg + block + disabled',
    props: { variant: 'outline-success', size: 'lg', block: true, disabled: true },
  },
  { name: 'кастомний class зберігається', props: { variant: 'info' }, data: { class: 'barcode-button mr-1' } },
  { name: 'сторонні атрибути прокидаються', props: {}, data: { attrs: { title: 'Підказка', 'data-id': '7' } } },
  { name: 'заданий role не затирається', props: {}, data: { attrs: { role: 'tab' } } },
  { name: 'заданий tabindex не затирається', props: {}, data: { attrs: { tabindex: '3' } } },
];

describe('compat/BButton — розмітка збігається з b-button із BootstrapVue', () => {
  for (const testCase of CASES) {
    it(testCase.name, () => {
      const ours = render(BButton, testCase.props, testCase.data);
      const original = render(BButtonOriginal, testCase.props, testCase.data);

      expect(normalizeDom(ours.$el)).toBe(normalizeDom(original.$el));

      ours.$destroy();
      original.$destroy();
    });
  }
});

describe('compat/BButton — поведінка', () => {
  it('віддає клік', () => {
    const clicks: unknown[] = [];
    const vm = render(BButton, {}, { on: { click: () => clicks.push(1) } });

    (vm.$el as HTMLElement).click();

    expect(clicks).toHaveLength(1);
    vm.$destroy();
  });

  it('вимкнена кнопка кліку не віддає', () => {
    const clicks: unknown[] = [];
    const vm = render(BButton, { disabled: true }, { on: { click: () => clicks.push(1) } });

    (vm.$el as HTMLElement).click();

    expect(clicks).toHaveLength(0);
    vm.$destroy();
  });

  it('вимкнене посилання теж не клікається — на <a> немає атрибута disabled', () => {
    const clicks: unknown[] = [];
    const vm = render(BButton, { href: '/x', disabled: true }, { on: { click: () => clicks.push(1) } });

    (vm.$el as HTMLElement).click();

    expect(clicks).toHaveLength(0);
    vm.$destroy();
  });

  it('перемикач віддає новий стан через .sync', () => {
    const updates: unknown[] = [];
    const vm = render(BButton, { pressed: false }, { on: { 'update:pressed': (v: unknown) => updates.push(v) } });

    (vm.$el as HTMLElement).click();

    expect(updates).toEqual([true]);
    vm.$destroy();
  });

  it('звичайна кнопка update:pressed не віддає', () => {
    const updates: unknown[] = [];
    const vm = render(BButton, {}, { on: { 'update:pressed': (v: unknown) => updates.push(v) } });

    (vm.$el as HTMLElement).click();

    expect(updates).toEqual([]);
    vm.$destroy();
  });

  it('малює вміст слота', () => {
    const vm = render(BButton, {});

    expect(vm.$el.textContent?.trim()).toBe('Текст');
    vm.$destroy();
  });
});
