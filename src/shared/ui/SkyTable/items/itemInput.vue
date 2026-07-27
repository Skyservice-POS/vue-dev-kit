<template>
  <div
    v-if="editMode === false"
    class="item-inner custom-input"
    :class="{ 'hidden-item': item[params.name] === undefined }"
    :style="
      !params.style
        ? `cursor: pointer; flex: ${widthFlex};`
        : params.style(item[params['name']], item) + `cursor: pointer; flex: ${widthFlex};`
    "
    @click="params.inputEnabled ? editInputFocus() : null"
    @mousedown="params.inputEnabled ? null : open()"
    v-html="params.mutate ? params.mutate(item[params['name']], item) : item[params.name]"
  />
  <input
    v-else
    ref="inputElem"
    v-model="item[params.name]"
    type="number"
    class="form-control input custom-input"
    :class="{ 'hidden-item': item[params.name] === undefined }"
    :style="{ flex: widthFlex }"
    @keyup.enter="
      enterPressed = true;
      editInputBlur();
    "
    @blur="enterPressed ? null : editInputBlur()"
  />
</template>

<script>
  export default {
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
  .input.custom-input {
    margin: 0 !important;
    padding: 0.375rem 1.2rem 0.375rem 0.5rem;
    align-self: center;
  }
  .item-inner {
    padding: 0.375rem 1.2rem 0.375rem 0.5rem;
    display: flex;
    column-gap: 5px;
    align-items: center;
  }
</style>
