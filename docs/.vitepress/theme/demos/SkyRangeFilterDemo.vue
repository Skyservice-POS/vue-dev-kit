<script setup>
import { ref } from 'vue'
import SkyRangeFilter from '@/features/SkyRangeFilter/SkyRangeFilter.vue'

const check = ref({ from: null, to: null })
const discount = ref({ from: 5, to: 20 })
</script>

<template>
  <Demo title="Діапазон" column>
    <div class="vdk-filters">
      <SkyRangeFilter v-model="check" title="Середній чек" :min="0" :max="5000" :step="10" />
      <SkyRangeFilter v-model="discount" title="Знижка, %" :min="0" :max="50" :step="0.5" />
      <SkyRangeFilter title="Disabled" disabled />
    </div>
    <span class="vdk-demo-out">чек: {{ JSON.stringify(check) }} · знижка: {{ JSON.stringify(discount) }}</span>
  </Demo>
</template>

<style scoped>
.vdk-filters {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
</style>
