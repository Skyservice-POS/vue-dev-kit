<script setup>
import { ref } from 'vue'
import SkySelect from '@/shared/ui/SkySelect/SkySelect.vue'

const val = ref(null)
const val2 = ref(null)
const options = [
  { label: 'Готівка', value: 'cash' },
  { label: 'Картка', value: 'card' },
  { label: 'Переказ', value: 'transfer' },
  { label: 'Бонуси', value: 'bonus' },
]
</script>

<template>
  <Demo title="Опції-об'єкти { label, value }" column>
    <SkySelect v-model="val" :options="options" placeholder="Оберіть спосіб оплати" />
    <span class="vdk-demo-out">value: {{ val ?? '—' }}</span>
  </Demo>

  <Demo title="Опції-рядки">
    <SkySelect v-model="val2" :options="['Кг', 'Шт', 'Л']" placeholder="Одиниця" />
    <SkySelect model-value="Шт" :options="['Кг', 'Шт', 'Л']" disabled />
  </Demo>

  <Demo title="Block" column>
    <SkySelect v-model="val" :options="options" placeholder="На всю ширину" block />
  </Demo>
</template>
