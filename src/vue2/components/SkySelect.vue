<template>
  <div
    ref="root"
    class="sky-select"
    :class="{
      'sky-select-block': block,
      'sky-select-open': open,
      'sky-select-disabled': disabled,
    }"
  >
    <button
      type="button"
      class="sky-select-trigger"
      :disabled="disabled"
      @click="toggle"
      @keydown="onKeydown"
    >
      <span
        class="sky-select-value"
        :class="{ 'sky-select-placeholder': selectedOption === null }"
      >
        {{ selectedOption ? selectedOption.label : placeholder }}
      </span>
      <svg class="sky-select-chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <template v-if="open">
      <portal v-if="teleport" to="sky-select-portal">
        <div
          class="sky-select-dropdown sky-select-dropdown-teleported"
          :style="dropdownStyle"
        >
          <div
            v-for="(option, idx) in normalizedOptions"
            :key="option.value"
            class="sky-select-option"
            :class="{
              'sky-select-option-selected': option.value === value,
              'sky-select-option-focused': idx === focusedIdx,
            }"
            @click="select(option)"
            @mouseenter="focusedIdx = idx"
          >
            <span>{{ option.label }}</span>
            <svg v-if="option.value === value" class="sky-select-check" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8l4 4 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </portal>
      <div v-else class="sky-select-dropdown">
        <div
          v-for="(option, idx) in normalizedOptions"
          :key="option.value"
          class="sky-select-option"
          :class="{
            'sky-select-option-selected': option.value === value,
            'sky-select-option-focused': idx === focusedIdx,
          }"
          @click="select(option)"
          @mouseenter="focusedIdx = idx"
        >
          <span>{{ option.label }}</span>
          <svg v-if="option.value === value" class="sky-select-check" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8l4 4 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'SkySelect',
  inheritAttrs: false,
  props: {
    value: {
      default: null,
    },
    options: {
      type: Array,
      default: () => [],
    },
    placeholder: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    block: {
      type: Boolean,
      default: false,
    },
    teleport: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      open: false,
      focusedIdx: -1,
      dropdownStyle: {},
    };
  },
  computed: {
    normalizedOptions() {
      return this.options.map((opt) =>
        typeof opt === 'string' ? { label: opt, value: opt } : opt
      );
    },
    selectedOption() {
      return this.normalizedOptions.find((o) => o.value === this.value) ?? null;
    },
  },
  methods: {
    calcDropdownStyle() {
      if (!this.teleport || !this.$refs.root) return;
      const rect = this.$refs.root.getBoundingClientRect();
      this.dropdownStyle = {
        position: 'fixed',
        top: `${rect.bottom + 4}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        zIndex: 'var(--sky-select-dropdown-z-index, 9999)',
      };
    },
    toggle() {
      if (this.disabled) return;
      this.open ? this.close() : this.openDropdown();
    },
    openDropdown() {
      this.open = true;
      this.focusedIdx = this.normalizedOptions.findIndex((o) => o.value === this.value);
      this.calcDropdownStyle();
      this.$nextTick(() => document.addEventListener('mousedown', this.onOutsideClick));
      if (this.teleport) {
        window.addEventListener('scroll', this.onScrollOrResize, true);
        window.addEventListener('resize', this.onScrollOrResize);
      }
    },
    close() {
      this.open = false;
      document.removeEventListener('mousedown', this.onOutsideClick);
      window.removeEventListener('scroll', this.onScrollOrResize, true);
      window.removeEventListener('resize', this.onScrollOrResize);
    },
    select(option) {
      this.$emit('input', option.value);
      this.close();
    },
    onOutsideClick(e) {
      if (!this.$refs.root.contains(e.target)) this.close();
    },
    onScrollOrResize() {
      this.calcDropdownStyle();
    },
    onKeydown(e) {
      if (!this.open) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.openDropdown();
        }
        return;
      }
      if (e.key === 'Escape') {
        this.close();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.focusedIdx = Math.min(this.focusedIdx + 1, this.normalizedOptions.length - 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.focusedIdx = Math.max(this.focusedIdx - 1, 0);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (this.focusedIdx >= 0) this.select(this.normalizedOptions[this.focusedIdx]);
      }
    },
  },
  beforeDestroy() {
    document.removeEventListener('mousedown', this.onOutsideClick);
    window.removeEventListener('scroll', this.onScrollOrResize, true);
    window.removeEventListener('resize', this.onScrollOrResize);
  },
};
</script>

<style scoped>
.sky-select {
  position: relative;
  display: inline-block;
  font-size: var(--sky-select-font-size, 14px);
}

.sky-select-block {
  display: block;
  width: 100%;
}

.sky-select-block .sky-select-trigger {
  width: 100%;
}

/* Trigger */
.sky-select-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: var(--sky-select-padding, 10px 14px);
  background: var(--sky-select-bg, #fff);
  border: var(--sky-select-border, 1px solid #d1d5db);
  border-radius: var(--sky-select-radius, 6px);
  font-size: inherit;
  font-weight: var(--sky-select-font-weight, 400);
  color: var(--sky-select-color, #374151);
  cursor: pointer;
  user-select: none;
  text-align: left;
  white-space: nowrap;
}

.sky-select-trigger:hover:not(:disabled) {
  border-color: var(--sky-select-border-hover, #9ca3af);
}

.sky-select-open .sky-select-trigger {
  border-color: var(--sky-select-border-focus, #6b7280);
  outline: none;
}

.sky-select-trigger:focus-visible {
  outline: 2px solid var(--sky-select-focus-ring, #24973f);
  outline-offset: 2px;
}

.sky-select-disabled .sky-select-trigger {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Value / Placeholder */
.sky-select-value {
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.sky-select-placeholder {
  color: var(--sky-select-placeholder-color, #9ca3af);
}

/* Chevron */
.sky-select-chevron {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: var(--sky-select-chevron-color, #6b7280);
  transition: transform 0.15s ease;
}

.sky-select-open .sky-select-chevron {
  transform: rotate(180deg);
}

/* Dropdown */
.sky-select-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: var(--sky-select-dropdown-z-index, 100);
  background: var(--sky-select-dropdown-bg, #fff);
  border: var(--sky-select-dropdown-border, 1px solid #d1d5db);
  border-radius: var(--sky-select-dropdown-radius, 6px);
  box-shadow: var(--sky-select-dropdown-shadow, 0 4px 12px rgba(0, 0, 0, 0.1));
  max-height: var(--sky-select-dropdown-max-height, 220px);
  overflow-y: auto;
  padding: 4px;
}

.sky-select-dropdown-teleported {
  position: fixed;
  background: var(--sky-select-dropdown-bg, #fff);
  border: var(--sky-select-dropdown-border, 1px solid #d1d5db);
  border-radius: var(--sky-select-dropdown-radius, 6px);
  box-shadow: var(--sky-select-dropdown-shadow, 0 4px 12px rgba(0, 0, 0, 0.1));
  max-height: var(--sky-select-dropdown-max-height, 220px);
  overflow-y: auto;
  padding: 4px;
}

/* Option */
.sky-select-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sky-select-option-padding, 9px 10px);
  border-radius: var(--sky-select-option-radius, 4px);
  cursor: pointer;
  color: var(--sky-select-option-color, #374151);
}

.sky-select-option-focused,
.sky-select-option:hover {
  background: var(--sky-select-option-hover-bg, #f3f4f6);
}

.sky-select-option-selected {
  color: var(--sky-select-option-selected-color, #24973f);
  font-weight: 500;
}

.sky-select-check {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: var(--sky-select-check-color, #24973f);
}
</style>
