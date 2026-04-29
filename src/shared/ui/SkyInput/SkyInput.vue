<script setup lang="ts">
defineProps<{
  modelValue?: string | number;
  type?: string;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  state?: "success" | "error" | "default";
  hint?: string;
}>();

defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <input
    :id="id"
    class="sky-input"
    :class="state"
    :type="type ?? 'text'"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    @input="
      $emit('update:modelValue', ($event.target as HTMLInputElement).value)
    "
  />
  <small v-if="hint" class="setting-hint" :class="state">
    {{ hint }}
  </small>
</template>

<style scoped>
.sky-input {
  display: block;
  width: 100%;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #212529;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  outline: none;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

.sky-input::placeholder {
  color: #6c757d;
  opacity: 1;
}

.sky-input:focus {
  border-color: #28a745;
  box-shadow: 0 0 0 0.25rem rgba(40, 167, 69, 0.25);
}

.sky-input:disabled {
  background-color: #e9ecef;
  opacity: 1;
  cursor: not-allowed;
}

.sky-input.success {
  border-color: #28a745;
}

.sky-input.success:focus {
  border-color: #28a745;
  box-shadow: 0 0 0 0.25rem rgba(40, 167, 69, 0.25);
}

.sky-input.error {
  border-color: #dc3545;
}

.sky-input.error:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
}

.setting-hint {
  color: #666;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.setting-hint.success {
  color: #28a745;
}

.setting-hint.error {
  color: #dc3545;
}
</style>
