import { describe, it, expect } from 'vitest';
import Vue from 'vue';
import SkyButton from './SkyButton.vue';
import {
  BUTTON_DOM_CASES,
  BUTTON_SLOT_TEXT,
  normalizeDom,
} from '../../shared/ui/SkyButton/button-dom-contract';

/**
 * Той самий еталон розмітки, що й у Vue 3-прогоні
 * (src/shared/ui/SkyButton/SkyButton.test.ts). Обидві збірки звіряються з ним
 * незалежно — так ми доводимо, що вони дають однакову верстку, не намагаючись
 * підняти два рантайми Vue в одному прогоні.
 *
 * Адаптер тут — еталонна сторона: під ним працює `b-button`, тобто той самий
 * код, який адмінка використовує в проді. Якщо тест червоний, першим підозрюваним
 * має бути Vue 3-компонент, а не він.
 */

function render(props: Record<string, unknown>, listeners: Record<string, unknown> = {}) {
  const vm = new Vue({
    render: (h) => h(SkyButton, { props, on: listeners }, [BUTTON_SLOT_TEXT]),
  }).$mount();

  return vm;
}

describe('SkyButton (Vue 2) — розмітка збігається з контрактом', () => {
  for (const testCase of BUTTON_DOM_CASES) {
    it(testCase.name, () => {
      const vm = render(testCase.props);

      expect(normalizeDom(vm.$el)).toBe(testCase.html);

      vm.$destroy();
    });
  }
});

describe('SkyButton (Vue 2) — поведінка', () => {
  it('віддає клік назовні', () => {
    const clicks: unknown[] = [];
    const vm = render({}, { click: (event: unknown) => clicks.push(event) });

    (vm.$el as HTMLButtonElement).click();

    expect(clicks).toHaveLength(1);
    vm.$destroy();
  });

  it('вимкнена кнопка кліку не віддає', () => {
    const clicks: unknown[] = [];
    const vm = render({ disabled: true }, { click: (event: unknown) => clicks.push(event) });

    (vm.$el as HTMLButtonElement).click();

    expect(clicks).toHaveLength(0);
    vm.$destroy();
  });

  it('під час завантаження кнопка теж заблокована', () => {
    const vm = render({ loading: true });

    expect((vm.$el as HTMLButtonElement).disabled).toBe(true);
    vm.$destroy();
  });

  it('спінер з’являється лише під час завантаження', () => {
    const idle = render({});
    expect(idle.$el.querySelector('.sky-btn-spinner')).toBeNull();
    idle.$destroy();

    const busy = render({ loading: true });
    expect(busy.$el.querySelector('.sky-btn-spinner')).not.toBeNull();
    busy.$destroy();
  });

  it('малює вміст слота', () => {
    const vm = render({});

    expect(vm.$el.textContent?.trim()).toBe(BUTTON_SLOT_TEXT);
    vm.$destroy();
  });
});
