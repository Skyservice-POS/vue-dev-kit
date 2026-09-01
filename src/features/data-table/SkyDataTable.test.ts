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
