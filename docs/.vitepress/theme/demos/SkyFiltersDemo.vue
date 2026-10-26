<script setup>
import { h, ref } from 'vue'
import SkyFilters from '@/features/SkyFilters/SkyFilters.vue'
import SkyCheckbox from '@/shared/ui/SkyCheckbox/SkyCheckbox.vue'
import { today } from '@/shared/lib/date/dateRange'

const values = ref({})
const lastChange = ref('—')
const width = ref(100)
const disabled = ref(false)

// Фейковий сервер для `search`: 120 клієнтів, по 20 на сторінку, із затримкою.
const clients = Array.from({ length: 120 }, (_, i) => ({
  value: i + 1,
  name: `Клієнт ${i + 1} — +380 67 ${String(1000000 + i * 7919).slice(0, 7)}`,
}))
function fetchClients({ page, search }) {
  const q = search.toLowerCase()
  const found = q ? clients.filter((c) => c.name.toLowerCase().includes(q)) : clients
  const items = found.slice((page - 1) * 20, page * 20)
  return new Promise((resolve) => setTimeout(() => resolve({ items, hasMore: page * 20 < found.length }), 400))
}

// Свій фільтр: будь-який компонент з v-model. Тут — один перемикач.
const DebtFilter = {
  props: ['modelValue', 'disabled'],
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () =>
      h('div', { style: 'padding: 4px 3px' }, [
        h(SkyCheckbox, {
          switch: true,
          modelValue: !!props.modelValue,
          disabled: props.disabled,
          'onUpdate:modelValue': (v) => emit('update:modelValue', v || null),
        }, () => 'Лише з боргом'),
      ])
  },
}

const filters = [
  { key: 'period', title: 'Період', type: 'date', max: today() },
  {
    key: 'tradepoints',
    title: 'Торгова точка',
    options: [
      { value: 1, name: 'Центр' },
      { value: 2, name: 'Лівий берег' },
      { value: 3, name: 'Оболонь' },
      { value: 4, name: 'Дуже довга назва торгової точки на околиці' },
    ],
  },
  {
    key: 'warehouses',
    title: 'Склад',
    options: [
      { value: 'main', name: 'Основний' },
      { value: 'reserve', name: 'Резервний' },
    ],
  },
  {
    key: 'payment',
    title: 'Спосіб оплати',
    type: 'radio',
    options: [
      { value: 'cash', name: 'Готівка' },
      { value: 'card', name: 'Картка' },
      { value: 'mixed', name: 'Змішана' },
    ],
  },
  {
    key: 'motion',
    title: 'Рух клієнтів',
    type: 'radio',
    inputFor: ['come', 'remove'],
    inputHint: 'клієнтів',
    options: [
      { value: 'come', name: 'Групи, куди прийшли' },
      { value: 'remove', name: 'Групи, звідки пішли' },
      { value: 'noCome', name: 'Нікого не прийшло' },
    ],
  },
  { key: 'avgCheck', title: 'Середній чек', type: 'range', min: 0, max: 5000, step: 10 },
  { key: 'clients', title: 'Клієнти', type: 'search', fetch: fetchClients, collapsed: true },
  {
    key: 'debt',
    title: 'Борг',
    component: DebtFilter,
    emptyValue: () => null,
    display: (v) => (v ? { count: 1, summary: 'З боргом' } : { count: 0 }),
  },
  // Без опцій — у рядку не з'явиться.
  { key: 'terminals', title: 'Каса', options: [] },
]
</script>

<template>
  <Demo title="Рядок фільтрів: ширина, «Усі фільтри», штора" column>
    <div class="vdk-controls">
      <label>
        Ширина контейнера: {{ width }}%
        <input v-model.number="width" type="range" min="20" max="100" />
      </label>
      <label><input v-model="disabled" type="checkbox" /> disabled</label>
    </div>

    <div class="vdk-frame" :style="{ width: `${width}%` }">
      <SkyFilters
        v-model="values"
        :filters="filters"
        :disabled="disabled"
        @change="lastChange = $event.key"
        @reset="lastChange = 'reset'"
      />
    </div>

    <span class="vdk-demo-out">остання зміна: {{ lastChange }}</span>
    <pre class="vdk-json">{{ JSON.stringify(values, null, 2) }}</pre>
  </Demo>
</template>

<style scoped>
.vdk-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  font-size: 13px;
}

.vdk-controls label {
  display: flex;
  gap: 8px;
  align-items: center;
}

.vdk-frame {
  box-sizing: border-box;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 6px;
  padding: 2px 4px;
  transition: width 0.1s;
}

.vdk-json {
  margin: 0;
  max-height: 220px;
  overflow: auto;
  font-size: 12px;
}
</style>
