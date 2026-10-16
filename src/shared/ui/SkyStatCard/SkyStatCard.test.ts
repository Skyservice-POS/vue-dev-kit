import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import SkyStatCard from './SkyStatCard.vue';

describe('SkyStatCard', () => {
  it('показує заголовок і значення', () => {
    const wrapper = mount(SkyStatCard, { props: { title: 'Всього чеків', value: '12 шт' } });

    expect(wrapper.text()).toContain('Всього чеків');
    expect(wrapper.text()).toContain('12 шт');
  });

  it('без iconSrc і slot іконки блок іконки не рендериться', () => {
    const wrapper = mount(SkyStatCard, { props: { title: 'A', value: 1 } });

    expect(wrapper.find('.sky-stat-card-icon').exists()).toBe(false);
  });

  it('iconSrc рендерить картинку', () => {
    const wrapper = mount(SkyStatCard, { props: { title: 'A', value: 1, iconSrc: '/i.svg' } });

    expect(wrapper.find('.sky-stat-card-icon img').attributes('src')).toBe('/i.svg');
  });

  it('статична картка кліку не віддає і не стає кнопкою', async () => {
    const wrapper = mount(SkyStatCard, { props: { title: 'A', value: 1 } });
    await wrapper.trigger('click');

    expect(wrapper.emitted('click')).toBeUndefined();
    expect(wrapper.attributes('role')).toBeUndefined();
    expect(wrapper.attributes('tabindex')).toBeUndefined();
  });

  it('clickable віддає клік, Enter і Space', async () => {
    const wrapper = mount(SkyStatCard, { props: { title: 'A', value: 1, clickable: true } });
    await wrapper.trigger('click');
    await wrapper.trigger('keydown', { key: 'Enter' });
    await wrapper.trigger('keydown', { key: ' ' });

    expect(wrapper.emitted('click')).toHaveLength(3);
    expect(wrapper.attributes('role')).toBe('button');
    expect(wrapper.attributes('tabindex')).toBe('0');
  });
});
