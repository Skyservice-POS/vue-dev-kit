<script setup lang="ts">
import { computed } from 'vue';
import SkyFilterDropdown from '@/shared/ui/SkyFilterDropdown/SkyFilterDropdown.vue';

/**
 * Посторінкова навігація таблиць адмінки (`.pagesBar` у Table.vue), відтворена
 * за вимірами живої розмітки: селектор кількості зліва, далі номери зі
 * згортанням у «…».
 *
 * Компонент нічого не завантажує — лише повідомляє, що обрали. Список сторінок
 * рахуємо самі з `total` і `pageSize`: в адмінці його готує бекенд (`json.links`),
 * а наші ендпоінти віддають лише загальну кількість.
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

/**
 * Вигляд меню з адмінки. Через інлайнові змінні, а не через клас: панель живе в
 * body, тож тема застосунку на :root інакше перебила б ці значення.
 */
const MENU_VARS = {
  '--sky-filter-panel-padding': '0',
  '--sky-filter-panel-radius': '4px',
  '--sky-filter-panel-bg': '#fff',
  '--sky-filter-panel-shadow': 'none',
};

const pageCount = computed(() => Math.max(1, Math.ceil(props.total / Math.max(1, props.pageSize))));

/** Чи пропонуємо пункт «показати все». */
const hasAll = computed(() => !!props.allLabel && props.total > 0 && props.total <= props.allLimit);

/**
 * Коли на сторінці вміщається все, показуємо це як «Усі N», а не числом, більшим
 * за саму вибірку: «50» при восьми записах виглядає як помилка.
 */
const selectValue = computed(() =>
  hasAll.value && props.pageSize >= props.total ? props.total : props.pageSize,
);

/** Пункти менші за `total` — «100 на сторінці» для 40 записів сенсу не має. */
const sizeOptions = computed(() => {
  const fitting = props.pageSizeOptions.filter((n) => n < props.total);
  if (hasAll.value) fitting.push(props.total);
  if (!fitting.includes(selectValue.value)) fitting.push(selectValue.value);
  return [...new Set(fitting)].sort((a, b) => a - b);
});

const sizeLabel = (n: number): string =>
  hasAll.value && n === props.total ? props.allLabel!(props.total) : String(n);

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

function pick(size: number, close: () => void): void {
  close();
  if (size !== selectValue.value) emit('update:pageSize', size);
}
</script>

<template>
  <div v-if="visible" class="sky-pagination">
    <SkyFilterDropdown
      v-if="sizeOptions.length > 1"
      class="sky-pagination__size"
      trigger-class="sky-pagination__size-btn"
      panel-class="sky-pagination__menu"
      :panel-vars="MENU_VARS"
      :title="sizeLabel(selectValue)"
      :width="160"
      :disabled="disabled"
    >
      <template #trigger>
        <span class="sky-pagination__size-value">{{ sizeLabel(selectValue) }}</span>
        <i class="sky-pagination__size-caret" aria-hidden="true" />
      </template>
      <template #default="{ close }">
        <ul class="sky-pagination__list">
          <li v-for="n in sizeOptions" :key="n" class="sky-pagination__item">
            <button type="button" class="sky-pagination__item-btn" @click="pick(n, close)">
              {{ sizeLabel(n) }}
            </button>
          </li>
        </ul>
      </template>
    </SkyFilterDropdown>

    <template v-for="(p, i) in pageCount > 1 ? pages : []">
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
/* Усі числа нижче зняті з живої розмітки адмінки, а не підібрані на око. */
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

/* Рамка — на обгортці, а кнопка всередині світло-сіра: так само, як
   `.selectorPageLimit` навколо Bootstrap-івського `.btn-light`. Флекс тут не для
   розкладки: в адмінці обгортка — це `.btn-group`, тобто `inline-flex`, і саме
   він тягне кнопку рівно під рамку. Без нього кнопка лишалась на власні 38px і
   вилазила на піксель за нижній бордер. */
.sky-pagination__size {
  display: inline-flex;
  width: fit-content;
  height: 38px;
  margin-left: 5px;
  border: 1px solid var(--sky-pagination-border, #a9a9a9);
  border-radius: 5px;
  background: transparent;
}

.sky-pagination__size :deep(.sky-pagination__size-btn) {
  /* Не 38px: висоту дає розтягування по флексу — 36px усередині рамки, як в
     адмінці. Явне `auto` потрібне, щоб перебити висоту з SkyFilterDropdown. */
  height: auto;
  padding: 6px 12px;
  border: 1px solid var(--sky-pagination-size-bg, #f8f9fa);
  border-radius: 4px;
  background: var(--sky-pagination-size-bg, #f8f9fa);
  font-size: inherit;
  line-height: 24px;
  color: inherit;
}

.sky-pagination__size-value {
  font-weight: 500;
  color: var(--sky-pagination-accent, #106090);
  white-space: nowrap;
}

/* Стрілка дропапа — та сама, що в адмінці: бокс 20×8, фон 19×12, повернутий. */
.sky-pagination__size-caret {
  position: relative;
  left: 5px;
  top: 2px;
  display: inline-block;
  width: 20px;
  height: 8px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 452 452'%3E%3Cpath fill='%23000' d='M226 355c-8 0-16-3-22-9L9 151c-12-12-12-32 0-45s32-12 45 0l172 172L398 106c12-12 32-12 45 0s12 32 0 45L248 345c-6 6-14 10-22 10z'/%3E%3C/svg%3E")
    no-repeat right;
  background-size: 19px 12px;
  transform: rotate(180deg);
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

/* Єдиний ефект наведення в адмінці — підкреслення: номери там `<a>`, і Bootstrap
   лишає їм рівно його. Ані фону, ані зміни кольору. */
.sky-pagination__page:hover:not(:disabled):not(.is-current) {
  text-decoration: underline;
}

.sky-pagination__page:disabled {
  cursor: default;
  opacity: 0.5;
}

/* Поточна відрізняється ЛИШЕ рамкою: колір той самий #106090 — перевірено
   піксельним семплом зі скріншота адмінки, де `.pagesBar .pageButton` б'є
   `.pageButton_current` за специфічністю. Падінги не компенсуємо: там кнопка з
   рамкою теж на 2px вища, і центрування по флексу це ховає. */
.sky-pagination__page.is-current {
  border: 1px solid var(--sky-pagination-border, #a9a9a9);
  cursor: default;
}

.sky-pagination__gap {
  padding: 0;
}
</style>

<style>
/* Меню телепортується в body, тож scoped-правила до нього не дістають. */
.sky-pagination__menu {
  min-width: 160px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  font-size: 12pt;
}

.sky-pagination__menu .sky-pagination__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.sky-pagination__menu .sky-pagination__item {
  padding: 5px;
}

.sky-pagination__menu .sky-pagination__item-btn {
  display: block;
  width: 100%;
  padding: 4px 24px;
  border: none;
  background: transparent;
  font: inherit;
  color: #212529;
  text-align: left;
  white-space: nowrap;
  cursor: pointer;
}

.sky-pagination__menu .sky-pagination__item:hover {
  background: #0e7fe1;
}

.sky-pagination__menu .sky-pagination__item:hover .sky-pagination__item-btn {
  color: #fff;
}
</style>
