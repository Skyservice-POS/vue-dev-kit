<script setup>
import { ref } from 'vue'
import SkySelectSearch from '@/shared/ui/SkySelectSearch/SkySelectSearch.vue'

const city = ref(null)
const warehouse = ref(null)
/** Коротший за поріг у 6 опцій — на ньому поля пошуку не буде. */
const warehouses = [
  { value: 5, text: 'Основний склад' },
  { value: 8, text: 'Вітрина' },
  { value: 9, text: 'Склад на Подолі' },
]
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

  <Demo title="Короткий список — без пошуку" column>
    <SkySelectSearch v-model="warehouse" :options="warehouses" placeholder="Оберіть склад" />
    <span class="vdk-demo-out">
      {{ warehouses.length }} опції — менше за searchThreshold (6), тож поля пошуку немає
    </span>
  </Demo>

  <Demo title="Стани">
    <SkySelectSearch :options="cities" placeholder="Disabled" disabled />
    <SkySelectSearch :options="cities" placeholder="З помилкою" state="error" hint="Оберіть значення" />
  </Demo>
</template>
