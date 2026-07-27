<template>
  <div class="tags-input-item">
    <slot></slot>
  </div>
</template>

<script>
  export default {
    name: 'TagsInputItem',
    inject: ['tagsInputProvider'],
    props: {
      value: {
        type: String,
        required: true,
      },
    },
    provide() {
      return {
        tagItem: {
          value: this.value,
          remove: this.remove,
        },
      };
    },
    methods: {
      remove() {
        this.tagsInputProvider.removeTag(this.value);
      },
    },
  };
</script>

<style>
  .tags-input-item {
    display: flex;
    height: 28px;
    align-items: center;
    gap: 4px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
    background-color: #f1f5f9;
    padding: 0 8px;
    color: #334155;
  }
</style>
