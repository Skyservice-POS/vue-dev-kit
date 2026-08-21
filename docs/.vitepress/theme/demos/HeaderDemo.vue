<script setup>
import { ref } from 'vue'
import Header from '@/shared/ui/Header/Header.vue'
import SkyButton from '@/shared/ui/SkyButton/SkyButton.vue'

const lastAction = ref('—')
const recentPages = [
  { name: 'Товари', path: '/products', lastVisit: 1710000000000 },
  { name: 'Замовлення', path: '/orders', lastVisit: 1709900000000 },
  { name: 'Звіти', path: '/reports', lastVisit: 1709800000000 },
]
</script>

<template>
  <Demo title="Шапка сторінки" column>
    <div class="vdk-header-frame">
      <Header
        title="Товари"
        subtitle="Управління каталогом"
        :dropdown-items="recentPages"
        :back-event="() => (lastAction = 'клік «Назад»')"
        @navigate="(item) => (lastAction = `перехід → ${item.name}`)"
      >
        <SkyButton variant="primary">+ Додати</SkyButton>
      </Header>
    </div>
    <span class="vdk-demo-out">остання дія: {{ lastAction }}</span>
  </Demo>
</template>

<style scoped>
.vdk-header-frame {
  width: 100%;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background: var(--vp-c-bg);
}
</style>
