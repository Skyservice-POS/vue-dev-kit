<script setup>
import { ref } from 'vue'
import SkySelect from '@/shared/ui/SkySelect/SkySelect.vue'

const payment = ref('')
const unit = ref('pc')

const payments = [
  { value: 'cash', text: 'Готівка' },
  { value: 'card', text: 'Картка' },
  { value: 'transfer', text: 'Переказ' },
  { value: 'bonus', text: 'Бонуси' },
]

const units = [
  { value: 'kg', text: 'Кг' },
  { value: 'pc', text: 'Шт' },
  { value: 'l', text: 'Л' },
]
</script>

<template>
  <Demo title="Базовий" column>
    <SkySelect
      v-model="payment"
      :options="payments"
      placeholder="Оберіть спосіб оплати"
    />
    <span class="vdk-demo-out">value: {{ payment || '—' }}</span>
  </Demo>

  <Demo title="Стани" column>
    <SkySelect v-model="unit" :options="units" state="success" hint="Збережено" />
    <SkySelect v-model="unit" :options="units" state="error" hint="Оберіть одиницю" />
    <SkySelect v-model="unit" :options="units" disabled />
  </Demo>
</template>
