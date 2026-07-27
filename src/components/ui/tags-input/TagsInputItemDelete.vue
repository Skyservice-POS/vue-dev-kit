<template>
  <button type="button" @click="handleClick" class="tags-input-item-delete">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="delete-icon"
    >
      <path d="M18 6 6 18"></path>
      <path d="m6 6 12 12"></path>
    </svg>
    <span class="sr-only">Remove</span>
  </button>
</template>

<script>
  export default {
    name: 'TagsInputItemDelete',
    inject: ['tagItem'],
    props: {
      useCustomHandler: {
        type: Boolean,
        default: false,
      },
    },
    methods: {
      remove() {
        this.tagItem.remove();
      },
      handleClick(event) {
        // First emit the click event so parent components can catch it
        this.$emit('click', event);

        // Only perform the default remove action if not using custom handler
        if (!this.useCustomHandler) {
          this.remove();
        }
      },
    },
  };
</script>

<style>
  .tags-input-item-delete {
    display: flex;
    height: 16px;
    width: 16px;
    align-items: center;
    justify-content: center;
    border-radius: 2px;
    opacity: 0.7;
    transition: opacity 0.2s;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  .tags-input-item-delete:hover {
    opacity: 1;
  }

  .tags-input-item-delete:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

  .delete-icon {
    stroke: currentColor;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
</style>
