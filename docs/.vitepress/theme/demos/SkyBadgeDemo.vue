<script setup>
import SkyBadge from '@/shared/ui/SkyBadge/SkyBadge.vue'
</script>

<template>
  <Demo title="Тональності">
    <SkyBadge tone="success" label="Під'єднано" />
    <SkyBadge tone="error" label="Помилка" />
    <SkyBadge tone="warning" label="Увага" />
    <SkyBadge tone="pending" label="Очікування" />
    <SkyBadge tone="info" label="Інфо" />
    <SkyBadge tone="default" label="Default" />
  </Demo>

  <Demo title="Без крапки">
    <SkyBadge tone="pending" :dot="false" label="Очікування" />
    <SkyBadge tone="success" :dot="false" label="Готово" />
  </Demo>
</template>
