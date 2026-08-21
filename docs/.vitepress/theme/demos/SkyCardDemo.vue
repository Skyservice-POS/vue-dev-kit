<script setup>
import SkyCard from '@/shared/ui/SkyCard/SkyCard.vue'
import SkyCardHeader from '@/shared/ui/SkyCardHeader/SkyCardHeader.vue'
import SkyCardRow from '@/shared/ui/SkyCardRow/SkyCardRow.vue'
import SkyBadge from '@/shared/ui/SkyBadge/SkyBadge.vue'
import SkyAlert from '@/shared/ui/SkyAlert/SkyAlert.vue'
import SkyButton from '@/shared/ui/SkyButton/SkyButton.vue'
</script>

<template>
  <Demo>
    <div class="vdk-cards">
      <SkyCard>
        <template #ribbon>Тимчасово закрито</template>
        <template #header>
          <SkyCardHeader title="Торгова точка 1" subtitle="вул. Гетьмана Сильного, 128">
            <template #icon>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor" />
              </svg>
            </template>
          </SkyCardHeader>
        </template>

        <SkyCardRow label="Store Address ID" value="902062" />
        <SkyCardRow label="Статус інтеграції">
          <SkyBadge tone="success" label="Під'єднано" />
        </SkyCardRow>

        <template #footer>
          <SkyButton variant="primary" block>Налаштувати меню</SkyButton>
          <SkyButton variant="secondary">Змінити ID</SkyButton>
        </template>
      </SkyCard>

      <SkyCard>
        <template #header>
          <SkyCardHeader title="Торгова точка 2" subtitle="вул. Тиха, 45" />
        </template>

        <SkyCardRow label="Store Address ID" value="—" />
        <SkyCardRow label="Статус інтеграції">
          <SkyBadge tone="error" label="Помилка" />
        </SkyCardRow>
        <SkyAlert tone="error">Невалідний storeAddressId</SkyAlert>

        <template #footer>
          <SkyButton variant="primary" block>Під'єднати</SkyButton>
        </template>
      </SkyCard>
    </div>
  </Demo>
</template>

<style scoped>
.vdk-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  width: 100%;
}
</style>
