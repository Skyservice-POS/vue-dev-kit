<template>
  <div class="item-tag-editor" :style="`flex: ${widthFlex};`" @click.stop>
    <!-- Non-custom: read-only badge -->
    <span v-if="!isCustom" class="tags-input-item tag-text">
      {{
        lang[item[params.tagNameField || "tagName"]] ||
        item[params.tagNameField || "tagName"] ||
        "—"
      }}
    </span>

    <!-- Custom: view mode -->
    <div v-else-if="!isEditing" class="tag-view" @click.stop="startEdit">
      <span v-if="currentTagName" class="tags-input-item tag-text">{{
        currentTagName
      }}</span>
      <span v-else class="tag-badge--empty" />
      <svg
        class="tag-pen-icon"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9.917 1.75a1.458 1.458 0 0 1 2.333 1.75L4.083 11.667H1.75V9.333L9.917 1.75z"
          stroke="#6B7280"
          stroke-width="1.2"
          stroke-linejoin="round"
        />
      </svg>
    </div>

    <!-- Custom: edit mode -->
    <div v-else class="tag-edit-wrap">
      <input
        ref="inputRef"
        v-model="editValue"
        class="form-control custom-input"
        :class="{ 'is-invalid': editError }"
        maxlength="20"
        :title="editError || undefined"
        @keydown.enter.prevent="commitEdit"
        @keydown.escape.prevent="cancelEdit"
        @blur="handleBlur"
      />
      <span
        class="tag-counter"
        :class="{ 'tag-counter--limit': editValue.length >= 18 }"
      >
        {{ editValue.length }}/20
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from "vue";
import { lang } from "@/langs";

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  item: { type: Object, default: () => ({}) },
  widthFlex: { type: String, default: "" },
});

const emit = defineEmits(["inputEdit"]);

const isEditing = ref(false);
const editValue = ref("");
const editError = ref("");
const inputRef = ref(null);
let escapePending = false;

const isCustom = computed(
  () => props.item[props.params.typeField || "templateType"] === "custom",
);
const currentTagName = computed(() => {
  const tag = props.item[props.params.name] || "";
  const type = props.item[props.params.typeField || "templateType"];
  if (tag === type) return lang[type] || tag;
  return tag;
});

function startEdit() {
  const rawTag = props.item[props.params.name] || "";
  const type = props.item[props.params.typeField || "templateType"];
  editValue.value = rawTag === type ? "" : rawTag;
  editError.value = "";
  escapePending = false;
  isEditing.value = true;
  nextTick(() => inputRef.value?.focus());
}

function cancelEdit() {
  escapePending = true;
  isEditing.value = false;
  editError.value = "";
}

function validate(val) {
  const trimmed = val.trim();
  const toggleField = props.params.toggleField || "isEnabledForOnlineStore";
  if (!trimmed && props.item[toggleField]) {
    return lang["customTagNameRequired"] || "Required";
  }
  if (trimmed.length > 20) {
    return lang["customTagNameTooLong"] || "Max 20 chars";
  }
  if (trimmed && !/^[\p{L}\d\s-]+$/u.test(trimmed)) {
    return lang["customTagNameInvalidChars"] || "Invalid chars";
  }
  return "";
}

function commitEdit() {
  if (!isEditing.value) return;
  const val = editValue.value.trim();
  const error = validate(val);
  if (error) {
    editError.value = error;
    nextTick(() => inputRef.value?.focus());
    return;
  }
  const prev = props.item[props.params.name];
  props.item[props.params.name] = val;
  const tagNameField = props.params.tagNameField || "tagName";
  if (tagNameField in props.item) {
    props.item[tagNameField] = val;
  }
  isEditing.value = false;
  editError.value = "";
  emit("inputEdit", prev);
}

function handleBlur() {
  if (escapePending) {
    escapePending = false;
    return;
  }
  commitEdit();
}
</script>

<style scoped>
.item-tag-editor {
  padding: 0.375rem 1.2rem 0.375rem 0.5rem;
  display: flex;
  align-items: center;
  column-gap: 5px;
  position: relative;
}

.tag-badge--empty {
  display: inline-flex;
  border: 1.5px dashed #e2e8f0;
  min-width: 36px;
  height: 28px;
  border-radius: 4px;
}

.tag-view {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.tag-pen-icon {
  flex-shrink: 0;
  opacity: 0.5;
}

.tag-view:hover .tag-pen-icon {
  opacity: 1;
}

.tag-edit-wrap {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
}

.tag-counter {
  font-size: 10px;
  color: #9ca3af;
  white-space: nowrap;
  flex-shrink: 0;
}

.tag-counter--limit {
  color: #dc3545;
}
</style>
