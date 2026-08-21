<script setup>
defineProps({
  // Маленький підпис над сценою (напр. назва стану/варіанта)
  title: { type: String, default: '' },
  // Розкладати вміст у колонку замість рядка
  column: { type: Boolean, default: false },
  // Темна сцена (для компонентів, які тестуються на темному фоні, напр. SkyLoader)
  dark: { type: Boolean, default: false },
  // Прибрати внутрішні відступи сцени (для повноширинних компонентів, напр. Header)
  flush: { type: Boolean, default: false },
})
</script>

<template>
  <div class="vdk-demo">
    <div v-if="title" class="vdk-demo__label">{{ title }}</div>
    <div
      class="vdk-demo__stage"
      :class="{
        'vdk-demo__stage--column': column,
        'vdk-demo__stage--dark': dark,
        'vdk-demo__stage--flush': flush,
      }"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
.vdk-demo {
  margin: 16px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg);
}

.vdk-demo__label {
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}

.vdk-demo__stage {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background:
    linear-gradient(var(--vp-c-bg-soft), var(--vp-c-bg-soft)) padding-box;
}

.vdk-demo__stage--column {
  flex-direction: column;
  align-items: stretch;
}

.vdk-demo__stage--dark {
  background: #1f2937;
}

.vdk-demo__stage--flush {
  padding: 0;
  display: block;
}
</style>
