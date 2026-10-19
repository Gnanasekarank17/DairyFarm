import { jsx as D, jsxs as Pe } from "react/jsx-runtime";
import * as P from "react";
import { flushSync as Oe } from "react-dom";
function Tt({ value: e, type: o = "bar", color: t, width: n = 80, height: i = 22 }) {
  if (!Array.isArray(e) || e.length === 0) return null;
  const s = Math.min(...e), l = Math.max(...e) - s || 1;
  if (o === "line") {
    const f = e.map((v, R) => {
      const x = R / Math.max(e.length - 1, 1) * n, _ = 3 + (1 - (v - s) / l) * (i - 6);
      return [x, _];
    }), p = f.map(([v, R], x) => `${x === 0 ? "M" : "L"}${v.toFixed(1)},${R.toFixed(1)}`).join(" "), w = `${p} L${n},${i} L0,${i} Z`, m = t || "var(--accent, #2563eb)";
    return /* @__PURE__ */ Pe("svg", { width: n, height: i, viewBox: `0 0 ${n} ${i}`, style: { display: "block", overflow: "visible" }, children: [
      /* @__PURE__ */ D("path", { d: w, fill: m, fillOpacity: 0.12 }),
      /* @__PURE__ */ D("path", { d: p, fill: "none", stroke: m, strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" }),
      /* @__PURE__ */ D("circle", { cx: f[f.length - 1][0], cy: f[f.length - 1][1], r: 2.5, fill: m })
    ] });
  }
  const u = 1, g = Math.max(2, Math.floor((n - u * (e.length - 1)) / e.length)), c = g * e.length + u * (e.length - 1), h = (n - c) / 2, d = t || "var(--accent, #2563eb)";
  return /* @__PURE__ */ D("svg", { width: n, height: i, viewBox: `0 0 ${n} ${i}`, style: { display: "block" }, children: e.map((a, f) => {
    const p = Math.max(2, (a - s) / l * (i - 2)), w = h + f * (g + u), m = i - p;
    return /* @__PURE__ */ D("rect", { x: w.toFixed(1), y: m.toFixed(1), width: g, height: p.toFixed(1), rx: 1, fill: d, fillOpacity: 0.85 }, f);
  }) });
}
const De = {
  active: "success",
  success: "success",
  completed: "success",
  done: "success",
  approved: "success",
  paid: "success",
  delivered: "success",
  confirmed: "success",
  verified: "success",
  enabled: "success",
  resolved: "success",
  open: "success",
  accepted: "success",
  live: "success",
  online: "success",
  passed: "success",
  pending: "warning",
  processing: "warning",
  review: "warning",
  scheduled: "warning",
  hold: "warning",
  partial: "warning",
  "in progress": "warning",
  onhold: "warning",
  delayed: "warning",
  medium: "warning",
  moderate: "warning",
  cancelled: "danger",
  canceled: "danger",
  failed: "danger",
  rejected: "danger",
  error: "danger",
  inactive: "danger",
  closed: "danger",
  overdue: "danger",
  expired: "danger",
  blocked: "danger",
  critical: "danger",
  urgent: "danger",
  high: "danger",
  terminated: "danger",
  draft: "info",
  new: "info",
  submitted: "info",
  assigned: "info",
  queued: "info",
  waiting: "info",
  low: "info",
  normal: "info",
  created: "info"
}, re = {
  success: { background: "var(--bg-success, #dcfce7)", color: "var(--text-success, #15803d)" },
  warning: { background: "var(--bg-warning, #fef9c3)", color: "var(--text-warning, #a16207)" },
  danger: { background: "var(--bg-danger, #fee2e2)", color: "var(--text-danger, #dc2626)" },
  info: { background: "#eff6ff", color: "#1d4ed8" },
  default: { background: "var(--row-bg-alt, #f9fafb)", color: "var(--cell-text, #111827)" }
};
function kt({ value: e, badgeMap: o }) {
  const t = String(e ?? "");
  if (!t) return null;
  const n = t.toLowerCase().trim(), i = (o == null ? void 0 : o[t]) ?? (o == null ? void 0 : o[n]) ?? De[n] ?? "default";
  return /* @__PURE__ */ D(
    "span",
    {
      style: {
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 500,
        whiteSpace: "nowrap",
        lineHeight: 1.5,
        ...re[i] ?? re.default
      },
      children: t
    }
  );
}
/**
   * table-core
   *
   * Copyright (c) TanStack
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   */
function y(e, o) {
  return typeof e == "function" ? e(o) : e;
}
function $(e, o) {
  return (t) => {
    o.setState((n) => ({
      ...n,
      [e]: y(t, n[e])
    }));
  };
}
function N(e) {
  return e instanceof Function;
}
function Ae(e) {
  return Array.isArray(e) && e.every((o) => typeof o == "number");
}
function Se(e, o) {
  const t = [], n = (i) => {
    i.forEach((s) => {
      t.push(s);
      const r = o(s);
      r != null && r.length && n(r);
    });
  };
  return n(e), t;
}
function S(e, o, t) {
  let n = [], i;
  return (s) => {
    let r;
    t.key && t.debug && (r = Date.now());
    const l = e(s);
    if (!(l.length !== n.length || l.some((c, h) => n[h] !== c)))
      return i;
    n = l;
    let g;
    if (t.key && t.debug && (g = Date.now()), i = o(...l), t == null || t.onChange == null || t.onChange(i), t.key && t.debug && t != null && t.debug()) {
      const c = Math.round((Date.now() - r) * 100) / 100, h = Math.round((Date.now() - g) * 100) / 100, d = h / 16, a = (f, p) => {
        for (f = String(f); f.length < p; )
          f = " " + f;
        return f;
      };
      console.info(`%c⏱ ${a(h, 5)} /${a(c, 5)} ms`, `
            font-size: .6rem;
            font-weight: bold;
            color: hsl(${Math.max(0, Math.min(120 - 120 * d, 120))}deg 100% 31%);`, t == null ? void 0 : t.key);
    }
    return i;
  };
}
function C(e, o, t, n) {
  return {
    debug: () => {
      var i;
      return (i = e == null ? void 0 : e.debugAll) != null ? i : e[o];
    },
    key: process.env.NODE_ENV === "development" && t,
    onChange: n
  };
}
function ze(e, o, t, n) {
  const i = () => {
    var r;
    return (r = s.getValue()) != null ? r : e.options.renderFallbackValue;
  }, s = {
    id: `${o.id}_${t.id}`,
    row: o,
    column: t,
    getValue: () => o.getValue(n),
    renderValue: i,
    getContext: S(() => [e, t, o, s], (r, l, u, g) => ({
      table: r,
      column: l,
      row: u,
      cell: g,
      getValue: g.getValue,
      renderValue: g.renderValue
    }), C(e.options, "debugCells", "cell.getContext"))
  };
  return e._features.forEach((r) => {
    r.createCell == null || r.createCell(s, t, o, e);
  }, {}), s;
}
function Le(e, o, t, n) {
  var i, s;
  const l = {
    ...e._getDefaultColumnDef(),
    ...o
  }, u = l.accessorKey;
  let g = (i = (s = l.id) != null ? s : u ? typeof String.prototype.replaceAll == "function" ? u.replaceAll(".", "_") : u.replace(/\./g, "_") : void 0) != null ? i : typeof l.header == "string" ? l.header : void 0, c;
  if (l.accessorFn ? c = l.accessorFn : u && (u.includes(".") ? c = (d) => {
    let a = d;
    for (const p of u.split(".")) {
      var f;
      a = (f = a) == null ? void 0 : f[p], process.env.NODE_ENV !== "production" && a === void 0 && console.warn(`"${p}" in deeply nested key "${u}" returned undefined.`);
    }
    return a;
  } : c = (d) => d[l.accessorKey]), !g)
    throw process.env.NODE_ENV !== "production" ? new Error(l.accessorFn ? "Columns require an id when using an accessorFn" : "Columns require an id when using a non-string header") : new Error();
  let h = {
    id: `${String(g)}`,
    accessorFn: c,
    parent: n,
    depth: t,
    columnDef: l,
    columns: [],
    getFlatColumns: S(() => [!0], () => {
      var d;
      return [h, ...(d = h.columns) == null ? void 0 : d.flatMap((a) => a.getFlatColumns())];
    }, C(e.options, "debugColumns", "column.getFlatColumns")),
    getLeafColumns: S(() => [e._getOrderColumnsFn()], (d) => {
      var a;
      if ((a = h.columns) != null && a.length) {
        let f = h.columns.flatMap((p) => p.getLeafColumns());
        return d(f);
      }
      return [h];
    }, C(e.options, "debugColumns", "column.getLeafColumns"))
  };
  for (const d of e._features)
    d.createColumn == null || d.createColumn(h, e);
  return h;
}
const M = "debugHeaders";
function le(e, o, t) {
  var n;
  let s = {
    id: (n = t.id) != null ? n : o.id,
    column: o,
    index: t.index,
    isPlaceholder: !!t.isPlaceholder,
    placeholderId: t.placeholderId,
    depth: t.depth,
    subHeaders: [],
    colSpan: 0,
    rowSpan: 0,
    headerGroup: null,
    getLeafHeaders: () => {
      const r = [], l = (u) => {
        u.subHeaders && u.subHeaders.length && u.subHeaders.map(l), r.push(u);
      };
      return l(s), r;
    },
    getContext: () => ({
      table: e,
      header: s,
      column: o
    })
  };
  return e._features.forEach((r) => {
    r.createHeader == null || r.createHeader(s, e);
  }), s;
}
const Ge = {
  createTable: (e) => {
    e.getHeaderGroups = S(() => [e.getAllColumns(), e.getVisibleLeafColumns(), e.getState().columnPinning.left, e.getState().columnPinning.right], (o, t, n, i) => {
      var s, r;
      const l = (s = n == null ? void 0 : n.map((h) => t.find((d) => d.id === h)).filter(Boolean)) != null ? s : [], u = (r = i == null ? void 0 : i.map((h) => t.find((d) => d.id === h)).filter(Boolean)) != null ? r : [], g = t.filter((h) => !(n != null && n.includes(h.id)) && !(i != null && i.includes(h.id)));
      return B(o, [...l, ...g, ...u], e);
    }, C(e.options, M, "getHeaderGroups")), e.getCenterHeaderGroups = S(() => [e.getAllColumns(), e.getVisibleLeafColumns(), e.getState().columnPinning.left, e.getState().columnPinning.right], (o, t, n, i) => (t = t.filter((s) => !(n != null && n.includes(s.id)) && !(i != null && i.includes(s.id))), B(o, t, e, "center")), C(e.options, M, "getCenterHeaderGroups")), e.getLeftHeaderGroups = S(() => [e.getAllColumns(), e.getVisibleLeafColumns(), e.getState().columnPinning.left], (o, t, n) => {
      var i;
      const s = (i = n == null ? void 0 : n.map((r) => t.find((l) => l.id === r)).filter(Boolean)) != null ? i : [];
      return B(o, s, e, "left");
    }, C(e.options, M, "getLeftHeaderGroups")), e.getRightHeaderGroups = S(() => [e.getAllColumns(), e.getVisibleLeafColumns(), e.getState().columnPinning.right], (o, t, n) => {
      var i;
      const s = (i = n == null ? void 0 : n.map((r) => t.find((l) => l.id === r)).filter(Boolean)) != null ? i : [];
      return B(o, s, e, "right");
    }, C(e.options, M, "getRightHeaderGroups")), e.getFooterGroups = S(() => [e.getHeaderGroups()], (o) => [...o].reverse(), C(e.options, M, "getFooterGroups")), e.getLeftFooterGroups = S(() => [e.getLeftHeaderGroups()], (o) => [...o].reverse(), C(e.options, M, "getLeftFooterGroups")), e.getCenterFooterGroups = S(() => [e.getCenterHeaderGroups()], (o) => [...o].reverse(), C(e.options, M, "getCenterFooterGroups")), e.getRightFooterGroups = S(() => [e.getRightHeaderGroups()], (o) => [...o].reverse(), C(e.options, M, "getRightFooterGroups")), e.getFlatHeaders = S(() => [e.getHeaderGroups()], (o) => o.map((t) => t.headers).flat(), C(e.options, M, "getFlatHeaders")), e.getLeftFlatHeaders = S(() => [e.getLeftHeaderGroups()], (o) => o.map((t) => t.headers).flat(), C(e.options, M, "getLeftFlatHeaders")), e.getCenterFlatHeaders = S(() => [e.getCenterHeaderGroups()], (o) => o.map((t) => t.headers).flat(), C(e.options, M, "getCenterFlatHeaders")), e.getRightFlatHeaders = S(() => [e.getRightHeaderGroups()], (o) => o.map((t) => t.headers).flat(), C(e.options, M, "getRightFlatHeaders")), e.getCenterLeafHeaders = S(() => [e.getCenterFlatHeaders()], (o) => o.filter((t) => {
      var n;
      return !((n = t.subHeaders) != null && n.length);
    }), C(e.options, M, "getCenterLeafHeaders")), e.getLeftLeafHeaders = S(() => [e.getLeftFlatHeaders()], (o) => o.filter((t) => {
      var n;
      return !((n = t.subHeaders) != null && n.length);
    }), C(e.options, M, "getLeftLeafHeaders")), e.getRightLeafHeaders = S(() => [e.getRightFlatHeaders()], (o) => o.filter((t) => {
      var n;
      return !((n = t.subHeaders) != null && n.length);
    }), C(e.options, M, "getRightLeafHeaders")), e.getLeafHeaders = S(() => [e.getLeftHeaderGroups(), e.getCenterHeaderGroups(), e.getRightHeaderGroups()], (o, t, n) => {
      var i, s, r, l, u, g;
      return [...(i = (s = o[0]) == null ? void 0 : s.headers) != null ? i : [], ...(r = (l = t[0]) == null ? void 0 : l.headers) != null ? r : [], ...(u = (g = n[0]) == null ? void 0 : g.headers) != null ? u : []].map((c) => c.getLeafHeaders()).flat();
    }, C(e.options, M, "getLeafHeaders"));
  }
};
function B(e, o, t, n) {
  var i, s;
  let r = 0;
  const l = function(d, a) {
    a === void 0 && (a = 1), r = Math.max(r, a), d.filter((f) => f.getIsVisible()).forEach((f) => {
      var p;
      (p = f.columns) != null && p.length && l(f.columns, a + 1);
    }, 0);
  };
  l(e);
  let u = [];
  const g = (d, a) => {
    const f = {
      depth: a,
      id: [n, `${a}`].filter(Boolean).join("_"),
      headers: []
    }, p = [];
    d.forEach((w) => {
      const m = [...p].reverse()[0], v = w.column.depth === f.depth;
      let R, x = !1;
      if (v && w.column.parent ? R = w.column.parent : (R = w.column, x = !0), m && (m == null ? void 0 : m.column) === R)
        m.subHeaders.push(w);
      else {
        const _ = le(t, R, {
          id: [n, a, R.id, w == null ? void 0 : w.id].filter(Boolean).join("_"),
          isPlaceholder: x,
          placeholderId: x ? `${p.filter((F) => F.column === R).length}` : void 0,
          depth: a,
          index: p.length
        });
        _.subHeaders.push(w), p.push(_);
      }
      f.headers.push(w), w.headerGroup = f;
    }), u.push(f), a > 0 && g(p, a - 1);
  }, c = o.map((d, a) => le(t, d, {
    depth: r,
    index: a
  }));
  g(c, r - 1), u.reverse();
  const h = (d) => d.filter((f) => f.column.getIsVisible()).map((f) => {
    let p = 0, w = 0, m = [0];
    f.subHeaders && f.subHeaders.length ? (m = [], h(f.subHeaders).forEach((R) => {
      let {
        colSpan: x,
        rowSpan: _
      } = R;
      p += x, m.push(_);
    })) : p = 1;
    const v = Math.min(...m);
    return w = w + v, f.colSpan = p, f.rowSpan = w, {
      colSpan: p,
      rowSpan: w
    };
  });
  return h((i = (s = u[0]) == null ? void 0 : s.headers) != null ? i : []), u;
}
const q = (e, o, t, n, i, s, r) => {
  let l = {
    id: o,
    index: n,
    original: t,
    depth: i,
    parentId: r,
    _valuesCache: {},
    _uniqueValuesCache: {},
    getValue: (u) => {
      if (l._valuesCache.hasOwnProperty(u))
        return l._valuesCache[u];
      const g = e.getColumn(u);
      if (g != null && g.accessorFn)
        return l._valuesCache[u] = g.accessorFn(l.original, n), l._valuesCache[u];
    },
    getUniqueValues: (u) => {
      if (l._uniqueValuesCache.hasOwnProperty(u))
        return l._uniqueValuesCache[u];
      const g = e.getColumn(u);
      if (g != null && g.accessorFn)
        return g.columnDef.getUniqueValues ? (l._uniqueValuesCache[u] = g.columnDef.getUniqueValues(l.original, n), l._uniqueValuesCache[u]) : (l._uniqueValuesCache[u] = [l.getValue(u)], l._uniqueValuesCache[u]);
    },
    renderValue: (u) => {
      var g;
      return (g = l.getValue(u)) != null ? g : e.options.renderFallbackValue;
    },
    subRows: [],
    getLeafRows: () => Se(l.subRows, (u) => u.subRows),
    getParentRow: () => l.parentId ? e.getRow(l.parentId, !0) : void 0,
    getParentRows: () => {
      let u = [], g = l;
      for (; ; ) {
        const c = g.getParentRow();
        if (!c) break;
        u.push(c), g = c;
      }
      return u.reverse();
    },
    getAllCells: S(() => [e.getAllLeafColumns()], (u) => u.map((g) => ze(e, l, g, g.id)), C(e.options, "debugRows", "getAllCells")),
    _getAllCellsByColumnId: S(() => [l.getAllCells()], (u) => u.reduce((g, c) => (g[c.column.id] = c, g), {}), C(e.options, "debugRows", "getAllCellsByColumnId"))
  };
  for (let u = 0; u < e._features.length; u++) {
    const g = e._features[u];
    g == null || g.createRow == null || g.createRow(l, e);
  }
  return l;
}, He = {
  createColumn: (e, o) => {
    e._getFacetedRowModel = o.options.getFacetedRowModel && o.options.getFacetedRowModel(o, e.id), e.getFacetedRowModel = () => e._getFacetedRowModel ? e._getFacetedRowModel() : o.getPreFilteredRowModel(), e._getFacetedUniqueValues = o.options.getFacetedUniqueValues && o.options.getFacetedUniqueValues(o, e.id), e.getFacetedUniqueValues = () => e._getFacetedUniqueValues ? e._getFacetedUniqueValues() : /* @__PURE__ */ new Map(), e._getFacetedMinMaxValues = o.options.getFacetedMinMaxValues && o.options.getFacetedMinMaxValues(o, e.id), e.getFacetedMinMaxValues = () => {
      if (e._getFacetedMinMaxValues)
        return e._getFacetedMinMaxValues();
    };
  }
}, Ce = (e, o, t) => {
  var n, i;
  const s = t == null || (n = t.toString()) == null ? void 0 : n.toLowerCase();
  return !!(!((i = e.getValue(o)) == null || (i = i.toString()) == null || (i = i.toLowerCase()) == null) && i.includes(s));
};
Ce.autoRemove = (e) => I(e);
const we = (e, o, t) => {
  var n;
  return !!(!((n = e.getValue(o)) == null || (n = n.toString()) == null) && n.includes(t));
};
we.autoRemove = (e) => I(e);
const ve = (e, o, t) => {
  var n;
  return ((n = e.getValue(o)) == null || (n = n.toString()) == null ? void 0 : n.toLowerCase()) === (t == null ? void 0 : t.toLowerCase());
};
ve.autoRemove = (e) => I(e);
const Re = (e, o, t) => {
  var n;
  return (n = e.getValue(o)) == null ? void 0 : n.includes(t);
};
Re.autoRemove = (e) => I(e);
const _e = (e, o, t) => !t.some((n) => {
  var i;
  return !((i = e.getValue(o)) != null && i.includes(n));
});
_e.autoRemove = (e) => I(e) || !(e != null && e.length);
const Fe = (e, o, t) => t.some((n) => {
  var i;
  return (i = e.getValue(o)) == null ? void 0 : i.includes(n);
});
Fe.autoRemove = (e) => I(e) || !(e != null && e.length);
const xe = (e, o, t) => e.getValue(o) === t;
xe.autoRemove = (e) => I(e);
const Me = (e, o, t) => e.getValue(o) == t;
Me.autoRemove = (e) => I(e);
const ne = (e, o, t) => {
  let [n, i] = t;
  const s = e.getValue(o);
  return s >= n && s <= i;
};
ne.resolveFilterValue = (e) => {
  let [o, t] = e, n = typeof o != "number" ? parseFloat(o) : o, i = typeof t != "number" ? parseFloat(t) : t, s = o === null || Number.isNaN(n) ? -1 / 0 : n, r = t === null || Number.isNaN(i) ? 1 / 0 : i;
  if (s > r) {
    const l = s;
    s = r, r = l;
  }
  return [s, r];
};
ne.autoRemove = (e) => I(e) || I(e[0]) && I(e[1]);
const E = {
  includesString: Ce,
  includesStringSensitive: we,
  equalsString: ve,
  arrIncludes: Re,
  arrIncludesAll: _e,
  arrIncludesSome: Fe,
  equals: xe,
  weakEquals: Me,
  inNumberRange: ne
};
function I(e) {
  return e == null || e === "";
}
const Be = {
  getDefaultColumnDef: () => ({
    filterFn: "auto"
  }),
  getInitialState: (e) => ({
    columnFilters: [],
    ...e
  }),
  getDefaultOptions: (e) => ({
    onColumnFiltersChange: $("columnFilters", e),
    filterFromLeafRows: !1,
    maxLeafRowFilterDepth: 100
  }),
  createColumn: (e, o) => {
    e.getAutoFilterFn = () => {
      const t = o.getCoreRowModel().flatRows[0], n = t == null ? void 0 : t.getValue(e.id);
      return typeof n == "string" ? E.includesString : typeof n == "number" ? E.inNumberRange : typeof n == "boolean" || n !== null && typeof n == "object" ? E.equals : Array.isArray(n) ? E.arrIncludes : E.weakEquals;
    }, e.getFilterFn = () => {
      var t, n;
      return N(e.columnDef.filterFn) ? e.columnDef.filterFn : e.columnDef.filterFn === "auto" ? e.getAutoFilterFn() : (
        // @ts-ignore
        (t = (n = o.options.filterFns) == null ? void 0 : n[e.columnDef.filterFn]) != null ? t : E[e.columnDef.filterFn]
      );
    }, e.getCanFilter = () => {
      var t, n, i;
      return ((t = e.columnDef.enableColumnFilter) != null ? t : !0) && ((n = o.options.enableColumnFilters) != null ? n : !0) && ((i = o.options.enableFilters) != null ? i : !0) && !!e.accessorFn;
    }, e.getIsFiltered = () => e.getFilterIndex() > -1, e.getFilterValue = () => {
      var t;
      return (t = o.getState().columnFilters) == null || (t = t.find((n) => n.id === e.id)) == null ? void 0 : t.value;
    }, e.getFilterIndex = () => {
      var t, n;
      return (t = (n = o.getState().columnFilters) == null ? void 0 : n.findIndex((i) => i.id === e.id)) != null ? t : -1;
    }, e.setFilterValue = (t) => {
      o.setColumnFilters((n) => {
        const i = e.getFilterFn(), s = n == null ? void 0 : n.find((c) => c.id === e.id), r = y(t, s ? s.value : void 0);
        if (ue(i, r, e)) {
          var l;
          return (l = n == null ? void 0 : n.filter((c) => c.id !== e.id)) != null ? l : [];
        }
        const u = {
          id: e.id,
          value: r
        };
        if (s) {
          var g;
          return (g = n == null ? void 0 : n.map((c) => c.id === e.id ? u : c)) != null ? g : [];
        }
        return n != null && n.length ? [...n, u] : [u];
      });
    };
  },
  createRow: (e, o) => {
    e.columnFilters = {}, e.columnFiltersMeta = {};
  },
  createTable: (e) => {
    e.setColumnFilters = (o) => {
      const t = e.getAllLeafColumns(), n = (i) => {
        var s;
        return (s = y(o, i)) == null ? void 0 : s.filter((r) => {
          const l = t.find((u) => u.id === r.id);
          if (l) {
            const u = l.getFilterFn();
            if (ue(u, r.value, l))
              return !1;
          }
          return !0;
        });
      };
      e.options.onColumnFiltersChange == null || e.options.onColumnFiltersChange(n);
    }, e.resetColumnFilters = (o) => {
      var t, n;
      e.setColumnFilters(o ? [] : (t = (n = e.initialState) == null ? void 0 : n.columnFilters) != null ? t : []);
    }, e.getPreFilteredRowModel = () => e.getCoreRowModel(), e.getFilteredRowModel = () => (!e._getFilteredRowModel && e.options.getFilteredRowModel && (e._getFilteredRowModel = e.options.getFilteredRowModel(e)), e.options.manualFiltering || !e._getFilteredRowModel ? e.getPreFilteredRowModel() : e._getFilteredRowModel());
  }
};
function ue(e, o, t) {
  return (e && e.autoRemove ? e.autoRemove(o, t) : !1) || typeof o > "u" || typeof o == "string" && !o;
}
const Te = (e, o, t) => t.reduce((n, i) => {
  const s = i.getValue(e);
  return n + (typeof s == "number" ? s : 0);
}, 0), ke = (e, o, t) => {
  let n;
  return t.forEach((i) => {
    const s = i.getValue(e);
    s != null && (n > s || n === void 0 && s >= s) && (n = s);
  }), n;
}, Ne = (e, o, t) => {
  let n;
  return t.forEach((i) => {
    const s = i.getValue(e);
    s != null && (n < s || n === void 0 && s >= s) && (n = s);
  }), n;
}, qe = (e, o, t) => {
  let n, i;
  return t.forEach((s) => {
    const r = s.getValue(e);
    r != null && (n === void 0 ? r >= r && (n = i = r) : (n > r && (n = r), i < r && (i = r)));
  }), [n, i];
}, be = (e, o) => {
  let t = 0, n = 0;
  if (o.forEach((i) => {
    let s = i.getValue(e);
    s != null && (s = +s) >= s && (++t, n += s);
  }), t) return n / t;
}, je = (e, o) => {
  if (!o.length)
    return;
  const t = o.map((s) => s.getValue(e));
  if (!Ae(t))
    return;
  if (t.length === 1)
    return t[0];
  const n = Math.floor(t.length / 2), i = t.sort((s, r) => s - r);
  return t.length % 2 !== 0 ? i[n] : (i[n - 1] + i[n]) / 2;
}, Ue = (e, o) => Array.from(new Set(o.map((t) => t.getValue(e))).values()), We = (e, o) => new Set(o.map((t) => t.getValue(e))).size, Ke = (e, o) => o.length, b = {
  sum: Te,
  min: ke,
  max: Ne,
  extent: qe,
  mean: be,
  median: je,
  unique: Ue,
  uniqueCount: We,
  count: Ke
}, Xe = {
  getDefaultColumnDef: () => ({
    aggregatedCell: (e) => {
      var o, t;
      return (o = (t = e.getValue()) == null || t.toString == null ? void 0 : t.toString()) != null ? o : null;
    },
    aggregationFn: "auto"
  }),
  getInitialState: (e) => ({
    grouping: [],
    ...e
  }),
  getDefaultOptions: (e) => ({
    onGroupingChange: $("grouping", e),
    groupedColumnMode: "reorder"
  }),
  createColumn: (e, o) => {
    e.toggleGrouping = () => {
      o.setGrouping((t) => t != null && t.includes(e.id) ? t.filter((n) => n !== e.id) : [...t ?? [], e.id]);
    }, e.getCanGroup = () => {
      var t, n;
      return ((t = e.columnDef.enableGrouping) != null ? t : !0) && ((n = o.options.enableGrouping) != null ? n : !0) && (!!e.accessorFn || !!e.columnDef.getGroupingValue);
    }, e.getIsGrouped = () => {
      var t;
      return (t = o.getState().grouping) == null ? void 0 : t.includes(e.id);
    }, e.getGroupedIndex = () => {
      var t;
      return (t = o.getState().grouping) == null ? void 0 : t.indexOf(e.id);
    }, e.getToggleGroupingHandler = () => {
      const t = e.getCanGroup();
      return () => {
        t && e.toggleGrouping();
      };
    }, e.getAutoAggregationFn = () => {
      const t = o.getCoreRowModel().flatRows[0], n = t == null ? void 0 : t.getValue(e.id);
      if (typeof n == "number")
        return b.sum;
      if (Object.prototype.toString.call(n) === "[object Date]")
        return b.extent;
    }, e.getAggregationFn = () => {
      var t, n;
      if (!e)
        throw new Error();
      return N(e.columnDef.aggregationFn) ? e.columnDef.aggregationFn : e.columnDef.aggregationFn === "auto" ? e.getAutoAggregationFn() : (t = (n = o.options.aggregationFns) == null ? void 0 : n[e.columnDef.aggregationFn]) != null ? t : b[e.columnDef.aggregationFn];
    };
  },
  createTable: (e) => {
    e.setGrouping = (o) => e.options.onGroupingChange == null ? void 0 : e.options.onGroupingChange(o), e.resetGrouping = (o) => {
      var t, n;
      e.setGrouping(o ? [] : (t = (n = e.initialState) == null ? void 0 : n.grouping) != null ? t : []);
    }, e.getPreGroupedRowModel = () => e.getFilteredRowModel(), e.getGroupedRowModel = () => (!e._getGroupedRowModel && e.options.getGroupedRowModel && (e._getGroupedRowModel = e.options.getGroupedRowModel(e)), e.options.manualGrouping || !e._getGroupedRowModel ? e.getPreGroupedRowModel() : e._getGroupedRowModel());
  },
  createRow: (e, o) => {
    e.getIsGrouped = () => !!e.groupingColumnId, e.getGroupingValue = (t) => {
      if (e._groupingValuesCache.hasOwnProperty(t))
        return e._groupingValuesCache[t];
      const n = o.getColumn(t);
      return n != null && n.columnDef.getGroupingValue ? (e._groupingValuesCache[t] = n.columnDef.getGroupingValue(e.original), e._groupingValuesCache[t]) : e.getValue(t);
    }, e._groupingValuesCache = {};
  },
  createCell: (e, o, t, n) => {
    e.getIsGrouped = () => o.getIsGrouped() && o.id === t.groupingColumnId, e.getIsPlaceholder = () => !e.getIsGrouped() && o.getIsGrouped(), e.getIsAggregated = () => {
      var i;
      return !e.getIsGrouped() && !e.getIsPlaceholder() && !!((i = t.subRows) != null && i.length);
    };
  }
};
function Ye(e, o, t) {
  if (!(o != null && o.length) || !t)
    return e;
  const n = e.filter((s) => !o.includes(s.id));
  return t === "remove" ? n : [...o.map((s) => e.find((r) => r.id === s)).filter(Boolean), ...n];
}
const Je = {
  getInitialState: (e) => ({
    columnOrder: [],
    ...e
  }),
  getDefaultOptions: (e) => ({
    onColumnOrderChange: $("columnOrder", e)
  }),
  createColumn: (e, o) => {
    e.getIndex = S((t) => [G(o, t)], (t) => t.findIndex((n) => n.id === e.id), C(o.options, "debugColumns", "getIndex")), e.getIsFirstColumn = (t) => {
      var n;
      return ((n = G(o, t)[0]) == null ? void 0 : n.id) === e.id;
    }, e.getIsLastColumn = (t) => {
      var n;
      const i = G(o, t);
      return ((n = i[i.length - 1]) == null ? void 0 : n.id) === e.id;
    };
  },
  createTable: (e) => {
    e.setColumnOrder = (o) => e.options.onColumnOrderChange == null ? void 0 : e.options.onColumnOrderChange(o), e.resetColumnOrder = (o) => {
      var t;
      e.setColumnOrder(o ? [] : (t = e.initialState.columnOrder) != null ? t : []);
    }, e._getOrderColumnsFn = S(() => [e.getState().columnOrder, e.getState().grouping, e.options.groupedColumnMode], (o, t, n) => (i) => {
      let s = [];
      if (!(o != null && o.length))
        s = i;
      else {
        const r = [...o], l = [...i];
        for (; l.length && r.length; ) {
          const u = r.shift(), g = l.findIndex((c) => c.id === u);
          g > -1 && s.push(l.splice(g, 1)[0]);
        }
        s = [...s, ...l];
      }
      return Ye(s, t, n);
    }, C(e.options, "debugTable", "_getOrderColumnsFn"));
  }
}, j = () => ({
  left: [],
  right: []
}), Ze = {
  getInitialState: (e) => ({
    columnPinning: j(),
    ...e
  }),
  getDefaultOptions: (e) => ({
    onColumnPinningChange: $("columnPinning", e)
  }),
  createColumn: (e, o) => {
    e.pin = (t) => {
      const n = e.getLeafColumns().map((i) => i.id).filter(Boolean);
      o.setColumnPinning((i) => {
        var s, r;
        if (t === "right") {
          var l, u;
          return {
            left: ((l = i == null ? void 0 : i.left) != null ? l : []).filter((h) => !(n != null && n.includes(h))),
            right: [...((u = i == null ? void 0 : i.right) != null ? u : []).filter((h) => !(n != null && n.includes(h))), ...n]
          };
        }
        if (t === "left") {
          var g, c;
          return {
            left: [...((g = i == null ? void 0 : i.left) != null ? g : []).filter((h) => !(n != null && n.includes(h))), ...n],
            right: ((c = i == null ? void 0 : i.right) != null ? c : []).filter((h) => !(n != null && n.includes(h)))
          };
        }
        return {
          left: ((s = i == null ? void 0 : i.left) != null ? s : []).filter((h) => !(n != null && n.includes(h))),
          right: ((r = i == null ? void 0 : i.right) != null ? r : []).filter((h) => !(n != null && n.includes(h)))
        };
      });
    }, e.getCanPin = () => e.getLeafColumns().some((n) => {
      var i, s, r;
      return ((i = n.columnDef.enablePinning) != null ? i : !0) && ((s = (r = o.options.enableColumnPinning) != null ? r : o.options.enablePinning) != null ? s : !0);
    }), e.getIsPinned = () => {
      const t = e.getLeafColumns().map((l) => l.id), {
        left: n,
        right: i
      } = o.getState().columnPinning, s = t.some((l) => n == null ? void 0 : n.includes(l)), r = t.some((l) => i == null ? void 0 : i.includes(l));
      return s ? "left" : r ? "right" : !1;
    }, e.getPinnedIndex = () => {
      var t, n;
      const i = e.getIsPinned();
      return i ? (t = (n = o.getState().columnPinning) == null || (n = n[i]) == null ? void 0 : n.indexOf(e.id)) != null ? t : -1 : 0;
    };
  },
  createRow: (e, o) => {
    e.getCenterVisibleCells = S(() => [e._getAllVisibleCells(), o.getState().columnPinning.left, o.getState().columnPinning.right], (t, n, i) => {
      const s = [...n ?? [], ...i ?? []];
      return t.filter((r) => !s.includes(r.column.id));
    }, C(o.options, "debugRows", "getCenterVisibleCells")), e.getLeftVisibleCells = S(() => [e._getAllVisibleCells(), o.getState().columnPinning.left], (t, n) => (n ?? []).map((s) => t.find((r) => r.column.id === s)).filter(Boolean).map((s) => ({
      ...s,
      position: "left"
    })), C(o.options, "debugRows", "getLeftVisibleCells")), e.getRightVisibleCells = S(() => [e._getAllVisibleCells(), o.getState().columnPinning.right], (t, n) => (n ?? []).map((s) => t.find((r) => r.column.id === s)).filter(Boolean).map((s) => ({
      ...s,
      position: "right"
    })), C(o.options, "debugRows", "getRightVisibleCells"));
  },
  createTable: (e) => {
    e.setColumnPinning = (o) => e.options.onColumnPinningChange == null ? void 0 : e.options.onColumnPinningChange(o), e.resetColumnPinning = (o) => {
      var t, n;
      return e.setColumnPinning(o ? j() : (t = (n = e.initialState) == null ? void 0 : n.columnPinning) != null ? t : j());
    }, e.getIsSomeColumnsPinned = (o) => {
      var t;
      const n = e.getState().columnPinning;
      if (!o) {
        var i, s;
        return !!((i = n.left) != null && i.length || (s = n.right) != null && s.length);
      }
      return !!((t = n[o]) != null && t.length);
    }, e.getLeftLeafColumns = S(() => [e.getAllLeafColumns(), e.getState().columnPinning.left], (o, t) => (t ?? []).map((n) => o.find((i) => i.id === n)).filter(Boolean), C(e.options, "debugColumns", "getLeftLeafColumns")), e.getRightLeafColumns = S(() => [e.getAllLeafColumns(), e.getState().columnPinning.right], (o, t) => (t ?? []).map((n) => o.find((i) => i.id === n)).filter(Boolean), C(e.options, "debugColumns", "getRightLeafColumns")), e.getCenterLeafColumns = S(() => [e.getAllLeafColumns(), e.getState().columnPinning.left, e.getState().columnPinning.right], (o, t, n) => {
      const i = [...t ?? [], ...n ?? []];
      return o.filter((s) => !i.includes(s.id));
    }, C(e.options, "debugColumns", "getCenterLeafColumns"));
  }
};
function Qe(e) {
  return e || (typeof document < "u" ? document : null);
}
const T = {
  size: 150,
  minSize: 20,
  maxSize: Number.MAX_SAFE_INTEGER
}, U = () => ({
  startOffset: null,
  startSize: null,
  deltaOffset: null,
  deltaPercentage: null,
  isResizingColumn: !1,
  columnSizingStart: []
}), et = {
  getDefaultColumnDef: () => T,
  getInitialState: (e) => ({
    columnSizing: {},
    columnSizingInfo: U(),
    ...e
  }),
  getDefaultOptions: (e) => ({
    columnResizeMode: "onEnd",
    columnResizeDirection: "ltr",
    onColumnSizingChange: $("columnSizing", e),
    onColumnSizingInfoChange: $("columnSizingInfo", e)
  }),
  createColumn: (e, o) => {
    e.getSize = () => {
      var t, n, i;
      const s = o.getState().columnSizing[e.id];
      return Math.min(Math.max((t = e.columnDef.minSize) != null ? t : T.minSize, (n = s ?? e.columnDef.size) != null ? n : T.size), (i = e.columnDef.maxSize) != null ? i : T.maxSize);
    }, e.getStart = S((t) => [t, G(o, t), o.getState().columnSizing], (t, n) => n.slice(0, e.getIndex(t)).reduce((i, s) => i + s.getSize(), 0), C(o.options, "debugColumns", "getStart")), e.getAfter = S((t) => [t, G(o, t), o.getState().columnSizing], (t, n) => n.slice(e.getIndex(t) + 1).reduce((i, s) => i + s.getSize(), 0), C(o.options, "debugColumns", "getAfter")), e.resetSize = () => {
      o.setColumnSizing((t) => {
        let {
          [e.id]: n,
          ...i
        } = t;
        return i;
      });
    }, e.getCanResize = () => {
      var t, n;
      return ((t = e.columnDef.enableResizing) != null ? t : !0) && ((n = o.options.enableColumnResizing) != null ? n : !0);
    }, e.getIsResizing = () => o.getState().columnSizingInfo.isResizingColumn === e.id;
  },
  createHeader: (e, o) => {
    e.getSize = () => {
      let t = 0;
      const n = (i) => {
        if (i.subHeaders.length)
          i.subHeaders.forEach(n);
        else {
          var s;
          t += (s = i.column.getSize()) != null ? s : 0;
        }
      };
      return n(e), t;
    }, e.getStart = () => {
      if (e.index > 0) {
        const t = e.headerGroup.headers[e.index - 1];
        return t.getStart() + t.getSize();
      }
      return 0;
    }, e.getResizeHandler = (t) => {
      const n = o.getColumn(e.column.id), i = n == null ? void 0 : n.getCanResize();
      return (s) => {
        if (!n || !i || (s.persist == null || s.persist(), W(s) && s.touches && s.touches.length > 1))
          return;
        const r = e.getSize(), l = e ? e.getLeafHeaders().map((m) => [m.column.id, m.column.getSize()]) : [[n.id, n.getSize()]], u = W(s) ? Math.round(s.touches[0].clientX) : s.clientX, g = {}, c = (m, v) => {
          typeof v == "number" && (o.setColumnSizingInfo((R) => {
            var x, _;
            const F = o.options.columnResizeDirection === "rtl" ? -1 : 1, A = (v - ((x = R == null ? void 0 : R.startOffset) != null ? x : 0)) * F, z = Math.max(A / ((_ = R == null ? void 0 : R.startSize) != null ? _ : 0), -0.999999);
            return R.columnSizingStart.forEach((H) => {
              let [Ve, se] = H;
              g[Ve] = Math.round(Math.max(se + se * z, 0) * 100) / 100;
            }), {
              ...R,
              deltaOffset: A,
              deltaPercentage: z
            };
          }), (o.options.columnResizeMode === "onChange" || m === "end") && o.setColumnSizing((R) => ({
            ...R,
            ...g
          })));
        }, h = (m) => c("move", m), d = (m) => {
          c("end", m), o.setColumnSizingInfo((v) => ({
            ...v,
            isResizingColumn: !1,
            startOffset: null,
            startSize: null,
            deltaOffset: null,
            deltaPercentage: null,
            columnSizingStart: []
          }));
        }, a = Qe(t), f = {
          moveHandler: (m) => h(m.clientX),
          upHandler: (m) => {
            a == null || a.removeEventListener("mousemove", f.moveHandler), a == null || a.removeEventListener("mouseup", f.upHandler), d(m.clientX);
          }
        }, p = {
          moveHandler: (m) => (m.cancelable && (m.preventDefault(), m.stopPropagation()), h(m.touches[0].clientX), !1),
          upHandler: (m) => {
            var v;
            a == null || a.removeEventListener("touchmove", p.moveHandler), a == null || a.removeEventListener("touchend", p.upHandler), m.cancelable && (m.preventDefault(), m.stopPropagation()), d((v = m.touches[0]) == null ? void 0 : v.clientX);
          }
        }, w = tt() ? {
          passive: !1
        } : !1;
        W(s) ? (a == null || a.addEventListener("touchmove", p.moveHandler, w), a == null || a.addEventListener("touchend", p.upHandler, w)) : (a == null || a.addEventListener("mousemove", f.moveHandler, w), a == null || a.addEventListener("mouseup", f.upHandler, w)), o.setColumnSizingInfo((m) => ({
          ...m,
          startOffset: u,
          startSize: r,
          deltaOffset: 0,
          deltaPercentage: 0,
          columnSizingStart: l,
          isResizingColumn: n.id
        }));
      };
    };
  },
  createTable: (e) => {
    e.setColumnSizing = (o) => e.options.onColumnSizingChange == null ? void 0 : e.options.onColumnSizingChange(o), e.setColumnSizingInfo = (o) => e.options.onColumnSizingInfoChange == null ? void 0 : e.options.onColumnSizingInfoChange(o), e.resetColumnSizing = (o) => {
      var t;
      e.setColumnSizing(o ? {} : (t = e.initialState.columnSizing) != null ? t : {});
    }, e.resetHeaderSizeInfo = (o) => {
      var t;
      e.setColumnSizingInfo(o ? U() : (t = e.initialState.columnSizingInfo) != null ? t : U());
    }, e.getTotalSize = () => {
      var o, t;
      return (o = (t = e.getHeaderGroups()[0]) == null ? void 0 : t.headers.reduce((n, i) => n + i.getSize(), 0)) != null ? o : 0;
    }, e.getLeftTotalSize = () => {
      var o, t;
      return (o = (t = e.getLeftHeaderGroups()[0]) == null ? void 0 : t.headers.reduce((n, i) => n + i.getSize(), 0)) != null ? o : 0;
    }, e.getCenterTotalSize = () => {
      var o, t;
      return (o = (t = e.getCenterHeaderGroups()[0]) == null ? void 0 : t.headers.reduce((n, i) => n + i.getSize(), 0)) != null ? o : 0;
    }, e.getRightTotalSize = () => {
      var o, t;
      return (o = (t = e.getRightHeaderGroups()[0]) == null ? void 0 : t.headers.reduce((n, i) => n + i.getSize(), 0)) != null ? o : 0;
    };
  }
};
let k = null;
function tt() {
  if (typeof k == "boolean") return k;
  let e = !1;
  try {
    const o = {
      get passive() {
        return e = !0, !1;
      }
    }, t = () => {
    };
    window.addEventListener("test", t, o), window.removeEventListener("test", t);
  } catch {
    e = !1;
  }
  return k = e, k;
}
function W(e) {
  return e.type === "touchstart";
}
const nt = {
  getInitialState: (e) => ({
    columnVisibility: {},
    ...e
  }),
  getDefaultOptions: (e) => ({
    onColumnVisibilityChange: $("columnVisibility", e)
  }),
  createColumn: (e, o) => {
    e.toggleVisibility = (t) => {
      e.getCanHide() && o.setColumnVisibility((n) => ({
        ...n,
        [e.id]: t ?? !e.getIsVisible()
      }));
    }, e.getIsVisible = () => {
      var t, n;
      const i = e.columns;
      return (t = i.length ? i.some((s) => s.getIsVisible()) : (n = o.getState().columnVisibility) == null ? void 0 : n[e.id]) != null ? t : !0;
    }, e.getCanHide = () => {
      var t, n;
      return ((t = e.columnDef.enableHiding) != null ? t : !0) && ((n = o.options.enableHiding) != null ? n : !0);
    }, e.getToggleVisibilityHandler = () => (t) => {
      e.toggleVisibility == null || e.toggleVisibility(t.target.checked);
    };
  },
  createRow: (e, o) => {
    e._getAllVisibleCells = S(() => [e.getAllCells(), o.getState().columnVisibility], (t) => t.filter((n) => n.column.getIsVisible()), C(o.options, "debugRows", "_getAllVisibleCells")), e.getVisibleCells = S(() => [e.getLeftVisibleCells(), e.getCenterVisibleCells(), e.getRightVisibleCells()], (t, n, i) => [...t, ...n, ...i], C(o.options, "debugRows", "getVisibleCells"));
  },
  createTable: (e) => {
    const o = (t, n) => S(() => [n(), n().filter((i) => i.getIsVisible()).map((i) => i.id).join("_")], (i) => i.filter((s) => s.getIsVisible == null ? void 0 : s.getIsVisible()), C(e.options, "debugColumns", t));
    e.getVisibleFlatColumns = o("getVisibleFlatColumns", () => e.getAllFlatColumns()), e.getVisibleLeafColumns = o("getVisibleLeafColumns", () => e.getAllLeafColumns()), e.getLeftVisibleLeafColumns = o("getLeftVisibleLeafColumns", () => e.getLeftLeafColumns()), e.getRightVisibleLeafColumns = o("getRightVisibleLeafColumns", () => e.getRightLeafColumns()), e.getCenterVisibleLeafColumns = o("getCenterVisibleLeafColumns", () => e.getCenterLeafColumns()), e.setColumnVisibility = (t) => e.options.onColumnVisibilityChange == null ? void 0 : e.options.onColumnVisibilityChange(t), e.resetColumnVisibility = (t) => {
      var n;
      e.setColumnVisibility(t ? {} : (n = e.initialState.columnVisibility) != null ? n : {});
    }, e.toggleAllColumnsVisible = (t) => {
      var n;
      t = (n = t) != null ? n : !e.getIsAllColumnsVisible(), e.setColumnVisibility(e.getAllLeafColumns().reduce((i, s) => ({
        ...i,
        [s.id]: t || !(s.getCanHide != null && s.getCanHide())
      }), {}));
    }, e.getIsAllColumnsVisible = () => !e.getAllLeafColumns().some((t) => !(t.getIsVisible != null && t.getIsVisible())), e.getIsSomeColumnsVisible = () => e.getAllLeafColumns().some((t) => t.getIsVisible == null ? void 0 : t.getIsVisible()), e.getToggleAllColumnsVisibilityHandler = () => (t) => {
      var n;
      e.toggleAllColumnsVisible((n = t.target) == null ? void 0 : n.checked);
    };
  }
};
function G(e, o) {
  return o ? o === "center" ? e.getCenterVisibleLeafColumns() : o === "left" ? e.getLeftVisibleLeafColumns() : e.getRightVisibleLeafColumns() : e.getVisibleLeafColumns();
}
const ot = {
  createTable: (e) => {
    e._getGlobalFacetedRowModel = e.options.getFacetedRowModel && e.options.getFacetedRowModel(e, "__global__"), e.getGlobalFacetedRowModel = () => e.options.manualFiltering || !e._getGlobalFacetedRowModel ? e.getPreFilteredRowModel() : e._getGlobalFacetedRowModel(), e._getGlobalFacetedUniqueValues = e.options.getFacetedUniqueValues && e.options.getFacetedUniqueValues(e, "__global__"), e.getGlobalFacetedUniqueValues = () => e._getGlobalFacetedUniqueValues ? e._getGlobalFacetedUniqueValues() : /* @__PURE__ */ new Map(), e._getGlobalFacetedMinMaxValues = e.options.getFacetedMinMaxValues && e.options.getFacetedMinMaxValues(e, "__global__"), e.getGlobalFacetedMinMaxValues = () => {
      if (e._getGlobalFacetedMinMaxValues)
        return e._getGlobalFacetedMinMaxValues();
    };
  }
}, it = {
  getInitialState: (e) => ({
    globalFilter: void 0,
    ...e
  }),
  getDefaultOptions: (e) => ({
    onGlobalFilterChange: $("globalFilter", e),
    globalFilterFn: "auto",
    getColumnCanGlobalFilter: (o) => {
      var t;
      const n = (t = e.getCoreRowModel().flatRows[0]) == null || (t = t._getAllCellsByColumnId()[o.id]) == null ? void 0 : t.getValue();
      return typeof n == "string" || typeof n == "number";
    }
  }),
  createColumn: (e, o) => {
    e.getCanGlobalFilter = () => {
      var t, n, i, s;
      return ((t = e.columnDef.enableGlobalFilter) != null ? t : !0) && ((n = o.options.enableGlobalFilter) != null ? n : !0) && ((i = o.options.enableFilters) != null ? i : !0) && ((s = o.options.getColumnCanGlobalFilter == null ? void 0 : o.options.getColumnCanGlobalFilter(e)) != null ? s : !0) && !!e.accessorFn;
    };
  },
  createTable: (e) => {
    e.getGlobalAutoFilterFn = () => E.includesString, e.getGlobalFilterFn = () => {
      var o, t;
      const {
        globalFilterFn: n
      } = e.options;
      return N(n) ? n : n === "auto" ? e.getGlobalAutoFilterFn() : (o = (t = e.options.filterFns) == null ? void 0 : t[n]) != null ? o : E[n];
    }, e.setGlobalFilter = (o) => {
      e.options.onGlobalFilterChange == null || e.options.onGlobalFilterChange(o);
    }, e.resetGlobalFilter = (o) => {
      e.setGlobalFilter(o ? void 0 : e.initialState.globalFilter);
    };
  }
}, st = {
  getInitialState: (e) => ({
    expanded: {},
    ...e
  }),
  getDefaultOptions: (e) => ({
    onExpandedChange: $("expanded", e),
    paginateExpandedRows: !0
  }),
  createTable: (e) => {
    let o = !1, t = !1;
    e._autoResetExpanded = () => {
      var n, i;
      if (!o) {
        e._queue(() => {
          o = !0;
        });
        return;
      }
      if ((n = (i = e.options.autoResetAll) != null ? i : e.options.autoResetExpanded) != null ? n : !e.options.manualExpanding) {
        if (t) return;
        t = !0, e._queue(() => {
          e.resetExpanded(), t = !1;
        });
      }
    }, e.setExpanded = (n) => e.options.onExpandedChange == null ? void 0 : e.options.onExpandedChange(n), e.toggleAllRowsExpanded = (n) => {
      n ?? !e.getIsAllRowsExpanded() ? e.setExpanded(!0) : e.setExpanded({});
    }, e.resetExpanded = (n) => {
      var i, s;
      e.setExpanded(n ? {} : (i = (s = e.initialState) == null ? void 0 : s.expanded) != null ? i : {});
    }, e.getCanSomeRowsExpand = () => e.getPrePaginationRowModel().flatRows.some((n) => n.getCanExpand()), e.getToggleAllRowsExpandedHandler = () => (n) => {
      n.persist == null || n.persist(), e.toggleAllRowsExpanded();
    }, e.getIsSomeRowsExpanded = () => {
      const n = e.getState().expanded;
      return n === !0 || Object.values(n).some(Boolean);
    }, e.getIsAllRowsExpanded = () => {
      const n = e.getState().expanded;
      return typeof n == "boolean" ? n === !0 : !(!Object.keys(n).length || e.getRowModel().flatRows.some((i) => !i.getIsExpanded()));
    }, e.getExpandedDepth = () => {
      let n = 0;
      return (e.getState().expanded === !0 ? Object.keys(e.getRowModel().rowsById) : Object.keys(e.getState().expanded)).forEach((s) => {
        const r = s.split(".");
        n = Math.max(n, r.length);
      }), n;
    }, e.getPreExpandedRowModel = () => e.getSortedRowModel(), e.getExpandedRowModel = () => (!e._getExpandedRowModel && e.options.getExpandedRowModel && (e._getExpandedRowModel = e.options.getExpandedRowModel(e)), e.options.manualExpanding || !e._getExpandedRowModel ? e.getPreExpandedRowModel() : e._getExpandedRowModel());
  },
  createRow: (e, o) => {
    e.toggleExpanded = (t) => {
      o.setExpanded((n) => {
        var i;
        const s = n === !0 ? !0 : !!(n != null && n[e.id]);
        let r = {};
        if (n === !0 ? Object.keys(o.getRowModel().rowsById).forEach((l) => {
          r[l] = !0;
        }) : r = n, t = (i = t) != null ? i : !s, !s && t)
          return {
            ...r,
            [e.id]: !0
          };
        if (s && !t) {
          const {
            [e.id]: l,
            ...u
          } = r;
          return u;
        }
        return n;
      });
    }, e.getIsExpanded = () => {
      var t;
      const n = o.getState().expanded;
      return !!((t = o.options.getIsRowExpanded == null ? void 0 : o.options.getIsRowExpanded(e)) != null ? t : n === !0 || n != null && n[e.id]);
    }, e.getCanExpand = () => {
      var t, n, i;
      return (t = o.options.getRowCanExpand == null ? void 0 : o.options.getRowCanExpand(e)) != null ? t : ((n = o.options.enableExpanding) != null ? n : !0) && !!((i = e.subRows) != null && i.length);
    }, e.getIsAllParentsExpanded = () => {
      let t = !0, n = e;
      for (; t && n.parentId; )
        n = o.getRow(n.parentId, !0), t = n.getIsExpanded();
      return t;
    }, e.getToggleExpandedHandler = () => {
      const t = e.getCanExpand();
      return () => {
        t && e.toggleExpanded();
      };
    };
  }
}, J = 0, Z = 10, K = () => ({
  pageIndex: J,
  pageSize: Z
}), rt = {
  getInitialState: (e) => ({
    ...e,
    pagination: {
      ...K(),
      ...e == null ? void 0 : e.pagination
    }
  }),
  getDefaultOptions: (e) => ({
    onPaginationChange: $("pagination", e)
  }),
  createTable: (e) => {
    let o = !1, t = !1;
    e._autoResetPageIndex = () => {
      var n, i;
      if (!o) {
        e._queue(() => {
          o = !0;
        });
        return;
      }
      if ((n = (i = e.options.autoResetAll) != null ? i : e.options.autoResetPageIndex) != null ? n : !e.options.manualPagination) {
        if (t) return;
        t = !0, e._queue(() => {
          e.resetPageIndex(), t = !1;
        });
      }
    }, e.setPagination = (n) => {
      const i = (s) => y(n, s);
      return e.options.onPaginationChange == null ? void 0 : e.options.onPaginationChange(i);
    }, e.resetPagination = (n) => {
      var i;
      e.setPagination(n ? K() : (i = e.initialState.pagination) != null ? i : K());
    }, e.setPageIndex = (n) => {
      e.setPagination((i) => {
        let s = y(n, i.pageIndex);
        const r = typeof e.options.pageCount > "u" || e.options.pageCount === -1 ? Number.MAX_SAFE_INTEGER : e.options.pageCount - 1;
        return s = Math.max(0, Math.min(s, r)), {
          ...i,
          pageIndex: s
        };
      });
    }, e.resetPageIndex = (n) => {
      var i, s;
      e.setPageIndex(n ? J : (i = (s = e.initialState) == null || (s = s.pagination) == null ? void 0 : s.pageIndex) != null ? i : J);
    }, e.resetPageSize = (n) => {
      var i, s;
      e.setPageSize(n ? Z : (i = (s = e.initialState) == null || (s = s.pagination) == null ? void 0 : s.pageSize) != null ? i : Z);
    }, e.setPageSize = (n) => {
      e.setPagination((i) => {
        const s = Math.max(1, y(n, i.pageSize)), r = i.pageSize * i.pageIndex, l = Math.floor(r / s);
        return {
          ...i,
          pageIndex: l,
          pageSize: s
        };
      });
    }, e.setPageCount = (n) => e.setPagination((i) => {
      var s;
      let r = y(n, (s = e.options.pageCount) != null ? s : -1);
      return typeof r == "number" && (r = Math.max(-1, r)), {
        ...i,
        pageCount: r
      };
    }), e.getPageOptions = S(() => [e.getPageCount()], (n) => {
      let i = [];
      return n && n > 0 && (i = [...new Array(n)].fill(null).map((s, r) => r)), i;
    }, C(e.options, "debugTable", "getPageOptions")), e.getCanPreviousPage = () => e.getState().pagination.pageIndex > 0, e.getCanNextPage = () => {
      const {
        pageIndex: n
      } = e.getState().pagination, i = e.getPageCount();
      return i === -1 ? !0 : i === 0 ? !1 : n < i - 1;
    }, e.previousPage = () => e.setPageIndex((n) => n - 1), e.nextPage = () => e.setPageIndex((n) => n + 1), e.firstPage = () => e.setPageIndex(0), e.lastPage = () => e.setPageIndex(e.getPageCount() - 1), e.getPrePaginationRowModel = () => e.getExpandedRowModel(), e.getPaginationRowModel = () => (!e._getPaginationRowModel && e.options.getPaginationRowModel && (e._getPaginationRowModel = e.options.getPaginationRowModel(e)), e.options.manualPagination || !e._getPaginationRowModel ? e.getPrePaginationRowModel() : e._getPaginationRowModel()), e.getPageCount = () => {
      var n;
      return (n = e.options.pageCount) != null ? n : Math.ceil(e.getRowCount() / e.getState().pagination.pageSize);
    }, e.getRowCount = () => {
      var n;
      return (n = e.options.rowCount) != null ? n : e.getPrePaginationRowModel().rows.length;
    };
  }
}, X = () => ({
  top: [],
  bottom: []
}), lt = {
  getInitialState: (e) => ({
    rowPinning: X(),
    ...e
  }),
  getDefaultOptions: (e) => ({
    onRowPinningChange: $("rowPinning", e)
  }),
  createRow: (e, o) => {
    e.pin = (t, n, i) => {
      const s = n ? e.getLeafRows().map((u) => {
        let {
          id: g
        } = u;
        return g;
      }) : [], r = i ? e.getParentRows().map((u) => {
        let {
          id: g
        } = u;
        return g;
      }) : [], l = /* @__PURE__ */ new Set([...r, e.id, ...s]);
      o.setRowPinning((u) => {
        var g, c;
        if (t === "bottom") {
          var h, d;
          return {
            top: ((h = u == null ? void 0 : u.top) != null ? h : []).filter((p) => !(l != null && l.has(p))),
            bottom: [...((d = u == null ? void 0 : u.bottom) != null ? d : []).filter((p) => !(l != null && l.has(p))), ...Array.from(l)]
          };
        }
        if (t === "top") {
          var a, f;
          return {
            top: [...((a = u == null ? void 0 : u.top) != null ? a : []).filter((p) => !(l != null && l.has(p))), ...Array.from(l)],
            bottom: ((f = u == null ? void 0 : u.bottom) != null ? f : []).filter((p) => !(l != null && l.has(p)))
          };
        }
        return {
          top: ((g = u == null ? void 0 : u.top) != null ? g : []).filter((p) => !(l != null && l.has(p))),
          bottom: ((c = u == null ? void 0 : u.bottom) != null ? c : []).filter((p) => !(l != null && l.has(p)))
        };
      });
    }, e.getCanPin = () => {
      var t;
      const {
        enableRowPinning: n,
        enablePinning: i
      } = o.options;
      return typeof n == "function" ? n(e) : (t = n ?? i) != null ? t : !0;
    }, e.getIsPinned = () => {
      const t = [e.id], {
        top: n,
        bottom: i
      } = o.getState().rowPinning, s = t.some((l) => n == null ? void 0 : n.includes(l)), r = t.some((l) => i == null ? void 0 : i.includes(l));
      return s ? "top" : r ? "bottom" : !1;
    }, e.getPinnedIndex = () => {
      var t, n;
      const i = e.getIsPinned();
      if (!i) return -1;
      const s = (t = i === "top" ? o.getTopRows() : o.getBottomRows()) == null ? void 0 : t.map((r) => {
        let {
          id: l
        } = r;
        return l;
      });
      return (n = s == null ? void 0 : s.indexOf(e.id)) != null ? n : -1;
    };
  },
  createTable: (e) => {
    e.setRowPinning = (o) => e.options.onRowPinningChange == null ? void 0 : e.options.onRowPinningChange(o), e.resetRowPinning = (o) => {
      var t, n;
      return e.setRowPinning(o ? X() : (t = (n = e.initialState) == null ? void 0 : n.rowPinning) != null ? t : X());
    }, e.getIsSomeRowsPinned = (o) => {
      var t;
      const n = e.getState().rowPinning;
      if (!o) {
        var i, s;
        return !!((i = n.top) != null && i.length || (s = n.bottom) != null && s.length);
      }
      return !!((t = n[o]) != null && t.length);
    }, e._getPinnedRows = (o, t, n) => {
      var i;
      return ((i = e.options.keepPinnedRows) == null || i ? (
        //get all rows that are pinned even if they would not be otherwise visible
        //account for expanded parent rows, but not pagination or filtering
        (t ?? []).map((r) => {
          const l = e.getRow(r, !0);
          return l.getIsAllParentsExpanded() ? l : null;
        })
      ) : (
        //else get only visible rows that are pinned
        (t ?? []).map((r) => o.find((l) => l.id === r))
      )).filter(Boolean).map((r) => ({
        ...r,
        position: n
      }));
    }, e.getTopRows = S(() => [e.getRowModel().rows, e.getState().rowPinning.top], (o, t) => e._getPinnedRows(o, t, "top"), C(e.options, "debugRows", "getTopRows")), e.getBottomRows = S(() => [e.getRowModel().rows, e.getState().rowPinning.bottom], (o, t) => e._getPinnedRows(o, t, "bottom"), C(e.options, "debugRows", "getBottomRows")), e.getCenterRows = S(() => [e.getRowModel().rows, e.getState().rowPinning.top, e.getState().rowPinning.bottom], (o, t, n) => {
      const i = /* @__PURE__ */ new Set([...t ?? [], ...n ?? []]);
      return o.filter((s) => !i.has(s.id));
    }, C(e.options, "debugRows", "getCenterRows"));
  }
}, ut = {
  getInitialState: (e) => ({
    rowSelection: {},
    ...e
  }),
  getDefaultOptions: (e) => ({
    onRowSelectionChange: $("rowSelection", e),
    enableRowSelection: !0,
    enableMultiRowSelection: !0,
    enableSubRowSelection: !0
    // enableGroupingRowSelection: false,
    // isAdditiveSelectEvent: (e: unknown) => !!e.metaKey,
    // isInclusiveSelectEvent: (e: unknown) => !!e.shiftKey,
  }),
  createTable: (e) => {
    e.setRowSelection = (o) => e.options.onRowSelectionChange == null ? void 0 : e.options.onRowSelectionChange(o), e.resetRowSelection = (o) => {
      var t;
      return e.setRowSelection(o ? {} : (t = e.initialState.rowSelection) != null ? t : {});
    }, e.toggleAllRowsSelected = (o) => {
      e.setRowSelection((t) => {
        o = typeof o < "u" ? o : !e.getIsAllRowsSelected();
        const n = {
          ...t
        }, i = e.getPreGroupedRowModel().flatRows;
        return o ? i.forEach((s) => {
          s.getCanSelect() && (n[s.id] = !0);
        }) : i.forEach((s) => {
          delete n[s.id];
        }), n;
      });
    }, e.toggleAllPageRowsSelected = (o) => e.setRowSelection((t) => {
      const n = typeof o < "u" ? o : !e.getIsAllPageRowsSelected(), i = {
        ...t
      };
      return e.getRowModel().rows.forEach((s) => {
        Q(i, s.id, n, !0, e);
      }), i;
    }), e.getPreSelectedRowModel = () => e.getCoreRowModel(), e.getSelectedRowModel = S(() => [e.getState().rowSelection, e.getCoreRowModel()], (o, t) => Object.keys(o).length ? Y(e, t) : {
      rows: [],
      flatRows: [],
      rowsById: {}
    }, C(e.options, "debugTable", "getSelectedRowModel")), e.getFilteredSelectedRowModel = S(() => [e.getState().rowSelection, e.getFilteredRowModel()], (o, t) => Object.keys(o).length ? Y(e, t) : {
      rows: [],
      flatRows: [],
      rowsById: {}
    }, C(e.options, "debugTable", "getFilteredSelectedRowModel")), e.getGroupedSelectedRowModel = S(() => [e.getState().rowSelection, e.getSortedRowModel()], (o, t) => Object.keys(o).length ? Y(e, t) : {
      rows: [],
      flatRows: [],
      rowsById: {}
    }, C(e.options, "debugTable", "getGroupedSelectedRowModel")), e.getIsAllRowsSelected = () => {
      const o = e.getFilteredRowModel().flatRows, {
        rowSelection: t
      } = e.getState();
      let n = !!(o.length && Object.keys(t).length);
      return n && o.some((i) => i.getCanSelect() && !t[i.id]) && (n = !1), n;
    }, e.getIsAllPageRowsSelected = () => {
      const o = e.getPaginationRowModel().flatRows.filter((i) => i.getCanSelect()), {
        rowSelection: t
      } = e.getState();
      let n = !!o.length;
      return n && o.some((i) => !t[i.id]) && (n = !1), n;
    }, e.getIsSomeRowsSelected = () => {
      var o;
      const t = Object.keys((o = e.getState().rowSelection) != null ? o : {}).length;
      return t > 0 && t < e.getFilteredRowModel().flatRows.length;
    }, e.getIsSomePageRowsSelected = () => {
      const o = e.getPaginationRowModel().flatRows;
      return e.getIsAllPageRowsSelected() ? !1 : o.filter((t) => t.getCanSelect()).some((t) => t.getIsSelected() || t.getIsSomeSelected());
    }, e.getToggleAllRowsSelectedHandler = () => (o) => {
      e.toggleAllRowsSelected(o.target.checked);
    }, e.getToggleAllPageRowsSelectedHandler = () => (o) => {
      e.toggleAllPageRowsSelected(o.target.checked);
    };
  },
  createRow: (e, o) => {
    e.toggleSelected = (t, n) => {
      const i = e.getIsSelected();
      o.setRowSelection((s) => {
        var r;
        if (t = typeof t < "u" ? t : !i, e.getCanSelect() && i === t)
          return s;
        const l = {
          ...s
        };
        return Q(l, e.id, t, (r = n == null ? void 0 : n.selectChildren) != null ? r : !0, o), l;
      });
    }, e.getIsSelected = () => {
      const {
        rowSelection: t
      } = o.getState();
      return oe(e, t);
    }, e.getIsSomeSelected = () => {
      const {
        rowSelection: t
      } = o.getState();
      return ee(e, t) === "some";
    }, e.getIsAllSubRowsSelected = () => {
      const {
        rowSelection: t
      } = o.getState();
      return ee(e, t) === "all";
    }, e.getCanSelect = () => {
      var t;
      return typeof o.options.enableRowSelection == "function" ? o.options.enableRowSelection(e) : (t = o.options.enableRowSelection) != null ? t : !0;
    }, e.getCanSelectSubRows = () => {
      var t;
      return typeof o.options.enableSubRowSelection == "function" ? o.options.enableSubRowSelection(e) : (t = o.options.enableSubRowSelection) != null ? t : !0;
    }, e.getCanMultiSelect = () => {
      var t;
      return typeof o.options.enableMultiRowSelection == "function" ? o.options.enableMultiRowSelection(e) : (t = o.options.enableMultiRowSelection) != null ? t : !0;
    }, e.getToggleSelectedHandler = () => {
      const t = e.getCanSelect();
      return (n) => {
        var i;
        t && e.toggleSelected((i = n.target) == null ? void 0 : i.checked);
      };
    };
  }
}, Q = (e, o, t, n, i) => {
  var s;
  const r = i.getRow(o, !0);
  t ? (r.getCanMultiSelect() || Object.keys(e).forEach((l) => delete e[l]), r.getCanSelect() && (e[o] = !0)) : delete e[o], n && (s = r.subRows) != null && s.length && r.getCanSelectSubRows() && r.subRows.forEach((l) => Q(e, l.id, t, n, i));
};
function Y(e, o) {
  const t = e.getState().rowSelection, n = [], i = {}, s = function(r, l) {
    return r.map((u) => {
      var g;
      const c = oe(u, t);
      if (c && (n.push(u), i[u.id] = u), (g = u.subRows) != null && g.length && (u = {
        ...u,
        subRows: s(u.subRows)
      }), c)
        return u;
    }).filter(Boolean);
  };
  return {
    rows: s(o.rows),
    flatRows: n,
    rowsById: i
  };
}
function oe(e, o) {
  var t;
  return (t = o[e.id]) != null ? t : !1;
}
function ee(e, o, t) {
  var n;
  if (!((n = e.subRows) != null && n.length)) return !1;
  let i = !0, s = !1;
  return e.subRows.forEach((r) => {
    if (!(s && !i) && (r.getCanSelect() && (oe(r, o) ? s = !0 : i = !1), r.subRows && r.subRows.length)) {
      const l = ee(r, o);
      l === "all" ? s = !0 : (l === "some" && (s = !0), i = !1);
    }
  }), i ? "all" : s ? "some" : !1;
}
const te = /([0-9]+)/gm, at = (e, o, t) => $e(V(e.getValue(t)).toLowerCase(), V(o.getValue(t)).toLowerCase()), gt = (e, o, t) => $e(V(e.getValue(t)), V(o.getValue(t))), dt = (e, o, t) => ie(V(e.getValue(t)).toLowerCase(), V(o.getValue(t)).toLowerCase()), ct = (e, o, t) => ie(V(e.getValue(t)), V(o.getValue(t))), ft = (e, o, t) => {
  const n = e.getValue(t), i = o.getValue(t);
  return n > i ? 1 : n < i ? -1 : 0;
}, pt = (e, o, t) => ie(e.getValue(t), o.getValue(t));
function ie(e, o) {
  return e === o ? 0 : e > o ? 1 : -1;
}
function V(e) {
  return typeof e == "number" ? isNaN(e) || e === 1 / 0 || e === -1 / 0 ? "" : String(e) : typeof e == "string" ? e : "";
}
function $e(e, o) {
  const t = e.split(te).filter(Boolean), n = o.split(te).filter(Boolean);
  for (; t.length && n.length; ) {
    const i = t.shift(), s = n.shift(), r = parseInt(i, 10), l = parseInt(s, 10), u = [r, l].sort();
    if (isNaN(u[0])) {
      if (i > s)
        return 1;
      if (s > i)
        return -1;
      continue;
    }
    if (isNaN(u[1]))
      return isNaN(r) ? -1 : 1;
    if (r > l)
      return 1;
    if (l > r)
      return -1;
  }
  return t.length - n.length;
}
const L = {
  alphanumeric: at,
  alphanumericCaseSensitive: gt,
  text: dt,
  textCaseSensitive: ct,
  datetime: ft,
  basic: pt
}, ht = {
  getInitialState: (e) => ({
    sorting: [],
    ...e
  }),
  getDefaultColumnDef: () => ({
    sortingFn: "auto",
    sortUndefined: 1
  }),
  getDefaultOptions: (e) => ({
    onSortingChange: $("sorting", e),
    isMultiSortEvent: (o) => o.shiftKey
  }),
  createColumn: (e, o) => {
    e.getAutoSortingFn = () => {
      const t = o.getFilteredRowModel().flatRows.slice(10);
      let n = !1;
      for (const i of t) {
        const s = i == null ? void 0 : i.getValue(e.id);
        if (Object.prototype.toString.call(s) === "[object Date]")
          return L.datetime;
        if (typeof s == "string" && (n = !0, s.split(te).length > 1))
          return L.alphanumeric;
      }
      return n ? L.text : L.basic;
    }, e.getAutoSortDir = () => {
      const t = o.getFilteredRowModel().flatRows[0];
      return typeof (t == null ? void 0 : t.getValue(e.id)) == "string" ? "asc" : "desc";
    }, e.getSortingFn = () => {
      var t, n;
      if (!e)
        throw new Error();
      return N(e.columnDef.sortingFn) ? e.columnDef.sortingFn : e.columnDef.sortingFn === "auto" ? e.getAutoSortingFn() : (t = (n = o.options.sortingFns) == null ? void 0 : n[e.columnDef.sortingFn]) != null ? t : L[e.columnDef.sortingFn];
    }, e.toggleSorting = (t, n) => {
      const i = e.getNextSortingOrder(), s = typeof t < "u" && t !== null;
      o.setSorting((r) => {
        const l = r == null ? void 0 : r.find((a) => a.id === e.id), u = r == null ? void 0 : r.findIndex((a) => a.id === e.id);
        let g = [], c, h = s ? t : i === "desc";
        if (r != null && r.length && e.getCanMultiSort() && n ? l ? c = "toggle" : c = "add" : r != null && r.length && u !== r.length - 1 ? c = "replace" : l ? c = "toggle" : c = "replace", c === "toggle" && (s || i || (c = "remove")), c === "add") {
          var d;
          g = [...r, {
            id: e.id,
            desc: h
          }], g.splice(0, g.length - ((d = o.options.maxMultiSortColCount) != null ? d : Number.MAX_SAFE_INTEGER));
        } else c === "toggle" ? g = r.map((a) => a.id === e.id ? {
          ...a,
          desc: h
        } : a) : c === "remove" ? g = r.filter((a) => a.id !== e.id) : g = [{
          id: e.id,
          desc: h
        }];
        return g;
      });
    }, e.getFirstSortDir = () => {
      var t, n;
      return ((t = (n = e.columnDef.sortDescFirst) != null ? n : o.options.sortDescFirst) != null ? t : e.getAutoSortDir() === "desc") ? "desc" : "asc";
    }, e.getNextSortingOrder = (t) => {
      var n, i;
      const s = e.getFirstSortDir(), r = e.getIsSorted();
      return r ? r !== s && ((n = o.options.enableSortingRemoval) == null || n) && // If enableSortRemove, enable in general
      (!(t && (i = o.options.enableMultiRemove) != null) || i) ? !1 : r === "desc" ? "asc" : "desc" : s;
    }, e.getCanSort = () => {
      var t, n;
      return ((t = e.columnDef.enableSorting) != null ? t : !0) && ((n = o.options.enableSorting) != null ? n : !0) && !!e.accessorFn;
    }, e.getCanMultiSort = () => {
      var t, n;
      return (t = (n = e.columnDef.enableMultiSort) != null ? n : o.options.enableMultiSort) != null ? t : !!e.accessorFn;
    }, e.getIsSorted = () => {
      var t;
      const n = (t = o.getState().sorting) == null ? void 0 : t.find((i) => i.id === e.id);
      return n ? n.desc ? "desc" : "asc" : !1;
    }, e.getSortIndex = () => {
      var t, n;
      return (t = (n = o.getState().sorting) == null ? void 0 : n.findIndex((i) => i.id === e.id)) != null ? t : -1;
    }, e.clearSorting = () => {
      o.setSorting((t) => t != null && t.length ? t.filter((n) => n.id !== e.id) : []);
    }, e.getToggleSortingHandler = () => {
      const t = e.getCanSort();
      return (n) => {
        t && (n.persist == null || n.persist(), e.toggleSorting == null || e.toggleSorting(void 0, e.getCanMultiSort() ? o.options.isMultiSortEvent == null ? void 0 : o.options.isMultiSortEvent(n) : !1));
      };
    };
  },
  createTable: (e) => {
    e.setSorting = (o) => e.options.onSortingChange == null ? void 0 : e.options.onSortingChange(o), e.resetSorting = (o) => {
      var t, n;
      e.setSorting(o ? [] : (t = (n = e.initialState) == null ? void 0 : n.sorting) != null ? t : []);
    }, e.getPreSortedRowModel = () => e.getGroupedRowModel(), e.getSortedRowModel = () => (!e._getSortedRowModel && e.options.getSortedRowModel && (e._getSortedRowModel = e.options.getSortedRowModel(e)), e.options.manualSorting || !e._getSortedRowModel ? e.getPreSortedRowModel() : e._getSortedRowModel());
  }
}, mt = [
  Ge,
  nt,
  Je,
  Ze,
  He,
  Be,
  ot,
  //depends on ColumnFaceting
  it,
  //depends on ColumnFiltering
  ht,
  Xe,
  //depends on RowSorting
  st,
  rt,
  lt,
  ut,
  et
];
function St(e) {
  var o, t;
  process.env.NODE_ENV !== "production" && (e.debugAll || e.debugTable) && console.info("Creating Table Instance...");
  const n = [...mt, ...(o = e._features) != null ? o : []];
  let i = {
    _features: n
  };
  const s = i._features.reduce((d, a) => Object.assign(d, a.getDefaultOptions == null ? void 0 : a.getDefaultOptions(i)), {}), r = (d) => i.options.mergeOptions ? i.options.mergeOptions(s, d) : {
    ...s,
    ...d
  };
  let u = {
    ...{},
    ...(t = e.initialState) != null ? t : {}
  };
  i._features.forEach((d) => {
    var a;
    u = (a = d.getInitialState == null ? void 0 : d.getInitialState(u)) != null ? a : u;
  });
  const g = [];
  let c = !1;
  const h = {
    _features: n,
    options: {
      ...s,
      ...e
    },
    initialState: u,
    _queue: (d) => {
      g.push(d), c || (c = !0, Promise.resolve().then(() => {
        for (; g.length; )
          g.shift()();
        c = !1;
      }).catch((a) => setTimeout(() => {
        throw a;
      })));
    },
    reset: () => {
      i.setState(i.initialState);
    },
    setOptions: (d) => {
      const a = y(d, i.options);
      i.options = r(a);
    },
    getState: () => i.options.state,
    setState: (d) => {
      i.options.onStateChange == null || i.options.onStateChange(d);
    },
    _getRowId: (d, a, f) => {
      var p;
      return (p = i.options.getRowId == null ? void 0 : i.options.getRowId(d, a, f)) != null ? p : `${f ? [f.id, a].join(".") : a}`;
    },
    getCoreRowModel: () => (i._getCoreRowModel || (i._getCoreRowModel = i.options.getCoreRowModel(i)), i._getCoreRowModel()),
    // The final calls start at the bottom of the model,
    // expanded rows, which then work their way up
    getRowModel: () => i.getPaginationRowModel(),
    //in next version, we should just pass in the row model as the optional 2nd arg
    getRow: (d, a) => {
      let f = (a ? i.getPrePaginationRowModel() : i.getRowModel()).rowsById[d];
      if (!f && (f = i.getCoreRowModel().rowsById[d], !f))
        throw process.env.NODE_ENV !== "production" ? new Error(`getRow could not find row with ID: ${d}`) : new Error();
      return f;
    },
    _getDefaultColumnDef: S(() => [i.options.defaultColumn], (d) => {
      var a;
      return d = (a = d) != null ? a : {}, {
        header: (f) => {
          const p = f.header.column.columnDef;
          return p.accessorKey ? p.accessorKey : p.accessorFn ? p.id : null;
        },
        // footer: props => props.header.column.id,
        cell: (f) => {
          var p, w;
          return (p = (w = f.renderValue()) == null || w.toString == null ? void 0 : w.toString()) != null ? p : null;
        },
        ...i._features.reduce((f, p) => Object.assign(f, p.getDefaultColumnDef == null ? void 0 : p.getDefaultColumnDef()), {}),
        ...d
      };
    }, C(e, "debugColumns", "_getDefaultColumnDef")),
    _getColumnDefs: () => i.options.columns,
    getAllColumns: S(() => [i._getColumnDefs()], (d) => {
      const a = function(f, p, w) {
        return w === void 0 && (w = 0), f.map((m) => {
          const v = Le(i, m, w, p), R = m;
          return v.columns = R.columns ? a(R.columns, v, w + 1) : [], v;
        });
      };
      return a(d);
    }, C(e, "debugColumns", "getAllColumns")),
    getAllFlatColumns: S(() => [i.getAllColumns()], (d) => d.flatMap((a) => a.getFlatColumns()), C(e, "debugColumns", "getAllFlatColumns")),
    _getAllFlatColumnsById: S(() => [i.getAllFlatColumns()], (d) => d.reduce((a, f) => (a[f.id] = f, a), {}), C(e, "debugColumns", "getAllFlatColumnsById")),
    getAllLeafColumns: S(() => [i.getAllColumns(), i._getOrderColumnsFn()], (d, a) => {
      let f = d.flatMap((p) => p.getLeafColumns());
      return a(f);
    }, C(e, "debugColumns", "getAllLeafColumns")),
    getColumn: (d) => {
      const a = i._getAllFlatColumnsById()[d];
      return process.env.NODE_ENV !== "production" && !a && console.error(`[Table] Column with id '${d}' does not exist.`), a;
    }
  };
  Object.assign(i, h);
  for (let d = 0; d < i._features.length; d++) {
    const a = i._features[d];
    a == null || a.createTable == null || a.createTable(i);
  }
  return i;
}
function Nt() {
  return (e) => S(() => [e.options.data], (o) => {
    const t = {
      rows: [],
      flatRows: [],
      rowsById: {}
    }, n = function(i, s, r) {
      s === void 0 && (s = 0);
      const l = [];
      for (let g = 0; g < i.length; g++) {
        const c = q(e, e._getRowId(i[g], g, r), i[g], g, s, void 0, r == null ? void 0 : r.id);
        if (t.flatRows.push(c), t.rowsById[c.id] = c, l.push(c), e.options.getSubRows) {
          var u;
          c.originalSubRows = e.options.getSubRows(i[g], g), (u = c.originalSubRows) != null && u.length && (c.subRows = n(c.originalSubRows, s + 1, c));
        }
      }
      return l;
    };
    return t.rows = n(o), t;
  }, C(e.options, "debugTable", "getRowModel", () => e._autoResetPageIndex()));
}
function qt() {
  return (e) => S(() => [e.getState().expanded, e.getPreExpandedRowModel(), e.options.paginateExpandedRows], (o, t, n) => !t.rows.length || o !== !0 && !Object.keys(o ?? {}).length || !n ? t : Ie(t), C(e.options, "debugTable", "getExpandedRowModel"));
}
function Ie(e) {
  const o = [], t = (n) => {
    var i;
    o.push(n), (i = n.subRows) != null && i.length && n.getIsExpanded() && n.subRows.forEach(t);
  };
  return e.rows.forEach(t), {
    rows: o,
    flatRows: e.flatRows,
    rowsById: e.rowsById
  };
}
function bt() {
  return (e, o) => S(() => {
    var t;
    return [(t = e.getColumn(o)) == null ? void 0 : t.getFacetedRowModel()];
  }, (t) => {
    if (!t) return;
    const n = t.flatRows.flatMap((r) => {
      var l;
      return (l = r.getUniqueValues(o)) != null ? l : [];
    }).map(Number).filter((r) => !Number.isNaN(r));
    if (!n.length) return;
    let i = n[0], s = n[n.length - 1];
    for (const r of n)
      r < i ? i = r : r > s && (s = r);
    return [i, s];
  }, C(e.options, "debugTable", "getFacetedMinMaxValues"));
}
function Ee(e, o, t) {
  return t.options.filterFromLeafRows ? Ct(e, o, t) : wt(e, o, t);
}
function Ct(e, o, t) {
  var n;
  const i = [], s = {}, r = (n = t.options.maxLeafRowFilterDepth) != null ? n : 100, l = function(u, g) {
    g === void 0 && (g = 0);
    const c = [];
    for (let d = 0; d < u.length; d++) {
      var h;
      let a = u[d];
      const f = q(t, a.id, a.original, a.index, a.depth, void 0, a.parentId);
      if (f.columnFilters = a.columnFilters, (h = a.subRows) != null && h.length && g < r) {
        if (f.subRows = l(a.subRows, g + 1), a = f, o(a) && !f.subRows.length) {
          c.push(a), s[a.id] = a, i.push(a);
          continue;
        }
        if (o(a) || f.subRows.length) {
          c.push(a), s[a.id] = a, i.push(a);
          continue;
        }
      } else
        a = f, o(a) && (c.push(a), s[a.id] = a, i.push(a));
    }
    return c;
  };
  return {
    rows: l(e),
    flatRows: i,
    rowsById: s
  };
}
function wt(e, o, t) {
  var n;
  const i = [], s = {}, r = (n = t.options.maxLeafRowFilterDepth) != null ? n : 100, l = function(u, g) {
    g === void 0 && (g = 0);
    const c = [];
    for (let d = 0; d < u.length; d++) {
      let a = u[d];
      if (o(a)) {
        var h;
        if ((h = a.subRows) != null && h.length && g < r) {
          const p = q(t, a.id, a.original, a.index, a.depth, void 0, a.parentId);
          p.subRows = l(a.subRows, g + 1), a = p;
        }
        c.push(a), i.push(a), s[a.id] = a;
      }
    }
    return c;
  };
  return {
    rows: l(e),
    flatRows: i,
    rowsById: s
  };
}
function jt() {
  return (e, o) => S(() => [e.getPreFilteredRowModel(), e.getState().columnFilters, e.getState().globalFilter, e.getFilteredRowModel()], (t, n, i) => {
    if (!t.rows.length || !(n != null && n.length) && !i)
      return t;
    const s = [...n.map((l) => l.id).filter((l) => l !== o), i ? "__global__" : void 0].filter(Boolean), r = (l) => {
      for (let u = 0; u < s.length; u++)
        if (l.columnFilters[s[u]] === !1)
          return !1;
      return !0;
    };
    return Ee(t.rows, r, e);
  }, C(e.options, "debugTable", "getFacetedRowModel"));
}
function Ut() {
  return (e, o) => S(() => {
    var t;
    return [(t = e.getColumn(o)) == null ? void 0 : t.getFacetedRowModel()];
  }, (t) => {
    if (!t) return /* @__PURE__ */ new Map();
    let n = /* @__PURE__ */ new Map();
    for (let s = 0; s < t.flatRows.length; s++) {
      const r = t.flatRows[s].getUniqueValues(o);
      for (let l = 0; l < r.length; l++) {
        const u = r[l];
        if (n.has(u)) {
          var i;
          n.set(u, ((i = n.get(u)) != null ? i : 0) + 1);
        } else
          n.set(u, 1);
      }
    }
    return n;
  }, C(e.options, "debugTable", `getFacetedUniqueValues_${o}`));
}
function Wt() {
  return (e) => S(() => [e.getPreFilteredRowModel(), e.getState().columnFilters, e.getState().globalFilter], (o, t, n) => {
    if (!o.rows.length || !(t != null && t.length) && !n) {
      for (let d = 0; d < o.flatRows.length; d++)
        o.flatRows[d].columnFilters = {}, o.flatRows[d].columnFiltersMeta = {};
      return o;
    }
    const i = [], s = [];
    (t ?? []).forEach((d) => {
      var a;
      const f = e.getColumn(d.id);
      if (!f)
        return;
      const p = f.getFilterFn();
      if (!p) {
        process.env.NODE_ENV !== "production" && console.warn(`Could not find a valid 'column.filterFn' for column with the ID: ${f.id}.`);
        return;
      }
      i.push({
        id: d.id,
        filterFn: p,
        resolvedValue: (a = p.resolveFilterValue == null ? void 0 : p.resolveFilterValue(d.value)) != null ? a : d.value
      });
    });
    const r = (t ?? []).map((d) => d.id), l = e.getGlobalFilterFn(), u = e.getAllLeafColumns().filter((d) => d.getCanGlobalFilter());
    n && l && u.length && (r.push("__global__"), u.forEach((d) => {
      var a;
      s.push({
        id: d.id,
        filterFn: l,
        resolvedValue: (a = l.resolveFilterValue == null ? void 0 : l.resolveFilterValue(n)) != null ? a : n
      });
    }));
    let g, c;
    for (let d = 0; d < o.flatRows.length; d++) {
      const a = o.flatRows[d];
      if (a.columnFilters = {}, i.length)
        for (let f = 0; f < i.length; f++) {
          g = i[f];
          const p = g.id;
          a.columnFilters[p] = g.filterFn(a, p, g.resolvedValue, (w) => {
            a.columnFiltersMeta[p] = w;
          });
        }
      if (s.length) {
        for (let f = 0; f < s.length; f++) {
          c = s[f];
          const p = c.id;
          if (c.filterFn(a, p, c.resolvedValue, (w) => {
            a.columnFiltersMeta[p] = w;
          })) {
            a.columnFilters.__global__ = !0;
            break;
          }
        }
        a.columnFilters.__global__ !== !0 && (a.columnFilters.__global__ = !1);
      }
    }
    const h = (d) => {
      for (let a = 0; a < r.length; a++)
        if (d.columnFilters[r[a]] === !1)
          return !1;
      return !0;
    };
    return Ee(o.rows, h, e);
  }, C(e.options, "debugTable", "getFilteredRowModel", () => e._autoResetPageIndex()));
}
function Kt() {
  return (e) => S(() => [e.getState().grouping, e.getPreGroupedRowModel()], (o, t) => {
    if (!t.rows.length || !o.length)
      return t.rows.forEach((u) => {
        u.depth = 0, u.parentId = void 0;
      }), t;
    const n = o.filter((u) => e.getColumn(u)), i = [], s = {}, r = function(u, g, c) {
      if (g === void 0 && (g = 0), g >= n.length)
        return u.map((f) => (f.depth = g, i.push(f), s[f.id] = f, f.subRows && (f.subRows = r(f.subRows, g + 1, f.id)), f));
      const h = n[g], d = vt(u, h);
      return Array.from(d.entries()).map((f, p) => {
        let [w, m] = f, v = `${h}:${w}`;
        v = c ? `${c}>${v}` : v;
        const R = r(m, g + 1, v);
        R.forEach((F) => {
          F.parentId = v;
        });
        const x = g ? Se(m, (F) => F.subRows) : m, _ = q(e, v, x[0].original, p, g, void 0, c);
        return Object.assign(_, {
          groupingColumnId: h,
          groupingValue: w,
          subRows: R,
          leafRows: x,
          getValue: (F) => {
            if (n.includes(F)) {
              if (_._valuesCache.hasOwnProperty(F))
                return _._valuesCache[F];
              if (m[0]) {
                var A;
                _._valuesCache[F] = (A = m[0].getValue(F)) != null ? A : void 0;
              }
              return _._valuesCache[F];
            }
            if (_._groupingValuesCache.hasOwnProperty(F))
              return _._groupingValuesCache[F];
            const z = e.getColumn(F), H = z == null ? void 0 : z.getAggregationFn();
            if (H)
              return _._groupingValuesCache[F] = H(F, x, m), _._groupingValuesCache[F];
          }
        }), R.forEach((F) => {
          i.push(F), s[F.id] = F;
        }), _;
      });
    }, l = r(t.rows, 0);
    return l.forEach((u) => {
      i.push(u), s[u.id] = u;
    }), {
      rows: l,
      flatRows: i,
      rowsById: s
    };
  }, C(e.options, "debugTable", "getGroupedRowModel", () => {
    e._queue(() => {
      e._autoResetExpanded(), e._autoResetPageIndex();
    });
  }));
}
function vt(e, o) {
  const t = /* @__PURE__ */ new Map();
  return e.reduce((n, i) => {
    const s = `${i.getGroupingValue(o)}`, r = n.get(s);
    return r ? r.push(i) : n.set(s, [i]), n;
  }, t);
}
function Xt(e) {
  return (o) => S(() => [o.getState().pagination, o.getPrePaginationRowModel(), o.options.paginateExpandedRows ? void 0 : o.getState().expanded], (t, n) => {
    if (!n.rows.length)
      return n;
    const {
      pageSize: i,
      pageIndex: s
    } = t;
    let {
      rows: r,
      flatRows: l,
      rowsById: u
    } = n;
    const g = i * s, c = g + i;
    r = r.slice(g, c);
    let h;
    o.options.paginateExpandedRows ? h = {
      rows: r,
      flatRows: l,
      rowsById: u
    } : h = Ie({
      rows: r,
      flatRows: l,
      rowsById: u
    }), h.flatRows = [];
    const d = (a) => {
      h.flatRows.push(a), a.subRows.length && a.subRows.forEach(d);
    };
    return h.rows.forEach(d), h;
  }, C(o.options, "debugTable", "getPaginationRowModel"));
}
function Yt() {
  return (e) => S(() => [e.getState().sorting, e.getPreSortedRowModel()], (o, t) => {
    if (!t.rows.length || !(o != null && o.length))
      return t;
    const n = e.getState().sorting, i = [], s = n.filter((u) => {
      var g;
      return (g = e.getColumn(u.id)) == null ? void 0 : g.getCanSort();
    }), r = {};
    s.forEach((u) => {
      const g = e.getColumn(u.id);
      g && (r[u.id] = {
        sortUndefined: g.columnDef.sortUndefined,
        invertSorting: g.columnDef.invertSorting,
        sortingFn: g.getSortingFn()
      });
    });
    const l = (u) => {
      const g = u.map((c) => ({
        ...c
      }));
      return g.sort((c, h) => {
        for (let a = 0; a < s.length; a += 1) {
          var d;
          const f = s[a], p = r[f.id], w = p.sortUndefined, m = (d = f == null ? void 0 : f.desc) != null ? d : !1;
          let v = 0;
          if (w) {
            const R = c.getValue(f.id), x = h.getValue(f.id), _ = R === void 0, F = x === void 0;
            if (_ || F) {
              if (w === "first") return _ ? -1 : 1;
              if (w === "last") return _ ? 1 : -1;
              v = _ && F ? 0 : _ ? w : -w;
            }
          }
          if (v === 0 && (v = p.sortingFn(c, h, f.id)), v !== 0)
            return m && (v *= -1), p.invertSorting && (v *= -1), v;
        }
        return c.index - h.index;
      }), g.forEach((c) => {
        var h;
        i.push(c), (h = c.subRows) != null && h.length && (c.subRows = l(c.subRows));
      }), g;
    };
    return {
      rows: l(t.rows),
      flatRows: i,
      rowsById: t.rowsById
    };
  }, C(e.options, "debugTable", "getSortedRowModel", () => e._autoResetPageIndex()));
}
/**
   * react-table
   *
   * Copyright (c) TanStack
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   */
function Jt(e, o) {
  return e ? Rt(e) ? /* @__PURE__ */ P.createElement(e, o) : e : null;
}
function Rt(e) {
  return _t(e) || typeof e == "function" || Ft(e);
}
function _t(e) {
  return typeof e == "function" && (() => {
    const o = Object.getPrototypeOf(e);
    return o.prototype && o.prototype.isReactComponent;
  })();
}
function Ft(e) {
  return typeof e == "object" && typeof e.$$typeof == "symbol" && ["react.memo", "react.forward_ref"].includes(e.$$typeof.description);
}
function Zt(e) {
  const o = {
    state: {},
    // Dummy state
    onStateChange: () => {
    },
    // noop
    renderFallbackValue: null,
    ...e
  }, [t] = P.useState(() => ({
    current: St(o)
  })), [n, i] = P.useState(() => t.current.initialState);
  return t.current.setOptions((s) => ({
    ...s,
    ...e,
    state: {
      ...n,
      ...e.state
    },
    // Similarly, we'll maintain both our internal state and any user-provided
    // state.
    onStateChange: (r) => {
      i(r), e.onStateChange == null || e.onStateChange(r);
    }
  })), t.current;
}
function O(e, o, t) {
  let n = t.initialDeps ?? [], i, s = !0;
  function r() {
    var l, u, g;
    let c;
    t.key && ((l = t.debug) != null && l.call(t)) && (c = Date.now());
    const h = e();
    if (!(h.length !== n.length || h.some((f, p) => n[p] !== f)))
      return i;
    n = h;
    let a;
    if (t.key && ((u = t.debug) != null && u.call(t)) && (a = Date.now()), i = o(...h), t.key && ((g = t.debug) != null && g.call(t))) {
      const f = Math.round((Date.now() - c) * 100) / 100, p = Math.round((Date.now() - a) * 100) / 100, w = p / 16, m = (v, R) => {
        for (v = String(v); v.length < R; )
          v = " " + v;
        return v;
      };
      console.info(
        `%c⏱ ${m(p, 5)} /${m(f, 5)} ms`,
        `
            font-size: .6rem;
            font-weight: bold;
            color: hsl(${Math.max(
          0,
          Math.min(120 - 120 * w, 120)
        )}deg 100% 31%);`,
        t == null ? void 0 : t.key
      );
    }
    return t != null && t.onChange && !(s && t.skipInitialOnChange) && t.onChange(i), s = !1, i;
  }
  return r.updateDeps = (l) => {
    n = l;
  }, r;
}
function ae(e, o) {
  if (e === void 0)
    throw new Error("Unexpected undefined");
  return e;
}
const xt = (e, o) => Math.abs(e - o) < 1.01, Mt = (e, o, t) => {
  let n;
  return function(...i) {
    e.clearTimeout(n), n = e.setTimeout(() => o.apply(this, i), t);
  };
}, ge = (e) => {
  const { offsetWidth: o, offsetHeight: t } = e;
  return { width: o, height: t };
}, $t = (e) => e, It = (e) => {
  const o = Math.max(e.startIndex - e.overscan, 0), t = Math.min(e.endIndex + e.overscan, e.count - 1), n = [];
  for (let i = o; i <= t; i++)
    n.push(i);
  return n;
}, Et = (e, o) => {
  const t = e.scrollElement;
  if (!t)
    return;
  const n = e.targetWindow;
  if (!n)
    return;
  const i = (r) => {
    const { width: l, height: u } = r;
    o({ width: Math.round(l), height: Math.round(u) });
  };
  if (i(ge(t)), !n.ResizeObserver)
    return () => {
    };
  const s = new n.ResizeObserver((r) => {
    const l = () => {
      const u = r[0];
      if (u != null && u.borderBoxSize) {
        const g = u.borderBoxSize[0];
        if (g) {
          i({ width: g.inlineSize, height: g.blockSize });
          return;
        }
      }
      i(ge(t));
    };
    e.options.useAnimationFrameWithResizeObserver ? requestAnimationFrame(l) : l();
  });
  return s.observe(t, { box: "border-box" }), () => {
    s.unobserve(t);
  };
}, de = {
  passive: !0
}, ce = typeof window > "u" ? !0 : "onscrollend" in window, yt = (e, o) => {
  const t = e.scrollElement;
  if (!t)
    return;
  const n = e.targetWindow;
  if (!n)
    return;
  let i = 0;
  const s = e.options.useScrollendEvent && ce ? () => {
  } : Mt(
    n,
    () => {
      o(i, !1);
    },
    e.options.isScrollingResetDelay
  ), r = (c) => () => {
    const { horizontal: h, isRtl: d } = e.options;
    i = h ? t.scrollLeft * (d && -1 || 1) : t.scrollTop, s(), o(i, c);
  }, l = r(!0), u = r(!1);
  t.addEventListener("scroll", l, de);
  const g = e.options.useScrollendEvent && ce;
  return g && t.addEventListener("scrollend", u, de), () => {
    t.removeEventListener("scroll", l), g && t.removeEventListener("scrollend", u);
  };
}, Vt = (e, o, t) => {
  if (o != null && o.borderBoxSize) {
    const n = o.borderBoxSize[0];
    if (n)
      return Math.round(
        n[t.options.horizontal ? "inlineSize" : "blockSize"]
      );
  }
  return e[t.options.horizontal ? "offsetWidth" : "offsetHeight"];
}, Pt = (e, {
  adjustments: o = 0,
  behavior: t
}, n) => {
  var i, s;
  const r = e + o;
  (s = (i = n.scrollElement) == null ? void 0 : i.scrollTo) == null || s.call(i, {
    [n.options.horizontal ? "left" : "top"]: r,
    behavior: t
  });
};
class Ot {
  constructor(o) {
    this.unsubs = [], this.scrollElement = null, this.targetWindow = null, this.isScrolling = !1, this.scrollState = null, this.measurementsCache = [], this.itemSizeCache = /* @__PURE__ */ new Map(), this.laneAssignments = /* @__PURE__ */ new Map(), this.pendingMeasuredCacheIndexes = [], this.prevLanes = void 0, this.lanesChangedFlag = !1, this.lanesSettling = !1, this.scrollRect = null, this.scrollOffset = null, this.scrollDirection = null, this.scrollAdjustments = 0, this.elementsCache = /* @__PURE__ */ new Map(), this.now = () => {
      var t, n, i;
      return ((i = (n = (t = this.targetWindow) == null ? void 0 : t.performance) == null ? void 0 : n.now) == null ? void 0 : i.call(n)) ?? Date.now();
    }, this.observer = /* @__PURE__ */ (() => {
      let t = null;
      const n = () => t || (!this.targetWindow || !this.targetWindow.ResizeObserver ? null : t = new this.targetWindow.ResizeObserver((i) => {
        i.forEach((s) => {
          const r = () => {
            const l = s.target, u = this.indexFromElement(l);
            if (!l.isConnected) {
              this.observer.unobserve(l);
              return;
            }
            this.shouldMeasureDuringScroll(u) && this.resizeItem(
              u,
              this.options.measureElement(l, s, this)
            );
          };
          this.options.useAnimationFrameWithResizeObserver ? requestAnimationFrame(r) : r();
        });
      }));
      return {
        disconnect: () => {
          var i;
          (i = n()) == null || i.disconnect(), t = null;
        },
        observe: (i) => {
          var s;
          return (s = n()) == null ? void 0 : s.observe(i, { box: "border-box" });
        },
        unobserve: (i) => {
          var s;
          return (s = n()) == null ? void 0 : s.unobserve(i);
        }
      };
    })(), this.range = null, this.setOptions = (t) => {
      Object.entries(t).forEach(([n, i]) => {
        typeof i > "u" && delete t[n];
      }), this.options = {
        debug: !1,
        initialOffset: 0,
        overscan: 1,
        paddingStart: 0,
        paddingEnd: 0,
        scrollPaddingStart: 0,
        scrollPaddingEnd: 0,
        horizontal: !1,
        getItemKey: $t,
        rangeExtractor: It,
        onChange: () => {
        },
        measureElement: Vt,
        initialRect: { width: 0, height: 0 },
        scrollMargin: 0,
        gap: 0,
        indexAttribute: "data-index",
        initialMeasurementsCache: [],
        lanes: 1,
        isScrollingResetDelay: 150,
        enabled: !0,
        isRtl: !1,
        useScrollendEvent: !1,
        useAnimationFrameWithResizeObserver: !1,
        ...t
      };
    }, this.notify = (t) => {
      var n, i;
      (i = (n = this.options).onChange) == null || i.call(n, this, t);
    }, this.maybeNotify = O(
      () => (this.calculateRange(), [
        this.isScrolling,
        this.range ? this.range.startIndex : null,
        this.range ? this.range.endIndex : null
      ]),
      (t) => {
        this.notify(t);
      },
      {
        key: process.env.NODE_ENV !== "production" && "maybeNotify",
        debug: () => this.options.debug,
        initialDeps: [
          this.isScrolling,
          this.range ? this.range.startIndex : null,
          this.range ? this.range.endIndex : null
        ]
      }
    ), this.cleanup = () => {
      this.unsubs.filter(Boolean).forEach((t) => t()), this.unsubs = [], this.observer.disconnect(), this.rafId != null && this.targetWindow && (this.targetWindow.cancelAnimationFrame(this.rafId), this.rafId = null), this.scrollState = null, this.scrollElement = null, this.targetWindow = null;
    }, this._didMount = () => () => {
      this.cleanup();
    }, this._willUpdate = () => {
      var t;
      const n = this.options.enabled ? this.options.getScrollElement() : null;
      if (this.scrollElement !== n) {
        if (this.cleanup(), !n) {
          this.maybeNotify();
          return;
        }
        this.scrollElement = n, this.scrollElement && "ownerDocument" in this.scrollElement ? this.targetWindow = this.scrollElement.ownerDocument.defaultView : this.targetWindow = ((t = this.scrollElement) == null ? void 0 : t.window) ?? null, this.elementsCache.forEach((i) => {
          this.observer.observe(i);
        }), this.unsubs.push(
          this.options.observeElementRect(this, (i) => {
            this.scrollRect = i, this.maybeNotify();
          })
        ), this.unsubs.push(
          this.options.observeElementOffset(this, (i, s) => {
            this.scrollAdjustments = 0, this.scrollDirection = s ? this.getScrollOffset() < i ? "forward" : "backward" : null, this.scrollOffset = i, this.isScrolling = s, this.scrollState && this.scheduleScrollReconcile(), this.maybeNotify();
          })
        ), this._scrollToOffset(this.getScrollOffset(), {
          adjustments: void 0,
          behavior: void 0
        });
      }
    }, this.rafId = null, this.getSize = () => this.options.enabled ? (this.scrollRect = this.scrollRect ?? this.options.initialRect, this.scrollRect[this.options.horizontal ? "width" : "height"]) : (this.scrollRect = null, 0), this.getScrollOffset = () => this.options.enabled ? (this.scrollOffset = this.scrollOffset ?? (typeof this.options.initialOffset == "function" ? this.options.initialOffset() : this.options.initialOffset), this.scrollOffset) : (this.scrollOffset = null, 0), this.getFurthestMeasurement = (t, n) => {
      const i = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map();
      for (let r = n - 1; r >= 0; r--) {
        const l = t[r];
        if (i.has(l.lane))
          continue;
        const u = s.get(
          l.lane
        );
        if (u == null || l.end > u.end ? s.set(l.lane, l) : l.end < u.end && i.set(l.lane, !0), i.size === this.options.lanes)
          break;
      }
      return s.size === this.options.lanes ? Array.from(s.values()).sort((r, l) => r.end === l.end ? r.index - l.index : r.end - l.end)[0] : void 0;
    }, this.getMeasurementOptions = O(
      () => [
        this.options.count,
        this.options.paddingStart,
        this.options.scrollMargin,
        this.options.getItemKey,
        this.options.enabled,
        this.options.lanes
      ],
      (t, n, i, s, r, l) => (this.prevLanes !== void 0 && this.prevLanes !== l && (this.lanesChangedFlag = !0), this.prevLanes = l, this.pendingMeasuredCacheIndexes = [], {
        count: t,
        paddingStart: n,
        scrollMargin: i,
        getItemKey: s,
        enabled: r,
        lanes: l
      }),
      {
        key: !1
      }
    ), this.getMeasurements = O(
      () => [this.getMeasurementOptions(), this.itemSizeCache],
      ({ count: t, paddingStart: n, scrollMargin: i, getItemKey: s, enabled: r, lanes: l }, u) => {
        if (!r)
          return this.measurementsCache = [], this.itemSizeCache.clear(), this.laneAssignments.clear(), [];
        if (this.laneAssignments.size > t)
          for (const d of this.laneAssignments.keys())
            d >= t && this.laneAssignments.delete(d);
        this.lanesChangedFlag && (this.lanesChangedFlag = !1, this.lanesSettling = !0, this.measurementsCache = [], this.itemSizeCache.clear(), this.laneAssignments.clear(), this.pendingMeasuredCacheIndexes = []), this.measurementsCache.length === 0 && !this.lanesSettling && (this.measurementsCache = this.options.initialMeasurementsCache, this.measurementsCache.forEach((d) => {
          this.itemSizeCache.set(d.key, d.size);
        }));
        const g = this.lanesSettling ? 0 : this.pendingMeasuredCacheIndexes.length > 0 ? Math.min(...this.pendingMeasuredCacheIndexes) : 0;
        this.pendingMeasuredCacheIndexes = [], this.lanesSettling && this.measurementsCache.length === t && (this.lanesSettling = !1);
        const c = this.measurementsCache.slice(0, g), h = new Array(l).fill(
          void 0
        );
        for (let d = 0; d < g; d++) {
          const a = c[d];
          a && (h[a.lane] = d);
        }
        for (let d = g; d < t; d++) {
          const a = s(d), f = this.laneAssignments.get(d);
          let p, w;
          if (f !== void 0 && this.options.lanes > 1) {
            p = f;
            const x = h[p], _ = x !== void 0 ? c[x] : void 0;
            w = _ ? _.end + this.options.gap : n + i;
          } else {
            const x = this.options.lanes === 1 ? c[d - 1] : this.getFurthestMeasurement(c, d);
            w = x ? x.end + this.options.gap : n + i, p = x ? x.lane : d % this.options.lanes, this.options.lanes > 1 && this.laneAssignments.set(d, p);
          }
          const m = u.get(a), v = typeof m == "number" ? m : this.options.estimateSize(d), R = w + v;
          c[d] = {
            index: d,
            start: w,
            size: v,
            end: R,
            key: a,
            lane: p
          }, h[p] = d;
        }
        return this.measurementsCache = c, c;
      },
      {
        key: process.env.NODE_ENV !== "production" && "getMeasurements",
        debug: () => this.options.debug
      }
    ), this.calculateRange = O(
      () => [
        this.getMeasurements(),
        this.getSize(),
        this.getScrollOffset(),
        this.options.lanes
      ],
      (t, n, i, s) => this.range = t.length > 0 && n > 0 ? Dt({
        measurements: t,
        outerSize: n,
        scrollOffset: i,
        lanes: s
      }) : null,
      {
        key: process.env.NODE_ENV !== "production" && "calculateRange",
        debug: () => this.options.debug
      }
    ), this.getVirtualIndexes = O(
      () => {
        let t = null, n = null;
        const i = this.calculateRange();
        return i && (t = i.startIndex, n = i.endIndex), this.maybeNotify.updateDeps([this.isScrolling, t, n]), [
          this.options.rangeExtractor,
          this.options.overscan,
          this.options.count,
          t,
          n
        ];
      },
      (t, n, i, s, r) => s === null || r === null ? [] : t({
        startIndex: s,
        endIndex: r,
        overscan: n,
        count: i
      }),
      {
        key: process.env.NODE_ENV !== "production" && "getVirtualIndexes",
        debug: () => this.options.debug
      }
    ), this.indexFromElement = (t) => {
      const n = this.options.indexAttribute, i = t.getAttribute(n);
      return i ? parseInt(i, 10) : (console.warn(
        `Missing attribute name '${n}={index}' on measured element.`
      ), -1);
    }, this.shouldMeasureDuringScroll = (t) => {
      var n;
      if (!this.scrollState || this.scrollState.behavior !== "smooth")
        return !0;
      const i = this.scrollState.index ?? ((n = this.getVirtualItemForOffset(this.scrollState.lastTargetOffset)) == null ? void 0 : n.index);
      if (i !== void 0 && this.range) {
        const s = Math.max(
          this.options.overscan,
          Math.ceil((this.range.endIndex - this.range.startIndex) / 2)
        ), r = Math.max(0, i - s), l = Math.min(
          this.options.count - 1,
          i + s
        );
        return t >= r && t <= l;
      }
      return !0;
    }, this.measureElement = (t) => {
      if (!t) {
        this.elementsCache.forEach((r, l) => {
          r.isConnected || (this.observer.unobserve(r), this.elementsCache.delete(l));
        });
        return;
      }
      const n = this.indexFromElement(t), i = this.options.getItemKey(n), s = this.elementsCache.get(i);
      s !== t && (s && this.observer.unobserve(s), this.observer.observe(t), this.elementsCache.set(i, t)), (!this.isScrolling || this.scrollState) && this.shouldMeasureDuringScroll(n) && this.resizeItem(n, this.options.measureElement(t, void 0, this));
    }, this.resizeItem = (t, n) => {
      var i;
      const s = this.measurementsCache[t];
      if (!s) return;
      const r = this.itemSizeCache.get(s.key) ?? s.size, l = n - r;
      l !== 0 && (((i = this.scrollState) == null ? void 0 : i.behavior) !== "smooth" && (this.shouldAdjustScrollPositionOnItemSizeChange !== void 0 ? this.shouldAdjustScrollPositionOnItemSizeChange(s, l, this) : s.start < this.getScrollOffset() + this.scrollAdjustments) && (process.env.NODE_ENV !== "production" && this.options.debug && console.info("correction", l), this._scrollToOffset(this.getScrollOffset(), {
        adjustments: this.scrollAdjustments += l,
        behavior: void 0
      })), this.pendingMeasuredCacheIndexes.push(s.index), this.itemSizeCache = new Map(this.itemSizeCache.set(s.key, n)), this.notify(!1));
    }, this.getVirtualItems = O(
      () => [this.getVirtualIndexes(), this.getMeasurements()],
      (t, n) => {
        const i = [];
        for (let s = 0, r = t.length; s < r; s++) {
          const l = t[s], u = n[l];
          i.push(u);
        }
        return i;
      },
      {
        key: process.env.NODE_ENV !== "production" && "getVirtualItems",
        debug: () => this.options.debug
      }
    ), this.getVirtualItemForOffset = (t) => {
      const n = this.getMeasurements();
      if (n.length !== 0)
        return ae(
          n[ye(
            0,
            n.length - 1,
            (i) => ae(n[i]).start,
            t
          )]
        );
    }, this.getMaxScrollOffset = () => {
      if (!this.scrollElement) return 0;
      if ("scrollHeight" in this.scrollElement)
        return this.options.horizontal ? this.scrollElement.scrollWidth - this.scrollElement.clientWidth : this.scrollElement.scrollHeight - this.scrollElement.clientHeight;
      {
        const t = this.scrollElement.document.documentElement;
        return this.options.horizontal ? t.scrollWidth - this.scrollElement.innerWidth : t.scrollHeight - this.scrollElement.innerHeight;
      }
    }, this.getOffsetForAlignment = (t, n, i = 0) => {
      if (!this.scrollElement) return 0;
      const s = this.getSize(), r = this.getScrollOffset();
      n === "auto" && (n = t >= r + s ? "end" : "start"), n === "center" ? t += (i - s) / 2 : n === "end" && (t -= s);
      const l = this.getMaxScrollOffset();
      return Math.max(Math.min(l, t), 0);
    }, this.getOffsetForIndex = (t, n = "auto") => {
      t = Math.max(0, Math.min(t, this.options.count - 1));
      const i = this.getSize(), s = this.getScrollOffset(), r = this.measurementsCache[t];
      if (!r) return;
      if (n === "auto")
        if (r.end >= s + i - this.options.scrollPaddingEnd)
          n = "end";
        else if (r.start <= s + this.options.scrollPaddingStart)
          n = "start";
        else
          return [s, n];
      if (n === "end" && t === this.options.count - 1)
        return [this.getMaxScrollOffset(), n];
      const l = n === "end" ? r.end + this.options.scrollPaddingEnd : r.start - this.options.scrollPaddingStart;
      return [
        this.getOffsetForAlignment(l, n, r.size),
        n
      ];
    }, this.scrollToOffset = (t, { align: n = "start", behavior: i = "auto" } = {}) => {
      const s = this.getOffsetForAlignment(t, n), r = this.now();
      this.scrollState = {
        index: null,
        align: n,
        behavior: i,
        startedAt: r,
        lastTargetOffset: s,
        stableFrames: 0
      }, this._scrollToOffset(s, { adjustments: void 0, behavior: i }), this.scheduleScrollReconcile();
    }, this.scrollToIndex = (t, {
      align: n = "auto",
      behavior: i = "auto"
    } = {}) => {
      t = Math.max(0, Math.min(t, this.options.count - 1));
      const s = this.getOffsetForIndex(t, n);
      if (!s)
        return;
      const [r, l] = s, u = this.now();
      this.scrollState = {
        index: t,
        align: l,
        behavior: i,
        startedAt: u,
        lastTargetOffset: r,
        stableFrames: 0
      }, this._scrollToOffset(r, { adjustments: void 0, behavior: i }), this.scheduleScrollReconcile();
    }, this.scrollBy = (t, { behavior: n = "auto" } = {}) => {
      const i = this.getScrollOffset() + t, s = this.now();
      this.scrollState = {
        index: null,
        align: "start",
        behavior: n,
        startedAt: s,
        lastTargetOffset: i,
        stableFrames: 0
      }, this._scrollToOffset(i, { adjustments: void 0, behavior: n }), this.scheduleScrollReconcile();
    }, this.getTotalSize = () => {
      var t;
      const n = this.getMeasurements();
      let i;
      if (n.length === 0)
        i = this.options.paddingStart;
      else if (this.options.lanes === 1)
        i = ((t = n[n.length - 1]) == null ? void 0 : t.end) ?? 0;
      else {
        const s = Array(this.options.lanes).fill(null);
        let r = n.length - 1;
        for (; r >= 0 && s.some((l) => l === null); ) {
          const l = n[r];
          s[l.lane] === null && (s[l.lane] = l.end), r--;
        }
        i = Math.max(...s.filter((l) => l !== null));
      }
      return Math.max(
        i - this.options.scrollMargin + this.options.paddingEnd,
        0
      );
    }, this._scrollToOffset = (t, {
      adjustments: n,
      behavior: i
    }) => {
      this.options.scrollToFn(t, { behavior: i, adjustments: n }, this);
    }, this.measure = () => {
      this.itemSizeCache = /* @__PURE__ */ new Map(), this.laneAssignments = /* @__PURE__ */ new Map(), this.notify(!1);
    }, this.setOptions(o);
  }
  scheduleScrollReconcile() {
    if (!this.targetWindow) {
      this.scrollState = null;
      return;
    }
    this.rafId == null && (this.rafId = this.targetWindow.requestAnimationFrame(() => {
      this.rafId = null, this.reconcileScroll();
    }));
  }
  reconcileScroll() {
    if (!this.scrollState || !this.scrollElement) return;
    if (this.now() - this.scrollState.startedAt > 5e3) {
      this.scrollState = null;
      return;
    }
    const n = this.scrollState.index != null ? this.getOffsetForIndex(this.scrollState.index, this.scrollState.align) : void 0, i = n ? n[0] : this.scrollState.lastTargetOffset, s = 1, r = i !== this.scrollState.lastTargetOffset;
    if (!r && xt(i, this.getScrollOffset())) {
      if (this.scrollState.stableFrames++, this.scrollState.stableFrames >= s) {
        this.scrollState = null;
        return;
      }
    } else
      this.scrollState.stableFrames = 0, r && (this.scrollState.lastTargetOffset = i, this.scrollState.behavior = "auto", this._scrollToOffset(i, {
        adjustments: void 0,
        behavior: "auto"
      }));
    this.scheduleScrollReconcile();
  }
}
const ye = (e, o, t, n) => {
  for (; e <= o; ) {
    const i = (e + o) / 2 | 0, s = t(i);
    if (s < n)
      e = i + 1;
    else if (s > n)
      o = i - 1;
    else
      return i;
  }
  return e > 0 ? e - 1 : 0;
};
function Dt({
  measurements: e,
  outerSize: o,
  scrollOffset: t,
  lanes: n
}) {
  const i = e.length - 1, s = (u) => e[u].start;
  if (e.length <= n)
    return {
      startIndex: 0,
      endIndex: i
    };
  let r = ye(
    0,
    i,
    s,
    t
  ), l = r;
  if (n === 1)
    for (; l < i && e[l].end < t + o; )
      l++;
  else if (n > 1) {
    const u = Array(n).fill(0);
    for (; l < i && u.some((c) => c < t + o); ) {
      const c = e[l];
      u[c.lane] = c.end, l++;
    }
    const g = Array(n).fill(t + o);
    for (; r >= 0 && g.some((c) => c >= t); ) {
      const c = e[r];
      g[c.lane] = c.start, r--;
    }
    r = Math.max(0, r - r % n), l = Math.min(i, l + (n - 1 - l % n));
  }
  return { startIndex: r, endIndex: l };
}
const fe = typeof document < "u" ? P.useLayoutEffect : P.useEffect;
function At({
  useFlushSync: e = !0,
  ...o
}) {
  const t = P.useReducer(() => ({}), {})[1], n = {
    ...o,
    onChange: (s, r) => {
      var l;
      e && r ? Oe(t) : t(), (l = o.onChange) == null || l.call(o, s, r);
    }
  }, [i] = P.useState(
    () => new Ot(n)
  );
  return i.setOptions(n), fe(() => i._didMount(), []), fe(() => i._willUpdate()), i;
}
function Qt(e) {
  return At({
    observeElementRect: Et,
    observeElementOffset: yt,
    scrollToFn: Pt,
    ...e
  });
}
const zt = "3JTyZyY8eV4fGYfMufrfO3lfbNocg+HpOcMq5DP2rKE=";
function pe(e) {
  const t = e.padEnd(e.length + (4 - e.length % 4) % 4, "=").replace(/-/g, "+").replace(/_/g, "/"), n = atob(t);
  return Uint8Array.from(n, (i) => i.charCodeAt(0)).buffer;
}
let he = null;
function Lt() {
  return he ?? (he = crypto.subtle.importKey(
    "raw",
    Uint8Array.from(atob(zt), (e) => e.charCodeAt(0)),
    { name: "Ed25519" },
    !1,
    ["verify"]
  )), he;
}
async function Gt(e) {
  if (!e) return { valid: !1, reason: "No license key provided." };
  const o = e.split(".");
  if (o.length !== 3 || o[0] !== "PCBGRID1")
    return { valid: !1, reason: "Malformed PCB-Grid license key." };
  try {
    const t = pe(o[1]), n = pe(o[2]), i = await Lt();
    if (!await crypto.subtle.verify({ name: "Ed25519" }, i, n, t))
      return { valid: !1, reason: "License signature is invalid — this key was not issued by PCB-Grid." };
    const r = JSON.parse(new TextDecoder().decode(t));
    return r.expiresAt && new Date(r.expiresAt).getTime() < Date.now() ? { valid: !1, payload: r, reason: `PCB-Grid license for "${r.team}" expired on ${r.expiresAt}.` } : { valid: !0, payload: r };
  } catch {
    return { valid: !1, reason: "Could not parse PCB-Grid license key." };
  }
}
const me = /* @__PURE__ */ new Set();
function en(e) {
  const o = e ?? "__missing__";
  me.has(o) || (me.add(o), Gt(e).then((t) => {
    t.valid || console.warn(
      `[PCB-Grid] ${t.reason ?? "Unlicensed."} Request a license key from the PCB platform team before using this grid in production.`
    );
  }));
}
export {
  kt as B,
  Tt as S,
  Qt as a,
  Nt as b,
  en as c,
  Xt as d,
  Kt as e,
  Jt as f,
  Yt as g,
  qt as h,
  Wt as i,
  jt as j,
  Ut as k,
  bt as l,
  Zt as u
};
