<template>
  <div class="sky-tile-card">
    <div v-if="$slots.icon || imageUrl" class="sky-tile-card-icon">
      <slot name="icon">
        <img v-if="imageUrl" :src="imageUrl" :alt="title" />
      </slot>
    </div>
    <div class="sky-tile-card-body">
      <h3 class="sky-tile-card-title">{{ title }}</h3>
      <p v-if="subtitle" class="sky-tile-card-subtitle">{{ subtitle }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
});
</script>

<style scoped>
.sky-tile-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--sky-tile-bg, #fff);
  border-radius: var(--sky-tile-radius, 12px);
  box-shadow: var(--sky-tile-shadow, 0 1px 12px rgba(0, 0, 0, 0.08));
}

.sky-tile-card-icon {
  width: var(--sky-tile-icon-size, 56px);
  height: var(--sky-tile-icon-size, 56px);
  border-radius: var(--sky-tile-icon-radius, 12px);
  background: var(--sky-tile-icon-bg, #00c279);
  color: var(--sky-tile-icon-color, #fff);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.sky-tile-card-icon img {
  width: 60%;
  height: 60%;
  object-fit: contain;
}

.sky-tile-card-body {
  flex: 1;
  min-width: 0;
}

.sky-tile-card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--sky-tile-title-color, #1a1a1a);
  margin: 0;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sky-tile-card-subtitle {
  font-size: 13px;
  color: var(--sky-tile-subtitle-color, #666);
  margin: 4px 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 500px) {
  .sky-tile-card {
    padding: 12px;
    gap: 12px;
  }
  .sky-tile-card-icon {
    width: 48px;
    height: 48px;
    border-radius: 8px;
  }
}
</style>
