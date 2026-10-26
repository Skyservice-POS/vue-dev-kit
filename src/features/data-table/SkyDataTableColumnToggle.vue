<script setup lang="ts">
import { computed } from 'vue';
import SkyFilterDropdown from '@/shared/ui/SkyFilterDropdown/SkyFilterDropdown.vue';
import SkyCheckbox from '@/shared/ui/SkyCheckbox/SkyCheckbox.vue';

// Працює з будь-яким інстансом TanStack-таблиці: читає leaf-колонки і
// перемикає їхню видимість. Тримаємо тип широким, щоб компонент не залежав
// від конкретного набору фіч.
//
// Вигляд — з вибору колонок у таблицях адмінки (Table.vue дашборду): кнопка
// з іконкою-сіткою (`icon-table-2`), панель на 200px зі списком чекбоксів,
// під ним «Готово» і «За замовчуванням». Панель і її поведінку (позиція,
// фліп угору, закриття ззовні й по Esc) дає SkyFilterDropdown — його дефолти
// і так збігаються з `.selectColumns` адмінки.
const props = withDefaults(
  defineProps<{
    table: any;
    /** Підказка й доступна назва кнопки. */
    title?: string;
    doneLabel?: string;
    resetLabel?: string;
  }>(),
  { title: 'Колонки', doneLabel: 'Готово', resetLabel: 'За замовчуванням' },
);

/**
 * Підпис колонки в списку: `meta.label` або рядковий `header`. Колонка без
 * жодного (напр. шапка-чекбокс у колонці вибору) у список не потрапляє —
 * показати її можна було б хіба що як голий `id`.
 */
function labelOf(column: any): string {
  const meta = column.columnDef.meta as { label?: string } | undefined;
  if (meta?.label) return meta.label;
  return typeof column.columnDef.header === 'string' ? column.columnDef.header : '';
}

// Обовʼязкові колонки (`enableHiding: false`) лишаються в списку вимкненими —
// як `required` в адмінці: видно, що вони є, але прибрати їх не можна.
const columns = computed(() => props.table.getAllLeafColumns().filter((column: any) => labelOf(column)));

function canHide(column: any): boolean {
  return column.getCanHide?.() !== false;
}
</script>

<template>
  <SkyFilterDropdown
    class="sky-dt-columns"
    trigger-class="sky-dt-columns__btn"
    :title="title"
    :width="200"
    align="end"
  >
    <template #trigger>
      <!-- Гліф `icon-table-2` з @skyservice/icomoon (\e14b), перенесений у SVG,
           щоб не тягнути іконковий шрифт застосунку. -->
      <svg class="sky-dt-columns__icon" viewBox="0 0 512 448" aria-hidden="true">
        <path
          fill="currentColor"
          transform="matrix(1 0 0 -1 0 448)"
          d="M0 448V0h512v448H0zm192-288v96h128v-96H192zm128-32V32H192v96h128zm0 256v-96H192v96h128zm-160 0v-96H32v96h128zM32 256h128v-96H32v96zm320 0h128v-96H352v96zm0 32v96h128v-96H352zM32 128h128V32H32v96zm320-96v96h128V32H352z"
        />
      </svg>
      <span class="sky-dt-columns__sr">{{ title }}</span>
    </template>

    <template #default="{ close }">
      <div class="sky-dt-columns__list">
        <div v-for="column in columns" :key="column.id" class="sky-dt-columns__item">
          <SkyCheckbox
            :model-value="column.getIsVisible()"
            :disabled="!canHide(column)"
            @update:model-value="column.toggleVisibility(Boolean($event))"
          >
            {{ labelOf(column) }}
          </SkyCheckbox>
        </div>
      </div>

      <hr class="sky-dt-columns__sep" />
      <div class="sky-dt-columns__actions">
        <button type="button" class="sky-dt-columns__link" @mousedown.prevent @click="close">
          {{ doneLabel }}
        </button>
      </div>
      <div class="sky-dt-columns__actions">
        <button type="button" class="sky-dt-columns__link" @mousedown.prevent @click="table.resetColumnVisibility()">
          {{ resetLabel }}
        </button>
      </div>
    </template>
  </SkyFilterDropdown>
</template>

<style scoped>
/* .btn-select-column адмінки: #106090, 14pt, висота 30px, падінги 0 5px; у
   відкритому стані й на ховері — чорна іконка на #def9ff з радіусом 5px.
   :deep — бо клас стоїть на кнопці всередині SkyFilterDropdown, і треба
   перебити його висоту, падінги й приглушений колір відкритого стану. */
.sky-dt-columns :deep(.sky-dt-columns__btn) {
  height: 30px;
  padding: 0 5px;
  border: none;
  border-radius: 5px;
  background: transparent;
  color: var(--sky-table-head-color, #106090);
  font-size: 14pt;
  transition: all 0.15s ease-in-out;
}

.sky-dt-columns :deep(.sky-dt-columns__btn:hover),
.sky-dt-columns :deep(.sky-dt-columns__btn.is-open) {
  background-color: var(--sky-table-row-hover-bg, #def9ff);
  color: #000;
}

.sky-dt-columns__icon {
  display: block;
  width: 1em;
  height: 0.875em;
}

.sky-dt-columns__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

/* Скролиться список, а не вся панель: її висоту обмежує SkyFilterDropdown. */
.sky-dt-columns__list {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding-top: 3px;
  padding-left: 3px;
}

/* Рядок — у метриках чекбоксів наших фільтрів (CheckboxPanel). */
.sky-dt-columns__item {
  display: flex;
  --sky-checkbox-size: 20px;
  --sky-checkbox-gap: 4px;
  --sky-checkbox-font-size: 10pt;
  --sky-checkbox-line-height: 20px;
  margin-bottom: 15px;
}

.sky-dt-columns__item :deep(.sky-checkbox) {
  flex: 1;
  min-width: 0;
}

/* hr + два рядки .dialog-buttons адмінки: 16px / 500 / #106090, зверху 10px. */
.sky-dt-columns__sep {
  flex-shrink: 0;
  margin: 2px 0 0;
  border: 0;
  border-top: 1px solid var(--sky-filter-separator-color, rgba(0, 0, 0, 0.1));
}

.sky-dt-columns__actions {
  display: flex;
  flex-shrink: 0;
  padding-top: 10px;
  font-size: var(--sky-filter-action-font-size, 1rem);
  font-weight: var(--sky-filter-action-font-weight, 500);
  white-space: nowrap;
}

.sky-dt-columns__link {
  padding: 0;
  border: none;
  background: transparent;
  font: inherit;
  color: var(--sky-filter-accent, #106090);
  cursor: pointer;
}

.sky-dt-columns__link:focus-visible {
  outline: 2px solid var(--sky-filter-accent, #106090);
  outline-offset: 2px;
}
</style>
