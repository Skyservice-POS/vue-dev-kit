<template>
  <div class="sky-card-header-content">
    <div v-if="$slots.icon || iconSrc" class="sky-card-header-icon">
      <slot name="icon">
        <img v-if="iconSrc" :src="iconSrc" :alt="title" width="48" height="48" />
      </slot>
    </div>
    <div class="sky-card-header-titles">
      <h3 class="sky-card-header-title">{{ title }}</h3>
      <p v-if="subtitle" class="sky-card-header-subtitle">{{ subtitle }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  iconSrc: { type: String, default: '' },
});
</script>

<style scoped>
.sky-card-header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.sky-card-header-icon {
  width: var(--sky-card-icon-size, 64px);
  height: var(--sky-card-icon-size, 64px);
  border-radius: var(--sky-card-icon-radius, 12px);
  background: var(--sky-card-icon-bg, #00c279);
  color: var(--sky-card-icon-color, #fff);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sky-card-header-titles {
  flex: 1;
  min-width: 0;
}

.sky-card-header-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sky-card-header-subtitle {
  font-size: 13px;
  color: #666;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (min-width: 1180px) and (max-width: 1430px) {
  .sky-card-header-icon {
    width: 55px;
    height: 55px;
  }
  .sky-card-header-title {
    font-size: 1.1rem;
  }
}

@media (max-width: 1180px) {
  .sky-card-header-title {
    font-size: 1.1rem;
  }
}

@media (max-width: 900px) {
  .sky-card-header-title {
    font-size: 1rem;
  }
}

@media (max-width: 500px) {
  .sky-card-header-icon {
    width: 48px;
    height: 48px;
    border-radius: 8px;
  }
  .sky-card-header-title {
    font-size: 17px;
  }
}
</style>
