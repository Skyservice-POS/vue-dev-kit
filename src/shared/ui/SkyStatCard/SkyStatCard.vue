<template>
  <div
    class="sky-stat-card"
    :class="{ 'sky-stat-card--clickable': clickable }"
    :role="clickable ? 'button' : undefined"
    :tabindex="clickable ? 0 : undefined"
    @click="onClick"
    @keydown.enter.prevent="onClick"
    @keydown.space.prevent="onClick"
  >
    <div v-if="$slots.icon || iconSrc" class="sky-stat-card-icon">
      <slot name="icon">
        <img v-if="iconSrc" :src="iconSrc" alt="" />
      </slot>
    </div>
    <div class="sky-stat-card-content">
      <h4 class="sky-stat-card-title">{{ title }}</h4>
      <span class="sky-stat-card-value">
        <slot>{{ value }}</slot>
      </span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: { type: String, default: '' },
  value: { type: [String, Number], default: '' },
  iconSrc: { type: String, default: '' },
  clickable: { type: Boolean, default: false },
});

const emit = defineEmits(['click']);

function onClick(event) {
  if (props.clickable) emit('click', event);
}
</script>

<style scoped>
.sky-stat-card {
  display: flex;
  gap: 15px;
  min-width: 0;
  box-sizing: border-box;
  padding: 20px 10px 20px 20px;
  border: 1px solid var(--sky-stat-card-border, #ededed);
  background: var(--sky-stat-card-bg, #fff);
  border-radius: 12px;
  box-shadow: 0 1px 12px rgba(0, 0, 0, 0.1);
}

.sky-stat-card--clickable {
  cursor: pointer;
  transition: box-shadow 0.3s ease-in-out;
}

.sky-stat-card--clickable:hover {
  box-shadow: 0 1px 16px rgba(0, 0, 0, 0.245);
}

.sky-stat-card--clickable:focus-visible {
  outline: 2px solid var(--sky-stat-card-focus, #4318ff);
  outline-offset: 2px;
}

.sky-stat-card-icon {
  height: 100%;
  max-height: 64px;
  align-self: center;
  background: var(--sky-stat-card-icon-bg, #f4f7fe);
  border-radius: 12px;
  padding: 10px;
  display: flex;
  border: 1px solid var(--sky-stat-card-icon-border, #e1eaff);
}

.sky-stat-card-icon img {
  height: 100%;
}

.sky-stat-card-content {
  min-width: 0;
}

.sky-stat-card-title {
  display: block;
  margin: 0;
  color: var(--sky-stat-card-title-color, #a3aed0);
  font-weight: 500;
  font-size: 14px;
  line-height: 24px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sky-stat-card-value {
  display: block;
  color: var(--sky-stat-card-value-color, #1b2559);
  font-weight: 700;
  font-size: 18px;
  line-height: 30px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 700px) {
  .sky-stat-card {
    padding: 10px;
    gap: 10px;
  }
  .sky-stat-card-icon {
    padding: 7px;
    max-height: 46px;
  }
  .sky-stat-card-title {
    line-height: 16px;
  }
  .sky-stat-card-value {
    font-weight: 600;
    font-size: 16px;
    line-height: 20px;
  }
}

@media (max-width: 450px) {
  .sky-stat-card-icon {
    padding: 5px;
    max-height: 30px;
  }
  .sky-stat-card-value {
    font-weight: 500;
    font-size: 13px;
  }
}

@media (max-width: 374px) {
  .sky-stat-card-icon {
    display: none;
  }
}
</style>
