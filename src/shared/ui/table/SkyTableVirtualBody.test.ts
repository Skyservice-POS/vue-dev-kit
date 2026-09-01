import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { h } from 'vue';
import SkyTableVirtualBody from './SkyTableVirtualBody.vue';

/**
 * The whole point of this component is that most rows are NOT in the DOM, so the
 * tests have to give the virtualizer a real viewport to reason about — happy-dom
 * reports zeros for every box, and with a zero-height scroll container the window
 * collapses and the assertions stop meaning anything.
 *
 * The size that matters is `offsetHeight`, not `getBoundingClientRect()`: that is
 * what virtual-core reads off the scroll element. Stubbing the rect instead looks
 * right and changes nothing. Row height comes from `estimateSize`, which needs no
 * measurement at all while `dynamic` is off.
 */

const ROW_HEIGHT = 40;
const VIEWPORT_HEIGHT = 400; // ten rows fit on screen

interface Row {
  id: string;
  name: string;
}

const makeRows = (count: number): Row[] =>
  Array.from({ length: count }, (_, i) => ({ id: `r${i}`, name: `Row ${i}` }));

/**
 * `mount` cannot carry a generic component's type parameter, so slot props and
 * prop callbacks arrive typed as `unknown` here. Narrow at that boundary rather
 * than casting the component itself, which would drop checking everywhere else.
 */
const asRow = (row: unknown) => row as Row;

const rowSlot = (props: { row: unknown; index: number }) =>
  h('div', { class: 'row' }, asRow(props.row).name);

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
});

/**
 * Awaits a tick before handing the wrapper back: the scroll element only exists
 * after mount, so the first render always computes an empty window. Asserting on
 * the synchronous result would test the placeholder, not the virtualizer.
 */
async function mountBody(
  rows: Row[],
  props: Record<string, unknown> = {},
): Promise<VueWrapper> {
  const wrapper = mount(SkyTableVirtualBody, {
    props: { rows, rowKey: (row: unknown) => asRow(row).id, estimateSize: ROW_HEIGHT, ...props },
    slots: { default: rowSlot, empty: () => h('div', { class: 'empty' }, 'no data') },
    attachTo: document.body,
  });
  await wrapper.vm.$nextTick();
  return wrapper;
}

describe('SkyTableVirtualBody', () => {
  it('keeps only a window of rows in the DOM, not the whole list', async () => {
    const wrapper = await mountBody(makeRows(1000));
    const rendered = wrapper.findAll('.row').length;

    expect(rendered).toBeGreaterThan(0);
    // Ten rows fit, plus overscan on both sides — anything near 1000 means the
    // virtualizer isn't windowing and the component is just a plain body.
    expect(rendered).toBeLessThan(100);
  });

  it('starts at the top of the list', async () => {
    const wrapper = await mountBody(makeRows(1000));
    expect(wrapper.findAll('.row')[0].text()).toBe('Row 0');
  });

  it('sizes the spacer to the full list, so the scrollbar matches every row', async () => {
    const wrapper = await mountBody(makeRows(1000));
    const sizer = wrapper.get('.sky-table__virtual-sizer').element as HTMLElement;

    expect(sizer.style.height).toBe(`${1000 * ROW_HEIGHT}px`);
  });

  it('offsets each rendered row to its place in the list', async () => {
    const wrapper = await mountBody(makeRows(1000));
    const rows = wrapper.findAll('.row');

    // Rows are absolutely positioned; the offset is what puts row N at N * height.
    const offsetOf = (index: number) =>
      (rows[index].element.parentElement as HTMLElement).style.transform;

    expect(offsetOf(0)).toBe('translateY(0px)');
    expect(offsetOf(1)).toBe(`translateY(${ROW_HEIGHT}px)`);
  });

  it('shows the empty slot and no spacer when there are no rows', async () => {
    const wrapper = await mountBody([]);

    expect(wrapper.find('.empty').exists()).toBe(true);
    expect(wrapper.find('.sky-table__virtual-sizer').exists()).toBe(false);
    expect(wrapper.findAll('.row')).toHaveLength(0);
  });

  it('emits `reach-end` once the last row is inside the window', async () => {
    // Three rows fit on screen with room to spare, so the tail is visible from
    // the start — that is exactly when a caller wants to load the next page.
    const wrapper = await mountBody(makeRows(3));

    expect(wrapper.emitted('reach-end')).toBeTruthy();
  });

  it('stays quiet while the tail is far below the window', async () => {
    const wrapper = await mountBody(makeRows(1000));

    expect(wrapper.emitted('reach-end')).toBeFalsy();
  });
});
