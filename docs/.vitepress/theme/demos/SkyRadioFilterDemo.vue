<script setup>
import { ref } from 'vue'
import SkyRadioFilter from '@/features/SkyRadioFilter/SkyRadioFilter.vue'

const payment = ref(null)
const motion = ref({ value: null, input: '' })
const city = ref(null)

const paymentOptions = [
  { value: 'cash', name: 'Готівка' },
  { value: 'card', name: 'Картка' },
  { value: 'mixed', name: 'Змішана' },
]
const motionOptions = [
  { value: 'come', name: 'Групи, куди прийшли' },
  { value: 'remove', name: 'Групи, звідки пішли' },
  { value: 'noCome', name: 'Нікого не прийшло' },
]
const cityOptions = ['Київ', 'Львів', 'Одеса', 'Харків', 'Дніпро', 'Вінниця', 'Полтава', 'Чернігів'].map((name) => ({
  value: name,
  name,
}))
</script>

<template>
  <Demo title="Одиничний вибір" column>
    <div class="vdk-filters">
      <SkyRadioFilter v-model="payment" title="Спосіб оплати" :options="paymentOptions" />
      <SkyRadioFilter v-model="city" title="Місто" :options="cityOptions" searchable />
      <SkyRadioFilter title="Disabled" :options="paymentOptions" disabled />
    </div>
    <span class="vdk-demo-out">оплата: {{ payment ?? 'null' }} · місто: {{ city ?? 'null' }}</span>
  </Demo>

  <Demo title="З числовим інпутом (inputFor)" column>
    <div class="vdk-filters">
      <SkyRadioFilter
        v-model="motion"
        title="Рух клієнтів"
        :options="motionOptions"
        :input-for="['come', 'remove']"
        input-hint="клієнтів"
      />
    </div>
    <span class="vdk-demo-out">{{ JSON.stringify(motion) }}</span>
  </Demo>
</template>

<style scoped>
.vdk-filters {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
</style>
