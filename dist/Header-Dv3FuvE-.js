import { computed as c, createElementBlock as a, openBlock as l, createElementVNode as e, createCommentVNode as u, renderSlot as d, toDisplayString as h } from "vue";
const k = (t, r) => {
  const s = t.__vccOpts || t;
  for (const [i, o] of r)
    s[i] = o;
  return s;
}, p = { class: "sky-header" }, v = { class: "header-content" }, _ = { class: "header-top" }, f = { class: "header-title-wrapper" }, b = ["title"], m = { class: "header-title-content" }, B = { class: "header-title" }, w = {
  key: 0,
  class: "header-subtitle"
}, y = { class: "header-actions" }, g = {
  __name: "Header",
  props: {
    title: {
      type: String,
      default: ""
    },
    subtitle: {
      type: String,
      default: ""
    },
    showBackButton: {
      type: Boolean,
      default: !0
    },
    backButtonTitle: {
      type: String,
      default: "Назад"
    }
  },
  emits: ["back"],
  setup(t) {
    const r = t, s = c(() => {
      try {
        return window.self !== window.top;
      } catch {
        return !0;
      }
    }), i = c(() => r.showBackButton && s.value);
    return (o, n) => (l(), a("header", p, [
      e("div", v, [
        e("div", _, [
          e("div", f, [
            i.value ? (l(), a("button", {
              key: 0,
              class: "btn-back",
              onClick: n[0] || (n[0] = (S) => o.$emit("back")),
              title: t.backButtonTitle
            }, [...n[1] || (n[1] = [
              e("svg", {
                width: "15",
                height: "15",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                "stroke-width": "2"
              }, [
                e("path", {
                  d: "M19 12H5M12 19l-7-7 7-7",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                })
              ], -1)
            ])], 8, b)) : u("", !0),
            e("div", m, [
              d(o.$slots, "title", {}, () => [
                e("h4", B, h(t.title), 1)
              ], !0),
              d(o.$slots, "subtitle", {}, () => [
                t.subtitle ? (l(), a("div", w, h(t.subtitle), 1)) : u("", !0)
              ], !0)
            ])
          ]),
          e("div", y, [
            d(o.$slots, "default", {}, void 0, !0)
          ])
        ])
      ])
    ]));
  }
}, H = /* @__PURE__ */ k(g, [["__scopeId", "data-v-27ae4964"]]);
export {
  H
};
