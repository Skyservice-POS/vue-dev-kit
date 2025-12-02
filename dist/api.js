import c from "axios";
function i(e = {}) {
  const {
    baseURL: s = "",
    timeout: t = 3e4,
    headers: r = {},
    onRequest: o,
    onResponse: p,
    onError: u
  } = e, n = c.create({
    baseURL: s,
    timeout: t,
    headers: {
      "Content-Type": "application/json",
      ...r
    }
  });
  return n.interceptors.request.use(
    (a) => o ? o(a) : a,
    (a) => (u && u(a), Promise.reject(a))
  ), n.interceptors.response.use(
    (a) => p ? p(a) : a,
    (a) => (u && u(a), Promise.reject(a))
  ), n;
}
function l(e, s) {
  return {
    getAll: (t = {}) => e.get(s, { params: t }),
    getById: (t, r = {}) => e.get(`${s}/${t}`, { params: r }),
    create: (t) => e.post(s, t),
    update: (t, r) => e.put(`${s}/${t}`, r),
    patch: (t, r) => e.patch(`${s}/${t}`, r),
    delete: (t) => e.delete(`${s}/${t}`)
  };
}
function m(e) {
  var s;
  return e.response ? {
    type: "response",
    status: e.response.status,
    message: ((s = e.response.data) == null ? void 0 : s.message) || e.message,
    data: e.response.data
  } : e.request ? {
    type: "network",
    status: null,
    message: "Network error - no response received",
    data: null
  } : {
    type: "setup",
    status: null,
    message: e.message,
    data: null
  };
}
const f = {
  createApiClient: i,
  createApiService: l,
  handleApiError: m
};
export {
  i as createApiClient,
  l as createApiService,
  f as default,
  m as handleApiError
};
