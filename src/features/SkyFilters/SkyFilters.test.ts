import { describe, it, expect, afterEach, vi } from 'vitest';
import { mount, flushPromises, enableAutoUnmount } from '@vue/test-utils';
import { nextTick } from 'vue';
import SkyFilters from './SkyFilters.vue';
import SkyFiltersCurtain from './SkyFiltersCurtain.vue';
import SkyFilterDropdown from '@/shared/ui/SkyFilterDropdown/SkyFilterDropdown.vue';
import RangePanel from '@/shared/ui/SkyFilterDropdown/panels/RangePanel.vue';
import SearchPanel from '@/shared/ui/SkyFilterDropdown/panels/SearchPanel.vue';
import { resolveFilterType, type SkyFilterConfig } from './filterTypes';

const opts = [
  { value: 1, name: 'A' },
  { value: 2, name: 'B' },
];
const filters: SkyFilterConfig[] = [
  { key: 'cat', title: 'Cat', options: opts },
  { key: 'st', title: 'St', type: 'radio', options: opts },
  { key: 'sum', title: 'Sum', type: 'range', min: 0, max: 100 },
  { key: 'empty', title: 'Empty', options: [] },
];

/** happy-dom не верстає — задаємо ширини руками: рядок і кожен фільтр. */
function stubWidths(rowWidth: number, itemWidth: number, extraWidth = 100) {
  const ow = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
    if (this.classList.contains('sky-filters__item')) return itemWidth;
    return extraWidth;
  });
  const cw = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return this.classList.contains('sky-filters__row') ? rowWidth : 0;
  });
  return () => {
    ow.mockRestore();
    cw.mockRestore();
  };
}

enableAutoUnmount(afterEach);

let restore: (() => void) | null = null;
afterEach(() => {
  restore?.();
  restore = null;
});

const hiddenTitles = (w: ReturnType<typeof mount>) =>
  w.findAll('.sky-filters__item.is-hidden').map((el) => el.find('.sky-filter-dropdown__title').text());

describe('SkyFilters', () => {
  it('hides filters that have nothing to pick, unless keepEmpty', async () => {
    const w = mount(SkyFilters, { props: { filters } });
    expect(w.findAllComponents(SkyFilterDropdown)).toHaveLength(3);
    await w.setProps({ filters: [...filters.slice(0, 3), { ...filters[3], keepEmpty: true }] });
    expect(w.findAllComponents(SkyFilterDropdown)).toHaveLength(4);
  });

  it('merges a changed value into the model and emits change', () => {
    const w = mount(SkyFilters, { props: { filters, modelValue: { st: 2 } } });
    (w.vm as any).$.setupState.setValue('cat', [1]);
    expect(w.emitted('update:modelValue')![0][0]).toEqual({ st: 2, cat: [1] });
    expect(w.emitted('change')![0][0]).toEqual({ key: 'cat', value: [1], values: { st: 2, cat: [1] } });
  });

  it('reset clears every filter to its own empty value', async () => {
    const w = mount(SkyFilters, { props: { filters } });
    expect(w.find('.sky-filters__reset:not(span)').exists()).toBe(false);
    await w.setProps({ modelValue: { cat: [1], st: 2, sum: { from: 1, to: 5 } } });
    await w.find('button.sky-filters__reset').trigger('click');
    expect(w.emitted('update:modelValue')![0][0]).toEqual({
      cat: [],
      st: null,
      sum: { from: null, to: null },
      empty: [],
    });
  });

  it('keeps everything in the row when it fits', async () => {
    restore = stubWidths(1000, 100);
    const w = mount(SkyFilters, { props: { filters } });
    (w.vm as any).recalc();
    await nextTick();
    expect(hiddenTitles(w)).toEqual([]);
    expect(w.find('.sky-filters__more[data-sky-filters-more]').exists()).toBe(false);
  });

  it('moves the filters that do not fit behind "all filters", keeping order', async () => {
    // 3 фільтри по 100 + gap 0; кнопка 100. Рядок 250: влазить 1 фільтр + кнопка.
    restore = stubWidths(250, 100);
    const w = mount(SkyFilters, { props: { filters } });
    (w.vm as any).recalc();
    await nextTick();
    expect(hiddenTitles(w)).toEqual(['St', 'Sum']);
    expect(w.find('[data-sky-filters-more]').exists()).toBe(true);
    // «Скинути» в рядку не показується, коли є «Усі фільтри».
    await w.setProps({ modelValue: { cat: [1] } });
    expect(w.find('button.sky-filters__reset').exists()).toBe(false);
    expect(w.find('[data-sky-filters-more]').text()).toContain('Активно 1 шт.');
  });

  it('reserves room for the reset button once something is picked', async () => {
    // Усі 3 по 100 = 300 рівно влазять у 300, але з «Скинути» (100) — уже ні.
    restore = stubWidths(300, 100);
    const w = mount(SkyFilters, { props: { filters } });
    (w.vm as any).recalc();
    await nextTick();
    expect(hiddenTitles(w)).toEqual([]);
    await w.setProps({ modelValue: { cat: [1] } });
    (w.vm as any).recalc();
    await nextTick();
    expect(hiddenTitles(w)).toEqual(['Sum']);
  });

  it('opens the curtain with every filter and routes its edits through change', async () => {
    restore = stubWidths(250, 100);
    const w = mount(SkyFilters, { props: { filters }, attachTo: document.body });
    (w.vm as any).recalc();
    await nextTick();
    await w.find('[data-sky-filters-more]').trigger('click');
    const curtain = w.findComponent(SkyFiltersCurtain);
    expect(curtain.props('open')).toBe(true);
    expect(document.querySelectorAll('.sky-filters-curtain__section')).toHaveLength(3);
    curtain.vm.$emit('update', 'st', 1);
    expect(w.emitted('change')![0][0]).toMatchObject({ key: 'st', value: 1 });
  });

  it('closes the curtain on a click outside, but not on the toggle button', async () => {
    restore = stubWidths(250, 100);
    const w = mount(SkyFilters, { props: { filters }, attachTo: document.body });
    (w.vm as any).recalc();
    await nextTick();
    const more = w.find('[data-sky-filters-more]');
    await more.trigger('click');
    more.element.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await nextTick();
    expect(w.findComponent(SkyFiltersCurtain).props('open')).toBe(true);
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await nextTick();
    expect(w.findComponent(SkyFiltersCurtain).props('open')).toBe(false);
  });
});

describe('filter types', () => {
  it('checkbox: one pick shows its name, several show a count', () => {
    const f = filters[0];
    const d = resolveFilterType(f).display;
    expect(d([], f)).toMatchObject({ count: 0 });
    expect(d([1], f)).toMatchObject({ count: 1, summary: 'A', badge: '' });
    expect(d([1, 2], f)).toMatchObject({ count: 2, summary: '', badge: 2 });
  });

  it('radio with inputFor is not active until the number is typed', () => {
    const f: SkyFilterConfig = { key: 'm', title: 'M', type: 'radio', options: opts, inputFor: [1] };
    const t = resolveFilterType(f);
    expect(t.emptyValue(f)).toEqual({ value: null, input: '' });
    expect(t.display({ value: 1, input: '' }, f).count).toBe(0);
    expect(t.display({ value: 1, input: '5' }, f)).toMatchObject({ count: 1, summary: 'A', badge: '5' });
    expect(t.display({ value: 2, input: '' }, f)).toMatchObject({ count: 1, summary: 'B' });
  });

  it('range shows the bounds and counts only a complete range', () => {
    const f = filters[2];
    const d = resolveFilterType(f).display;
    expect(d({ from: null, to: null }, f).count).toBe(0);
    expect(d({ from: 3, to: 7 }, f)).toMatchObject({ count: 1, badge: '3 - 7' });
  });

  it('a config with its own component becomes a fully custom filter', () => {
    const Comp = { template: '<div />' };
    const f: SkyFilterConfig = { key: 'x', title: 'X', component: Comp, emptyValue: () => '', display: (v) => ({ count: v ? 1 : 0 }) };
    const t = resolveFilterType(f);
    expect(t.props).toBeUndefined();
    expect(t.emptyValue(f)).toBe('');
    expect(t.display('a', f).count).toBe(1);
  });

  it('throws on an unknown type instead of rendering nothing', () => {
    expect(() => resolveFilterType({ key: 'q', title: 'Q', type: 'nope' })).toThrow(/nope/);
  });
});

describe('RangePanel', () => {
  it('emits null bounds when the range is back to full', async () => {
    const w = mount(RangePanel, { props: { min: 0, max: 100, modelValue: { from: 10, to: 50 } } });
    const [from, to] = w.findAll('input');
    await from.setValue('0');
    await to.setValue('100');
    expect(w.emitted('update:modelValue')!.slice(-1)[0][0]).toEqual({ from: null, to: null });
  });

  it('does not emit an inverted range', async () => {
    const w = mount(RangePanel, { props: { min: 0, max: 100, modelValue: { from: 10, to: 50 } } });
    await w.findAll('input')[0].setValue('70');
    expect(w.emitted('update:modelValue')).toBeUndefined();
    expect(w.find('.is-error').exists()).toBe(true);
  });
});

describe('SearchPanel', () => {
  it('loads pages, appends "more", and keeps picked items with their names', async () => {
    const fetch = vi.fn(async ({ page }: { page: number; search: string }) => ({
      items: [{ value: page * 10, name: `Item ${page * 10}` }],
      hasMore: page < 2,
    }));
    const w = mount(SearchPanel, { props: { fetch, modelValue: [{ value: 99, name: 'Old' }] } });
    await flushPromises();
    expect(fetch).toHaveBeenCalledWith({ page: 1, search: '' });
    await w.find('.sky-search-panel__more').trigger('click');
    await flushPromises();
    expect(w.findAll('.sky-search-panel__option')).toHaveLength(2);
    expect(w.find('.sky-search-panel__more').exists()).toBe(false);

    await w.findAll('.sky-search-panel__option input')[1].setValue(true);
    expect(w.emitted('update:modelValue')![0][0]).toEqual([
      { value: 99, name: 'Old' },
      { value: 20, name: 'Item 20' },
    ]);
  });

  it('ignores a stale response that arrives after a newer search', async () => {
    vi.useFakeTimers();
    let resolveFirst!: (v: unknown) => void;
    const fetch = vi
      .fn()
      .mockImplementationOnce(() => new Promise((r) => (resolveFirst = r)))
      .mockImplementationOnce(async () => ({ items: [{ value: 2, name: 'Fresh' }] }));
    const w = mount(SearchPanel, { props: { fetch } });
    w.findComponent({ name: 'FilterSearch' }).vm.$emit('update:modelValue', 'fr');
    vi.advanceTimersByTime(400);
    vi.useRealTimers();
    await flushPromises();
    resolveFirst({ items: [{ value: 1, name: 'Stale' }] });
    await flushPromises();
    expect(w.text()).toContain('Fresh');
    expect(w.text()).not.toContain('Stale');
  });
});
