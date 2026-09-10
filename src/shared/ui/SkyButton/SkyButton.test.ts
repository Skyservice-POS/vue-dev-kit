import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import SkyButton from './SkyButton.vue';

/**
 * Обіцянки, які компонент має тримати, щоб його можна було ставити замість
 * нативного `<button>`, не перевіряючи щоразу поведінку заново.
 */

describe('SkyButton', () => {
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

  it('перемальовує клас варіанта при зміні пропа', async () => {
    const wrapper = mount(SkyButton, { props: { variant: 'primary' } });
    expect(wrapper.classes()).toContain('sky-btn-primary');

    await wrapper.setProps({ variant: 'danger' });
    expect(wrapper.classes()).toContain('sky-btn-danger');
    expect(wrapper.classes()).not.toContain('sky-btn-primary');
  });

  it('модифікатори block і icon дають свої класи', () => {
    const wrapper = mount(SkyButton, { props: { block: true, icon: true } });

    expect(wrapper.classes()).toEqual(expect.arrayContaining(['sky-btn-block', 'sky-btn-icon']));
  });
});
