// Shim so the copied products-table files resolve `@/langs`. The real translations
// live in the host app; here we passthrough window.lang (empty when absent).
export const lang = new Proxy({} as Record<string, string>, {
  get(_t, prop: string): string {
    // '' (not the key) so the files' `lang['x'] || 'default'` fallbacks still work
    const w = (typeof window !== 'undefined' ? (window as any).lang : null) || {}
    return w[prop] ?? ''
  },
})
