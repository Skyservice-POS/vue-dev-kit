import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { mount, enableAutoUnmount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import SkyDateFilter from './SkyDateFilter.vue';
import DatePanel from '@/shared/ui/SkyFilterDropdown/panels/DatePanel.vue';
import SkyFilterDropdown from '@/shared/ui/SkyFilterDropdown/SkyFilterDropdown.vue';
import { datePresets, diffDays, quarterPresets, defaultDatePresets } from '@/shared/lib/date/dateRange';
import { resolveFilterType } from '@/features/SkyFilters/filterTypes';

enableAutoUnmount(afterEach);

// Середа, 15 жовтня 2025 — фіксуємо, щоб «сьогодні» не плавало.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2025, 9, 15, 12));
});
afterEach(() => vi.useRealTimers());

const day = (w: ReturnType<typeof mount>, date: string) => w.find(`[data-date="${date}"]`);
const emitted = (w: ReturnType<typeof mount>) => w.emitted('update:modelValue') ?? [];

describe('DatePanel', () => {
  it('first click starts the range, second ends it; order does not matter', async () => {
    const w = mount(DatePanel, { props: { presets: [] } });
    await day(w, '2025-10-20').trigger('click');
    expect(emitted(w)).toHaveLength(0);
    await day(w, '2025-10-10').trigger('click');
    expect(emitted(w)[0][0]).toEqual({ start: '2025-10-10', end: '2025-10-20' });
  });

  it('turns a half-picked range into a single day when closed', async () => {
    const w = mount(DatePanel, { props: { presets: [] } });
    await day(w, '2025-10-07').trigger('click');
    w.unmount();
    expect(emitted(w)[0][0]).toEqual({ start: '2025-10-07', end: '2025-10-07' });
  });

  it('min / max disable dates outside the bounds', () => {
    const w = mount(DatePanel, { props: { presets: [], min: '2025-10-05', max: '2025-10-15' } });
    expect(day(w, '2025-10-04').attributes('disabled')).toBeDefined();
    expect(day(w, '2025-10-05').attributes('disabled')).toBeUndefined();
    expect(day(w, '2025-10-16').attributes('disabled')).toBeDefined();
  });

  it('maxDays limits the range around the first click, in both directions', async () => {
    const w = mount(DatePanel, { props: { presets: [], maxDays: 7 } });
    expect(day(w, '2025-10-30').attributes('disabled')).toBeUndefined();
    await day(w, '2025-10-15').trigger('click');
    // 7 днів включно: 09…21 можна, 08 і 22 — ні.
    expect(day(w, '2025-10-09').attributes('disabled')).toBeUndefined();
    expect(day(w, '2025-10-21').attributes('disabled')).toBeUndefined();
    expect(day(w, '2025-10-08').attributes('disabled')).toBeDefined();
    expect(day(w, '2025-10-22').attributes('disabled')).toBeDefined();
  });

  it('disabledDate gets what is already picked', async () => {
    const seen: unknown[] = [];
    const disabledDate = (d: string, ctx: { start: string | null; end: string | null }) => {
      if (d === '2025-10-01') seen.push({ ...ctx });
      return ctx.start != null && ctx.end == null && Math.abs(diffDays(ctx.start, d)) > 31;
    };
    const w = mount(DatePanel, { props: { presets: [], disabledDate } });
    expect(seen.slice(-1)[0]).toEqual({ start: null, end: null });
    await day(w, '2025-10-02').trigger('click');
    expect(seen.slice(-1)[0]).toEqual({ start: '2025-10-02', end: null });
    await day(w, '2025-10-03').trigger('click');
    // Завершений період приходить назад через v-model.
    await w.setProps({ modelValue: emitted(w)[0][0] as any });
    expect(seen.slice(-1)[0]).toEqual({ start: '2025-10-02', end: '2025-10-03' });
  });

  it('ignores clicks on disabled dates', async () => {
    const w = mount(DatePanel, { props: { presets: [], max: '2025-10-15' } });
    expect(day(w, '2025-10-20').attributes('disabled')).toBeDefined();
    // Повз атрибут disabled (його й так не клікнути): перевіряємо захист у самому pick().
    (w.vm as any).$.setupState.pick('2025-10-20');
    await nextTick();
    await day(w, '2025-10-10').trigger('click');
    w.unmount();
    expect(emitted(w)[0][0]).toEqual({ start: '2025-10-10', end: '2025-10-10' });
  });

  it('presets select their range, mark the active one and respect max', async () => {
    const w = mount(DatePanel, {
      props: { presets: [datePresets.today(), datePresets.thisMonth()], max: '2025-10-15' },
    });
    const [todayBtn, monthBtn] = w.findAll('.sky-date-preset');
    // Цей місяць тягнеться до 31-го — за max.
    expect(monthBtn.attributes('disabled')).toBeDefined();
    await todayBtn.trigger('click');
    expect(emitted(w)[0][0]).toEqual({ start: '2025-10-15', end: '2025-10-15' });
    await w.setProps({ modelValue: { start: '2025-10-15', end: '2025-10-15' } });
    expect(w.findAll('.sky-date-preset')[0].classes()).toContain('is-active');
  });

  it('the presets slot replaces the buttons and gets select/isActive', async () => {
    const w = mount(DatePanel, {
      props: { presets: quarterPresets(2025) },
      slots: {
        presets: (p: any) =>
          p.presets.slice(0, 2).map((q: any) =>
            h('button', { class: ['q', { on: p.isActive(q.range()) }], onClick: () => p.select(q.range()) }, q.label),
          ),
      },
    });
    expect(w.findAll('.sky-date-preset')).toHaveLength(0);
    const qs = w.findAll('button.q');
    expect(qs.map((b) => b.text())).toEqual(['I кв. 2025', 'II кв. 2025']);
    await qs[1].trigger('click');
    expect(emitted(w)[0][0]).toEqual({ start: '2025-04-01', end: '2025-06-30' });
  });
});

describe('SkyDateFilter', () => {
  it('shows the range as a badge', async () => {
    const w = mount(SkyDateFilter, { props: { title: 'Період' } });
    expect(w.findComponent(SkyFilterDropdown).props('badge')).toBe('');
    await w.setProps({ modelValue: { start: '2025-10-01', end: '2025-10-15' } });
    expect(w.findComponent(SkyFilterDropdown).props('badge')).toBe('01.10.2025 – 15.10.2025');
    await w.setProps({ modelValue: { start: '2025-10-01', end: '2025-10-01' } });
    expect(w.findComponent(SkyFilterDropdown).props('badge')).toBe('01.10.2025');
  });

  it('"clear" empties the range, drops a half-picked start and closes', async () => {
    const w = mount(SkyDateFilter, {
      props: { title: 'Період', modelValue: { start: '2025-10-01', end: '2025-10-02' } },
      attachTo: document.body,
    });
    await w.find('.sky-filter-dropdown__trigger').trigger('click');
    (document.querySelector('[data-date="2025-10-09"]') as HTMLButtonElement).click();
    (document.querySelector('.sky-date-filter__btn--clear') as HTMLButtonElement).click();
    await nextTick();
    expect(emitted(w).map((e) => e[0])).toEqual([{ start: null, end: null }]);
    expect(document.querySelector('.sky-date-panel')).toBeNull();
  });

  it('keeps clear/done when the presets slot is used', async () => {
    const w = mount(SkyDateFilter, {
      props: { title: 'Період' },
      slots: { presets: () => h('span', { class: 'mine' }, 'x') },
      attachTo: document.body,
    });
    await w.find('.sky-filter-dropdown__trigger').trigger('click');
    expect(document.querySelector('.mine')).not.toBeNull();
    expect(document.querySelector('.sky-date-filter__btn--clear')).not.toBeNull();
    expect(document.querySelector('.sky-date-filter__btn--done')).not.toBeNull();
  });
});

describe('date presets', () => {
  it('default set is today, yesterday, this week (Mon–Sun), month to date', () => {
    expect(defaultDatePresets().map((p) => [p.label, p.range()])).toEqual([
      ['Сьогодні', { start: '2025-10-15', end: '2025-10-15' }],
      ['Вчора', { start: '2025-10-14', end: '2025-10-14' }],
      ['Тиждень', { start: '2025-10-13', end: '2025-10-19' }],
      ['Місяць', { start: '2025-10-01', end: '2025-10-15' }],
    ]);
  });

  it('this week crosses a month boundary correctly', () => {
    vi.setSystemTime(new Date(2025, 9, 1, 12)); // середа, 1 жовтня
    expect(datePresets.thisWeek().range()).toEqual({ start: '2025-09-29', end: '2025-10-05' });
  });

  it('last month and quarters have the right bounds', () => {
    expect(datePresets.lastMonth().range()).toEqual({ start: '2025-09-01', end: '2025-09-30' });
    expect(quarterPresets(2024).map((p) => p.range().end)).toEqual(['2024-03-31', '2024-06-30', '2024-09-30', '2024-12-31']);
  });

  it('SkyFilters "date" type counts only a complete range', () => {
    const f = { key: 'd', title: 'D', type: 'date' };
    const t = resolveFilterType(f);
    expect(t.emptyValue(f)).toEqual({ start: null, end: null });
    expect(t.display({ start: '2025-10-01', end: null }, f).count).toBe(0);
    expect(t.display({ start: '2025-10-01', end: '2025-10-03' }, f)).toMatchObject({ count: 1, badge: '01.10.2025 – 03.10.2025' });
  });
});
