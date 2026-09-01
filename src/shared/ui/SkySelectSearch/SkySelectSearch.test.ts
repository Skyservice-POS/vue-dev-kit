import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import SkySelectSearch from './SkySelectSearch.vue';

/**
 * The geometry the component reacts to lives on the trigger's bounding box, which
 * happy-dom always reports as zeros — so every placement test stubs it explicitly.
 * Keep these in sync with the constants in the component.
 */
const GAP = 4;
const MIN_PANEL_HEIGHT = 160;
const EDGE = 8;

const VIEWPORT_HEIGHT = 800;
const TRIGGER_HEIGHT = 42;

/** Default searchThreshold is 6, so this short list never renders the search box. */
const OPTIONS = [
  { value: 0, text: 'Не обрано' },
  { value: 5, text: 'Основний склад' },
  { value: 8, text: 'Вітрина' },
];

/** Long enough to cross the default threshold. */
const MANY_OPTIONS = Array.from({ length: 6 }, (_, i) => ({ value: i + 1, text: `Склад ${i + 1}` }));

/** Pins the trigger at `top` so the component sees a real box to measure against. */
function placeTriggerAt(wrapper: VueWrapper, top: number): void {
  const trigger = wrapper.get('.sky-select-search__trigger').element as HTMLElement;
  trigger.getBoundingClientRect = () =>
    ({ top, bottom: top + TRIGGER_HEIGHT, left: 0, right: 200, width: 200, height: TRIGGER_HEIGHT }) as DOMRect;
}

function mountSelect(props: Record<string, unknown> = {}): VueWrapper {
  return mount(SkySelectSearch, {
    props: { options: OPTIONS, ...props },
    attachTo: document.body,
  });
}

/** Opens via the trigger after the box is stubbed, so placement runs on real numbers. */
async function openAt(wrapper: VueWrapper, top: number): Promise<void> {
  placeTriggerAt(wrapper, top);
  await wrapper.get('.sky-select-search__trigger').trigger('click');
}

const dropdown = (wrapper: VueWrapper) => wrapper.get('.sky-select-search__dropdown');

beforeEach(() => {
  window.innerHeight = VIEWPORT_HEIGHT;
});

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('SkySelectSearch — placement', () => {
  it('opens downwards when there is room below', async () => {
    const wrapper = mountSelect();
    await openAt(wrapper, 100);

    expect(dropdown(wrapper).classes()).not.toContain('is-drop-up');
  });

  it('flips upwards when the space below is too cramped', async () => {
    const wrapper = mountSelect();
    // 800 - (700 + 42) - 4 - 8 = 46px below, far under MIN_PANEL_HEIGHT.
    await openAt(wrapper, 700);

    expect(dropdown(wrapper).classes()).toContain('is-drop-up');
  });

  it('stays downwards when below is cramped but still the roomier side', async () => {
    const wrapper = mountSelect();
    window.innerHeight = 260;
    // below = 260 - 62 - 12 = 186 … but keep the trigger high so above is tiny.
    await openAt(wrapper, 20);

    // above = 20 - 12 = 8, which is smaller than below — flipping would be worse.
    expect(dropdown(wrapper).classes()).not.toContain('is-drop-up');
  });

  it('caps the panel height to the room on the chosen side', async () => {
    const wrapper = mountSelect();
    await openAt(wrapper, 100);

    const below = VIEWPORT_HEIGHT - (100 + TRIGGER_HEIGHT) - GAP - EDGE;
    expect(dropdown(wrapper).attributes('style')).toContain(`max-height: ${below}px`);
  });

  it('never caps the panel below the usable minimum', async () => {
    const wrapper = mountSelect();
    window.innerHeight = 120;
    await openAt(wrapper, 40);

    expect(dropdown(wrapper).attributes('style')).toContain(`max-height: ${MIN_PANEL_HEIGHT}px`);
  });

  it('re-evaluates the side while open when the page scrolls', async () => {
    const wrapper = mountSelect();
    await openAt(wrapper, 100);
    expect(dropdown(wrapper).classes()).not.toContain('is-drop-up');

    // The trigger scrolled towards the bottom edge; the panel must follow suit.
    placeTriggerAt(wrapper, 700);
    window.dispatchEvent(new Event('scroll'));
    await wrapper.vm.$nextTick();

    expect(dropdown(wrapper).classes()).toContain('is-drop-up');
  });

  it('drops the scroll and resize listeners once closed', async () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    const wrapper = mountSelect();
    await openAt(wrapper, 100);
    await wrapper.get('.sky-select-search__trigger').trigger('click');

    const removed = remove.mock.calls.map(([type]) => type);
    expect(removed).toContain('scroll');
    expect(removed).toContain('resize');
  });

  it('drops the listeners when unmounted while still open', async () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    const wrapper = mountSelect();
    await openAt(wrapper, 100);
    wrapper.unmount();

    const removed = remove.mock.calls.map(([type]) => type);
    expect(removed).toContain('scroll');
    expect(removed).toContain('resize');
  });
});

describe('SkySelectSearch — selection', () => {
  it('emits the option value unchanged, so numbers stay numbers', async () => {
    const wrapper = mountSelect();
    await openAt(wrapper, 100);
    await wrapper.findAll('.sky-select-search__option')[1].trigger('mousedown');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([5]);
  });

  it('shows the selected option text on the trigger', async () => {
    const wrapper = mountSelect({ modelValue: 8 });

    expect(wrapper.get('.sky-select-search__value').text()).toBe('Вітрина');
  });

  it('falls back to the placeholder when nothing matches the model', () => {
    const wrapper = mountSelect({ modelValue: 999, placeholder: 'Оберіть склад' });

    expect(wrapper.get('.sky-select-search__value').text()).toBe('Оберіть склад');
    expect(wrapper.get('.sky-select-search__value').classes()).toContain('is-placeholder');
  });

  it('filters options by the search query', async () => {
    const wrapper = mountSelect({ options: OPTIONS, searchThreshold: 0 });
    await openAt(wrapper, 100);
    await wrapper.get('.sky-select-search__input').setValue('вітр');

    const texts = wrapper.findAll('.sky-select-search__option').map((o) => o.text());
    expect(texts).toEqual(['Вітрина']);
  });

  it('shows the empty text when the query matches nothing', async () => {
    const wrapper = mountSelect({ searchThreshold: 0, noResultsText: 'Порожньо' });
    await openAt(wrapper, 100);
    await wrapper.get('.sky-select-search__input').setValue('zzz');

    expect(wrapper.find('.sky-select-search__empty').text()).toBe('Порожньо');
    expect(wrapper.findAll('.sky-select-search__option')).toHaveLength(0);
  });

  it('picks the highlighted option with the keyboard from the search field', async () => {
    const wrapper = mountSelect({ searchThreshold: 0 });
    await openAt(wrapper, 100);
    const input = wrapper.get('.sky-select-search__input');
    await input.trigger('keydown', { key: 'ArrowDown' });
    await input.trigger('keydown', { key: 'Enter' });

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([5]);
  });

  it('closes on Escape without emitting', async () => {
    const wrapper = mountSelect({ searchThreshold: 0 });
    await openAt(wrapper, 100);
    await wrapper.get('.sky-select-search__input').trigger('keydown', { key: 'Escape' });

    expect(wrapper.find('.sky-select-search__dropdown').exists()).toBe(false);
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('does not open while disabled', async () => {
    const wrapper = mountSelect({ disabled: true });
    await openAt(wrapper, 100);

    expect(wrapper.find('.sky-select-search__dropdown').exists()).toBe(false);
    expect(wrapper.classes()).toContain('is-disabled');
  });
});

describe('SkySelectSearch — search threshold', () => {
  it('hides the search box on a list shorter than the default threshold', async () => {
    const wrapper = mountSelect();
    await openAt(wrapper, 100);

    expect(wrapper.find('.sky-select-search__search').exists()).toBe(false);
    expect(wrapper.findAll('.sky-select-search__option')).toHaveLength(OPTIONS.length);
  });

  it('shows the search box once the list reaches the default threshold', async () => {
    const wrapper = mountSelect({ options: MANY_OPTIONS });
    await openAt(wrapper, 100);

    expect(wrapper.find('.sky-select-search__search').exists()).toBe(true);
  });

  it('honours a custom threshold', async () => {
    const wrapper = mountSelect({ options: OPTIONS, searchThreshold: 3 });
    await openAt(wrapper, 100);

    expect(wrapper.find('.sky-select-search__search').exists()).toBe(true);
  });

  it('never shows the search box when the threshold is Infinity', async () => {
    const wrapper = mountSelect({ options: MANY_OPTIONS, searchThreshold: Infinity });
    await openAt(wrapper, 100);

    expect(wrapper.find('.sky-select-search__search').exists()).toBe(false);
  });

  // Counting filtered options instead of all of them would make the search box
  // disappear mid-typing as soon as the query narrowed the list past the threshold.
  it('keeps the search box while a query narrows the list below the threshold', async () => {
    const wrapper = mountSelect({ options: MANY_OPTIONS });
    await openAt(wrapper, 100);
    await wrapper.get('.sky-select-search__input').setValue('Склад 1');

    expect(wrapper.findAll('.sky-select-search__option').length).toBeLessThan(MANY_OPTIONS.length);
    expect(wrapper.find('.sky-select-search__search').exists()).toBe(true);
  });

  // Without a search field there is nothing else focused to receive the keys, so the
  // trigger has to drive the list itself.
  it('navigates and selects from the trigger when the search box is hidden', async () => {
    const wrapper = mountSelect();
    await openAt(wrapper, 100);
    const trigger = wrapper.get('.sky-select-search__trigger');
    await trigger.trigger('keydown', { key: 'ArrowDown' });
    await trigger.trigger('keydown', { key: 'Enter' });

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([5]);
  });

  it('closes on Escape from the trigger when the search box is hidden', async () => {
    const wrapper = mountSelect();
    await openAt(wrapper, 100);
    await wrapper.get('.sky-select-search__trigger').trigger('keydown', { key: 'Escape' });

    expect(wrapper.find('.sky-select-search__dropdown').exists()).toBe(false);
  });

  it('points aria-activedescendant at the trigger only when the search box is hidden', async () => {
    const withoutSearch = mountSelect();
    await openAt(withoutSearch, 100);
    expect(withoutSearch.get('.sky-select-search__trigger').attributes('aria-activedescendant')).toBeTruthy();

    const withSearch = mountSelect({ options: MANY_OPTIONS });
    await openAt(withSearch, 100);
    expect(withSearch.get('.sky-select-search__trigger').attributes('aria-activedescendant')).toBeUndefined();
    expect(withSearch.get('.sky-select-search__input').attributes('aria-activedescendant')).toBeTruthy();
  });
});
