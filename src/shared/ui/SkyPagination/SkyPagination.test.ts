import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import SkyPagination from './SkyPagination.vue';

/**
 * happy-dom нічого не верстає, тож ширини стабимо: кожен номер чи «…» — 40px,
 * вміст переповнює корінь, щойно пунктів більше, ніж `width / 40`.
 */
const ITEM = 40;
let width = 0;
let resize: (() => void) | null = null;
/** Ширина пункту; за замовчуванням однакова, у тесті на зміну сторінки — від цифр. */
let itemWidth: (el: Element) => number = () => ITEM;

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(cb: () => void) {
        resize = cb;
      }
      observe() {
        resize?.();
      }
      unobserve() {}
      disconnect() {}
    },
  );
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return this.classList.contains('sky-pagination') ? width : 0;
  });
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(function (this: HTMLElement) {
    if (!this.classList.contains('sky-pagination')) return 0;
    return [...this.querySelectorAll('.sky-pagination__page, .sky-pagination__gap')].reduce(
      (sum, el) => sum + itemWidth(el),
      0,
    );
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  resize = null;
  itemWidth = () => ITEM;
});

async function render(page: number, w: number) {
  width = w;
  const wrapper = mount(SkyPagination, { props: { total: 47, page, pageSize: 1, pageSizeOptions: [1] } });
  await flushPromises();
  return wrapper;
}

const items = (wrapper: Awaited<ReturnType<typeof render>>) =>
  wrapper.findAll('.sky-pagination__page, .sky-pagination__gap').map((b) => b.text());

describe('SkyPagination — fitting page numbers to the width', () => {
  it('shows every page when they all fit', async () => {
    expect(items(await render(1, 47 * ITEM))).toHaveLength(47);
  });

  it('near the start: as many leading pages as fit, then … and the last', async () => {
    expect(items(await render(1, 8 * ITEM))).toEqual(['1', '2', '3', '4', '5', '6', '…', '47']);
  });

  it('in the middle: leading pages, …, prev/current/next, …, last', async () => {
    expect(items(await render(20, 8 * ITEM))).toEqual(['1', '2', '…', '19', '20', '21', '…', '47']);
  });

  it('near the end: the window merges with the last page', async () => {
    expect(items(await render(46, 8 * ITEM))).toEqual(['1', '2', '3', '4', '…', '45', '46', '47']);
  });

  it('never hides a single page behind …', async () => {
    expect(items(await render(5, 8 * ITEM))).toEqual(['1', '2', '3', '4', '5', '6', '…', '47']);
  });

  it('refits when the available width changes', async () => {
    const wrapper = await render(20, 8 * ITEM);
    width = 10 * ITEM;
    resize?.();
    await flushPromises();
    expect(items(wrapper)).toEqual(['1', '2', '3', '4', '…', '19', '20', '21', '…', '47']);
  });

  // Двозначні номери ширші: на 30-й сторінці їх більше, тож бюджет, підібраний
  // для першої, уже переповнює рядок.
  it('refits when the current page changes', async () => {
    itemWidth = (el) => 20 + 10 * (el.textContent ?? '').trim().length;
    const wrapper = await render(1, 340);
    expect(items(wrapper)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '…', '47']);
    await wrapper.setProps({ page: 30 });
    await flushPromises();
    expect(items(wrapper)).toEqual(['1', '2', '3', '4', '…', '29', '30', '31', '…', '47']);
  });
});
