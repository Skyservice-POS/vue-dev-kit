<template>
  <b-skeleton
    :type="type"
    :width="width"
    :height="height"
    :animation="animation"
    v-bind="$attrs"
  />
</template>

<script>
  import { BSkeleton } from 'bootstrap-vue';

  export default {
    name: 'SkySkeleton',
    components: { BSkeleton },
    inheritAttrs: false,
    props: {
      type: {
        type: String,
        default: 'text',
        validator: (v) => ['text', 'avatar', 'button', 'input'].includes(v),
      },
      width: { type: String, default: undefined },
      height: { type: String, default: undefined },
      animation: { type: String, default: 'wave' },
    },
  };
</script>
