<script setup lang="ts">
import { computed, h, ref } from 'vue'
import SkyDataTable from '@/features/data-table/SkyDataTable.vue'
import SkyDataTableColumnToggle from '@/features/data-table/SkyDataTableColumnToggle.vue'
import SkyBadge from '@/shared/ui/SkyBadge/SkyBadge.vue'
import SkyCheckbox from '@/shared/ui/SkyCheckbox/SkyCheckbox.vue'
import { createSkyColumnHelper } from '@/shared/lib/table/tableFeatures'

interface Product {
  id: number
  name: string
  category: string
  price: number
  status: 'Активний' | 'Прихований'
}

const data: Product[] = Array.from({ length: 300 }, (_, i) => ({
  id: i + 1,
  name: `Товар ${i + 1}`,
  category: ['Напої', 'Випічка', 'Кава', 'Десерти'][i % 4],
  price: 10 + ((i * 37) % 490),
  status: i % 3 !== 0 ? 'Активний' : 'Прихований',
}))

const column = createSkyColumnHelper<Product>()

const columns = [
  // Колонка вибору — display-колонка, як у shadcn-vue: рендерить чекбокси
  // з нашого кіта, а стан вибору тримає TanStack.
  column.display({
    id: 'select',
    size: 44,
    meta: { align: 'center' },
    header: ({ table }) =>
      h(SkyCheckbox, {
        modelValue: table.getIsAllRowsSelected(),
        'onUpdate:modelValue': () => table.toggleAllRowsSelected(),
      }),
    cell: ({ row }) =>
      h(SkyCheckbox, {
        modelValue: row.getIsSelected(),
        'onUpdate:modelValue': () => row.toggleSelected(),
      }),
  }),
  column.accessor('name', {
    header: 'Назва',
    meta: { widthFr: 2 },
    sortFn: 'alphanumeric',
  }),
  column.accessor('category', { header: 'Категорія', size: 150 }),
  column.accessor('price', {
    header: 'Ціна',
    size: 110,
    meta: { align: 'right' },
    cell: ({ getValue }) => `${getValue()} ₴`,
  }),
  column.accessor('status', {
    header: 'Статус',
    size: 150,
    meta: { align: 'center' },
    enableSorting: false,
    cell: ({ getValue }) =>
      h(SkyBadge, {
        tone: getValue() === 'Активний' ? 'success' : 'default',
        label: String(getValue()),
      }),
  }),
]

const tableRef = ref<InstanceType<typeof SkyDataTable> | null>(null)
const lastAction = ref('—')

const selectedCount = computed(
  () => tableRef.value?.table.getSelectedRowModel().rows.length ?? 0,
)
</script>

<template>
  <Demo title="TanStack Table v9 — сортування, пошук, вибір, пагінація" column flush>
    <div class="vdk-dt">
      <SkyDataTable
        ref="tableRef"
        :columns="columns"
        :data="data"
        :page-size="10"
        row-id="id"
        searchable
        interactive-rows
        search-placeholder="Пошук по всіх колонках…"
        @row-click="(row) => (lastAction = `open → ${row.name}`)"
      >
        <template #actions="{ table }">
          <SkyDataTableColumnToggle :table="table" />
        </template>
      </SkyDataTable>
    </div>
    <div class="vdk-demo-out">
      обрано: {{ selectedCount }} · остання дія: {{ lastAction }}
    </div>
  </Demo>
</template>

<style scoped>
.vdk-dt {
  height: 520px;
  margin: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}
</style>
