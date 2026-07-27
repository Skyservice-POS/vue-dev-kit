<template>
  <input
    ref="inputRef"
    type="text"
    :placeholder="placeholder"
    @keydown.enter.prevent="addTag"
    @keydown.backspace="handleBackspace"
    v-model="inputValue"
    class="tags-input-input"
  />
</template>

<script>
  export default {
    name: 'TagsInputInput',
    inject: ['tagsInputProvider'],
    props: {
      placeholder: {
        type: String,
        default: 'Add item...',
      },
    },
    data() {
      return {
        inputValue: '',
      };
    },
    mounted() {
      this.tagsInputProvider.registerInput(this);
    },
    methods: {
      addTag() {
        if (this.inputValue.trim()) {
          this.tagsInputProvider.addTag(this.inputValue);
          this.inputValue = '';
        }
      },
      handleBackspace(_e) {
        if (this.inputValue === '' && this.tagsInputProvider.tags().length > 0) {
          const lastTag = this.tagsInputProvider.tags()[this.tagsInputProvider.tags().length - 1];
          this.tagsInputProvider.removeTag(lastTag);
        }
      },
      focus() {
        this.$refs.inputRef.focus();
      },
    },
  };
</script>

<style>
  .tags-input-input {
    flex: 1;
    background-color: transparent;
    outline: none;
    border: none;
    min-width: 80px;
    height: 28px;
    font-size: 14px;
  }

  .tags-input-input::placeholder {
    color: #94a3b8;
  }
</style>
