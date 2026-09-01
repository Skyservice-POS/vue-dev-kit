<script setup lang="ts" generic="TRow">
// Тіло таблиці для звичайного (невіртуалізованого) рендеру. Два режими:
//
//   • без `rows` — прозора обгортка, рядки складає викликач сам. Так це
//     працювало від початку, і так лишається для тих, хто збирає таблицю
//     з примітивів вручну;
//   • з `rows` — тіло само ітерує і віддає scoped-слот `{ row, index }`.
//
// Другий режим — спільний контракт зі `SkyTableVirtualBody`. Саме завдяки
// йому SkyDataTable перемикає віртуалізацію одним `<component :is>`, а
// розмітка рядка лишається написаною один раз. Міняється тільки те, хто
// вирішує, які рядки зараз у DOM.
withDefaults(
  defineProps<{
    /** Рядки для ітерації. Не задано — тіло лишається прозорою обгорткою. */
    rows?: TRow[];
    /** Ключ рядка. За замовчуванням — індекс, чого досить лише для статичних списків. */
    rowKey?: (row: TRow, index: number) => string | number;
  }>(),
  { rows: undefined, rowKey: (_row: TRow, index: number) => index },
);

// Контракт слотів оголошуємо явно: для generic-компонента Vue не виводить
// props скоупленого слота з шаблону, і на боці споживача `row` стає `{}`.
defineSlots<{
  /** Рядок. У passthrough-режимі (без `rows`) — звичайний слот без props. */
  default(props: { row: TRow; index: number }): unknown;
  /** Показується замість рядків, коли `rows` заданий і порожній. */
  empty(): unknown;
}>();
</script>

<template>
  <div class="sky-table__body" role="rowgroup">
    <template v-if="rows">
      <slot v-if="!rows.length" name="empty" />
      <template v-for="(row, index) in rows" :key="rowKey(row, index)">
        <slot :row="row" :index="index" />
      </template>
    </template>
    <!--
      Passthrough-режим: рядки вже готові, слот-props тут не буває. Каст — щоб
      не робити `row`/`index` опційними в defineSlots: інакше кожен споживач
      rows-режиму отримав би `TRow | undefined`. У рантаймі `v-bind="{}"` не
      передає нічого, тобто рівно те, що було до появи контракту.
    -->
    <slot v-else v-bind="({} as { row: TRow; index: number })" />
  </div>
</template>

<style scoped>
.sky-table__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
</style>
