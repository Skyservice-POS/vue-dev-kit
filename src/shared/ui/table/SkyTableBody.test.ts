import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import SkyTableBody from './SkyTableBody.vue';

/**
 * Two modes share one component, and the switch is `rows`:
 *  - absent  → passthrough wrapper, the caller lays out the rows (the original API);
 *  - present → the body iterates and hands each row to the scoped slot.
 *
 * The second mode is the contract SkyTableVirtualBody mirrors, which is what lets
 * SkyDataTable flip virtualization without duplicating the row markup. Both halves
 * are pinned here — passthrough because consumers already depend on it, rows mode
 * because the switch silently degrades if the slot props stop arriving.
 */

interface Row {
  id: string;
  name: string;
}

const ROWS: Row[] = [
  { id: 'a', name: 'Alpha' },
  { id: 'b', name: 'Beta' },
  { id: 'c', name: 'Gamma' },
];

/**
 * `mount` cannot carry a generic component's type parameter, so slot props and
 * prop callbacks arrive typed as `unknown` here. Narrow at that boundary rather
 * than casting the component itself, which would drop checking everywhere else.
 */
const asRow = (row: unknown) => row as Row;

const rowSlot = (props: { row: unknown; index: number }) =>
  h('div', { class: 'row' }, `${props.index}:${asRow(props.row).name}`);

describe('SkyTableBody — passthrough mode', () => {
  it('renders caller-supplied content when `rows` is not given', () => {
    const wrapper = mount(SkyTableBody, {
      slots: { default: () => h('div', { class: 'row' }, 'hand-written') },
    });

    expect(wrapper.findAll('.row')).toHaveLength(1);
    expect(wrapper.text()).toContain('hand-written');
  });

  it('never shows the empty slot without `rows` — the caller owns that decision', () => {
    const wrapper = mount(SkyTableBody, {
      slots: {
        default: () => h('div', { class: 'row' }, 'hand-written'),
        empty: () => h('div', { class: 'empty' }, 'nothing here'),
      },
    });

    expect(wrapper.find('.empty').exists()).toBe(false);
  });
});

describe('SkyTableBody — rows mode', () => {
  it('renders the slot once per row, in order, with row and index', () => {
    const wrapper = mount(SkyTableBody, {
      props: { rows: ROWS },
      slots: { default: rowSlot },
    });

    const rendered = wrapper.findAll('.row').map((node) => node.text());
    expect(rendered).toEqual(['0:Alpha', '1:Beta', '2:Gamma']);
  });

  it('shows the empty slot only when `rows` is empty', () => {
    const filled = mount(SkyTableBody, {
      props: { rows: ROWS },
      slots: { default: rowSlot, empty: () => h('div', { class: 'empty' }, 'no data') },
    });
    expect(filled.find('.empty').exists()).toBe(false);

    const empty = mount(SkyTableBody, {
      props: { rows: [] as Row[] },
      slots: { default: rowSlot, empty: () => h('div', { class: 'empty' }, 'no data') },
    });
    expect(empty.find('.empty').exists()).toBe(true);
    expect(empty.findAll('.row')).toHaveLength(0);
  });

  it('keys rows by `rowKey`, so reordering moves DOM nodes instead of rewriting them', async () => {
    const wrapper = mount(SkyTableBody, {
      props: { rows: [...ROWS], rowKey: (row: unknown) => asRow(row).id },
      slots: { default: rowSlot },
    });

    // Tag the node that renders Alpha, then move Alpha to the end. With a correct
    // key Vue relocates that very node; keyed by index it would recycle the node
    // in place and repaint it as Gamma — losing any DOM state a cell was holding.
    const alpha = wrapper.findAll('.row')[0].element as HTMLElement;
    alpha.dataset.marker = 'alpha';

    await wrapper.setProps({ rows: [ROWS[1], ROWS[2], ROWS[0]] });

    const moved = wrapper.findAll('.row');
    expect(moved.map((node) => node.text())).toEqual(['0:Beta', '1:Gamma', '2:Alpha']);
    expect((moved[2].element as HTMLElement).dataset.marker).toBe('alpha');
  });
});
