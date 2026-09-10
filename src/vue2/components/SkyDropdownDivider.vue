<template>
  <b-dropdown-divider v-bind="$attrs" />
</template>

<script>
  import { BDropdownDivider } from 'bootstrap-vue';

  export default {
    name: 'SkyDropdownDivider',
    components: { BDropdownDivider },
    inheritAttrs: false,
  };
</script>
