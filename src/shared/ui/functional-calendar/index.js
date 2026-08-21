// Точка входу vue-functional-calendar, портованого під Vue 3.
// Оригінал (Vue 2) — https://github.com/ManukMinasyan/vue-functional-calendar
//
// Вихідники в ./components, ./utils, ./mixins, ./assets лишаються 1-в-1 з
// апстрімом. Відмінності — рівно п'ять правок під Vue 3, кожна позначена в коді
// коментарем `[Vue 3]`:
//   • FunctionalCalendar.vue — beforeDestroy → beforeUnmount
//   • FunctionalCalendar.vue — this.$set(...) → пряме присвоєння (4 місця)
//   • Day.vue — $scopedSlots об'єднано в $slots
//   • PickerInputs.vue — v-model не можна вішати на проп: доданий computed
//     singleSelectedDateModel із сеттером, що пише в calendar.selectedDate
//   • assets/scss/calendar.scss — класи переходів *-enter → *-enter-from
//
// З апстріму навмисно не перенесені:
//   • Demo.vue, main.js — демо-застосунок самої ліби, до пакунка не входить;
//   • utils/EventBus.js — `new Vue()` з Vue 2; жоден компонент його не імпортує;
//   • utils/calendarMethods.js — мертвий дублікат методів FunctionalCalendar.vue
//     (його імпорт закоментований ще в оригіналі) з непортованими this.$set.
//
// Плагін-обгортка апстріму спиралася на Vue.prototype.$getOptions; тут вона не
// відтворена, бо цю глобальну опцію не читає жоден компонент ліби.
import FunctionalCalendar from "./components/FunctionalCalendar.vue";

export default {
  install(app) {
    app.component("FunctionalCalendar", FunctionalCalendar);
  },
};

export { FunctionalCalendar };
