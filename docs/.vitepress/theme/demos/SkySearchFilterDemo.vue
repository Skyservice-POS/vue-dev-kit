<script setup>
import { ref } from 'vue'
import SkySearchFilter from '@/features/SkySearchFilter/SkySearchFilter.vue'

const picked = ref([])

// Фейковий сервер: 120 клієнтів, по 20 на сторінку, затримка 400 мс.
const clients = Array.from({ length: 120 }, (_, i) => ({
  value: i + 1,
  name: `Клієнт ${i + 1} — +380 67 ${String(1000000 + i * 7919).slice(0, 7)}`,
}))
function fetchClients({ page, search }) {
  const q = search.toLowerCase()
  const found = q ? clients.filter((c) => c.name.toLowerCase().includes(q)) : clients
  const items = found.slice((page - 1) * 20, page * 20)
  return new Promise((resolve) => setTimeout(() => resolve({ items, hasMore: page * 20 < found.length }), 400))
}
</script>

<template>
  <Demo title="Серверний пошук + «Показати ще»" column>
    <div class="vdk-filters">
      <SkySearchFilter v-model="picked" title="Клієнти" :fetch="fetchClients" />
      <SkySearchFilter title="Disabled" :fetch="fetchClients" disabled />
    </div>
    <span class="vdk-demo-out">обрано: {{ picked.map((p) => p.value).join(', ') || '—' }}</span>
  </Demo>
</template>

<style scoped>
.vdk-filters {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
</style>
