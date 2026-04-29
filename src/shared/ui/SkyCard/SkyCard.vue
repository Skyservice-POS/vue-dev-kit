<template>
  <div class="sky-card">
    <div v-if="$slots.ribbon" class="sky-card-ribbon">
      <slot name="ribbon" />
    </div>
    <div v-if="$slots.header" class="sky-card-header">
      <slot name="header" />
    </div>
    <div v-if="$slots.default" class="sky-card-body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="sky-card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
// Slot-only shell. See SkyCardHeader, SkyCardRow, SkyBadge, SkyAlert
// for recommended building blocks.
</script>

<style scoped>
.sky-card {
  position: relative;
  background: var(--sky-card-bg, #fff);
  border-radius: var(--sky-card-radius, 12px);
  box-shadow: var(--sky-card-shadow, 0 1px 12px rgba(0, 0, 0, 0.1));
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.sky-card-ribbon {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: var(--sky-card-ribbon-bg, #e65100);
  color: var(--sky-card-ribbon-color, #fff);
  text-align: center;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
  z-index: 1;
}

.sky-card-header {
  padding: var(--sky-card-padding-header, 24px 24px 0);
}

.sky-card-body {
  padding: var(--sky-card-padding-body, 10px 24px 15px);
  flex: 1;
}

.sky-card-footer {
  display: flex;
  gap: 10px;
  padding: var(--sky-card-padding-footer, 0 24px 24px);
  margin-top: auto;
}

@media (min-width: 1180px) and (max-width: 1430px) {
  .sky-card-header {
    padding: var(--sky-card-padding-header-md, 16px 16px 0);
  }
  .sky-card-body {
    padding: var(--sky-card-padding-body-md, 10px 16px 15px);
  }
  .sky-card-footer {
    padding: var(--sky-card-padding-footer-md, 0 16px 16px);
  }
}

@media (max-width: 500px) {
  .sky-card-header {
    padding: var(--sky-card-padding-header-sm, 9px 15px);
  }
  .sky-card-body {
    padding: var(--sky-card-padding-body-sm, 10px 15px 15px);
  }
  .sky-card-footer {
    padding: var(--sky-card-padding-footer-sm, 0 15px 15px);
    flex-direction: column;
  }
}
</style>
