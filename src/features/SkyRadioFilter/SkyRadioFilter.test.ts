import { describe, it, expect, afterEach } from 'vitest';
import { mount, enableAutoUnmount } from '@vue/test-utils';
import SkyRadioFilter from './SkyRadioFilter.vue';
import SkyFilterDropdown from '@/shared/ui/SkyFilterDropdown/SkyFilterDropdown.vue';

enableAutoUnmount(afterEach);

const opts = [
  { value: 'cash', name: 'Готівка' },
  { value: 'come', name: 'Дуже довга назва варіанта фільтра' },
];

const trigger = (w: ReturnType<typeof mount>) => {
  const d = w.findComponent(SkyFilterDropdown);
  return { summary: d.props('summary'), badge: d.props('badge') };
};

describe('SkyRadioFilter', () => {
  it('shows the picked option instead of the title, cutting long names', async () => {
    const w = mount(SkyRadioFilter, { props: { title: 'Оплата', options: opts, modelValue: null } });
    expect(trigger(w)).toEqual({ summary: '', badge: '' });
    await w.setProps({ modelValue: 'cash' });
    expect(trigger(w).summary).toBe('Готівка');
    await w.setProps({ modelValue: 'come' });
    expect(trigger(w).summary).toBe('Дуже довга назва вар...');
  });

  it('with inputFor stays inactive until the number is typed, then badges it', async () => {
    const w = mount(SkyRadioFilter, {
      props: { title: 'Рух', options: opts, inputFor: ['come'], modelValue: { value: 'come', input: '' } },
    });
    expect(trigger(w)).toEqual({ summary: '', badge: '' });
    await w.setProps({ modelValue: { value: 'come', input: '7' } });
    expect(trigger(w).badge).toBe('7');
    await w.setProps({ modelValue: { value: 'cash', input: '' } });
    expect(trigger(w)).toEqual({ summary: 'Готівка', badge: '' });
  });

  it('forwards the panel value and closes on "done"', async () => {
    const w = mount(SkyRadioFilter, { props: { title: 'Оплата', options: opts }, attachTo: document.body });
    await w.find('.sky-filter-dropdown__trigger').trigger('click');
    const radio = document.querySelector<HTMLInputElement>('.sky-radio-panel__input')!;
    radio.checked = true;
    radio.dispatchEvent(new Event('change'));
    expect(w.emitted('update:modelValue')![0]).toEqual(['cash']);
    (document.querySelector('.sky-filter-done__btn') as HTMLButtonElement).click();
    await w.vm.$nextTick();
    expect(document.querySelector('.sky-radio-panel')).toBeNull();
  });
});
