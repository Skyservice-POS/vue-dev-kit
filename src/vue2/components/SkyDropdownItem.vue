<template>
  <b-dropdown-item :href="href" :disabled="disabled" v-bind="$attrs" v-on="$listeners">
    <slot />
  </b-dropdown-item>
</template>

<script>
  import { BDropdownItem } from 'bootstrap-vue';

  export default {
    name: 'SkyDropdownItem',
    components: { BDropdownItem },
    inheritAttrs: false,
    props: {
      href: { type: String, default: undefined },
      disabled: { type: Boolean, default: false },
    },
  };
</script>
