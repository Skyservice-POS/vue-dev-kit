<script setup>
import { ref } from 'vue'
import SkyButton from '@/shared/ui/SkyButton/SkyButton.vue'

const loading = ref(false)
function toggleLoading() {
  loading.value = true
  setTimeout(() => (loading.value = false), 1500)
}
</script>

<template>
  <Demo title="Варіанти">
    <SkyButton variant="primary">Primary</SkyButton>
    <SkyButton variant="danger">Danger</SkyButton>
    <SkyButton variant="secondary">Secondary</SkyButton>
    <SkyButton variant="outline">Outline</SkyButton>
  </Demo>

  <Demo title="Стани">
    <SkyButton variant="primary" :loading="loading" @click="toggleLoading">
      {{ loading ? 'Зачекайте…' : 'Клік → loading' }}
    </SkyButton>
    <SkyButton variant="primary" disabled>Disabled</SkyButton>
  </Demo>

  <Demo title="Іконкові кнопки">
    <SkyButton variant="primary" icon title="Додати">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </SkyButton>
    <SkyButton variant="danger" icon title="Видалити">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9h8l1-9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </SkyButton>
    <SkyButton variant="secondary" icon title="Редагувати">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M11 2l3 3-8 8H3v-3l8-8z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </SkyButton>
    <SkyButton variant="outline" icon title="Пошук">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" stroke-width="1.5" />
        <path d="M9.5 9.5L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
    </SkyButton>
  </Demo>

  <Demo title="Block">
    <SkyButton variant="primary" block>На всю ширину</SkyButton>
  </Demo>
</template>
