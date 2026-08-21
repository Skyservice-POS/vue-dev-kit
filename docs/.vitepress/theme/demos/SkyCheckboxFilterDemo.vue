<script setup>
import { ref } from 'vue'
import SkyCheckboxFilter from '@/features/SkyCheckboxFilter/SkyCheckboxFilter.vue'

const categories = ref([])
const status = ref([])
const categoryOptions = [
  { value: 'alc', name: 'Алкоголь' },
  { value: 'food', name: 'Їжа' },
  { value: 'drink', name: 'Напої' },
  { value: 'snack', name: 'Снеки' },
  { value: 'sweet', name: 'Солодощі' },
  { value: 'frozen', name: 'Заморозка' },
]
const statusOptions = [
  { value: 'active', name: 'Активний' },
  { value: 'paused', name: 'Призупинений' },
  { value: 'archived', name: 'Архівний' },
]
</script>

<template>
  <Demo title="Кілька фільтрів + мульти-вибір" column>
    <div class="vdk-filters">
      <SkyCheckboxFilter v-model="categories" title="Категорії" :options="categoryOptions" />
      <SkyCheckboxFilter v-model="status" title="Статус" :options="statusOptions" />
      <SkyCheckboxFilter title="Disabled" :options="categoryOptions" disabled />
    </div>
    <span class="vdk-demo-out">
      категорій: {{ categories.length }} · статусів: {{ status.length }}
    </span>
  </Demo>
</template>

<style scoped>
.vdk-filters {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
</style>
