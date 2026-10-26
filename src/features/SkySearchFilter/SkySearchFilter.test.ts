import { describe, it, expect, afterEach } from 'vitest';
import { mount, enableAutoUnmount } from '@vue/test-utils';
import SkyFilterDropdown from '@/shared/ui/SkyFilterDropdown/SkyFilterDropdown.vue';
import SkySearchFilter from './SkySearchFilter.vue';

enableAutoUnmount(afterEach);

const trigger = (w: ReturnType<typeof mount>) => {
  const d = w.findComponent(SkyFilterDropdown);
  return { summary: d.props('summary'), badge: d.props('badge') };
};

describe('SkySearchFilter', () => {
  const fetch = async () => ({ items: [] });
  it('shows one pick by name and several as a count', async () => {
    const w = mount(SkySearchFilter, { props: { title: 'Клієнти', fetch, modelValue: [] } });
    expect(trigger(w)).toEqual({ summary: '', badge: '' });
    await w.setProps({ modelValue: [{ value: 1, name: 'Іван' }] });
    expect(trigger(w)).toEqual({ summary: 'Іван', badge: '' });
    await w.setProps({ modelValue: [{ value: 1, name: 'Іван' }, { value: 2, name: 'Олена' }] });
    expect(trigger(w)).toEqual({ summary: '', badge: 2 });
  });
});
