<script setup>
import { ref } from 'vue'
import Dialog from '@/shared/ui/Dialog/Dialog.vue'
import SkyButton from '@/shared/ui/SkyButton/SkyButton.vue'
import SkyInput from '@/shared/ui/SkyInput/SkyInput.vue'

const showNext = ref(false)
const showClassic = ref(false)
const name = ref('')
</script>

<template>
  <Demo title="Два стилі повноекранного діалогу">
    <SkyButton variant="primary" @click="showNext = true">Dialog «next» (Назад)</SkyButton>
    <SkyButton variant="secondary" @click="showClassic = true">Dialog «classic» (×)</SkyButton>

    <Dialog v-model="showNext" mode="next" title="Новий товар" subtitle="Заповніть дані">
      <div style="padding: 20px; max-width: 420px">
        <SkyInput v-model="name" placeholder="Назва товару" />
      </div>
      <template #buttons>
        <SkyButton variant="secondary" @click="showNext = false">Скасувати</SkyButton>
        <SkyButton variant="primary" @click="showNext = false">Зберегти</SkyButton>
      </template>
    </Dialog>

    <Dialog v-model="showClassic" mode="classic" title="Експорт" subtitle="Класичний стиль із кнопкою ×">
      <div style="padding: 20px">
        <p>Повноекранний діалог із хрестиком для закриття.</p>
      </div>
      <template #buttons>
        <SkyButton variant="primary" @click="showClassic = false">Готово</SkyButton>
      </template>
    </Dialog>
  </Demo>
</template>
