<script setup>
import { ref } from 'vue'
import SkySelectSearch from '@/shared/ui/SkySelectSearch/SkySelectSearch.vue'

const city = ref(null)
const cities = [
  { value: 'kyiv', text: 'Київ' },
  { value: 'lviv', text: 'Львів' },
  { value: 'odesa', text: 'Одеса' },
  { value: 'kharkiv', text: 'Харків' },
  { value: 'dnipro', text: 'Дніпро' },
  { value: 'zaporizhzhia', text: 'Запоріжжя' },
  { value: 'vinnytsia', text: 'Вінниця' },
  { value: 'poltava', text: 'Полтава' },
  { value: 'chernivtsi', text: 'Чернівці' },
  { value: 'ternopil', text: 'Тернопіль' },
]
</script>

<template>
  <Demo title="Пошук у дропдауні" column>
    <SkySelectSearch
      v-model="city"
      :options="cities"
      placeholder="Оберіть місто"
      search-placeholder="Почніть вводити…"
    />
    <span class="vdk-demo-out">value: {{ city ?? '—' }}</span>
  </Demo>

  <Demo title="Стани">
    <SkySelectSearch :options="cities" placeholder="Disabled" disabled />
    <SkySelectSearch :options="cities" placeholder="З помилкою" state="error" hint="Оберіть значення" />
  </Demo>
</template>
