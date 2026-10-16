<script setup>
import SkyPageHeader from '@/shared/ui/SkyPageHeader/SkyPageHeader.vue'
import SkyButton from '@/shared/ui/SkyButton/SkyButton.vue'
</script>

<template>
  <Demo title="Заголовок і опис">
    <SkyPageHeader title="Замовлення" description="Усі замовлення за період" />
  </Demo>

  <Demo title="Зі slot header">
    <SkyPageHeader title="Клієнти" description="База клієнтів">
      <template #header>
        <SkyButton>Додати клієнта</SkyButton>
      </template>
    </SkyPageHeader>
  </Demo>

  <Demo title="position=&quot;side&quot; — збоку в одному рядку">
    <SkyPageHeader title="Клієнти" description="База клієнтів" position="side">
      <template #header>
        <SkyButton>Додати клієнта</SkyButton>
      </template>
    </SkyPageHeader>
  </Demo>

  <Demo title="Лише заголовок">
    <SkyPageHeader title="Налаштування" />
  </Demo>
</template>
