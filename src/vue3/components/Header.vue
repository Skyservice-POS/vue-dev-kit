<template>
  <header class="sky-header-container">
    <div class="topmenubox">
      <div class="header-left">
        <button
          v-if="shouldShowBackButton"
          class="btn-back"
          @click="handleBack"
          :title="backButtonTitle"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 451.847 451.847"
            style="transform: rotate(90deg)"
          >
            <path
              fill="currentColor"
              d="M225.923,354.706c-8.098,0-16.195-3.092-22.369-9.263L9.27,151.157c-12.359-12.359-12.359-32.397,0-44.751c12.354-12.354,32.388-12.354,44.748,0l171.905,171.915l171.906-171.909c12.359-12.354,32.391-12.354,44.744,0c12.365,12.354,12.365,32.392,0,44.751L248.292,345.449C242.115,351.621,234.018,354.706,225.923,354.706z"
            />
          </svg>
        </button>
        <div ref="dropdownRef" class="titleAndDesc">
          <button
            class="title-dropdown-toggle"
            :class="{ 'title-dropdown-toggle-active': sortedItems.length }"
            @click="toggleDropdown"
          >
            <slot name="title">
              <h4 class="notPadding" style="margin-bottom: 4px">
                <span class="topmenu-title">{{ title }}</span>
                <svg
                  v-if="sortedItems.length"
                  class="arrow"
                  :class="{ open: isDropdownOpen }"
                  width="12"
                  height="12"
                  viewBox="0 0 451.847 451.847"
                  style="flex-shrink: 0"
                >
                  <path
                    fill="currentColor"
                    d="M225.923,354.706c-8.098,0-16.195-3.092-22.369-9.263L9.27,151.157c-12.359-12.359-12.359-32.397,0-44.751c12.354-12.354,32.388-12.354,44.748,0l171.905,171.915l171.906-171.909c12.359-12.354,32.391-12.354,44.744,0c12.365,12.354,12.365,32.392,0,44.751L248.292,345.449C242.115,351.621,234.018,354.706,225.923,354.706z"
                  />
                </svg>
              </h4>
            </slot>
          </button>
          <div v-if="isDropdownOpen && sortedItems.length" class="title-dropdown">
            <div class="title-dropdown-header">{{ dropdownTitle }}</div>
            <div class="title-dropdown-divider"></div>
            <div
              v-for="(item, index) in sortedItems"
              :key="index"
              class="title-dropdown-item"
              @click="selectItem(item)"
            >
              <p class="pageName">{{ capitalize(item.name) }}</p>
              <small class="pageVisit">
                ({{ visitLabel }} {{ getTimeAgo(item.lastVisit) }})
              </small>
            </div>
          </div>
          <slot name="subtitle">
            <p v-if="subtitle" class="topmenu-description">{{ subtitle }}</p>
          </slot>
        </div>
      </div>

      <div class="topmenubox-button">
        <!-- Порожні блоки ремонтують відображення на windows в додатку, не видаляти! -->
        <div></div>
        <slot></slot>
        <div></div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { isInIframe } from '../../shared/utils/webviewCheck'
import { getParentLocalStorage } from '../../shared/utils/parentBridge'

const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  subtitle: {
    type: String,
    default: "",
  },
  showBackButton: {
    type: Boolean,
    default: true,
  },
  backButtonTitle: {
    type: String,
    default: "Назад",
  },
  backEvent: {
    type: Function,
    default: null,
  },
  dropdownItems: {
    type: Array,
    default: () => [],
  },
  dropdownTitle: {
    type: String,
    default: "Останні відвідані розділи",
  },
  visitLabel: {
    type: String,
    default: "Останнє відвідування",
  },
});

const emit = defineEmits(['back', 'navigate'])

const dropdownRef = ref(null)
const isDropdownOpen = ref(false)

const localStorageItems = ref([])

function loadComponentStats(raw) {
  try {
    if (!raw) return
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (data?.pages) {
      localStorageItems.value = Object.values(data.pages)
    }
  } catch {}
}

// Load from local localStorage first
loadComponentStats(localStorage['componentStats'])

// If in iframe, request from parent and update
if (isInIframe()) {
  getParentLocalStorage('componentStats').then((data) => {
    if (data != null) {
      localStorage.setItem('componentStats', JSON.stringify(data))
      loadComponentStats(data)
    }
  })
}

const sortedItems = computed(() => {
  const items = props.dropdownItems.length ? props.dropdownItems : localStorageItems.value
  return [...items].sort((a, b) => b.lastVisit - a.lastVisit)
})

const toggleDropdown = () => {
  if (sortedItems.value.length) {
    isDropdownOpen.value = !isDropdownOpen.value
  }
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}

const selectItem = (item) => {
  emit('navigate', item.path)
  if (isInIframe()) {
    window.parent.postMessage({ type: 'navigate', path: item.path }, '*')
  }
  closeDropdown()
}

const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const getTimeAgo = (lastVisit) => {
  const now = Date.now()
  const diff = now - lastVisit

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}д тому`
  if (hours > 0) return `${hours}год тому`
  if (minutes > 0) return `${minutes}хв тому`
  return `${seconds}с тому`
}

const handleClickOutside = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true)
})

// Показуємо кнопку якщо є backEvent АБО (showBackButton=true І сторінка в iframe)
const shouldShowBackButton = computed(() => {
  return props.backEvent || (props.showBackButton && isInIframe());
});

const handleBack = () => {
  if (props.backEvent) return props.backEvent()

  window.parent.postMessage({ type: 'exit' }, '*')
}
</script>

<style scoped>
.sky-header-container {
  width: 100%;
  min-height: var(--sky-header-min-height, 82px);
  background-color: var(--sky-header-bg, transparent);
  display: flex;
  flex-direction: row;
  padding: var(--sky-header-padding, 10px);
  border-bottom: 1px solid var(--sky-header-border-color, #dee2e6);
  z-index: var(--sky-header-z-index, 4);
  position: relative;
}

.topmenubox {
  width: 100%;
  display: flex;
  padding: 4px;
  justify-content: space-between;
  align-items: center;
  background-color: transparent;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.titleAndDesc {
  display: flex;
  flex-direction: column;
  position: relative;
}

.notPadding {
  margin: 0;
  padding: 0;
  font-size: var(--sky-header-title-size, 18px);
  font-weight: var(--sky-header-title-weight, 500);
  color: var(--sky-header-title-color, #252525);
  line-height: 1.5;
  user-select: none;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
}

.topmenu-title {
  white-space: pre-line;
}

.title-dropdown-toggle {
  display: flex;
  flex-direction: row;
  padding: 0;
  margin: 0;
  background: transparent;
  border: none;
  text-align: left;
  font: inherit;
  color: inherit;
}

.title-dropdown-toggle-active {
  cursor: pointer;
}

.arrow {
  width: 12px;
  position: relative;
  margin-left: 5px;
  flex-shrink: 0;
  transition: transform 0.25s ease;
  color: var(--sky-header-title-color, #252525);
}

.arrow.open {
  transform: rotate(180deg);
}

.title-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 240px;
  background: white;
  border-radius: 5px;
  box-shadow: 0 1px 12px rgba(0, 0, 0, 0.1);
  border: none;
  z-index: 10;
  padding: 4px 0;
  margin-top: 4px;
}

.title-dropdown-header {
  padding: 4px 24px;
  font-size: 13px;
  color: #6c757d;
}

.title-dropdown-divider {
  height: 0;
  margin: 4px 0;
  border-top: 1px solid #e9ecef;
}

.title-dropdown-item {
  padding: 4px 24px;
  cursor: pointer;
  transition: background-color 0.1s;
}

.title-dropdown-item:hover {
  background-color: #f8f9fa;
}

.title-dropdown-item:active {
  background-color: #e9ecef;
}

.pageName {
  padding-bottom: 0;
  margin: 0;
  font-weight: 500;
  font-size: 14px;
}

.pageVisit {
  color: gray;
  font-weight: 400;
  font-size: 11px;
}

.topmenu-description {
  margin: 0;
  margin-bottom: 5px;
  color: var(--sky-header-subtitle-color, #5d5d5d);
  font-size: 13px;
  font-weight: 400;
  line-height: 1.5;
}

.topmenubox-button {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.btn-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s;
  color: var(--sky-header-back-btn-color, #374151);
}

.btn-back img,
.btn-back svg {
  display: block;
}

.btn-back:hover {
  background-color: var(--sky-header-back-btn-hover-bg, #f8f9fa);
}

.btn-back:active {
  background-color: var(--sky-header-back-btn-active-bg, #e9ecef);
}

/* Responsive: <500px — hide description, smaller title */
@media (max-width: 499px) {
  .topmenu-description {
    display: none;
  }
  .notPadding {
    font-size: 13px;
  }
}

/* Responsive: 500-1099px — smaller description */
@media (min-width: 500px) and (max-width: 1099px) {
  .topmenu-description {
    font-size: 11px;
  }
}

/* iOS safe area */
@supports (padding-top: env(safe-area-inset-top)) {
  .sky-header-container {
    padding-top: calc(10px + env(safe-area-inset-top));
  }
}
</style>
