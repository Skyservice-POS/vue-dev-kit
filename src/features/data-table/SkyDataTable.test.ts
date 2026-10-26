import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import SkyDataTable from './SkyDataTable.vue';
import type { Component } from 'vue';
import { createSkyColumnHelper } from '../../shared/lib/table/tableFeatures';

/**
 * `virtual` swaps the table's body component and nothing else — same header, same
 * sorting, same row markup. These tests pin that seam: the switch has to change
 * how many rows reach the DOM without changing what the table reports about them.
 *
 * As in the virtual-body tests, the size the virtualizer reads is `offsetHeight`;
 * happy-dom reports zero for it, which would collapse the window to nothing.
 */

const ROW_HEIGHT = 40;
const VIEWPORT_HEIGHT = 400;

interface Product {
  id: number;
  name: string;
}

const column = createSkyColumnHelper<Product>();
const columns = [column.accessor('name', { header: 'Назва' })];

/**
 * `mount` cannot carry SkyDataTable's generic: TData widens to a plain record and
 * the column defs stop matching. The component goes in untyped for that reason
 * alone — the columns above are still built through the typed helper.
 */
const TableUnderTest = SkyDataTable as unknown as Component;

const makeData = (count: number): Product[] =>
  Array.from({ length: count }, (_, i) => ({ id: i + 1, name: `Товар ${i + 1}` }));

const SIZED = ['offsetHeight', 'offsetWidth'] as const;
const originalDescriptors = new Map<string, PropertyDescriptor | undefined>();

beforeEach(() => {
  for (const prop of SIZED) {
    originalDescriptors.set(prop, Object.getOwnPropertyDescriptor(HTMLElement.prototype, prop));
    Object.defineProperty(HTMLElement.prototype, prop, {
      configurable: true,
      get: () => (prop === 'offsetHeight' ? VIEWPORT_HEIGHT : 800),
    });
  }
});

afterEach(() => {
  for (const prop of SIZED) {
    const descriptor = originalDescriptors.get(prop);
    if (descriptor) Object.defineProperty(HTMLElement.prototype, prop, descriptor);
    else delete (HTMLElement.prototype as unknown as Record<string, unknown>)[prop];
  }
  originalDescriptors.clear();
  vi.restoreAllMocks();
});

async function mountTable(props: Record<string, unknown>): Promise<VueWrapper> {
  const wrapper = mount(TableUnderTest, {
    props: { columns, rowId: 'id', ...props },
    attachTo: document.body,
  });
  await wrapper.vm.$nextTick();
  return wrapper;
}

const bodyRows = (wrapper: VueWrapper) => wrapper.findAll('.sky-table__row');

describe('SkyDataTable — virtual switch', () => {
  it('renders every row when virtualization is off', async () => {
    const wrapper = await mountTable({ data: makeData(300) });
    expect(bodyRows(wrapper)).toHaveLength(300);
  });

  it('renders only a window when virtualization is on', async () => {
    const wrapper = await mountTable({
      data: makeData(300),
      virtual: { estimateSize: ROW_HEIGHT },
    });

    const rendered = bodyRows(wrapper).length;
    expect(rendered).toBeGreaterThan(0);
    expect(rendered).toBeLessThan(300);
  });

  it('forwards virtual options to the body', async () => {
    // Deliberately unlike the body's own default: if the object stopped being
    // passed through, the spacer would fall back to that default and still look
    // plausible. The height is the only place the value surfaces.
    const ESTIMATE = 100;
    const wrapper = await mountTable({
      data: makeData(300),
      virtual: { estimateSize: ESTIMATE },
    });

    const sizer = wrapper.get('.sky-table__virtual-sizer').element as HTMLElement;
    expect(sizer.style.height).toBe(`${300 * ESTIMATE}px`);
  });

  it('accepts `virtual` as a bare boolean', async () => {
    const wrapper = await mountTable({ data: makeData(300), virtual: true });
    expect(bodyRows(wrapper).length).toBeLessThan(300);
  });

  it('still reports the full row count while windowing', async () => {
    // The table's own state is untouched by virtualization — only the DOM shrinks.
    const wrapper = await mountTable({ data: makeData(300), virtual: true });
    const table = (wrapper.vm as unknown as { table: { getRowCount(): number } }).table;

    expect(table.getRowCount()).toBe(300);
  });

  it('shows the empty state in both modes', async () => {
    const plain = await mountTable({ data: [], emptyText: 'Даних немає' });
    expect(plain.text()).toContain('Даних немає');

    const virtual = await mountTable({ data: [], virtual: true, emptyText: 'Даних немає' });
    expect(virtual.text()).toContain('Даних немає');
  });

  it('warns when `virtual` and `pageSize` are combined', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await mountTable({ data: makeData(300), virtual: true, pageSize: 25 });

    expect(warn).toHaveBeenCalledOnce();
    expect(String(warn.mock.calls[0][0])).toContain('pageSize');
  });

  it('stays quiet when only one of them is set', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await mountTable({ data: makeData(300), virtual: true });
    await mountTable({ data: makeData(300), pageSize: 25 });

    expect(warn).not.toHaveBeenCalled();
  });
});

describe('SkyDataTable — pagination via SkyPagination', () => {
  const names = (wrapper: VueWrapper) => bodyRows(wrapper).map((r) => r.text());
  const pageBtn = (wrapper: VueWrapper, n: number) =>
    wrapper.findAll('.sky-pagination__page').find((b) => b.text() === String(n))!;

  it('renders SkyPagination with the full count and the first page of rows', async () => {
    const wrapper = await mountTable({ data: makeData(60), pageSize: 25 });
    const pager = wrapper.findComponent({ name: 'SkyPagination' });
    expect(pager.exists()).toBe(true);
    expect(pager.props()).toMatchObject({ total: 60, page: 1, pageSize: 25 });
    expect(wrapper.findAll('.sky-pagination__page').map((b) => b.text())).toEqual(['1', '2', '3']);
    expect(bodyRows(wrapper)).toHaveLength(25);
    expect(wrapper.find('.sky-data-table__count').text()).toBe('Знайдено 60');
  });

  it('a page click shows that page and emits update:page', async () => {
    const wrapper = await mountTable({ data: makeData(60), pageSize: 25 });
    await pageBtn(wrapper, 3).trigger('click');
    expect(names(wrapper)).toEqual(Array.from({ length: 10 }, (_, i) => `Товар ${51 + i}`));
    expect(wrapper.findComponent({ name: 'SkyPagination' }).props('page')).toBe(3);
    expect(wrapper.emitted('update:page')).toEqual([[3]]);
  });

  it('a new page size goes back to page 1 and emits update:pageSize', async () => {
    const wrapper = await mountTable({ data: makeData(60), pageSize: 25 });
    await pageBtn(wrapper, 2).trigger('click');
    wrapper.findComponent({ name: 'SkyPagination' }).vm.$emit('update:pageSize', 10);
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent({ name: 'SkyPagination' }).props()).toMatchObject({ page: 1, pageSize: 10 });
    expect(names(wrapper)[0]).toBe('Товар 1');
    expect(bodyRows(wrapper)).toHaveLength(10);
    expect(wrapper.emitted('update:pageSize')).toEqual([[10]]);
  });

  it('applies a pageSize prop change after mount', async () => {
    const wrapper = await mountTable({ data: makeData(60), pageSize: 25 });
    await pageBtn(wrapper, 2).trigger('click');
    await wrapper.setProps({ pageSize: 50 });
    expect(wrapper.findComponent({ name: 'SkyPagination' }).props()).toMatchObject({ page: 1, pageSize: 50 });
    expect(bodyRows(wrapper)).toHaveLength(50);
  });

  it('forwards pageSizeOptions and pageAllLabel', async () => {
    const allLabel = (n: number) => `Усі ${n}`;
    const wrapper = await mountTable({ data: makeData(60), pageSize: 25, pageSizeOptions: [10, 25], pageAllLabel: allLabel });
    expect(wrapper.findComponent({ name: 'SkyPagination' }).props()).toMatchObject({
      pageSizeOptions: [10, 25],
      allLabel,
    });
  });

  it('has no pager without pageSize, and none for an empty result', async () => {
    const off = await mountTable({ data: makeData(60) });
    expect(off.findComponent({ name: 'SkyPagination' }).exists()).toBe(false);
    off.unmount();
    const empty = await mountTable({ data: [], pageSize: 25 });
    expect(empty.findComponent({ name: 'SkyPagination' }).exists()).toBe(false);
  });
});

describe('SkyDataTable — toolbar', () => {
  it('puts the actions slot into a right-aligned container', async () => {
    const wrapper = mount(TableUnderTest, {
      props: { columns, rowId: 'id', data: makeData(3), searchable: true },
      slots: { actions: '<button class="my-action">x</button>' },
    });
    const actions = wrapper.find('.sky-data-table__toolbar > .sky-data-table__actions');
    expect(actions.exists()).toBe(true);
    expect(actions.find('.my-action').exists()).toBe(true);
  });

  it('renders no actions container without the slot', async () => {
    const wrapper = mount(TableUnderTest, { props: { columns, rowId: 'id', data: makeData(3), searchable: true } });
    expect(wrapper.find('.sky-data-table__actions').exists()).toBe(false);
  });
});

describe('SkyDataTable — fitRows', () => {
  /** Тіло заданої висоти, рядок — 41px (40 + рамка), як у справжній верстці. */
  function stubHeights(bodyHeight: { value: number }, rowHeight = 41) {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      get(this: HTMLElement) {
        return this.classList.contains('sky-table__row') ? rowHeight : VIEWPORT_HEIGHT;
      },
    });
    const original = Object.getOwnPropertyDescriptor(Element.prototype, 'clientHeight');
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      get(this: HTMLElement) {
        return this.classList.contains('sky-table__body') ? bodyHeight.value : 0;
      },
    });
    return () => {
      delete (HTMLElement.prototype as unknown as Record<string, unknown>).clientHeight;
      if (original) Object.defineProperty(Element.prototype, 'clientHeight', original);
    };
  }

  let restore: (() => void) | null = null;
  afterEach(() => {
    restore?.();
    restore = null;
  });

  const pager = (wrapper: VueWrapper) => wrapper.findComponent({ name: 'SkyPagination' });
  const recalc = (wrapper: VueWrapper) => (wrapper.vm as unknown as { recalcFit(): void }).recalcFit();

  it('stays off by default', async () => {
    restore = stubHeights({ value: 410 });
    const wrapper = await mountTable({ data: makeData(60), pageSize: 25 });
    // Навіть прямий виклик (метод відкритий через ref) без fitRows нічого не робить.
    recalc(wrapper);
    expect(wrapper.emitted('fit-rows')).toBeUndefined();
    expect(pager(wrapper).props('pageSize')).toBe(25);
  });

  it('emits how many rows fit the body', async () => {
    restore = stubHeights({ value: 410 });
    const wrapper = await mountTable({ data: makeData(60), fitRows: true });
    expect(wrapper.emitted('fit-rows')).toEqual([[10]]);
  });

  it('with pagination, sizes the page to fit and hides the size selector', async () => {
    restore = stubHeights({ value: 410 });
    const wrapper = await mountTable({ data: makeData(60), pageSize: 25, fitRows: true });
    expect(pager(wrapper).props()).toMatchObject({ pageSize: 10, pageSizeOptions: [] });
    expect(bodyRows(wrapper)).toHaveLength(10);
  });

  it('keeps the same first row when the body is resized', async () => {
    const body = { value: 410 };
    restore = stubHeights(body);
    const wrapper = await mountTable({ data: makeData(60), pageSize: 25, fitRows: true });
    const table = (wrapper.vm as unknown as { table: { setPageIndex(i: number): void } }).table;
    table.setPageIndex(2); // рядки 21–30
    await wrapper.vm.$nextTick();
    body.value = 205; // 5 рядків
    recalc(wrapper);
    await wrapper.vm.$nextTick();
    expect(pager(wrapper).props()).toMatchObject({ pageSize: 5, page: 5 });
    expect(bodyRows(wrapper)[0].text()).toBe('Товар 21');
    expect(wrapper.emitted('fit-rows')).toEqual([[10], [5]]);
  });

  it('does not re-emit when the count is unchanged', async () => {
    const body = { value: 410 };
    restore = stubHeights(body);
    const wrapper = await mountTable({ data: makeData(60), fitRows: true });
    body.value = 420;
    recalc(wrapper);
    expect(wrapper.emitted('fit-rows')).toEqual([[10]]);
  });

  it('honours rowHeight and min', async () => {
    restore = stubHeights({ value: 410 });
    const tall = await mountTable({ data: makeData(60), fitRows: { rowHeight: 100 } });
    expect(tall.emitted('fit-rows')).toEqual([[4]]);
    tall.unmount();
    const atLeast = await mountTable({ data: makeData(60), fitRows: { rowHeight: 1000, min: 3 } });
    expect(atLeast.emitted('fit-rows')).toEqual([[3]]);
  });

  it('falls back to the CSS row height (40 + border) before any row is rendered', async () => {
    // 400 / 41 = 9; без урахування рамки вийшло б 10 — і рядок би вилазив.
    restore = stubHeights({ value: 400 });
    const wrapper = await mountTable({ data: [], fitRows: true });
    expect(wrapper.emitted('fit-rows')).toEqual([[9]]);
  });

  it('warns when combined with virtual', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    restore = stubHeights({ value: 410 });
    await mountTable({ data: makeData(10), virtual: true, fitRows: true });
    expect(warn.mock.calls.some((c) => String(c[0]).includes('fitRows'))).toBe(true);
  });
});
