<script setup>
import { ref } from 'vue'
import SkySelectFilter from '@/features/SkySelectFilter/SkySelectFilter.vue'

const category = ref(null)
const status = ref('active')

// depth лише відступає рядок — фільтр завжди точний, підкатегорії не розгортаються
const categoryOptions = [
  { value: 10, name: 'Напої', depth: 0 },
  { value: 11, name: 'Кава', depth: 1 },
  { value: 12, name: 'Чай', depth: 1 },
  { value: 20, name: 'Їжа', depth: 0 },
  { value: 21, name: 'Випічка', depth: 1 },
  { value: 22, name: 'Сніданки', depth: 1 },
  { value: 0, name: 'Без категорії', depth: 0 },
]
const statusOptions = [
  { value: 'active', name: 'Активний' },
  { value: 'paused', name: 'Призупинений' },
  { value: 'archived', name: 'Архівний' },
]
</script>

<template>
  <Demo title="Одиничний вибір: дерево + плаский список" column>
    <div class="vdk-filters">
      <SkySelectFilter
        v-model="category"
        title="Категорія"
        all-label="Усі категорії"
        :options="categoryOptions"
      />
      <SkySelectFilter
        v-model="status"
        title="Статус"
        :options="statusOptions"
        :searchable="false"
      />
      <SkySelectFilter title="Disabled" :options="statusOptions" disabled />
    </div>
    <span class="vdk-demo-out">категорія: {{ category ?? '—' }} · статус: {{ status }}</span>
  </Demo>
</template>

<style scoped>
.vdk-filters {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
</style>
