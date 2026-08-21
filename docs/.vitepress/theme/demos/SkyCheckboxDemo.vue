<script setup>
import { ref } from 'vue'
import SkyCheckbox from '@/shared/ui/SkyCheckbox/SkyCheckbox.vue'

const agreed = ref(true)
const enabled = ref(true)
const selected = ref(['b'])
const options = [
  { value: 'a', name: 'Алкоголь' },
  { value: 'b', name: 'Їжа' },
  { value: 'c', name: 'Напої' },
]
</script>

<template>
  <Demo title="Boolean" column>
    <SkyCheckbox v-model="agreed">Погоджуюсь з умовами</SkyCheckbox>
    <span class="vdk-demo-out">agreed: {{ agreed }}</span>
  </Demo>

  <Demo title="Масив значень" column>
    <SkyCheckbox v-for="opt in options" :key="opt.value" v-model="selected" :value="opt.value">
      {{ opt.name }}
    </SkyCheckbox>
    <span class="vdk-demo-out">selected: [{{ selected.join(', ') }}]</span>
  </Demo>

  <Demo title="Switch + disabled" column>
    <SkyCheckbox v-model="enabled" switch>Push-сповіщення</SkyCheckbox>
    <SkyCheckbox :model-value="true" disabled>Заблоковано</SkyCheckbox>
  </Demo>
</template>
