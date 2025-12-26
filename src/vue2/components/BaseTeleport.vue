<template>
  <portal :to="to">
    <slot />
  </portal>
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
