<template>
  <span class="tags-input-item-text">{{ value }}</span>
</template>

<script>
  export default {
    name: 'TagsInputItemText',
    inject: ['tagItem'],
    computed: {
      value() {
        return this.tagItem.value;
      },
    },
  };
</script>

<style>
  .tags-input-item-text {
    font-size: 14px;
  }
</style>
