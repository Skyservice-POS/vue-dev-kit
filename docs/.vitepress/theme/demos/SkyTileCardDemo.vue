<script setup>
import SkyTileCard from '@/shared/ui/SkyTileCard/SkyTileCard.vue'
import SkyBadge from '@/shared/ui/SkyBadge/SkyBadge.vue'
import SkyButton from '@/shared/ui/SkyButton/SkyButton.vue'
</script>

<template>
  <Demo>
    <div class="vdk-tiles">
      <SkyTileCard title="Без іконки" subtitle="Тільки title + subtitle" />

      <SkyTileCard title="Зі слот-іконкою" subtitle="Повна композиція">
        <template #icon>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" fill="currentColor" />
          </svg>
        </template>
      </SkyTileCard>

      <SkyTileCard title="Glovo" subtitle="Інтеграція доставки">
        <template #icon>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor" />
          </svg>
        </template>
        <SkyBadge tone="success" label="Активно" />
        <SkyButton variant="outline" block>Налаштувати</SkyButton>
      </SkyTileCard>
    </div>
  </Demo>
</template>

<style scoped>
.vdk-tiles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
  width: 100%;
}
</style>
