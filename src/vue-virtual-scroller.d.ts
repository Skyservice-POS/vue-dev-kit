// vue-virtual-scroller@2.0.0-beta ships no type declarations — minimal shim for SkyTable.
declare module 'vue-virtual-scroller' {
  import type { DefineComponent } from 'vue';
  export const DynamicScroller: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export const DynamicScrollerItem: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export const RecycleScroller: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
}

declare module 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
