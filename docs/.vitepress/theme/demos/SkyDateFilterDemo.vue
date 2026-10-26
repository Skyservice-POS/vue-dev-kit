<script setup>
import { ref } from 'vue'
import SkyDateFilter from '@/features/SkyDateFilter/SkyDateFilter.vue'
import { today, diffDays, datePresets, defaultDatePresets, quarterPresets } from '@/shared/lib/date/dateRange'

const basic = ref({ start: null, end: null })
const noFuture = ref({ start: null, end: null })
const around = ref({ start: null, end: null })
const extra = ref({ start: null, end: null })
const quarters = ref({ start: null, end: null })

// «Все, що далі 31 дня від першої обраної дати» — у будь-який бік.
const within31 = (date, { start, end }) => !!start && !end && Math.abs(diffDays(start, date)) > 31

// Свої кнопки поруч зі стандартними.
const extraPresets = [...defaultDatePresets(), datePresets.lastDays(30, '30 днів'), datePresets.lastMonth()]

const year = ref(new Date().getFullYear())
</script>

<template>
  <Demo title="За замовчуванням" column>
    <SkyDateFilter v-model="basic" title="Період" />
    <span class="vdk-demo-out">{{ JSON.stringify(basic) }}</span>
  </Demo>

  <Demo title="Виключення дат" column>
    <div class="vdk-filters">
      <SkyDateFilter v-model="noFuture" title="Без майбутнього" :max="today()" />
      <SkyDateFilter v-model="around" title="±31 день від першої дати" :disabled-date="within31" />
      <SkyDateFilter title="Disabled" disabled />
    </div>
    <span class="vdk-demo-out">без майбутнього: {{ JSON.stringify(noFuture) }} · ±31: {{ JSON.stringify(around) }}</span>
  </Demo>

  <Demo title="Свої кнопки: додати до стандартних" column>
    <SkyDateFilter v-model="extra" title="Період" :presets="extraPresets" />
    <span class="vdk-demo-out">{{ JSON.stringify(extra) }}</span>
  </Demo>

  <Demo title="Свої кнопки: повністю замінити (слот) — податкові квартали" column>
    <SkyDateFilter v-model="quarters" title="Квартал" :presets="quarterPresets(year)">
      <template #presets="{ presets, select, isActive, isDisabled }">
        <div class="vdk-quarters">
          <div class="vdk-quarters__year">
            <button type="button" class="sky-date-preset" @click="year--">‹</button>
            <b>{{ year }}</b>
            <button type="button" class="sky-date-preset" @click="year++">›</button>
          </div>
          <button
            v-for="q in presets"
            :key="q.label"
            type="button"
            class="sky-date-preset"
            :class="{ 'is-active': isActive(q.range()) }"
            :disabled="isDisabled(q.range())"
            @click="select(q.range())"
          >
            {{ q.label }}
          </button>
        </div>
      </template>
    </SkyDateFilter>
    <span class="vdk-demo-out">{{ JSON.stringify(quarters) }}</span>
  </Demo>
</template>

<style scoped>
.vdk-filters {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.vdk-quarters {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 8px;
  align-items: center;
}

.vdk-quarters__year {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
}
</style>
