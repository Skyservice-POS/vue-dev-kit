<template>
  <div class="datepicker datepicker-range">
    <FunctionalCalendar
      ref="Calendar"
      :value="calendarData"
      :date-format="'yyyy-mm-dd'"
      :is-modal="true"
      :is-separately="true"
      :is-date-range="true"
      :is-date-picker="isExcel"
      :is-auto-closeable="true"
      :change-month-function="true"
      :change-year-function="true"
      :limits="limits || limitsDate"
      :day-names="dayNames"
      :month-names="monthNames"
      :short-month-names="shortMonthNames"
      :placeholder="calendarPlaceholder"
      :max-sel-days="localConfig.maxSelDays || false"
      :min-sel-days="localConfig.minSelDays || false"
      @closed="calendarClosed"
    >
      <template v-slot:dateRangeInputs="slotProps">
        <slot
          name="dateRangeInputs"
          :startDate="slotProps.startDate"
          :endDate="slotProps.endDate"
        >
          <div
            class="overlay"
            :class="opened ? 'hf-check' : ''"
            @click.prevent="handleCheckbox"
          >
            <button
              v-if="
                dateComparing &&
                !Boolean(slotProps.startDate && slotProps.endDate) &&
                (rightWidth >= 450 || allwaysShowLabel)
              "
              style="color: inherit"
              class="calendarLabel"
            >
              {{ t('comprasion') }}
            </button>
            <button
              v-else-if="rightWidth >= 450 || allwaysShowLabel"
              class="calendarLabel"
            >
              {{ calendarLabel(slotProps.startDate, slotProps.endDate) }}
            </button>
            <span
              class="icon"
              :class="{ 'd-flex- align-items-center w-100': localActive }"
            >
              <svg
                class="calendar-icon"
                :class="{ 'calendar-icon--muted': opened }"
                width="18"
                height="18"
                viewBox="0 0 18 18"
              >
                <path
                  fill="currentColor"
                  d="M5 4.5a.5.5 0 0 1-.5-.5V2a.5.5 0 0 1 1 0v2a.5.5 0 0 1-.5.5zM11 4.5a.5.5 0 0 1-.5-.5V2a.5.5 0 0 1 1 0v2a.5.5 0 0 1-.5.5z"
                />
                <path
                  fill="currentColor"
                  d="M13 14.5H3c-.827 0-1.5-.673-1.5-1.5V4c0-.827.673-1.5 1.5-1.5h10c.827 0 1.5.673 1.5 1.5v9c0 .827-.673 1.5-1.5 1.5zM3 3.5a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V4a.5.5 0 0 0-.5-.5H3z"
                />
                <path
                  fill="currentColor"
                  d="M14 6.5H2a.5.5 0 0 1 0-1h12a.5.5 0 0 1 0 1zM5.5 7.5h1v1h-1zM7.5 7.5h1v1h-1zM9.5 7.5h1v1h-1zM11.5 7.5h1v1h-1zM3.5 9.5h1v1h-1zM5.5 9.5h1v1h-1zM7.5 9.5h1v1h-1zM9.5 9.5h1v1h-1zM11.5 9.5h1v1h-1zM3.5 11.5h1v1h-1zM5.5 11.5h1v1h-1zM7.5 11.5h1v1h-1z"
                />
              </svg>
              <template v-if="localActive && rightWidth <= 450">
                {{ calendarLabel(slotProps.startDate, slotProps.endDate) }}
              </template>
            </span>
          </div>
        </slot>
      </template>
      <template v-slot:footer>
        <div v-if="!fullFiscal">
          <ul class="datefilter">
            <li
              class="datebutton"
              :class="{ selectedRangeWraper: checkToday() }"
              @click="setToday"
            >
              {{ t('today') }}
            </li>
            <li
              class="datebutton"
              :class="{ selectedRangeWraper: checkYesterday() }"
              @click="setYesterday"
            >
              {{ t('yesterday') }}
            </li>
            <li
              class="datebutton"
              :class="{ selectedRangeWraper: checkWeek() }"
              @click="setWeek"
            >
              {{ t('week') }}
            </li>
            <li
              class="datebutton"
              :class="{ selectedRangeWraper: checkMonth() }"
              @click="setMonth"
            >
              {{ t('month') }}
            </li>
            <li
              class="datebutton hideThisOnMob"
              :class="{ selectedRangeWraper: checkThisLastMonth() }"
              @click="setLastMonth"
            >
              {{ t(monthLast) }}
            </li>
            <li
              class="datebutton hideThisOnMob"
              :class="{ selectedRangeWraper: checkThisMonth() }"
              @click="setThisMonth"
            >
              {{ t(monthNow) }}
            </li>
            <li
              v-if="!dateComparing && !isdateLimist && !isExcel"
              class="datebutton"
              :class="{ selectedRangeWraper: checkAlltime() }"
              @click="setAlltime"
            >
              {{ t('alltime') }}
            </li>
          </ul>
        </div>
        <div v-if="fullFiscal">
          <div class="yearBlock" style="display: flex">
            <div
              v-for="(quartalBlock, i) in quartals"
              :key="i"
              :class="[
                activeYear.year == quartalBlock.year
                  ? 'activeYear'
                  : 'nonActiveYear',
                getRoundedClass(i),
              ]"
              @click="chooseYear(quartalBlock.year, i)"
            >
              <p style="padding: 5px 10px 5px 10px" class="quartalYear">
                {{ quartalBlock.year }}
              </p>
            </div>
          </div>

          <div class="quartalsBlock">
            <div
              v-for="(quartalBlock, i) in quartals[activeYear.key].items"
              :key="i"
              class="quartalButton"
              :class="{
                selectedQuartal:
                  activeIndex.name === i &&
                  activeIndex.year === quartalBlock.year,
              }"
              @click="setQuartal(i, quartalBlock.year)"
            >
              <label class="quartalLabel"> {{ quartalBlock.label }} </label>
            </div>
          </div>
        </div>

        <slot name="footer">
          <div class="datepicker-range-footer">
            <p
              v-if="enableClean"
              class="datepicker-range-footer-button footer-button-clear"
              :class="isDateEmpty ? 'footer-button-clear-disabled' : null"
              @click="isDateEmpty ? null : cleanAndClose()"
            >
              {{ t('clear') }}
            </p>
            <p
              class="datepicker-range-footer-button footer-button-save"
              @click="closeCalendar"
            >
              {{ t('Gotovo') }}
            </p>
          </div>
        </slot>
      </template>
    </FunctionalCalendar>
  </div>
</template>

<script>
/**
 * Порт DatePickerRange (skyservice-skymarket-settings-app-vue,
 * src/components/datePicker/DatePickerRange.vue) — розмітка, стилі й поведінка
 * лишені 1-в-1. Замінені лише залежності, яких немає поза застосунком-хостом:
 *   • store.filtersSearch.form / store.window.width — підсвітка активного
 *     пресету й ширина віддавались глобальним стором; тут завжди рахуються
 *     локально (lastSelectedRange + windowWidth), як і в оригіналі за
 *     localActive=true;
 *   • @/langs — реальний словник host-застосунку; тут той самий проксі
 *     @/langs (window.lang), що й у SkyTable, з UA-фолбеками через t();
 *   • /img/calendar.svg, /img/calendarGrey.svg — інлайнова SVG замість
 *     host-абсолютних шляхів, стан "відкрито" перемикається класом, а не
 *     другим файлом.
 */
import { FunctionalCalendar } from '../functional-calendar';
import { lang } from '@/langs';

const SHORT_MONTH_KEYS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const TEXT_FALLBACK = {
  comprasion: 'Порівняння',
  today: 'Сьогодні',
  yesterday: 'Вчора',
  week: 'Тиждень',
  month: 'Місяць',
  alltime: 'За весь час',
  clear: 'Очистити',
  Gotovo: 'Готово',
  Mon: 'Пн', Tue: 'Вт', Wed: 'Ср', Thu: 'Чт', Fri: 'Пт', Sat: 'Сб', Sun: 'Нд',
  Jan: 'Січень', Feb: 'Лютий', Mar: 'Березень', Apr: 'Квітень',
  May: 'Травень', Jun: 'Червень', Jul: 'Липень', Aug: 'Серпень',
  Sep: 'Вересень', Oct: 'Жовтень', Nov: 'Листопад', Dec: 'Грудень',
};

/**
 * Мінімальний аналог глобального dateFormat() з адмінпанелі — рівно ті маски,
 * що використовує цей компонент: 'mmm' (короткий ключ місяця) і 'yyyy-m-d'.
 * Виклик з одним аргументом означає маску для поточної дати.
 */
function dateFormat(date, mask) {
  if (typeof date === 'string' && mask === undefined) {
    mask = date;
    date = new Date();
  }
  const d = date instanceof Date ? date : new Date(date);
  if (mask === 'mmm') return SHORT_MONTH_KEYS[d.getMonth()];
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export default {
  name: 'SkyDateRangePicker',
  components: {
    FunctionalCalendar,
  },
  props: {
    isExcel: {
      type: Boolean,
      default: false,
    },
    resetDate: {
      type: Boolean,
    },
    modelValue: {
      type: Object,
      default: () => ({
        start: dateFormat(new Date(), 'yyyy-m-d'),
        end: dateFormat(new Date(), 'yyyy-m-d'),
      }),
    },
    enableClean: {
      type: Boolean,
      default: true,
    },
    dateComparing: {
      type: Boolean,
      default: false,
    },
    isdateLimist: {
      type: Boolean,
    },
    countDays: {
      type: Number,
    },
    fullFiscal: {
      type: Boolean,
      default: false,
    },
    localActive: {
      type: Boolean,
      default: false,
    },
    // Якщо треба обмежити календар якимись конкретними датами (наприклад заблокувати всі майбутні дати)
    // limits = {min: 'yyyy-mm-dd', max: 'yyyy-mm-dd'}
    limits: {
      type: Object,
      default: null,
    },
    allwaysShowLabel: {
      type: Boolean,
      default: false,
    },
    // Локаль для форматування підписів місяців/днів у лейблі періоду
    locale: {
      type: String,
      default: 'uk-UA',
    },
  },
  emits: ['update:modelValue', 'setDate', 'closed'],
  data() {
    return {
      localConfig: {},
      oneday: 3600000 * 24,
      calendarData: {
        dateRange: {
          start: '',
          end: '',
        },
      },
      limitsDate: {
        min: '',
        max: '',
      },
      opened: false,
      windowWidth: typeof window !== 'undefined' ? window.innerWidth : 1920,
      dateFormatOptions: { year: 'numeric', month: '2-digit', day: '2-digit' },
      isInitialized: false,
      quartals: {},
      activeIndex: {},
      activeYear: {
        year: '',
        key: '',
      },
      lastSelectedRange: {
        start: '',
        end: '',
      },
    };
  },
  computed: {
    lang() {
      return lang;
    },
    monthNow() {
      return dateFormat('mmm');
    },
    monthLast() {
      const a = new Date();
      a.setDate(1);
      a.setMonth(a.getMonth() - 1);
      return dateFormat(a, 'mmm');
    },
    rightWidth() {
      return this.windowWidth;
    },
    dayNames() {
      return [
        this.t('Mon'), this.t('Tue'), this.t('Wed'), this.t('Thu'),
        this.t('Fri'), this.t('Sat'), this.t('Sun'),
      ];
    },
    monthNames() {
      return this.getMonthNames('long').map(
        (month) => month.charAt(0).toUpperCase() + month.slice(1),
      );
    },
    shortMonthNames() {
      return this.getMonthNames('short');
    },
    calendarPlaceholder() {
      return `Somedate`;
    },
    dateFormat() {
      return dateFormat;
    },
    isDateEmpty() {
      return (
        this.calendarData.dateRange.start === '' &&
        this.calendarData.dateRange.end === ''
      );
    },
  },
  watch: {
    resetDate() {
      if (this.resetDate === true) {
        this.cleanAndClose();
      }
    },
    calendarData: {
      handler() {
        if (this.isdateLimist && this.isInitialized) {
          this.setLimits(this.calendarData.dateRange.start, this.countDays);
        }
      },
      deep: true,
    },
  },
  created() {
    if (this.isdateLimist) {
      this.$nextTick(() => {
        this.isInitialized = true;
      });
    } else {
      this.calendarData.dateRange = this.modelValue;
    }
    if (this.fullFiscal) {
      this.quartals = this.CvartalLabel();
    }
  },
  mounted() {
    this.onResize = () => {
      this.windowWidth = window.innerWidth;
    };
    window.addEventListener('resize', this.onResize);

    this.$watch(
      'modelValue',
      function (value) {
        if (!this.isdateLimist) {
          this.calendarData.dateRange = this.modelValue;
          this.calendarData.dateRange.start = this.formatDateString(
            this.calendarData.dateRange.start,
            '',
            'yyyy-m-d',
          );
          this.calendarData.dateRange.end = this.formatDateString(
            this.calendarData.dateRange.end,
            '',
            'yyyy-m-d',
          );
        }
      },
      { immediate: true, deep: true },
    );
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize);
  },
  methods: {
    t(key) {
      return this.lang[key] || TEXT_FALLBACK[key] || key;
    },
    /* Мінімальний аналог глобального setLimits() з адмінпанелі — обмежує вибір
    countDays днів до й після обраної дати. Використовується розділами, де на
    беку очікується обмежена кількість дат для запиту. */
    setLimits(value, countDays) {
      if (value) {
        let dateObj = new Date(value);

        dateObj.setDate(dateObj.getDate() - countDays);
        this.limitsDate.min = dateObj.toISOString().split('T')[0];

        dateObj.setDate(dateObj.getDate() + countDays * 2);
        this.limitsDate.max = dateObj.toISOString().split('T')[0];
      }
    },

    /* Перемикає відкритість календаря. */
    handleCheckbox() {
      if (this.opened) {
        this.closeCalendar();
      } else {
        this.$refs.Calendar.showCalendar = true;
        this.opened = true;
      }
    },

    /* Приймає дві дати у форматі yyyy-mm-dd та повертає лейбл календаря, який
    відображає дати з start по end. Якщо дати збігаються з сьогоднішнім або
    вчорашнім днем, повертається "today" або "yesterday". Якщо дати не
    визначені, повертається "alltime". */
    calendarLabel(start, end) {
      start = start.replace(/-/g, '/');
      end = end.replace(/-/g, '/');

      const region = this.locale;

      const startDay = new Date(start).toLocaleDateString(region, {
        month: 'long',
        day: 'numeric',
      });

      const endDay = new Date(end).toLocaleDateString(region, {
        month: 'long',
        day: 'numeric',
      });

      if (
        new Date(start).toDateString() === new Date(end).toDateString() &&
        new Date(end).toDateString() === new Date(this.today()).toDateString()
      ) {
        return this.t('today');
      } else if (!start && !end) {
        return this.t('alltime');
      } else if (
        (new Date(start).toDateString() === new Date(end).toDateString() &&
          new Date(end).toDateString() !==
            new Date(this.today()).toDateString()) ||
        !end
      ) {
        return `${startDay}`;
      } else if (
        new Date(start).toDateString() === new Date(end).toDateString() &&
        new Date(end).toDateString() ===
          new Date(this.yesterday()).toDateString()
      ) {
        return this.t('yesterday');
      } else if (
        new Date(start).toDateString() ===
          new Date(this.week()).toDateString() &&
        new Date(end).toDateString() === new Date(this.today()).toDateString()
      ) {
        return `${startDay} - ${endDay}`;
      } else if (
        new Date(start).toDateString() ===
          new Date(this.month()).toDateString() &&
        new Date(end).toDateString() === new Date(this.today()).toDateString()
      ) {
        return `${startDay} - ${endDay}`;
      } else if (
        new Date(start).toDateString() ===
          new Date(this.thisLastMonth().first).toDateString() &&
        new Date(end).toDateString() ===
          new Date(this.thisLastMonth().last).toDateString()
      ) {
        return this.t(this.monthLast);
      } else {
        return `${startDay} - ${endDay}`;
      }
    },

    /* Встановлює обрану дату на сьогоднішній день, закриває календар і
    відправляє подію setDate. При dateComparing — записує в поля порівняння. */
    setToday() {
      let result;
      if (!this.dateComparing) {
        result = { pr1: this.today(), pr2: this.today() };
      } else {
        result = { cpr1: this.today(), cpr2: this.today() };
      }
      if (this.isdateLimist) {
        this.calendarData.dateRange.start = this.formatDateString(this.today(), '', 'yyyy-m-d');
        this.calendarData.dateRange.end = this.formatDateString(this.today(), '', 'yyyy-m-d');
      }
      this.lastSelectedRange = { start: this.today(), end: this.today() };
      this.$emit('setDate', result);
      this.closeCalendar();
    },
    setYesterday() {
      let result;
      if (!this.dateComparing) {
        result = { pr1: this.yesterday(), pr2: this.yesterday() };
      } else {
        result = { cpr1: this.yesterday(), cpr2: this.yesterday() };
      }
      if (this.isdateLimist) {
        this.calendarData.dateRange.start = this.formatDateString(this.yesterday(), '', 'yyyy-m-d');
        this.calendarData.dateRange.end = this.formatDateString(this.yesterday(), '', 'yyyy-m-d');
      }
      this.lastSelectedRange = { start: this.yesterday(), end: this.yesterday() };
      this.$emit('setDate', result);
      this.closeCalendar();
    },
    setWeek() {
      let result;
      if (!this.dateComparing) {
        result = { pr1: this.week(), pr2: this.today() };
      } else {
        result = { cpr1: this.week(), cpr2: this.today() };
      }
      if (this.isdateLimist) {
        this.calendarData.dateRange.start = this.formatDateString(this.week(), '', 'yyyy-m-d');
        this.calendarData.dateRange.end = this.formatDateString(this.today(), '', 'yyyy-m-d');
      }
      this.lastSelectedRange = { start: this.week(), end: this.today() };
      this.$emit('setDate', result);
      this.closeCalendar();
    },
    setMonth() {
      let result;
      if (!this.dateComparing) {
        result = { pr1: this.month(), pr2: this.today() };
      } else {
        result = { cpr1: this.month(), cpr2: this.today() };
      }
      if (this.isdateLimist) {
        this.calendarData.dateRange.start = this.formatDateString(this.month(), '', 'yyyy-m-d');
        this.calendarData.dateRange.end = this.formatDateString(this.today(), '', 'yyyy-m-d');
      }
      this.lastSelectedRange = { start: this.month(), end: this.today() };
      this.$emit('setDate', result);
      this.closeCalendar();
    },
    setThisMonth() {
      let result;
      if (!this.dateComparing) {
        result = { pr1: this.thisMonth(), pr2: this.today() };
      } else {
        result = { cpr1: this.thisMonth(), cpr2: this.today() };
      }
      if (this.isdateLimist) {
        this.calendarData.dateRange.start = this.formatDateString(this.thisMonth(), '', 'yyyy-m-d');
        this.calendarData.dateRange.end = this.formatDateString(this.today(), '', 'yyyy-m-d');
      }
      this.lastSelectedRange = { start: this.thisMonth(), end: this.today() };
      this.$emit('setDate', result);
      this.closeCalendar();
    },
    setLastMonth() {
      let result;
      if (!this.dateComparing) {
        result = { pr1: this.thisLastMonth().first, pr2: this.thisLastMonth().last };
      } else {
        result = { cpr1: this.thisLastMonth().first, cpr2: this.thisLastMonth().last };
      }
      if (this.isdateLimist) {
        this.calendarData.dateRange.start = this.formatDateString(this.thisLastMonth().first, '', 'yyyy-m-d');
        this.calendarData.dateRange.end = this.formatDateString(this.thisLastMonth().last, '', 'yyyy-m-d');
      }
      this.lastSelectedRange = { start: this.thisLastMonth().first, end: this.thisLastMonth().last };
      this.$emit('setDate', result);
      this.closeCalendar();
    },
    setAlltime() {
      let result;
      if (!this.dateComparing) {
        result = { pr1: '', pr2: '' };
      } else {
        result = { cpr1: '', cpr2: '' };
      }
      this.$emit('setDate', result);
      this.closeCalendar();
    },
    getMonthDates(year = 2000) {
      const dates = [];
      for (let i = 0; i < 12; i++) {
        dates.push(new Date(year, i, 15));
      }
      return dates;
    },
    getMonthNames(length) {
      const dtf = new Intl.DateTimeFormat(this.locale, {
        month: length,
        timezome: 'UTC',
      });
      return this.getMonthDates().map((d) => dtf.format(d));
    },
    formatDateString(dateStr, defaultValue = '', format = 'dd.mm.yyyy') {
      if (
        (typeof dateStr === 'string' || dateStr instanceof String) &&
        dateStr != ''
      ) {
        let arrayDate = dateStr.split('-');
        let result = format.replace('dd', ('0' + arrayDate[2]).slice(-2));
        result = result.replace('mm', ('0' + arrayDate[1]).slice(-2));
        result = result.replace('yyyy', arrayDate[0]);
        result = result.replace('d', +arrayDate[2]);
        result = result.replace('m', +arrayDate[1]);
        return result;
      } else return defaultValue;
    },
    calendarClosed() {
      this.$emit('update:modelValue', {
        start: this.formatDateString(this.calendarData.dateRange.start, '', 'yyyy-mm-dd'),
        end: this.formatDateString(this.calendarData.dateRange.end, '', 'yyyy-mm-dd'),
      });
      this.$emit('closed');
      this.limitsDate.max = '';
      this.limitsDate.min = '';
      this.opened = false;
    },
    cleanAndClose() {
      this.isdateLimist ? this.setToday() : this.$refs.Calendar.cleanRange();
      this.closeCalendar();
    },
    // Закриває календар і прибирає фокус із внутрішнього елемента попапа.
    // Без blur при поверненні на вкладку браузера спрацьовує focusin
    // всередині календаря і бібліотека знову відкриває його (showCalendar = true).
    closeCalendar() {
      this.$refs.Calendar.showCalendar = false;
      if (
        document.activeElement &&
        typeof document.activeElement.blur === 'function'
      ) {
        document.activeElement.blur();
      }
    },
    formatDate(inputDate) {
      const parts = inputDate.split('/');
      const year = parts[2];
      const month = parts[0].padStart(2, '0');
      const day = parts[1].padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    calculateDate(counter = 0) {
      const today = new Date();
      const yesterday = new Date(
        new Date(today).setDate(today.getDate() - counter),
      );
      return yesterday.toLocaleDateString('en-US', this.dateFormatOptions);
    },
    today() {
      if (!this.isInitialized && this.isdateLimist) {
        this.calendarData.dateRange.start = this.formatDate(this.calculateDate(0));
        this.calendarData.dateRange.end = this.formatDate(this.calculateDate(0));
      }
      return this.formatDate(this.calculateDate(0));
    },
    checkToday() {
      return (
        this.lastSelectedRange.start === this.today() &&
        this.lastSelectedRange.end === this.today()
      );
    },
    yesterday() {
      return this.formatDate(this.calculateDate(1));
    },
    checkYesterday() {
      return (
        this.lastSelectedRange.start === this.yesterday() &&
        this.lastSelectedRange.end === this.yesterday()
      );
    },
    week() {
      return this.formatDate(this.calculateDate(6));
    },
    checkWeek() {
      return (
        this.lastSelectedRange.start === this.week() &&
        this.lastSelectedRange.end === this.today()
      );
    },
    month() {
      return this.formatDate(this.calculateDate(30));
    },
    checkMonth() {
      return (
        this.lastSelectedRange.start === this.month() &&
        this.lastSelectedRange.end === this.today()
      );
    },
    thisMonth() {
      const m = this.today();
      const l = m.slice(8);
      let go;
      if (l - 1 != 0) go = l - 1;
      else go = 1;
      return this.formatDate(this.calculateDate(go));
    },
    checkThisMonth() {
      return (
        this.lastSelectedRange.start === this.thisMonth() &&
        this.lastSelectedRange.end === this.today()
      );
    },
    thisLastMonth() {
      const currentDate = this.today();
      const currentDay = currentDate.slice(8);
      const lastDayPrevMonth = this.formatDate(this.calculateDate(currentDay));
      const firstDayPrevMonth = `${lastDayPrevMonth.slice(0, 8)}01`;
      return {
        first: firstDayPrevMonth,
        last: lastDayPrevMonth,
      };
    },
    // Встановлює дати в необхідному кварталі
    setQuartal(quartal, year) {
      let rightQuartal = quartal.split('_')[0];
      let allQuartals = {
        first: { first: year + '-1-1', last: year + '-3-31' },
        second: { first: year + '-4-1', last: year + '-6-30' },
        third: { first: year + '-7-1', last: year + '-9-30' },
        fourth: { first: year + '-10-1', last: year + '-12-31' },
        year: { first: year + '-1-1', last: year + '-12-31' },
      };
      let result;
      let cvartalToday = '';
      if (this.limits) {
        cvartalToday = this.limits.max;
      } else {
        cvartalToday = allQuartals[rightQuartal].last;
      }

      if (!this.dateComparing) {
        result = {
          pr1: allQuartals[rightQuartal].first,
          pr2: this.minDate(allQuartals[rightQuartal].last, cvartalToday),
        };
      } else {
        result = {
          cpr1: allQuartals[rightQuartal].first,
          cpr2: this.minDate(allQuartals[rightQuartal].last, cvartalToday),
        };
      }
      this.activeIndex = { name: quartal, year: year };
      this.$emit('setDate', result);
    },
    minDate(a, b) {
      return new Date(a) < new Date(b) ? a : b;
    },
    // Генерує об'єкти кварталів для виводу блоків
    CvartalLabel() {
      const currentDate = this.today();
      const currentYear = parseInt(currentDate.slice(0, 4));
      const currentMonth = parseInt(currentDate.slice(5, 7));
      const lastYear = currentYear - 1;
      this.activeYear.year = currentYear;
      this.activeYear.key = 'year';

      let objLabels = {
        year: { label: 'Рік', year: currentYear, items: {} },
        lastYear: { label: 'Рік', year: lastYear, items: {} },
      };

      let cvartalObj = [
        { start: 1, name: 'first', label: '1 квартал' },
        { start: 4, name: 'second', label: '2 квартал' },
        { start: 7, name: 'third', label: '3 квартал' },
        { start: 10, name: 'fourth', label: '4 квартал' },
        { start: 1, name: 'year', label: 'Весь рік' },
      ];

      cvartalObj.forEach((item) => {
        if (item.start <= currentMonth) {
          objLabels.year.items[item.name] = { year: currentYear, label: item.label };
        }
        objLabels.lastYear.items[item.name] = { year: lastYear, label: item.label };
      });
      return objLabels;
    },
    chooseYear(year, key) {
      this.activeYear.year = year;
      this.activeYear.key = key;
    },
    getRoundedClass(index) {
      if (this.activeYear.key === this.quartals[index].year) return '';
      if (index == 'year') return 'left-radius';
      if (index == 'lastYear') return 'right-radius';
      return 'full-radius';
    },
    checkThisLastMonth() {
      return (
        this.lastSelectedRange.start === this.thisLastMonth().first &&
        this.lastSelectedRange.end === this.thisLastMonth().last
      );
    },
    checkAlltime() {
      return !this.lastSelectedRange.start && !this.lastSelectedRange.end;
    },
  },
};
</script>

<style>
.vfc-top-date {
  padding-top: 10px;
  margin-bottom: 20px;
}

.vfc-cursor-pointer {
  color: #003d62 !important;
  border-radius: 0.25rem !important;
  text-decoration: none !important;
}

.vfc-cursor-pointer:hover {
  transition: 0.3s;
  color: #5fc4e0 !important;
}

.vfc-cursor-pointer:hover > div {
  border-color: rgb(50, 50, 50) !important;
  transition: 0.3s;
}

.vfc-separately-navigation-buttons > div {
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.vfc-arrow-right,
.vfc-arrow-left {
  border-color: #6e6e6e !important;
  height: 10px !important;
  width: 10px !important;
  margin: 0px !important;
}

.vfc-arrow-right {
  position: relative;
  right: 2.5px;
}

.vfc-arrow-left {
  position: relative;
  left: 2.5px;
}

.vfc-separately-navigation-buttons > div:hover {
  background: rgb(241, 241, 241) !important;
}

.vfc-marked {
  color: white !important;
}

.vfc-end-marked,
.vfc-start-marked {
  background: #8fd8ec !important;
}

.vfc-hide {
  color: #919191 !important;
}

.selectedRangeWraper {
  background-color: #8fd8ec;
  padding: 5px;
  border-radius: 0.25rem;
  color: white !important;
}

.datefilter {
  list-style: none;
  padding-left: unset;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.vfc-main-container.vfc-modal {
  width: inherit !important;
  min-width: 266px !important;
}

@media screen and (max-width: 450px) {
  .datefilter {
    justify-content: flex-start;
  }
  .datebutton {
    margin: 0 5px;
  }
}

.footerCon {
  margin: unset !important;
  padding: 20px 10px;
  border-top: 1px solid #cdcdce;
  flex-direction: column;
}

.datepicker .vfc-main-container {
  font-family: inherit;
}

.datepicker .vfc-main-container.vfc-modal {
  left: 0;
  right: 0;
  top: 50px;
  max-width: 550px !important;
}
</style>
<style scoped>
.overlay {
  display: flex;
  height: 38px;
  border: none;
  border-radius: 5px;
  padding: 0 10px;
  padding-left: 2px;
  column-gap: 5px;
  cursor: pointer;
}

.calendarLabel {
  line-height: 1;
  position: relative;
  font-weight: 500;
  font-size: 12pt;
  border: none;
  padding: unset;
  background-color: unset;
  white-space: nowrap;
  color: inherit;
}

.overlay .icon {
  display: flex;
  align-items: center;
  width: 22px;
}

.calendar-icon {
  color: #333;
  flex-shrink: 0;
}

.calendar-icon--muted {
  color: #b4b4b4;
}

.hf-check .calendarLabel {
  color: #b4b4b4;
}

.hf-check .calendar-icon {
  color: #b4b4b4;
}

.datepicker-range-footer {
  display: flex;
  justify-content: flex-end;
}

.datepicker-range-footer-button {
  display: flex;
  align-items: center;
  padding-right: 15px;
  padding-bottom: 0;
  margin: 0 0 0 10px;
  text-transform: uppercase;
  font-weight: 500;
  cursor: pointer;
}

.footer-button-clear {
  color: #dc3545;
}

.datebutton {
  font-size: 13px;
  text-transform: uppercase;
  font-weight: 500;
  color: #003d62;
  cursor: pointer;
}

.datebutton:hover {
  color: #5fc4e0;
}

.footer-button-clear-disabled {
  color: #dddddd;
  cursor: default;
}

.footer-button-save {
  color: #28a745;
}

@media only screen and (max-width: 660px) {
  .datepicker-range-footer-button {
    font-size: 10pt;
    padding-right: unset;
  }
}
</style>

<style scoped>
.quartalsBlock {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  flex-wrap: wrap;
  background-color: #f7f7fb;
  border-radius: 0px 8px 8px 8px;
  padding: 15px;
  margin-bottom: 10px;
}

.quartalButton {
  display: flex;
  align-items: center;
  padding: 7px;
  box-shadow: 0px 0px 6px #80808059;
  border-radius: 10px;
  border: 1px solid transparent;
  margin: 3px 3px 3px 3px;
  font-size: small;
  justify-content: center;
  flex: 1 1 auto;
  cursor: pointer;
}

.quartalLabel {
  margin-bottom: 0px !important;
  margin-right: 5px;
}

.quartalYear {
  margin-bottom: 0;
}

.quartalButton.selectedQuartal {
  border: 1px solid #28a745;
}

.yearBlock {
  width: fit-content;
}

.activeYear {
  padding: 9px 26px;
  background-color: #f7f7fb;
  border-radius: 12px 12px 0 0;
  gap: 10px;
}

.nonActiveYear {
  padding: 5px 26px;
  gap: 10px;
  background-color: #eeeef5;
  position: relative;
  height: fit-content;
  top: 7px;
  color: #91919f;
}

.full-radius {
  border-radius: 12px 12px 0 0;
}

.left-radius {
  border-radius: 12px 0 0 0;
}

.right-radius {
  border-radius: 0 12px 0 0;
}

.no-radius {
  border-radius: 0;
}
</style>
