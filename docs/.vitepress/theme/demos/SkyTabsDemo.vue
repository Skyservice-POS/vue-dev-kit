<script setup>
import { ref } from 'vue'
import SkyTabs from '@/shared/ui/SkyTabs/SkyTabs.vue'

const period = ref('week')
const periods = [
  { value: 'day', text: 'День' },
  { value: 'week', text: 'Тиждень' },
  { value: 'month', text: 'Місяць' },
]

const view = ref('all')
const views = [
  { value: 'all', text: 'Усі' },
  { value: 'active', text: 'Активні' },
  { value: 'archived', text: 'В архіві' },
  { value: 'drafts', text: 'Чернетки' },
]

const locked = ref('week')
</script>

<template>
  <Demo title="Базовий">
    <SkyTabs v-model="period" :options="periods" />
    <span class="vdk-demo-out">modelValue: "{{ period }}"</span>
  </Demo>

  <Demo title="Різна кількість опцій — індикатор підлаштовує ширину">
    <SkyTabs v-model="view" :options="views" />
  </Demo>

  <Demo title="Disabled">
    <SkyTabs v-model="locked" :options="periods" disabled />
  </Demo>
</template>
