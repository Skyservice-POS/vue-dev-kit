<script setup>
import SkyAlert from '@/shared/ui/SkyAlert/SkyAlert.vue'
</script>

<template>
  <Demo title="Тональності" column>
    <SkyAlert tone="success">Все збережено</SkyAlert>
    <SkyAlert tone="error">Щось пішло не так</SkyAlert>
    <SkyAlert tone="warning">Увага: дія незворотня</SkyAlert>
    <SkyAlert tone="info">Підказка для користувача</SkyAlert>
  </Demo>

  <Demo title="Без іконки" column>
    <SkyAlert tone="error" :show-icon="false">Компактне повідомлення без іконки</SkyAlert>
  </Demo>
</template>
