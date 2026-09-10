import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import SkyButton from './SkyButton.vue';
import { BUTTON_DOM_CASES, BUTTON_SLOT_TEXT, normalizeDom } from './button-dom-contract';

/**
 * Дві групи перевірок з різними задачами.
 *
 * «Розмітка» звіряє вихід зі спільним еталоном — тим самим, який у своєму
 * прогоні звіряє Vue 2-адаптер. Це і є доказ, що збірки дають однакову
 * верстку, і саме через нього адмінка переживе фліп-день без правок CSS.
 *
 * «Поведінка» перевіряє обіцянки, які еталон розмітки не ловить: події,
 * блокування кліку, прокидання атрибутів.
 */

describe('SkyButton — розмітка збігається з контрактом', () => {
  for (const testCase of BUTTON_DOM_CASES) {
    it(testCase.name, () => {
      const wrapper = mount(SkyButton, {
        props: testCase.props,
        slots: { default: BUTTON_SLOT_TEXT },
      });

      expect(normalizeDom(wrapper.element)).toBe(testCase.html);
    });
  }
});

describe('SkyButton — поведінка', () => {
  it('віддає клік назовні', async () => {
    const wrapper = mount(SkyButton);
    await wrapper.trigger('click');

    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('вимкнена кнопка кліку не віддає', async () => {
    const wrapper = mount(SkyButton, { props: { disabled: true } });
    await wrapper.trigger('click');

    expect(wrapper.emitted('click')).toBeUndefined();
  });

  it('під час завантаження кнопка теж заблокована', async () => {
    const wrapper = mount(SkyButton, { props: { loading: true } });
    await wrapper.trigger('click');

    expect(wrapper.emitted('click')).toBeUndefined();
    expect((wrapper.element as HTMLButtonElement).disabled).toBe(true);
  });

  it('спінер з’являється лише під час завантаження', async () => {
    const wrapper = mount(SkyButton, { props: { loading: false } });
    expect(wrapper.find('.sky-btn-spinner').exists()).toBe(false);

    await wrapper.setProps({ loading: true });
    expect(wrapper.find('.sky-btn-spinner').exists()).toBe(true);
  });

  it('малює вміст слота', () => {
    const wrapper = mount(SkyButton, { slots: { default: 'Зберегти' } });

    expect(wrapper.text()).toBe('Зберегти');
  });

  it('прокидає сторонні атрибути на <button>', () => {
    const wrapper = mount(SkyButton, { attrs: { title: 'Підказка', 'data-test': 'save' } });

    expect(wrapper.attributes('title')).toBe('Підказка');
    expect(wrapper.attributes('data-test')).toBe('save');
  });

  it('перераховує класи при зміні пропів', async () => {
    const wrapper = mount(SkyButton, { props: { variant: 'primary' } });
    expect(wrapper.classes()).toContain('btn-primary');

    await wrapper.setProps({ variant: 'danger' });
    expect(wrapper.classes()).toContain('btn-danger');
    expect(wrapper.classes()).not.toContain('btn-primary');
  });
});
