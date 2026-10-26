import { describe, it, expect, afterEach } from 'vitest';
import { mount, enableAutoUnmount } from '@vue/test-utils';
import SkyFilterDropdown from '@/shared/ui/SkyFilterDropdown/SkyFilterDropdown.vue';
import SkyRangeFilter from './SkyRangeFilter.vue';

enableAutoUnmount(afterEach);

const trigger = (w: ReturnType<typeof mount>) => {
  const d = w.findComponent(SkyFilterDropdown);
  return { summary: d.props('summary'), badge: d.props('badge') };
};

describe('SkyRangeFilter', () => {
  it('badges a complete range only', async () => {
    const w = mount(SkyRangeFilter, { props: { title: 'Чек', modelValue: { from: null, to: null } } });
    expect(trigger(w).badge).toBe('');
    await w.setProps({ modelValue: { from: 10, to: 90 } });
    expect(trigger(w).badge).toBe('10 - 90');
  });
});
