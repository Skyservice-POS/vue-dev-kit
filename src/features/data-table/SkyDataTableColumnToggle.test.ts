import { describe, it, expect, afterEach } from 'vitest';
import { mount, enableAutoUnmount } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import SkyDataTable from './SkyDataTable.vue';
import SkyDataTableColumnToggle from './SkyDataTableColumnToggle.vue';
import { createSkyColumnHelper } from '../../shared/lib/table/tableFeatures';

enableAutoUnmount(afterEach);

interface Row {
  id: number;
  name: string;
  price: number;
  status: string;
}

const column = createSkyColumnHelper<Row>();
const columns = [
  column.display({ id: 'select', header: () => h('input', { type: 'checkbox' }), cell: () => null }),
  column.accessor('name', { header: 'Назва', enableHiding: false }),
  column.accessor('price', { header: 'Ціна' }),
  column.accessor('status', { header: () => h('b', 'S'), meta: { label: 'Статус' } }),
];

/** Справжня таблиця з тулбаром — щоб перемикання доходило до відрендерених колонок. */
function mountWithTable() {
  const Host = defineComponent({
    setup() {
      const data = ref<Row[]>([{ id: 1, name: 'Кава', price: 45, status: 'ok' }]);
      return () =>
        h(SkyDataTable as any, { columns, data: data.value, rowId: 'id' }, {
          actions: ({ table }: any) => h(SkyDataTableColumnToggle, { table }),
        });
    },
  });
  return mount(Host, { attachTo: document.body });
}

async function open(w: ReturnType<typeof mount>) {
  await w.find('.sky-dt-columns__btn').trigger('click');
  await nextTick();
}

const items = () => [...document.querySelectorAll('.sky-dt-columns__item')];
const headTexts = (w: ReturnType<typeof mount>) => w.findAll('.sky-table__head').map((x) => x.text());

describe('SkyDataTableColumnToggle', () => {
  it('lists columns by string header or meta.label, skipping the bare select column', async () => {
    const w = mountWithTable();
    await open(w);
    expect(items().map((i) => i.textContent?.trim())).toEqual(['Назва', 'Ціна', 'Статус']);
  });

  it('shows required columns (enableHiding: false) as disabled', async () => {
    const w = mountWithTable();
    await open(w);
    const inputs = items().map((i) => i.querySelector('input') as HTMLInputElement);
    expect(inputs.map((i) => i.disabled)).toEqual([true, false, false]);
    expect(inputs.every((i) => i.checked)).toBe(true);
  });

  it('unchecking hides the column in the table, reset brings it back', async () => {
    const w = mountWithTable();
    expect(headTexts(w)).toContain('Ціна');
    await open(w);
    const price = items()[1].querySelector('input') as HTMLInputElement;
    price.checked = false;
    price.dispatchEvent(new Event('change'));
    await nextTick();
    expect(headTexts(w)).not.toContain('Ціна');

    const [, reset] = [...document.querySelectorAll('.sky-dt-columns__link')] as HTMLButtonElement[];
    reset.click();
    await nextTick();
    expect(headTexts(w)).toContain('Ціна');
  });

  it('"done" closes the panel', async () => {
    const w = mountWithTable();
    await open(w);
    const [done] = [...document.querySelectorAll('.sky-dt-columns__link')] as HTMLButtonElement[];
    done.click();
    await nextTick();
    expect(document.querySelector('.sky-dt-columns__list')).toBeNull();
  });
});
