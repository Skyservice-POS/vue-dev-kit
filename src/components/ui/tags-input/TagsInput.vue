<template>
  <div class="tags-input">
    <slot></slot>
  </div>
</template>

<script>
  export default {
    name: 'TagsInput',
    provide() {
      return {
        tagsInputProvider: {
          registerInput: this.registerInput,
          addTag: this.addTag,
          removeTag: this.removeTag,
          tags: () => this.tags,
        },
      };
    },
    props: {
      value: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        tags: this.value,
        inputComponent: null,
      };
    },
    watch: {
      value(newVal) {
        this.tags = newVal;
      },
      tags(newVal) {
        this.$emit('input', newVal);
      },
    },
    methods: {
      registerInput(component) {
        this.inputComponent = component;
      },
      addTag(tag) {
        if (tag && tag.trim() && !this.tags.includes(tag.trim())) {
          this.tags = [...this.tags, tag.trim()];
        }
      },
      removeTag(tag) {
        this.tags = this.tags.filter(t => t !== tag);
      },
    },
  };
</script>

<style>
  .tags-input {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    width: 100%;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
    background-color: transparent;
    padding: 8px 12px;
    font-size: 14px;
  }

  .tags-input:focus-within {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
</style>
