<script setup lang="ts">
/**
 * Календар із DatePickerRange Dashboard (`/img/calendar.svg`). Колір — `currentColor`,
 * тож відкритий стан (сірий, як `calendarGrey.svg`) задає тригер.
 */
withDefaults(defineProps<{ size?: number }>(), { size: 22 });
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
    <path
      d="M5 4.5a.5.5 0 0 1-.5-.5V2a.5.5 0 0 1 1 0v2a.5.5 0 0 1-.5.5zM11 4.5a.5.5 0 0 1-.5-.5V2a.5.5 0 0 1 1 0v2a.5.5 0 0 1-.5.5z"
    />
    <path
      d="M13 14.5H3c-.827 0-1.5-.673-1.5-1.5V4c0-.827.673-1.5 1.5-1.5h10c.827 0 1.5.673 1.5 1.5v9c0 .827-.673 1.5-1.5 1.5zM3 3.5a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V4a.5.5 0 0 0-.5-.5H3z"
    />
    <path
      d="M14 6.5H2a.5.5 0 0 1 0-1h12a.5.5 0 0 1 0 1zM5.5 7.5h1v1h-1zM7.5 7.5h1v1h-1zM9.5 7.5h1v1h-1zM11.5 7.5h1v1h-1zM3.5 9.5h1v1h-1zM5.5 9.5h1v1h-1zM7.5 9.5h1v1h-1zM9.5 9.5h1v1h-1zM11.5 9.5h1v1h-1zM3.5 11.5h1v1h-1zM5.5 11.5h1v1h-1zM7.5 11.5h1v1h-1z"
    />
  </svg>
</template>
