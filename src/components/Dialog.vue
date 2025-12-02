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
    @close="$emit('close')"
    @save="$emit('save')"
  >
    <slot></slot>
    <template #buttons>
      <slot name="buttons"></slot>
    </template>
  </component>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import DialogModal from './DialogModal.vue'
import DialogNext from './DialogNext.vue'

const props = defineProps({
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
})

const emit = defineEmits(['update:modelValue', 'close', 'save'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Detect rocketMode from URL
const rocketMode = ref(true) // default to DialogNext

onMounted(() => {
  try {
    const urlParams = new URLSearchParams(window.location.search)
    const rocketParam = urlParams.get('rocketMode')

    if (rocketParam === 'false') {
      rocketMode.value = false
    } else {
      // true or not specified = DialogNext
      rocketMode.value = true
    }
  } catch {
    rocketMode.value = true
  }
})

const dialogComponent = computed(() => {
  // If mode is explicitly set, use it
  if (props.mode === 'next') {
    return DialogNext
  }
  if (props.mode === 'classic') {
    return DialogModal
  }

  // Auto-detect based on URL parameter
  return rocketMode.value ? DialogNext : DialogModal
})
</script>
