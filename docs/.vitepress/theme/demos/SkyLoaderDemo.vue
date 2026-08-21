<script setup>
import SkyLoader from '@/shared/ui/SkyLoader/SkyLoader.vue'
</script>

<template>
  <Demo title="У позиціонованому контейнері">
    <div class="vdk-loader-box">
      <SkyLoader />
    </div>
    <div class="vdk-loader-box">
      <SkyLoader text="Завантаження…" />
    </div>
    <div class="vdk-loader-box vdk-loader-box--dark">
      <SkyLoader text="На темному фоні" />
    </div>
  </Demo>
</template>

<style scoped>
.vdk-loader-box {
  position: relative;
  flex: 1 1 200px;
  min-width: 180px;
  height: 200px;
  background: var(--vp-c-bg);
  border: 1px dashed var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}
.vdk-loader-box--dark {
  background: #1f2937;
  border-color: #374151;
}
</style>
