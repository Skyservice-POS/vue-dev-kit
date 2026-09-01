import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import SkyCheckbox from './SkyCheckbox.vue';

/**
 * Кожен блок нижче — одна з обіцянок нативного `<input type="checkbox">`, яку
 * компонент має тримати, щоб його можна було ставити на місце нативного, не
 * перевіряючи щоразу, чи він поводиться так само (Liskov Substitution).
 */

/** Кліком не обійтись: треба саме розсинхрон DOM і пропів, як після відхиленого оновлення. */
async function fireChange(wrapper: ReturnType<typeof mount>, checked: boolean) {
  const input = wrapper.get('input');
  (input.element as HTMLInputElement).checked = checked;
  await input.trigger('change');
}

describe('SkyCheckbox — режим boolean', () => {
  it('віддає новий стан', async () => {
    const wrapper = mount(SkyCheckbox, { props: { modelValue: false } });
    await fireChange(wrapper, true);

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true]);
  });

  it('малює галочку за modelValue', async () => {
    const wrapper = mount(SkyCheckbox, { props: { modelValue: true } });
    expect((wrapper.get('input').element as HTMLInputElement).checked).toBe(true);

    await wrapper.setProps({ modelValue: false });
    expect((wrapper.get('input').element as HTMLInputElement).checked).toBe(false);
  });
});

describe('SkyCheckbox — режим масиву', () => {
  it('додає значення при виборі', async () => {
    const wrapper = mount(SkyCheckbox, { props: { modelValue: ['a'], value: 'b' } });
    await fireChange(wrapper, true);

    expect(wrapper.emitted('update:modelValue')?.[0][0]).toEqual(['a', 'b']);
  });

  it('прибирає значення при знятті', async () => {
    const wrapper = mount(SkyCheckbox, { props: { modelValue: ['a', 'b'], value: 'b' } });
    await fireChange(wrapper, false);

    expect(wrapper.emitted('update:modelValue')?.[0][0]).toEqual(['a']);
  });

  // Найважливіший тест файлу. splice(indexOf(v), 1) при indexOf === -1 зрізав
  // ОСТАННІЙ елемент: чекбокс, у якого просили зняти 'c', видаляв 'b'.
  it('не чіпає чужі елементи, коли свого значення в списку немає', async () => {
    const wrapper = mount(SkyCheckbox, { props: { modelValue: ['a', 'b'], value: 'c' } });
    await fireChange(wrapper, false);

    expect(wrapper.emitted('update:modelValue')?.[0][0]).toEqual(['a', 'b']);
  });

  it('не дублює значення, якщо воно вже у списку', async () => {
    const wrapper = mount(SkyCheckbox, { props: { modelValue: ['a'], value: 'a' } });
    await fireChange(wrapper, true);

    expect(wrapper.emitted('update:modelValue')?.[0][0]).toEqual(['a']);
  });

  it('не пхає undefined у список, коли `value` не задали', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const wrapper = mount(SkyCheckbox, { props: { modelValue: ['a'] } });
    await fireChange(wrapper, true);

    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    warn.mockRestore();
  });

  it('не мутує масив, який дав споживач', async () => {
    const source = ['a', 'b'];
    const wrapper = mount(SkyCheckbox, { props: { modelValue: source, value: 'b' } });
    await fireChange(wrapper, false);

    expect(source).toEqual(['a', 'b']);
  });
});

describe('SkyCheckbox — третій стан', () => {
  it('вмикає indeterminate на самому інпуті', async () => {
    const wrapper = mount(SkyCheckbox, { props: { modelValue: false, indeterminate: true } });

    expect((wrapper.get('input').element as HTMLInputElement).indeterminate).toBe(true);
  });

  it('знімає indeterminate разом із пропом', async () => {
    const wrapper = mount(SkyCheckbox, { props: { modelValue: false, indeterminate: true } });
    await wrapper.setProps({ indeterminate: false });

    expect((wrapper.get('input').element as HTMLInputElement).indeterminate).toBe(false);
  });

  it('лишається окремим від checked, як у DOM', () => {
    const wrapper = mount(SkyCheckbox, { props: { modelValue: true, indeterminate: true } });
    const input = wrapper.get('input').element as HTMLInputElement;

    expect(input.checked).toBe(true);
    expect(input.indeterminate).toBe(true);
  });
});

describe('SkyCheckbox — атрибути', () => {
  it('віддає атрибути контрола самому <input>', () => {
    const wrapper = mount(SkyCheckbox, {
      props: { modelValue: false },
      attrs: { name: 'agree', required: true, tabindex: '-1', 'aria-label': 'Погоджуюсь' },
    });
    const input = wrapper.get('input');

    expect(input.attributes('name')).toBe('agree');
    expect(input.attributes('required')).toBeDefined();
    expect(input.attributes('tabindex')).toBe('-1');
    expect(input.attributes('aria-label')).toBe('Погоджуюсь');
  });

  // Без inheritAttrs: false вони осідали б ще й на <label>, де нічого не значать:
  // name/required не потрапляли б у форму, а tabindex зробив би фокусованою
  // обгортку замість контрола.
  it('не лишає їх на <label>', () => {
    const wrapper = mount(SkyCheckbox, {
      props: { modelValue: false },
      attrs: { name: 'agree', required: true, tabindex: '-1' },
    });

    expect(wrapper.attributes('name')).toBeUndefined();
    expect(wrapper.attributes('required')).toBeUndefined();
    expect(wrapper.attributes('tabindex')).toBeUndefined();
  });

  it('лишає class і style на корені — ними позиціонують обгортку', () => {
    const wrapper = mount(SkyCheckbox, {
      props: { modelValue: false },
      attrs: { class: 'my-box', style: 'margin-top: 4px' },
    });

    expect(wrapper.classes()).toContain('my-box');
    expect(wrapper.classes()).toContain('sky-checkbox');
    expect(wrapper.attributes('style')).toContain('margin-top');
    expect(wrapper.get('input').classes()).not.toContain('my-box');
  });
});

describe('SkyCheckbox — реактивність пропів', () => {
  it('перемикається в switch і назад після зміни пропа', async () => {
    const wrapper = mount(SkyCheckbox, { props: { modelValue: false, switch: false } });
    expect(wrapper.find('.sky-checkbox__track').exists()).toBe(false);

    await wrapper.setProps({ switch: true });
    expect(wrapper.find('.sky-checkbox__track').exists()).toBe(true);

    await wrapper.setProps({ switch: false });
    expect(wrapper.find('.sky-checkbox__box').exists()).toBe(true);
  });

  it('реагує на зміну disabled', async () => {
    const wrapper = mount(SkyCheckbox, { props: { modelValue: false } });
    expect(wrapper.get('input').attributes('disabled')).toBeUndefined();

    await wrapper.setProps({ disabled: true });
    expect(wrapper.get('input').attributes('disabled')).toBeDefined();
    expect(wrapper.classes()).toContain('sky-checkbox--disabled');
  });
});
