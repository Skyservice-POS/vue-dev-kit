<script setup>
import { ref, computed } from 'vue'
import SkyInput from '@/shared/ui/SkyInput/SkyInput.vue'

const name = ref('')
const email = ref('')
const emailValid = computed(() => /.+@.+\..+/.test(email.value))
const emailState = computed(() =>
  !email.value ? 'default' : emailValid.value ? 'success' : 'error',
)
const emailHint = computed(() =>
  emailState.value === 'error' ? 'Невалідний email' : emailState.value === 'success' ? 'Виглядає добре' : '',
)
</script>

<template>
  <Demo title="Базовий" column>
    <SkyInput v-model="name" placeholder="Ваше ім'я" />
    <span class="vdk-demo-out">name: "{{ name }}"</span>
  </Demo>

  <Demo title="Валідація на льоту (state + hint)" column>
    <SkyInput v-model="email" type="email" placeholder="you@example.com" :state="emailState" :hint="emailHint" />
  </Demo>

  <Demo title="Стани" column>
    <SkyInput model-value="Значення" state="success" hint="Все добре" />
    <SkyInput model-value="Помилка" state="error" hint="Виправте поле" />
    <SkyInput model-value="Заблоковано" disabled />
  </Demo>
</template>
