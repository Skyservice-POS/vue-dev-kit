<script setup lang="ts">
import { computed } from 'vue';

/**
 * Посторінкова навігація в стилі таблиць адмінки (`.pagesBar` у Table.vue):
 * селектор кількості на сторінці зліва, далі номери сторінок із «…».
 *
 * Компонент нічого не завантажує — лише повідомляє, що обрали. Список сторінок
 * рахуємо самі з `total` і `pageSize`: в адмінці його готує бекенд (`json.links`),
 * але наші ендпоінти віддають тільки загальну кількість.
 */
const props = withDefaults(
  defineProps<{
    /** Скільки всього записів у вибірці (не на сторінці). */
    total: number;
    /** Поточна сторінка, з одиниці. */
    page: number;
    pageSize: number;
    /** Варіанти для селектора; лишаються тільки менші за `total`. */
    pageSizeOptions?: number[];
    /**
     * Підпис пункту «показати все». Отримує кількість: `(n) => `Усі ${n}``.
     * Порожній — пункту немає. З'являється, лише поки записів менше за `allLimit`.
     */
    allLabel?: (total: number) => string;
    allLimit?: number;
    /** Скільки сусідніх сторінок показувати обабіч поточної. */
    siblings?: number;
    disabled?: boolean;
  }>(),
  {
    pageSizeOptions: () => [5, 10, 25, 50, 100, 200, 500, 750, 1000],
    allLabel: undefined,
    allLimit: 1000,
    siblings: 1,
    disabled: false,
  },
);

const emit = defineEmits<{
  'update:page': [number];
  'update:pageSize': [number];
}>();

const pageCount = computed(() => Math.max(1, Math.ceil(props.total / Math.max(1, props.pageSize))));

/**
 * Пункти менші за `total` — показувати «100 на сторінці» для 40 записів немає сенсу.
 * Поточний лишаємо завжди, інакше селектор показував би значення, якого немає в списку.
 */
const sizeOptions = computed(() => {
  const fitting = props.pageSizeOptions.filter((n) => n < props.total || n === props.pageSize);
  if (props.allLabel && props.total > 0 && props.total <= props.allLimit && !fitting.includes(props.total)) {
    fitting.push(props.total);
  }
  return [...new Set(fitting)].sort((a, b) => a - b);
});

const sizeLabel = (n: number): string =>
  props.allLabel && n === props.total ? props.allLabel(props.total) : String(n);

/** Номери сторінок із «…»: перша, остання, поточна з сусідами. */
const pages = computed<(number | '…')[]>(() => {
  const last = pageCount.value;
  const span = props.siblings;
  if (last <= 5 + span * 2) return Array.from({ length: last }, (_, i) => i + 1);

  const from = Math.max(2, props.page - span);
  const to = Math.min(last - 1, props.page + span);
  const out: (number | '…')[] = [1];
  if (from > 2) out.push('…');
  for (let p = from; p <= to; p++) out.push(p);
  if (to < last - 1) out.push('…');
  out.push(last);
  return out;
});

const visible = computed(() => pageCount.value > 1 || sizeOptions.value.length > 1);

function goTo(page: number): void {
  if (props.disabled || page === props.page) return;
  emit('update:page', page);
}

function onSize(e: Event): void {
  emit('update:pageSize', Number((e.target as HTMLSelectElement).value));
}
</script>

<template>
  <div v-if="visible" class="sky-pagination">
    <select
      v-if="sizeOptions.length > 1"
      class="sky-pagination__size"
      :value="pageSize"
      :disabled="disabled"
      @change="onSize"
    >
      <option v-for="n in sizeOptions" :key="n" :value="n">{{ sizeLabel(n) }}</option>
    </select>

    <template v-for="(p, i) in pages">
      <button
        v-if="p !== '…'"
        :key="`p${p}`"
        type="button"
        class="sky-pagination__page"
        :class="{ 'is-current': p === page }"
        :style="i === 0 && sizeOptions.length > 1 ? { marginLeft: '5px' } : undefined"
        :disabled="disabled"
        :aria-current="p === page ? 'page' : undefined"
        @click="goTo(p)"
      >
        {{ p }}
      </button>
      <span v-else :key="`gap${i}`" class="sky-pagination__gap">…</span>
    </template>
  </div>
</template>

<style scoped>
/* Метрики зняті з `.pagesBar` в адмінці (Table.vue) і лишені як є. */
.sky-pagination {
  display: flex;
  align-items: center;
  flex: 0 1 auto;
  max-width: 100%;
  height: var(--sky-pagination-height, 48px);
  overflow: auto;
  font-size: var(--sky-pagination-font-size, 12pt);
  line-height: 15px;
}

.sky-pagination__size {
  border: none;
  background: transparent;
  font: inherit;
  font-weight: 500;
  color: var(--sky-pagination-accent, #106090);
  cursor: pointer;
}

.sky-pagination__size:disabled {
  cursor: default;
  opacity: 0.5;
}

.sky-pagination__page {
  padding: 10px 10px 11px;
  margin-right: 1px;
  border: none;
  border-radius: 5px;
  background: transparent;
  font: inherit;
  font-weight: 500;
  color: var(--sky-pagination-accent, #106090);
  cursor: pointer;
}

.sky-pagination__page:disabled {
  cursor: default;
  opacity: 0.5;
}

/* Поточна — з рамкою; вона додає 2px, тож падінги зменшені рівно на стільки,
   інакше кнопки стрибали б по висоті. */
.sky-pagination__page.is-current {
  padding: 9px 9px 10px;
  border: 1px solid var(--sky-pagination-current-border, #a9a9a9);
  color: var(--sky-pagination-current-color, #000);
  cursor: default;
}

.sky-pagination__gap {
  padding: 0 4px;
}
</style>
