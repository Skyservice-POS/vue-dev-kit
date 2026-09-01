<script setup lang="ts">
// Сумісна обгортка над `SkyTableVirtualBody`. Власного рушія не має: вся
// віртуалізація живе в примітиві shared/ui/table, тут лишився тільки старий
// публічний контракт (`items` + слот `{ item, index, active }`), щоб не ламати
// тих, хто вже брав цей компонент напряму.
//
// У новому коді беріть `SkyTableVirtualBody` або проп `virtual` у SkyDataTable.
import SkyTableVirtualBody from '../../shared/ui/table/SkyTableVirtualBody.vue';

const props = withDefaults(
  defineProps<{
    items: any[];
    /** Ключ ідентифікатора рядка. */
    keyField?: string;
    /** Очікувана мінімальна висота рядка — база для розрахунку вікна. */
    minItemSize?: number;
    /**
     * @deprecated Більше ні на що не впливає: висоту рядків тепер стежить
     * ResizeObserver, тож перелічувати залежності вручну не треба.
     */
    sizeDependencies?: (row: any) => unknown[];
  }>(),
  { keyField: 'id', minItemSize: 36, sizeDependencies: undefined },
);

const emit = defineEmits<{ 'reach-end': [] }>();

function rowKey(row: any, index: number): string | number {
  return row?.[props.keyField] ?? index;
}
</script>

<template>
  <SkyTableVirtualBody
    :rows="items"
    :row-key="rowKey"
    :estimate-size="minItemSize"
    dynamic
    @reach-end="emit('reach-end')"
  >
    <template #default="{ row, index }">
      <!-- `active` лишаємо в контракті: рендеряться тільки видимі рядки,
           тож для всіх, хто дійшов до слота, воно завжди true. -->
      <slot :item="row" :index="index" :active="true" />
    </template>
  </SkyTableVirtualBody>
</template>
