<script setup>
import { reactive, ref } from 'vue'
import SkyTable from '@/shared/ui/SkyTable/Table.vue'

// Дані у формі, яку очікує таблиця: json = { items, total }, mainJsonData — те, що рендериться.
const items = Array.from({ length: 200 }, (_, i) => ({
  id: i + 1,
  name: `Товар ${i + 1}`,
  category: ['Напої', 'Випічка', 'Кава', 'Десерти'][i % 4],
  price: 10 + ((i * 37) % 490),
  status: i % 3 !== 0 ? 'Активний' : 'Прихований',
}))

const params = reactive({
  id: 'id',
  name: 'docs-demo',
  selected: [],
  allSelect: false,
  massActions: { delete: { value: 'delete', title: 'Видалити' } },
  footer: false,
  sort: { of: '', ot: '' },
  header: [
    { title: 'ID', name: 'id', sort: 'id', width: 70, enable: true },
    { title: 'Назва', name: 'name', sort: 'name', width: 220, enable: true },
    { title: 'Категорія', name: 'category', sort: false, width: 150, enable: true },
    { title: 'Ціна', name: 'price', sort: 'price', width: 110, enable: true },
    { title: 'Статус', name: 'status', sort: false, width: 140, enable: true },
  ],
})

const json = { items, total: items.length }

const lastEvent = ref('—')
</script>

<template>
  <Demo title="200 рядків у віртуал-скролі" column flush>
    <div class="vdk-table-stage">
      <SkyTable
        :params="params"
        :json="json"
        :main-json-data="items"
        @getData="lastEvent = `getData: ${JSON.stringify($event)}`"
        @updateSelected="lastEvent = `updateSelected: ${$event.length} шт.`"
        @open="lastEvent = `open: ${$event?.name ?? ''}`"
      />
    </div>
    <div class="vdk-demo-out">Останній event — {{ lastEvent }}</div>
  </Demo>
</template>

<style scoped>
.vdk-table-stage {
  height: 420px;
  padding: 12px;
}
</style>
