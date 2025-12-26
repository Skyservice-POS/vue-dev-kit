<template>
  <component
    :is="dialogComponent"
    v-model="isOpen"
    :title="title"
    :subtitle="subtitle"
    :z-index="zIndex"
    :close-text="closeText"
    :enable-animation="enableAnimation"
    :close-on-esc="closeOnEsc"
    :has-buttons="!!$slots.buttons"
    @close="$emit('close')"
    @save="$emit('save')"
  >
    <slot></slot>
    <template v-if="$slots.buttons" #buttons>
      <slot name="buttons"></slot>
    </template>
  </component>
</template>

<script>
import DialogModal from './DialogModal.vue'
import DialogNext from './DialogNext.vue'

export default {
  name: 'Dialog',
  components: {
    DialogModal,
    DialogNext
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    zIndex: {
      type: [Number, String],
      default: null
    },
    closeText: {
      type: String,
      default: ''
    },
    enableAnimation: {
      type: Boolean,
      default: true
    },
    closeOnEsc: {
      type: Boolean,
      default: true
    },
    // Force specific mode (overrides URL parameter)
    mode: {
      type: String,
      default: null, // 'next' | 'classic' | null (auto-detect)
      validator: (value) => [null, 'next', 'classic'].includes(value)
    }
  },
  data() {
    return {
      rocketMode: true // default to DialogNext
    }
  },
  computed: {
    isOpen: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    },
    dialogComponent() {
      // If mode is explicitly set, use it
      if (this.mode === 'next') {
        return DialogNext
      }
      if (this.mode === 'classic') {
        return DialogModal
      }

      // Auto-detect based on URL parameter
      return this.rocketMode ? DialogNext : DialogModal
    }
  },
  mounted() {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const rocketParam = urlParams.get('rocketMode')

      if (rocketParam === 'false') {
        this.rocketMode = false
      } else {
        // true or not specified = DialogNext
        this.rocketMode = true
      }
    } catch {
      this.rocketMode = true
    }
  }
}
</script>
