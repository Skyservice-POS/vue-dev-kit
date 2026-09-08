<script setup>
import { ref } from 'vue'
import SkyPagination from '@/shared/ui/SkyPagination/SkyPagination.vue'

const page = ref(7)
const pageSize = ref(25)
const total = 1247

const smallPage = ref(1)
const smallSize = ref(50)

function onSize(n) {
  pageSize.value = n
  page.value = 1 // інакше можна опинитись за межами нової кількості сторінок
}
</script>

<template>
  <Demo title="Багато сторінок" column>
    <SkyPagination
      :total="total"
      :page="page"
      :page-size="pageSize"
      @update:page="page = $event"
      @update:page-size="onSize"
    />
    <span class="vdk-demo-out">сторінка {{ page }} · по {{ pageSize }} · всього {{ total }}</span>
  </Demo>

  <Demo title="Мало записів: номерів немає, лишається лише вибір кількості" column>
    <SkyPagination
      :total="8"
      :page="smallPage"
      :page-size="smallSize"
      :all-label="(n) => `Усі ${n}`"
      @update:page="smallPage = $event"
      @update:page-size="smallSize = $event; smallPage = 1"
    />
    <span class="vdk-demo-out">сторінка {{ smallPage }} · по {{ smallSize }} · всього 8</span>
  </Demo>
</template>
