<script setup lang="ts">
import { ref, h } from 'vue'

import SkyButton from '@/shared/ui/SkyButton/SkyButton.vue'
import SkyInput from '@/shared/ui/SkyInput/SkyInput.vue'
import SkySearchInput from '@/shared/ui/SkySearchInput/SkySearchInput.vue'
import SkySelect from '@/shared/ui/SkySelect/SkySelect.vue'
import SkySelectSearch from '@/shared/ui/SkySelectSearch/SkySelectSearch.vue'
import SkyCheckbox from '@/shared/ui/SkyCheckbox/SkyCheckbox.vue'
import SkyTabs from '@/shared/ui/SkyTabs/SkyTabs.vue'
import SkyBadge from '@/shared/ui/SkyBadge/SkyBadge.vue'
import SkyAlert from '@/shared/ui/SkyAlert/SkyAlert.vue'
import SkyLoader from '@/shared/ui/SkyLoader/SkyLoader.vue'
import SkyCard from '@/shared/ui/SkyCard/SkyCard.vue'
import SkyCardHeader from '@/shared/ui/SkyCardHeader/SkyCardHeader.vue'
import SkyCardRow from '@/shared/ui/SkyCardRow/SkyCardRow.vue'
import SkyTileCard from '@/shared/ui/SkyTileCard/SkyTileCard.vue'
import Modal from '@/shared/ui/Modal/Modal.vue'
import Dialog from '@/shared/ui/Dialog/Dialog.vue'
import Header from '@/shared/ui/Header/Header.vue'
import SkyCheckboxFilter from '@/features/SkyCheckboxFilter/SkyCheckboxFilter.vue'
import SkySelectFilter from '@/features/SkySelectFilter/SkySelectFilter.vue'
import SkyDataTable from '@/features/data-table/SkyDataTable.vue'
import SkyTableRoot from '@/shared/ui/table/SkyTableRoot.vue'
import SkyTableHeader from '@/shared/ui/table/SkyTableHeader.vue'
import SkyTableHead from '@/shared/ui/table/SkyTableHead.vue'
import SkyTableBody from '@/shared/ui/table/SkyTableBody.vue'
import SkyTableRow from '@/shared/ui/table/SkyTableRow.vue'
import SkyTableCell from '@/shared/ui/table/SkyTableCell.vue'
import { createSkyColumnHelper } from '@/shared/lib/table/tableFeatures'

const text = ref('')
const search = ref('')
const select = ref('card')
const selectSearch = ref('')
const checked = ref(true)
const period = ref('week')
const filter = ref([])
const selectFilter = ref(null)
const showModal = ref(false)
const showDialog = ref(false)

const payMethods = [
  { value: 'cash', text: 'Готівка' },
  { value: 'card', text: 'Картка' },
]
const cities = [
  { value: 'kyiv', text: 'Київ' },
  { value: 'lviv', text: 'Львів' },
]
const periods = [
  { value: 'day', text: 'День' },
  { value: 'week', text: 'Тиждень' },
]

// Міні-грід для превʼю
interface Row { id: number; name: string; price: number }
const column = createSkyColumnHelper<Row>()
const gridColumns = [
  column.accessor('name', { header: 'Товар', meta: { widthFr: 2 } }),
  column.accessor('price', {
    header: 'Ціна',
    size: 80,
    meta: { align: 'right' },
    cell: ({ getValue }) => `${getValue()} ₴`,
  }),
]
const gridData: Row[] = [
  { id: 1, name: 'Кава', price: 45 },
  { id: 2, name: 'Чай', price: 30 },
]

const primitiveColumns = [
  { name: 'name', title: 'Товар', widthFr: 2 },
  { name: 'price', title: 'Ціна', width: 70, align: 'right' as const },
]
</script>

<template>
  <div class="vdk-gallery">
    <!-- Форми -->
    <h3 class="vdk-gallery__group">Форми</h3>
    <div class="vdk-gallery__grid">
      <article class="vdk-card">
        <header class="vdk-card__head">
          <a href="/components/sky-button">SkyButton</a>
          <code>variant · loading · icon · block</code>
        </header>
        <div class="vdk-card__stage">
          <SkyButton variant="primary">Зберегти</SkyButton>
          <SkyButton variant="danger">Видалити</SkyButton>
          <SkyButton variant="outline">Скасувати</SkyButton>
        </div>
      </article>

      <article class="vdk-card">
        <header class="vdk-card__head">
          <a href="/components/sky-input">SkyInput</a>
          <code>v-model · state · hint</code>
        </header>
        <div class="vdk-card__stage vdk-card__stage--column">
          <SkyInput v-model="text" placeholder="Назва товару" />
          <SkyInput model-value="Помилка" state="error" hint="Перевірте поле" />
        </div>
      </article>

      <article class="vdk-card">
        <header class="vdk-card__head">
          <a href="/components/sky-search-input">SkySearchInput</a>
          <code>v-model · collapsible</code>
        </header>
        <div class="vdk-card__stage vdk-card__stage--column">
          <SkySearchInput v-model="search" placeholder="Пошук…" />
        </div>
      </article>

      <article class="vdk-card">
        <header class="vdk-card__head">
          <a href="/components/sky-select">SkySelect</a>
          <code>{{ '{ value, text }' }}</code>
        </header>
        <div class="vdk-card__stage vdk-card__stage--column">
          <SkySelect v-model="select" :options="payMethods" />
        </div>
      </article>

      <article class="vdk-card">
        <header class="vdk-card__head">
          <a href="/components/sky-select-search">SkySelectSearch</a>
          <code>пошук у дропдауні</code>
        </header>
        <div class="vdk-card__stage vdk-card__stage--column">
          <SkySelectSearch
            v-model="selectSearch"
            :options="cities"
            placeholder="Оберіть місто"
          />
        </div>
      </article>

      <article class="vdk-card">
        <header class="vdk-card__head">
          <a href="/components/sky-checkbox">SkyCheckbox</a>
          <code>switch · масив</code>
        </header>
        <div class="vdk-card__stage vdk-card__stage--column">
          <SkyCheckbox v-model="checked">Активний</SkyCheckbox>
          <SkyCheckbox v-model="checked" switch>Режим switch</SkyCheckbox>
        </div>
      </article>

      <article class="vdk-card">
        <header class="vdk-card__head">
          <a href="/components/sky-tabs">SkyTabs</a>
          <code>анімований індикатор</code>
        </header>
        <div class="vdk-card__stage">
          <SkyTabs v-model="period" :options="periods" />
        </div>
      </article>

      <article class="vdk-card">
        <header class="vdk-card__head">
          <a href="/components/sky-checkbox-filter">SkyCheckboxFilter</a>
          <code>мульти-вибір + пошук</code>
        </header>
        <div class="vdk-card__stage">
          <SkyCheckboxFilter
            v-model="filter"
            title="Категорії"
            :options="[
              { value: 'drinks', name: 'Напої' },
              { value: 'food', name: 'Їжа' },
            ]"
          />
        </div>
      </article>

      <article class="vdk-card">
        <header class="vdk-card__head">
          <a href="/components/sky-select-filter">SkySelectFilter</a>
          <code>одиничний вибір</code>
        </header>
        <div class="vdk-card__stage">
          <SkySelectFilter
            v-model="selectFilter"
            title="Категорія"
            all-label="Усі категорії"
            :searchable="false"
            :options="[
              { value: 'drinks', name: 'Напої' },
              { value: 'food', name: 'Їжа' },
            ]"
          />
        </div>
      </article>
    </div>

    <!-- Статуси -->
    <h3 class="vdk-gallery__group">Статуси й зворотний зв'язок</h3>
    <div class="vdk-gallery__grid">
      <article class="vdk-card">
        <header class="vdk-card__head">
          <a href="/components/sky-badge">SkyBadge</a>
          <code>6 тональностей</code>
        </header>
        <div class="vdk-card__stage">
          <SkyBadge tone="success" label="Активний" />
          <SkyBadge tone="error" label="Помилка" />
          <SkyBadge tone="pending" label="Очікує" />
        </div>
      </article>

      <article class="vdk-card">
        <header class="vdk-card__head">
          <a href="/components/sky-alert">SkyAlert</a>
          <code>tone · showIcon</code>
        </header>
        <div class="vdk-card__stage vdk-card__stage--column">
          <SkyAlert tone="success">Збережено</SkyAlert>
          <SkyAlert tone="error">Помилка синхронізації</SkyAlert>
        </div>
      </article>

      <article class="vdk-card">
        <header class="vdk-card__head">
          <a href="/components/sky-loader">SkyLoader</a>
          <code>text</code>
        </header>
        <div class="vdk-card__stage vdk-card__stage--loader">
          <SkyLoader text="Завантаження…" />
        </div>
      </article>
    </div>

    <!-- Картки -->
    <h3 class="vdk-gallery__group">Картки</h3>
    <div class="vdk-gallery__grid">
      <article class="vdk-card">
        <header class="vdk-card__head">
          <a href="/components/sky-card">SkyCard</a>
          <code>ribbon · header · footer</code>
        </header>
        <div class="vdk-card__stage vdk-card__stage--column">
          <SkyCard>
            <template #header>
              <SkyCardHeader title="Торгова точка" subtitle="вул. Хрещатик, 1" />
            </template>
            <SkyCardRow label="Статус">
              <SkyBadge tone="success" label="Активна" />
            </SkyCardRow>
            <SkyCardRow label="ID" value="12345" />
          </SkyCard>
        </div>
      </article>

      <article class="vdk-card">
        <header class="vdk-card__head">
          <a href="/components/sky-tile-card">SkyTileCard</a>
          <code>title · subtitle · slot</code>
        </header>
        <div class="vdk-card__stage vdk-card__stage--column">
          <SkyTileCard title="Glovo" subtitle="Інтеграція доставки">
            <SkyBadge tone="success" label="Підключено" />
          </SkyTileCard>
        </div>
      </article>
    </div>

    <!-- Таблиці -->
    <h3 class="vdk-gallery__group">Таблиці</h3>
    <div class="vdk-gallery__grid">
      <article class="vdk-card vdk-card--wide">
        <header class="vdk-card__head">
          <a href="/components/data-table">SkyDataTable</a>
          <code>TanStack v9 · колонки</code>
        </header>
        <div class="vdk-card__stage vdk-card__stage--flush">
          <div class="vdk-card__table">
            <SkyDataTable :columns="gridColumns" :data="gridData" row-id="id" />
          </div>
        </div>
      </article>

      <article class="vdk-card vdk-card--wide">
        <header class="vdk-card__head">
          <a href="/components/table">Примітиви таблиці</a>
          <code>Root · Header · Row · Cell</code>
        </header>
        <div class="vdk-card__stage vdk-card__stage--flush">
          <div class="vdk-card__table">
            <SkyTableRoot :columns="primitiveColumns">
              <SkyTableHeader>
                <SkyTableHead
                  v-for="c in primitiveColumns"
                  :key="c.name"
                  :column="c"
                />
              </SkyTableHeader>
              <SkyTableBody>
                <SkyTableRow v-for="row in gridData" :key="row.id">
                  <SkyTableCell>{{ row.name }}</SkyTableCell>
                  <SkyTableCell align="right">{{ row.price }} ₴</SkyTableCell>
                </SkyTableRow>
              </SkyTableBody>
            </SkyTableRoot>
          </div>
        </div>
      </article>
    </div>

    <!-- Layout -->
    <h3 class="vdk-gallery__group">Layout і оверлеї</h3>
    <div class="vdk-gallery__grid">
      <article class="vdk-card vdk-card--wide">
        <header class="vdk-card__head">
          <a href="/components/header">Header</a>
          <code>слоти шапки · back · дропдаун</code>
        </header>
        <div class="vdk-card__stage vdk-card__stage--flush">
          <Header title="Товари" subtitle="Управління каталогом" :show-back-button="false">
            <SkyButton variant="primary">+ Додати</SkyButton>
          </Header>
        </div>
      </article>

      <article class="vdk-card">
        <header class="vdk-card__head">
          <a href="/components/modal">Modal</a>
          <code>#title · #header-actions · #footer</code>
        </header>
        <div class="vdk-card__stage">
          <SkyButton variant="outline" @click="showModal = true">
            Відкрити Modal
          </SkyButton>
        </div>
      </article>

      <article class="vdk-card">
        <header class="vdk-card__head">
          <a href="/components/dialog">Dialog</a>
          <code>mode: next | classic</code>
        </header>
        <div class="vdk-card__stage">
          <SkyButton variant="outline" @click="showDialog = true">
            Відкрити Dialog
          </SkyButton>
        </div>
      </article>
    </div>

    <Modal v-model="showModal" title="Замовлення №1042" subtitle="3 позиції" width="520px" height="300px">
      <template #header-actions>
        <SkyButton variant="outline">Друк</SkyButton>
      </template>
      <div style="padding: 16px">Вміст модалки.</div>
      <template #footer>
        <SkyButton variant="primary" @click="showModal = false">Готово</SkyButton>
      </template>
    </Modal>

    <Dialog v-model="showDialog" mode="next" title="Новий товар" subtitle="Заповніть дані">
      <div style="padding: 20px">Вміст діалогу.</div>
      <template #buttons>
        <SkyButton variant="outline" @click="showDialog = false">Скасувати</SkyButton>
        <SkyButton variant="primary" @click="showDialog = false">Зберегти</SkyButton>
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.vdk-gallery__group {
  margin: 32px 0 12px;
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  border: none;
  padding: 0;
}

.vdk-gallery__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}

.vdk-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
  overflow: visible;
}

.vdk-card--wide {
  grid-column: 1 / -1;
}

.vdk-card__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  border-radius: 12px 12px 0 0;
}

.vdk-card__head a {
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
}

.vdk-card__head code {
  font-size: 11px;
  color: var(--vp-c-text-3);
  background: none;
  padding: 0;
}

/* Сцена завжди світла: компоненти кіта розраховані на світлий інтерфейс
   Skyservice і не мають темної теми. У темних доках на сірому фоні частина
   з них (лейбли чекбоксів, бордери інпутів) виглядала б інакше, ніж у застосунку. */
.vdk-card__stage {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 18px;
  background: #f8f9fa;
  color: #212529;
  border-radius: 0 0 12px 12px;
  min-height: 92px;
}

.vdk-card__stage--column {
  flex-direction: column;
  align-items: stretch;
}

/* Лоадер позиціонується абсолютно і накриває контейнер — тримаємо його
   всередині сцени, інакше він вилазить на шапку картки. */
.vdk-card__stage--loader {
  position: relative;
  justify-content: center;
  min-height: 190px;
  overflow: hidden;
}

.vdk-card__stage--flush {
  padding: 0;
  display: block;
}

.vdk-card__table {
  height: 160px;
  background: #fff;
  border-radius: 0 0 12px 12px;
  overflow: hidden;
}
</style>
