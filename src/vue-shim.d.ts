declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<
    Record<string, unknown>,
    Record<string, unknown>,
    unknown
  >;
  export default component;
}

declare module '*.svg' {
  const url: string;
  export default url;
}

declare module '*.svg?component' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}

declare module '*.svg?raw' {
  const content: string;
  export default content;
}

declare module '*.svg?url' {
  const url: string;
  export default url;
}
