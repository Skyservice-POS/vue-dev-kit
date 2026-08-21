<script setup>
import { ref, computed } from 'vue'
import SkySearchInput from '@/shared/ui/SkySearchInput/SkySearchInput.vue'

const query = ref('')
const collapsibleQuery = ref('')

const products = ['Кава', 'Капучино', 'Лате', 'Чай', 'Круасан', 'Чізкейк']
const filtered = computed(() =>
  products.filter((p) => p.toLowerCase().includes(query.value.trim().toLowerCase())),
)
</script>

<template>
  <Demo title="Базовий + фільтрація на боці застосунку" column>
    <SkySearchInput v-model="query" placeholder="Пошук товару…" />
    <div class="vdk-demo-out">
      <span v-if="filtered.length">{{ filtered.join(' · ') }}</span>
      <span v-else>Нічого не знайдено</span>
    </div>
  </Demo>

  <Demo title="Collapsible — клік по іконці розгортає поле" column>
    <SkySearchInput v-model="collapsibleQuery" placeholder="Пошук…" collapsible />
    <span class="vdk-demo-out">modelValue: "{{ collapsibleQuery }}"</span>
  </Demo>

  <Demo title="Disabled" column>
    <SkySearchInput model-value="Заблоковано" disabled />
  </Demo>
</template>
