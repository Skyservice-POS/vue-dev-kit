<template>
  <div
    class="tags-container item-inner custom-input"
    :style="
      !params.style
        ? `cursor: pointer; flex: ${widthFlex};`
        : params.style(item[params['name']], item) + `cursor: pointer; flex: ${widthFlex};`
    "
  >
    <TagsInput v-model="item.tags" class="tags-input">
      <TagsInputItem v-for="tag in item.tags" :key="tag" :value="tag">
        <TagsInputItemText />
        <TagsInputItemDelete @click="$emit('deleteTag', tag)" />
      </TagsInputItem>
      <svg
        v-if="item.tags.length != 2"
        class="add-tag-icon"
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="black"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        @click="$emit('openTagsModal')"
      >
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </svg>
    </TagsInput>
  </div>
</template>

<script>
  import { TagsInputItem, TagsInputItemText, TagsInputItemDelete, TagsInput } from '@/components/ui/tags-input';
  export default {
    components: {
      TagsInput,
      TagsInputItem,
      TagsInputItemText,
      TagsInputItemDelete,
    },
    props: {
      index: {
        type: Number,
        default: null,
      },
      params: {
        type: Object,
        default: () => ({}),
      },
      item: {
        type: Object,
        default: () => ({}),
      },
      widthFlex: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        editMode: false,
        lastValue: null,
        enterPressed: false,
      };
    },
    methods: {
      editInputFocus() {
        if (this.params.emit) {
          if (this.params.name === 'markup') {
            if (!+this.item.cost) {
              this.$emit(this.params.emit, this.item);
              return;
            }
          } else {
            this.$emit(this.params.emit, this.item);
            return;
          }
        }
        this.editMode = true;
        this.lastValue = this.item[this.params.name];
        this.$nextTick(() => {
          this.$refs.inputElem.focus();
        });
      },
      editInputBlur() {
        this.editMode = false;
        this.$nextTick(() => (this.enterPressed = false));
        if (this.lastValue != this.item[this.params.name]) {
          this.$emit('inputEdit', this.lastValue);
        }
      },
      open() {
        this.$emit('open');
      },
    },
  };
</script>

<style scoped>
  .item-inner {
    padding: 0.375rem 1.2rem 0.375rem 0.5rem;
    display: flex;
    column-gap: 5px;
    align-items: center;
  }

  .tags-container {
    width: 100%;
    max-width: 260px;
  }

  .tags-input {
    border: none;
    padding: 0;
    max-height: 48px;
    min-height: 30px;
    overflow-y: auto;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
    color: black;
  }

  :deep(.delete-icon) {
    color: #334155;
  }

  .add-tag-icon {
    margin: 6px 0;
    cursor: pointer;
    flex-shrink: 0;
  }

  .tags-list {
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .tags-list li:last-child {
    border-bottom: none;
  }
</style>
