<script setup>
import { computed, ref } from 'vue'
import SkyTableRoot from '@/shared/ui/table/SkyTableRoot.vue'
import SkyTableHeader from '@/shared/ui/table/SkyTableHeader.vue'
import SkyTableHead from '@/shared/ui/table/SkyTableHead.vue'
import SkyTableBody from '@/shared/ui/table/SkyTableBody.vue'
import SkyTableRow from '@/shared/ui/table/SkyTableRow.vue'
import SkyTableCell from '@/shared/ui/table/SkyTableCell.vue'
import SkyBadge from '@/shared/ui/SkyBadge/SkyBadge.vue'
import SkyCheckbox from '@/shared/ui/SkyCheckbox/SkyCheckbox.vue'
import TableMassActions from '@/features/table/TableMassActions.vue'
import TableColumnSettings from '@/features/table/TableColumnSettings.vue'
import TableVirtualBody from '@/features/table/TableVirtualBody.vue'
import { useTableSort } from '@/shared/lib/table/useTableSort'
import { useTableSelection } from '@/shared/lib/table/useTableSelection'
import { useColumnVisibility } from '@/shared/lib/table/useColumnVisibility'

// ── Мінімальний варіант: лише примітиви ────────────────────────────────
const miniColumns = [
  { name: 'name', title: 'Товар', widthFr: 2 },
  { name: 'price', title: 'Ціна', width: 90, align: 'right' },
]
const miniRows = [
  { id: 1, name: 'Кава', price: '45 ₴' },
  { id: 2, name: 'Капучино', price: '60 ₴' },
  { id: 3, name: 'Чізкейк', price: '95 ₴' },
]

// ── Повний варіант: сортування + вибір + колонки + масові дії + віртуалізація ──
// Колонка вибору — така сама колонка, просто без заголовка. Так грід шапки
// й рядків рахується з одного джерела і нічого не розʼїжджається.
const columns = [
  { name: '_select', width: 44, align: 'center' },
  { name: 'name', title: 'Назва', widthFr: 2, sortable: true },
  { name: 'category', title: 'Категорія', width: 140 },
  { name: 'price', title: 'Ціна', width: 110, sortable: true, align: 'right' },
  { name: 'status', title: 'Статус', width: 140, align: 'center' },
]

// У налаштування колонок віддаємо лише ті, що мають підпис.
const configurableColumns = columns.filter((c) => c.title)

const rows = Array.from({ length: 500 }, (_, i) => ({
  id: i + 1,
  name: `Товар ${i + 1}`,
  category: ['Напої', 'Випічка', 'Кава', 'Десерти'][i % 4],
  price: 10 + ((i * 37) % 490),
  status: i % 3 !== 0 ? 'Активний' : 'Прихований',
}))

const { sort, toggle: toggleSort } = useTableSort({ initial: { of: 'name', ot: 'asc' } })
const { visibility, visibleColumns, reset } = useColumnVisibility(columns)
const selection = useTableSelection(rows, { rowId: 'id' })

const lastAction = ref('—')

const sorted = computed(() => {
  const { of, ot } = sort.value
  if (!of || !ot) return rows
  return [...rows].sort((a, b) => {
    const dir = ot === 'asc' ? 1 : -1
    return a[of] > b[of] ? dir : a[of] < b[of] ? -dir : 0
  })
})

function onSort(field) {
  toggleSort(field)
  lastAction.value = `sort → ${sort.value.of} ${sort.value.ot}`
}

function onMass(action) {
  lastAction.value = `${action} × ${selection.selected.value.length}`
  selection.clear()
}
</script>

<template>
  <Demo title="Мінімум: тільки примітиви — без вибору, масових дій і віртуалізації" column flush>
    <div class="vdk-table-mini">
      <SkyTableRoot :columns="miniColumns">
        <SkyTableHeader>
          <SkyTableHead v-for="c in miniColumns" :key="c.name" :column="c" />
        </SkyTableHeader>
        <SkyTableBody>
          <SkyTableRow v-for="row in miniRows" :key="row.id">
            <SkyTableCell>{{ row.name }}</SkyTableCell>
            <SkyTableCell align="right">{{ row.price }}</SkyTableCell>
          </SkyTableRow>
        </SkyTableBody>
      </SkyTableRoot>
    </div>
  </Demo>

  <Demo title="Повний набір: 500 рядків, сортування, вибір, налаштування колонок" column flush>
    <div class="vdk-table-full">
      <div class="vdk-table-toolbar">
        <TableColumnSettings
          v-model="visibility"
          :columns="configurableColumns"
          @reset="reset"
        />
      </div>

      <TableMassActions
        :count="selection.selected.value.length"
        :actions="[
          { value: 'delete', title: 'Видалити' },
          { value: 'export', title: 'Експортувати' },
        ]"
        @action="onMass"
      />

      <SkyTableRoot :columns="visibleColumns" class="vdk-table-scroll">
        <SkyTableHeader>
          <template v-for="c in visibleColumns" :key="c.name">
            <SkyTableHead v-if="c.name === '_select'" :column="c">
              <SkyCheckbox
                :model-value="selection.allSelected.value"
                @update:model-value="selection.toggleAll()"
              />
            </SkyTableHead>
            <SkyTableHead v-else :column="c" :sort="sort" @sort="onSort" />
          </template>
        </SkyTableHeader>

        <TableVirtualBody :items="sorted" key-field="id">
          <template #default="{ item, index }">
            <SkyTableRow
              :selected="selection.isSelected(item)"
              interactive
              @click="lastAction = `open → ${item.name}`"
            >
              <template v-for="c in visibleColumns" :key="c.name">
                <SkyTableCell
                  v-if="c.name === '_select'"
                  align="center"
                  @click.stop
                >
                  <SkyCheckbox
                    :model-value="selection.isSelected(item)"
                    @update:model-value="selection.toggle(item, index)"
                  />
                </SkyTableCell>
                <SkyTableCell
                  v-else-if="c.name === 'status'"
                  :align="c.align"
                  no-truncate
                >
                  <SkyBadge
                    :tone="item.status === 'Активний' ? 'success' : 'default'"
                    :label="item.status"
                  />
                </SkyTableCell>
                <SkyTableCell v-else :align="c.align">
                  {{ item[c.name] }}
                </SkyTableCell>
              </template>
            </SkyTableRow>
          </template>
        </TableVirtualBody>
      </SkyTableRoot>
    </div>

    <div class="vdk-demo-out">остання дія: {{ lastAction }}</div>
  </Demo>
</template>

<style scoped>
.vdk-table-mini,
.vdk-table-full {
  margin: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: #fff;
}

.vdk-table-full {
  display: flex;
  flex-direction: column;
  height: 420px;
}

.vdk-table-toolbar {
  display: flex;
  justify-content: flex-end;
  padding: 6px 8px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.vdk-table-scroll {
  flex: 1;
  min-height: 0;
}
</style>
