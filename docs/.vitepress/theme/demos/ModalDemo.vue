<script setup>
import { ref } from 'vue'
import Modal from '@/shared/ui/Modal/Modal.vue'
import SkyButton from '@/shared/ui/SkyButton/SkyButton.vue'

const showSized = ref(false)
const showFull = ref(false)
</script>

<template>
  <Demo title="Відкрийте модалку">
    <SkyButton variant="primary" @click="showSized = true">Sized modal (500×300)</SkyButton>
    <SkyButton variant="secondary" @click="showFull = true">Повноекранна</SkyButton>

    <Modal v-model="showSized" title="Sized Modal" subtitle="Фіксовані розміри" width="500px" height="300px">
      <div style="padding: 16px">
        <p>Компактна модалка. Закривається кліком на оверлей, Esc або ×.</p>
      </div>
      <template #footer>
        <SkyButton variant="secondary" @click="showSized = false">Скасувати</SkyButton>
        <SkyButton variant="primary" @click="showSized = false">Готово</SkyButton>
      </template>
    </Modal>

    <Modal v-model="showFull" title="Повноекранна модалка" subtitle="Зі скролом у тілі">
      <div style="padding: 16px">
        <p v-for="i in 20" :key="i">Рядок контенту {{ i }}</p>
      </div>
      <template #footer>
        <SkyButton variant="primary" @click="showFull = false">Закрити</SkyButton>
      </template>
    </Modal>
  </Demo>
</template>
