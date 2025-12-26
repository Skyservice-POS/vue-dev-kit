<template>
  <teleport :to="to">
    <slot />
  </teleport>
</template>

<script>
export default {
  props: {
    to: {
      type: String,
      default: 'body',
    },
  },
}
</script>
