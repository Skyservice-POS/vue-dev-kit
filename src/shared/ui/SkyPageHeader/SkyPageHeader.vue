<template>
  <div class="sky-page-header" :class="`sky-page-header--${position}`">
    <div v-if="title || description" class="sky-page-header-titles">
      <span v-if="title" class="sky-page-header-title">{{ title }}</span>
      <span v-if="description" class="sky-page-header-description">{{ description }}</span>
    </div>
    <div v-if="$slots.header" class="sky-page-header-extra">
      <slot name="header" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  position: {
    type: String,
    default: 'bottom',
    validator: (v) => ['bottom', 'side'].includes(v),
  },
});
</script>

<style scoped>
.sky-page-header {
  width: 100%;
  box-sizing: border-box;
  padding: 1.5rem 0;
}

.sky-page-header-extra {
  margin-top: var(--sky-page-header-gap, 1rem);
}

.sky-page-header--side {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
}

.sky-page-header--side .sky-page-header-extra {
  margin-top: 0;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sky-page-header-titles {
  display: flex;
  flex-direction: column;
}

.sky-page-header-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.75rem;
  letter-spacing: 0.01em;
  color: var(--sky-page-header-title-color, #09090b);
}

.sky-page-header-description {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: var(--sky-page-header-description-color, #6b7280);
}

@media screen and (max-width: 450px) {
  .sky-page-header-title {
    font-size: 1.1rem;
    line-height: 1.5rem;
  }

  .sky-page-header-description {
    font-size: 0.8rem;
  }
}
</style>
