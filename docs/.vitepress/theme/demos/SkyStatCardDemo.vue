<script setup>
import { ref } from 'vue'
import SkyStatCard from '@/shared/ui/SkyStatCard/SkyStatCard.vue'

const clicks = ref(0)
const icon =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4318ff" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="3"/></svg>'
  )
</script>

<template>
  <Demo title="Статична з іконкою">
    <SkyStatCard title="Виручка" value="12 400 ₴" :icon-src="icon" />
  </Demo>

  <Demo :title="`Клікабельна (кліків: ${clicks})`">
    <SkyStatCard title="Всього чеків" value="128 шт" :icon-src="icon" clickable @click="clicks++" />
  </Demo>

  <Demo title="Без іконки">
    <SkyStatCard title="Середній чек" value="96,8 ₴" />
    <SkyStatCard title="Скасовано" value="3 шт" clickable />
  </Demo>
</template>
