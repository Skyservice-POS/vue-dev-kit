<script setup lang="ts">
// Єдине місце в киті, яке імпортує vue-virtual-scroller. Хто рендерить сотні
// рядків — бере цей компонент; хто ні — SkyTableBody, і залежність не тягнеться.
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

withDefaults(
  defineProps<{
    items: any[];
    /** Ключ ідентифікатора рядка. */
    keyField?: string;
    /** Очікувана мінімальна висота рядка — база для розрахунку вікна. */
    minItemSize?: number;
    /** Поля, зміна яких змінює висоту рядка (розкриті модифікації, теги). */
    sizeDependencies?: (row: any) => unknown[];
  }>(),
  { keyField: 'id', minItemSize: 36, sizeDependencies: undefined },
);

const emit = defineEmits<{ 'reach-end': [] }>();
</script>

<template>
  <div class="sky-table__virtual" role="rowgroup">
    <DynamicScroller
      :items="items"
      :min-item-size="minItemSize"
      :key-field="keyField"
      class="sky-table__scroller"
      @scroll-end="emit('reach-end')"
    >
      <template #default="{ item, index, active }">
        <DynamicScrollerItem
          :item="item"
          :active="active"
          :size-dependencies="sizeDependencies ? sizeDependencies(item) : []"
          :data-index="index"
        >
          <slot :item="item" :index="index" :active="active" />
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </div>
</template>

<style scoped>
.sky-table__virtual {
  flex: 1;
  min-height: 0;
}

.sky-table__scroller {
  height: 100%;
  overflow-y: auto;
}
</style>
