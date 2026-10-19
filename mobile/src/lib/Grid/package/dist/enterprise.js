var Dr = Object.defineProperty;
var Or = (n, t, e) => t in n ? Dr(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e;
var P = (n, t, e) => Or(n, typeof t != "symbol" ? t + "" : t, e);
import { jsx as g, jsxs as _, Fragment as Ut } from "react/jsx-runtime";
import zr, { useState as R, useCallback as ft, useEffect as ut, useRef as ne, useMemo as H, forwardRef as ta } from "react";
import { c as Rr, B as Lr, S as Ir, b as Er, g as Vr, d as Wr, e as Hr, h as jr, i as $r, j as Yr, k as Ur, l as Gr, u as Xr, a as Kr, f as hi } from "./license-BDHB6t-k.js";
const Bs = Symbol.for("constructDateFrom");
function En(n, t) {
  return typeof n == "function" ? n(t) : n && typeof n == "object" && Bs in n ? n[Bs](t) : n instanceof Date ? new n.constructor(t) : new Date(t);
}
function At(n, t) {
  return En(t || n, n);
}
function qr(n, t, e) {
  const i = At(n, e == null ? void 0 : e.in);
  return isNaN(t) ? En(n, NaN) : (i.setDate(i.getDate() + t), i);
}
function Yi(n, t, e) {
  const i = At(n, e == null ? void 0 : e.in);
  if (isNaN(t)) return En(n, NaN);
  if (!t)
    return i;
  const s = i.getDate(), o = En(n, i.getTime());
  o.setMonth(i.getMonth() + t + 1, 0);
  const a = o.getDate();
  return s >= a ? o : (i.setFullYear(
    o.getFullYear(),
    o.getMonth(),
    s
  ), i);
}
let Jr = {};
function ea() {
  return Jr;
}
function As(n, t) {
  var r, l, c, d;
  const e = ea(), i = (t == null ? void 0 : t.weekStartsOn) ?? ((l = (r = t == null ? void 0 : t.locale) == null ? void 0 : r.options) == null ? void 0 : l.weekStartsOn) ?? e.weekStartsOn ?? ((d = (c = e.locale) == null ? void 0 : c.options) == null ? void 0 : d.weekStartsOn) ?? 0, s = At(n, t == null ? void 0 : t.in), o = s.getDay(), a = (o < i ? 7 : 0) + o - i;
  return s.setDate(s.getDate() - a), s.setHours(0, 0, 0, 0), s;
}
function Zr(n, t, e) {
  return qr(n, t * 7, e);
}
function na(n, t, e) {
  return Yi(n, t * 12, e);
}
function fi(n, t) {
  const e = At(n, t == null ? void 0 : t.in), i = e.getMonth();
  return e.setFullYear(e.getFullYear(), i + 1, 0), e.setHours(23, 59, 59, 999), e;
}
function ui(n, t) {
  const e = At(n, t == null ? void 0 : t.in);
  return e.setDate(1), e.setHours(0, 0, 0, 0), e;
}
function gi(n, t) {
  const e = At(n, t == null ? void 0 : t.in), i = e.getFullYear();
  return e.setFullYear(i + 1, 0, 0), e.setHours(23, 59, 59, 999), e;
}
function pi(n, t) {
  const e = At(n, t == null ? void 0 : t.in);
  return e.setFullYear(e.getFullYear(), 0, 1), e.setHours(0, 0, 0, 0), e;
}
function Fs(n, t) {
  var r, l, c, d;
  const e = ea(), i = (t == null ? void 0 : t.weekStartsOn) ?? ((l = (r = t == null ? void 0 : t.locale) == null ? void 0 : r.options) == null ? void 0 : l.weekStartsOn) ?? e.weekStartsOn ?? ((d = (c = e.locale) == null ? void 0 : c.options) == null ? void 0 : d.weekStartsOn) ?? 0, s = At(n, t == null ? void 0 : t.in), o = s.getDay(), a = (o < i ? -7 : 0) + 6 - (o - i);
  return s.setDate(s.getDate() + a), s.setHours(23, 59, 59, 999), s;
}
function Ps(n, t, e) {
  const i = +At(n, e == null ? void 0 : e.in), [s, o] = [
    +At(t.start, e == null ? void 0 : e.in),
    +At(t.end, e == null ? void 0 : e.in)
  ].sort((a, r) => a - r);
  return i >= s && i <= o;
}
function Qr(n, t, e) {
  return Yi(n, -1, e);
}
function tl(n, t, e) {
  return na(n, -1, e);
}
function Fi(n, t) {
  const e = Number(n), i = String(n ?? "").toLowerCase();
  switch (t.condition) {
    case "lt":
      return !isNaN(e) && e < Number(t.value1);
    case "gt":
      return !isNaN(e) && e > Number(t.value1);
    case "eq":
      return i === t.value1.toLowerCase();
    case "between":
      return !isNaN(e) && e >= Number(t.value1) && e <= Number(t.value2);
    case "contains":
      return i.includes(t.value1.toLowerCase());
    case "isEmpty":
      return !n || i === "";
    case "isTrue":
      return n === !0 || i === "true";
    case "isFalse":
      return n === !1 || i === "false";
  }
}
function el(n, t, e) {
  for (const i of e) {
    const s = i.column === "*" ? t : i.column;
    if (i.column !== "*" && i.column !== t) continue;
    const o = n[s];
    if (Fi(o, i))
      return { backgroundColor: i.bgColor, color: i.textColor };
  }
}
function nl(n, t) {
  for (const e of t) {
    if (e.column === "*") {
      const i = Object.values(n)[0];
      if (Fi(i, e))
        return { backgroundColor: e.bgColor, color: e.textColor };
    }
    if (e.column === "isActive" && (e.condition === "isTrue" || e.condition === "isFalse")) {
      const i = n.isActive;
      if (Fi(i, e))
        return { backgroundColor: e.bgColor, color: e.textColor };
    }
  }
}
function il(n, t) {
  switch (n) {
    case "Today": {
      const e = new Date(t);
      e.setHours(0, 0, 0, 0);
      const i = new Date(t);
      return i.setHours(23, 59, 59, 999), { start: e, end: i };
    }
    case "Yesterday": {
      const e = new Date(t);
      e.setDate(e.getDate() - 1), e.setHours(0, 0, 0, 0);
      const i = new Date(e);
      return i.setHours(23, 59, 59, 999), { start: e, end: i };
    }
    case "This Week":
      return { start: As(t, { weekStartsOn: 1 }), end: Fs(t, { weekStartsOn: 1 }) };
    case "Next Week": {
      const e = Zr(t, 1);
      return { start: As(e, { weekStartsOn: 1 }), end: Fs(e, { weekStartsOn: 1 }) };
    }
    case "Last Month": {
      const e = Qr(t);
      return { start: ui(e), end: fi(e) };
    }
    case "This Month":
      return { start: ui(t), end: fi(t) };
    case "Next Month": {
      const e = Yi(t, 1);
      return { start: ui(e), end: fi(e) };
    }
    case "Last Year": {
      const e = tl(t);
      return { start: pi(e), end: gi(e) };
    }
    case "This Year":
      return { start: pi(t), end: gi(t) };
    case "Next Year": {
      const e = na(t, 1);
      return { start: pi(e), end: gi(e) };
    }
    default:
      return null;
  }
}
function sl(n, t) {
  return t ? String(n ?? "").toLowerCase().includes(t.toLowerCase()) : !0;
}
function ol(n, t, e) {
  const i = Number(n);
  return !(isNaN(i) || t && i < Number(t) || e && i > Number(e));
}
function al(n, t, e, i) {
  if (!t && !e) return !0;
  const s = new Date(String(n ?? ""));
  if (isNaN(s.getTime())) return !1;
  if (t.startsWith("__periods__:")) {
    const a = t.replace("__periods__:", "").split("|").map((l) => l.trim()).filter(Boolean);
    if (a.length === 0) return !0;
    const r = i ?? /* @__PURE__ */ new Date();
    return a.some((l) => {
      const c = il(l, r);
      return c ? Ps(s, c) : !1;
    });
  }
  if (t.startsWith("__values__:")) {
    const a = new Set(t.replace("__values__:", "").split("|").map((l) => l.trim()).filter(Boolean));
    if (a.size === 0) return !0;
    const r = s.toISOString().slice(0, 10);
    return a.has(r);
  }
  if (t && e) {
    const a = /* @__PURE__ */ new Date(`${t}T00:00:00.000`), r = /* @__PURE__ */ new Date(`${e}T23:59:59.999`);
    return Ps(s, { start: a, end: r });
  }
  if (t) {
    const a = /* @__PURE__ */ new Date(`${t}T00:00:00.000`);
    return s >= a;
  }
  const o = /* @__PURE__ */ new Date(`${e}T23:59:59.999`);
  return s <= o;
}
function rl(n, t) {
  if (!t || t === "all") return !0;
  const e = !!n;
  return t === "true" ? e : t === "false" ? !e : !0;
}
function ll(n, t) {
  if (!t) return !0;
  const e = t.split(",").map((i) => i.trim()).filter(Boolean);
  return e.length <= 1 ? String(n ?? "") === t : e.includes(String(n ?? ""));
}
function cl(n, t, e) {
  switch (t.type) {
    case "text":
      return sl(n, t.value);
    case "number":
      return ol(n, t.value, t.valueTo ?? "");
    case "date":
      return al(n, t.value, t.valueTo ?? "", e);
    case "boolean":
      return rl(n, t.value);
    case "select":
      return ll(n, t.value);
    case "multiselect":
      return !t.values || t.values.length === 0 ? !0 : t.values.includes(String(n ?? ""));
  }
}
function dl() {
  const [n, t] = R(null), e = ft((s, o, a, r) => {
    s.preventDefault(), s.stopPropagation(), t({ x: s.clientX, y: s.clientY, target: o, columnId: a, rowIndex: r });
  }, []), i = ft(() => t(null), []);
  return ut(() => {
    if (!n) return;
    const s = () => t(null);
    return document.addEventListener("click", s), document.addEventListener("contextmenu", s), () => {
      document.removeEventListener("click", s), document.removeEventListener("contextmenu", s);
    };
  }, [n]), { menu: n, openMenu: e, closeMenu: i };
}
function hl(n, t) {
  const e = URL.createObjectURL(n), i = document.createElement("a");
  i.href = e, i.download = t, document.body.appendChild(i), i.click(), document.body.removeChild(i), URL.revokeObjectURL(e);
}
function fl(n) {
  const t = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), e = ft((a = !1) => {
    const r = a ? n.getSelectedRowModel().rows : n.getSortedRowModel().rows, l = n.getVisibleLeafColumns(), c = r[0], d = l.filter((u) => {
      if (u.id.startsWith("_")) return !1;
      if (c) {
        const p = c.getValue(u.id);
        if (Array.isArray(p)) return !1;
      }
      return !0;
    }), h = d.map((u) => u.columnDef.header ?? u.id), f = r.map((u) => d.map((p) => u.getValue(p.id)));
    return { headers: h, data: f };
  }, [n]), i = ft(
    (a = `grid-export-${t()}.csv`, r = !1) => {
      const { headers: l, data: c } = e(r), d = (u) => {
        const p = String(u ?? "");
        return p.includes(",") || p.includes('"') || p.includes(`
`) ? `"${p.replace(/"/g, '""')}"` : p;
      }, h = [l.map(d).join(","), ...c.map((u) => u.map(d).join(","))].join(`
`), f = new Blob(["\uFEFF" + h], { type: "text/csv;charset=utf-8;" });
      hl(f, a);
    },
    [e]
  ), s = ft(
    async (a = `grid-export-${t()}.xlsx`, r = !1) => {
      const l = await import("./xlsx-CZNBZqms.js"), { headers: c, data: d } = e(r), h = [c, ...d], f = l.utils.aoa_to_sheet(h);
      f["!cols"] = c.map((p, m) => {
        const x = Math.max(
          String(c[m]).length,
          ...d.map((v) => String(v[m] ?? "").length)
        );
        return { wch: Math.min(x + 2, 40) };
      });
      const u = l.utils.book_new();
      l.utils.book_append_sheet(u, f, "Data"), l.writeFile(u, a);
    },
    [e]
  ), o = ft(
    async (a = `grid-export-${t()}`, r = !1) => {
      const { headers: l, data: c } = e(r), { default: d } = await import("./jspdf.es.min-EWkPWmJW.js").then((A) => A.j), { default: h } = await import("./jspdf.plugin.autotable-BWwdgleA.js"), f = new d({ orientation: "landscape", unit: "mm" }), u = f.internal.pageSize.getWidth(), p = a.replace(/-\d{4}-\d{2}-\d{2}$/, "").replace(/-/g, " ");
      f.setFillColor(30, 58, 95), f.rect(0, 0, u, 18, "F"), f.setFontSize(12), f.setTextColor(240, 246, 255), f.setFont("helvetica", "bold"), f.text(p, 12, 11), f.setFontSize(8), f.setFont("helvetica", "normal"), f.setTextColor(147, 180, 212), f.text(`Generated: ${(/* @__PURE__ */ new Date()).toLocaleString()}`, u - 12, 11, { align: "right" }), f.text(`Rows: ${c.length}`, u - 12, 15.5, { align: "right" });
      const m = (A) => {
        const D = String(A ?? ""), N = D.match(/^(\d{4}-\d{2}-\d{2})T/);
        return N ? N[1] : D;
      }, x = c.map((A) => A.map(m)), v = u - 10, w = 22, k = l.map((A, D) => {
        const N = x.reduce((J, st) => Math.max(J, st[D].length), 0);
        return Math.min(Math.max(A.length, N, 5), w);
      }), M = k.reduce((A, D) => A + D, 0) || 1, C = k.map((A) => Math.max(14, A / M * v)), b = l.length > 14 ? 6.5 : l.length > 9 ? 7.5 : 9, T = l.reduce((A, D, N) => (A[N] = {
        halign: /qty|amount|price|discount|tax|^id$/i.test(D) ? "right" : "left",
        cellWidth: C[N]
      }, A), {});
      h(f, {
        head: [l],
        body: x,
        startY: 22,
        columnStyles: T,
        margin: { left: 5, right: 5 },
        tableWidth: v,
        styles: {
          fontSize: b,
          cellPadding: { top: 2, bottom: 2, left: 3, right: 3 },
          overflow: "linebreak",
          font: "helvetica",
          textColor: [17, 24, 39],
          minCellHeight: 8
        },
        headStyles: {
          fillColor: [30, 58, 95],
          textColor: [240, 246, 255],
          fontStyle: "bold",
          fontSize: b,
          halign: "left",
          overflow: "linebreak"
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        tableLineColor: [229, 231, 235],
        tableLineWidth: 0.2,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        didDrawPage: (A) => {
          const D = A.pageNumber;
          A.doc.setFontSize(8), A.doc.setTextColor(107, 114, 128), A.doc.text(`Page ${D}`, u / 2, f.internal.pageSize.getHeight() - 5, { align: "center" });
        }
      });
      const B = f.lastAutoTable;
      B != null && B.finalY && (f.setFontSize(8), f.setTextColor(107, 114, 128), f.text(`Total rows: ${c.length}`, 14, B.finalY + 6)), f.save(`${a}.pdf`);
    },
    [e]
  );
  return { exportCSV: i, exportExcel: s, exportPDF: o };
}
function ia(n) {
  return `enterprise-grid-views-${n}`;
}
function ul(n) {
  try {
    const t = localStorage.getItem(ia(n));
    return t ? JSON.parse(t) : [];
  } catch {
    return [];
  }
}
function gl(n, t) {
  try {
    localStorage.setItem(ia(n), JSON.stringify(t));
  } catch {
  }
}
function pl(n = "default") {
  const [t, e] = R(() => ul(n));
  ut(() => {
    gl(n, t);
  }, [n, t]);
  const i = ft((r) => {
    e((l) => {
      const c = l.findIndex((d) => d.name === r.name);
      if (c >= 0) {
        const d = [...l];
        return d[c] = { ...r, isDefault: d[c].isDefault }, d;
      }
      return [...l, r];
    });
  }, []), s = ft((r) => {
    e((l) => l.filter((c) => c.name !== r));
  }, []), o = ft((r) => {
    e((l) => {
      var d;
      const c = ((d = l.find((h) => h.name === r)) == null ? void 0 : d.isDefault) === !0;
      return l.map((h) => ({
        ...h,
        isDefault: c ? !1 : h.name === r
      }));
    });
  }, []), a = t.find((r) => r.isDefault) ?? null;
  return { views: t, saveView: i, deleteView: s, setDefaultView: o, defaultView: a };
}
function ml(n, t) {
  if (t.has(n)) return "number";
  const e = n.toLowerCase();
  return e.includes("date") || e.endsWith("_at") || e.endsWith("_on") ? "date" : "text";
}
function bl(n, t) {
  return n.find((e) => e.columnId === t);
}
function xl(n, t) {
  const e = n.findIndex((i) => i.columnId === t.columnId);
  if (!t.value && !t.valueTo)
    return n.filter((i) => i.columnId !== t.columnId);
  if (e >= 0) {
    const i = [...n];
    return i[e] = t, i;
  }
  return [...n, t];
}
function yl({ column: n, filter: t, onChange: e }) {
  const [i, s] = R(!1), [o, a] = R((t == null ? void 0 : t.value) ?? ""), r = ne(null), l = H(() => {
    const d = Array.from(n.getFacetedUniqueValues().keys()).map((h) => String(h ?? "")).sort((h, f) => h.localeCompare(f));
    return o ? d.filter((h) => h.toLowerCase().includes(o.toLowerCase())).slice(0, 10) : d.slice(0, 10);
  }, [n, o]);
  return ut(() => {
    if (!i) return;
    const c = (d) => {
      r.current && !r.current.contains(d.target) && s(!1);
    };
    return document.addEventListener("mousedown", c), () => document.removeEventListener("mousedown", c);
  }, [i]), /* @__PURE__ */ _("div", { className: "eg-filter-select-wrapper", ref: r, children: [
    /* @__PURE__ */ g(
      "input",
      {
        className: "eg-filter-input",
        type: "text",
        placeholder: "Filter...",
        value: o,
        onChange: (c) => {
          a(c.target.value), e({ columnId: n.id, type: "text", value: c.target.value }), s(!0);
        },
        onFocus: () => s(!0)
      }
    ),
    i && l.length > 0 && /* @__PURE__ */ g("div", { className: "eg-filter-dropdown", children: l.map((c) => /* @__PURE__ */ g(
      "div",
      {
        className: `eg-filter-dropdown-item ${o === c ? "selected" : ""}`,
        onMouseDown: () => {
          a(c), e({ columnId: n.id, type: "text", value: c }), s(!1);
        },
        children: c
      },
      c
    )) })
  ] });
}
function vl({ columnId: n, filter: t, onChange: e, column: i }) {
  const [s, o] = i.getFacetedMinMaxValues() ?? [void 0, void 0];
  return /* @__PURE__ */ _("div", { className: "eg-filter-range", children: [
    /* @__PURE__ */ g(
      "input",
      {
        className: "eg-filter-input",
        type: "number",
        placeholder: s != null ? `Min ${Math.floor(s)}` : "Min",
        value: (t == null ? void 0 : t.value) ?? "",
        onChange: (a) => e({ columnId: n, type: "number", value: a.target.value, valueTo: t == null ? void 0 : t.valueTo })
      }
    ),
    /* @__PURE__ */ g(
      "input",
      {
        className: "eg-filter-input",
        type: "number",
        placeholder: o != null ? `Max ${Math.ceil(o)}` : "Max",
        value: (t == null ? void 0 : t.valueTo) ?? "",
        onChange: (a) => e({ columnId: n, type: "number", value: (t == null ? void 0 : t.value) ?? "", valueTo: a.target.value })
      }
    )
  ] });
}
function _l({ columnId: n, filter: t, onChange: e }) {
  return /* @__PURE__ */ _("div", { className: "eg-filter-range", children: [
    /* @__PURE__ */ g(
      "input",
      {
        className: "eg-filter-input",
        type: "date",
        value: (t == null ? void 0 : t.value) ?? "",
        onChange: (i) => e({ columnId: n, type: "date", value: i.target.value, valueTo: t == null ? void 0 : t.valueTo })
      }
    ),
    /* @__PURE__ */ g(
      "input",
      {
        className: "eg-filter-input",
        type: "date",
        value: (t == null ? void 0 : t.valueTo) ?? "",
        onChange: (i) => e({ columnId: n, type: "date", value: (t == null ? void 0 : t.value) ?? "", valueTo: i.target.value })
      }
    )
  ] });
}
function wl({ column: n, filter: t, onChange: e }) {
  const [i, s] = R(!1), o = ne(null), a = H(() => Array.from(n.getFacetedUniqueValues().keys()).map((d) => String(d ?? "")).filter(Boolean).sort((d, h) => d.localeCompare(h)), [n]), r = (t == null ? void 0 : t.values) ?? [];
  ut(() => {
    if (!i) return;
    const d = (h) => {
      o.current && !o.current.contains(h.target) && s(!1);
    };
    return document.addEventListener("mousedown", d), () => document.removeEventListener("mousedown", d);
  }, [i]);
  const l = (d) => {
    const h = r.includes(d) ? r.filter((f) => f !== d) : [...r, d];
    e({ columnId: n.id, type: "multiselect", value: h.join(","), values: h });
  }, c = r.length === 0 ? "All" : r.length === 1 ? r[0] : `${r.length} selected`;
  return /* @__PURE__ */ _("div", { ref: o, style: { position: "relative" }, children: [
    /* @__PURE__ */ _(
      "button",
      {
        type: "button",
        className: "eg-filter-input",
        style: { width: "100%", textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2px 6px", height: 26 },
        onClick: () => s((d) => !d),
        children: [
          /* @__PURE__ */ g("span", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "calc(100% - 16px)", fontSize: 11 }, children: c }),
          /* @__PURE__ */ g("span", { style: { fontSize: 9, opacity: 0.6 }, children: "▼" })
        ]
      }
    ),
    i && /* @__PURE__ */ _(
      "div",
      {
        className: "eg-filter-dropdown",
        style: { maxHeight: 180, overflowY: "auto", zIndex: 1e3, minWidth: 140 },
        children: [
          /* @__PURE__ */ g(
            "div",
            {
              className: `eg-filter-dropdown-item ${r.length === 0 ? "selected" : ""}`,
              onMouseDown: () => {
                e({ columnId: n.id, type: "multiselect", value: "", values: [] }), s(!1);
              },
              children: "All"
            }
          ),
          a.map((d) => /* @__PURE__ */ _(
            "div",
            {
              className: `eg-filter-dropdown-item ${r.includes(d) ? "selected" : ""}`,
              onMouseDown: () => l(d),
              style: { display: "flex", alignItems: "center", gap: 6 },
              children: [
                /* @__PURE__ */ g("span", { style: {
                  width: 12,
                  height: 12,
                  border: "1px solid var(--filter-input-border)",
                  borderRadius: 2,
                  background: r.includes(d) ? "var(--accent)" : "transparent",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }, children: r.includes(d) && /* @__PURE__ */ g("span", { style: { color: "#fff", fontSize: 9, lineHeight: 1 }, children: "✓" }) }),
                d
              ]
            },
            d
          ))
        ]
      }
    )
  ] });
}
function Sl({ columnId: n, filter: t, onChange: e, data: i }) {
  const s = H(() => ["", ...[...new Set(i.map((a) => String(a[n] ?? "")))].sort()], [i, n]);
  return /* @__PURE__ */ _(
    "select",
    {
      className: "eg-filter-input",
      value: (t == null ? void 0 : t.value) ?? "",
      onChange: (o) => e({ columnId: n, type: "select", value: o.target.value }),
      children: [
        /* @__PURE__ */ g("option", { value: "", children: "All" }),
        s.filter(Boolean).map((o) => /* @__PURE__ */ g("option", { value: o, children: o }, o))
      ]
    }
  );
}
function Cl({ table: n, filters: t, onFilterChange: e, data: i, numericColIds: s }) {
  const o = (r) => {
    e(xl(t, r));
  }, a = n.getVisibleLeafColumns();
  return /* @__PURE__ */ g("tr", { className: "eg-filter-row", children: a.map((r) => {
    if (r.id.startsWith("_"))
      return /* @__PURE__ */ g("td", { className: "eg-filter-cell", style: { width: r.getSize() } }, r.id);
    const l = ml(r.id, s), c = bl(t, r.id), d = r.getFacetedUniqueValues().size, h = l === "text" && d > 0 && d <= 20 ? "multiselect" : l;
    return /* @__PURE__ */ _("td", { className: "eg-filter-cell", children: [
      h === "multiselect" && /* @__PURE__ */ g(wl, { column: r, filter: c, onChange: o }),
      h === "text" && /* @__PURE__ */ g(yl, { column: r, filter: c, onChange: o }),
      h === "number" && /* @__PURE__ */ g(vl, { column: r, columnId: r.id, filter: c, onChange: o }),
      h === "date" && /* @__PURE__ */ g(_l, { columnId: r.id, filter: c, onChange: o }),
      h === "select" && /* @__PURE__ */ g(Sl, { columnId: r.id, filter: c, onChange: o, data: i })
    ] }, r.id);
  }) });
}
function kl({ menu: n, onClose: t, headerActions: e, bodyActions: i }) {
  const s = n.target === "header" ? e : i, o = {
    left: Math.min(n.x, window.innerWidth - 240),
    top: Math.min(n.y, window.innerHeight - s.length * 36 - 20)
  };
  return /* @__PURE__ */ g("div", { className: "eg-ctx-menu", style: o, onClick: (a) => a.stopPropagation(), children: s.map((a, r) => /* @__PURE__ */ _(zr.Fragment, { children: [
    /* @__PURE__ */ _(
      "button",
      {
        type: "button",
        className: `eg-ctx-item ${a.danger ? "danger" : ""}`,
        onClick: () => {
          a.onClick(), t();
        },
        children: [
          /* @__PURE__ */ g("span", { className: "eg-ctx-item-icon", children: a.icon }),
          /* @__PURE__ */ g("span", { className: "eg-ctx-item-text", children: a.label }),
          a.shortcut && /* @__PURE__ */ g("span", { className: "eg-ctx-item-shortcut", children: a.shortcut })
        ]
      }
    ),
    a.separator && /* @__PURE__ */ g("div", { className: "eg-ctx-sep" })
  ] }, a.label || `sep-${r}`)) });
}
const ct = {
  filter: /* @__PURE__ */ g("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: /* @__PURE__ */ g("path", { d: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z" }) }),
  group: /* @__PURE__ */ _("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
    /* @__PURE__ */ g("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
    /* @__PURE__ */ g("path", { d: "M3 9h18M3 15h18" })
  ] }),
  expand: /* @__PURE__ */ g("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: /* @__PURE__ */ g("path", { d: "M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" }) }),
  compress: /* @__PURE__ */ g("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: /* @__PURE__ */ g("path", { d: "M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" }) }),
  csv: /* @__PURE__ */ _("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
    /* @__PURE__ */ g("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
    /* @__PURE__ */ g("polyline", { points: "14 2 14 8 20 8" }),
    /* @__PURE__ */ g("line", { x1: "16", y1: "13", x2: "8", y2: "13" }),
    /* @__PURE__ */ g("line", { x1: "16", y1: "17", x2: "8", y2: "17" })
  ] }),
  excel: /* @__PURE__ */ _("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
    /* @__PURE__ */ g("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
    /* @__PURE__ */ g("polyline", { points: "14 2 14 8 20 8" }),
    /* @__PURE__ */ g("path", { d: "M8 13l4 4M12 13l-4 4" })
  ] }),
  pdf: /* @__PURE__ */ _("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
    /* @__PURE__ */ g("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
    /* @__PURE__ */ g("polyline", { points: "14 2 14 8 20 8" }),
    /* @__PURE__ */ g("text", { x: "6", y: "19", fontSize: "5", fill: "currentColor", stroke: "none", fontWeight: "bold", children: "PDF" })
  ] }),
  chart: /* @__PURE__ */ _("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
    /* @__PURE__ */ g("line", { x1: "18", y1: "20", x2: "18", y2: "10" }),
    /* @__PURE__ */ g("line", { x1: "12", y1: "20", x2: "12", y2: "4" }),
    /* @__PURE__ */ g("line", { x1: "6", y1: "20", x2: "6", y2: "14" })
  ] }),
  columns: /* @__PURE__ */ _("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
    /* @__PURE__ */ g("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
    /* @__PURE__ */ g("path", { d: "M9 3v18M15 3v18" })
  ] }),
  format: /* @__PURE__ */ _("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
    /* @__PURE__ */ g("circle", { cx: "12", cy: "12", r: "3" }),
    /* @__PURE__ */ g("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" })
  ] }),
  save: /* @__PURE__ */ _("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
    /* @__PURE__ */ g("path", { d: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" }),
    /* @__PURE__ */ g("polyline", { points: "17 21 17 13 7 13 7 21" }),
    /* @__PURE__ */ g("polyline", { points: "7 3 7 8 15 8" })
  ] }),
  load: /* @__PURE__ */ _("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
    /* @__PURE__ */ g("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
    /* @__PURE__ */ g("polyline", { points: "17 8 12 3 7 8" }),
    /* @__PURE__ */ g("line", { x1: "12", y1: "3", x2: "12", y2: "15" })
  ] }),
  clear: /* @__PURE__ */ _("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
    /* @__PURE__ */ g("circle", { cx: "12", cy: "12", r: "10" }),
    /* @__PURE__ */ g("line", { x1: "15", y1: "9", x2: "9", y2: "15" }),
    /* @__PURE__ */ g("line", { x1: "9", y1: "9", x2: "15", y2: "15" })
  ] }),
  bestFit: /* @__PURE__ */ _("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
    /* @__PURE__ */ g("path", { d: "M21 3H3v18h18V3z" }),
    /* @__PURE__ */ g("path", { d: "M9 3v18M15 3v18" }),
    /* @__PURE__ */ g("path", { d: "M5 8h4M15 8h4M5 16h4M15 16h4" })
  ] }),
  pivot: /* @__PURE__ */ _("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
    /* @__PURE__ */ g("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
    /* @__PURE__ */ g("path", { d: "M3 9h18M9 3v18" })
  ] }),
  sun: /* @__PURE__ */ _("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
    /* @__PURE__ */ g("circle", { cx: "12", cy: "12", r: "5" }),
    /* @__PURE__ */ g("path", { d: "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" })
  ] }),
  moon: /* @__PURE__ */ g("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: /* @__PURE__ */ g("path", { d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" }) }),
  palette: /* @__PURE__ */ _("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
    /* @__PURE__ */ g("circle", { cx: "12", cy: "12", r: "10" }),
    /* @__PURE__ */ g("circle", { cx: "9", cy: "10", r: "1", fill: "currentColor", stroke: "none" }),
    /* @__PURE__ */ g("circle", { cx: "15", cy: "10", r: "1", fill: "currentColor", stroke: "none" }),
    /* @__PURE__ */ g("circle", { cx: "9", cy: "15", r: "1", fill: "currentColor", stroke: "none" }),
    /* @__PURE__ */ g("circle", { cx: "15", cy: "15", r: "1", fill: "currentColor", stroke: "none" }),
    /* @__PURE__ */ g("circle", { cx: "12", cy: "7", r: "1", fill: "currentColor", stroke: "none" })
  ] }),
  pages: /* @__PURE__ */ _("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: [
    /* @__PURE__ */ g("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
    /* @__PURE__ */ g("line", { x1: "3", y1: "9", x2: "21", y2: "9" }),
    /* @__PURE__ */ g("line", { x1: "3", y1: "15", x2: "21", y2: "15" })
  ] }),
  scroll: /* @__PURE__ */ _("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: [
    /* @__PURE__ */ g("line", { x1: "12", y1: "3", x2: "12", y2: "21" }),
    /* @__PURE__ */ g("polyline", { points: "8 7 12 3 16 7" }),
    /* @__PURE__ */ g("polyline", { points: "8 17 12 21 16 17" }),
    /* @__PURE__ */ g("line", { x1: "3", y1: "12", x2: "21", y2: "12" })
  ] })
};
function Ml(n) {
  return /* @__PURE__ */ _("div", { className: "eg-toolbar", children: [
    /* @__PURE__ */ _("div", { className: "eg-toolbar-search-wrap", children: [
      /* @__PURE__ */ g("span", { className: "eg-toolbar-search-icon", children: "🔍" }),
      /* @__PURE__ */ g(
        "input",
        {
          className: "eg-toolbar-search",
          type: "text",
          value: n.globalFilter,
          placeholder: "Search all columns...",
          onChange: (t) => n.onGlobalFilterChange(t.target.value),
          "aria-label": "Global search"
        }
      ),
      n.globalFilter && /* @__PURE__ */ g("button", { type: "button", className: "eg-toolbar-clear-search", onClick: () => n.onGlobalFilterChange(""), "aria-label": "Clear search", children: "✕" })
    ] }),
    /* @__PURE__ */ g("div", { className: "eg-toolbar-sep" }),
    /* @__PURE__ */ _("div", { className: "eg-btn-group", children: [
      /* @__PURE__ */ g(
        "button",
        {
          type: "button",
          className: `eg-toolbar-btn ${n.rowModelType === "pagination" ? "active" : ""}`,
          title: "Pagination — navigate by pages",
          onClick: () => n.onRowModelTypeChange("pagination"),
          children: ct.pages
        }
      ),
      /* @__PURE__ */ g(
        "button",
        {
          type: "button",
          className: `eg-toolbar-btn ${n.rowModelType === "virtual" ? "active" : ""}`,
          title: "Infinite scroll — scroll through all rows",
          onClick: () => n.onRowModelTypeChange("virtual"),
          children: ct.scroll
        }
      )
    ] }),
    /* @__PURE__ */ g("div", { className: "eg-toolbar-sep" }),
    /* @__PURE__ */ _("div", { className: "eg-toolbar-group", children: [
      /* @__PURE__ */ _(
        "button",
        {
          type: "button",
          className: `eg-toolbar-btn ${n.showFilters ? "active" : ""}`,
          title: "Toggle Filters",
          onClick: n.onToggleFilters,
          children: [
            ct.filter,
            n.hasActiveFilters && /* @__PURE__ */ g("span", { className: "eg-toolbar-badge" })
          ]
        }
      ),
      n.hasActiveFilters && /* @__PURE__ */ g("button", { type: "button", className: "eg-toolbar-btn", title: `Clear Filters (${n.activeFilterCount})`, onClick: n.onClearFilters, children: ct.clear })
    ] }),
    /* @__PURE__ */ g("div", { className: "eg-toolbar-sep" }),
    /* @__PURE__ */ g(
      "button",
      {
        type: "button",
        className: `eg-toolbar-btn ${n.showGrouping ? "active" : ""}`,
        title: "Toggle Grouping",
        onClick: n.onToggleGrouping,
        children: ct.group
      }
    ),
    /* @__PURE__ */ g(
      "button",
      {
        type: "button",
        className: `eg-toolbar-btn ${n.isPivotView ? "active" : ""}`,
        title: "Pivot View",
        onClick: n.onTogglePivot,
        children: ct.pivot
      }
    ),
    /* @__PURE__ */ g("div", { className: "eg-toolbar-sep" }),
    /* @__PURE__ */ g("button", { type: "button", className: "eg-toolbar-btn", title: "Column Chooser", onClick: n.onOpenColumnChooser, children: ct.columns }),
    /* @__PURE__ */ g("button", { type: "button", className: "eg-toolbar-btn", title: "Best Fit All Columns", onClick: n.onBestFitAll, children: ct.bestFit }),
    /* @__PURE__ */ g("div", { className: "eg-toolbar-sep" }),
    /* @__PURE__ */ g("button", { type: "button", className: "eg-toolbar-btn", title: "Export CSV", onClick: n.onExportCSV, children: ct.csv }),
    /* @__PURE__ */ g("button", { type: "button", className: "eg-toolbar-btn", title: "Export Excel", onClick: n.onExportExcel, children: ct.excel }),
    /* @__PURE__ */ g("button", { type: "button", className: "eg-toolbar-btn", title: "Export PDF", onClick: n.onExportPDF, children: ct.pdf }),
    /* @__PURE__ */ g("div", { className: "eg-toolbar-sep" }),
    /* @__PURE__ */ g("button", { type: "button", className: "eg-toolbar-btn", title: "Charts", onClick: n.onOpenChart, children: ct.chart }),
    /* @__PURE__ */ g(
      "button",
      {
        type: "button",
        className: `eg-toolbar-btn ${n.hasActiveCondFormat ? "active" : ""}`,
        title: "Conditional Formatting",
        onClick: n.onOpenConditionalFormat,
        children: ct.format
      }
    ),
    /* @__PURE__ */ g("button", { type: "button", className: "eg-toolbar-btn", title: "Save / Load Views", onClick: n.onOpenSaveView, children: ct.save }),
    /* @__PURE__ */ g("button", { type: "button", className: "eg-toolbar-btn", title: "Load View", onClick: n.onOpenLoadView, children: ct.load }),
    n.unsavedCount > 0 && /* @__PURE__ */ _(Ut, { children: [
      /* @__PURE__ */ g("div", { className: "eg-toolbar-sep" }),
      /* @__PURE__ */ _("span", { className: "eg-toolbar-label eg-toolbar-warning", children: [
        "Unsaved changes: ",
        n.unsavedCount
      ] }),
      /* @__PURE__ */ g("button", { type: "button", className: "eg-btn eg-btn-sm eg-btn-primary", onClick: n.onSaveEdits, children: "Save All" }),
      /* @__PURE__ */ g("button", { type: "button", className: "eg-btn eg-btn-sm", onClick: n.onDiscardEdits, children: "Discard" })
    ] }),
    /* @__PURE__ */ g("div", { className: "eg-toolbar-spacer" }),
    /* @__PURE__ */ g("span", { className: "eg-toolbar-label", children: n.filteredRows < n.totalRows ? `${n.filteredRows} of ${n.totalRows} rows` : `${n.totalRows} rows` }),
    n.selectedCount > 0 && /* @__PURE__ */ _("span", { className: "eg-toolbar-label", children: [
      n.selectedCount,
      " rows selected"
    ] }),
    /* @__PURE__ */ g("div", { className: "eg-toolbar-sep" }),
    /* @__PURE__ */ g(
      "select",
      {
        className: "eg-toolbar-select",
        value: n.pageSize,
        onChange: (t) => n.onPageSizeChange(Number(t.target.value)),
        children: [10, 20, 50, 100].map((t) => /* @__PURE__ */ _("option", { value: t, children: [
          t,
          " rows"
        ] }, t))
      }
    ),
    /* @__PURE__ */ g("div", { className: "eg-toolbar-sep" }),
    /* @__PURE__ */ g("button", { type: "button", className: "eg-toolbar-btn", title: n.isFullscreen ? "Exit Fullscreen" : "Fullscreen", onClick: n.onToggleFullscreen, children: n.isFullscreen ? ct.compress : ct.expand }),
    /* @__PURE__ */ g("div", { className: "eg-toolbar-sep" }),
    /* @__PURE__ */ g("button", { type: "button", className: "eg-toolbar-btn", title: "Customize Theme", onClick: n.onOpenCustomize, children: ct.palette }),
    /* @__PURE__ */ g(
      "button",
      {
        type: "button",
        className: `eg-toolbar-btn${n.theme === "dark" ? " active" : ""}`,
        title: n.theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
        onClick: n.onThemeToggle,
        children: n.theme === "dark" ? ct.sun : ct.moon
      }
    ),
    /* @__PURE__ */ _(
      "select",
      {
        className: "eg-toolbar-select",
        value: n.density,
        title: "Row Density",
        onChange: (t) => n.onDensityChange(t.target.value),
        children: [
          /* @__PURE__ */ g("option", { value: "compact", children: "Compact" }),
          /* @__PURE__ */ g("option", { value: "normal", children: "Normal" }),
          /* @__PURE__ */ g("option", { value: "comfortable", children: "Comfortable" })
        ]
      }
    )
  ] });
}
function Tl({ pageIndex: n, pageCount: t, onPageChange: e, canPreviousPage: i, canNextPage: s, rangeStart: o, rangeEnd: a, filteredTotal: r, total: l }) {
  if (t <= 1) return null;
  const c = [];
  if (t <= 7)
    for (let d = 0; d < t; d++) c.push(d);
  else {
    c.push(0), n > 2 && c.push("...");
    const d = Math.max(1, n - 1), h = Math.min(t - 2, n + 1);
    for (let f = d; f <= h; f++) c.push(f);
    n < t - 3 && c.push("..."), c.push(t - 1);
  }
  return /* @__PURE__ */ _("div", { className: "eg-pagination", children: [
    /* @__PURE__ */ g("button", { className: "eg-pag-btn", disabled: !i, onClick: () => e(0), children: "«" }),
    /* @__PURE__ */ g("button", { className: "eg-pag-btn", disabled: !i, onClick: () => e(n - 1), children: "‹" }),
    c.map(
      (d, h) => d === "..." ? /* @__PURE__ */ g("span", { className: "eg-pag-info", children: "…" }, `e${h}`) : /* @__PURE__ */ g(
        "button",
        {
          className: `eg-pag-btn ${d === n ? "active" : ""}`,
          onClick: () => e(d),
          children: d + 1
        },
        d
      )
    ),
    /* @__PURE__ */ g("button", { className: "eg-pag-btn", disabled: !s, onClick: () => e(n + 1), children: "›" }),
    /* @__PURE__ */ g("button", { className: "eg-pag-btn", disabled: !s, onClick: () => e(t - 1), children: "»" }),
    /* @__PURE__ */ _("span", { className: "eg-pag-info", children: [
      "Showing rows ",
      o,
      "-",
      a,
      " of ",
      r,
      r !== l ? ` (filtered from ${l})` : ""
    ] })
  ] });
}
function Bl({ table: n, onClose: t }) {
  var a;
  const e = n.getAllLeafColumns().filter((r) => r.id !== "select"), i = (a = n.getState().columnOrder) != null && a.length ? n.getState().columnOrder : e.map((r) => r.id), s = i.map((r) => e.find((l) => l.id === r)).filter(Boolean), o = (r, l) => {
    const c = [...i], d = c.indexOf(r), h = d + l;
    d < 0 || h < 0 || h >= c.length || ([c[d], c[h]] = [c[h], c[d]], n.setColumnOrder(c));
  };
  return /* @__PURE__ */ _("div", { className: "eg-panel", children: [
    /* @__PURE__ */ _("div", { className: "eg-panel-header", children: [
      /* @__PURE__ */ g("span", { className: "eg-panel-title", children: "Column Chooser" }),
      /* @__PURE__ */ g("button", { type: "button", className: "eg-modal-close", onClick: t, children: "✕" })
    ] }),
    /* @__PURE__ */ _("div", { className: "eg-panel-body", children: [
      /* @__PURE__ */ _("div", { className: "eg-col-chooser-actions", children: [
        /* @__PURE__ */ g("button", { type: "button", className: "eg-btn eg-btn-sm", onClick: () => e.forEach((r) => r.toggleVisibility(!0)), children: "Show All" }),
        /* @__PURE__ */ g("button", { type: "button", className: "eg-btn eg-btn-sm", onClick: () => e.forEach((r) => r.toggleVisibility(!1)), children: "Hide All" }),
        /* @__PURE__ */ g("button", { type: "button", className: "eg-btn eg-btn-sm", onClick: () => n.resetColumnOrder(), children: "Reset Defaults" })
      ] }),
      /* @__PURE__ */ g("ul", { className: "eg-col-chooser-list", children: s.map((r) => /* @__PURE__ */ _("li", { className: "eg-col-chooser-item", children: [
        /* @__PURE__ */ g(
          "input",
          {
            type: "checkbox",
            className: "eg-checkbox",
            checked: r.getIsVisible(),
            onChange: () => r.toggleVisibility()
          }
        ),
        /* @__PURE__ */ g("span", { children: r.columnDef.header ?? r.id }),
        /* @__PURE__ */ g("button", { type: "button", className: "eg-btn eg-btn-sm", onClick: (l) => {
          l.stopPropagation(), o(r.id, -1);
        }, children: "↑" }),
        /* @__PURE__ */ g("button", { type: "button", className: "eg-btn eg-btn-sm", onClick: (l) => {
          l.stopPropagation(), o(r.id, 1);
        }, children: "↓" })
      ] }, r.id)) })
    ] })
  ] });
}
const Al = [
  { value: "gt", label: "Greater than" },
  { value: "lt", label: "Less than" },
  { value: "eq", label: "Equals" },
  { value: "between", label: "Between" },
  { value: "contains", label: "Contains" },
  { value: "isEmpty", label: "Is empty" },
  { value: "isTrue", label: "Is true" },
  { value: "isFalse", label: "Is false" }
];
function Fl({
  columnDefs: n,
  customRules: t,
  onAddCustomRule: e,
  onRemoveCustomRule: i,
  onClose: s
}) {
  var f;
  const o = n.filter((u) => u.field), a = ((f = o[0]) == null ? void 0 : f.field) ?? "", [r, l] = R(!1), [c, d] = R({
    column: a,
    condition: "gt",
    value1: "",
    bgColor: "#fef9c3",
    textColor: "#854d0e"
  }), h = () => {
    !c.column || !c.condition || (e({
      id: `custom-${Date.now()}`,
      label: `${c.column} ${c.condition} ${c.value1 ?? ""}`,
      column: c.column,
      condition: c.condition,
      value1: c.value1 ?? "",
      value2: c.value2,
      bgColor: c.bgColor ?? "#fef9c3",
      textColor: c.textColor ?? "#854d0e"
    }), l(!1), d({ column: a, condition: "gt", value1: "", bgColor: "#fef9c3", textColor: "#854d0e" }));
  };
  return /* @__PURE__ */ _("div", { className: "eg-panel", children: [
    /* @__PURE__ */ _("div", { className: "eg-panel-header", children: [
      /* @__PURE__ */ g("span", { className: "eg-panel-title", children: "Conditional Formatting" }),
      /* @__PURE__ */ g("button", { type: "button", className: "eg-modal-close", onClick: s, children: "✕" })
    ] }),
    /* @__PURE__ */ _("div", { className: "eg-panel-body", children: [
      t.length === 0 && !r && /* @__PURE__ */ g("p", { style: { margin: "0 0 14px", color: "var(--cell-text-muted)", fontSize: 12 }, children: "No rules defined. Add one to highlight cells or rows." }),
      t.length > 0 && /* @__PURE__ */ _(Ut, { children: [
        /* @__PURE__ */ g("h4", { style: { margin: "0 0 10px", fontSize: 13, fontWeight: 600 }, children: "Active Rules" }),
        t.map((u) => /* @__PURE__ */ _("div", { className: "eg-cond-rule", children: [
          /* @__PURE__ */ g("div", { className: "eg-cond-preview", style: { background: u.bgColor, border: `1px solid ${u.textColor}` } }),
          /* @__PURE__ */ g("span", { className: "eg-cond-label", children: u.label }),
          /* @__PURE__ */ g("button", { type: "button", className: "eg-btn eg-btn-sm eg-btn-danger", onClick: () => i(u.id), children: "×" })
        ] }, u.id))
      ] }),
      /* @__PURE__ */ g("div", { style: { marginTop: t.length > 0 ? 18 : 0 }, children: r ? /* @__PURE__ */ _("div", { style: { border: "1px solid var(--grid-border-light)", borderRadius: 8, padding: 14 }, children: [
        /* @__PURE__ */ _("div", { className: "eg-form-group", children: [
          /* @__PURE__ */ g("label", { className: "eg-form-label", children: "Column" }),
          /* @__PURE__ */ g("select", { className: "eg-form-select", value: c.column, onChange: (u) => d({ ...c, column: u.target.value }), children: o.map((u) => /* @__PURE__ */ g("option", { value: u.field, children: u.headerName ?? u.field }, u.field)) })
        ] }),
        /* @__PURE__ */ _("div", { className: "eg-form-group", children: [
          /* @__PURE__ */ g("label", { className: "eg-form-label", children: "Condition" }),
          /* @__PURE__ */ g("select", { className: "eg-form-select", value: c.condition, onChange: (u) => d({ ...c, condition: u.target.value }), children: Al.map((u) => /* @__PURE__ */ g("option", { value: u.value, children: u.label }, u.value)) })
        ] }),
        c.condition !== "isEmpty" && c.condition !== "isTrue" && c.condition !== "isFalse" && /* @__PURE__ */ _("div", { className: "eg-form-group", children: [
          /* @__PURE__ */ g("label", { className: "eg-form-label", children: "Value" }),
          /* @__PURE__ */ g("input", { className: "eg-form-input", value: c.value1 ?? "", onChange: (u) => d({ ...c, value1: u.target.value }) })
        ] }),
        c.condition === "between" && /* @__PURE__ */ _("div", { className: "eg-form-group", children: [
          /* @__PURE__ */ g("label", { className: "eg-form-label", children: "Value 2" }),
          /* @__PURE__ */ g("input", { className: "eg-form-input", value: c.value2 ?? "", onChange: (u) => d({ ...c, value2: u.target.value }) })
        ] }),
        /* @__PURE__ */ _("div", { style: { display: "flex", gap: 8 }, children: [
          /* @__PURE__ */ _("div", { className: "eg-form-group", style: { flex: 1 }, children: [
            /* @__PURE__ */ g("label", { className: "eg-form-label", children: "BG Color" }),
            /* @__PURE__ */ g("input", { type: "color", className: "eg-form-input", style: { padding: 2, height: 34 }, value: c.bgColor ?? "#fef9c3", onChange: (u) => d({ ...c, bgColor: u.target.value }) })
          ] }),
          /* @__PURE__ */ _("div", { className: "eg-form-group", style: { flex: 1 }, children: [
            /* @__PURE__ */ g("label", { className: "eg-form-label", children: "Text Color" }),
            /* @__PURE__ */ g("input", { type: "color", className: "eg-form-input", style: { padding: 2, height: 34 }, value: c.textColor ?? "#854d0e", onChange: (u) => d({ ...c, textColor: u.target.value }) })
          ] })
        ] }),
        /* @__PURE__ */ _("div", { style: { display: "flex", gap: 8, marginTop: 8 }, children: [
          /* @__PURE__ */ g("button", { type: "button", className: "eg-btn eg-btn-primary eg-btn-sm", onClick: h, children: "Add Rule" }),
          /* @__PURE__ */ g("button", { type: "button", className: "eg-btn eg-btn-sm", onClick: () => l(!1), children: "Cancel" })
        ] })
      ] }) : /* @__PURE__ */ g("button", { type: "button", className: "eg-btn eg-btn-primary eg-btn-sm", onClick: () => l(!0), children: "+ Add Rule" }) })
    ] })
  ] });
}
function Pl({
  views: n,
  onSave: t,
  onLoad: e,
  onDelete: i,
  onSetDefault: s,
  onClose: o
}) {
  const [a, r] = R(""), l = () => {
    const d = a.trim();
    d && (t(d), r(""));
  }, c = n.find((d) => d.isDefault);
  return /* @__PURE__ */ _("div", { className: "eg-panel", children: [
    /* @__PURE__ */ _("div", { className: "eg-panel-header", children: [
      /* @__PURE__ */ g("span", { className: "eg-panel-title", children: "Views" }),
      /* @__PURE__ */ g("button", { type: "button", className: "eg-modal-close", onClick: o, children: "✕" })
    ] }),
    /* @__PURE__ */ _("div", { className: "eg-panel-body", children: [
      /* @__PURE__ */ _("div", { style: { display: "flex", gap: 8, marginBottom: 16 }, children: [
        /* @__PURE__ */ g(
          "input",
          {
            className: "eg-form-input",
            placeholder: "View name…",
            value: a,
            onChange: (d) => r(d.target.value),
            onKeyDown: (d) => d.key === "Enter" && l()
          }
        ),
        /* @__PURE__ */ g("button", { type: "button", className: "eg-btn eg-btn-primary", onClick: l, children: "Save" })
      ] }),
      c && /* @__PURE__ */ _(
        "div",
        {
          style: {
            marginBottom: 12,
            padding: "6px 10px",
            background: "#fffbeb",
            border: "1px solid #fcd34d",
            borderRadius: 6,
            fontSize: 12,
            color: "#92400e"
          },
          children: [
            "★ Default: ",
            /* @__PURE__ */ g("strong", { children: c.name }),
            " — auto-loads when you open this grid"
          ]
        }
      ),
      n.length === 0 ? /* @__PURE__ */ _("div", { className: "eg-empty", style: { padding: 30 }, children: [
        /* @__PURE__ */ g("div", { className: "eg-empty-icon", children: "📋" }),
        /* @__PURE__ */ g("div", { className: "eg-empty-text", children: "No saved views yet" })
      ] }) : n.map((d) => /* @__PURE__ */ _(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 0",
            borderBottom: "1px solid #f1f5f9"
          },
          children: [
            /* @__PURE__ */ g(
              "button",
              {
                type: "button",
                title: d.isDefault ? "Remove as default" : "Set as default (auto-loads on open)",
                onClick: () => s(d.name),
                style: {
                  fontSize: 16,
                  color: d.isDefault ? "#f59e0b" : "#cbd5e1",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0 2px",
                  lineHeight: 1,
                  flexShrink: 0
                },
                children: "★"
              }
            ),
            /* @__PURE__ */ _("span", { style: { flex: 1, fontSize: 13, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: [
              d.name,
              d.isDefault && /* @__PURE__ */ g("span", { style: { marginLeft: 4, fontSize: 11, color: "#f59e0b" }, children: "(Default)" })
            ] }),
            /* @__PURE__ */ _("div", { style: { display: "flex", gap: 4, flexShrink: 0 }, children: [
              /* @__PURE__ */ g(
                "button",
                {
                  type: "button",
                  className: "eg-btn eg-btn-sm eg-btn-primary",
                  onClick: () => {
                    e(d), o();
                  },
                  children: "Load"
                }
              ),
              /* @__PURE__ */ g(
                "button",
                {
                  type: "button",
                  className: "eg-btn eg-btn-sm eg-btn-danger",
                  onClick: () => i(d.name),
                  children: "Delete"
                }
              )
            ] })
          ]
        },
        d.name
      ))
    ] })
  ] });
}
/*!
 * @kurkle/color v0.3.4
 * https://github.com/kurkle/color#readme
 * (c) 2024 Jukka Kurkela
 * Released under the MIT License
 */
function an(n) {
  return n + 0.5 | 0;
}
const Zt = (n, t, e) => Math.max(Math.min(n, e), t);
function je(n) {
  return Zt(an(n * 2.55), 0, 255);
}
function ie(n) {
  return Zt(an(n * 255), 0, 255);
}
function Yt(n) {
  return Zt(an(n / 2.55) / 100, 0, 1);
}
function Ns(n) {
  return Zt(an(n * 100), 0, 100);
}
const Mt = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, a: 10, b: 11, c: 12, d: 13, e: 14, f: 15 }, Pi = [..."0123456789ABCDEF"], Nl = (n) => Pi[n & 15], Dl = (n) => Pi[(n & 240) >> 4] + Pi[n & 15], bn = (n) => (n & 240) >> 4 === (n & 15), Ol = (n) => bn(n.r) && bn(n.g) && bn(n.b) && bn(n.a);
function zl(n) {
  var t = n.length, e;
  return n[0] === "#" && (t === 4 || t === 5 ? e = {
    r: 255 & Mt[n[1]] * 17,
    g: 255 & Mt[n[2]] * 17,
    b: 255 & Mt[n[3]] * 17,
    a: t === 5 ? Mt[n[4]] * 17 : 255
  } : (t === 7 || t === 9) && (e = {
    r: Mt[n[1]] << 4 | Mt[n[2]],
    g: Mt[n[3]] << 4 | Mt[n[4]],
    b: Mt[n[5]] << 4 | Mt[n[6]],
    a: t === 9 ? Mt[n[7]] << 4 | Mt[n[8]] : 255
  })), e;
}
const Rl = (n, t) => n < 255 ? t(n) : "";
function Ll(n) {
  var t = Ol(n) ? Nl : Dl;
  return n ? "#" + t(n.r) + t(n.g) + t(n.b) + Rl(n.a, t) : void 0;
}
const Il = /^(hsla?|hwb|hsv)\(\s*([-+.e\d]+)(?:deg)?[\s,]+([-+.e\d]+)%[\s,]+([-+.e\d]+)%(?:[\s,]+([-+.e\d]+)(%)?)?\s*\)$/;
function sa(n, t, e) {
  const i = t * Math.min(e, 1 - e), s = (o, a = (o + n / 30) % 12) => e - i * Math.max(Math.min(a - 3, 9 - a, 1), -1);
  return [s(0), s(8), s(4)];
}
function El(n, t, e) {
  const i = (s, o = (s + n / 60) % 6) => e - e * t * Math.max(Math.min(o, 4 - o, 1), 0);
  return [i(5), i(3), i(1)];
}
function Vl(n, t, e) {
  const i = sa(n, 1, 0.5);
  let s;
  for (t + e > 1 && (s = 1 / (t + e), t *= s, e *= s), s = 0; s < 3; s++)
    i[s] *= 1 - t - e, i[s] += t;
  return i;
}
function Wl(n, t, e, i, s) {
  return n === s ? (t - e) / i + (t < e ? 6 : 0) : t === s ? (e - n) / i + 2 : (n - t) / i + 4;
}
function Ui(n) {
  const e = n.r / 255, i = n.g / 255, s = n.b / 255, o = Math.max(e, i, s), a = Math.min(e, i, s), r = (o + a) / 2;
  let l, c, d;
  return o !== a && (d = o - a, c = r > 0.5 ? d / (2 - o - a) : d / (o + a), l = Wl(e, i, s, d, o), l = l * 60 + 0.5), [l | 0, c || 0, r];
}
function Gi(n, t, e, i) {
  return (Array.isArray(t) ? n(t[0], t[1], t[2]) : n(t, e, i)).map(ie);
}
function Xi(n, t, e) {
  return Gi(sa, n, t, e);
}
function Hl(n, t, e) {
  return Gi(Vl, n, t, e);
}
function jl(n, t, e) {
  return Gi(El, n, t, e);
}
function oa(n) {
  return (n % 360 + 360) % 360;
}
function $l(n) {
  const t = Il.exec(n);
  let e = 255, i;
  if (!t)
    return;
  t[5] !== i && (e = t[6] ? je(+t[5]) : ie(+t[5]));
  const s = oa(+t[2]), o = +t[3] / 100, a = +t[4] / 100;
  return t[1] === "hwb" ? i = Hl(s, o, a) : t[1] === "hsv" ? i = jl(s, o, a) : i = Xi(s, o, a), {
    r: i[0],
    g: i[1],
    b: i[2],
    a: e
  };
}
function Yl(n, t) {
  var e = Ui(n);
  e[0] = oa(e[0] + t), e = Xi(e), n.r = e[0], n.g = e[1], n.b = e[2];
}
function Ul(n) {
  if (!n)
    return;
  const t = Ui(n), e = t[0], i = Ns(t[1]), s = Ns(t[2]);
  return n.a < 255 ? `hsla(${e}, ${i}%, ${s}%, ${Yt(n.a)})` : `hsl(${e}, ${i}%, ${s}%)`;
}
const Ds = {
  x: "dark",
  Z: "light",
  Y: "re",
  X: "blu",
  W: "gr",
  V: "medium",
  U: "slate",
  A: "ee",
  T: "ol",
  S: "or",
  B: "ra",
  C: "lateg",
  D: "ights",
  R: "in",
  Q: "turquois",
  E: "hi",
  P: "ro",
  O: "al",
  N: "le",
  M: "de",
  L: "yello",
  F: "en",
  K: "ch",
  G: "arks",
  H: "ea",
  I: "ightg",
  J: "wh"
}, Os = {
  OiceXe: "f0f8ff",
  antiquewEte: "faebd7",
  aqua: "ffff",
  aquamarRe: "7fffd4",
  azuY: "f0ffff",
  beige: "f5f5dc",
  bisque: "ffe4c4",
  black: "0",
  blanKedOmond: "ffebcd",
  Xe: "ff",
  XeviTet: "8a2be2",
  bPwn: "a52a2a",
  burlywood: "deb887",
  caMtXe: "5f9ea0",
  KartYuse: "7fff00",
  KocTate: "d2691e",
  cSO: "ff7f50",
  cSnflowerXe: "6495ed",
  cSnsilk: "fff8dc",
  crimson: "dc143c",
  cyan: "ffff",
  xXe: "8b",
  xcyan: "8b8b",
  xgTMnPd: "b8860b",
  xWay: "a9a9a9",
  xgYF: "6400",
  xgYy: "a9a9a9",
  xkhaki: "bdb76b",
  xmagFta: "8b008b",
  xTivegYF: "556b2f",
  xSange: "ff8c00",
  xScEd: "9932cc",
  xYd: "8b0000",
  xsOmon: "e9967a",
  xsHgYF: "8fbc8f",
  xUXe: "483d8b",
  xUWay: "2f4f4f",
  xUgYy: "2f4f4f",
  xQe: "ced1",
  xviTet: "9400d3",
  dAppRk: "ff1493",
  dApskyXe: "bfff",
  dimWay: "696969",
  dimgYy: "696969",
  dodgerXe: "1e90ff",
  fiYbrick: "b22222",
  flSOwEte: "fffaf0",
  foYstWAn: "228b22",
  fuKsia: "ff00ff",
  gaRsbSo: "dcdcdc",
  ghostwEte: "f8f8ff",
  gTd: "ffd700",
  gTMnPd: "daa520",
  Way: "808080",
  gYF: "8000",
  gYFLw: "adff2f",
  gYy: "808080",
  honeyMw: "f0fff0",
  hotpRk: "ff69b4",
  RdianYd: "cd5c5c",
  Rdigo: "4b0082",
  ivSy: "fffff0",
  khaki: "f0e68c",
  lavFMr: "e6e6fa",
  lavFMrXsh: "fff0f5",
  lawngYF: "7cfc00",
  NmoncEffon: "fffacd",
  ZXe: "add8e6",
  ZcSO: "f08080",
  Zcyan: "e0ffff",
  ZgTMnPdLw: "fafad2",
  ZWay: "d3d3d3",
  ZgYF: "90ee90",
  ZgYy: "d3d3d3",
  ZpRk: "ffb6c1",
  ZsOmon: "ffa07a",
  ZsHgYF: "20b2aa",
  ZskyXe: "87cefa",
  ZUWay: "778899",
  ZUgYy: "778899",
  ZstAlXe: "b0c4de",
  ZLw: "ffffe0",
  lime: "ff00",
  limegYF: "32cd32",
  lRF: "faf0e6",
  magFta: "ff00ff",
  maPon: "800000",
  VaquamarRe: "66cdaa",
  VXe: "cd",
  VScEd: "ba55d3",
  VpurpN: "9370db",
  VsHgYF: "3cb371",
  VUXe: "7b68ee",
  VsprRggYF: "fa9a",
  VQe: "48d1cc",
  VviTetYd: "c71585",
  midnightXe: "191970",
  mRtcYam: "f5fffa",
  mistyPse: "ffe4e1",
  moccasR: "ffe4b5",
  navajowEte: "ffdead",
  navy: "80",
  Tdlace: "fdf5e6",
  Tive: "808000",
  TivedBb: "6b8e23",
  Sange: "ffa500",
  SangeYd: "ff4500",
  ScEd: "da70d6",
  pOegTMnPd: "eee8aa",
  pOegYF: "98fb98",
  pOeQe: "afeeee",
  pOeviTetYd: "db7093",
  papayawEp: "ffefd5",
  pHKpuff: "ffdab9",
  peru: "cd853f",
  pRk: "ffc0cb",
  plum: "dda0dd",
  powMrXe: "b0e0e6",
  purpN: "800080",
  YbeccapurpN: "663399",
  Yd: "ff0000",
  Psybrown: "bc8f8f",
  PyOXe: "4169e1",
  saddNbPwn: "8b4513",
  sOmon: "fa8072",
  sandybPwn: "f4a460",
  sHgYF: "2e8b57",
  sHshell: "fff5ee",
  siFna: "a0522d",
  silver: "c0c0c0",
  skyXe: "87ceeb",
  UXe: "6a5acd",
  UWay: "708090",
  UgYy: "708090",
  snow: "fffafa",
  sprRggYF: "ff7f",
  stAlXe: "4682b4",
  tan: "d2b48c",
  teO: "8080",
  tEstN: "d8bfd8",
  tomato: "ff6347",
  Qe: "40e0d0",
  viTet: "ee82ee",
  JHt: "f5deb3",
  wEte: "ffffff",
  wEtesmoke: "f5f5f5",
  Lw: "ffff00",
  LwgYF: "9acd32"
};
function Gl() {
  const n = {}, t = Object.keys(Os), e = Object.keys(Ds);
  let i, s, o, a, r;
  for (i = 0; i < t.length; i++) {
    for (a = r = t[i], s = 0; s < e.length; s++)
      o = e[s], r = r.replace(o, Ds[o]);
    o = parseInt(Os[a], 16), n[r] = [o >> 16 & 255, o >> 8 & 255, o & 255];
  }
  return n;
}
let xn;
function Xl(n) {
  xn || (xn = Gl(), xn.transparent = [0, 0, 0, 0]);
  const t = xn[n.toLowerCase()];
  return t && {
    r: t[0],
    g: t[1],
    b: t[2],
    a: t.length === 4 ? t[3] : 255
  };
}
const Kl = /^rgba?\(\s*([-+.\d]+)(%)?[\s,]+([-+.e\d]+)(%)?[\s,]+([-+.e\d]+)(%)?(?:[\s,/]+([-+.e\d]+)(%)?)?\s*\)$/;
function ql(n) {
  const t = Kl.exec(n);
  let e = 255, i, s, o;
  if (t) {
    if (t[7] !== i) {
      const a = +t[7];
      e = t[8] ? je(a) : Zt(a * 255, 0, 255);
    }
    return i = +t[1], s = +t[3], o = +t[5], i = 255 & (t[2] ? je(i) : Zt(i, 0, 255)), s = 255 & (t[4] ? je(s) : Zt(s, 0, 255)), o = 255 & (t[6] ? je(o) : Zt(o, 0, 255)), {
      r: i,
      g: s,
      b: o,
      a: e
    };
  }
}
function Jl(n) {
  return n && (n.a < 255 ? `rgba(${n.r}, ${n.g}, ${n.b}, ${Yt(n.a)})` : `rgb(${n.r}, ${n.g}, ${n.b})`);
}
const mi = (n) => n <= 31308e-7 ? n * 12.92 : Math.pow(n, 1 / 2.4) * 1.055 - 0.055, Me = (n) => n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
function Zl(n, t, e) {
  const i = Me(Yt(n.r)), s = Me(Yt(n.g)), o = Me(Yt(n.b));
  return {
    r: ie(mi(i + e * (Me(Yt(t.r)) - i))),
    g: ie(mi(s + e * (Me(Yt(t.g)) - s))),
    b: ie(mi(o + e * (Me(Yt(t.b)) - o))),
    a: n.a + e * (t.a - n.a)
  };
}
function yn(n, t, e) {
  if (n) {
    let i = Ui(n);
    i[t] = Math.max(0, Math.min(i[t] + i[t] * e, t === 0 ? 360 : 1)), i = Xi(i), n.r = i[0], n.g = i[1], n.b = i[2];
  }
}
function aa(n, t) {
  return n && Object.assign(t || {}, n);
}
function zs(n) {
  var t = { r: 0, g: 0, b: 0, a: 255 };
  return Array.isArray(n) ? n.length >= 3 && (t = { r: n[0], g: n[1], b: n[2], a: 255 }, n.length > 3 && (t.a = ie(n[3]))) : (t = aa(n, { r: 0, g: 0, b: 0, a: 1 }), t.a = ie(t.a)), t;
}
function Ql(n) {
  return n.charAt(0) === "r" ? ql(n) : $l(n);
}
class Ze {
  constructor(t) {
    if (t instanceof Ze)
      return t;
    const e = typeof t;
    let i;
    e === "object" ? i = zs(t) : e === "string" && (i = zl(t) || Xl(t) || Ql(t)), this._rgb = i, this._valid = !!i;
  }
  get valid() {
    return this._valid;
  }
  get rgb() {
    var t = aa(this._rgb);
    return t && (t.a = Yt(t.a)), t;
  }
  set rgb(t) {
    this._rgb = zs(t);
  }
  rgbString() {
    return this._valid ? Jl(this._rgb) : void 0;
  }
  hexString() {
    return this._valid ? Ll(this._rgb) : void 0;
  }
  hslString() {
    return this._valid ? Ul(this._rgb) : void 0;
  }
  mix(t, e) {
    if (t) {
      const i = this.rgb, s = t.rgb;
      let o;
      const a = e === o ? 0.5 : e, r = 2 * a - 1, l = i.a - s.a, c = ((r * l === -1 ? r : (r + l) / (1 + r * l)) + 1) / 2;
      o = 1 - c, i.r = 255 & c * i.r + o * s.r + 0.5, i.g = 255 & c * i.g + o * s.g + 0.5, i.b = 255 & c * i.b + o * s.b + 0.5, i.a = a * i.a + (1 - a) * s.a, this.rgb = i;
    }
    return this;
  }
  interpolate(t, e) {
    return t && (this._rgb = Zl(this._rgb, t._rgb, e)), this;
  }
  clone() {
    return new Ze(this.rgb);
  }
  alpha(t) {
    return this._rgb.a = ie(t), this;
  }
  clearer(t) {
    const e = this._rgb;
    return e.a *= 1 - t, this;
  }
  greyscale() {
    const t = this._rgb, e = an(t.r * 0.3 + t.g * 0.59 + t.b * 0.11);
    return t.r = t.g = t.b = e, this;
  }
  opaquer(t) {
    const e = this._rgb;
    return e.a *= 1 + t, this;
  }
  negate() {
    const t = this._rgb;
    return t.r = 255 - t.r, t.g = 255 - t.g, t.b = 255 - t.b, this;
  }
  lighten(t) {
    return yn(this._rgb, 2, t), this;
  }
  darken(t) {
    return yn(this._rgb, 2, -t), this;
  }
  saturate(t) {
    return yn(this._rgb, 1, t), this;
  }
  desaturate(t) {
    return yn(this._rgb, 1, -t), this;
  }
  rotate(t) {
    return Yl(this._rgb, t), this;
  }
}
/*!
 * Chart.js v4.5.1
 * https://www.chartjs.org
 * (c) 2025 Chart.js Contributors
 * Released under the MIT License
 */
function Ht() {
}
const tc = /* @__PURE__ */ (() => {
  let n = 0;
  return () => n++;
})();
function U(n) {
  return n == null;
}
function nt(n) {
  if (Array.isArray && Array.isArray(n))
    return !0;
  const t = Object.prototype.toString.call(n);
  return t.slice(0, 7) === "[object" && t.slice(-6) === "Array]";
}
function j(n) {
  return n !== null && Object.prototype.toString.call(n) === "[object Object]";
}
function gt(n) {
  return (typeof n == "number" || n instanceof Number) && isFinite(+n);
}
function Ot(n, t) {
  return gt(n) ? n : t;
}
function V(n, t) {
  return typeof n > "u" ? t : n;
}
const ec = (n, t) => typeof n == "string" && n.endsWith("%") ? parseFloat(n) / 100 : +n / t, ra = (n, t) => typeof n == "string" && n.endsWith("%") ? parseFloat(n) / 100 * t : +n;
function Q(n, t, e) {
  if (n && typeof n.call == "function")
    return n.apply(e, t);
}
function q(n, t, e, i) {
  let s, o, a;
  if (nt(n))
    for (o = n.length, s = 0; s < o; s++)
      t.call(e, n[s], s);
  else if (j(n))
    for (a = Object.keys(n), o = a.length, s = 0; s < o; s++)
      t.call(e, n[a[s]], a[s]);
}
function Vn(n, t) {
  let e, i, s, o;
  if (!n || !t || n.length !== t.length)
    return !1;
  for (e = 0, i = n.length; e < i; ++e)
    if (s = n[e], o = t[e], s.datasetIndex !== o.datasetIndex || s.index !== o.index)
      return !1;
  return !0;
}
function Wn(n) {
  if (nt(n))
    return n.map(Wn);
  if (j(n)) {
    const t = /* @__PURE__ */ Object.create(null), e = Object.keys(n), i = e.length;
    let s = 0;
    for (; s < i; ++s)
      t[e[s]] = Wn(n[e[s]]);
    return t;
  }
  return n;
}
function la(n) {
  return [
    "__proto__",
    "prototype",
    "constructor"
  ].indexOf(n) === -1;
}
function nc(n, t, e, i) {
  if (!la(n))
    return;
  const s = t[n], o = e[n];
  j(s) && j(o) ? Qe(s, o, i) : t[n] = Wn(o);
}
function Qe(n, t, e) {
  const i = nt(t) ? t : [
    t
  ], s = i.length;
  if (!j(n))
    return n;
  e = e || {};
  const o = e.merger || nc;
  let a;
  for (let r = 0; r < s; ++r) {
    if (a = i[r], !j(a))
      continue;
    const l = Object.keys(a);
    for (let c = 0, d = l.length; c < d; ++c)
      o(l[c], n, a, e);
  }
  return n;
}
function Xe(n, t) {
  return Qe(n, t, {
    merger: ic
  });
}
function ic(n, t, e) {
  if (!la(n))
    return;
  const i = t[n], s = e[n];
  j(i) && j(s) ? Xe(i, s) : Object.prototype.hasOwnProperty.call(t, n) || (t[n] = Wn(s));
}
const Rs = {
  // Chart.helpers.core resolveObjectKey should resolve empty key to root object
  "": (n) => n,
  // default resolvers
  x: (n) => n.x,
  y: (n) => n.y
};
function sc(n) {
  const t = n.split("."), e = [];
  let i = "";
  for (const s of t)
    i += s, i.endsWith("\\") ? i = i.slice(0, -1) + "." : (e.push(i), i = "");
  return e;
}
function oc(n) {
  const t = sc(n);
  return (e) => {
    for (const i of t) {
      if (i === "")
        break;
      e = e && e[i];
    }
    return e;
  };
}
function oe(n, t) {
  return (Rs[t] || (Rs[t] = oc(t)))(n);
}
function Ki(n) {
  return n.charAt(0).toUpperCase() + n.slice(1);
}
const tn = (n) => typeof n < "u", ae = (n) => typeof n == "function", Ls = (n, t) => {
  if (n.size !== t.size)
    return !1;
  for (const e of n)
    if (!t.has(e))
      return !1;
  return !0;
};
function ac(n) {
  return n.type === "mouseup" || n.type === "click" || n.type === "contextmenu";
}
const X = Math.PI, tt = 2 * X, rc = tt + X, Hn = Number.POSITIVE_INFINITY, lc = X / 180, rt = X / 2, de = X / 4, Is = X * 2 / 3, ca = Math.log10, It = Math.sign;
function Ke(n, t, e) {
  return Math.abs(n - t) < e;
}
function Es(n) {
  const t = Math.round(n);
  n = Ke(n, t, n / 1e3) ? t : n;
  const e = Math.pow(10, Math.floor(ca(n))), i = n / e;
  return (i <= 1 ? 1 : i <= 2 ? 2 : i <= 5 ? 5 : 10) * e;
}
function cc(n) {
  const t = [], e = Math.sqrt(n);
  let i;
  for (i = 1; i < e; i++)
    n % i === 0 && (t.push(i), t.push(n / i));
  return e === (e | 0) && t.push(e), t.sort((s, o) => s - o).pop(), t;
}
function dc(n) {
  return typeof n == "symbol" || typeof n == "object" && n !== null && !(Symbol.toPrimitive in n || "toString" in n || "valueOf" in n);
}
function en(n) {
  return !dc(n) && !isNaN(parseFloat(n)) && isFinite(n);
}
function hc(n, t) {
  const e = Math.round(n);
  return e - t <= n && e + t >= n;
}
function fc(n, t, e) {
  let i, s, o;
  for (i = 0, s = n.length; i < s; i++)
    o = n[i][e], isNaN(o) || (t.min = Math.min(t.min, o), t.max = Math.max(t.max, o));
}
function Lt(n) {
  return n * (X / 180);
}
function qi(n) {
  return n * (180 / X);
}
function Vs(n) {
  if (!gt(n))
    return;
  let t = 1, e = 0;
  for (; Math.round(n * t) / t !== n; )
    t *= 10, e++;
  return e;
}
function da(n, t) {
  const e = t.x - n.x, i = t.y - n.y, s = Math.sqrt(e * e + i * i);
  let o = Math.atan2(i, e);
  return o < -0.5 * X && (o += tt), {
    angle: o,
    distance: s
  };
}
function Ni(n, t) {
  return Math.sqrt(Math.pow(t.x - n.x, 2) + Math.pow(t.y - n.y, 2));
}
function uc(n, t) {
  return (n - t + rc) % tt - X;
}
function mt(n) {
  return (n % tt + tt) % tt;
}
function nn(n, t, e, i) {
  const s = mt(n), o = mt(t), a = mt(e), r = mt(o - s), l = mt(a - s), c = mt(s - o), d = mt(s - a);
  return s === o || s === a || i && o === a || r > l && c < d;
}
function bt(n, t, e) {
  return Math.max(t, Math.min(e, n));
}
function gc(n) {
  return bt(n, -32768, 32767);
}
function Gt(n, t, e, i = 1e-6) {
  return n >= Math.min(t, e) - i && n <= Math.max(t, e) + i;
}
function Ji(n, t, e) {
  e = e || ((a) => n[a] < t);
  let i = n.length - 1, s = 0, o;
  for (; i - s > 1; )
    o = s + i >> 1, e(o) ? s = o : i = o;
  return {
    lo: s,
    hi: i
  };
}
const pe = (n, t, e, i) => Ji(n, e, i ? (s) => {
  const o = n[s][t];
  return o < e || o === e && n[s + 1][t] === e;
} : (s) => n[s][t] < e), pc = (n, t, e) => Ji(n, e, (i) => n[i][t] >= e);
function mc(n, t, e) {
  let i = 0, s = n.length;
  for (; i < s && n[i] < t; )
    i++;
  for (; s > i && n[s - 1] > e; )
    s--;
  return i > 0 || s < n.length ? n.slice(i, s) : n;
}
const ha = [
  "push",
  "pop",
  "shift",
  "splice",
  "unshift"
];
function bc(n, t) {
  if (n._chartjs) {
    n._chartjs.listeners.push(t);
    return;
  }
  Object.defineProperty(n, "_chartjs", {
    configurable: !0,
    enumerable: !1,
    value: {
      listeners: [
        t
      ]
    }
  }), ha.forEach((e) => {
    const i = "_onData" + Ki(e), s = n[e];
    Object.defineProperty(n, e, {
      configurable: !0,
      enumerable: !1,
      value(...o) {
        const a = s.apply(this, o);
        return n._chartjs.listeners.forEach((r) => {
          typeof r[i] == "function" && r[i](...o);
        }), a;
      }
    });
  });
}
function Ws(n, t) {
  const e = n._chartjs;
  if (!e)
    return;
  const i = e.listeners, s = i.indexOf(t);
  s !== -1 && i.splice(s, 1), !(i.length > 0) && (ha.forEach((o) => {
    delete n[o];
  }), delete n._chartjs);
}
function fa(n) {
  const t = new Set(n);
  return t.size === n.length ? n : Array.from(t);
}
const ua = (function() {
  return typeof window > "u" ? function(n) {
    return n();
  } : window.requestAnimationFrame;
})();
function ga(n, t) {
  let e = [], i = !1;
  return function(...s) {
    e = s, i || (i = !0, ua.call(window, () => {
      i = !1, n.apply(t, e);
    }));
  };
}
function xc(n, t) {
  let e;
  return function(...i) {
    return t ? (clearTimeout(e), e = setTimeout(n, t, i)) : n.apply(this, i), t;
  };
}
const Zi = (n) => n === "start" ? "left" : n === "end" ? "right" : "center", pt = (n, t, e) => n === "start" ? t : n === "end" ? e : (t + e) / 2, yc = (n, t, e, i) => n === (i ? "left" : "right") ? e : n === "center" ? (t + e) / 2 : t;
function vc(n, t, e) {
  const i = t.length;
  let s = 0, o = i;
  if (n._sorted) {
    const { iScale: a, vScale: r, _parsed: l } = n, c = n.dataset && n.dataset.options ? n.dataset.options.spanGaps : null, d = a.axis, { min: h, max: f, minDefined: u, maxDefined: p } = a.getUserBounds();
    if (u) {
      if (s = Math.min(
        // @ts-expect-error Need to type _parsed
        pe(l, d, h).lo,
        // @ts-expect-error Need to fix types on _lookupByKey
        e ? i : pe(t, d, a.getPixelForValue(h)).lo
      ), c) {
        const m = l.slice(0, s + 1).reverse().findIndex((x) => !U(x[r.axis]));
        s -= Math.max(0, m);
      }
      s = bt(s, 0, i - 1);
    }
    if (p) {
      let m = Math.max(
        // @ts-expect-error Need to type _parsed
        pe(l, a.axis, f, !0).hi + 1,
        // @ts-expect-error Need to fix types on _lookupByKey
        e ? 0 : pe(t, d, a.getPixelForValue(f), !0).hi + 1
      );
      if (c) {
        const x = l.slice(m - 1).findIndex((v) => !U(v[r.axis]));
        m += Math.max(0, x);
      }
      o = bt(m, s, i) - s;
    } else
      o = i - s;
  }
  return {
    start: s,
    count: o
  };
}
function _c(n) {
  const { xScale: t, yScale: e, _scaleRanges: i } = n, s = {
    xmin: t.min,
    xmax: t.max,
    ymin: e.min,
    ymax: e.max
  };
  if (!i)
    return n._scaleRanges = s, !0;
  const o = i.xmin !== t.min || i.xmax !== t.max || i.ymin !== e.min || i.ymax !== e.max;
  return Object.assign(i, s), o;
}
const vn = (n) => n === 0 || n === 1, Hs = (n, t, e) => -(Math.pow(2, 10 * (n -= 1)) * Math.sin((n - t) * tt / e)), js = (n, t, e) => Math.pow(2, -10 * n) * Math.sin((n - t) * tt / e) + 1, qe = {
  linear: (n) => n,
  easeInQuad: (n) => n * n,
  easeOutQuad: (n) => -n * (n - 2),
  easeInOutQuad: (n) => (n /= 0.5) < 1 ? 0.5 * n * n : -0.5 * (--n * (n - 2) - 1),
  easeInCubic: (n) => n * n * n,
  easeOutCubic: (n) => (n -= 1) * n * n + 1,
  easeInOutCubic: (n) => (n /= 0.5) < 1 ? 0.5 * n * n * n : 0.5 * ((n -= 2) * n * n + 2),
  easeInQuart: (n) => n * n * n * n,
  easeOutQuart: (n) => -((n -= 1) * n * n * n - 1),
  easeInOutQuart: (n) => (n /= 0.5) < 1 ? 0.5 * n * n * n * n : -0.5 * ((n -= 2) * n * n * n - 2),
  easeInQuint: (n) => n * n * n * n * n,
  easeOutQuint: (n) => (n -= 1) * n * n * n * n + 1,
  easeInOutQuint: (n) => (n /= 0.5) < 1 ? 0.5 * n * n * n * n * n : 0.5 * ((n -= 2) * n * n * n * n + 2),
  easeInSine: (n) => -Math.cos(n * rt) + 1,
  easeOutSine: (n) => Math.sin(n * rt),
  easeInOutSine: (n) => -0.5 * (Math.cos(X * n) - 1),
  easeInExpo: (n) => n === 0 ? 0 : Math.pow(2, 10 * (n - 1)),
  easeOutExpo: (n) => n === 1 ? 1 : -Math.pow(2, -10 * n) + 1,
  easeInOutExpo: (n) => vn(n) ? n : n < 0.5 ? 0.5 * Math.pow(2, 10 * (n * 2 - 1)) : 0.5 * (-Math.pow(2, -10 * (n * 2 - 1)) + 2),
  easeInCirc: (n) => n >= 1 ? n : -(Math.sqrt(1 - n * n) - 1),
  easeOutCirc: (n) => Math.sqrt(1 - (n -= 1) * n),
  easeInOutCirc: (n) => (n /= 0.5) < 1 ? -0.5 * (Math.sqrt(1 - n * n) - 1) : 0.5 * (Math.sqrt(1 - (n -= 2) * n) + 1),
  easeInElastic: (n) => vn(n) ? n : Hs(n, 0.075, 0.3),
  easeOutElastic: (n) => vn(n) ? n : js(n, 0.075, 0.3),
  easeInOutElastic(n) {
    return vn(n) ? n : n < 0.5 ? 0.5 * Hs(n * 2, 0.1125, 0.45) : 0.5 + 0.5 * js(n * 2 - 1, 0.1125, 0.45);
  },
  easeInBack(n) {
    return n * n * ((1.70158 + 1) * n - 1.70158);
  },
  easeOutBack(n) {
    return (n -= 1) * n * ((1.70158 + 1) * n + 1.70158) + 1;
  },
  easeInOutBack(n) {
    let t = 1.70158;
    return (n /= 0.5) < 1 ? 0.5 * (n * n * (((t *= 1.525) + 1) * n - t)) : 0.5 * ((n -= 2) * n * (((t *= 1.525) + 1) * n + t) + 2);
  },
  easeInBounce: (n) => 1 - qe.easeOutBounce(1 - n),
  easeOutBounce(n) {
    return n < 1 / 2.75 ? 7.5625 * n * n : n < 2 / 2.75 ? 7.5625 * (n -= 1.5 / 2.75) * n + 0.75 : n < 2.5 / 2.75 ? 7.5625 * (n -= 2.25 / 2.75) * n + 0.9375 : 7.5625 * (n -= 2.625 / 2.75) * n + 0.984375;
  },
  easeInOutBounce: (n) => n < 0.5 ? qe.easeInBounce(n * 2) * 0.5 : qe.easeOutBounce(n * 2 - 1) * 0.5 + 0.5
};
function Qi(n) {
  if (n && typeof n == "object") {
    const t = n.toString();
    return t === "[object CanvasPattern]" || t === "[object CanvasGradient]";
  }
  return !1;
}
function $s(n) {
  return Qi(n) ? n : new Ze(n);
}
function bi(n) {
  return Qi(n) ? n : new Ze(n).saturate(0.5).darken(0.1).hexString();
}
const wc = [
  "x",
  "y",
  "borderWidth",
  "radius",
  "tension"
], Sc = [
  "color",
  "borderColor",
  "backgroundColor"
];
function Cc(n) {
  n.set("animation", {
    delay: void 0,
    duration: 1e3,
    easing: "easeOutQuart",
    fn: void 0,
    from: void 0,
    loop: void 0,
    to: void 0,
    type: void 0
  }), n.describe("animation", {
    _fallback: !1,
    _indexable: !1,
    _scriptable: (t) => t !== "onProgress" && t !== "onComplete" && t !== "fn"
  }), n.set("animations", {
    colors: {
      type: "color",
      properties: Sc
    },
    numbers: {
      type: "number",
      properties: wc
    }
  }), n.describe("animations", {
    _fallback: "animation"
  }), n.set("transitions", {
    active: {
      animation: {
        duration: 400
      }
    },
    resize: {
      animation: {
        duration: 0
      }
    },
    show: {
      animations: {
        colors: {
          from: "transparent"
        },
        visible: {
          type: "boolean",
          duration: 0
        }
      }
    },
    hide: {
      animations: {
        colors: {
          to: "transparent"
        },
        visible: {
          type: "boolean",
          easing: "linear",
          fn: (t) => t | 0
        }
      }
    }
  });
}
function kc(n) {
  n.set("layout", {
    autoPadding: !0,
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  });
}
const Ys = /* @__PURE__ */ new Map();
function Mc(n, t) {
  t = t || {};
  const e = n + JSON.stringify(t);
  let i = Ys.get(e);
  return i || (i = new Intl.NumberFormat(n, t), Ys.set(e, i)), i;
}
function ts(n, t, e) {
  return Mc(t, e).format(n);
}
const Tc = {
  values(n) {
    return nt(n) ? n : "" + n;
  },
  numeric(n, t, e) {
    if (n === 0)
      return "0";
    const i = this.chart.options.locale;
    let s, o = n;
    if (e.length > 1) {
      const c = Math.max(Math.abs(e[0].value), Math.abs(e[e.length - 1].value));
      (c < 1e-4 || c > 1e15) && (s = "scientific"), o = Bc(n, e);
    }
    const a = ca(Math.abs(o)), r = isNaN(a) ? 1 : Math.max(Math.min(-1 * Math.floor(a), 20), 0), l = {
      notation: s,
      minimumFractionDigits: r,
      maximumFractionDigits: r
    };
    return Object.assign(l, this.options.ticks.format), ts(n, i, l);
  }
};
function Bc(n, t) {
  let e = t.length > 3 ? t[2].value - t[1].value : t[1].value - t[0].value;
  return Math.abs(e) >= 1 && n !== Math.floor(n) && (e = n - Math.floor(n)), e;
}
var es = {
  formatters: Tc
};
function Ac(n) {
  n.set("scale", {
    display: !0,
    offset: !1,
    reverse: !1,
    beginAtZero: !1,
    bounds: "ticks",
    clip: !0,
    grace: 0,
    grid: {
      display: !0,
      lineWidth: 1,
      drawOnChartArea: !0,
      drawTicks: !0,
      tickLength: 8,
      tickWidth: (t, e) => e.lineWidth,
      tickColor: (t, e) => e.color,
      offset: !1
    },
    border: {
      display: !0,
      dash: [],
      dashOffset: 0,
      width: 1
    },
    title: {
      display: !1,
      text: "",
      padding: {
        top: 4,
        bottom: 4
      }
    },
    ticks: {
      minRotation: 0,
      maxRotation: 50,
      mirror: !1,
      textStrokeWidth: 0,
      textStrokeColor: "",
      padding: 3,
      display: !0,
      autoSkip: !0,
      autoSkipPadding: 3,
      labelOffset: 0,
      callback: es.formatters.values,
      minor: {},
      major: {},
      align: "center",
      crossAlign: "near",
      showLabelBackdrop: !1,
      backdropColor: "rgba(255, 255, 255, 0.75)",
      backdropPadding: 2
    }
  }), n.route("scale.ticks", "color", "", "color"), n.route("scale.grid", "color", "", "borderColor"), n.route("scale.border", "color", "", "borderColor"), n.route("scale.title", "color", "", "color"), n.describe("scale", {
    _fallback: !1,
    _scriptable: (t) => !t.startsWith("before") && !t.startsWith("after") && t !== "callback" && t !== "parser",
    _indexable: (t) => t !== "borderDash" && t !== "tickBorderDash" && t !== "dash"
  }), n.describe("scales", {
    _fallback: "scale"
  }), n.describe("scale.ticks", {
    _scriptable: (t) => t !== "backdropPadding" && t !== "callback",
    _indexable: (t) => t !== "backdropPadding"
  });
}
const xe = /* @__PURE__ */ Object.create(null), Di = /* @__PURE__ */ Object.create(null);
function Je(n, t) {
  if (!t)
    return n;
  const e = t.split(".");
  for (let i = 0, s = e.length; i < s; ++i) {
    const o = e[i];
    n = n[o] || (n[o] = /* @__PURE__ */ Object.create(null));
  }
  return n;
}
function xi(n, t, e) {
  return typeof t == "string" ? Qe(Je(n, t), e) : Qe(Je(n, ""), t);
}
class Fc {
  constructor(t, e) {
    this.animation = void 0, this.backgroundColor = "rgba(0,0,0,0.1)", this.borderColor = "rgba(0,0,0,0.1)", this.color = "#666", this.datasets = {}, this.devicePixelRatio = (i) => i.chart.platform.getDevicePixelRatio(), this.elements = {}, this.events = [
      "mousemove",
      "mouseout",
      "click",
      "touchstart",
      "touchmove"
    ], this.font = {
      family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
      size: 12,
      style: "normal",
      lineHeight: 1.2,
      weight: null
    }, this.hover = {}, this.hoverBackgroundColor = (i, s) => bi(s.backgroundColor), this.hoverBorderColor = (i, s) => bi(s.borderColor), this.hoverColor = (i, s) => bi(s.color), this.indexAxis = "x", this.interaction = {
      mode: "nearest",
      intersect: !0,
      includeInvisible: !1
    }, this.maintainAspectRatio = !0, this.onHover = null, this.onClick = null, this.parsing = !0, this.plugins = {}, this.responsive = !0, this.scale = void 0, this.scales = {}, this.showLine = !0, this.drawActiveElementsOnTop = !0, this.describe(t), this.apply(e);
  }
  set(t, e) {
    return xi(this, t, e);
  }
  get(t) {
    return Je(this, t);
  }
  describe(t, e) {
    return xi(Di, t, e);
  }
  override(t, e) {
    return xi(xe, t, e);
  }
  route(t, e, i, s) {
    const o = Je(this, t), a = Je(this, i), r = "_" + e;
    Object.defineProperties(o, {
      [r]: {
        value: o[e],
        writable: !0
      },
      [e]: {
        enumerable: !0,
        get() {
          const l = this[r], c = a[s];
          return j(l) ? Object.assign({}, c, l) : V(l, c);
        },
        set(l) {
          this[r] = l;
        }
      }
    });
  }
  apply(t) {
    t.forEach((e) => e(this));
  }
}
var ot = /* @__PURE__ */ new Fc({
  _scriptable: (n) => !n.startsWith("on"),
  _indexable: (n) => n !== "events",
  hover: {
    _fallback: "interaction"
  },
  interaction: {
    _scriptable: !1,
    _indexable: !1
  }
}, [
  Cc,
  kc,
  Ac
]);
function Pc(n) {
  return !n || U(n.size) || U(n.family) ? null : (n.style ? n.style + " " : "") + (n.weight ? n.weight + " " : "") + n.size + "px " + n.family;
}
function jn(n, t, e, i, s) {
  let o = t[s];
  return o || (o = t[s] = n.measureText(s).width, e.push(s)), o > i && (i = o), i;
}
function Nc(n, t, e, i) {
  i = i || {};
  let s = i.data = i.data || {}, o = i.garbageCollect = i.garbageCollect || [];
  i.font !== t && (s = i.data = {}, o = i.garbageCollect = [], i.font = t), n.save(), n.font = t;
  let a = 0;
  const r = e.length;
  let l, c, d, h, f;
  for (l = 0; l < r; l++)
    if (h = e[l], h != null && !nt(h))
      a = jn(n, s, o, a, h);
    else if (nt(h))
      for (c = 0, d = h.length; c < d; c++)
        f = h[c], f != null && !nt(f) && (a = jn(n, s, o, a, f));
  n.restore();
  const u = o.length / 2;
  if (u > e.length) {
    for (l = 0; l < u; l++)
      delete s[o[l]];
    o.splice(0, u);
  }
  return a;
}
function he(n, t, e) {
  const i = n.currentDevicePixelRatio, s = e !== 0 ? Math.max(e / 2, 0.5) : 0;
  return Math.round((t - s) * i) / i + s;
}
function Us(n, t) {
  !t && !n || (t = t || n.getContext("2d"), t.save(), t.resetTransform(), t.clearRect(0, 0, n.width, n.height), t.restore());
}
function Oi(n, t, e, i) {
  pa(n, t, e, i, null);
}
function pa(n, t, e, i, s) {
  let o, a, r, l, c, d, h, f;
  const u = t.pointStyle, p = t.rotation, m = t.radius;
  let x = (p || 0) * lc;
  if (u && typeof u == "object" && (o = u.toString(), o === "[object HTMLImageElement]" || o === "[object HTMLCanvasElement]")) {
    n.save(), n.translate(e, i), n.rotate(x), n.drawImage(u, -u.width / 2, -u.height / 2, u.width, u.height), n.restore();
    return;
  }
  if (!(isNaN(m) || m <= 0)) {
    switch (n.beginPath(), u) {
      // Default includes circle
      default:
        s ? n.ellipse(e, i, s / 2, m, 0, 0, tt) : n.arc(e, i, m, 0, tt), n.closePath();
        break;
      case "triangle":
        d = s ? s / 2 : m, n.moveTo(e + Math.sin(x) * d, i - Math.cos(x) * m), x += Is, n.lineTo(e + Math.sin(x) * d, i - Math.cos(x) * m), x += Is, n.lineTo(e + Math.sin(x) * d, i - Math.cos(x) * m), n.closePath();
        break;
      case "rectRounded":
        c = m * 0.516, l = m - c, a = Math.cos(x + de) * l, h = Math.cos(x + de) * (s ? s / 2 - c : l), r = Math.sin(x + de) * l, f = Math.sin(x + de) * (s ? s / 2 - c : l), n.arc(e - h, i - r, c, x - X, x - rt), n.arc(e + f, i - a, c, x - rt, x), n.arc(e + h, i + r, c, x, x + rt), n.arc(e - f, i + a, c, x + rt, x + X), n.closePath();
        break;
      case "rect":
        if (!p) {
          l = Math.SQRT1_2 * m, d = s ? s / 2 : l, n.rect(e - d, i - l, 2 * d, 2 * l);
          break;
        }
        x += de;
      /* falls through */
      case "rectRot":
        h = Math.cos(x) * (s ? s / 2 : m), a = Math.cos(x) * m, r = Math.sin(x) * m, f = Math.sin(x) * (s ? s / 2 : m), n.moveTo(e - h, i - r), n.lineTo(e + f, i - a), n.lineTo(e + h, i + r), n.lineTo(e - f, i + a), n.closePath();
        break;
      case "crossRot":
        x += de;
      /* falls through */
      case "cross":
        h = Math.cos(x) * (s ? s / 2 : m), a = Math.cos(x) * m, r = Math.sin(x) * m, f = Math.sin(x) * (s ? s / 2 : m), n.moveTo(e - h, i - r), n.lineTo(e + h, i + r), n.moveTo(e + f, i - a), n.lineTo(e - f, i + a);
        break;
      case "star":
        h = Math.cos(x) * (s ? s / 2 : m), a = Math.cos(x) * m, r = Math.sin(x) * m, f = Math.sin(x) * (s ? s / 2 : m), n.moveTo(e - h, i - r), n.lineTo(e + h, i + r), n.moveTo(e + f, i - a), n.lineTo(e - f, i + a), x += de, h = Math.cos(x) * (s ? s / 2 : m), a = Math.cos(x) * m, r = Math.sin(x) * m, f = Math.sin(x) * (s ? s / 2 : m), n.moveTo(e - h, i - r), n.lineTo(e + h, i + r), n.moveTo(e + f, i - a), n.lineTo(e - f, i + a);
        break;
      case "line":
        a = s ? s / 2 : Math.cos(x) * m, r = Math.sin(x) * m, n.moveTo(e - a, i - r), n.lineTo(e + a, i + r);
        break;
      case "dash":
        n.moveTo(e, i), n.lineTo(e + Math.cos(x) * (s ? s / 2 : m), i + Math.sin(x) * m);
        break;
      case !1:
        n.closePath();
        break;
    }
    n.fill(), t.borderWidth > 0 && n.stroke();
  }
}
function Xt(n, t, e) {
  return e = e || 0.5, !t || n && n.x > t.left - e && n.x < t.right + e && n.y > t.top - e && n.y < t.bottom + e;
}
function Kn(n, t) {
  n.save(), n.beginPath(), n.rect(t.left, t.top, t.right - t.left, t.bottom - t.top), n.clip();
}
function qn(n) {
  n.restore();
}
function Dc(n, t, e, i, s) {
  if (!t)
    return n.lineTo(e.x, e.y);
  if (s === "middle") {
    const o = (t.x + e.x) / 2;
    n.lineTo(o, t.y), n.lineTo(o, e.y);
  } else s === "after" != !!i ? n.lineTo(t.x, e.y) : n.lineTo(e.x, t.y);
  n.lineTo(e.x, e.y);
}
function Oc(n, t, e, i) {
  if (!t)
    return n.lineTo(e.x, e.y);
  n.bezierCurveTo(i ? t.cp1x : t.cp2x, i ? t.cp1y : t.cp2y, i ? e.cp2x : e.cp1x, i ? e.cp2y : e.cp1y, e.x, e.y);
}
function zc(n, t) {
  t.translation && n.translate(t.translation[0], t.translation[1]), U(t.rotation) || n.rotate(t.rotation), t.color && (n.fillStyle = t.color), t.textAlign && (n.textAlign = t.textAlign), t.textBaseline && (n.textBaseline = t.textBaseline);
}
function Rc(n, t, e, i, s) {
  if (s.strikethrough || s.underline) {
    const o = n.measureText(i), a = t - o.actualBoundingBoxLeft, r = t + o.actualBoundingBoxRight, l = e - o.actualBoundingBoxAscent, c = e + o.actualBoundingBoxDescent, d = s.strikethrough ? (l + c) / 2 : c;
    n.strokeStyle = n.fillStyle, n.beginPath(), n.lineWidth = s.decorationWidth || 2, n.moveTo(a, d), n.lineTo(r, d), n.stroke();
  }
}
function Lc(n, t) {
  const e = n.fillStyle;
  n.fillStyle = t.color, n.fillRect(t.left, t.top, t.width, t.height), n.fillStyle = e;
}
function ye(n, t, e, i, s, o = {}) {
  const a = nt(t) ? t : [
    t
  ], r = o.strokeWidth > 0 && o.strokeColor !== "";
  let l, c;
  for (n.save(), n.font = s.string, zc(n, o), l = 0; l < a.length; ++l)
    c = a[l], o.backdrop && Lc(n, o.backdrop), r && (o.strokeColor && (n.strokeStyle = o.strokeColor), U(o.strokeWidth) || (n.lineWidth = o.strokeWidth), n.strokeText(c, e, i, o.maxWidth)), n.fillText(c, e, i, o.maxWidth), Rc(n, e, i, c, o), i += Number(s.lineHeight);
  n.restore();
}
function sn(n, t) {
  const { x: e, y: i, w: s, h: o, radius: a } = t;
  n.arc(e + a.topLeft, i + a.topLeft, a.topLeft, 1.5 * X, X, !0), n.lineTo(e, i + o - a.bottomLeft), n.arc(e + a.bottomLeft, i + o - a.bottomLeft, a.bottomLeft, X, rt, !0), n.lineTo(e + s - a.bottomRight, i + o), n.arc(e + s - a.bottomRight, i + o - a.bottomRight, a.bottomRight, rt, 0, !0), n.lineTo(e + s, i + a.topRight), n.arc(e + s - a.topRight, i + a.topRight, a.topRight, 0, -rt, !0), n.lineTo(e + a.topLeft, i);
}
const Ic = /^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/, Ec = /^(normal|italic|initial|inherit|unset|(oblique( -?[0-9]?[0-9]deg)?))$/;
function Vc(n, t) {
  const e = ("" + n).match(Ic);
  if (!e || e[1] === "normal")
    return t * 1.2;
  switch (n = +e[2], e[3]) {
    case "px":
      return n;
    case "%":
      n /= 100;
      break;
  }
  return t * n;
}
const Wc = (n) => +n || 0;
function ns(n, t) {
  const e = {}, i = j(t), s = i ? Object.keys(t) : t, o = j(n) ? i ? (a) => V(n[a], n[t[a]]) : (a) => n[a] : () => n;
  for (const a of s)
    e[a] = Wc(o(a));
  return e;
}
function ma(n) {
  return ns(n, {
    top: "y",
    right: "x",
    bottom: "y",
    left: "x"
  });
}
function me(n) {
  return ns(n, [
    "topLeft",
    "topRight",
    "bottomLeft",
    "bottomRight"
  ]);
}
function xt(n) {
  const t = ma(n);
  return t.width = t.left + t.right, t.height = t.top + t.bottom, t;
}
function ht(n, t) {
  n = n || {}, t = t || ot.font;
  let e = V(n.size, t.size);
  typeof e == "string" && (e = parseInt(e, 10));
  let i = V(n.style, t.style);
  i && !("" + i).match(Ec) && (console.warn('Invalid font style specified: "' + i + '"'), i = void 0);
  const s = {
    family: V(n.family, t.family),
    lineHeight: Vc(V(n.lineHeight, t.lineHeight), e),
    size: e,
    style: i,
    weight: V(n.weight, t.weight),
    string: ""
  };
  return s.string = Pc(s), s;
}
function _n(n, t, e, i) {
  let s, o, a;
  for (s = 0, o = n.length; s < o; ++s)
    if (a = n[s], a !== void 0 && a !== void 0)
      return a;
}
function Hc(n, t, e) {
  const { min: i, max: s } = n, o = ra(t, (s - i) / 2), a = (r, l) => e && r === 0 ? 0 : r + l;
  return {
    min: a(i, -Math.abs(o)),
    max: a(s, o)
  };
}
function re(n, t) {
  return Object.assign(Object.create(n), t);
}
function is(n, t = [
  ""
], e, i, s = () => n[0]) {
  const o = e || n;
  typeof i > "u" && (i = va("_fallback", n));
  const a = {
    [Symbol.toStringTag]: "Object",
    _cacheable: !0,
    _scopes: n,
    _rootScopes: o,
    _fallback: i,
    _getTarget: s,
    override: (r) => is([
      r,
      ...n
    ], t, o, i)
  };
  return new Proxy(a, {
    /**
    * A trap for the delete operator.
    */
    deleteProperty(r, l) {
      return delete r[l], delete r._keys, delete n[0][l], !0;
    },
    /**
    * A trap for getting property values.
    */
    get(r, l) {
      return xa(r, l, () => qc(l, t, n, r));
    },
    /**
    * A trap for Object.getOwnPropertyDescriptor.
    * Also used by Object.hasOwnProperty.
    */
    getOwnPropertyDescriptor(r, l) {
      return Reflect.getOwnPropertyDescriptor(r._scopes[0], l);
    },
    /**
    * A trap for Object.getPrototypeOf.
    */
    getPrototypeOf() {
      return Reflect.getPrototypeOf(n[0]);
    },
    /**
    * A trap for the in operator.
    */
    has(r, l) {
      return Xs(r).includes(l);
    },
    /**
    * A trap for Object.getOwnPropertyNames and Object.getOwnPropertySymbols.
    */
    ownKeys(r) {
      return Xs(r);
    },
    /**
    * A trap for setting property values.
    */
    set(r, l, c) {
      const d = r._storage || (r._storage = s());
      return r[l] = d[l] = c, delete r._keys, !0;
    }
  });
}
function Fe(n, t, e, i) {
  const s = {
    _cacheable: !1,
    _proxy: n,
    _context: t,
    _subProxy: e,
    _stack: /* @__PURE__ */ new Set(),
    _descriptors: ba(n, i),
    setContext: (o) => Fe(n, o, e, i),
    override: (o) => Fe(n.override(o), t, e, i)
  };
  return new Proxy(s, {
    /**
    * A trap for the delete operator.
    */
    deleteProperty(o, a) {
      return delete o[a], delete n[a], !0;
    },
    /**
    * A trap for getting property values.
    */
    get(o, a, r) {
      return xa(o, a, () => $c(o, a, r));
    },
    /**
    * A trap for Object.getOwnPropertyDescriptor.
    * Also used by Object.hasOwnProperty.
    */
    getOwnPropertyDescriptor(o, a) {
      return o._descriptors.allKeys ? Reflect.has(n, a) ? {
        enumerable: !0,
        configurable: !0
      } : void 0 : Reflect.getOwnPropertyDescriptor(n, a);
    },
    /**
    * A trap for Object.getPrototypeOf.
    */
    getPrototypeOf() {
      return Reflect.getPrototypeOf(n);
    },
    /**
    * A trap for the in operator.
    */
    has(o, a) {
      return Reflect.has(n, a);
    },
    /**
    * A trap for Object.getOwnPropertyNames and Object.getOwnPropertySymbols.
    */
    ownKeys() {
      return Reflect.ownKeys(n);
    },
    /**
    * A trap for setting property values.
    */
    set(o, a, r) {
      return n[a] = r, delete o[a], !0;
    }
  });
}
function ba(n, t = {
  scriptable: !0,
  indexable: !0
}) {
  const { _scriptable: e = t.scriptable, _indexable: i = t.indexable, _allKeys: s = t.allKeys } = n;
  return {
    allKeys: s,
    scriptable: e,
    indexable: i,
    isScriptable: ae(e) ? e : () => e,
    isIndexable: ae(i) ? i : () => i
  };
}
const jc = (n, t) => n ? n + Ki(t) : t, ss = (n, t) => j(t) && n !== "adapters" && (Object.getPrototypeOf(t) === null || t.constructor === Object);
function xa(n, t, e) {
  if (Object.prototype.hasOwnProperty.call(n, t) || t === "constructor")
    return n[t];
  const i = e();
  return n[t] = i, i;
}
function $c(n, t, e) {
  const { _proxy: i, _context: s, _subProxy: o, _descriptors: a } = n;
  let r = i[t];
  return ae(r) && a.isScriptable(t) && (r = Yc(t, r, n, e)), nt(r) && r.length && (r = Uc(t, r, n, a.isIndexable)), ss(t, r) && (r = Fe(r, s, o && o[t], a)), r;
}
function Yc(n, t, e, i) {
  const { _proxy: s, _context: o, _subProxy: a, _stack: r } = e;
  if (r.has(n))
    throw new Error("Recursion detected: " + Array.from(r).join("->") + "->" + n);
  r.add(n);
  let l = t(o, a || i);
  return r.delete(n), ss(n, l) && (l = os(s._scopes, s, n, l)), l;
}
function Uc(n, t, e, i) {
  const { _proxy: s, _context: o, _subProxy: a, _descriptors: r } = e;
  if (typeof o.index < "u" && i(n))
    return t[o.index % t.length];
  if (j(t[0])) {
    const l = t, c = s._scopes.filter((d) => d !== l);
    t = [];
    for (const d of l) {
      const h = os(c, s, n, d);
      t.push(Fe(h, o, a && a[n], r));
    }
  }
  return t;
}
function ya(n, t, e) {
  return ae(n) ? n(t, e) : n;
}
const Gc = (n, t) => n === !0 ? t : typeof n == "string" ? oe(t, n) : void 0;
function Xc(n, t, e, i, s) {
  for (const o of t) {
    const a = Gc(e, o);
    if (a) {
      n.add(a);
      const r = ya(a._fallback, e, s);
      if (typeof r < "u" && r !== e && r !== i)
        return r;
    } else if (a === !1 && typeof i < "u" && e !== i)
      return null;
  }
  return !1;
}
function os(n, t, e, i) {
  const s = t._rootScopes, o = ya(t._fallback, e, i), a = [
    ...n,
    ...s
  ], r = /* @__PURE__ */ new Set();
  r.add(i);
  let l = Gs(r, a, e, o || e, i);
  return l === null || typeof o < "u" && o !== e && (l = Gs(r, a, o, l, i), l === null) ? !1 : is(Array.from(r), [
    ""
  ], s, o, () => Kc(t, e, i));
}
function Gs(n, t, e, i, s) {
  for (; e; )
    e = Xc(n, t, e, i, s);
  return e;
}
function Kc(n, t, e) {
  const i = n._getTarget();
  t in i || (i[t] = {});
  const s = i[t];
  return nt(s) && j(e) ? e : s || {};
}
function qc(n, t, e, i) {
  let s;
  for (const o of t)
    if (s = va(jc(o, n), e), typeof s < "u")
      return ss(n, s) ? os(e, i, n, s) : s;
}
function va(n, t) {
  for (const e of t) {
    if (!e)
      continue;
    const i = e[n];
    if (typeof i < "u")
      return i;
  }
}
function Xs(n) {
  let t = n._keys;
  return t || (t = n._keys = Jc(n._scopes)), t;
}
function Jc(n) {
  const t = /* @__PURE__ */ new Set();
  for (const e of n)
    for (const i of Object.keys(e).filter((s) => !s.startsWith("_")))
      t.add(i);
  return Array.from(t);
}
function Zc(n, t, e, i) {
  const { iScale: s } = n, { key: o = "r" } = this._parsing, a = new Array(i);
  let r, l, c, d;
  for (r = 0, l = i; r < l; ++r)
    c = r + e, d = t[c], a[r] = {
      r: s.parse(oe(d, o), c)
    };
  return a;
}
const Qc = Number.EPSILON || 1e-14, Pe = (n, t) => t < n.length && !n[t].skip && n[t], _a = (n) => n === "x" ? "y" : "x";
function td(n, t, e, i) {
  const s = n.skip ? t : n, o = t, a = e.skip ? t : e, r = Ni(o, s), l = Ni(a, o);
  let c = r / (r + l), d = l / (r + l);
  c = isNaN(c) ? 0 : c, d = isNaN(d) ? 0 : d;
  const h = i * c, f = i * d;
  return {
    previous: {
      x: o.x - h * (a.x - s.x),
      y: o.y - h * (a.y - s.y)
    },
    next: {
      x: o.x + f * (a.x - s.x),
      y: o.y + f * (a.y - s.y)
    }
  };
}
function ed(n, t, e) {
  const i = n.length;
  let s, o, a, r, l, c = Pe(n, 0);
  for (let d = 0; d < i - 1; ++d)
    if (l = c, c = Pe(n, d + 1), !(!l || !c)) {
      if (Ke(t[d], 0, Qc)) {
        e[d] = e[d + 1] = 0;
        continue;
      }
      s = e[d] / t[d], o = e[d + 1] / t[d], r = Math.pow(s, 2) + Math.pow(o, 2), !(r <= 9) && (a = 3 / Math.sqrt(r), e[d] = s * a * t[d], e[d + 1] = o * a * t[d]);
    }
}
function nd(n, t, e = "x") {
  const i = _a(e), s = n.length;
  let o, a, r, l = Pe(n, 0);
  for (let c = 0; c < s; ++c) {
    if (a = r, r = l, l = Pe(n, c + 1), !r)
      continue;
    const d = r[e], h = r[i];
    a && (o = (d - a[e]) / 3, r[`cp1${e}`] = d - o, r[`cp1${i}`] = h - o * t[c]), l && (o = (l[e] - d) / 3, r[`cp2${e}`] = d + o, r[`cp2${i}`] = h + o * t[c]);
  }
}
function id(n, t = "x") {
  const e = _a(t), i = n.length, s = Array(i).fill(0), o = Array(i);
  let a, r, l, c = Pe(n, 0);
  for (a = 0; a < i; ++a)
    if (r = l, l = c, c = Pe(n, a + 1), !!l) {
      if (c) {
        const d = c[t] - l[t];
        s[a] = d !== 0 ? (c[e] - l[e]) / d : 0;
      }
      o[a] = r ? c ? It(s[a - 1]) !== It(s[a]) ? 0 : (s[a - 1] + s[a]) / 2 : s[a - 1] : s[a];
    }
  ed(n, s, o), nd(n, o, t);
}
function wn(n, t, e) {
  return Math.max(Math.min(n, e), t);
}
function sd(n, t) {
  let e, i, s, o, a, r = Xt(n[0], t);
  for (e = 0, i = n.length; e < i; ++e)
    a = o, o = r, r = e < i - 1 && Xt(n[e + 1], t), o && (s = n[e], a && (s.cp1x = wn(s.cp1x, t.left, t.right), s.cp1y = wn(s.cp1y, t.top, t.bottom)), r && (s.cp2x = wn(s.cp2x, t.left, t.right), s.cp2y = wn(s.cp2y, t.top, t.bottom)));
}
function od(n, t, e, i, s) {
  let o, a, r, l;
  if (t.spanGaps && (n = n.filter((c) => !c.skip)), t.cubicInterpolationMode === "monotone")
    id(n, s);
  else {
    let c = i ? n[n.length - 1] : n[0];
    for (o = 0, a = n.length; o < a; ++o)
      r = n[o], l = td(c, r, n[Math.min(o + 1, a - (i ? 0 : 1)) % a], t.tension), r.cp1x = l.previous.x, r.cp1y = l.previous.y, r.cp2x = l.next.x, r.cp2y = l.next.y, c = r;
  }
  t.capBezierPoints && sd(n, e);
}
function as() {
  return typeof window < "u" && typeof document < "u";
}
function rs(n) {
  let t = n.parentNode;
  return t && t.toString() === "[object ShadowRoot]" && (t = t.host), t;
}
function $n(n, t, e) {
  let i;
  return typeof n == "string" ? (i = parseInt(n, 10), n.indexOf("%") !== -1 && (i = i / 100 * t.parentNode[e])) : i = n, i;
}
const Jn = (n) => n.ownerDocument.defaultView.getComputedStyle(n, null);
function ad(n, t) {
  return Jn(n).getPropertyValue(t);
}
const rd = [
  "top",
  "right",
  "bottom",
  "left"
];
function be(n, t, e) {
  const i = {};
  e = e ? "-" + e : "";
  for (let s = 0; s < 4; s++) {
    const o = rd[s];
    i[o] = parseFloat(n[t + "-" + o + e]) || 0;
  }
  return i.width = i.left + i.right, i.height = i.top + i.bottom, i;
}
const ld = (n, t, e) => (n > 0 || t > 0) && (!e || !e.shadowRoot);
function cd(n, t) {
  const e = n.touches, i = e && e.length ? e[0] : n, { offsetX: s, offsetY: o } = i;
  let a = !1, r, l;
  if (ld(s, o, n.target))
    r = s, l = o;
  else {
    const c = t.getBoundingClientRect();
    r = i.clientX - c.left, l = i.clientY - c.top, a = !0;
  }
  return {
    x: r,
    y: l,
    box: a
  };
}
function ue(n, t) {
  if ("native" in n)
    return n;
  const { canvas: e, currentDevicePixelRatio: i } = t, s = Jn(e), o = s.boxSizing === "border-box", a = be(s, "padding"), r = be(s, "border", "width"), { x: l, y: c, box: d } = cd(n, e), h = a.left + (d && r.left), f = a.top + (d && r.top);
  let { width: u, height: p } = t;
  return o && (u -= a.width + r.width, p -= a.height + r.height), {
    x: Math.round((l - h) / u * e.width / i),
    y: Math.round((c - f) / p * e.height / i)
  };
}
function dd(n, t, e) {
  let i, s;
  if (t === void 0 || e === void 0) {
    const o = n && rs(n);
    if (!o)
      t = n.clientWidth, e = n.clientHeight;
    else {
      const a = o.getBoundingClientRect(), r = Jn(o), l = be(r, "border", "width"), c = be(r, "padding");
      t = a.width - c.width - l.width, e = a.height - c.height - l.height, i = $n(r.maxWidth, o, "clientWidth"), s = $n(r.maxHeight, o, "clientHeight");
    }
  }
  return {
    width: t,
    height: e,
    maxWidth: i || Hn,
    maxHeight: s || Hn
  };
}
const Qt = (n) => Math.round(n * 10) / 10;
function hd(n, t, e, i) {
  const s = Jn(n), o = be(s, "margin"), a = $n(s.maxWidth, n, "clientWidth") || Hn, r = $n(s.maxHeight, n, "clientHeight") || Hn, l = dd(n, t, e);
  let { width: c, height: d } = l;
  if (s.boxSizing === "content-box") {
    const f = be(s, "border", "width"), u = be(s, "padding");
    c -= u.width + f.width, d -= u.height + f.height;
  }
  return c = Math.max(0, c - o.width), d = Math.max(0, i ? c / i : d - o.height), c = Qt(Math.min(c, a, l.maxWidth)), d = Qt(Math.min(d, r, l.maxHeight)), c && !d && (d = Qt(c / 2)), (t !== void 0 || e !== void 0) && i && l.height && d > l.height && (d = l.height, c = Qt(Math.floor(d * i))), {
    width: c,
    height: d
  };
}
function Ks(n, t, e) {
  const i = t || 1, s = Qt(n.height * i), o = Qt(n.width * i);
  n.height = Qt(n.height), n.width = Qt(n.width);
  const a = n.canvas;
  return a.style && (e || !a.style.height && !a.style.width) && (a.style.height = `${n.height}px`, a.style.width = `${n.width}px`), n.currentDevicePixelRatio !== i || a.height !== s || a.width !== o ? (n.currentDevicePixelRatio = i, a.height = s, a.width = o, n.ctx.setTransform(i, 0, 0, i, 0, 0), !0) : !1;
}
const fd = (function() {
  let n = !1;
  try {
    const t = {
      get passive() {
        return n = !0, !1;
      }
    };
    as() && (window.addEventListener("test", null, t), window.removeEventListener("test", null, t));
  } catch {
  }
  return n;
})();
function qs(n, t) {
  const e = ad(n, t), i = e && e.match(/^(\d+)(\.\d+)?px$/);
  return i ? +i[1] : void 0;
}
function ge(n, t, e, i) {
  return {
    x: n.x + e * (t.x - n.x),
    y: n.y + e * (t.y - n.y)
  };
}
function ud(n, t, e, i) {
  return {
    x: n.x + e * (t.x - n.x),
    y: i === "middle" ? e < 0.5 ? n.y : t.y : i === "after" ? e < 1 ? n.y : t.y : e > 0 ? t.y : n.y
  };
}
function gd(n, t, e, i) {
  const s = {
    x: n.cp2x,
    y: n.cp2y
  }, o = {
    x: t.cp1x,
    y: t.cp1y
  }, a = ge(n, s, e), r = ge(s, o, e), l = ge(o, t, e), c = ge(a, r, e), d = ge(r, l, e);
  return ge(c, d, e);
}
const pd = function(n, t) {
  return {
    x(e) {
      return n + n + t - e;
    },
    setWidth(e) {
      t = e;
    },
    textAlign(e) {
      return e === "center" ? e : e === "right" ? "left" : "right";
    },
    xPlus(e, i) {
      return e - i;
    },
    leftForLtr(e, i) {
      return e - i;
    }
  };
}, md = function() {
  return {
    x(n) {
      return n;
    },
    setWidth(n) {
    },
    textAlign(n) {
      return n;
    },
    xPlus(n, t) {
      return n + t;
    },
    leftForLtr(n, t) {
      return n;
    }
  };
};
function Ae(n, t, e) {
  return n ? pd(t, e) : md();
}
function wa(n, t) {
  let e, i;
  (t === "ltr" || t === "rtl") && (e = n.canvas.style, i = [
    e.getPropertyValue("direction"),
    e.getPropertyPriority("direction")
  ], e.setProperty("direction", t, "important"), n.prevTextDirection = i);
}
function Sa(n, t) {
  t !== void 0 && (delete n.prevTextDirection, n.canvas.style.setProperty("direction", t[0], t[1]));
}
function Ca(n) {
  return n === "angle" ? {
    between: nn,
    compare: uc,
    normalize: mt
  } : {
    between: Gt,
    compare: (t, e) => t - e,
    normalize: (t) => t
  };
}
function Js({ start: n, end: t, count: e, loop: i, style: s }) {
  return {
    start: n % e,
    end: t % e,
    loop: i && (t - n + 1) % e === 0,
    style: s
  };
}
function bd(n, t, e) {
  const { property: i, start: s, end: o } = e, { between: a, normalize: r } = Ca(i), l = t.length;
  let { start: c, end: d, loop: h } = n, f, u;
  if (h) {
    for (c += l, d += l, f = 0, u = l; f < u && a(r(t[c % l][i]), s, o); ++f)
      c--, d--;
    c %= l, d %= l;
  }
  return d < c && (d += l), {
    start: c,
    end: d,
    loop: h,
    style: n.style
  };
}
function ka(n, t, e) {
  if (!e)
    return [
      n
    ];
  const { property: i, start: s, end: o } = e, a = t.length, { compare: r, between: l, normalize: c } = Ca(i), { start: d, end: h, loop: f, style: u } = bd(n, t, e), p = [];
  let m = !1, x = null, v, w, k;
  const M = () => l(s, k, v) && r(s, k) !== 0, C = () => r(o, v) === 0 || l(o, k, v), b = () => m || M(), T = () => !m || C();
  for (let B = d, A = d; B <= h; ++B)
    w = t[B % a], !w.skip && (v = c(w[i]), v !== k && (m = l(v, s, o), x === null && b() && (x = r(v, s) === 0 ? B : A), x !== null && T() && (p.push(Js({
      start: x,
      end: B,
      loop: f,
      count: a,
      style: u
    })), x = null), A = B, k = v));
  return x !== null && p.push(Js({
    start: x,
    end: h,
    loop: f,
    count: a,
    style: u
  })), p;
}
function Ma(n, t) {
  const e = [], i = n.segments;
  for (let s = 0; s < i.length; s++) {
    const o = ka(i[s], n.points, t);
    o.length && e.push(...o);
  }
  return e;
}
function xd(n, t, e, i) {
  let s = 0, o = t - 1;
  if (e && !i)
    for (; s < t && !n[s].skip; )
      s++;
  for (; s < t && n[s].skip; )
    s++;
  for (s %= t, e && (o += s); o > s && n[o % t].skip; )
    o--;
  return o %= t, {
    start: s,
    end: o
  };
}
function yd(n, t, e, i) {
  const s = n.length, o = [];
  let a = t, r = n[t], l;
  for (l = t + 1; l <= e; ++l) {
    const c = n[l % s];
    c.skip || c.stop ? r.skip || (i = !1, o.push({
      start: t % s,
      end: (l - 1) % s,
      loop: i
    }), t = a = c.stop ? l : null) : (a = l, r.skip && (t = l)), r = c;
  }
  return a !== null && o.push({
    start: t % s,
    end: a % s,
    loop: i
  }), o;
}
function vd(n, t) {
  const e = n.points, i = n.options.spanGaps, s = e.length;
  if (!s)
    return [];
  const o = !!n._loop, { start: a, end: r } = xd(e, s, o, i);
  if (i === !0)
    return Zs(n, [
      {
        start: a,
        end: r,
        loop: o
      }
    ], e, t);
  const l = r < a ? r + s : r, c = !!n._fullLoop && a === 0 && r === s - 1;
  return Zs(n, yd(e, a, l, c), e, t);
}
function Zs(n, t, e, i) {
  return !i || !i.setContext || !e ? t : _d(n, t, e, i);
}
function _d(n, t, e, i) {
  const s = n._chart.getContext(), o = Qs(n.options), { _datasetIndex: a, options: { spanGaps: r } } = n, l = e.length, c = [];
  let d = o, h = t[0].start, f = h;
  function u(p, m, x, v) {
    const w = r ? -1 : 1;
    if (p !== m) {
      for (p += l; e[p % l].skip; )
        p -= w;
      for (; e[m % l].skip; )
        m += w;
      p % l !== m % l && (c.push({
        start: p % l,
        end: m % l,
        loop: x,
        style: v
      }), d = v, h = m % l);
    }
  }
  for (const p of t) {
    h = r ? h : p.start;
    let m = e[h % l], x;
    for (f = h + 1; f <= p.end; f++) {
      const v = e[f % l];
      x = Qs(i.setContext(re(s, {
        type: "segment",
        p0: m,
        p1: v,
        p0DataIndex: (f - 1) % l,
        p1DataIndex: f % l,
        datasetIndex: a
      }))), wd(x, d) && u(h, f - 1, p.loop, d), m = v, d = x;
    }
    h < f - 1 && u(h, f - 1, p.loop, d);
  }
  return c;
}
function Qs(n) {
  return {
    backgroundColor: n.backgroundColor,
    borderCapStyle: n.borderCapStyle,
    borderDash: n.borderDash,
    borderDashOffset: n.borderDashOffset,
    borderJoinStyle: n.borderJoinStyle,
    borderWidth: n.borderWidth,
    borderColor: n.borderColor
  };
}
function wd(n, t) {
  if (!t)
    return !1;
  const e = [], i = function(s, o) {
    return Qi(o) ? (e.includes(o) || e.push(o), e.indexOf(o)) : o;
  };
  return JSON.stringify(n, i) !== JSON.stringify(t, i);
}
function Sn(n, t, e) {
  return n.options.clip ? n[e] : t[e];
}
function Sd(n, t) {
  const { xScale: e, yScale: i } = n;
  return e && i ? {
    left: Sn(e, t, "left"),
    right: Sn(e, t, "right"),
    top: Sn(i, t, "top"),
    bottom: Sn(i, t, "bottom")
  } : t;
}
function Ta(n, t) {
  const e = t._clip;
  if (e.disabled)
    return !1;
  const i = Sd(t, n.chartArea);
  return {
    left: e.left === !1 ? 0 : i.left - (e.left === !0 ? 0 : e.left),
    right: e.right === !1 ? n.width : i.right + (e.right === !0 ? 0 : e.right),
    top: e.top === !1 ? 0 : i.top - (e.top === !0 ? 0 : e.top),
    bottom: e.bottom === !1 ? n.height : i.bottom + (e.bottom === !0 ? 0 : e.bottom)
  };
}
/*!
 * Chart.js v4.5.1
 * https://www.chartjs.org
 * (c) 2025 Chart.js Contributors
 * Released under the MIT License
 */
class Cd {
  constructor() {
    this._request = null, this._charts = /* @__PURE__ */ new Map(), this._running = !1, this._lastDate = void 0;
  }
  _notify(t, e, i, s) {
    const o = e.listeners[s], a = e.duration;
    o.forEach((r) => r({
      chart: t,
      initial: e.initial,
      numSteps: a,
      currentStep: Math.min(i - e.start, a)
    }));
  }
  _refresh() {
    this._request || (this._running = !0, this._request = ua.call(window, () => {
      this._update(), this._request = null, this._running && this._refresh();
    }));
  }
  _update(t = Date.now()) {
    let e = 0;
    this._charts.forEach((i, s) => {
      if (!i.running || !i.items.length)
        return;
      const o = i.items;
      let a = o.length - 1, r = !1, l;
      for (; a >= 0; --a)
        l = o[a], l._active ? (l._total > i.duration && (i.duration = l._total), l.tick(t), r = !0) : (o[a] = o[o.length - 1], o.pop());
      r && (s.draw(), this._notify(s, i, t, "progress")), o.length || (i.running = !1, this._notify(s, i, t, "complete"), i.initial = !1), e += o.length;
    }), this._lastDate = t, e === 0 && (this._running = !1);
  }
  _getAnims(t) {
    const e = this._charts;
    let i = e.get(t);
    return i || (i = {
      running: !1,
      initial: !0,
      items: [],
      listeners: {
        complete: [],
        progress: []
      }
    }, e.set(t, i)), i;
  }
  listen(t, e, i) {
    this._getAnims(t).listeners[e].push(i);
  }
  add(t, e) {
    !e || !e.length || this._getAnims(t).items.push(...e);
  }
  has(t) {
    return this._getAnims(t).items.length > 0;
  }
  start(t) {
    const e = this._charts.get(t);
    e && (e.running = !0, e.start = Date.now(), e.duration = e.items.reduce((i, s) => Math.max(i, s._duration), 0), this._refresh());
  }
  running(t) {
    if (!this._running)
      return !1;
    const e = this._charts.get(t);
    return !(!e || !e.running || !e.items.length);
  }
  stop(t) {
    const e = this._charts.get(t);
    if (!e || !e.items.length)
      return;
    const i = e.items;
    let s = i.length - 1;
    for (; s >= 0; --s)
      i[s].cancel();
    e.items = [], this._notify(t, e, Date.now(), "complete");
  }
  remove(t) {
    return this._charts.delete(t);
  }
}
var jt = /* @__PURE__ */ new Cd();
const to = "transparent", kd = {
  boolean(n, t, e) {
    return e > 0.5 ? t : n;
  },
  color(n, t, e) {
    const i = $s(n || to), s = i.valid && $s(t || to);
    return s && s.valid ? s.mix(i, e).hexString() : t;
  },
  number(n, t, e) {
    return n + (t - n) * e;
  }
};
class Md {
  constructor(t, e, i, s) {
    const o = e[i];
    s = _n([
      t.to,
      s,
      o,
      t.from
    ]);
    const a = _n([
      t.from,
      o,
      s
    ]);
    this._active = !0, this._fn = t.fn || kd[t.type || typeof a], this._easing = qe[t.easing] || qe.linear, this._start = Math.floor(Date.now() + (t.delay || 0)), this._duration = this._total = Math.floor(t.duration), this._loop = !!t.loop, this._target = e, this._prop = i, this._from = a, this._to = s, this._promises = void 0;
  }
  active() {
    return this._active;
  }
  update(t, e, i) {
    if (this._active) {
      this._notify(!1);
      const s = this._target[this._prop], o = i - this._start, a = this._duration - o;
      this._start = i, this._duration = Math.floor(Math.max(a, t.duration)), this._total += o, this._loop = !!t.loop, this._to = _n([
        t.to,
        e,
        s,
        t.from
      ]), this._from = _n([
        t.from,
        s,
        e
      ]);
    }
  }
  cancel() {
    this._active && (this.tick(Date.now()), this._active = !1, this._notify(!1));
  }
  tick(t) {
    const e = t - this._start, i = this._duration, s = this._prop, o = this._from, a = this._loop, r = this._to;
    let l;
    if (this._active = o !== r && (a || e < i), !this._active) {
      this._target[s] = r, this._notify(!0);
      return;
    }
    if (e < 0) {
      this._target[s] = o;
      return;
    }
    l = e / i % 2, l = a && l > 1 ? 2 - l : l, l = this._easing(Math.min(1, Math.max(0, l))), this._target[s] = this._fn(o, r, l);
  }
  wait() {
    const t = this._promises || (this._promises = []);
    return new Promise((e, i) => {
      t.push({
        res: e,
        rej: i
      });
    });
  }
  _notify(t) {
    const e = t ? "res" : "rej", i = this._promises || [];
    for (let s = 0; s < i.length; s++)
      i[s][e]();
  }
}
class Ba {
  constructor(t, e) {
    this._chart = t, this._properties = /* @__PURE__ */ new Map(), this.configure(e);
  }
  configure(t) {
    if (!j(t))
      return;
    const e = Object.keys(ot.animation), i = this._properties;
    Object.getOwnPropertyNames(t).forEach((s) => {
      const o = t[s];
      if (!j(o))
        return;
      const a = {};
      for (const r of e)
        a[r] = o[r];
      (nt(o.properties) && o.properties || [
        s
      ]).forEach((r) => {
        (r === s || !i.has(r)) && i.set(r, a);
      });
    });
  }
  _animateOptions(t, e) {
    const i = e.options, s = Bd(t, i);
    if (!s)
      return [];
    const o = this._createAnimations(s, i);
    return i.$shared && Td(t.options.$animations, i).then(() => {
      t.options = i;
    }, () => {
    }), o;
  }
  _createAnimations(t, e) {
    const i = this._properties, s = [], o = t.$animations || (t.$animations = {}), a = Object.keys(e), r = Date.now();
    let l;
    for (l = a.length - 1; l >= 0; --l) {
      const c = a[l];
      if (c.charAt(0) === "$")
        continue;
      if (c === "options") {
        s.push(...this._animateOptions(t, e));
        continue;
      }
      const d = e[c];
      let h = o[c];
      const f = i.get(c);
      if (h)
        if (f && h.active()) {
          h.update(f, d, r);
          continue;
        } else
          h.cancel();
      if (!f || !f.duration) {
        t[c] = d;
        continue;
      }
      o[c] = h = new Md(f, t, c, d), s.push(h);
    }
    return s;
  }
  update(t, e) {
    if (this._properties.size === 0) {
      Object.assign(t, e);
      return;
    }
    const i = this._createAnimations(t, e);
    if (i.length)
      return jt.add(this._chart, i), !0;
  }
}
function Td(n, t) {
  const e = [], i = Object.keys(t);
  for (let s = 0; s < i.length; s++) {
    const o = n[i[s]];
    o && o.active() && e.push(o.wait());
  }
  return Promise.all(e);
}
function Bd(n, t) {
  if (!t)
    return;
  let e = n.options;
  if (!e) {
    n.options = t;
    return;
  }
  return e.$shared && (n.options = e = Object.assign({}, e, {
    $shared: !1,
    $animations: {}
  })), e;
}
function eo(n, t) {
  const e = n && n.options || {}, i = e.reverse, s = e.min === void 0 ? t : 0, o = e.max === void 0 ? t : 0;
  return {
    start: i ? o : s,
    end: i ? s : o
  };
}
function Ad(n, t, e) {
  if (e === !1)
    return !1;
  const i = eo(n, e), s = eo(t, e);
  return {
    top: s.end,
    right: i.end,
    bottom: s.start,
    left: i.start
  };
}
function Fd(n) {
  let t, e, i, s;
  return j(n) ? (t = n.top, e = n.right, i = n.bottom, s = n.left) : t = e = i = s = n, {
    top: t,
    right: e,
    bottom: i,
    left: s,
    disabled: n === !1
  };
}
function Aa(n, t) {
  const e = [], i = n._getSortedDatasetMetas(t);
  let s, o;
  for (s = 0, o = i.length; s < o; ++s)
    e.push(i[s].index);
  return e;
}
function no(n, t, e, i = {}) {
  const s = n.keys, o = i.mode === "single";
  let a, r, l, c;
  if (t === null)
    return;
  let d = !1;
  for (a = 0, r = s.length; a < r; ++a) {
    if (l = +s[a], l === e) {
      if (d = !0, i.all)
        continue;
      break;
    }
    c = n.values[l], gt(c) && (o || t === 0 || It(t) === It(c)) && (t += c);
  }
  return !d && !i.all ? 0 : t;
}
function Pd(n, t) {
  const { iScale: e, vScale: i } = t, s = e.axis === "x" ? "x" : "y", o = i.axis === "x" ? "x" : "y", a = Object.keys(n), r = new Array(a.length);
  let l, c, d;
  for (l = 0, c = a.length; l < c; ++l)
    d = a[l], r[l] = {
      [s]: d,
      [o]: n[d]
    };
  return r;
}
function yi(n, t) {
  const e = n && n.options.stacked;
  return e || e === void 0 && t.stack !== void 0;
}
function Nd(n, t, e) {
  return `${n.id}.${t.id}.${e.stack || e.type}`;
}
function Dd(n) {
  const { min: t, max: e, minDefined: i, maxDefined: s } = n.getUserBounds();
  return {
    min: i ? t : Number.NEGATIVE_INFINITY,
    max: s ? e : Number.POSITIVE_INFINITY
  };
}
function Od(n, t, e) {
  const i = n[t] || (n[t] = {});
  return i[e] || (i[e] = {});
}
function io(n, t, e, i) {
  for (const s of t.getMatchingVisibleMetas(i).reverse()) {
    const o = n[s.index];
    if (e && o > 0 || !e && o < 0)
      return s.index;
  }
  return null;
}
function so(n, t) {
  const { chart: e, _cachedMeta: i } = n, s = e._stacks || (e._stacks = {}), { iScale: o, vScale: a, index: r } = i, l = o.axis, c = a.axis, d = Nd(o, a, i), h = t.length;
  let f;
  for (let u = 0; u < h; ++u) {
    const p = t[u], { [l]: m, [c]: x } = p, v = p._stacks || (p._stacks = {});
    f = v[c] = Od(s, d, m), f[r] = x, f._top = io(f, a, !0, i.type), f._bottom = io(f, a, !1, i.type);
    const w = f._visualValues || (f._visualValues = {});
    w[r] = x;
  }
}
function vi(n, t) {
  const e = n.scales;
  return Object.keys(e).filter((i) => e[i].axis === t).shift();
}
function zd(n, t) {
  return re(n, {
    active: !1,
    dataset: void 0,
    datasetIndex: t,
    index: t,
    mode: "default",
    type: "dataset"
  });
}
function Rd(n, t, e) {
  return re(n, {
    active: !1,
    dataIndex: t,
    parsed: void 0,
    raw: void 0,
    element: e,
    index: t,
    mode: "default",
    type: "data"
  });
}
function Ie(n, t) {
  const e = n.controller.index, i = n.vScale && n.vScale.axis;
  if (i) {
    t = t || n._parsed;
    for (const s of t) {
      const o = s._stacks;
      if (!o || o[i] === void 0 || o[i][e] === void 0)
        return;
      delete o[i][e], o[i]._visualValues !== void 0 && o[i]._visualValues[e] !== void 0 && delete o[i]._visualValues[e];
    }
  }
}
const _i = (n) => n === "reset" || n === "none", oo = (n, t) => t ? n : Object.assign({}, n), Ld = (n, t, e) => n && !t.hidden && t._stacked && {
  keys: Aa(e, !0),
  values: null
};
class se {
  constructor(t, e) {
    this.chart = t, this._ctx = t.ctx, this.index = e, this._cachedDataOpts = {}, this._cachedMeta = this.getMeta(), this._type = this._cachedMeta.type, this.options = void 0, this._parsing = !1, this._data = void 0, this._objectData = void 0, this._sharedOptions = void 0, this._drawStart = void 0, this._drawCount = void 0, this.enableOptionSharing = !1, this.supportsDecimation = !1, this.$context = void 0, this._syncList = [], this.datasetElementType = new.target.datasetElementType, this.dataElementType = new.target.dataElementType, this.initialize();
  }
  initialize() {
    const t = this._cachedMeta;
    this.configure(), this.linkScales(), t._stacked = yi(t.vScale, t), this.addElements(), this.options.fill && !this.chart.isPluginEnabled("filler") && console.warn("Tried to use the 'fill' option without the 'Filler' plugin enabled. Please import and register the 'Filler' plugin and make sure it is not disabled in the options");
  }
  updateIndex(t) {
    this.index !== t && Ie(this._cachedMeta), this.index = t;
  }
  linkScales() {
    const t = this.chart, e = this._cachedMeta, i = this.getDataset(), s = (h, f, u, p) => h === "x" ? f : h === "r" ? p : u, o = e.xAxisID = V(i.xAxisID, vi(t, "x")), a = e.yAxisID = V(i.yAxisID, vi(t, "y")), r = e.rAxisID = V(i.rAxisID, vi(t, "r")), l = e.indexAxis, c = e.iAxisID = s(l, o, a, r), d = e.vAxisID = s(l, a, o, r);
    e.xScale = this.getScaleForId(o), e.yScale = this.getScaleForId(a), e.rScale = this.getScaleForId(r), e.iScale = this.getScaleForId(c), e.vScale = this.getScaleForId(d);
  }
  getDataset() {
    return this.chart.data.datasets[this.index];
  }
  getMeta() {
    return this.chart.getDatasetMeta(this.index);
  }
  getScaleForId(t) {
    return this.chart.scales[t];
  }
  _getOtherScale(t) {
    const e = this._cachedMeta;
    return t === e.iScale ? e.vScale : e.iScale;
  }
  reset() {
    this._update("reset");
  }
  _destroy() {
    const t = this._cachedMeta;
    this._data && Ws(this._data, this), t._stacked && Ie(t);
  }
  _dataCheck() {
    const t = this.getDataset(), e = t.data || (t.data = []), i = this._data;
    if (j(e)) {
      const s = this._cachedMeta;
      this._data = Pd(e, s);
    } else if (i !== e) {
      if (i) {
        Ws(i, this);
        const s = this._cachedMeta;
        Ie(s), s._parsed = [];
      }
      e && Object.isExtensible(e) && bc(e, this), this._syncList = [], this._data = e;
    }
  }
  addElements() {
    const t = this._cachedMeta;
    this._dataCheck(), this.datasetElementType && (t.dataset = new this.datasetElementType());
  }
  buildOrUpdateElements(t) {
    const e = this._cachedMeta, i = this.getDataset();
    let s = !1;
    this._dataCheck();
    const o = e._stacked;
    e._stacked = yi(e.vScale, e), e.stack !== i.stack && (s = !0, Ie(e), e.stack = i.stack), this._resyncElements(t), (s || o !== e._stacked) && (so(this, e._parsed), e._stacked = yi(e.vScale, e));
  }
  configure() {
    const t = this.chart.config, e = t.datasetScopeKeys(this._type), i = t.getOptionScopes(this.getDataset(), e, !0);
    this.options = t.createResolver(i, this.getContext()), this._parsing = this.options.parsing, this._cachedDataOpts = {};
  }
  parse(t, e) {
    const { _cachedMeta: i, _data: s } = this, { iScale: o, _stacked: a } = i, r = o.axis;
    let l = t === 0 && e === s.length ? !0 : i._sorted, c = t > 0 && i._parsed[t - 1], d, h, f;
    if (this._parsing === !1)
      i._parsed = s, i._sorted = !0, f = s;
    else {
      nt(s[t]) ? f = this.parseArrayData(i, s, t, e) : j(s[t]) ? f = this.parseObjectData(i, s, t, e) : f = this.parsePrimitiveData(i, s, t, e);
      const u = () => h[r] === null || c && h[r] < c[r];
      for (d = 0; d < e; ++d)
        i._parsed[d + t] = h = f[d], l && (u() && (l = !1), c = h);
      i._sorted = l;
    }
    a && so(this, f);
  }
  parsePrimitiveData(t, e, i, s) {
    const { iScale: o, vScale: a } = t, r = o.axis, l = a.axis, c = o.getLabels(), d = o === a, h = new Array(s);
    let f, u, p;
    for (f = 0, u = s; f < u; ++f)
      p = f + i, h[f] = {
        [r]: d || o.parse(c[p], p),
        [l]: a.parse(e[p], p)
      };
    return h;
  }
  parseArrayData(t, e, i, s) {
    const { xScale: o, yScale: a } = t, r = new Array(s);
    let l, c, d, h;
    for (l = 0, c = s; l < c; ++l)
      d = l + i, h = e[d], r[l] = {
        x: o.parse(h[0], d),
        y: a.parse(h[1], d)
      };
    return r;
  }
  parseObjectData(t, e, i, s) {
    const { xScale: o, yScale: a } = t, { xAxisKey: r = "x", yAxisKey: l = "y" } = this._parsing, c = new Array(s);
    let d, h, f, u;
    for (d = 0, h = s; d < h; ++d)
      f = d + i, u = e[f], c[d] = {
        x: o.parse(oe(u, r), f),
        y: a.parse(oe(u, l), f)
      };
    return c;
  }
  getParsed(t) {
    return this._cachedMeta._parsed[t];
  }
  getDataElement(t) {
    return this._cachedMeta.data[t];
  }
  applyStack(t, e, i) {
    const s = this.chart, o = this._cachedMeta, a = e[t.axis], r = {
      keys: Aa(s, !0),
      values: e._stacks[t.axis]._visualValues
    };
    return no(r, a, o.index, {
      mode: i
    });
  }
  updateRangeFromParsed(t, e, i, s) {
    const o = i[e.axis];
    let a = o === null ? NaN : o;
    const r = s && i._stacks[e.axis];
    s && r && (s.values = r, a = no(s, o, this._cachedMeta.index)), t.min = Math.min(t.min, a), t.max = Math.max(t.max, a);
  }
  getMinMax(t, e) {
    const i = this._cachedMeta, s = i._parsed, o = i._sorted && t === i.iScale, a = s.length, r = this._getOtherScale(t), l = Ld(e, i, this.chart), c = {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY
    }, { min: d, max: h } = Dd(r);
    let f, u;
    function p() {
      u = s[f];
      const m = u[r.axis];
      return !gt(u[t.axis]) || d > m || h < m;
    }
    for (f = 0; f < a && !(!p() && (this.updateRangeFromParsed(c, t, u, l), o)); ++f)
      ;
    if (o) {
      for (f = a - 1; f >= 0; --f)
        if (!p()) {
          this.updateRangeFromParsed(c, t, u, l);
          break;
        }
    }
    return c;
  }
  getAllParsedValues(t) {
    const e = this._cachedMeta._parsed, i = [];
    let s, o, a;
    for (s = 0, o = e.length; s < o; ++s)
      a = e[s][t.axis], gt(a) && i.push(a);
    return i;
  }
  getMaxOverflow() {
    return !1;
  }
  getLabelAndValue(t) {
    const e = this._cachedMeta, i = e.iScale, s = e.vScale, o = this.getParsed(t);
    return {
      label: i ? "" + i.getLabelForValue(o[i.axis]) : "",
      value: s ? "" + s.getLabelForValue(o[s.axis]) : ""
    };
  }
  _update(t) {
    const e = this._cachedMeta;
    this.update(t || "default"), e._clip = Fd(V(this.options.clip, Ad(e.xScale, e.yScale, this.getMaxOverflow())));
  }
  update(t) {
  }
  draw() {
    const t = this._ctx, e = this.chart, i = this._cachedMeta, s = i.data || [], o = e.chartArea, a = [], r = this._drawStart || 0, l = this._drawCount || s.length - r, c = this.options.drawActiveElementsOnTop;
    let d;
    for (i.dataset && i.dataset.draw(t, o, r, l), d = r; d < r + l; ++d) {
      const h = s[d];
      h.hidden || (h.active && c ? a.push(h) : h.draw(t, o));
    }
    for (d = 0; d < a.length; ++d)
      a[d].draw(t, o);
  }
  getStyle(t, e) {
    const i = e ? "active" : "default";
    return t === void 0 && this._cachedMeta.dataset ? this.resolveDatasetElementOptions(i) : this.resolveDataElementOptions(t || 0, i);
  }
  getContext(t, e, i) {
    const s = this.getDataset();
    let o;
    if (t >= 0 && t < this._cachedMeta.data.length) {
      const a = this._cachedMeta.data[t];
      o = a.$context || (a.$context = Rd(this.getContext(), t, a)), o.parsed = this.getParsed(t), o.raw = s.data[t], o.index = o.dataIndex = t;
    } else
      o = this.$context || (this.$context = zd(this.chart.getContext(), this.index)), o.dataset = s, o.index = o.datasetIndex = this.index;
    return o.active = !!e, o.mode = i, o;
  }
  resolveDatasetElementOptions(t) {
    return this._resolveElementOptions(this.datasetElementType.id, t);
  }
  resolveDataElementOptions(t, e) {
    return this._resolveElementOptions(this.dataElementType.id, e, t);
  }
  _resolveElementOptions(t, e = "default", i) {
    const s = e === "active", o = this._cachedDataOpts, a = t + "-" + e, r = o[a], l = this.enableOptionSharing && tn(i);
    if (r)
      return oo(r, l);
    const c = this.chart.config, d = c.datasetElementScopeKeys(this._type, t), h = s ? [
      `${t}Hover`,
      "hover",
      t,
      ""
    ] : [
      t,
      ""
    ], f = c.getOptionScopes(this.getDataset(), d), u = Object.keys(ot.elements[t]), p = () => this.getContext(i, s, e), m = c.resolveNamedOptions(f, u, p, h);
    return m.$shared && (m.$shared = l, o[a] = Object.freeze(oo(m, l))), m;
  }
  _resolveAnimations(t, e, i) {
    const s = this.chart, o = this._cachedDataOpts, a = `animation-${e}`, r = o[a];
    if (r)
      return r;
    let l;
    if (s.options.animation !== !1) {
      const d = this.chart.config, h = d.datasetAnimationScopeKeys(this._type, e), f = d.getOptionScopes(this.getDataset(), h);
      l = d.createResolver(f, this.getContext(t, i, e));
    }
    const c = new Ba(s, l && l.animations);
    return l && l._cacheable && (o[a] = Object.freeze(c)), c;
  }
  getSharedOptions(t) {
    if (t.$shared)
      return this._sharedOptions || (this._sharedOptions = Object.assign({}, t));
  }
  includeOptions(t, e) {
    return !e || _i(t) || this.chart._animationsDisabled;
  }
  _getSharedOptions(t, e) {
    const i = this.resolveDataElementOptions(t, e), s = this._sharedOptions, o = this.getSharedOptions(i), a = this.includeOptions(e, o) || o !== s;
    return this.updateSharedOptions(o, e, i), {
      sharedOptions: o,
      includeOptions: a
    };
  }
  updateElement(t, e, i, s) {
    _i(s) ? Object.assign(t, i) : this._resolveAnimations(e, s).update(t, i);
  }
  updateSharedOptions(t, e, i) {
    t && !_i(e) && this._resolveAnimations(void 0, e).update(t, i);
  }
  _setStyle(t, e, i, s) {
    t.active = s;
    const o = this.getStyle(e, s);
    this._resolveAnimations(e, i, s).update(t, {
      options: !s && this.getSharedOptions(o) || o
    });
  }
  removeHoverStyle(t, e, i) {
    this._setStyle(t, i, "active", !1);
  }
  setHoverStyle(t, e, i) {
    this._setStyle(t, i, "active", !0);
  }
  _removeDatasetHoverStyle() {
    const t = this._cachedMeta.dataset;
    t && this._setStyle(t, void 0, "active", !1);
  }
  _setDatasetHoverStyle() {
    const t = this._cachedMeta.dataset;
    t && this._setStyle(t, void 0, "active", !0);
  }
  _resyncElements(t) {
    const e = this._data, i = this._cachedMeta.data;
    for (const [r, l, c] of this._syncList)
      this[r](l, c);
    this._syncList = [];
    const s = i.length, o = e.length, a = Math.min(o, s);
    a && this.parse(0, a), o > s ? this._insertElements(s, o - s, t) : o < s && this._removeElements(o, s - o);
  }
  _insertElements(t, e, i = !0) {
    const s = this._cachedMeta, o = s.data, a = t + e;
    let r;
    const l = (c) => {
      for (c.length += e, r = c.length - 1; r >= a; r--)
        c[r] = c[r - e];
    };
    for (l(o), r = t; r < a; ++r)
      o[r] = new this.dataElementType();
    this._parsing && l(s._parsed), this.parse(t, e), i && this.updateElements(o, t, e, "reset");
  }
  updateElements(t, e, i, s) {
  }
  _removeElements(t, e) {
    const i = this._cachedMeta;
    if (this._parsing) {
      const s = i._parsed.splice(t, e);
      i._stacked && Ie(i, s);
    }
    i.data.splice(t, e);
  }
  _sync(t) {
    if (this._parsing)
      this._syncList.push(t);
    else {
      const [e, i, s] = t;
      this[e](i, s);
    }
    this.chart._dataChanges.push([
      this.index,
      ...t
    ]);
  }
  _onDataPush() {
    const t = arguments.length;
    this._sync([
      "_insertElements",
      this.getDataset().data.length - t,
      t
    ]);
  }
  _onDataPop() {
    this._sync([
      "_removeElements",
      this._cachedMeta.data.length - 1,
      1
    ]);
  }
  _onDataShift() {
    this._sync([
      "_removeElements",
      0,
      1
    ]);
  }
  _onDataSplice(t, e) {
    e && this._sync([
      "_removeElements",
      t,
      e
    ]);
    const i = arguments.length - 2;
    i && this._sync([
      "_insertElements",
      t,
      i
    ]);
  }
  _onDataUnshift() {
    this._sync([
      "_insertElements",
      0,
      arguments.length
    ]);
  }
}
P(se, "defaults", {}), P(se, "datasetElementType", null), P(se, "dataElementType", null);
function Id(n, t) {
  if (!n._cache.$bar) {
    const e = n.getMatchingVisibleMetas(t);
    let i = [];
    for (let s = 0, o = e.length; s < o; s++)
      i = i.concat(e[s].controller.getAllParsedValues(n));
    n._cache.$bar = fa(i.sort((s, o) => s - o));
  }
  return n._cache.$bar;
}
function Ed(n) {
  const t = n.iScale, e = Id(t, n.type);
  let i = t._length, s, o, a, r;
  const l = () => {
    a === 32767 || a === -32768 || (tn(r) && (i = Math.min(i, Math.abs(a - r) || i)), r = a);
  };
  for (s = 0, o = e.length; s < o; ++s)
    a = t.getPixelForValue(e[s]), l();
  for (r = void 0, s = 0, o = t.ticks.length; s < o; ++s)
    a = t.getPixelForTick(s), l();
  return i;
}
function Vd(n, t, e, i) {
  const s = e.barThickness;
  let o, a;
  return U(s) ? (o = t.min * e.categoryPercentage, a = e.barPercentage) : (o = s * i, a = 1), {
    chunk: o / i,
    ratio: a,
    start: t.pixels[n] - o / 2
  };
}
function Wd(n, t, e, i) {
  const s = t.pixels, o = s[n];
  let a = n > 0 ? s[n - 1] : null, r = n < s.length - 1 ? s[n + 1] : null;
  const l = e.categoryPercentage;
  a === null && (a = o - (r === null ? t.end - t.start : r - o)), r === null && (r = o + o - a);
  const c = o - (o - Math.min(a, r)) / 2 * l;
  return {
    chunk: Math.abs(r - a) / 2 * l / i,
    ratio: e.barPercentage,
    start: c
  };
}
function Hd(n, t, e, i) {
  const s = e.parse(n[0], i), o = e.parse(n[1], i), a = Math.min(s, o), r = Math.max(s, o);
  let l = a, c = r;
  Math.abs(a) > Math.abs(r) && (l = r, c = a), t[e.axis] = c, t._custom = {
    barStart: l,
    barEnd: c,
    start: s,
    end: o,
    min: a,
    max: r
  };
}
function Fa(n, t, e, i) {
  return nt(n) ? Hd(n, t, e, i) : t[e.axis] = e.parse(n, i), t;
}
function ao(n, t, e, i) {
  const s = n.iScale, o = n.vScale, a = s.getLabels(), r = s === o, l = [];
  let c, d, h, f;
  for (c = e, d = e + i; c < d; ++c)
    f = t[c], h = {}, h[s.axis] = r || s.parse(a[c], c), l.push(Fa(f, h, o, c));
  return l;
}
function wi(n) {
  return n && n.barStart !== void 0 && n.barEnd !== void 0;
}
function jd(n, t, e) {
  return n !== 0 ? It(n) : (t.isHorizontal() ? 1 : -1) * (t.min >= e ? 1 : -1);
}
function $d(n) {
  let t, e, i, s, o;
  return n.horizontal ? (t = n.base > n.x, e = "left", i = "right") : (t = n.base < n.y, e = "bottom", i = "top"), t ? (s = "end", o = "start") : (s = "start", o = "end"), {
    start: e,
    end: i,
    reverse: t,
    top: s,
    bottom: o
  };
}
function Yd(n, t, e, i) {
  let s = t.borderSkipped;
  const o = {};
  if (!s) {
    n.borderSkipped = o;
    return;
  }
  if (s === !0) {
    n.borderSkipped = {
      top: !0,
      right: !0,
      bottom: !0,
      left: !0
    };
    return;
  }
  const { start: a, end: r, reverse: l, top: c, bottom: d } = $d(n);
  s === "middle" && e && (n.enableBorderRadius = !0, (e._top || 0) === i ? s = c : (e._bottom || 0) === i ? s = d : (o[ro(d, a, r, l)] = !0, s = c)), o[ro(s, a, r, l)] = !0, n.borderSkipped = o;
}
function ro(n, t, e, i) {
  return i ? (n = Ud(n, t, e), n = lo(n, e, t)) : n = lo(n, t, e), n;
}
function Ud(n, t, e) {
  return n === t ? e : n === e ? t : n;
}
function lo(n, t, e) {
  return n === "start" ? t : n === "end" ? e : n;
}
function Gd(n, { inflateAmount: t }, e) {
  n.inflateAmount = t === "auto" ? e === 1 ? 0.33 : 0 : t;
}
class Nn extends se {
  parsePrimitiveData(t, e, i, s) {
    return ao(t, e, i, s);
  }
  parseArrayData(t, e, i, s) {
    return ao(t, e, i, s);
  }
  parseObjectData(t, e, i, s) {
    const { iScale: o, vScale: a } = t, { xAxisKey: r = "x", yAxisKey: l = "y" } = this._parsing, c = o.axis === "x" ? r : l, d = a.axis === "x" ? r : l, h = [];
    let f, u, p, m;
    for (f = i, u = i + s; f < u; ++f)
      m = e[f], p = {}, p[o.axis] = o.parse(oe(m, c), f), h.push(Fa(oe(m, d), p, a, f));
    return h;
  }
  updateRangeFromParsed(t, e, i, s) {
    super.updateRangeFromParsed(t, e, i, s);
    const o = i._custom;
    o && e === this._cachedMeta.vScale && (t.min = Math.min(t.min, o.min), t.max = Math.max(t.max, o.max));
  }
  getMaxOverflow() {
    return 0;
  }
  getLabelAndValue(t) {
    const e = this._cachedMeta, { iScale: i, vScale: s } = e, o = this.getParsed(t), a = o._custom, r = wi(a) ? "[" + a.start + ", " + a.end + "]" : "" + s.getLabelForValue(o[s.axis]);
    return {
      label: "" + i.getLabelForValue(o[i.axis]),
      value: r
    };
  }
  initialize() {
    this.enableOptionSharing = !0, super.initialize();
    const t = this._cachedMeta;
    t.stack = this.getDataset().stack;
  }
  update(t) {
    const e = this._cachedMeta;
    this.updateElements(e.data, 0, e.data.length, t);
  }
  updateElements(t, e, i, s) {
    const o = s === "reset", { index: a, _cachedMeta: { vScale: r } } = this, l = r.getBasePixel(), c = r.isHorizontal(), d = this._getRuler(), { sharedOptions: h, includeOptions: f } = this._getSharedOptions(e, s);
    for (let u = e; u < e + i; u++) {
      const p = this.getParsed(u), m = o || U(p[r.axis]) ? {
        base: l,
        head: l
      } : this._calculateBarValuePixels(u), x = this._calculateBarIndexPixels(u, d), v = (p._stacks || {})[r.axis], w = {
        horizontal: c,
        base: m.base,
        enableBorderRadius: !v || wi(p._custom) || a === v._top || a === v._bottom,
        x: c ? m.head : x.center,
        y: c ? x.center : m.head,
        height: c ? x.size : Math.abs(m.size),
        width: c ? Math.abs(m.size) : x.size
      };
      f && (w.options = h || this.resolveDataElementOptions(u, t[u].active ? "active" : s));
      const k = w.options || t[u].options;
      Yd(w, k, v, a), Gd(w, k, d.ratio), this.updateElement(t[u], u, w, s);
    }
  }
  _getStacks(t, e) {
    const { iScale: i } = this._cachedMeta, s = i.getMatchingVisibleMetas(this._type).filter((d) => d.controller.options.grouped), o = i.options.stacked, a = [], r = this._cachedMeta.controller.getParsed(e), l = r && r[i.axis], c = (d) => {
      const h = d._parsed.find((u) => u[i.axis] === l), f = h && h[d.vScale.axis];
      if (U(f) || isNaN(f))
        return !0;
    };
    for (const d of s)
      if (!(e !== void 0 && c(d)) && ((o === !1 || a.indexOf(d.stack) === -1 || o === void 0 && d.stack === void 0) && a.push(d.stack), d.index === t))
        break;
    return a.length || a.push(void 0), a;
  }
  _getStackCount(t) {
    return this._getStacks(void 0, t).length;
  }
  _getAxisCount() {
    return this._getAxis().length;
  }
  getFirstScaleIdForIndexAxis() {
    const t = this.chart.scales, e = this.chart.options.indexAxis;
    return Object.keys(t).filter((i) => t[i].axis === e).shift();
  }
  _getAxis() {
    const t = {}, e = this.getFirstScaleIdForIndexAxis();
    for (const i of this.chart.data.datasets)
      t[V(this.chart.options.indexAxis === "x" ? i.xAxisID : i.yAxisID, e)] = !0;
    return Object.keys(t);
  }
  _getStackIndex(t, e, i) {
    const s = this._getStacks(t, i), o = e !== void 0 ? s.indexOf(e) : -1;
    return o === -1 ? s.length - 1 : o;
  }
  _getRuler() {
    const t = this.options, e = this._cachedMeta, i = e.iScale, s = [];
    let o, a;
    for (o = 0, a = e.data.length; o < a; ++o)
      s.push(i.getPixelForValue(this.getParsed(o)[i.axis], o));
    const r = t.barThickness;
    return {
      min: r || Ed(e),
      pixels: s,
      start: i._startPixel,
      end: i._endPixel,
      stackCount: this._getStackCount(),
      scale: i,
      grouped: t.grouped,
      ratio: r ? 1 : t.categoryPercentage * t.barPercentage
    };
  }
  _calculateBarValuePixels(t) {
    const { _cachedMeta: { vScale: e, _stacked: i, index: s }, options: { base: o, minBarLength: a } } = this, r = o || 0, l = this.getParsed(t), c = l._custom, d = wi(c);
    let h = l[e.axis], f = 0, u = i ? this.applyStack(e, l, i) : h, p, m;
    u !== h && (f = u - h, u = h), d && (h = c.barStart, u = c.barEnd - c.barStart, h !== 0 && It(h) !== It(c.barEnd) && (f = 0), f += h);
    const x = !U(o) && !d ? o : f;
    let v = e.getPixelForValue(x);
    if (this.chart.getDataVisibility(t) ? p = e.getPixelForValue(f + u) : p = v, m = p - v, Math.abs(m) < a) {
      m = jd(m, e, r) * a, h === r && (v -= m / 2);
      const w = e.getPixelForDecimal(0), k = e.getPixelForDecimal(1), M = Math.min(w, k), C = Math.max(w, k);
      v = Math.max(Math.min(v, C), M), p = v + m, i && !d && (l._stacks[e.axis]._visualValues[s] = e.getValueForPixel(p) - e.getValueForPixel(v));
    }
    if (v === e.getPixelForValue(r)) {
      const w = It(m) * e.getLineWidthForValue(r) / 2;
      v += w, m -= w;
    }
    return {
      size: m,
      base: v,
      head: p,
      center: p + m / 2
    };
  }
  _calculateBarIndexPixels(t, e) {
    const i = e.scale, s = this.options, o = s.skipNull, a = V(s.maxBarThickness, 1 / 0);
    let r, l;
    const c = this._getAxisCount();
    if (e.grouped) {
      const d = o ? this._getStackCount(t) : e.stackCount, h = s.barThickness === "flex" ? Wd(t, e, s, d * c) : Vd(t, e, s, d * c), f = this.chart.options.indexAxis === "x" ? this.getDataset().xAxisID : this.getDataset().yAxisID, u = this._getAxis().indexOf(V(f, this.getFirstScaleIdForIndexAxis())), p = this._getStackIndex(this.index, this._cachedMeta.stack, o ? t : void 0) + u;
      r = h.start + h.chunk * p + h.chunk / 2, l = Math.min(a, h.chunk * h.ratio);
    } else
      r = i.getPixelForValue(this.getParsed(t)[i.axis], t), l = Math.min(a, e.min * e.ratio);
    return {
      base: r - l / 2,
      head: r + l / 2,
      center: r,
      size: l
    };
  }
  draw() {
    const t = this._cachedMeta, e = t.vScale, i = t.data, s = i.length;
    let o = 0;
    for (; o < s; ++o)
      this.getParsed(o)[e.axis] !== null && !i[o].hidden && i[o].draw(this._ctx);
  }
}
P(Nn, "id", "bar"), P(Nn, "defaults", {
  datasetElementType: !1,
  dataElementType: "bar",
  categoryPercentage: 0.8,
  barPercentage: 0.9,
  grouped: !0,
  animations: {
    numbers: {
      type: "number",
      properties: [
        "x",
        "y",
        "base",
        "width",
        "height"
      ]
    }
  }
}), P(Nn, "overrides", {
  scales: {
    _index_: {
      type: "category",
      offset: !0,
      grid: {
        offset: !0
      }
    },
    _value_: {
      type: "linear",
      beginAtZero: !0
    }
  }
});
function Xd(n, t, e) {
  let i = 1, s = 1, o = 0, a = 0;
  if (t < tt) {
    const r = n, l = r + t, c = Math.cos(r), d = Math.sin(r), h = Math.cos(l), f = Math.sin(l), u = (k, M, C) => nn(k, r, l, !0) ? 1 : Math.max(M, M * e, C, C * e), p = (k, M, C) => nn(k, r, l, !0) ? -1 : Math.min(M, M * e, C, C * e), m = u(0, c, h), x = u(rt, d, f), v = p(X, c, h), w = p(X + rt, d, f);
    i = (m - v) / 2, s = (x - w) / 2, o = -(m + v) / 2, a = -(x + w) / 2;
  }
  return {
    ratioX: i,
    ratioY: s,
    offsetX: o,
    offsetY: a
  };
}
class Be extends se {
  constructor(t, e) {
    super(t, e), this.enableOptionSharing = !0, this.innerRadius = void 0, this.outerRadius = void 0, this.offsetX = void 0, this.offsetY = void 0;
  }
  linkScales() {
  }
  parse(t, e) {
    const i = this.getDataset().data, s = this._cachedMeta;
    if (this._parsing === !1)
      s._parsed = i;
    else {
      let o = (l) => +i[l];
      if (j(i[t])) {
        const { key: l = "value" } = this._parsing;
        o = (c) => +oe(i[c], l);
      }
      let a, r;
      for (a = t, r = t + e; a < r; ++a)
        s._parsed[a] = o(a);
    }
  }
  _getRotation() {
    return Lt(this.options.rotation - 90);
  }
  _getCircumference() {
    return Lt(this.options.circumference);
  }
  _getRotationExtents() {
    let t = tt, e = -tt;
    for (let i = 0; i < this.chart.data.datasets.length; ++i)
      if (this.chart.isDatasetVisible(i) && this.chart.getDatasetMeta(i).type === this._type) {
        const s = this.chart.getDatasetMeta(i).controller, o = s._getRotation(), a = s._getCircumference();
        t = Math.min(t, o), e = Math.max(e, o + a);
      }
    return {
      rotation: t,
      circumference: e - t
    };
  }
  update(t) {
    const e = this.chart, { chartArea: i } = e, s = this._cachedMeta, o = s.data, a = this.getMaxBorderWidth() + this.getMaxOffset(o) + this.options.spacing, r = Math.max((Math.min(i.width, i.height) - a) / 2, 0), l = Math.min(ec(this.options.cutout, r), 1), c = this._getRingWeight(this.index), { circumference: d, rotation: h } = this._getRotationExtents(), { ratioX: f, ratioY: u, offsetX: p, offsetY: m } = Xd(h, d, l), x = (i.width - a) / f, v = (i.height - a) / u, w = Math.max(Math.min(x, v) / 2, 0), k = ra(this.options.radius, w), M = Math.max(k * l, 0), C = (k - M) / this._getVisibleDatasetWeightTotal();
    this.offsetX = p * k, this.offsetY = m * k, s.total = this.calculateTotal(), this.outerRadius = k - C * this._getRingWeightOffset(this.index), this.innerRadius = Math.max(this.outerRadius - C * c, 0), this.updateElements(o, 0, o.length, t);
  }
  _circumference(t, e) {
    const i = this.options, s = this._cachedMeta, o = this._getCircumference();
    return e && i.animation.animateRotate || !this.chart.getDataVisibility(t) || s._parsed[t] === null || s.data[t].hidden ? 0 : this.calculateCircumference(s._parsed[t] * o / tt);
  }
  updateElements(t, e, i, s) {
    const o = s === "reset", a = this.chart, r = a.chartArea, c = a.options.animation, d = (r.left + r.right) / 2, h = (r.top + r.bottom) / 2, f = o && c.animateScale, u = f ? 0 : this.innerRadius, p = f ? 0 : this.outerRadius, { sharedOptions: m, includeOptions: x } = this._getSharedOptions(e, s);
    let v = this._getRotation(), w;
    for (w = 0; w < e; ++w)
      v += this._circumference(w, o);
    for (w = e; w < e + i; ++w) {
      const k = this._circumference(w, o), M = t[w], C = {
        x: d + this.offsetX,
        y: h + this.offsetY,
        startAngle: v,
        endAngle: v + k,
        circumference: k,
        outerRadius: p,
        innerRadius: u
      };
      x && (C.options = m || this.resolveDataElementOptions(w, M.active ? "active" : s)), v += k, this.updateElement(M, w, C, s);
    }
  }
  calculateTotal() {
    const t = this._cachedMeta, e = t.data;
    let i = 0, s;
    for (s = 0; s < e.length; s++) {
      const o = t._parsed[s];
      o !== null && !isNaN(o) && this.chart.getDataVisibility(s) && !e[s].hidden && (i += Math.abs(o));
    }
    return i;
  }
  calculateCircumference(t) {
    const e = this._cachedMeta.total;
    return e > 0 && !isNaN(t) ? tt * (Math.abs(t) / e) : 0;
  }
  getLabelAndValue(t) {
    const e = this._cachedMeta, i = this.chart, s = i.data.labels || [], o = ts(e._parsed[t], i.options.locale);
    return {
      label: s[t] || "",
      value: o
    };
  }
  getMaxBorderWidth(t) {
    let e = 0;
    const i = this.chart;
    let s, o, a, r, l;
    if (!t) {
      for (s = 0, o = i.data.datasets.length; s < o; ++s)
        if (i.isDatasetVisible(s)) {
          a = i.getDatasetMeta(s), t = a.data, r = a.controller;
          break;
        }
    }
    if (!t)
      return 0;
    for (s = 0, o = t.length; s < o; ++s)
      l = r.resolveDataElementOptions(s), l.borderAlign !== "inner" && (e = Math.max(e, l.borderWidth || 0, l.hoverBorderWidth || 0));
    return e;
  }
  getMaxOffset(t) {
    let e = 0;
    for (let i = 0, s = t.length; i < s; ++i) {
      const o = this.resolveDataElementOptions(i);
      e = Math.max(e, o.offset || 0, o.hoverOffset || 0);
    }
    return e;
  }
  _getRingWeightOffset(t) {
    let e = 0;
    for (let i = 0; i < t; ++i)
      this.chart.isDatasetVisible(i) && (e += this._getRingWeight(i));
    return e;
  }
  _getRingWeight(t) {
    return Math.max(V(this.chart.data.datasets[t].weight, 1), 0);
  }
  _getVisibleDatasetWeightTotal() {
    return this._getRingWeightOffset(this.chart.data.datasets.length) || 1;
  }
}
P(Be, "id", "doughnut"), P(Be, "defaults", {
  datasetElementType: !1,
  dataElementType: "arc",
  animation: {
    animateRotate: !0,
    animateScale: !1
  },
  animations: {
    numbers: {
      type: "number",
      properties: [
        "circumference",
        "endAngle",
        "innerRadius",
        "outerRadius",
        "startAngle",
        "x",
        "y",
        "offset",
        "borderWidth",
        "spacing"
      ]
    }
  },
  cutout: "50%",
  rotation: 0,
  circumference: 360,
  radius: "100%",
  spacing: 0,
  indexAxis: "r"
}), P(Be, "descriptors", {
  _scriptable: (t) => t !== "spacing",
  _indexable: (t) => t !== "spacing" && !t.startsWith("borderDash") && !t.startsWith("hoverBorderDash")
}), P(Be, "overrides", {
  aspectRatio: 1,
  plugins: {
    legend: {
      labels: {
        generateLabels(t) {
          const e = t.data, { labels: { pointStyle: i, textAlign: s, color: o, useBorderRadius: a, borderRadius: r } } = t.legend.options;
          return e.labels.length && e.datasets.length ? e.labels.map((l, c) => {
            const h = t.getDatasetMeta(0).controller.getStyle(c);
            return {
              text: l,
              fillStyle: h.backgroundColor,
              fontColor: o,
              hidden: !t.getDataVisibility(c),
              lineDash: h.borderDash,
              lineDashOffset: h.borderDashOffset,
              lineJoin: h.borderJoinStyle,
              lineWidth: h.borderWidth,
              strokeStyle: h.borderColor,
              textAlign: s,
              pointStyle: i,
              borderRadius: a && (r || h.borderRadius),
              index: c
            };
          }) : [];
        }
      },
      onClick(t, e, i) {
        i.chart.toggleDataVisibility(e.index), i.chart.update();
      }
    }
  }
});
class Dn extends se {
  initialize() {
    this.enableOptionSharing = !0, this.supportsDecimation = !0, super.initialize();
  }
  update(t) {
    const e = this._cachedMeta, { dataset: i, data: s = [], _dataset: o } = e, a = this.chart._animationsDisabled;
    let { start: r, count: l } = vc(e, s, a);
    this._drawStart = r, this._drawCount = l, _c(e) && (r = 0, l = s.length), i._chart = this.chart, i._datasetIndex = this.index, i._decimated = !!o._decimated, i.points = s;
    const c = this.resolveDatasetElementOptions(t);
    this.options.showLine || (c.borderWidth = 0), c.segment = this.options.segment, this.updateElement(i, void 0, {
      animated: !a,
      options: c
    }, t), this.updateElements(s, r, l, t);
  }
  updateElements(t, e, i, s) {
    const o = s === "reset", { iScale: a, vScale: r, _stacked: l, _dataset: c } = this._cachedMeta, { sharedOptions: d, includeOptions: h } = this._getSharedOptions(e, s), f = a.axis, u = r.axis, { spanGaps: p, segment: m } = this.options, x = en(p) ? p : Number.POSITIVE_INFINITY, v = this.chart._animationsDisabled || o || s === "none", w = e + i, k = t.length;
    let M = e > 0 && this.getParsed(e - 1);
    for (let C = 0; C < k; ++C) {
      const b = t[C], T = v ? b : {};
      if (C < e || C >= w) {
        T.skip = !0;
        continue;
      }
      const B = this.getParsed(C), A = U(B[u]), D = T[f] = a.getPixelForValue(B[f], C), N = T[u] = o || A ? r.getBasePixel() : r.getPixelForValue(l ? this.applyStack(r, B, l) : B[u], C);
      T.skip = isNaN(D) || isNaN(N) || A, T.stop = C > 0 && Math.abs(B[f] - M[f]) > x, m && (T.parsed = B, T.raw = c.data[C]), h && (T.options = d || this.resolveDataElementOptions(C, b.active ? "active" : s)), v || this.updateElement(b, C, T, s), M = B;
    }
  }
  getMaxOverflow() {
    const t = this._cachedMeta, e = t.dataset, i = e.options && e.options.borderWidth || 0, s = t.data || [];
    if (!s.length)
      return i;
    const o = s[0].size(this.resolveDataElementOptions(0)), a = s[s.length - 1].size(this.resolveDataElementOptions(s.length - 1));
    return Math.max(i, o, a) / 2;
  }
  draw() {
    const t = this._cachedMeta;
    t.dataset.updateControlPoints(this.chart.chartArea, t.iScale.axis), super.draw();
  }
}
P(Dn, "id", "line"), P(Dn, "defaults", {
  datasetElementType: "line",
  dataElementType: "point",
  showLine: !0,
  spanGaps: !1
}), P(Dn, "overrides", {
  scales: {
    _index_: {
      type: "category"
    },
    _value_: {
      type: "linear"
    }
  }
});
class zi extends Be {
}
P(zi, "id", "pie"), P(zi, "defaults", {
  cutout: 0,
  rotation: 0,
  circumference: 360,
  radius: "100%"
});
class On extends se {
  getLabelAndValue(t) {
    const e = this._cachedMeta.vScale, i = this.getParsed(t);
    return {
      label: e.getLabels()[t],
      value: "" + e.getLabelForValue(i[e.axis])
    };
  }
  parseObjectData(t, e, i, s) {
    return Zc.bind(this)(t, e, i, s);
  }
  update(t) {
    const e = this._cachedMeta, i = e.dataset, s = e.data || [], o = e.iScale.getLabels();
    if (i.points = s, t !== "resize") {
      const a = this.resolveDatasetElementOptions(t);
      this.options.showLine || (a.borderWidth = 0);
      const r = {
        _loop: !0,
        _fullLoop: o.length === s.length,
        options: a
      };
      this.updateElement(i, void 0, r, t);
    }
    this.updateElements(s, 0, s.length, t);
  }
  updateElements(t, e, i, s) {
    const o = this._cachedMeta.rScale, a = s === "reset";
    for (let r = e; r < e + i; r++) {
      const l = t[r], c = this.resolveDataElementOptions(r, l.active ? "active" : s), d = o.getPointPositionForValue(r, this.getParsed(r).r), h = a ? o.xCenter : d.x, f = a ? o.yCenter : d.y, u = {
        x: h,
        y: f,
        angle: d.angle,
        skip: isNaN(h) || isNaN(f),
        options: c
      };
      this.updateElement(l, r, u, s);
    }
  }
}
P(On, "id", "radar"), P(On, "defaults", {
  datasetElementType: "line",
  dataElementType: "point",
  indexAxis: "r",
  showLine: !0,
  elements: {
    line: {
      fill: "start"
    }
  }
}), P(On, "overrides", {
  aspectRatio: 1,
  scales: {
    r: {
      type: "radialLinear"
    }
  }
});
function fe() {
  throw new Error("This method is not implemented: Check that a complete date adapter is provided.");
}
class ls {
  constructor(t) {
    P(this, "options");
    this.options = t || {};
  }
  /**
  * Override default date adapter methods.
  * Accepts type parameter to define options type.
  * @example
  * Chart._adapters._date.override<{myAdapterOption: string}>({
  *   init() {
  *     console.log(this.options.myAdapterOption);
  *   }
  * })
  */
  static override(t) {
    Object.assign(ls.prototype, t);
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  init() {
  }
  formats() {
    return fe();
  }
  parse() {
    return fe();
  }
  format() {
    return fe();
  }
  add() {
    return fe();
  }
  diff() {
    return fe();
  }
  startOf() {
    return fe();
  }
  endOf() {
    return fe();
  }
}
var Kd = {
  _date: ls
};
function qd(n, t, e, i) {
  const { controller: s, data: o, _sorted: a } = n, r = s._cachedMeta.iScale, l = n.dataset && n.dataset.options ? n.dataset.options.spanGaps : null;
  if (r && t === r.axis && t !== "r" && a && o.length) {
    const c = r._reversePixels ? pc : pe;
    if (i) {
      if (s._sharedOptions) {
        const d = o[0], h = typeof d.getRange == "function" && d.getRange(t);
        if (h) {
          const f = c(o, t, e - h), u = c(o, t, e + h);
          return {
            lo: f.lo,
            hi: u.hi
          };
        }
      }
    } else {
      const d = c(o, t, e);
      if (l) {
        const { vScale: h } = s._cachedMeta, { _parsed: f } = n, u = f.slice(0, d.lo + 1).reverse().findIndex((m) => !U(m[h.axis]));
        d.lo -= Math.max(0, u);
        const p = f.slice(d.hi).findIndex((m) => !U(m[h.axis]));
        d.hi += Math.max(0, p);
      }
      return d;
    }
  }
  return {
    lo: 0,
    hi: o.length - 1
  };
}
function Zn(n, t, e, i, s) {
  const o = n.getSortedVisibleDatasetMetas(), a = e[t];
  for (let r = 0, l = o.length; r < l; ++r) {
    const { index: c, data: d } = o[r], { lo: h, hi: f } = qd(o[r], t, a, s);
    for (let u = h; u <= f; ++u) {
      const p = d[u];
      p.skip || i(p, c, u);
    }
  }
}
function Jd(n) {
  const t = n.indexOf("x") !== -1, e = n.indexOf("y") !== -1;
  return function(i, s) {
    const o = t ? Math.abs(i.x - s.x) : 0, a = e ? Math.abs(i.y - s.y) : 0;
    return Math.sqrt(Math.pow(o, 2) + Math.pow(a, 2));
  };
}
function Si(n, t, e, i, s) {
  const o = [];
  return !s && !n.isPointInArea(t) || Zn(n, e, t, function(r, l, c) {
    !s && !Xt(r, n.chartArea, 0) || r.inRange(t.x, t.y, i) && o.push({
      element: r,
      datasetIndex: l,
      index: c
    });
  }, !0), o;
}
function Zd(n, t, e, i) {
  let s = [];
  function o(a, r, l) {
    const { startAngle: c, endAngle: d } = a.getProps([
      "startAngle",
      "endAngle"
    ], i), { angle: h } = da(a, {
      x: t.x,
      y: t.y
    });
    nn(h, c, d) && s.push({
      element: a,
      datasetIndex: r,
      index: l
    });
  }
  return Zn(n, e, t, o), s;
}
function Qd(n, t, e, i, s, o) {
  let a = [];
  const r = Jd(e);
  let l = Number.POSITIVE_INFINITY;
  function c(d, h, f) {
    const u = d.inRange(t.x, t.y, s);
    if (i && !u)
      return;
    const p = d.getCenterPoint(s);
    if (!(!!o || n.isPointInArea(p)) && !u)
      return;
    const x = r(t, p);
    x < l ? (a = [
      {
        element: d,
        datasetIndex: h,
        index: f
      }
    ], l = x) : x === l && a.push({
      element: d,
      datasetIndex: h,
      index: f
    });
  }
  return Zn(n, e, t, c), a;
}
function Ci(n, t, e, i, s, o) {
  return !o && !n.isPointInArea(t) ? [] : e === "r" && !i ? Zd(n, t, e, s) : Qd(n, t, e, i, s, o);
}
function co(n, t, e, i, s) {
  const o = [], a = e === "x" ? "inXRange" : "inYRange";
  let r = !1;
  return Zn(n, e, t, (l, c, d) => {
    l[a] && l[a](t[e], s) && (o.push({
      element: l,
      datasetIndex: c,
      index: d
    }), r = r || l.inRange(t.x, t.y, s));
  }), i && !r ? [] : o;
}
var th = {
  modes: {
    index(n, t, e, i) {
      const s = ue(t, n), o = e.axis || "x", a = e.includeInvisible || !1, r = e.intersect ? Si(n, s, o, i, a) : Ci(n, s, o, !1, i, a), l = [];
      return r.length ? (n.getSortedVisibleDatasetMetas().forEach((c) => {
        const d = r[0].index, h = c.data[d];
        h && !h.skip && l.push({
          element: h,
          datasetIndex: c.index,
          index: d
        });
      }), l) : [];
    },
    dataset(n, t, e, i) {
      const s = ue(t, n), o = e.axis || "xy", a = e.includeInvisible || !1;
      let r = e.intersect ? Si(n, s, o, i, a) : Ci(n, s, o, !1, i, a);
      if (r.length > 0) {
        const l = r[0].datasetIndex, c = n.getDatasetMeta(l).data;
        r = [];
        for (let d = 0; d < c.length; ++d)
          r.push({
            element: c[d],
            datasetIndex: l,
            index: d
          });
      }
      return r;
    },
    point(n, t, e, i) {
      const s = ue(t, n), o = e.axis || "xy", a = e.includeInvisible || !1;
      return Si(n, s, o, i, a);
    },
    nearest(n, t, e, i) {
      const s = ue(t, n), o = e.axis || "xy", a = e.includeInvisible || !1;
      return Ci(n, s, o, e.intersect, i, a);
    },
    x(n, t, e, i) {
      const s = ue(t, n);
      return co(n, s, "x", e.intersect, i);
    },
    y(n, t, e, i) {
      const s = ue(t, n);
      return co(n, s, "y", e.intersect, i);
    }
  }
};
const Pa = [
  "left",
  "top",
  "right",
  "bottom"
];
function Ee(n, t) {
  return n.filter((e) => e.pos === t);
}
function ho(n, t) {
  return n.filter((e) => Pa.indexOf(e.pos) === -1 && e.box.axis === t);
}
function Ve(n, t) {
  return n.sort((e, i) => {
    const s = t ? i : e, o = t ? e : i;
    return s.weight === o.weight ? s.index - o.index : s.weight - o.weight;
  });
}
function eh(n) {
  const t = [];
  let e, i, s, o, a, r;
  for (e = 0, i = (n || []).length; e < i; ++e)
    s = n[e], { position: o, options: { stack: a, stackWeight: r = 1 } } = s, t.push({
      index: e,
      box: s,
      pos: o,
      horizontal: s.isHorizontal(),
      weight: s.weight,
      stack: a && o + a,
      stackWeight: r
    });
  return t;
}
function nh(n) {
  const t = {};
  for (const e of n) {
    const { stack: i, pos: s, stackWeight: o } = e;
    if (!i || !Pa.includes(s))
      continue;
    const a = t[i] || (t[i] = {
      count: 0,
      placed: 0,
      weight: 0,
      size: 0
    });
    a.count++, a.weight += o;
  }
  return t;
}
function ih(n, t) {
  const e = nh(n), { vBoxMaxWidth: i, hBoxMaxHeight: s } = t;
  let o, a, r;
  for (o = 0, a = n.length; o < a; ++o) {
    r = n[o];
    const { fullSize: l } = r.box, c = e[r.stack], d = c && r.stackWeight / c.weight;
    r.horizontal ? (r.width = d ? d * i : l && t.availableWidth, r.height = s) : (r.width = i, r.height = d ? d * s : l && t.availableHeight);
  }
  return e;
}
function sh(n) {
  const t = eh(n), e = Ve(t.filter((c) => c.box.fullSize), !0), i = Ve(Ee(t, "left"), !0), s = Ve(Ee(t, "right")), o = Ve(Ee(t, "top"), !0), a = Ve(Ee(t, "bottom")), r = ho(t, "x"), l = ho(t, "y");
  return {
    fullSize: e,
    leftAndTop: i.concat(o),
    rightAndBottom: s.concat(l).concat(a).concat(r),
    chartArea: Ee(t, "chartArea"),
    vertical: i.concat(s).concat(l),
    horizontal: o.concat(a).concat(r)
  };
}
function fo(n, t, e, i) {
  return Math.max(n[e], t[e]) + Math.max(n[i], t[i]);
}
function Na(n, t) {
  n.top = Math.max(n.top, t.top), n.left = Math.max(n.left, t.left), n.bottom = Math.max(n.bottom, t.bottom), n.right = Math.max(n.right, t.right);
}
function oh(n, t, e, i) {
  const { pos: s, box: o } = e, a = n.maxPadding;
  if (!j(s)) {
    e.size && (n[s] -= e.size);
    const h = i[e.stack] || {
      size: 0,
      count: 1
    };
    h.size = Math.max(h.size, e.horizontal ? o.height : o.width), e.size = h.size / h.count, n[s] += e.size;
  }
  o.getPadding && Na(a, o.getPadding());
  const r = Math.max(0, t.outerWidth - fo(a, n, "left", "right")), l = Math.max(0, t.outerHeight - fo(a, n, "top", "bottom")), c = r !== n.w, d = l !== n.h;
  return n.w = r, n.h = l, e.horizontal ? {
    same: c,
    other: d
  } : {
    same: d,
    other: c
  };
}
function ah(n) {
  const t = n.maxPadding;
  function e(i) {
    const s = Math.max(t[i] - n[i], 0);
    return n[i] += s, s;
  }
  n.y += e("top"), n.x += e("left"), e("right"), e("bottom");
}
function rh(n, t) {
  const e = t.maxPadding;
  function i(s) {
    const o = {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0
    };
    return s.forEach((a) => {
      o[a] = Math.max(t[a], e[a]);
    }), o;
  }
  return i(n ? [
    "left",
    "right"
  ] : [
    "top",
    "bottom"
  ]);
}
function $e(n, t, e, i) {
  const s = [];
  let o, a, r, l, c, d;
  for (o = 0, a = n.length, c = 0; o < a; ++o) {
    r = n[o], l = r.box, l.update(r.width || t.w, r.height || t.h, rh(r.horizontal, t));
    const { same: h, other: f } = oh(t, e, r, i);
    c |= h && s.length, d = d || f, l.fullSize || s.push(r);
  }
  return c && $e(s, t, e, i) || d;
}
function Cn(n, t, e, i, s) {
  n.top = e, n.left = t, n.right = t + i, n.bottom = e + s, n.width = i, n.height = s;
}
function uo(n, t, e, i) {
  const s = e.padding;
  let { x: o, y: a } = t;
  for (const r of n) {
    const l = r.box, c = i[r.stack] || {
      placed: 0,
      weight: 1
    }, d = r.stackWeight / c.weight || 1;
    if (r.horizontal) {
      const h = t.w * d, f = c.size || l.height;
      tn(c.start) && (a = c.start), l.fullSize ? Cn(l, s.left, a, e.outerWidth - s.right - s.left, f) : Cn(l, t.left + c.placed, a, h, f), c.start = a, c.placed += h, a = l.bottom;
    } else {
      const h = t.h * d, f = c.size || l.width;
      tn(c.start) && (o = c.start), l.fullSize ? Cn(l, o, s.top, f, e.outerHeight - s.bottom - s.top) : Cn(l, o, t.top + c.placed, f, h), c.start = o, c.placed += h, o = l.right;
    }
  }
  t.x = o, t.y = a;
}
var Tt = {
  addBox(n, t) {
    n.boxes || (n.boxes = []), t.fullSize = t.fullSize || !1, t.position = t.position || "top", t.weight = t.weight || 0, t._layers = t._layers || function() {
      return [
        {
          z: 0,
          draw(e) {
            t.draw(e);
          }
        }
      ];
    }, n.boxes.push(t);
  },
  removeBox(n, t) {
    const e = n.boxes ? n.boxes.indexOf(t) : -1;
    e !== -1 && n.boxes.splice(e, 1);
  },
  configure(n, t, e) {
    t.fullSize = e.fullSize, t.position = e.position, t.weight = e.weight;
  },
  update(n, t, e, i) {
    if (!n)
      return;
    const s = xt(n.options.layout.padding), o = Math.max(t - s.width, 0), a = Math.max(e - s.height, 0), r = sh(n.boxes), l = r.vertical, c = r.horizontal;
    q(n.boxes, (m) => {
      typeof m.beforeLayout == "function" && m.beforeLayout();
    });
    const d = l.reduce((m, x) => x.box.options && x.box.options.display === !1 ? m : m + 1, 0) || 1, h = Object.freeze({
      outerWidth: t,
      outerHeight: e,
      padding: s,
      availableWidth: o,
      availableHeight: a,
      vBoxMaxWidth: o / 2 / d,
      hBoxMaxHeight: a / 2
    }), f = Object.assign({}, s);
    Na(f, xt(i));
    const u = Object.assign({
      maxPadding: f,
      w: o,
      h: a,
      x: s.left,
      y: s.top
    }, s), p = ih(l.concat(c), h);
    $e(r.fullSize, u, h, p), $e(l, u, h, p), $e(c, u, h, p) && $e(l, u, h, p), ah(u), uo(r.leftAndTop, u, h, p), u.x += u.w, u.y += u.h, uo(r.rightAndBottom, u, h, p), n.chartArea = {
      left: u.left,
      top: u.top,
      right: u.left + u.w,
      bottom: u.top + u.h,
      height: u.h,
      width: u.w
    }, q(r.chartArea, (m) => {
      const x = m.box;
      Object.assign(x, n.chartArea), x.update(u.w, u.h, {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      });
    });
  }
};
class Da {
  acquireContext(t, e) {
  }
  releaseContext(t) {
    return !1;
  }
  addEventListener(t, e, i) {
  }
  removeEventListener(t, e, i) {
  }
  getDevicePixelRatio() {
    return 1;
  }
  getMaximumSize(t, e, i, s) {
    return e = Math.max(0, e || t.width), i = i || t.height, {
      width: e,
      height: Math.max(0, s ? Math.floor(e / s) : i)
    };
  }
  isAttached(t) {
    return !0;
  }
  updateConfig(t) {
  }
}
class lh extends Da {
  acquireContext(t) {
    return t && t.getContext && t.getContext("2d") || null;
  }
  updateConfig(t) {
    t.options.animation = !1;
  }
}
const zn = "$chartjs", ch = {
  touchstart: "mousedown",
  touchmove: "mousemove",
  touchend: "mouseup",
  pointerenter: "mouseenter",
  pointerdown: "mousedown",
  pointermove: "mousemove",
  pointerup: "mouseup",
  pointerleave: "mouseout",
  pointerout: "mouseout"
}, go = (n) => n === null || n === "";
function dh(n, t) {
  const e = n.style, i = n.getAttribute("height"), s = n.getAttribute("width");
  if (n[zn] = {
    initial: {
      height: i,
      width: s,
      style: {
        display: e.display,
        height: e.height,
        width: e.width
      }
    }
  }, e.display = e.display || "block", e.boxSizing = e.boxSizing || "border-box", go(s)) {
    const o = qs(n, "width");
    o !== void 0 && (n.width = o);
  }
  if (go(i))
    if (n.style.height === "")
      n.height = n.width / (t || 2);
    else {
      const o = qs(n, "height");
      o !== void 0 && (n.height = o);
    }
  return n;
}
const Oa = fd ? {
  passive: !0
} : !1;
function hh(n, t, e) {
  n && n.addEventListener(t, e, Oa);
}
function fh(n, t, e) {
  n && n.canvas && n.canvas.removeEventListener(t, e, Oa);
}
function uh(n, t) {
  const e = ch[n.type] || n.type, { x: i, y: s } = ue(n, t);
  return {
    type: e,
    chart: t,
    native: n,
    x: i !== void 0 ? i : null,
    y: s !== void 0 ? s : null
  };
}
function Yn(n, t) {
  for (const e of n)
    if (e === t || e.contains(t))
      return !0;
}
function gh(n, t, e) {
  const i = n.canvas, s = new MutationObserver((o) => {
    let a = !1;
    for (const r of o)
      a = a || Yn(r.addedNodes, i), a = a && !Yn(r.removedNodes, i);
    a && e();
  });
  return s.observe(document, {
    childList: !0,
    subtree: !0
  }), s;
}
function ph(n, t, e) {
  const i = n.canvas, s = new MutationObserver((o) => {
    let a = !1;
    for (const r of o)
      a = a || Yn(r.removedNodes, i), a = a && !Yn(r.addedNodes, i);
    a && e();
  });
  return s.observe(document, {
    childList: !0,
    subtree: !0
  }), s;
}
const on = /* @__PURE__ */ new Map();
let po = 0;
function za() {
  const n = window.devicePixelRatio;
  n !== po && (po = n, on.forEach((t, e) => {
    e.currentDevicePixelRatio !== n && t();
  }));
}
function mh(n, t) {
  on.size || window.addEventListener("resize", za), on.set(n, t);
}
function bh(n) {
  on.delete(n), on.size || window.removeEventListener("resize", za);
}
function xh(n, t, e) {
  const i = n.canvas, s = i && rs(i);
  if (!s)
    return;
  const o = ga((r, l) => {
    const c = s.clientWidth;
    e(r, l), c < s.clientWidth && e();
  }, window), a = new ResizeObserver((r) => {
    const l = r[0], c = l.contentRect.width, d = l.contentRect.height;
    c === 0 && d === 0 || o(c, d);
  });
  return a.observe(s), mh(n, o), a;
}
function ki(n, t, e) {
  e && e.disconnect(), t === "resize" && bh(n);
}
function yh(n, t, e) {
  const i = n.canvas, s = ga((o) => {
    n.ctx !== null && e(uh(o, n));
  }, n);
  return hh(i, t, s), s;
}
class vh extends Da {
  acquireContext(t, e) {
    const i = t && t.getContext && t.getContext("2d");
    return i && i.canvas === t ? (dh(t, e), i) : null;
  }
  releaseContext(t) {
    const e = t.canvas;
    if (!e[zn])
      return !1;
    const i = e[zn].initial;
    [
      "height",
      "width"
    ].forEach((o) => {
      const a = i[o];
      U(a) ? e.removeAttribute(o) : e.setAttribute(o, a);
    });
    const s = i.style || {};
    return Object.keys(s).forEach((o) => {
      e.style[o] = s[o];
    }), e.width = e.width, delete e[zn], !0;
  }
  addEventListener(t, e, i) {
    this.removeEventListener(t, e);
    const s = t.$proxies || (t.$proxies = {}), a = {
      attach: gh,
      detach: ph,
      resize: xh
    }[e] || yh;
    s[e] = a(t, e, i);
  }
  removeEventListener(t, e) {
    const i = t.$proxies || (t.$proxies = {}), s = i[e];
    if (!s)
      return;
    ({
      attach: ki,
      detach: ki,
      resize: ki
    }[e] || fh)(t, e, s), i[e] = void 0;
  }
  getDevicePixelRatio() {
    return window.devicePixelRatio;
  }
  getMaximumSize(t, e, i, s) {
    return hd(t, e, i, s);
  }
  isAttached(t) {
    const e = t && rs(t);
    return !!(e && e.isConnected);
  }
}
function _h(n) {
  return !as() || typeof OffscreenCanvas < "u" && n instanceof OffscreenCanvas ? lh : vh;
}
class Ft {
  constructor() {
    P(this, "x");
    P(this, "y");
    P(this, "active", !1);
    P(this, "options");
    P(this, "$animations");
  }
  tooltipPosition(t) {
    const { x: e, y: i } = this.getProps([
      "x",
      "y"
    ], t);
    return {
      x: e,
      y: i
    };
  }
  hasValue() {
    return en(this.x) && en(this.y);
  }
  getProps(t, e) {
    const i = this.$animations;
    if (!e || !i)
      return this;
    const s = {};
    return t.forEach((o) => {
      s[o] = i[o] && i[o].active() ? i[o]._to : this[o];
    }), s;
  }
}
P(Ft, "defaults", {}), P(Ft, "defaultRoutes");
function wh(n, t) {
  const e = n.options.ticks, i = Sh(n), s = Math.min(e.maxTicksLimit || i, i), o = e.major.enabled ? kh(t) : [], a = o.length, r = o[0], l = o[a - 1], c = [];
  if (a > s)
    return Mh(t, c, o, a / s), c;
  const d = Ch(o, t, s);
  if (a > 0) {
    let h, f;
    const u = a > 1 ? Math.round((l - r) / (a - 1)) : null;
    for (kn(t, c, d, U(u) ? 0 : r - u, r), h = 0, f = a - 1; h < f; h++)
      kn(t, c, d, o[h], o[h + 1]);
    return kn(t, c, d, l, U(u) ? t.length : l + u), c;
  }
  return kn(t, c, d), c;
}
function Sh(n) {
  const t = n.options.offset, e = n._tickSize(), i = n._length / e + (t ? 0 : 1), s = n._maxLength / e;
  return Math.floor(Math.min(i, s));
}
function Ch(n, t, e) {
  const i = Th(n), s = t.length / e;
  if (!i)
    return Math.max(s, 1);
  const o = cc(i);
  for (let a = 0, r = o.length - 1; a < r; a++) {
    const l = o[a];
    if (l > s)
      return l;
  }
  return Math.max(s, 1);
}
function kh(n) {
  const t = [];
  let e, i;
  for (e = 0, i = n.length; e < i; e++)
    n[e].major && t.push(e);
  return t;
}
function Mh(n, t, e, i) {
  let s = 0, o = e[0], a;
  for (i = Math.ceil(i), a = 0; a < n.length; a++)
    a === o && (t.push(n[a]), s++, o = e[s * i]);
}
function kn(n, t, e, i, s) {
  const o = V(i, 0), a = Math.min(V(s, n.length), n.length);
  let r = 0, l, c, d;
  for (e = Math.ceil(e), s && (l = s - i, e = l / Math.floor(l / e)), d = o; d < 0; )
    r++, d = Math.round(o + r * e);
  for (c = Math.max(o, 0); c < a; c++)
    c === d && (t.push(n[c]), r++, d = Math.round(o + r * e));
}
function Th(n) {
  const t = n.length;
  let e, i;
  if (t < 2)
    return !1;
  for (i = n[0], e = 1; e < t; ++e)
    if (n[e] - n[e - 1] !== i)
      return !1;
  return i;
}
const Bh = (n) => n === "left" ? "right" : n === "right" ? "left" : n, mo = (n, t, e) => t === "top" || t === "left" ? n[t] + e : n[t] - e, bo = (n, t) => Math.min(t || n, n);
function xo(n, t) {
  const e = [], i = n.length / t, s = n.length;
  let o = 0;
  for (; o < s; o += i)
    e.push(n[Math.floor(o)]);
  return e;
}
function Ah(n, t, e) {
  const i = n.ticks.length, s = Math.min(t, i - 1), o = n._startPixel, a = n._endPixel, r = 1e-6;
  let l = n.getPixelForTick(s), c;
  if (!(e && (i === 1 ? c = Math.max(l - o, a - l) : t === 0 ? c = (n.getPixelForTick(1) - l) / 2 : c = (l - n.getPixelForTick(s - 1)) / 2, l += s < t ? c : -c, l < o - r || l > a + r)))
    return l;
}
function Fh(n, t) {
  q(n, (e) => {
    const i = e.gc, s = i.length / 2;
    let o;
    if (s > t) {
      for (o = 0; o < s; ++o)
        delete e.data[i[o]];
      i.splice(0, s);
    }
  });
}
function We(n) {
  return n.drawTicks ? n.tickLength : 0;
}
function yo(n, t) {
  if (!n.display)
    return 0;
  const e = ht(n.font, t), i = xt(n.padding);
  return (nt(n.text) ? n.text.length : 1) * e.lineHeight + i.height;
}
function Ph(n, t) {
  return re(n, {
    scale: t,
    type: "scale"
  });
}
function Nh(n, t, e) {
  return re(n, {
    tick: e,
    index: t,
    type: "tick"
  });
}
function Dh(n, t, e) {
  let i = Zi(n);
  return (e && t !== "right" || !e && t === "right") && (i = Bh(i)), i;
}
function Oh(n, t, e, i) {
  const { top: s, left: o, bottom: a, right: r, chart: l } = n, { chartArea: c, scales: d } = l;
  let h = 0, f, u, p;
  const m = a - s, x = r - o;
  if (n.isHorizontal()) {
    if (u = pt(i, o, r), j(e)) {
      const v = Object.keys(e)[0], w = e[v];
      p = d[v].getPixelForValue(w) + m - t;
    } else e === "center" ? p = (c.bottom + c.top) / 2 + m - t : p = mo(n, e, t);
    f = r - o;
  } else {
    if (j(e)) {
      const v = Object.keys(e)[0], w = e[v];
      u = d[v].getPixelForValue(w) - x + t;
    } else e === "center" ? u = (c.left + c.right) / 2 - x + t : u = mo(n, e, t);
    p = pt(i, a, s), h = e === "left" ? -rt : rt;
  }
  return {
    titleX: u,
    titleY: p,
    maxWidth: f,
    rotation: h
  };
}
class Ne extends Ft {
  constructor(t) {
    super(), this.id = t.id, this.type = t.type, this.options = void 0, this.ctx = t.ctx, this.chart = t.chart, this.top = void 0, this.bottom = void 0, this.left = void 0, this.right = void 0, this.width = void 0, this.height = void 0, this._margins = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }, this.maxWidth = void 0, this.maxHeight = void 0, this.paddingTop = void 0, this.paddingBottom = void 0, this.paddingLeft = void 0, this.paddingRight = void 0, this.axis = void 0, this.labelRotation = void 0, this.min = void 0, this.max = void 0, this._range = void 0, this.ticks = [], this._gridLineItems = null, this._labelItems = null, this._labelSizes = null, this._length = 0, this._maxLength = 0, this._longestTextCache = {}, this._startPixel = void 0, this._endPixel = void 0, this._reversePixels = !1, this._userMax = void 0, this._userMin = void 0, this._suggestedMax = void 0, this._suggestedMin = void 0, this._ticksLength = 0, this._borderValue = 0, this._cache = {}, this._dataLimitsCached = !1, this.$context = void 0;
  }
  init(t) {
    this.options = t.setContext(this.getContext()), this.axis = t.axis, this._userMin = this.parse(t.min), this._userMax = this.parse(t.max), this._suggestedMin = this.parse(t.suggestedMin), this._suggestedMax = this.parse(t.suggestedMax);
  }
  parse(t, e) {
    return t;
  }
  getUserBounds() {
    let { _userMin: t, _userMax: e, _suggestedMin: i, _suggestedMax: s } = this;
    return t = Ot(t, Number.POSITIVE_INFINITY), e = Ot(e, Number.NEGATIVE_INFINITY), i = Ot(i, Number.POSITIVE_INFINITY), s = Ot(s, Number.NEGATIVE_INFINITY), {
      min: Ot(t, i),
      max: Ot(e, s),
      minDefined: gt(t),
      maxDefined: gt(e)
    };
  }
  getMinMax(t) {
    let { min: e, max: i, minDefined: s, maxDefined: o } = this.getUserBounds(), a;
    if (s && o)
      return {
        min: e,
        max: i
      };
    const r = this.getMatchingVisibleMetas();
    for (let l = 0, c = r.length; l < c; ++l)
      a = r[l].controller.getMinMax(this, t), s || (e = Math.min(e, a.min)), o || (i = Math.max(i, a.max));
    return e = o && e > i ? i : e, i = s && e > i ? e : i, {
      min: Ot(e, Ot(i, e)),
      max: Ot(i, Ot(e, i))
    };
  }
  getPadding() {
    return {
      left: this.paddingLeft || 0,
      top: this.paddingTop || 0,
      right: this.paddingRight || 0,
      bottom: this.paddingBottom || 0
    };
  }
  getTicks() {
    return this.ticks;
  }
  getLabels() {
    const t = this.chart.data;
    return this.options.labels || (this.isHorizontal() ? t.xLabels : t.yLabels) || t.labels || [];
  }
  getLabelItems(t = this.chart.chartArea) {
    return this._labelItems || (this._labelItems = this._computeLabelItems(t));
  }
  beforeLayout() {
    this._cache = {}, this._dataLimitsCached = !1;
  }
  beforeUpdate() {
    Q(this.options.beforeUpdate, [
      this
    ]);
  }
  update(t, e, i) {
    const { beginAtZero: s, grace: o, ticks: a } = this.options, r = a.sampleSize;
    this.beforeUpdate(), this.maxWidth = t, this.maxHeight = e, this._margins = i = Object.assign({
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }, i), this.ticks = null, this._labelSizes = null, this._gridLineItems = null, this._labelItems = null, this.beforeSetDimensions(), this.setDimensions(), this.afterSetDimensions(), this._maxLength = this.isHorizontal() ? this.width + i.left + i.right : this.height + i.top + i.bottom, this._dataLimitsCached || (this.beforeDataLimits(), this.determineDataLimits(), this.afterDataLimits(), this._range = Hc(this, o, s), this._dataLimitsCached = !0), this.beforeBuildTicks(), this.ticks = this.buildTicks() || [], this.afterBuildTicks();
    const l = r < this.ticks.length;
    this._convertTicksToLabels(l ? xo(this.ticks, r) : this.ticks), this.configure(), this.beforeCalculateLabelRotation(), this.calculateLabelRotation(), this.afterCalculateLabelRotation(), a.display && (a.autoSkip || a.source === "auto") && (this.ticks = wh(this, this.ticks), this._labelSizes = null, this.afterAutoSkip()), l && this._convertTicksToLabels(this.ticks), this.beforeFit(), this.fit(), this.afterFit(), this.afterUpdate();
  }
  configure() {
    let t = this.options.reverse, e, i;
    this.isHorizontal() ? (e = this.left, i = this.right) : (e = this.top, i = this.bottom, t = !t), this._startPixel = e, this._endPixel = i, this._reversePixels = t, this._length = i - e, this._alignToPixels = this.options.alignToPixels;
  }
  afterUpdate() {
    Q(this.options.afterUpdate, [
      this
    ]);
  }
  beforeSetDimensions() {
    Q(this.options.beforeSetDimensions, [
      this
    ]);
  }
  setDimensions() {
    this.isHorizontal() ? (this.width = this.maxWidth, this.left = 0, this.right = this.width) : (this.height = this.maxHeight, this.top = 0, this.bottom = this.height), this.paddingLeft = 0, this.paddingTop = 0, this.paddingRight = 0, this.paddingBottom = 0;
  }
  afterSetDimensions() {
    Q(this.options.afterSetDimensions, [
      this
    ]);
  }
  _callHooks(t) {
    this.chart.notifyPlugins(t, this.getContext()), Q(this.options[t], [
      this
    ]);
  }
  beforeDataLimits() {
    this._callHooks("beforeDataLimits");
  }
  determineDataLimits() {
  }
  afterDataLimits() {
    this._callHooks("afterDataLimits");
  }
  beforeBuildTicks() {
    this._callHooks("beforeBuildTicks");
  }
  buildTicks() {
    return [];
  }
  afterBuildTicks() {
    this._callHooks("afterBuildTicks");
  }
  beforeTickToLabelConversion() {
    Q(this.options.beforeTickToLabelConversion, [
      this
    ]);
  }
  generateTickLabels(t) {
    const e = this.options.ticks;
    let i, s, o;
    for (i = 0, s = t.length; i < s; i++)
      o = t[i], o.label = Q(e.callback, [
        o.value,
        i,
        t
      ], this);
  }
  afterTickToLabelConversion() {
    Q(this.options.afterTickToLabelConversion, [
      this
    ]);
  }
  beforeCalculateLabelRotation() {
    Q(this.options.beforeCalculateLabelRotation, [
      this
    ]);
  }
  calculateLabelRotation() {
    const t = this.options, e = t.ticks, i = bo(this.ticks.length, t.ticks.maxTicksLimit), s = e.minRotation || 0, o = e.maxRotation;
    let a = s, r, l, c;
    if (!this._isVisible() || !e.display || s >= o || i <= 1 || !this.isHorizontal()) {
      this.labelRotation = s;
      return;
    }
    const d = this._getLabelSizes(), h = d.widest.width, f = d.highest.height, u = bt(this.chart.width - h, 0, this.maxWidth);
    r = t.offset ? this.maxWidth / i : u / (i - 1), h + 6 > r && (r = u / (i - (t.offset ? 0.5 : 1)), l = this.maxHeight - We(t.grid) - e.padding - yo(t.title, this.chart.options.font), c = Math.sqrt(h * h + f * f), a = qi(Math.min(Math.asin(bt((d.highest.height + 6) / r, -1, 1)), Math.asin(bt(l / c, -1, 1)) - Math.asin(bt(f / c, -1, 1)))), a = Math.max(s, Math.min(o, a))), this.labelRotation = a;
  }
  afterCalculateLabelRotation() {
    Q(this.options.afterCalculateLabelRotation, [
      this
    ]);
  }
  afterAutoSkip() {
  }
  beforeFit() {
    Q(this.options.beforeFit, [
      this
    ]);
  }
  fit() {
    const t = {
      width: 0,
      height: 0
    }, { chart: e, options: { ticks: i, title: s, grid: o } } = this, a = this._isVisible(), r = this.isHorizontal();
    if (a) {
      const l = yo(s, e.options.font);
      if (r ? (t.width = this.maxWidth, t.height = We(o) + l) : (t.height = this.maxHeight, t.width = We(o) + l), i.display && this.ticks.length) {
        const { first: c, last: d, widest: h, highest: f } = this._getLabelSizes(), u = i.padding * 2, p = Lt(this.labelRotation), m = Math.cos(p), x = Math.sin(p);
        if (r) {
          const v = i.mirror ? 0 : x * h.width + m * f.height;
          t.height = Math.min(this.maxHeight, t.height + v + u);
        } else {
          const v = i.mirror ? 0 : m * h.width + x * f.height;
          t.width = Math.min(this.maxWidth, t.width + v + u);
        }
        this._calculatePadding(c, d, x, m);
      }
    }
    this._handleMargins(), r ? (this.width = this._length = e.width - this._margins.left - this._margins.right, this.height = t.height) : (this.width = t.width, this.height = this._length = e.height - this._margins.top - this._margins.bottom);
  }
  _calculatePadding(t, e, i, s) {
    const { ticks: { align: o, padding: a }, position: r } = this.options, l = this.labelRotation !== 0, c = r !== "top" && this.axis === "x";
    if (this.isHorizontal()) {
      const d = this.getPixelForTick(0) - this.left, h = this.right - this.getPixelForTick(this.ticks.length - 1);
      let f = 0, u = 0;
      l ? c ? (f = s * t.width, u = i * e.height) : (f = i * t.height, u = s * e.width) : o === "start" ? u = e.width : o === "end" ? f = t.width : o !== "inner" && (f = t.width / 2, u = e.width / 2), this.paddingLeft = Math.max((f - d + a) * this.width / (this.width - d), 0), this.paddingRight = Math.max((u - h + a) * this.width / (this.width - h), 0);
    } else {
      let d = e.height / 2, h = t.height / 2;
      o === "start" ? (d = 0, h = t.height) : o === "end" && (d = e.height, h = 0), this.paddingTop = d + a, this.paddingBottom = h + a;
    }
  }
  _handleMargins() {
    this._margins && (this._margins.left = Math.max(this.paddingLeft, this._margins.left), this._margins.top = Math.max(this.paddingTop, this._margins.top), this._margins.right = Math.max(this.paddingRight, this._margins.right), this._margins.bottom = Math.max(this.paddingBottom, this._margins.bottom));
  }
  afterFit() {
    Q(this.options.afterFit, [
      this
    ]);
  }
  isHorizontal() {
    const { axis: t, position: e } = this.options;
    return e === "top" || e === "bottom" || t === "x";
  }
  isFullSize() {
    return this.options.fullSize;
  }
  _convertTicksToLabels(t) {
    this.beforeTickToLabelConversion(), this.generateTickLabels(t);
    let e, i;
    for (e = 0, i = t.length; e < i; e++)
      U(t[e].label) && (t.splice(e, 1), i--, e--);
    this.afterTickToLabelConversion();
  }
  _getLabelSizes() {
    let t = this._labelSizes;
    if (!t) {
      const e = this.options.ticks.sampleSize;
      let i = this.ticks;
      e < i.length && (i = xo(i, e)), this._labelSizes = t = this._computeLabelSizes(i, i.length, this.options.ticks.maxTicksLimit);
    }
    return t;
  }
  _computeLabelSizes(t, e, i) {
    const { ctx: s, _longestTextCache: o } = this, a = [], r = [], l = Math.floor(e / bo(e, i));
    let c = 0, d = 0, h, f, u, p, m, x, v, w, k, M, C;
    for (h = 0; h < e; h += l) {
      if (p = t[h].label, m = this._resolveTickFontOptions(h), s.font = x = m.string, v = o[x] = o[x] || {
        data: {},
        gc: []
      }, w = m.lineHeight, k = M = 0, !U(p) && !nt(p))
        k = jn(s, v.data, v.gc, k, p), M = w;
      else if (nt(p))
        for (f = 0, u = p.length; f < u; ++f)
          C = p[f], !U(C) && !nt(C) && (k = jn(s, v.data, v.gc, k, C), M += w);
      a.push(k), r.push(M), c = Math.max(k, c), d = Math.max(M, d);
    }
    Fh(o, e);
    const b = a.indexOf(c), T = r.indexOf(d), B = (A) => ({
      width: a[A] || 0,
      height: r[A] || 0
    });
    return {
      first: B(0),
      last: B(e - 1),
      widest: B(b),
      highest: B(T),
      widths: a,
      heights: r
    };
  }
  getLabelForValue(t) {
    return t;
  }
  getPixelForValue(t, e) {
    return NaN;
  }
  getValueForPixel(t) {
  }
  getPixelForTick(t) {
    const e = this.ticks;
    return t < 0 || t > e.length - 1 ? null : this.getPixelForValue(e[t].value);
  }
  getPixelForDecimal(t) {
    this._reversePixels && (t = 1 - t);
    const e = this._startPixel + t * this._length;
    return gc(this._alignToPixels ? he(this.chart, e, 0) : e);
  }
  getDecimalForPixel(t) {
    const e = (t - this._startPixel) / this._length;
    return this._reversePixels ? 1 - e : e;
  }
  getBasePixel() {
    return this.getPixelForValue(this.getBaseValue());
  }
  getBaseValue() {
    const { min: t, max: e } = this;
    return t < 0 && e < 0 ? e : t > 0 && e > 0 ? t : 0;
  }
  getContext(t) {
    const e = this.ticks || [];
    if (t >= 0 && t < e.length) {
      const i = e[t];
      return i.$context || (i.$context = Nh(this.getContext(), t, i));
    }
    return this.$context || (this.$context = Ph(this.chart.getContext(), this));
  }
  _tickSize() {
    const t = this.options.ticks, e = Lt(this.labelRotation), i = Math.abs(Math.cos(e)), s = Math.abs(Math.sin(e)), o = this._getLabelSizes(), a = t.autoSkipPadding || 0, r = o ? o.widest.width + a : 0, l = o ? o.highest.height + a : 0;
    return this.isHorizontal() ? l * i > r * s ? r / i : l / s : l * s < r * i ? l / i : r / s;
  }
  _isVisible() {
    const t = this.options.display;
    return t !== "auto" ? !!t : this.getMatchingVisibleMetas().length > 0;
  }
  _computeGridLineItems(t) {
    const e = this.axis, i = this.chart, s = this.options, { grid: o, position: a, border: r } = s, l = o.offset, c = this.isHorizontal(), h = this.ticks.length + (l ? 1 : 0), f = We(o), u = [], p = r.setContext(this.getContext()), m = p.display ? p.width : 0, x = m / 2, v = function(G) {
      return he(i, G, m);
    };
    let w, k, M, C, b, T, B, A, D, N, L, J;
    if (a === "top")
      w = v(this.bottom), T = this.bottom - f, A = w - x, N = v(t.top) + x, J = t.bottom;
    else if (a === "bottom")
      w = v(this.top), N = t.top, J = v(t.bottom) - x, T = w + x, A = this.top + f;
    else if (a === "left")
      w = v(this.right), b = this.right - f, B = w - x, D = v(t.left) + x, L = t.right;
    else if (a === "right")
      w = v(this.left), D = t.left, L = v(t.right) - x, b = w + x, B = this.left + f;
    else if (e === "x") {
      if (a === "center")
        w = v((t.top + t.bottom) / 2 + 0.5);
      else if (j(a)) {
        const G = Object.keys(a)[0], it = a[G];
        w = v(this.chart.scales[G].getPixelForValue(it));
      }
      N = t.top, J = t.bottom, T = w + x, A = T + f;
    } else if (e === "y") {
      if (a === "center")
        w = v((t.left + t.right) / 2);
      else if (j(a)) {
        const G = Object.keys(a)[0], it = a[G];
        w = v(this.chart.scales[G].getPixelForValue(it));
      }
      b = w - x, B = b - f, D = t.left, L = t.right;
    }
    const st = V(s.ticks.maxTicksLimit, h), $ = Math.max(1, Math.ceil(h / st));
    for (k = 0; k < h; k += $) {
      const G = this.getContext(k), it = o.setContext(G), yt = r.setContext(G), dt = it.lineWidth, Pt = it.color, Kt = yt.dash || [], Et = yt.dashOffset, le = it.tickWidth, Nt = it.tickColor, qt = it.tickBorderDash || [], kt = it.tickBorderDashOffset;
      M = Ah(this, k, l), M !== void 0 && (C = he(i, M, dt), c ? b = B = D = L = C : T = A = N = J = C, u.push({
        tx1: b,
        ty1: T,
        tx2: B,
        ty2: A,
        x1: D,
        y1: N,
        x2: L,
        y2: J,
        width: dt,
        color: Pt,
        borderDash: Kt,
        borderDashOffset: Et,
        tickWidth: le,
        tickColor: Nt,
        tickBorderDash: qt,
        tickBorderDashOffset: kt
      }));
    }
    return this._ticksLength = h, this._borderValue = w, u;
  }
  _computeLabelItems(t) {
    const e = this.axis, i = this.options, { position: s, ticks: o } = i, a = this.isHorizontal(), r = this.ticks, { align: l, crossAlign: c, padding: d, mirror: h } = o, f = We(i.grid), u = f + d, p = h ? -d : u, m = -Lt(this.labelRotation), x = [];
    let v, w, k, M, C, b, T, B, A, D, N, L, J = "middle";
    if (s === "top")
      b = this.bottom - p, T = this._getXAxisLabelAlignment();
    else if (s === "bottom")
      b = this.top + p, T = this._getXAxisLabelAlignment();
    else if (s === "left") {
      const $ = this._getYAxisLabelAlignment(f);
      T = $.textAlign, C = $.x;
    } else if (s === "right") {
      const $ = this._getYAxisLabelAlignment(f);
      T = $.textAlign, C = $.x;
    } else if (e === "x") {
      if (s === "center")
        b = (t.top + t.bottom) / 2 + u;
      else if (j(s)) {
        const $ = Object.keys(s)[0], G = s[$];
        b = this.chart.scales[$].getPixelForValue(G) + u;
      }
      T = this._getXAxisLabelAlignment();
    } else if (e === "y") {
      if (s === "center")
        C = (t.left + t.right) / 2 - u;
      else if (j(s)) {
        const $ = Object.keys(s)[0], G = s[$];
        C = this.chart.scales[$].getPixelForValue(G);
      }
      T = this._getYAxisLabelAlignment(f).textAlign;
    }
    e === "y" && (l === "start" ? J = "top" : l === "end" && (J = "bottom"));
    const st = this._getLabelSizes();
    for (v = 0, w = r.length; v < w; ++v) {
      k = r[v], M = k.label;
      const $ = o.setContext(this.getContext(v));
      B = this.getPixelForTick(v) + o.labelOffset, A = this._resolveTickFontOptions(v), D = A.lineHeight, N = nt(M) ? M.length : 1;
      const G = N / 2, it = $.color, yt = $.textStrokeColor, dt = $.textStrokeWidth;
      let Pt = T;
      a ? (C = B, T === "inner" && (v === w - 1 ? Pt = this.options.reverse ? "left" : "right" : v === 0 ? Pt = this.options.reverse ? "right" : "left" : Pt = "center"), s === "top" ? c === "near" || m !== 0 ? L = -N * D + D / 2 : c === "center" ? L = -st.highest.height / 2 - G * D + D : L = -st.highest.height + D / 2 : c === "near" || m !== 0 ? L = D / 2 : c === "center" ? L = st.highest.height / 2 - G * D : L = st.highest.height - N * D, h && (L *= -1), m !== 0 && !$.showLabelBackdrop && (C += D / 2 * Math.sin(m))) : (b = B, L = (1 - N) * D / 2);
      let Kt;
      if ($.showLabelBackdrop) {
        const Et = xt($.backdropPadding), le = st.heights[v], Nt = st.widths[v];
        let qt = L - Et.top, kt = 0 - Et.left;
        switch (J) {
          case "middle":
            qt -= le / 2;
            break;
          case "bottom":
            qt -= le;
            break;
        }
        switch (T) {
          case "center":
            kt -= Nt / 2;
            break;
          case "right":
            kt -= Nt;
            break;
          case "inner":
            v === w - 1 ? kt -= Nt : v > 0 && (kt -= Nt / 2);
            break;
        }
        Kt = {
          left: kt,
          top: qt,
          width: Nt + Et.width,
          height: le + Et.height,
          color: $.backdropColor
        };
      }
      x.push({
        label: M,
        font: A,
        textOffset: L,
        options: {
          rotation: m,
          color: it,
          strokeColor: yt,
          strokeWidth: dt,
          textAlign: Pt,
          textBaseline: J,
          translation: [
            C,
            b
          ],
          backdrop: Kt
        }
      });
    }
    return x;
  }
  _getXAxisLabelAlignment() {
    const { position: t, ticks: e } = this.options;
    if (-Lt(this.labelRotation))
      return t === "top" ? "left" : "right";
    let s = "center";
    return e.align === "start" ? s = "left" : e.align === "end" ? s = "right" : e.align === "inner" && (s = "inner"), s;
  }
  _getYAxisLabelAlignment(t) {
    const { position: e, ticks: { crossAlign: i, mirror: s, padding: o } } = this.options, a = this._getLabelSizes(), r = t + o, l = a.widest.width;
    let c, d;
    return e === "left" ? s ? (d = this.right + o, i === "near" ? c = "left" : i === "center" ? (c = "center", d += l / 2) : (c = "right", d += l)) : (d = this.right - r, i === "near" ? c = "right" : i === "center" ? (c = "center", d -= l / 2) : (c = "left", d = this.left)) : e === "right" ? s ? (d = this.left + o, i === "near" ? c = "right" : i === "center" ? (c = "center", d -= l / 2) : (c = "left", d -= l)) : (d = this.left + r, i === "near" ? c = "left" : i === "center" ? (c = "center", d += l / 2) : (c = "right", d = this.right)) : c = "right", {
      textAlign: c,
      x: d
    };
  }
  _computeLabelArea() {
    if (this.options.ticks.mirror)
      return;
    const t = this.chart, e = this.options.position;
    if (e === "left" || e === "right")
      return {
        top: 0,
        left: this.left,
        bottom: t.height,
        right: this.right
      };
    if (e === "top" || e === "bottom")
      return {
        top: this.top,
        left: 0,
        bottom: this.bottom,
        right: t.width
      };
  }
  drawBackground() {
    const { ctx: t, options: { backgroundColor: e }, left: i, top: s, width: o, height: a } = this;
    e && (t.save(), t.fillStyle = e, t.fillRect(i, s, o, a), t.restore());
  }
  getLineWidthForValue(t) {
    const e = this.options.grid;
    if (!this._isVisible() || !e.display)
      return 0;
    const s = this.ticks.findIndex((o) => o.value === t);
    return s >= 0 ? e.setContext(this.getContext(s)).lineWidth : 0;
  }
  drawGrid(t) {
    const e = this.options.grid, i = this.ctx, s = this._gridLineItems || (this._gridLineItems = this._computeGridLineItems(t));
    let o, a;
    const r = (l, c, d) => {
      !d.width || !d.color || (i.save(), i.lineWidth = d.width, i.strokeStyle = d.color, i.setLineDash(d.borderDash || []), i.lineDashOffset = d.borderDashOffset, i.beginPath(), i.moveTo(l.x, l.y), i.lineTo(c.x, c.y), i.stroke(), i.restore());
    };
    if (e.display)
      for (o = 0, a = s.length; o < a; ++o) {
        const l = s[o];
        e.drawOnChartArea && r({
          x: l.x1,
          y: l.y1
        }, {
          x: l.x2,
          y: l.y2
        }, l), e.drawTicks && r({
          x: l.tx1,
          y: l.ty1
        }, {
          x: l.tx2,
          y: l.ty2
        }, {
          color: l.tickColor,
          width: l.tickWidth,
          borderDash: l.tickBorderDash,
          borderDashOffset: l.tickBorderDashOffset
        });
      }
  }
  drawBorder() {
    const { chart: t, ctx: e, options: { border: i, grid: s } } = this, o = i.setContext(this.getContext()), a = i.display ? o.width : 0;
    if (!a)
      return;
    const r = s.setContext(this.getContext(0)).lineWidth, l = this._borderValue;
    let c, d, h, f;
    this.isHorizontal() ? (c = he(t, this.left, a) - a / 2, d = he(t, this.right, r) + r / 2, h = f = l) : (h = he(t, this.top, a) - a / 2, f = he(t, this.bottom, r) + r / 2, c = d = l), e.save(), e.lineWidth = o.width, e.strokeStyle = o.color, e.beginPath(), e.moveTo(c, h), e.lineTo(d, f), e.stroke(), e.restore();
  }
  drawLabels(t) {
    if (!this.options.ticks.display)
      return;
    const i = this.ctx, s = this._computeLabelArea();
    s && Kn(i, s);
    const o = this.getLabelItems(t);
    for (const a of o) {
      const r = a.options, l = a.font, c = a.label, d = a.textOffset;
      ye(i, c, 0, d, l, r);
    }
    s && qn(i);
  }
  drawTitle() {
    const { ctx: t, options: { position: e, title: i, reverse: s } } = this;
    if (!i.display)
      return;
    const o = ht(i.font), a = xt(i.padding), r = i.align;
    let l = o.lineHeight / 2;
    e === "bottom" || e === "center" || j(e) ? (l += a.bottom, nt(i.text) && (l += o.lineHeight * (i.text.length - 1))) : l += a.top;
    const { titleX: c, titleY: d, maxWidth: h, rotation: f } = Oh(this, l, e, r);
    ye(t, i.text, 0, 0, o, {
      color: i.color,
      maxWidth: h,
      rotation: f,
      textAlign: Dh(r, e, s),
      textBaseline: "middle",
      translation: [
        c,
        d
      ]
    });
  }
  draw(t) {
    this._isVisible() && (this.drawBackground(), this.drawGrid(t), this.drawBorder(), this.drawTitle(), this.drawLabels(t));
  }
  _layers() {
    const t = this.options, e = t.ticks && t.ticks.z || 0, i = V(t.grid && t.grid.z, -1), s = V(t.border && t.border.z, 0);
    return !this._isVisible() || this.draw !== Ne.prototype.draw ? [
      {
        z: e,
        draw: (o) => {
          this.draw(o);
        }
      }
    ] : [
      {
        z: i,
        draw: (o) => {
          this.drawBackground(), this.drawGrid(o), this.drawTitle();
        }
      },
      {
        z: s,
        draw: () => {
          this.drawBorder();
        }
      },
      {
        z: e,
        draw: (o) => {
          this.drawLabels(o);
        }
      }
    ];
  }
  getMatchingVisibleMetas(t) {
    const e = this.chart.getSortedVisibleDatasetMetas(), i = this.axis + "AxisID", s = [];
    let o, a;
    for (o = 0, a = e.length; o < a; ++o) {
      const r = e[o];
      r[i] === this.id && (!t || r.type === t) && s.push(r);
    }
    return s;
  }
  _resolveTickFontOptions(t) {
    const e = this.options.ticks.setContext(this.getContext(t));
    return ht(e.font);
  }
  _maxDigits() {
    const t = this._resolveTickFontOptions(0).lineHeight;
    return (this.isHorizontal() ? this.width : this.height) / t;
  }
}
class Mn {
  constructor(t, e, i) {
    this.type = t, this.scope = e, this.override = i, this.items = /* @__PURE__ */ Object.create(null);
  }
  isForType(t) {
    return Object.prototype.isPrototypeOf.call(this.type.prototype, t.prototype);
  }
  register(t) {
    const e = Object.getPrototypeOf(t);
    let i;
    Lh(e) && (i = this.register(e));
    const s = this.items, o = t.id, a = this.scope + "." + o;
    if (!o)
      throw new Error("class does not have id: " + t);
    return o in s || (s[o] = t, zh(t, a, i), this.override && ot.override(t.id, t.overrides)), a;
  }
  get(t) {
    return this.items[t];
  }
  unregister(t) {
    const e = this.items, i = t.id, s = this.scope;
    i in e && delete e[i], s && i in ot[s] && (delete ot[s][i], this.override && delete xe[i]);
  }
}
function zh(n, t, e) {
  const i = Qe(/* @__PURE__ */ Object.create(null), [
    e ? ot.get(e) : {},
    ot.get(t),
    n.defaults
  ]);
  ot.set(t, i), n.defaultRoutes && Rh(t, n.defaultRoutes), n.descriptors && ot.describe(t, n.descriptors);
}
function Rh(n, t) {
  Object.keys(t).forEach((e) => {
    const i = e.split("."), s = i.pop(), o = [
      n
    ].concat(i).join("."), a = t[e].split("."), r = a.pop(), l = a.join(".");
    ot.route(o, s, l, r);
  });
}
function Lh(n) {
  return "id" in n && "defaults" in n;
}
class Ih {
  constructor() {
    this.controllers = new Mn(se, "datasets", !0), this.elements = new Mn(Ft, "elements"), this.plugins = new Mn(Object, "plugins"), this.scales = new Mn(Ne, "scales"), this._typedRegistries = [
      this.controllers,
      this.scales,
      this.elements
    ];
  }
  add(...t) {
    this._each("register", t);
  }
  remove(...t) {
    this._each("unregister", t);
  }
  addControllers(...t) {
    this._each("register", t, this.controllers);
  }
  addElements(...t) {
    this._each("register", t, this.elements);
  }
  addPlugins(...t) {
    this._each("register", t, this.plugins);
  }
  addScales(...t) {
    this._each("register", t, this.scales);
  }
  getController(t) {
    return this._get(t, this.controllers, "controller");
  }
  getElement(t) {
    return this._get(t, this.elements, "element");
  }
  getPlugin(t) {
    return this._get(t, this.plugins, "plugin");
  }
  getScale(t) {
    return this._get(t, this.scales, "scale");
  }
  removeControllers(...t) {
    this._each("unregister", t, this.controllers);
  }
  removeElements(...t) {
    this._each("unregister", t, this.elements);
  }
  removePlugins(...t) {
    this._each("unregister", t, this.plugins);
  }
  removeScales(...t) {
    this._each("unregister", t, this.scales);
  }
  _each(t, e, i) {
    [
      ...e
    ].forEach((s) => {
      const o = i || this._getRegistryForType(s);
      i || o.isForType(s) || o === this.plugins && s.id ? this._exec(t, o, s) : q(s, (a) => {
        const r = i || this._getRegistryForType(a);
        this._exec(t, r, a);
      });
    });
  }
  _exec(t, e, i) {
    const s = Ki(t);
    Q(i["before" + s], [], i), e[t](i), Q(i["after" + s], [], i);
  }
  _getRegistryForType(t) {
    for (let e = 0; e < this._typedRegistries.length; e++) {
      const i = this._typedRegistries[e];
      if (i.isForType(t))
        return i;
    }
    return this.plugins;
  }
  _get(t, e, i) {
    const s = e.get(t);
    if (s === void 0)
      throw new Error('"' + t + '" is not a registered ' + i + ".");
    return s;
  }
}
var Rt = /* @__PURE__ */ new Ih();
class Eh {
  constructor() {
    this._init = void 0;
  }
  notify(t, e, i, s) {
    if (e === "beforeInit" && (this._init = this._createDescriptors(t, !0), this._notify(this._init, t, "install")), this._init === void 0)
      return;
    const o = s ? this._descriptors(t).filter(s) : this._descriptors(t), a = this._notify(o, t, e, i);
    return e === "afterDestroy" && (this._notify(o, t, "stop"), this._notify(this._init, t, "uninstall"), this._init = void 0), a;
  }
  _notify(t, e, i, s) {
    s = s || {};
    for (const o of t) {
      const a = o.plugin, r = a[i], l = [
        e,
        s,
        o.options
      ];
      if (Q(r, l, a) === !1 && s.cancelable)
        return !1;
    }
    return !0;
  }
  invalidate() {
    U(this._cache) || (this._oldCache = this._cache, this._cache = void 0);
  }
  _descriptors(t) {
    if (this._cache)
      return this._cache;
    const e = this._cache = this._createDescriptors(t);
    return this._notifyStateChanges(t), e;
  }
  _createDescriptors(t, e) {
    const i = t && t.config, s = V(i.options && i.options.plugins, {}), o = Vh(i);
    return s === !1 && !e ? [] : Hh(t, o, s, e);
  }
  _notifyStateChanges(t) {
    const e = this._oldCache || [], i = this._cache, s = (o, a) => o.filter((r) => !a.some((l) => r.plugin.id === l.plugin.id));
    this._notify(s(e, i), t, "stop"), this._notify(s(i, e), t, "start");
  }
}
function Vh(n) {
  const t = {}, e = [], i = Object.keys(Rt.plugins.items);
  for (let o = 0; o < i.length; o++)
    e.push(Rt.getPlugin(i[o]));
  const s = n.plugins || [];
  for (let o = 0; o < s.length; o++) {
    const a = s[o];
    e.indexOf(a) === -1 && (e.push(a), t[a.id] = !0);
  }
  return {
    plugins: e,
    localIds: t
  };
}
function Wh(n, t) {
  return !t && n === !1 ? null : n === !0 ? {} : n;
}
function Hh(n, { plugins: t, localIds: e }, i, s) {
  const o = [], a = n.getContext();
  for (const r of t) {
    const l = r.id, c = Wh(i[l], s);
    c !== null && o.push({
      plugin: r,
      options: jh(n.config, {
        plugin: r,
        local: e[l]
      }, c, a)
    });
  }
  return o;
}
function jh(n, { plugin: t, local: e }, i, s) {
  const o = n.pluginScopeKeys(t), a = n.getOptionScopes(i, o);
  return e && t.defaults && a.push(t.defaults), n.createResolver(a, s, [
    ""
  ], {
    scriptable: !1,
    indexable: !1,
    allKeys: !0
  });
}
function Ri(n, t) {
  const e = ot.datasets[n] || {};
  return ((t.datasets || {})[n] || {}).indexAxis || t.indexAxis || e.indexAxis || "x";
}
function $h(n, t) {
  let e = n;
  return n === "_index_" ? e = t : n === "_value_" && (e = t === "x" ? "y" : "x"), e;
}
function Yh(n, t) {
  return n === t ? "_index_" : "_value_";
}
function vo(n) {
  if (n === "x" || n === "y" || n === "r")
    return n;
}
function Uh(n) {
  if (n === "top" || n === "bottom")
    return "x";
  if (n === "left" || n === "right")
    return "y";
}
function Li(n, ...t) {
  if (vo(n))
    return n;
  for (const e of t) {
    const i = e.axis || Uh(e.position) || n.length > 1 && vo(n[0].toLowerCase());
    if (i)
      return i;
  }
  throw new Error(`Cannot determine type of '${n}' axis. Please provide 'axis' or 'position' option.`);
}
function _o(n, t, e) {
  if (e[t + "AxisID"] === n)
    return {
      axis: t
    };
}
function Gh(n, t) {
  if (t.data && t.data.datasets) {
    const e = t.data.datasets.filter((i) => i.xAxisID === n || i.yAxisID === n);
    if (e.length)
      return _o(n, "x", e[0]) || _o(n, "y", e[0]);
  }
  return {};
}
function Xh(n, t) {
  const e = xe[n.type] || {
    scales: {}
  }, i = t.scales || {}, s = Ri(n.type, t), o = /* @__PURE__ */ Object.create(null);
  return Object.keys(i).forEach((a) => {
    const r = i[a];
    if (!j(r))
      return console.error(`Invalid scale configuration for scale: ${a}`);
    if (r._proxy)
      return console.warn(`Ignoring resolver passed as options for scale: ${a}`);
    const l = Li(a, r, Gh(a, n), ot.scales[r.type]), c = Yh(l, s), d = e.scales || {};
    o[a] = Xe(/* @__PURE__ */ Object.create(null), [
      {
        axis: l
      },
      r,
      d[l],
      d[c]
    ]);
  }), n.data.datasets.forEach((a) => {
    const r = a.type || n.type, l = a.indexAxis || Ri(r, t), d = (xe[r] || {}).scales || {};
    Object.keys(d).forEach((h) => {
      const f = $h(h, l), u = a[f + "AxisID"] || f;
      o[u] = o[u] || /* @__PURE__ */ Object.create(null), Xe(o[u], [
        {
          axis: f
        },
        i[u],
        d[h]
      ]);
    });
  }), Object.keys(o).forEach((a) => {
    const r = o[a];
    Xe(r, [
      ot.scales[r.type],
      ot.scale
    ]);
  }), o;
}
function Ra(n) {
  const t = n.options || (n.options = {});
  t.plugins = V(t.plugins, {}), t.scales = Xh(n, t);
}
function La(n) {
  return n = n || {}, n.datasets = n.datasets || [], n.labels = n.labels || [], n;
}
function Kh(n) {
  return n = n || {}, n.data = La(n.data), Ra(n), n;
}
const wo = /* @__PURE__ */ new Map(), Ia = /* @__PURE__ */ new Set();
function Tn(n, t) {
  let e = wo.get(n);
  return e || (e = t(), wo.set(n, e), Ia.add(e)), e;
}
const He = (n, t, e) => {
  const i = oe(t, e);
  i !== void 0 && n.add(i);
};
class qh {
  constructor(t) {
    this._config = Kh(t), this._scopeCache = /* @__PURE__ */ new Map(), this._resolverCache = /* @__PURE__ */ new Map();
  }
  get platform() {
    return this._config.platform;
  }
  get type() {
    return this._config.type;
  }
  set type(t) {
    this._config.type = t;
  }
  get data() {
    return this._config.data;
  }
  set data(t) {
    this._config.data = La(t);
  }
  get options() {
    return this._config.options;
  }
  set options(t) {
    this._config.options = t;
  }
  get plugins() {
    return this._config.plugins;
  }
  update() {
    const t = this._config;
    this.clearCache(), Ra(t);
  }
  clearCache() {
    this._scopeCache.clear(), this._resolverCache.clear();
  }
  datasetScopeKeys(t) {
    return Tn(t, () => [
      [
        `datasets.${t}`,
        ""
      ]
    ]);
  }
  datasetAnimationScopeKeys(t, e) {
    return Tn(`${t}.transition.${e}`, () => [
      [
        `datasets.${t}.transitions.${e}`,
        `transitions.${e}`
      ],
      [
        `datasets.${t}`,
        ""
      ]
    ]);
  }
  datasetElementScopeKeys(t, e) {
    return Tn(`${t}-${e}`, () => [
      [
        `datasets.${t}.elements.${e}`,
        `datasets.${t}`,
        `elements.${e}`,
        ""
      ]
    ]);
  }
  pluginScopeKeys(t) {
    const e = t.id, i = this.type;
    return Tn(`${i}-plugin-${e}`, () => [
      [
        `plugins.${e}`,
        ...t.additionalOptionScopes || []
      ]
    ]);
  }
  _cachedScopes(t, e) {
    const i = this._scopeCache;
    let s = i.get(t);
    return (!s || e) && (s = /* @__PURE__ */ new Map(), i.set(t, s)), s;
  }
  getOptionScopes(t, e, i) {
    const { options: s, type: o } = this, a = this._cachedScopes(t, i), r = a.get(e);
    if (r)
      return r;
    const l = /* @__PURE__ */ new Set();
    e.forEach((d) => {
      t && (l.add(t), d.forEach((h) => He(l, t, h))), d.forEach((h) => He(l, s, h)), d.forEach((h) => He(l, xe[o] || {}, h)), d.forEach((h) => He(l, ot, h)), d.forEach((h) => He(l, Di, h));
    });
    const c = Array.from(l);
    return c.length === 0 && c.push(/* @__PURE__ */ Object.create(null)), Ia.has(e) && a.set(e, c), c;
  }
  chartOptionScopes() {
    const { options: t, type: e } = this;
    return [
      t,
      xe[e] || {},
      ot.datasets[e] || {},
      {
        type: e
      },
      ot,
      Di
    ];
  }
  resolveNamedOptions(t, e, i, s = [
    ""
  ]) {
    const o = {
      $shared: !0
    }, { resolver: a, subPrefixes: r } = So(this._resolverCache, t, s);
    let l = a;
    if (Zh(a, e)) {
      o.$shared = !1, i = ae(i) ? i() : i;
      const c = this.createResolver(t, i, r);
      l = Fe(a, i, c);
    }
    for (const c of e)
      o[c] = l[c];
    return o;
  }
  createResolver(t, e, i = [
    ""
  ], s) {
    const { resolver: o } = So(this._resolverCache, t, i);
    return j(e) ? Fe(o, e, void 0, s) : o;
  }
}
function So(n, t, e) {
  let i = n.get(t);
  i || (i = /* @__PURE__ */ new Map(), n.set(t, i));
  const s = e.join();
  let o = i.get(s);
  return o || (o = {
    resolver: is(t, e),
    subPrefixes: e.filter((r) => !r.toLowerCase().includes("hover"))
  }, i.set(s, o)), o;
}
const Jh = (n) => j(n) && Object.getOwnPropertyNames(n).some((t) => ae(n[t]));
function Zh(n, t) {
  const { isScriptable: e, isIndexable: i } = ba(n);
  for (const s of t) {
    const o = e(s), a = i(s), r = (a || o) && n[s];
    if (o && (ae(r) || Jh(r)) || a && nt(r))
      return !0;
  }
  return !1;
}
var Qh = "4.5.1";
const tf = [
  "top",
  "bottom",
  "left",
  "right",
  "chartArea"
];
function Co(n, t) {
  return n === "top" || n === "bottom" || tf.indexOf(n) === -1 && t === "x";
}
function ko(n, t) {
  return function(e, i) {
    return e[n] === i[n] ? e[t] - i[t] : e[n] - i[n];
  };
}
function Mo(n) {
  const t = n.chart, e = t.options.animation;
  t.notifyPlugins("afterRender"), Q(e && e.onComplete, [
    n
  ], t);
}
function ef(n) {
  const t = n.chart, e = t.options.animation;
  Q(e && e.onProgress, [
    n
  ], t);
}
function Ea(n) {
  return as() && typeof n == "string" ? n = document.getElementById(n) : n && n.length && (n = n[0]), n && n.canvas && (n = n.canvas), n;
}
const Rn = {}, To = (n) => {
  const t = Ea(n);
  return Object.values(Rn).filter((e) => e.canvas === t).pop();
};
function nf(n, t, e) {
  const i = Object.keys(n);
  for (const s of i) {
    const o = +s;
    if (o >= t) {
      const a = n[s];
      delete n[s], (e > 0 || o > t) && (n[o + e] = a);
    }
  }
}
function sf(n, t, e, i) {
  return !e || n.type === "mouseout" ? null : i ? t : n;
}
var Jt;
let Qn = (Jt = class {
  static register(...t) {
    Rt.add(...t), Bo();
  }
  static unregister(...t) {
    Rt.remove(...t), Bo();
  }
  constructor(t, e) {
    const i = this.config = new qh(e), s = Ea(t), o = To(s);
    if (o)
      throw new Error("Canvas is already in use. Chart with ID '" + o.id + "' must be destroyed before the canvas with ID '" + o.canvas.id + "' can be reused.");
    const a = i.createResolver(i.chartOptionScopes(), this.getContext());
    this.platform = new (i.platform || _h(s))(), this.platform.updateConfig(i);
    const r = this.platform.acquireContext(s, a.aspectRatio), l = r && r.canvas, c = l && l.height, d = l && l.width;
    if (this.id = tc(), this.ctx = r, this.canvas = l, this.width = d, this.height = c, this._options = a, this._aspectRatio = this.aspectRatio, this._layers = [], this._metasets = [], this._stacks = void 0, this.boxes = [], this.currentDevicePixelRatio = void 0, this.chartArea = void 0, this._active = [], this._lastEvent = void 0, this._listeners = {}, this._responsiveListeners = void 0, this._sortedMetasets = [], this.scales = {}, this._plugins = new Eh(), this.$proxies = {}, this._hiddenIndices = {}, this.attached = !1, this._animationsDisabled = void 0, this.$context = void 0, this._doResize = xc((h) => this.update(h), a.resizeDelay || 0), this._dataChanges = [], Rn[this.id] = this, !r || !l) {
      console.error("Failed to create chart: can't acquire context from the given item");
      return;
    }
    jt.listen(this, "complete", Mo), jt.listen(this, "progress", ef), this._initialize(), this.attached && this.update();
  }
  get aspectRatio() {
    const { options: { aspectRatio: t, maintainAspectRatio: e }, width: i, height: s, _aspectRatio: o } = this;
    return U(t) ? e && o ? o : s ? i / s : null : t;
  }
  get data() {
    return this.config.data;
  }
  set data(t) {
    this.config.data = t;
  }
  get options() {
    return this._options;
  }
  set options(t) {
    this.config.options = t;
  }
  get registry() {
    return Rt;
  }
  _initialize() {
    return this.notifyPlugins("beforeInit"), this.options.responsive ? this.resize() : Ks(this, this.options.devicePixelRatio), this.bindEvents(), this.notifyPlugins("afterInit"), this;
  }
  clear() {
    return Us(this.canvas, this.ctx), this;
  }
  stop() {
    return jt.stop(this), this;
  }
  resize(t, e) {
    jt.running(this) ? this._resizeBeforeDraw = {
      width: t,
      height: e
    } : this._resize(t, e);
  }
  _resize(t, e) {
    const i = this.options, s = this.canvas, o = i.maintainAspectRatio && this.aspectRatio, a = this.platform.getMaximumSize(s, t, e, o), r = i.devicePixelRatio || this.platform.getDevicePixelRatio(), l = this.width ? "resize" : "attach";
    this.width = a.width, this.height = a.height, this._aspectRatio = this.aspectRatio, Ks(this, r, !0) && (this.notifyPlugins("resize", {
      size: a
    }), Q(i.onResize, [
      this,
      a
    ], this), this.attached && this._doResize(l) && this.render());
  }
  ensureScalesHaveIDs() {
    const e = this.options.scales || {};
    q(e, (i, s) => {
      i.id = s;
    });
  }
  buildOrUpdateScales() {
    const t = this.options, e = t.scales, i = this.scales, s = Object.keys(i).reduce((a, r) => (a[r] = !1, a), {});
    let o = [];
    e && (o = o.concat(Object.keys(e).map((a) => {
      const r = e[a], l = Li(a, r), c = l === "r", d = l === "x";
      return {
        options: r,
        dposition: c ? "chartArea" : d ? "bottom" : "left",
        dtype: c ? "radialLinear" : d ? "category" : "linear"
      };
    }))), q(o, (a) => {
      const r = a.options, l = r.id, c = Li(l, r), d = V(r.type, a.dtype);
      (r.position === void 0 || Co(r.position, c) !== Co(a.dposition)) && (r.position = a.dposition), s[l] = !0;
      let h = null;
      if (l in i && i[l].type === d)
        h = i[l];
      else {
        const f = Rt.getScale(d);
        h = new f({
          id: l,
          type: d,
          ctx: this.ctx,
          chart: this
        }), i[h.id] = h;
      }
      h.init(r, t);
    }), q(s, (a, r) => {
      a || delete i[r];
    }), q(i, (a) => {
      Tt.configure(this, a, a.options), Tt.addBox(this, a);
    });
  }
  _updateMetasets() {
    const t = this._metasets, e = this.data.datasets.length, i = t.length;
    if (t.sort((s, o) => s.index - o.index), i > e) {
      for (let s = e; s < i; ++s)
        this._destroyDatasetMeta(s);
      t.splice(e, i - e);
    }
    this._sortedMetasets = t.slice(0).sort(ko("order", "index"));
  }
  _removeUnreferencedMetasets() {
    const { _metasets: t, data: { datasets: e } } = this;
    t.length > e.length && delete this._stacks, t.forEach((i, s) => {
      e.filter((o) => o === i._dataset).length === 0 && this._destroyDatasetMeta(s);
    });
  }
  buildOrUpdateControllers() {
    const t = [], e = this.data.datasets;
    let i, s;
    for (this._removeUnreferencedMetasets(), i = 0, s = e.length; i < s; i++) {
      const o = e[i];
      let a = this.getDatasetMeta(i);
      const r = o.type || this.config.type;
      if (a.type && a.type !== r && (this._destroyDatasetMeta(i), a = this.getDatasetMeta(i)), a.type = r, a.indexAxis = o.indexAxis || Ri(r, this.options), a.order = o.order || 0, a.index = i, a.label = "" + o.label, a.visible = this.isDatasetVisible(i), a.controller)
        a.controller.updateIndex(i), a.controller.linkScales();
      else {
        const l = Rt.getController(r), { datasetElementType: c, dataElementType: d } = ot.datasets[r];
        Object.assign(l, {
          dataElementType: Rt.getElement(d),
          datasetElementType: c && Rt.getElement(c)
        }), a.controller = new l(this, i), t.push(a.controller);
      }
    }
    return this._updateMetasets(), t;
  }
  _resetElements() {
    q(this.data.datasets, (t, e) => {
      this.getDatasetMeta(e).controller.reset();
    }, this);
  }
  reset() {
    this._resetElements(), this.notifyPlugins("reset");
  }
  update(t) {
    const e = this.config;
    e.update();
    const i = this._options = e.createResolver(e.chartOptionScopes(), this.getContext()), s = this._animationsDisabled = !i.animation;
    if (this._updateScales(), this._checkEventBindings(), this._updateHiddenIndices(), this._plugins.invalidate(), this.notifyPlugins("beforeUpdate", {
      mode: t,
      cancelable: !0
    }) === !1)
      return;
    const o = this.buildOrUpdateControllers();
    this.notifyPlugins("beforeElementsUpdate");
    let a = 0;
    for (let c = 0, d = this.data.datasets.length; c < d; c++) {
      const { controller: h } = this.getDatasetMeta(c), f = !s && o.indexOf(h) === -1;
      h.buildOrUpdateElements(f), a = Math.max(+h.getMaxOverflow(), a);
    }
    a = this._minPadding = i.layout.autoPadding ? a : 0, this._updateLayout(a), s || q(o, (c) => {
      c.reset();
    }), this._updateDatasets(t), this.notifyPlugins("afterUpdate", {
      mode: t
    }), this._layers.sort(ko("z", "_idx"));
    const { _active: r, _lastEvent: l } = this;
    l ? this._eventHandler(l, !0) : r.length && this._updateHoverStyles(r, r, !0), this.render();
  }
  _updateScales() {
    q(this.scales, (t) => {
      Tt.removeBox(this, t);
    }), this.ensureScalesHaveIDs(), this.buildOrUpdateScales();
  }
  _checkEventBindings() {
    const t = this.options, e = new Set(Object.keys(this._listeners)), i = new Set(t.events);
    (!Ls(e, i) || !!this._responsiveListeners !== t.responsive) && (this.unbindEvents(), this.bindEvents());
  }
  _updateHiddenIndices() {
    const { _hiddenIndices: t } = this, e = this._getUniformDataChanges() || [];
    for (const { method: i, start: s, count: o } of e) {
      const a = i === "_removeElements" ? -o : o;
      nf(t, s, a);
    }
  }
  _getUniformDataChanges() {
    const t = this._dataChanges;
    if (!t || !t.length)
      return;
    this._dataChanges = [];
    const e = this.data.datasets.length, i = (o) => new Set(t.filter((a) => a[0] === o).map((a, r) => r + "," + a.splice(1).join(","))), s = i(0);
    for (let o = 1; o < e; o++)
      if (!Ls(s, i(o)))
        return;
    return Array.from(s).map((o) => o.split(",")).map((o) => ({
      method: o[1],
      start: +o[2],
      count: +o[3]
    }));
  }
  _updateLayout(t) {
    if (this.notifyPlugins("beforeLayout", {
      cancelable: !0
    }) === !1)
      return;
    Tt.update(this, this.width, this.height, t);
    const e = this.chartArea, i = e.width <= 0 || e.height <= 0;
    this._layers = [], q(this.boxes, (s) => {
      i && s.position === "chartArea" || (s.configure && s.configure(), this._layers.push(...s._layers()));
    }, this), this._layers.forEach((s, o) => {
      s._idx = o;
    }), this.notifyPlugins("afterLayout");
  }
  _updateDatasets(t) {
    if (this.notifyPlugins("beforeDatasetsUpdate", {
      mode: t,
      cancelable: !0
    }) !== !1) {
      for (let e = 0, i = this.data.datasets.length; e < i; ++e)
        this.getDatasetMeta(e).controller.configure();
      for (let e = 0, i = this.data.datasets.length; e < i; ++e)
        this._updateDataset(e, ae(t) ? t({
          datasetIndex: e
        }) : t);
      this.notifyPlugins("afterDatasetsUpdate", {
        mode: t
      });
    }
  }
  _updateDataset(t, e) {
    const i = this.getDatasetMeta(t), s = {
      meta: i,
      index: t,
      mode: e,
      cancelable: !0
    };
    this.notifyPlugins("beforeDatasetUpdate", s) !== !1 && (i.controller._update(e), s.cancelable = !1, this.notifyPlugins("afterDatasetUpdate", s));
  }
  render() {
    this.notifyPlugins("beforeRender", {
      cancelable: !0
    }) !== !1 && (jt.has(this) ? this.attached && !jt.running(this) && jt.start(this) : (this.draw(), Mo({
      chart: this
    })));
  }
  draw() {
    let t;
    if (this._resizeBeforeDraw) {
      const { width: i, height: s } = this._resizeBeforeDraw;
      this._resizeBeforeDraw = null, this._resize(i, s);
    }
    if (this.clear(), this.width <= 0 || this.height <= 0 || this.notifyPlugins("beforeDraw", {
      cancelable: !0
    }) === !1)
      return;
    const e = this._layers;
    for (t = 0; t < e.length && e[t].z <= 0; ++t)
      e[t].draw(this.chartArea);
    for (this._drawDatasets(); t < e.length; ++t)
      e[t].draw(this.chartArea);
    this.notifyPlugins("afterDraw");
  }
  _getSortedDatasetMetas(t) {
    const e = this._sortedMetasets, i = [];
    let s, o;
    for (s = 0, o = e.length; s < o; ++s) {
      const a = e[s];
      (!t || a.visible) && i.push(a);
    }
    return i;
  }
  getSortedVisibleDatasetMetas() {
    return this._getSortedDatasetMetas(!0);
  }
  _drawDatasets() {
    if (this.notifyPlugins("beforeDatasetsDraw", {
      cancelable: !0
    }) === !1)
      return;
    const t = this.getSortedVisibleDatasetMetas();
    for (let e = t.length - 1; e >= 0; --e)
      this._drawDataset(t[e]);
    this.notifyPlugins("afterDatasetsDraw");
  }
  _drawDataset(t) {
    const e = this.ctx, i = {
      meta: t,
      index: t.index,
      cancelable: !0
    }, s = Ta(this, t);
    this.notifyPlugins("beforeDatasetDraw", i) !== !1 && (s && Kn(e, s), t.controller.draw(), s && qn(e), i.cancelable = !1, this.notifyPlugins("afterDatasetDraw", i));
  }
  isPointInArea(t) {
    return Xt(t, this.chartArea, this._minPadding);
  }
  getElementsAtEventForMode(t, e, i, s) {
    const o = th.modes[e];
    return typeof o == "function" ? o(this, t, i, s) : [];
  }
  getDatasetMeta(t) {
    const e = this.data.datasets[t], i = this._metasets;
    let s = i.filter((o) => o && o._dataset === e).pop();
    return s || (s = {
      type: null,
      data: [],
      dataset: null,
      controller: null,
      hidden: null,
      xAxisID: null,
      yAxisID: null,
      order: e && e.order || 0,
      index: t,
      _dataset: e,
      _parsed: [],
      _sorted: !1
    }, i.push(s)), s;
  }
  getContext() {
    return this.$context || (this.$context = re(null, {
      chart: this,
      type: "chart"
    }));
  }
  getVisibleDatasetCount() {
    return this.getSortedVisibleDatasetMetas().length;
  }
  isDatasetVisible(t) {
    const e = this.data.datasets[t];
    if (!e)
      return !1;
    const i = this.getDatasetMeta(t);
    return typeof i.hidden == "boolean" ? !i.hidden : !e.hidden;
  }
  setDatasetVisibility(t, e) {
    const i = this.getDatasetMeta(t);
    i.hidden = !e;
  }
  toggleDataVisibility(t) {
    this._hiddenIndices[t] = !this._hiddenIndices[t];
  }
  getDataVisibility(t) {
    return !this._hiddenIndices[t];
  }
  _updateVisibility(t, e, i) {
    const s = i ? "show" : "hide", o = this.getDatasetMeta(t), a = o.controller._resolveAnimations(void 0, s);
    tn(e) ? (o.data[e].hidden = !i, this.update()) : (this.setDatasetVisibility(t, i), a.update(o, {
      visible: i
    }), this.update((r) => r.datasetIndex === t ? s : void 0));
  }
  hide(t, e) {
    this._updateVisibility(t, e, !1);
  }
  show(t, e) {
    this._updateVisibility(t, e, !0);
  }
  _destroyDatasetMeta(t) {
    const e = this._metasets[t];
    e && e.controller && e.controller._destroy(), delete this._metasets[t];
  }
  _stop() {
    let t, e;
    for (this.stop(), jt.remove(this), t = 0, e = this.data.datasets.length; t < e; ++t)
      this._destroyDatasetMeta(t);
  }
  destroy() {
    this.notifyPlugins("beforeDestroy");
    const { canvas: t, ctx: e } = this;
    this._stop(), this.config.clearCache(), t && (this.unbindEvents(), Us(t, e), this.platform.releaseContext(e), this.canvas = null, this.ctx = null), delete Rn[this.id], this.notifyPlugins("afterDestroy");
  }
  toBase64Image(...t) {
    return this.canvas.toDataURL(...t);
  }
  bindEvents() {
    this.bindUserEvents(), this.options.responsive ? this.bindResponsiveEvents() : this.attached = !0;
  }
  bindUserEvents() {
    const t = this._listeners, e = this.platform, i = (o, a) => {
      e.addEventListener(this, o, a), t[o] = a;
    }, s = (o, a, r) => {
      o.offsetX = a, o.offsetY = r, this._eventHandler(o);
    };
    q(this.options.events, (o) => i(o, s));
  }
  bindResponsiveEvents() {
    this._responsiveListeners || (this._responsiveListeners = {});
    const t = this._responsiveListeners, e = this.platform, i = (l, c) => {
      e.addEventListener(this, l, c), t[l] = c;
    }, s = (l, c) => {
      t[l] && (e.removeEventListener(this, l, c), delete t[l]);
    }, o = (l, c) => {
      this.canvas && this.resize(l, c);
    };
    let a;
    const r = () => {
      s("attach", r), this.attached = !0, this.resize(), i("resize", o), i("detach", a);
    };
    a = () => {
      this.attached = !1, s("resize", o), this._stop(), this._resize(0, 0), i("attach", r);
    }, e.isAttached(this.canvas) ? r() : a();
  }
  unbindEvents() {
    q(this._listeners, (t, e) => {
      this.platform.removeEventListener(this, e, t);
    }), this._listeners = {}, q(this._responsiveListeners, (t, e) => {
      this.platform.removeEventListener(this, e, t);
    }), this._responsiveListeners = void 0;
  }
  updateHoverStyle(t, e, i) {
    const s = i ? "set" : "remove";
    let o, a, r, l;
    for (e === "dataset" && (o = this.getDatasetMeta(t[0].datasetIndex), o.controller["_" + s + "DatasetHoverStyle"]()), r = 0, l = t.length; r < l; ++r) {
      a = t[r];
      const c = a && this.getDatasetMeta(a.datasetIndex).controller;
      c && c[s + "HoverStyle"](a.element, a.datasetIndex, a.index);
    }
  }
  getActiveElements() {
    return this._active || [];
  }
  setActiveElements(t) {
    const e = this._active || [], i = t.map(({ datasetIndex: o, index: a }) => {
      const r = this.getDatasetMeta(o);
      if (!r)
        throw new Error("No dataset found at index " + o);
      return {
        datasetIndex: o,
        element: r.data[a],
        index: a
      };
    });
    !Vn(i, e) && (this._active = i, this._lastEvent = null, this._updateHoverStyles(i, e));
  }
  notifyPlugins(t, e, i) {
    return this._plugins.notify(this, t, e, i);
  }
  isPluginEnabled(t) {
    return this._plugins._cache.filter((e) => e.plugin.id === t).length === 1;
  }
  _updateHoverStyles(t, e, i) {
    const s = this.options.hover, o = (l, c) => l.filter((d) => !c.some((h) => d.datasetIndex === h.datasetIndex && d.index === h.index)), a = o(e, t), r = i ? t : o(t, e);
    a.length && this.updateHoverStyle(a, s.mode, !1), r.length && s.mode && this.updateHoverStyle(r, s.mode, !0);
  }
  _eventHandler(t, e) {
    const i = {
      event: t,
      replay: e,
      cancelable: !0,
      inChartArea: this.isPointInArea(t)
    }, s = (a) => (a.options.events || this.options.events).includes(t.native.type);
    if (this.notifyPlugins("beforeEvent", i, s) === !1)
      return;
    const o = this._handleEvent(t, e, i.inChartArea);
    return i.cancelable = !1, this.notifyPlugins("afterEvent", i, s), (o || i.changed) && this.render(), this;
  }
  _handleEvent(t, e, i) {
    const { _active: s = [], options: o } = this, a = e, r = this._getActiveElements(t, s, i, a), l = ac(t), c = sf(t, this._lastEvent, i, l);
    i && (this._lastEvent = null, Q(o.onHover, [
      t,
      r,
      this
    ], this), l && Q(o.onClick, [
      t,
      r,
      this
    ], this));
    const d = !Vn(r, s);
    return (d || e) && (this._active = r, this._updateHoverStyles(r, s, e)), this._lastEvent = c, d;
  }
  _getActiveElements(t, e, i, s) {
    if (t.type === "mouseout")
      return [];
    if (!i)
      return e;
    const o = this.options.hover;
    return this.getElementsAtEventForMode(t, o.mode, o, s);
  }
}, P(Jt, "defaults", ot), P(Jt, "instances", Rn), P(Jt, "overrides", xe), P(Jt, "registry", Rt), P(Jt, "version", Qh), P(Jt, "getChart", To), Jt);
function Bo() {
  return q(Qn.instances, (n) => n._plugins.invalidate());
}
function of(n, t, e) {
  const { startAngle: i, x: s, y: o, outerRadius: a, innerRadius: r, options: l } = t, { borderWidth: c, borderJoinStyle: d } = l, h = Math.min(c / a, mt(i - e));
  if (n.beginPath(), n.arc(s, o, a - c / 2, i + h / 2, e - h / 2), r > 0) {
    const f = Math.min(c / r, mt(i - e));
    n.arc(s, o, r + c / 2, e - f / 2, i + f / 2, !0);
  } else {
    const f = Math.min(c / 2, a * mt(i - e));
    if (d === "round")
      n.arc(s, o, f, e - X / 2, i + X / 2, !0);
    else if (d === "bevel") {
      const u = 2 * f * f, p = -u * Math.cos(e + X / 2) + s, m = -u * Math.sin(e + X / 2) + o, x = u * Math.cos(i + X / 2) + s, v = u * Math.sin(i + X / 2) + o;
      n.lineTo(p, m), n.lineTo(x, v);
    }
  }
  n.closePath(), n.moveTo(0, 0), n.rect(0, 0, n.canvas.width, n.canvas.height), n.clip("evenodd");
}
function af(n, t, e) {
  const { startAngle: i, pixelMargin: s, x: o, y: a, outerRadius: r, innerRadius: l } = t;
  let c = s / r;
  n.beginPath(), n.arc(o, a, r, i - c, e + c), l > s ? (c = s / l, n.arc(o, a, l, e + c, i - c, !0)) : n.arc(o, a, s, e + rt, i - rt), n.closePath(), n.clip();
}
function rf(n) {
  return ns(n, [
    "outerStart",
    "outerEnd",
    "innerStart",
    "innerEnd"
  ]);
}
function lf(n, t, e, i) {
  const s = rf(n.options.borderRadius), o = (e - t) / 2, a = Math.min(o, i * t / 2), r = (l) => {
    const c = (e - Math.min(o, l)) * i / 2;
    return bt(l, 0, Math.min(o, c));
  };
  return {
    outerStart: r(s.outerStart),
    outerEnd: r(s.outerEnd),
    innerStart: bt(s.innerStart, 0, a),
    innerEnd: bt(s.innerEnd, 0, a)
  };
}
function Te(n, t, e, i) {
  return {
    x: e + n * Math.cos(t),
    y: i + n * Math.sin(t)
  };
}
function Un(n, t, e, i, s, o) {
  const { x: a, y: r, startAngle: l, pixelMargin: c, innerRadius: d } = t, h = Math.max(t.outerRadius + i + e - c, 0), f = d > 0 ? d + i + e + c : 0;
  let u = 0;
  const p = s - l;
  if (i) {
    const $ = d > 0 ? d - i : 0, G = h > 0 ? h - i : 0, it = ($ + G) / 2, yt = it !== 0 ? p * it / (it + i) : p;
    u = (p - yt) / 2;
  }
  const m = Math.max(1e-3, p * h - e / X) / h, x = (p - m) / 2, v = l + x + u, w = s - x - u, { outerStart: k, outerEnd: M, innerStart: C, innerEnd: b } = lf(t, f, h, w - v), T = h - k, B = h - M, A = v + k / T, D = w - M / B, N = f + C, L = f + b, J = v + C / N, st = w - b / L;
  if (n.beginPath(), o) {
    const $ = (A + D) / 2;
    if (n.arc(a, r, h, A, $), n.arc(a, r, h, $, D), M > 0) {
      const dt = Te(B, D, a, r);
      n.arc(dt.x, dt.y, M, D, w + rt);
    }
    const G = Te(L, w, a, r);
    if (n.lineTo(G.x, G.y), b > 0) {
      const dt = Te(L, st, a, r);
      n.arc(dt.x, dt.y, b, w + rt, st + Math.PI);
    }
    const it = (w - b / f + (v + C / f)) / 2;
    if (n.arc(a, r, f, w - b / f, it, !0), n.arc(a, r, f, it, v + C / f, !0), C > 0) {
      const dt = Te(N, J, a, r);
      n.arc(dt.x, dt.y, C, J + Math.PI, v - rt);
    }
    const yt = Te(T, v, a, r);
    if (n.lineTo(yt.x, yt.y), k > 0) {
      const dt = Te(T, A, a, r);
      n.arc(dt.x, dt.y, k, v - rt, A);
    }
  } else {
    n.moveTo(a, r);
    const $ = Math.cos(A) * h + a, G = Math.sin(A) * h + r;
    n.lineTo($, G);
    const it = Math.cos(D) * h + a, yt = Math.sin(D) * h + r;
    n.lineTo(it, yt);
  }
  n.closePath();
}
function cf(n, t, e, i, s) {
  const { fullCircles: o, startAngle: a, circumference: r } = t;
  let l = t.endAngle;
  if (o) {
    Un(n, t, e, i, l, s);
    for (let c = 0; c < o; ++c)
      n.fill();
    isNaN(r) || (l = a + (r % tt || tt));
  }
  return Un(n, t, e, i, l, s), n.fill(), l;
}
function df(n, t, e, i, s) {
  const { fullCircles: o, startAngle: a, circumference: r, options: l } = t, { borderWidth: c, borderJoinStyle: d, borderDash: h, borderDashOffset: f, borderRadius: u } = l, p = l.borderAlign === "inner";
  if (!c)
    return;
  n.setLineDash(h || []), n.lineDashOffset = f, p ? (n.lineWidth = c * 2, n.lineJoin = d || "round") : (n.lineWidth = c, n.lineJoin = d || "bevel");
  let m = t.endAngle;
  if (o) {
    Un(n, t, e, i, m, s);
    for (let x = 0; x < o; ++x)
      n.stroke();
    isNaN(r) || (m = a + (r % tt || tt));
  }
  p && af(n, t, m), l.selfJoin && m - a >= X && u === 0 && d !== "miter" && of(n, t, m), o || (Un(n, t, e, i, m, s), n.stroke());
}
class Ye extends Ft {
  constructor(e) {
    super();
    P(this, "circumference");
    P(this, "endAngle");
    P(this, "fullCircles");
    P(this, "innerRadius");
    P(this, "outerRadius");
    P(this, "pixelMargin");
    P(this, "startAngle");
    this.options = void 0, this.circumference = void 0, this.startAngle = void 0, this.endAngle = void 0, this.innerRadius = void 0, this.outerRadius = void 0, this.pixelMargin = 0, this.fullCircles = 0, e && Object.assign(this, e);
  }
  inRange(e, i, s) {
    const o = this.getProps([
      "x",
      "y"
    ], s), { angle: a, distance: r } = da(o, {
      x: e,
      y: i
    }), { startAngle: l, endAngle: c, innerRadius: d, outerRadius: h, circumference: f } = this.getProps([
      "startAngle",
      "endAngle",
      "innerRadius",
      "outerRadius",
      "circumference"
    ], s), u = (this.options.spacing + this.options.borderWidth) / 2, p = V(f, c - l), m = nn(a, l, c) && l !== c, x = p >= tt || m, v = Gt(r, d + u, h + u);
    return x && v;
  }
  getCenterPoint(e) {
    const { x: i, y: s, startAngle: o, endAngle: a, innerRadius: r, outerRadius: l } = this.getProps([
      "x",
      "y",
      "startAngle",
      "endAngle",
      "innerRadius",
      "outerRadius"
    ], e), { offset: c, spacing: d } = this.options, h = (o + a) / 2, f = (r + l + d + c) / 2;
    return {
      x: i + Math.cos(h) * f,
      y: s + Math.sin(h) * f
    };
  }
  tooltipPosition(e) {
    return this.getCenterPoint(e);
  }
  draw(e) {
    const { options: i, circumference: s } = this, o = (i.offset || 0) / 4, a = (i.spacing || 0) / 2, r = i.circular;
    if (this.pixelMargin = i.borderAlign === "inner" ? 0.33 : 0, this.fullCircles = s > tt ? Math.floor(s / tt) : 0, s === 0 || this.innerRadius < 0 || this.outerRadius < 0)
      return;
    e.save();
    const l = (this.startAngle + this.endAngle) / 2;
    e.translate(Math.cos(l) * o, Math.sin(l) * o);
    const c = 1 - Math.sin(Math.min(X, s || 0)), d = o * c;
    e.fillStyle = i.backgroundColor, e.strokeStyle = i.borderColor, cf(e, this, d, a, r), df(e, this, d, a, r), e.restore();
  }
}
P(Ye, "id", "arc"), P(Ye, "defaults", {
  borderAlign: "center",
  borderColor: "#fff",
  borderDash: [],
  borderDashOffset: 0,
  borderJoinStyle: void 0,
  borderRadius: 0,
  borderWidth: 2,
  offset: 0,
  spacing: 0,
  angle: void 0,
  circular: !0,
  selfJoin: !1
}), P(Ye, "defaultRoutes", {
  backgroundColor: "backgroundColor"
}), P(Ye, "descriptors", {
  _scriptable: !0,
  _indexable: (e) => e !== "borderDash"
});
function Va(n, t, e = t) {
  n.lineCap = V(e.borderCapStyle, t.borderCapStyle), n.setLineDash(V(e.borderDash, t.borderDash)), n.lineDashOffset = V(e.borderDashOffset, t.borderDashOffset), n.lineJoin = V(e.borderJoinStyle, t.borderJoinStyle), n.lineWidth = V(e.borderWidth, t.borderWidth), n.strokeStyle = V(e.borderColor, t.borderColor);
}
function hf(n, t, e) {
  n.lineTo(e.x, e.y);
}
function ff(n) {
  return n.stepped ? Dc : n.tension || n.cubicInterpolationMode === "monotone" ? Oc : hf;
}
function Wa(n, t, e = {}) {
  const i = n.length, { start: s = 0, end: o = i - 1 } = e, { start: a, end: r } = t, l = Math.max(s, a), c = Math.min(o, r), d = s < a && o < a || s > r && o > r;
  return {
    count: i,
    start: l,
    loop: t.loop,
    ilen: c < l && !d ? i + c - l : c - l
  };
}
function uf(n, t, e, i) {
  const { points: s, options: o } = t, { count: a, start: r, loop: l, ilen: c } = Wa(s, e, i), d = ff(o);
  let { move: h = !0, reverse: f } = i || {}, u, p, m;
  for (u = 0; u <= c; ++u)
    p = s[(r + (f ? c - u : u)) % a], !p.skip && (h ? (n.moveTo(p.x, p.y), h = !1) : d(n, m, p, f, o.stepped), m = p);
  return l && (p = s[(r + (f ? c : 0)) % a], d(n, m, p, f, o.stepped)), !!l;
}
function gf(n, t, e, i) {
  const s = t.points, { count: o, start: a, ilen: r } = Wa(s, e, i), { move: l = !0, reverse: c } = i || {};
  let d = 0, h = 0, f, u, p, m, x, v;
  const w = (M) => (a + (c ? r - M : M)) % o, k = () => {
    m !== x && (n.lineTo(d, x), n.lineTo(d, m), n.lineTo(d, v));
  };
  for (l && (u = s[w(0)], n.moveTo(u.x, u.y)), f = 0; f <= r; ++f) {
    if (u = s[w(f)], u.skip)
      continue;
    const M = u.x, C = u.y, b = M | 0;
    b === p ? (C < m ? m = C : C > x && (x = C), d = (h * d + M) / ++h) : (k(), n.lineTo(M, C), p = b, h = 0, m = x = C), v = C;
  }
  k();
}
function Ii(n) {
  const t = n.options, e = t.borderDash && t.borderDash.length;
  return !n._decimated && !n._loop && !t.tension && t.cubicInterpolationMode !== "monotone" && !t.stepped && !e ? gf : uf;
}
function pf(n) {
  return n.stepped ? ud : n.tension || n.cubicInterpolationMode === "monotone" ? gd : ge;
}
function mf(n, t, e, i) {
  let s = t._path;
  s || (s = t._path = new Path2D(), t.path(s, e, i) && s.closePath()), Va(n, t.options), n.stroke(s);
}
function bf(n, t, e, i) {
  const { segments: s, options: o } = t, a = Ii(t);
  for (const r of s)
    Va(n, o, r.style), n.beginPath(), a(n, t, r, {
      start: e,
      end: e + i - 1
    }) && n.closePath(), n.stroke();
}
const xf = typeof Path2D == "function";
function yf(n, t, e, i) {
  xf && !t.options.segment ? mf(n, t, e, i) : bf(n, t, e, i);
}
class te extends Ft {
  constructor(t) {
    super(), this.animated = !0, this.options = void 0, this._chart = void 0, this._loop = void 0, this._fullLoop = void 0, this._path = void 0, this._points = void 0, this._segments = void 0, this._decimated = !1, this._pointsUpdated = !1, this._datasetIndex = void 0, t && Object.assign(this, t);
  }
  updateControlPoints(t, e) {
    const i = this.options;
    if ((i.tension || i.cubicInterpolationMode === "monotone") && !i.stepped && !this._pointsUpdated) {
      const s = i.spanGaps ? this._loop : this._fullLoop;
      od(this._points, i, t, s, e), this._pointsUpdated = !0;
    }
  }
  set points(t) {
    this._points = t, delete this._segments, delete this._path, this._pointsUpdated = !1;
  }
  get points() {
    return this._points;
  }
  get segments() {
    return this._segments || (this._segments = vd(this, this.options.segment));
  }
  first() {
    const t = this.segments, e = this.points;
    return t.length && e[t[0].start];
  }
  last() {
    const t = this.segments, e = this.points, i = t.length;
    return i && e[t[i - 1].end];
  }
  interpolate(t, e) {
    const i = this.options, s = t[e], o = this.points, a = Ma(this, {
      property: e,
      start: s,
      end: s
    });
    if (!a.length)
      return;
    const r = [], l = pf(i);
    let c, d;
    for (c = 0, d = a.length; c < d; ++c) {
      const { start: h, end: f } = a[c], u = o[h], p = o[f];
      if (u === p) {
        r.push(u);
        continue;
      }
      const m = Math.abs((s - u[e]) / (p[e] - u[e])), x = l(u, p, m, i.stepped);
      x[e] = t[e], r.push(x);
    }
    return r.length === 1 ? r[0] : r;
  }
  pathSegment(t, e, i) {
    return Ii(this)(t, this, e, i);
  }
  path(t, e, i) {
    const s = this.segments, o = Ii(this);
    let a = this._loop;
    e = e || 0, i = i || this.points.length - e;
    for (const r of s)
      a &= o(t, this, r, {
        start: e,
        end: e + i - 1
      });
    return !!a;
  }
  draw(t, e, i, s) {
    const o = this.options || {};
    (this.points || []).length && o.borderWidth && (t.save(), yf(t, this, i, s), t.restore()), this.animated && (this._pointsUpdated = !1, this._path = void 0);
  }
}
P(te, "id", "line"), P(te, "defaults", {
  borderCapStyle: "butt",
  borderDash: [],
  borderDashOffset: 0,
  borderJoinStyle: "miter",
  borderWidth: 3,
  capBezierPoints: !0,
  cubicInterpolationMode: "default",
  fill: !1,
  spanGaps: !1,
  stepped: !1,
  tension: 0
}), P(te, "defaultRoutes", {
  backgroundColor: "backgroundColor",
  borderColor: "borderColor"
}), P(te, "descriptors", {
  _scriptable: !0,
  _indexable: (t) => t !== "borderDash" && t !== "fill"
});
function Ao(n, t, e, i) {
  const s = n.options, { [e]: o } = n.getProps([
    e
  ], i);
  return Math.abs(t - o) < s.radius + s.hitRadius;
}
class Ln extends Ft {
  constructor(e) {
    super();
    P(this, "parsed");
    P(this, "skip");
    P(this, "stop");
    this.options = void 0, this.parsed = void 0, this.skip = void 0, this.stop = void 0, e && Object.assign(this, e);
  }
  inRange(e, i, s) {
    const o = this.options, { x: a, y: r } = this.getProps([
      "x",
      "y"
    ], s);
    return Math.pow(e - a, 2) + Math.pow(i - r, 2) < Math.pow(o.hitRadius + o.radius, 2);
  }
  inXRange(e, i) {
    return Ao(this, e, "x", i);
  }
  inYRange(e, i) {
    return Ao(this, e, "y", i);
  }
  getCenterPoint(e) {
    const { x: i, y: s } = this.getProps([
      "x",
      "y"
    ], e);
    return {
      x: i,
      y: s
    };
  }
  size(e) {
    e = e || this.options || {};
    let i = e.radius || 0;
    i = Math.max(i, i && e.hoverRadius || 0);
    const s = i && e.borderWidth || 0;
    return (i + s) * 2;
  }
  draw(e, i) {
    const s = this.options;
    this.skip || s.radius < 0.1 || !Xt(this, i, this.size(s) / 2) || (e.strokeStyle = s.borderColor, e.lineWidth = s.borderWidth, e.fillStyle = s.backgroundColor, Oi(e, s, this.x, this.y));
  }
  getRange() {
    const e = this.options || {};
    return e.radius + e.hitRadius;
  }
}
P(Ln, "id", "point"), /**
* @type {any}
*/
P(Ln, "defaults", {
  borderWidth: 1,
  hitRadius: 1,
  hoverBorderWidth: 1,
  hoverRadius: 4,
  pointStyle: "circle",
  radius: 3,
  rotation: 0
}), /**
* @type {any}
*/
P(Ln, "defaultRoutes", {
  backgroundColor: "backgroundColor",
  borderColor: "borderColor"
});
function Ha(n, t) {
  const { x: e, y: i, base: s, width: o, height: a } = n.getProps([
    "x",
    "y",
    "base",
    "width",
    "height"
  ], t);
  let r, l, c, d, h;
  return n.horizontal ? (h = a / 2, r = Math.min(e, s), l = Math.max(e, s), c = i - h, d = i + h) : (h = o / 2, r = e - h, l = e + h, c = Math.min(i, s), d = Math.max(i, s)), {
    left: r,
    top: c,
    right: l,
    bottom: d
  };
}
function ee(n, t, e, i) {
  return n ? 0 : bt(t, e, i);
}
function vf(n, t, e) {
  const i = n.options.borderWidth, s = n.borderSkipped, o = ma(i);
  return {
    t: ee(s.top, o.top, 0, e),
    r: ee(s.right, o.right, 0, t),
    b: ee(s.bottom, o.bottom, 0, e),
    l: ee(s.left, o.left, 0, t)
  };
}
function _f(n, t, e) {
  const { enableBorderRadius: i } = n.getProps([
    "enableBorderRadius"
  ]), s = n.options.borderRadius, o = me(s), a = Math.min(t, e), r = n.borderSkipped, l = i || j(s);
  return {
    topLeft: ee(!l || r.top || r.left, o.topLeft, 0, a),
    topRight: ee(!l || r.top || r.right, o.topRight, 0, a),
    bottomLeft: ee(!l || r.bottom || r.left, o.bottomLeft, 0, a),
    bottomRight: ee(!l || r.bottom || r.right, o.bottomRight, 0, a)
  };
}
function wf(n) {
  const t = Ha(n), e = t.right - t.left, i = t.bottom - t.top, s = vf(n, e / 2, i / 2), o = _f(n, e / 2, i / 2);
  return {
    outer: {
      x: t.left,
      y: t.top,
      w: e,
      h: i,
      radius: o
    },
    inner: {
      x: t.left + s.l,
      y: t.top + s.t,
      w: e - s.l - s.r,
      h: i - s.t - s.b,
      radius: {
        topLeft: Math.max(0, o.topLeft - Math.max(s.t, s.l)),
        topRight: Math.max(0, o.topRight - Math.max(s.t, s.r)),
        bottomLeft: Math.max(0, o.bottomLeft - Math.max(s.b, s.l)),
        bottomRight: Math.max(0, o.bottomRight - Math.max(s.b, s.r))
      }
    }
  };
}
function Mi(n, t, e, i) {
  const s = t === null, o = e === null, r = n && !(s && o) && Ha(n, i);
  return r && (s || Gt(t, r.left, r.right)) && (o || Gt(e, r.top, r.bottom));
}
function Sf(n) {
  return n.topLeft || n.topRight || n.bottomLeft || n.bottomRight;
}
function Cf(n, t) {
  n.rect(t.x, t.y, t.w, t.h);
}
function Ti(n, t, e = {}) {
  const i = n.x !== e.x ? -t : 0, s = n.y !== e.y ? -t : 0, o = (n.x + n.w !== e.x + e.w ? t : 0) - i, a = (n.y + n.h !== e.y + e.h ? t : 0) - s;
  return {
    x: n.x + i,
    y: n.y + s,
    w: n.w + o,
    h: n.h + a,
    radius: n.radius
  };
}
class In extends Ft {
  constructor(t) {
    super(), this.options = void 0, this.horizontal = void 0, this.base = void 0, this.width = void 0, this.height = void 0, this.inflateAmount = void 0, t && Object.assign(this, t);
  }
  draw(t) {
    const { inflateAmount: e, options: { borderColor: i, backgroundColor: s } } = this, { inner: o, outer: a } = wf(this), r = Sf(a.radius) ? sn : Cf;
    t.save(), (a.w !== o.w || a.h !== o.h) && (t.beginPath(), r(t, Ti(a, e, o)), t.clip(), r(t, Ti(o, -e, a)), t.fillStyle = i, t.fill("evenodd")), t.beginPath(), r(t, Ti(o, e)), t.fillStyle = s, t.fill(), t.restore();
  }
  inRange(t, e, i) {
    return Mi(this, t, e, i);
  }
  inXRange(t, e) {
    return Mi(this, t, null, e);
  }
  inYRange(t, e) {
    return Mi(this, null, t, e);
  }
  getCenterPoint(t) {
    const { x: e, y: i, base: s, horizontal: o } = this.getProps([
      "x",
      "y",
      "base",
      "horizontal"
    ], t);
    return {
      x: o ? (e + s) / 2 : e,
      y: o ? i : (i + s) / 2
    };
  }
  getRange(t) {
    return t === "x" ? this.width / 2 : this.height / 2;
  }
}
P(In, "id", "bar"), P(In, "defaults", {
  borderSkipped: "start",
  borderWidth: 0,
  borderRadius: 0,
  inflateAmount: "auto",
  pointStyle: void 0
}), P(In, "defaultRoutes", {
  backgroundColor: "backgroundColor",
  borderColor: "borderColor"
});
function kf(n, t, e) {
  const i = n.segments, s = n.points, o = t.points, a = [];
  for (const r of i) {
    let { start: l, end: c } = r;
    c = ti(l, c, s);
    const d = Ei(e, s[l], s[c], r.loop);
    if (!t.segments) {
      a.push({
        source: r,
        target: d,
        start: s[l],
        end: s[c]
      });
      continue;
    }
    const h = Ma(t, d);
    for (const f of h) {
      const u = Ei(e, o[f.start], o[f.end], f.loop), p = ka(r, s, u);
      for (const m of p)
        a.push({
          source: m,
          target: f,
          start: {
            [e]: Fo(d, u, "start", Math.max)
          },
          end: {
            [e]: Fo(d, u, "end", Math.min)
          }
        });
    }
  }
  return a;
}
function Ei(n, t, e, i) {
  if (i)
    return;
  let s = t[n], o = e[n];
  return n === "angle" && (s = mt(s), o = mt(o)), {
    property: n,
    start: s,
    end: o
  };
}
function Mf(n, t) {
  const { x: e = null, y: i = null } = n || {}, s = t.points, o = [];
  return t.segments.forEach(({ start: a, end: r }) => {
    r = ti(a, r, s);
    const l = s[a], c = s[r];
    i !== null ? (o.push({
      x: l.x,
      y: i
    }), o.push({
      x: c.x,
      y: i
    })) : e !== null && (o.push({
      x: e,
      y: l.y
    }), o.push({
      x: e,
      y: c.y
    }));
  }), o;
}
function ti(n, t, e) {
  for (; t > n; t--) {
    const i = e[t];
    if (!isNaN(i.x) && !isNaN(i.y))
      break;
  }
  return t;
}
function Fo(n, t, e, i) {
  return n && t ? i(n[e], t[e]) : n ? n[e] : t ? t[e] : 0;
}
function ja(n, t) {
  let e = [], i = !1;
  return nt(n) ? (i = !0, e = n) : e = Mf(n, t), e.length ? new te({
    points: e,
    options: {
      tension: 0
    },
    _loop: i,
    _fullLoop: i
  }) : null;
}
function Po(n) {
  return n && n.fill !== !1;
}
function Tf(n, t, e) {
  let s = n[t].fill;
  const o = [
    t
  ];
  let a;
  if (!e)
    return s;
  for (; s !== !1 && o.indexOf(s) === -1; ) {
    if (!gt(s))
      return s;
    if (a = n[s], !a)
      return !1;
    if (a.visible)
      return s;
    o.push(s), s = a.fill;
  }
  return !1;
}
function Bf(n, t, e) {
  const i = Nf(n);
  if (j(i))
    return isNaN(i.value) ? !1 : i;
  let s = parseFloat(i);
  return gt(s) && Math.floor(s) === s ? Af(i[0], t, s, e) : [
    "origin",
    "start",
    "end",
    "stack",
    "shape"
  ].indexOf(i) >= 0 && i;
}
function Af(n, t, e, i) {
  return (n === "-" || n === "+") && (e = t + e), e === t || e < 0 || e >= i ? !1 : e;
}
function Ff(n, t) {
  let e = null;
  return n === "start" ? e = t.bottom : n === "end" ? e = t.top : j(n) ? e = t.getPixelForValue(n.value) : t.getBasePixel && (e = t.getBasePixel()), e;
}
function Pf(n, t, e) {
  let i;
  return n === "start" ? i = e : n === "end" ? i = t.options.reverse ? t.min : t.max : j(n) ? i = n.value : i = t.getBaseValue(), i;
}
function Nf(n) {
  const t = n.options, e = t.fill;
  let i = V(e && e.target, e);
  return i === void 0 && (i = !!t.backgroundColor), i === !1 || i === null ? !1 : i === !0 ? "origin" : i;
}
function Df(n) {
  const { scale: t, index: e, line: i } = n, s = [], o = i.segments, a = i.points, r = Of(t, e);
  r.push(ja({
    x: null,
    y: t.bottom
  }, i));
  for (let l = 0; l < o.length; l++) {
    const c = o[l];
    for (let d = c.start; d <= c.end; d++)
      zf(s, a[d], r);
  }
  return new te({
    points: s,
    options: {}
  });
}
function Of(n, t) {
  const e = [], i = n.getMatchingVisibleMetas("line");
  for (let s = 0; s < i.length; s++) {
    const o = i[s];
    if (o.index === t)
      break;
    o.hidden || e.unshift(o.dataset);
  }
  return e;
}
function zf(n, t, e) {
  const i = [];
  for (let s = 0; s < e.length; s++) {
    const o = e[s], { first: a, last: r, point: l } = Rf(o, t, "x");
    if (!(!l || a && r)) {
      if (a)
        i.unshift(l);
      else if (n.push(l), !r)
        break;
    }
  }
  n.push(...i);
}
function Rf(n, t, e) {
  const i = n.interpolate(t, e);
  if (!i)
    return {};
  const s = i[e], o = n.segments, a = n.points;
  let r = !1, l = !1;
  for (let c = 0; c < o.length; c++) {
    const d = o[c], h = a[d.start][e], f = a[d.end][e];
    if (Gt(s, h, f)) {
      r = s === h, l = s === f;
      break;
    }
  }
  return {
    first: r,
    last: l,
    point: i
  };
}
class $a {
  constructor(t) {
    this.x = t.x, this.y = t.y, this.radius = t.radius;
  }
  pathSegment(t, e, i) {
    const { x: s, y: o, radius: a } = this;
    return e = e || {
      start: 0,
      end: tt
    }, t.arc(s, o, a, e.end, e.start, !0), !i.bounds;
  }
  interpolate(t) {
    const { x: e, y: i, radius: s } = this, o = t.angle;
    return {
      x: e + Math.cos(o) * s,
      y: i + Math.sin(o) * s,
      angle: o
    };
  }
}
function Lf(n) {
  const { chart: t, fill: e, line: i } = n;
  if (gt(e))
    return If(t, e);
  if (e === "stack")
    return Df(n);
  if (e === "shape")
    return !0;
  const s = Ef(n);
  return s instanceof $a ? s : ja(s, i);
}
function If(n, t) {
  const e = n.getDatasetMeta(t);
  return e && n.isDatasetVisible(t) ? e.dataset : null;
}
function Ef(n) {
  return (n.scale || {}).getPointPositionForValue ? Wf(n) : Vf(n);
}
function Vf(n) {
  const { scale: t = {}, fill: e } = n, i = Ff(e, t);
  if (gt(i)) {
    const s = t.isHorizontal();
    return {
      x: s ? i : null,
      y: s ? null : i
    };
  }
  return null;
}
function Wf(n) {
  const { scale: t, fill: e } = n, i = t.options, s = t.getLabels().length, o = i.reverse ? t.max : t.min, a = Pf(e, t, o), r = [];
  if (i.grid.circular) {
    const l = t.getPointPositionForValue(0, o);
    return new $a({
      x: l.x,
      y: l.y,
      radius: t.getDistanceFromCenterForValue(a)
    });
  }
  for (let l = 0; l < s; ++l)
    r.push(t.getPointPositionForValue(l, a));
  return r;
}
function Bi(n, t, e) {
  const i = Lf(t), { chart: s, index: o, line: a, scale: r, axis: l } = t, c = a.options, d = c.fill, h = c.backgroundColor, { above: f = h, below: u = h } = d || {}, p = s.getDatasetMeta(o), m = Ta(s, p);
  i && a.points.length && (Kn(n, e), Hf(n, {
    line: a,
    target: i,
    above: f,
    below: u,
    area: e,
    scale: r,
    axis: l,
    clip: m
  }), qn(n));
}
function Hf(n, t) {
  const { line: e, target: i, above: s, below: o, area: a, scale: r, clip: l } = t, c = e._loop ? "angle" : t.axis;
  n.save();
  let d = o;
  o !== s && (c === "x" ? (No(n, i, a.top), Ai(n, {
    line: e,
    target: i,
    color: s,
    scale: r,
    property: c,
    clip: l
  }), n.restore(), n.save(), No(n, i, a.bottom)) : c === "y" && (Do(n, i, a.left), Ai(n, {
    line: e,
    target: i,
    color: o,
    scale: r,
    property: c,
    clip: l
  }), n.restore(), n.save(), Do(n, i, a.right), d = s)), Ai(n, {
    line: e,
    target: i,
    color: d,
    scale: r,
    property: c,
    clip: l
  }), n.restore();
}
function No(n, t, e) {
  const { segments: i, points: s } = t;
  let o = !0, a = !1;
  n.beginPath();
  for (const r of i) {
    const { start: l, end: c } = r, d = s[l], h = s[ti(l, c, s)];
    o ? (n.moveTo(d.x, d.y), o = !1) : (n.lineTo(d.x, e), n.lineTo(d.x, d.y)), a = !!t.pathSegment(n, r, {
      move: a
    }), a ? n.closePath() : n.lineTo(h.x, e);
  }
  n.lineTo(t.first().x, e), n.closePath(), n.clip();
}
function Do(n, t, e) {
  const { segments: i, points: s } = t;
  let o = !0, a = !1;
  n.beginPath();
  for (const r of i) {
    const { start: l, end: c } = r, d = s[l], h = s[ti(l, c, s)];
    o ? (n.moveTo(d.x, d.y), o = !1) : (n.lineTo(e, d.y), n.lineTo(d.x, d.y)), a = !!t.pathSegment(n, r, {
      move: a
    }), a ? n.closePath() : n.lineTo(e, h.y);
  }
  n.lineTo(e, t.first().y), n.closePath(), n.clip();
}
function Ai(n, t) {
  const { line: e, target: i, property: s, color: o, scale: a, clip: r } = t, l = kf(e, i, s);
  for (const { source: c, target: d, start: h, end: f } of l) {
    const { style: { backgroundColor: u = o } = {} } = c, p = i !== !0;
    n.save(), n.fillStyle = u, jf(n, a, r, p && Ei(s, h, f)), n.beginPath();
    const m = !!e.pathSegment(n, c);
    let x;
    if (p) {
      m ? n.closePath() : Oo(n, i, f, s);
      const v = !!i.pathSegment(n, d, {
        move: m,
        reverse: !0
      });
      x = m && v, x || Oo(n, i, h, s);
    }
    n.closePath(), n.fill(x ? "evenodd" : "nonzero"), n.restore();
  }
}
function jf(n, t, e, i) {
  const s = t.chart.chartArea, { property: o, start: a, end: r } = i || {};
  if (o === "x" || o === "y") {
    let l, c, d, h;
    o === "x" ? (l = a, c = s.top, d = r, h = s.bottom) : (l = s.left, c = a, d = s.right, h = r), n.beginPath(), e && (l = Math.max(l, e.left), d = Math.min(d, e.right), c = Math.max(c, e.top), h = Math.min(h, e.bottom)), n.rect(l, c, d - l, h - c), n.clip();
  }
}
function Oo(n, t, e, i) {
  const s = t.interpolate(e, i);
  s && n.lineTo(s.x, s.y);
}
var $f = {
  id: "filler",
  afterDatasetsUpdate(n, t, e) {
    const i = (n.data.datasets || []).length, s = [];
    let o, a, r, l;
    for (a = 0; a < i; ++a)
      o = n.getDatasetMeta(a), r = o.dataset, l = null, r && r.options && r instanceof te && (l = {
        visible: n.isDatasetVisible(a),
        index: a,
        fill: Bf(r, a, i),
        chart: n,
        axis: o.controller.options.indexAxis,
        scale: o.vScale,
        line: r
      }), o.$filler = l, s.push(l);
    for (a = 0; a < i; ++a)
      l = s[a], !(!l || l.fill === !1) && (l.fill = Tf(s, a, e.propagate));
  },
  beforeDraw(n, t, e) {
    const i = e.drawTime === "beforeDraw", s = n.getSortedVisibleDatasetMetas(), o = n.chartArea;
    for (let a = s.length - 1; a >= 0; --a) {
      const r = s[a].$filler;
      r && (r.line.updateControlPoints(o, r.axis), i && r.fill && Bi(n.ctx, r, o));
    }
  },
  beforeDatasetsDraw(n, t, e) {
    if (e.drawTime !== "beforeDatasetsDraw")
      return;
    const i = n.getSortedVisibleDatasetMetas();
    for (let s = i.length - 1; s >= 0; --s) {
      const o = i[s].$filler;
      Po(o) && Bi(n.ctx, o, n.chartArea);
    }
  },
  beforeDatasetDraw(n, t, e) {
    const i = t.meta.$filler;
    !Po(i) || e.drawTime !== "beforeDatasetDraw" || Bi(n.ctx, i, n.chartArea);
  },
  defaults: {
    propagate: !0,
    drawTime: "beforeDatasetDraw"
  }
};
const zo = (n, t) => {
  let { boxHeight: e = t, boxWidth: i = t } = n;
  return n.usePointStyle && (e = Math.min(e, t), i = n.pointStyleWidth || Math.min(i, t)), {
    boxWidth: i,
    boxHeight: e,
    itemHeight: Math.max(t, e)
  };
}, Yf = (n, t) => n !== null && t !== null && n.datasetIndex === t.datasetIndex && n.index === t.index;
class Ro extends Ft {
  constructor(t) {
    super(), this._added = !1, this.legendHitBoxes = [], this._hoveredItem = null, this.doughnutMode = !1, this.chart = t.chart, this.options = t.options, this.ctx = t.ctx, this.legendItems = void 0, this.columnSizes = void 0, this.lineWidths = void 0, this.maxHeight = void 0, this.maxWidth = void 0, this.top = void 0, this.bottom = void 0, this.left = void 0, this.right = void 0, this.height = void 0, this.width = void 0, this._margins = void 0, this.position = void 0, this.weight = void 0, this.fullSize = void 0;
  }
  update(t, e, i) {
    this.maxWidth = t, this.maxHeight = e, this._margins = i, this.setDimensions(), this.buildLabels(), this.fit();
  }
  setDimensions() {
    this.isHorizontal() ? (this.width = this.maxWidth, this.left = this._margins.left, this.right = this.width) : (this.height = this.maxHeight, this.top = this._margins.top, this.bottom = this.height);
  }
  buildLabels() {
    const t = this.options.labels || {};
    let e = Q(t.generateLabels, [
      this.chart
    ], this) || [];
    t.filter && (e = e.filter((i) => t.filter(i, this.chart.data))), t.sort && (e = e.sort((i, s) => t.sort(i, s, this.chart.data))), this.options.reverse && e.reverse(), this.legendItems = e;
  }
  fit() {
    const { options: t, ctx: e } = this;
    if (!t.display) {
      this.width = this.height = 0;
      return;
    }
    const i = t.labels, s = ht(i.font), o = s.size, a = this._computeTitleHeight(), { boxWidth: r, itemHeight: l } = zo(i, o);
    let c, d;
    e.font = s.string, this.isHorizontal() ? (c = this.maxWidth, d = this._fitRows(a, o, r, l) + 10) : (d = this.maxHeight, c = this._fitCols(a, s, r, l) + 10), this.width = Math.min(c, t.maxWidth || this.maxWidth), this.height = Math.min(d, t.maxHeight || this.maxHeight);
  }
  _fitRows(t, e, i, s) {
    const { ctx: o, maxWidth: a, options: { labels: { padding: r } } } = this, l = this.legendHitBoxes = [], c = this.lineWidths = [
      0
    ], d = s + r;
    let h = t;
    o.textAlign = "left", o.textBaseline = "middle";
    let f = -1, u = -d;
    return this.legendItems.forEach((p, m) => {
      const x = i + e / 2 + o.measureText(p.text).width;
      (m === 0 || c[c.length - 1] + x + 2 * r > a) && (h += d, c[c.length - (m > 0 ? 0 : 1)] = 0, u += d, f++), l[m] = {
        left: 0,
        top: u,
        row: f,
        width: x,
        height: s
      }, c[c.length - 1] += x + r;
    }), h;
  }
  _fitCols(t, e, i, s) {
    const { ctx: o, maxHeight: a, options: { labels: { padding: r } } } = this, l = this.legendHitBoxes = [], c = this.columnSizes = [], d = a - t;
    let h = r, f = 0, u = 0, p = 0, m = 0;
    return this.legendItems.forEach((x, v) => {
      const { itemWidth: w, itemHeight: k } = Uf(i, e, o, x, s);
      v > 0 && u + k + 2 * r > d && (h += f + r, c.push({
        width: f,
        height: u
      }), p += f + r, m++, f = u = 0), l[v] = {
        left: p,
        top: u,
        col: m,
        width: w,
        height: k
      }, f = Math.max(f, w), u += k + r;
    }), h += f, c.push({
      width: f,
      height: u
    }), h;
  }
  adjustHitBoxes() {
    if (!this.options.display)
      return;
    const t = this._computeTitleHeight(), { legendHitBoxes: e, options: { align: i, labels: { padding: s }, rtl: o } } = this, a = Ae(o, this.left, this.width);
    if (this.isHorizontal()) {
      let r = 0, l = pt(i, this.left + s, this.right - this.lineWidths[r]);
      for (const c of e)
        r !== c.row && (r = c.row, l = pt(i, this.left + s, this.right - this.lineWidths[r])), c.top += this.top + t + s, c.left = a.leftForLtr(a.x(l), c.width), l += c.width + s;
    } else {
      let r = 0, l = pt(i, this.top + t + s, this.bottom - this.columnSizes[r].height);
      for (const c of e)
        c.col !== r && (r = c.col, l = pt(i, this.top + t + s, this.bottom - this.columnSizes[r].height)), c.top = l, c.left += this.left + s, c.left = a.leftForLtr(a.x(c.left), c.width), l += c.height + s;
    }
  }
  isHorizontal() {
    return this.options.position === "top" || this.options.position === "bottom";
  }
  draw() {
    if (this.options.display) {
      const t = this.ctx;
      Kn(t, this), this._draw(), qn(t);
    }
  }
  _draw() {
    const { options: t, columnSizes: e, lineWidths: i, ctx: s } = this, { align: o, labels: a } = t, r = ot.color, l = Ae(t.rtl, this.left, this.width), c = ht(a.font), { padding: d } = a, h = c.size, f = h / 2;
    let u;
    this.drawTitle(), s.textAlign = l.textAlign("left"), s.textBaseline = "middle", s.lineWidth = 0.5, s.font = c.string;
    const { boxWidth: p, boxHeight: m, itemHeight: x } = zo(a, h), v = function(b, T, B) {
      if (isNaN(p) || p <= 0 || isNaN(m) || m < 0)
        return;
      s.save();
      const A = V(B.lineWidth, 1);
      if (s.fillStyle = V(B.fillStyle, r), s.lineCap = V(B.lineCap, "butt"), s.lineDashOffset = V(B.lineDashOffset, 0), s.lineJoin = V(B.lineJoin, "miter"), s.lineWidth = A, s.strokeStyle = V(B.strokeStyle, r), s.setLineDash(V(B.lineDash, [])), a.usePointStyle) {
        const D = {
          radius: m * Math.SQRT2 / 2,
          pointStyle: B.pointStyle,
          rotation: B.rotation,
          borderWidth: A
        }, N = l.xPlus(b, p / 2), L = T + f;
        pa(s, D, N, L, a.pointStyleWidth && p);
      } else {
        const D = T + Math.max((h - m) / 2, 0), N = l.leftForLtr(b, p), L = me(B.borderRadius);
        s.beginPath(), Object.values(L).some((J) => J !== 0) ? sn(s, {
          x: N,
          y: D,
          w: p,
          h: m,
          radius: L
        }) : s.rect(N, D, p, m), s.fill(), A !== 0 && s.stroke();
      }
      s.restore();
    }, w = function(b, T, B) {
      ye(s, B.text, b, T + x / 2, c, {
        strikethrough: B.hidden,
        textAlign: l.textAlign(B.textAlign)
      });
    }, k = this.isHorizontal(), M = this._computeTitleHeight();
    k ? u = {
      x: pt(o, this.left + d, this.right - i[0]),
      y: this.top + d + M,
      line: 0
    } : u = {
      x: this.left + d,
      y: pt(o, this.top + M + d, this.bottom - e[0].height),
      line: 0
    }, wa(this.ctx, t.textDirection);
    const C = x + d;
    this.legendItems.forEach((b, T) => {
      s.strokeStyle = b.fontColor, s.fillStyle = b.fontColor;
      const B = s.measureText(b.text).width, A = l.textAlign(b.textAlign || (b.textAlign = a.textAlign)), D = p + f + B;
      let N = u.x, L = u.y;
      l.setWidth(this.width), k ? T > 0 && N + D + d > this.right && (L = u.y += C, u.line++, N = u.x = pt(o, this.left + d, this.right - i[u.line])) : T > 0 && L + C > this.bottom && (N = u.x = N + e[u.line].width + d, u.line++, L = u.y = pt(o, this.top + M + d, this.bottom - e[u.line].height));
      const J = l.x(N);
      if (v(J, L, b), N = yc(A, N + p + f, k ? N + D : this.right, t.rtl), w(l.x(N), L, b), k)
        u.x += D + d;
      else if (typeof b.text != "string") {
        const st = c.lineHeight;
        u.y += Ya(b, st) + d;
      } else
        u.y += C;
    }), Sa(this.ctx, t.textDirection);
  }
  drawTitle() {
    const t = this.options, e = t.title, i = ht(e.font), s = xt(e.padding);
    if (!e.display)
      return;
    const o = Ae(t.rtl, this.left, this.width), a = this.ctx, r = e.position, l = i.size / 2, c = s.top + l;
    let d, h = this.left, f = this.width;
    if (this.isHorizontal())
      f = Math.max(...this.lineWidths), d = this.top + c, h = pt(t.align, h, this.right - f);
    else {
      const p = this.columnSizes.reduce((m, x) => Math.max(m, x.height), 0);
      d = c + pt(t.align, this.top, this.bottom - p - t.labels.padding - this._computeTitleHeight());
    }
    const u = pt(r, h, h + f);
    a.textAlign = o.textAlign(Zi(r)), a.textBaseline = "middle", a.strokeStyle = e.color, a.fillStyle = e.color, a.font = i.string, ye(a, e.text, u, d, i);
  }
  _computeTitleHeight() {
    const t = this.options.title, e = ht(t.font), i = xt(t.padding);
    return t.display ? e.lineHeight + i.height : 0;
  }
  _getLegendItemAt(t, e) {
    let i, s, o;
    if (Gt(t, this.left, this.right) && Gt(e, this.top, this.bottom)) {
      for (o = this.legendHitBoxes, i = 0; i < o.length; ++i)
        if (s = o[i], Gt(t, s.left, s.left + s.width) && Gt(e, s.top, s.top + s.height))
          return this.legendItems[i];
    }
    return null;
  }
  handleEvent(t) {
    const e = this.options;
    if (!Kf(t.type, e))
      return;
    const i = this._getLegendItemAt(t.x, t.y);
    if (t.type === "mousemove" || t.type === "mouseout") {
      const s = this._hoveredItem, o = Yf(s, i);
      s && !o && Q(e.onLeave, [
        t,
        s,
        this
      ], this), this._hoveredItem = i, i && !o && Q(e.onHover, [
        t,
        i,
        this
      ], this);
    } else i && Q(e.onClick, [
      t,
      i,
      this
    ], this);
  }
}
function Uf(n, t, e, i, s) {
  const o = Gf(i, n, t, e), a = Xf(s, i, t.lineHeight);
  return {
    itemWidth: o,
    itemHeight: a
  };
}
function Gf(n, t, e, i) {
  let s = n.text;
  return s && typeof s != "string" && (s = s.reduce((o, a) => o.length > a.length ? o : a)), t + e.size / 2 + i.measureText(s).width;
}
function Xf(n, t, e) {
  let i = n;
  return typeof t.text != "string" && (i = Ya(t, e)), i;
}
function Ya(n, t) {
  const e = n.text ? n.text.length : 0;
  return t * e;
}
function Kf(n, t) {
  return !!((n === "mousemove" || n === "mouseout") && (t.onHover || t.onLeave) || t.onClick && (n === "click" || n === "mouseup"));
}
var qf = {
  id: "legend",
  _element: Ro,
  start(n, t, e) {
    const i = n.legend = new Ro({
      ctx: n.ctx,
      options: e,
      chart: n
    });
    Tt.configure(n, i, e), Tt.addBox(n, i);
  },
  stop(n) {
    Tt.removeBox(n, n.legend), delete n.legend;
  },
  beforeUpdate(n, t, e) {
    const i = n.legend;
    Tt.configure(n, i, e), i.options = e;
  },
  afterUpdate(n) {
    const t = n.legend;
    t.buildLabels(), t.adjustHitBoxes();
  },
  afterEvent(n, t) {
    t.replay || n.legend.handleEvent(t.event);
  },
  defaults: {
    display: !0,
    position: "top",
    align: "center",
    fullSize: !0,
    reverse: !1,
    weight: 1e3,
    onClick(n, t, e) {
      const i = t.datasetIndex, s = e.chart;
      s.isDatasetVisible(i) ? (s.hide(i), t.hidden = !0) : (s.show(i), t.hidden = !1);
    },
    onHover: null,
    onLeave: null,
    labels: {
      color: (n) => n.chart.options.color,
      boxWidth: 40,
      padding: 10,
      generateLabels(n) {
        const t = n.data.datasets, { labels: { usePointStyle: e, pointStyle: i, textAlign: s, color: o, useBorderRadius: a, borderRadius: r } } = n.legend.options;
        return n._getSortedDatasetMetas().map((l) => {
          const c = l.controller.getStyle(e ? 0 : void 0), d = xt(c.borderWidth);
          return {
            text: t[l.index].label,
            fillStyle: c.backgroundColor,
            fontColor: o,
            hidden: !l.visible,
            lineCap: c.borderCapStyle,
            lineDash: c.borderDash,
            lineDashOffset: c.borderDashOffset,
            lineJoin: c.borderJoinStyle,
            lineWidth: (d.width + d.height) / 4,
            strokeStyle: c.borderColor,
            pointStyle: i || c.pointStyle,
            rotation: c.rotation,
            textAlign: s || c.textAlign,
            borderRadius: a && (r || c.borderRadius),
            datasetIndex: l.index
          };
        }, this);
      }
    },
    title: {
      color: (n) => n.chart.options.color,
      display: !1,
      position: "center",
      text: ""
    }
  },
  descriptors: {
    _scriptable: (n) => !n.startsWith("on"),
    labels: {
      _scriptable: (n) => ![
        "generateLabels",
        "filter",
        "sort"
      ].includes(n)
    }
  }
};
class Ua extends Ft {
  constructor(t) {
    super(), this.chart = t.chart, this.options = t.options, this.ctx = t.ctx, this._padding = void 0, this.top = void 0, this.bottom = void 0, this.left = void 0, this.right = void 0, this.width = void 0, this.height = void 0, this.position = void 0, this.weight = void 0, this.fullSize = void 0;
  }
  update(t, e) {
    const i = this.options;
    if (this.left = 0, this.top = 0, !i.display) {
      this.width = this.height = this.right = this.bottom = 0;
      return;
    }
    this.width = this.right = t, this.height = this.bottom = e;
    const s = nt(i.text) ? i.text.length : 1;
    this._padding = xt(i.padding);
    const o = s * ht(i.font).lineHeight + this._padding.height;
    this.isHorizontal() ? this.height = o : this.width = o;
  }
  isHorizontal() {
    const t = this.options.position;
    return t === "top" || t === "bottom";
  }
  _drawArgs(t) {
    const { top: e, left: i, bottom: s, right: o, options: a } = this, r = a.align;
    let l = 0, c, d, h;
    return this.isHorizontal() ? (d = pt(r, i, o), h = e + t, c = o - i) : (a.position === "left" ? (d = i + t, h = pt(r, s, e), l = X * -0.5) : (d = o - t, h = pt(r, e, s), l = X * 0.5), c = s - e), {
      titleX: d,
      titleY: h,
      maxWidth: c,
      rotation: l
    };
  }
  draw() {
    const t = this.ctx, e = this.options;
    if (!e.display)
      return;
    const i = ht(e.font), o = i.lineHeight / 2 + this._padding.top, { titleX: a, titleY: r, maxWidth: l, rotation: c } = this._drawArgs(o);
    ye(t, e.text, 0, 0, i, {
      color: e.color,
      maxWidth: l,
      rotation: c,
      textAlign: Zi(e.align),
      textBaseline: "middle",
      translation: [
        a,
        r
      ]
    });
  }
}
function Jf(n, t) {
  const e = new Ua({
    ctx: n.ctx,
    options: t,
    chart: n
  });
  Tt.configure(n, e, t), Tt.addBox(n, e), n.titleBlock = e;
}
var Zf = {
  id: "title",
  _element: Ua,
  start(n, t, e) {
    Jf(n, e);
  },
  stop(n) {
    const t = n.titleBlock;
    Tt.removeBox(n, t), delete n.titleBlock;
  },
  beforeUpdate(n, t, e) {
    const i = n.titleBlock;
    Tt.configure(n, i, e), i.options = e;
  },
  defaults: {
    align: "center",
    display: !1,
    font: {
      weight: "bold"
    },
    fullSize: !0,
    padding: 10,
    position: "top",
    text: "",
    weight: 2e3
  },
  defaultRoutes: {
    color: "color"
  },
  descriptors: {
    _scriptable: !0,
    _indexable: !1
  }
};
const Ue = {
  average(n) {
    if (!n.length)
      return !1;
    let t, e, i = /* @__PURE__ */ new Set(), s = 0, o = 0;
    for (t = 0, e = n.length; t < e; ++t) {
      const r = n[t].element;
      if (r && r.hasValue()) {
        const l = r.tooltipPosition();
        i.add(l.x), s += l.y, ++o;
      }
    }
    return o === 0 || i.size === 0 ? !1 : {
      x: [
        ...i
      ].reduce((r, l) => r + l) / i.size,
      y: s / o
    };
  },
  nearest(n, t) {
    if (!n.length)
      return !1;
    let e = t.x, i = t.y, s = Number.POSITIVE_INFINITY, o, a, r;
    for (o = 0, a = n.length; o < a; ++o) {
      const l = n[o].element;
      if (l && l.hasValue()) {
        const c = l.getCenterPoint(), d = Ni(t, c);
        d < s && (s = d, r = l);
      }
    }
    if (r) {
      const l = r.tooltipPosition();
      e = l.x, i = l.y;
    }
    return {
      x: e,
      y: i
    };
  }
};
function zt(n, t) {
  return t && (nt(t) ? Array.prototype.push.apply(n, t) : n.push(t)), n;
}
function $t(n) {
  return (typeof n == "string" || n instanceof String) && n.indexOf(`
`) > -1 ? n.split(`
`) : n;
}
function Qf(n, t) {
  const { element: e, datasetIndex: i, index: s } = t, o = n.getDatasetMeta(i).controller, { label: a, value: r } = o.getLabelAndValue(s);
  return {
    chart: n,
    label: a,
    parsed: o.getParsed(s),
    raw: n.data.datasets[i].data[s],
    formattedValue: r,
    dataset: o.getDataset(),
    dataIndex: s,
    datasetIndex: i,
    element: e
  };
}
function Lo(n, t) {
  const e = n.chart.ctx, { body: i, footer: s, title: o } = n, { boxWidth: a, boxHeight: r } = t, l = ht(t.bodyFont), c = ht(t.titleFont), d = ht(t.footerFont), h = o.length, f = s.length, u = i.length, p = xt(t.padding);
  let m = p.height, x = 0, v = i.reduce((M, C) => M + C.before.length + C.lines.length + C.after.length, 0);
  if (v += n.beforeBody.length + n.afterBody.length, h && (m += h * c.lineHeight + (h - 1) * t.titleSpacing + t.titleMarginBottom), v) {
    const M = t.displayColors ? Math.max(r, l.lineHeight) : l.lineHeight;
    m += u * M + (v - u) * l.lineHeight + (v - 1) * t.bodySpacing;
  }
  f && (m += t.footerMarginTop + f * d.lineHeight + (f - 1) * t.footerSpacing);
  let w = 0;
  const k = function(M) {
    x = Math.max(x, e.measureText(M).width + w);
  };
  return e.save(), e.font = c.string, q(n.title, k), e.font = l.string, q(n.beforeBody.concat(n.afterBody), k), w = t.displayColors ? a + 2 + t.boxPadding : 0, q(i, (M) => {
    q(M.before, k), q(M.lines, k), q(M.after, k);
  }), w = 0, e.font = d.string, q(n.footer, k), e.restore(), x += p.width, {
    width: x,
    height: m
  };
}
function tu(n, t) {
  const { y: e, height: i } = t;
  return e < i / 2 ? "top" : e > n.height - i / 2 ? "bottom" : "center";
}
function eu(n, t, e, i) {
  const { x: s, width: o } = i, a = e.caretSize + e.caretPadding;
  if (n === "left" && s + o + a > t.width || n === "right" && s - o - a < 0)
    return !0;
}
function nu(n, t, e, i) {
  const { x: s, width: o } = e, { width: a, chartArea: { left: r, right: l } } = n;
  let c = "center";
  return i === "center" ? c = s <= (r + l) / 2 ? "left" : "right" : s <= o / 2 ? c = "left" : s >= a - o / 2 && (c = "right"), eu(c, n, t, e) && (c = "center"), c;
}
function Io(n, t, e) {
  const i = e.yAlign || t.yAlign || tu(n, e);
  return {
    xAlign: e.xAlign || t.xAlign || nu(n, t, e, i),
    yAlign: i
  };
}
function iu(n, t) {
  let { x: e, width: i } = n;
  return t === "right" ? e -= i : t === "center" && (e -= i / 2), e;
}
function su(n, t, e) {
  let { y: i, height: s } = n;
  return t === "top" ? i += e : t === "bottom" ? i -= s + e : i -= s / 2, i;
}
function Eo(n, t, e, i) {
  const { caretSize: s, caretPadding: o, cornerRadius: a } = n, { xAlign: r, yAlign: l } = e, c = s + o, { topLeft: d, topRight: h, bottomLeft: f, bottomRight: u } = me(a);
  let p = iu(t, r);
  const m = su(t, l, c);
  return l === "center" ? r === "left" ? p += c : r === "right" && (p -= c) : r === "left" ? p -= Math.max(d, f) + s : r === "right" && (p += Math.max(h, u) + s), {
    x: bt(p, 0, i.width - t.width),
    y: bt(m, 0, i.height - t.height)
  };
}
function Bn(n, t, e) {
  const i = xt(e.padding);
  return t === "center" ? n.x + n.width / 2 : t === "right" ? n.x + n.width - i.right : n.x + i.left;
}
function Vo(n) {
  return zt([], $t(n));
}
function ou(n, t, e) {
  return re(n, {
    tooltip: t,
    tooltipItems: e,
    type: "tooltip"
  });
}
function Wo(n, t) {
  const e = t && t.dataset && t.dataset.tooltip && t.dataset.tooltip.callbacks;
  return e ? n.override(e) : n;
}
const Ga = {
  beforeTitle: Ht,
  title(n) {
    if (n.length > 0) {
      const t = n[0], e = t.chart.data.labels, i = e ? e.length : 0;
      if (this && this.options && this.options.mode === "dataset")
        return t.dataset.label || "";
      if (t.label)
        return t.label;
      if (i > 0 && t.dataIndex < i)
        return e[t.dataIndex];
    }
    return "";
  },
  afterTitle: Ht,
  beforeBody: Ht,
  beforeLabel: Ht,
  label(n) {
    if (this && this.options && this.options.mode === "dataset")
      return n.label + ": " + n.formattedValue || n.formattedValue;
    let t = n.dataset.label || "";
    t && (t += ": ");
    const e = n.formattedValue;
    return U(e) || (t += e), t;
  },
  labelColor(n) {
    const e = n.chart.getDatasetMeta(n.datasetIndex).controller.getStyle(n.dataIndex);
    return {
      borderColor: e.borderColor,
      backgroundColor: e.backgroundColor,
      borderWidth: e.borderWidth,
      borderDash: e.borderDash,
      borderDashOffset: e.borderDashOffset,
      borderRadius: 0
    };
  },
  labelTextColor() {
    return this.options.bodyColor;
  },
  labelPointStyle(n) {
    const e = n.chart.getDatasetMeta(n.datasetIndex).controller.getStyle(n.dataIndex);
    return {
      pointStyle: e.pointStyle,
      rotation: e.rotation
    };
  },
  afterLabel: Ht,
  afterBody: Ht,
  beforeFooter: Ht,
  footer: Ht,
  afterFooter: Ht
};
function wt(n, t, e, i) {
  const s = n[t].call(e, i);
  return typeof s > "u" ? Ga[t].call(e, i) : s;
}
class Vi extends Ft {
  constructor(t) {
    super(), this.opacity = 0, this._active = [], this._eventPosition = void 0, this._size = void 0, this._cachedAnimations = void 0, this._tooltipItems = [], this.$animations = void 0, this.$context = void 0, this.chart = t.chart, this.options = t.options, this.dataPoints = void 0, this.title = void 0, this.beforeBody = void 0, this.body = void 0, this.afterBody = void 0, this.footer = void 0, this.xAlign = void 0, this.yAlign = void 0, this.x = void 0, this.y = void 0, this.height = void 0, this.width = void 0, this.caretX = void 0, this.caretY = void 0, this.labelColors = void 0, this.labelPointStyles = void 0, this.labelTextColors = void 0;
  }
  initialize(t) {
    this.options = t, this._cachedAnimations = void 0, this.$context = void 0;
  }
  _resolveAnimations() {
    const t = this._cachedAnimations;
    if (t)
      return t;
    const e = this.chart, i = this.options.setContext(this.getContext()), s = i.enabled && e.options.animation && i.animations, o = new Ba(this.chart, s);
    return s._cacheable && (this._cachedAnimations = Object.freeze(o)), o;
  }
  getContext() {
    return this.$context || (this.$context = ou(this.chart.getContext(), this, this._tooltipItems));
  }
  getTitle(t, e) {
    const { callbacks: i } = e, s = wt(i, "beforeTitle", this, t), o = wt(i, "title", this, t), a = wt(i, "afterTitle", this, t);
    let r = [];
    return r = zt(r, $t(s)), r = zt(r, $t(o)), r = zt(r, $t(a)), r;
  }
  getBeforeBody(t, e) {
    return Vo(wt(e.callbacks, "beforeBody", this, t));
  }
  getBody(t, e) {
    const { callbacks: i } = e, s = [];
    return q(t, (o) => {
      const a = {
        before: [],
        lines: [],
        after: []
      }, r = Wo(i, o);
      zt(a.before, $t(wt(r, "beforeLabel", this, o))), zt(a.lines, wt(r, "label", this, o)), zt(a.after, $t(wt(r, "afterLabel", this, o))), s.push(a);
    }), s;
  }
  getAfterBody(t, e) {
    return Vo(wt(e.callbacks, "afterBody", this, t));
  }
  getFooter(t, e) {
    const { callbacks: i } = e, s = wt(i, "beforeFooter", this, t), o = wt(i, "footer", this, t), a = wt(i, "afterFooter", this, t);
    let r = [];
    return r = zt(r, $t(s)), r = zt(r, $t(o)), r = zt(r, $t(a)), r;
  }
  _createItems(t) {
    const e = this._active, i = this.chart.data, s = [], o = [], a = [];
    let r = [], l, c;
    for (l = 0, c = e.length; l < c; ++l)
      r.push(Qf(this.chart, e[l]));
    return t.filter && (r = r.filter((d, h, f) => t.filter(d, h, f, i))), t.itemSort && (r = r.sort((d, h) => t.itemSort(d, h, i))), q(r, (d) => {
      const h = Wo(t.callbacks, d);
      s.push(wt(h, "labelColor", this, d)), o.push(wt(h, "labelPointStyle", this, d)), a.push(wt(h, "labelTextColor", this, d));
    }), this.labelColors = s, this.labelPointStyles = o, this.labelTextColors = a, this.dataPoints = r, r;
  }
  update(t, e) {
    const i = this.options.setContext(this.getContext()), s = this._active;
    let o, a = [];
    if (!s.length)
      this.opacity !== 0 && (o = {
        opacity: 0
      });
    else {
      const r = Ue[i.position].call(this, s, this._eventPosition);
      a = this._createItems(i), this.title = this.getTitle(a, i), this.beforeBody = this.getBeforeBody(a, i), this.body = this.getBody(a, i), this.afterBody = this.getAfterBody(a, i), this.footer = this.getFooter(a, i);
      const l = this._size = Lo(this, i), c = Object.assign({}, r, l), d = Io(this.chart, i, c), h = Eo(i, c, d, this.chart);
      this.xAlign = d.xAlign, this.yAlign = d.yAlign, o = {
        opacity: 1,
        x: h.x,
        y: h.y,
        width: l.width,
        height: l.height,
        caretX: r.x,
        caretY: r.y
      };
    }
    this._tooltipItems = a, this.$context = void 0, o && this._resolveAnimations().update(this, o), t && i.external && i.external.call(this, {
      chart: this.chart,
      tooltip: this,
      replay: e
    });
  }
  drawCaret(t, e, i, s) {
    const o = this.getCaretPosition(t, i, s);
    e.lineTo(o.x1, o.y1), e.lineTo(o.x2, o.y2), e.lineTo(o.x3, o.y3);
  }
  getCaretPosition(t, e, i) {
    const { xAlign: s, yAlign: o } = this, { caretSize: a, cornerRadius: r } = i, { topLeft: l, topRight: c, bottomLeft: d, bottomRight: h } = me(r), { x: f, y: u } = t, { width: p, height: m } = e;
    let x, v, w, k, M, C;
    return o === "center" ? (M = u + m / 2, s === "left" ? (x = f, v = x - a, k = M + a, C = M - a) : (x = f + p, v = x + a, k = M - a, C = M + a), w = x) : (s === "left" ? v = f + Math.max(l, d) + a : s === "right" ? v = f + p - Math.max(c, h) - a : v = this.caretX, o === "top" ? (k = u, M = k - a, x = v - a, w = v + a) : (k = u + m, M = k + a, x = v + a, w = v - a), C = k), {
      x1: x,
      x2: v,
      x3: w,
      y1: k,
      y2: M,
      y3: C
    };
  }
  drawTitle(t, e, i) {
    const s = this.title, o = s.length;
    let a, r, l;
    if (o) {
      const c = Ae(i.rtl, this.x, this.width);
      for (t.x = Bn(this, i.titleAlign, i), e.textAlign = c.textAlign(i.titleAlign), e.textBaseline = "middle", a = ht(i.titleFont), r = i.titleSpacing, e.fillStyle = i.titleColor, e.font = a.string, l = 0; l < o; ++l)
        e.fillText(s[l], c.x(t.x), t.y + a.lineHeight / 2), t.y += a.lineHeight + r, l + 1 === o && (t.y += i.titleMarginBottom - r);
    }
  }
  _drawColorBox(t, e, i, s, o) {
    const a = this.labelColors[i], r = this.labelPointStyles[i], { boxHeight: l, boxWidth: c } = o, d = ht(o.bodyFont), h = Bn(this, "left", o), f = s.x(h), u = l < d.lineHeight ? (d.lineHeight - l) / 2 : 0, p = e.y + u;
    if (o.usePointStyle) {
      const m = {
        radius: Math.min(c, l) / 2,
        pointStyle: r.pointStyle,
        rotation: r.rotation,
        borderWidth: 1
      }, x = s.leftForLtr(f, c) + c / 2, v = p + l / 2;
      t.strokeStyle = o.multiKeyBackground, t.fillStyle = o.multiKeyBackground, Oi(t, m, x, v), t.strokeStyle = a.borderColor, t.fillStyle = a.backgroundColor, Oi(t, m, x, v);
    } else {
      t.lineWidth = j(a.borderWidth) ? Math.max(...Object.values(a.borderWidth)) : a.borderWidth || 1, t.strokeStyle = a.borderColor, t.setLineDash(a.borderDash || []), t.lineDashOffset = a.borderDashOffset || 0;
      const m = s.leftForLtr(f, c), x = s.leftForLtr(s.xPlus(f, 1), c - 2), v = me(a.borderRadius);
      Object.values(v).some((w) => w !== 0) ? (t.beginPath(), t.fillStyle = o.multiKeyBackground, sn(t, {
        x: m,
        y: p,
        w: c,
        h: l,
        radius: v
      }), t.fill(), t.stroke(), t.fillStyle = a.backgroundColor, t.beginPath(), sn(t, {
        x,
        y: p + 1,
        w: c - 2,
        h: l - 2,
        radius: v
      }), t.fill()) : (t.fillStyle = o.multiKeyBackground, t.fillRect(m, p, c, l), t.strokeRect(m, p, c, l), t.fillStyle = a.backgroundColor, t.fillRect(x, p + 1, c - 2, l - 2));
    }
    t.fillStyle = this.labelTextColors[i];
  }
  drawBody(t, e, i) {
    const { body: s } = this, { bodySpacing: o, bodyAlign: a, displayColors: r, boxHeight: l, boxWidth: c, boxPadding: d } = i, h = ht(i.bodyFont);
    let f = h.lineHeight, u = 0;
    const p = Ae(i.rtl, this.x, this.width), m = function(B) {
      e.fillText(B, p.x(t.x + u), t.y + f / 2), t.y += f + o;
    }, x = p.textAlign(a);
    let v, w, k, M, C, b, T;
    for (e.textAlign = a, e.textBaseline = "middle", e.font = h.string, t.x = Bn(this, x, i), e.fillStyle = i.bodyColor, q(this.beforeBody, m), u = r && x !== "right" ? a === "center" ? c / 2 + d : c + 2 + d : 0, M = 0, b = s.length; M < b; ++M) {
      for (v = s[M], w = this.labelTextColors[M], e.fillStyle = w, q(v.before, m), k = v.lines, r && k.length && (this._drawColorBox(e, t, M, p, i), f = Math.max(h.lineHeight, l)), C = 0, T = k.length; C < T; ++C)
        m(k[C]), f = h.lineHeight;
      q(v.after, m);
    }
    u = 0, f = h.lineHeight, q(this.afterBody, m), t.y -= o;
  }
  drawFooter(t, e, i) {
    const s = this.footer, o = s.length;
    let a, r;
    if (o) {
      const l = Ae(i.rtl, this.x, this.width);
      for (t.x = Bn(this, i.footerAlign, i), t.y += i.footerMarginTop, e.textAlign = l.textAlign(i.footerAlign), e.textBaseline = "middle", a = ht(i.footerFont), e.fillStyle = i.footerColor, e.font = a.string, r = 0; r < o; ++r)
        e.fillText(s[r], l.x(t.x), t.y + a.lineHeight / 2), t.y += a.lineHeight + i.footerSpacing;
    }
  }
  drawBackground(t, e, i, s) {
    const { xAlign: o, yAlign: a } = this, { x: r, y: l } = t, { width: c, height: d } = i, { topLeft: h, topRight: f, bottomLeft: u, bottomRight: p } = me(s.cornerRadius);
    e.fillStyle = s.backgroundColor, e.strokeStyle = s.borderColor, e.lineWidth = s.borderWidth, e.beginPath(), e.moveTo(r + h, l), a === "top" && this.drawCaret(t, e, i, s), e.lineTo(r + c - f, l), e.quadraticCurveTo(r + c, l, r + c, l + f), a === "center" && o === "right" && this.drawCaret(t, e, i, s), e.lineTo(r + c, l + d - p), e.quadraticCurveTo(r + c, l + d, r + c - p, l + d), a === "bottom" && this.drawCaret(t, e, i, s), e.lineTo(r + u, l + d), e.quadraticCurveTo(r, l + d, r, l + d - u), a === "center" && o === "left" && this.drawCaret(t, e, i, s), e.lineTo(r, l + h), e.quadraticCurveTo(r, l, r + h, l), e.closePath(), e.fill(), s.borderWidth > 0 && e.stroke();
  }
  _updateAnimationTarget(t) {
    const e = this.chart, i = this.$animations, s = i && i.x, o = i && i.y;
    if (s || o) {
      const a = Ue[t.position].call(this, this._active, this._eventPosition);
      if (!a)
        return;
      const r = this._size = Lo(this, t), l = Object.assign({}, a, this._size), c = Io(e, t, l), d = Eo(t, l, c, e);
      (s._to !== d.x || o._to !== d.y) && (this.xAlign = c.xAlign, this.yAlign = c.yAlign, this.width = r.width, this.height = r.height, this.caretX = a.x, this.caretY = a.y, this._resolveAnimations().update(this, d));
    }
  }
  _willRender() {
    return !!this.opacity;
  }
  draw(t) {
    const e = this.options.setContext(this.getContext());
    let i = this.opacity;
    if (!i)
      return;
    this._updateAnimationTarget(e);
    const s = {
      width: this.width,
      height: this.height
    }, o = {
      x: this.x,
      y: this.y
    };
    i = Math.abs(i) < 1e-3 ? 0 : i;
    const a = xt(e.padding), r = this.title.length || this.beforeBody.length || this.body.length || this.afterBody.length || this.footer.length;
    e.enabled && r && (t.save(), t.globalAlpha = i, this.drawBackground(o, t, s, e), wa(t, e.textDirection), o.y += a.top, this.drawTitle(o, t, e), this.drawBody(o, t, e), this.drawFooter(o, t, e), Sa(t, e.textDirection), t.restore());
  }
  getActiveElements() {
    return this._active || [];
  }
  setActiveElements(t, e) {
    const i = this._active, s = t.map(({ datasetIndex: r, index: l }) => {
      const c = this.chart.getDatasetMeta(r);
      if (!c)
        throw new Error("Cannot find a dataset at index " + r);
      return {
        datasetIndex: r,
        element: c.data[l],
        index: l
      };
    }), o = !Vn(i, s), a = this._positionChanged(s, e);
    (o || a) && (this._active = s, this._eventPosition = e, this._ignoreReplayEvents = !0, this.update(!0));
  }
  handleEvent(t, e, i = !0) {
    if (e && this._ignoreReplayEvents)
      return !1;
    this._ignoreReplayEvents = !1;
    const s = this.options, o = this._active || [], a = this._getActiveElements(t, o, e, i), r = this._positionChanged(a, t), l = e || !Vn(a, o) || r;
    return l && (this._active = a, (s.enabled || s.external) && (this._eventPosition = {
      x: t.x,
      y: t.y
    }, this.update(!0, e))), l;
  }
  _getActiveElements(t, e, i, s) {
    const o = this.options;
    if (t.type === "mouseout")
      return [];
    if (!s)
      return e.filter((r) => this.chart.data.datasets[r.datasetIndex] && this.chart.getDatasetMeta(r.datasetIndex).controller.getParsed(r.index) !== void 0);
    const a = this.chart.getElementsAtEventForMode(t, o.mode, o, i);
    return o.reverse && a.reverse(), a;
  }
  _positionChanged(t, e) {
    const { caretX: i, caretY: s, options: o } = this, a = Ue[o.position].call(this, t, e);
    return a !== !1 && (i !== a.x || s !== a.y);
  }
}
P(Vi, "positioners", Ue);
var au = {
  id: "tooltip",
  _element: Vi,
  positioners: Ue,
  afterInit(n, t, e) {
    e && (n.tooltip = new Vi({
      chart: n,
      options: e
    }));
  },
  beforeUpdate(n, t, e) {
    n.tooltip && n.tooltip.initialize(e);
  },
  reset(n, t, e) {
    n.tooltip && n.tooltip.initialize(e);
  },
  afterDraw(n) {
    const t = n.tooltip;
    if (t && t._willRender()) {
      const e = {
        tooltip: t
      };
      if (n.notifyPlugins("beforeTooltipDraw", {
        ...e,
        cancelable: !0
      }) === !1)
        return;
      t.draw(n.ctx), n.notifyPlugins("afterTooltipDraw", e);
    }
  },
  afterEvent(n, t) {
    if (n.tooltip) {
      const e = t.replay;
      n.tooltip.handleEvent(t.event, e, t.inChartArea) && (t.changed = !0);
    }
  },
  defaults: {
    enabled: !0,
    external: null,
    position: "average",
    backgroundColor: "rgba(0,0,0,0.8)",
    titleColor: "#fff",
    titleFont: {
      weight: "bold"
    },
    titleSpacing: 2,
    titleMarginBottom: 6,
    titleAlign: "left",
    bodyColor: "#fff",
    bodySpacing: 2,
    bodyFont: {},
    bodyAlign: "left",
    footerColor: "#fff",
    footerSpacing: 2,
    footerMarginTop: 6,
    footerFont: {
      weight: "bold"
    },
    footerAlign: "left",
    padding: 6,
    caretPadding: 2,
    caretSize: 5,
    cornerRadius: 6,
    boxHeight: (n, t) => t.bodyFont.size,
    boxWidth: (n, t) => t.bodyFont.size,
    multiKeyBackground: "#fff",
    displayColors: !0,
    boxPadding: 0,
    borderColor: "rgba(0,0,0,0)",
    borderWidth: 0,
    animation: {
      duration: 400,
      easing: "easeOutQuart"
    },
    animations: {
      numbers: {
        type: "number",
        properties: [
          "x",
          "y",
          "width",
          "height",
          "caretX",
          "caretY"
        ]
      },
      opacity: {
        easing: "linear",
        duration: 200
      }
    },
    callbacks: Ga
  },
  defaultRoutes: {
    bodyFont: "font",
    footerFont: "font",
    titleFont: "font"
  },
  descriptors: {
    _scriptable: (n) => n !== "filter" && n !== "itemSort" && n !== "external",
    _indexable: !1,
    callbacks: {
      _scriptable: !1,
      _indexable: !1
    },
    animation: {
      _fallback: !1
    },
    animations: {
      _fallback: "animation"
    }
  },
  additionalOptionScopes: [
    "interaction"
  ]
};
const ru = (n, t, e, i) => (typeof t == "string" ? (e = n.push(t) - 1, i.unshift({
  index: e,
  label: t
})) : isNaN(t) && (e = null), e);
function lu(n, t, e, i) {
  const s = n.indexOf(t);
  if (s === -1)
    return ru(n, t, e, i);
  const o = n.lastIndexOf(t);
  return s !== o ? e : s;
}
const cu = (n, t) => n === null ? null : bt(Math.round(n), 0, t);
function Ho(n) {
  const t = this.getLabels();
  return n >= 0 && n < t.length ? t[n] : n;
}
class Wi extends Ne {
  constructor(t) {
    super(t), this._startValue = void 0, this._valueRange = 0, this._addedLabels = [];
  }
  init(t) {
    const e = this._addedLabels;
    if (e.length) {
      const i = this.getLabels();
      for (const { index: s, label: o } of e)
        i[s] === o && i.splice(s, 1);
      this._addedLabels = [];
    }
    super.init(t);
  }
  parse(t, e) {
    if (U(t))
      return null;
    const i = this.getLabels();
    return e = isFinite(e) && i[e] === t ? e : lu(i, t, V(e, t), this._addedLabels), cu(e, i.length - 1);
  }
  determineDataLimits() {
    const { minDefined: t, maxDefined: e } = this.getUserBounds();
    let { min: i, max: s } = this.getMinMax(!0);
    this.options.bounds === "ticks" && (t || (i = 0), e || (s = this.getLabels().length - 1)), this.min = i, this.max = s;
  }
  buildTicks() {
    const t = this.min, e = this.max, i = this.options.offset, s = [];
    let o = this.getLabels();
    o = t === 0 && e === o.length - 1 ? o : o.slice(t, e + 1), this._valueRange = Math.max(o.length - (i ? 0 : 1), 1), this._startValue = this.min - (i ? 0.5 : 0);
    for (let a = t; a <= e; a++)
      s.push({
        value: a
      });
    return s;
  }
  getLabelForValue(t) {
    return Ho.call(this, t);
  }
  configure() {
    super.configure(), this.isHorizontal() || (this._reversePixels = !this._reversePixels);
  }
  getPixelForValue(t) {
    return typeof t != "number" && (t = this.parse(t)), t === null ? NaN : this.getPixelForDecimal((t - this._startValue) / this._valueRange);
  }
  getPixelForTick(t) {
    const e = this.ticks;
    return t < 0 || t > e.length - 1 ? null : this.getPixelForValue(e[t].value);
  }
  getValueForPixel(t) {
    return Math.round(this._startValue + this.getDecimalForPixel(t) * this._valueRange);
  }
  getBasePixel() {
    return this.bottom;
  }
}
P(Wi, "id", "category"), P(Wi, "defaults", {
  ticks: {
    callback: Ho
  }
});
function du(n, t) {
  const e = [], { bounds: s, step: o, min: a, max: r, precision: l, count: c, maxTicks: d, maxDigits: h, includeBounds: f } = n, u = o || 1, p = d - 1, { min: m, max: x } = t, v = !U(a), w = !U(r), k = !U(c), M = (x - m) / (h + 1);
  let C = Es((x - m) / p / u) * u, b, T, B, A;
  if (C < 1e-14 && !v && !w)
    return [
      {
        value: m
      },
      {
        value: x
      }
    ];
  A = Math.ceil(x / C) - Math.floor(m / C), A > p && (C = Es(A * C / p / u) * u), U(l) || (b = Math.pow(10, l), C = Math.ceil(C * b) / b), s === "ticks" ? (T = Math.floor(m / C) * C, B = Math.ceil(x / C) * C) : (T = m, B = x), v && w && o && hc((r - a) / o, C / 1e3) ? (A = Math.round(Math.min((r - a) / C, d)), C = (r - a) / A, T = a, B = r) : k ? (T = v ? a : T, B = w ? r : B, A = c - 1, C = (B - T) / A) : (A = (B - T) / C, Ke(A, Math.round(A), C / 1e3) ? A = Math.round(A) : A = Math.ceil(A));
  const D = Math.max(Vs(C), Vs(T));
  b = Math.pow(10, U(l) ? D : l), T = Math.round(T * b) / b, B = Math.round(B * b) / b;
  let N = 0;
  for (v && (f && T !== a ? (e.push({
    value: a
  }), T < a && N++, Ke(Math.round((T + N * C) * b) / b, a, jo(a, M, n)) && N++) : T < a && N++); N < A; ++N) {
    const L = Math.round((T + N * C) * b) / b;
    if (w && L > r)
      break;
    e.push({
      value: L
    });
  }
  return w && f && B !== r ? e.length && Ke(e[e.length - 1].value, r, jo(r, M, n)) ? e[e.length - 1].value = r : e.push({
    value: r
  }) : (!w || B === r) && e.push({
    value: B
  }), e;
}
function jo(n, t, { horizontal: e, minRotation: i }) {
  const s = Lt(i), o = (e ? Math.sin(s) : Math.cos(s)) || 1e-3, a = 0.75 * t * ("" + n).length;
  return Math.min(t / o, a);
}
class Hi extends Ne {
  constructor(t) {
    super(t), this.start = void 0, this.end = void 0, this._startValue = void 0, this._endValue = void 0, this._valueRange = 0;
  }
  parse(t, e) {
    return U(t) || (typeof t == "number" || t instanceof Number) && !isFinite(+t) ? null : +t;
  }
  handleTickRangeOptions() {
    const { beginAtZero: t } = this.options, { minDefined: e, maxDefined: i } = this.getUserBounds();
    let { min: s, max: o } = this;
    const a = (l) => s = e ? s : l, r = (l) => o = i ? o : l;
    if (t) {
      const l = It(s), c = It(o);
      l < 0 && c < 0 ? r(0) : l > 0 && c > 0 && a(0);
    }
    if (s === o) {
      let l = o === 0 ? 1 : Math.abs(o * 0.05);
      r(o + l), t || a(s - l);
    }
    this.min = s, this.max = o;
  }
  getTickLimit() {
    const t = this.options.ticks;
    let { maxTicksLimit: e, stepSize: i } = t, s;
    return i ? (s = Math.ceil(this.max / i) - Math.floor(this.min / i) + 1, s > 1e3 && (console.warn(`scales.${this.id}.ticks.stepSize: ${i} would result generating up to ${s} ticks. Limiting to 1000.`), s = 1e3)) : (s = this.computeTickLimit(), e = e || 11), e && (s = Math.min(e, s)), s;
  }
  computeTickLimit() {
    return Number.POSITIVE_INFINITY;
  }
  buildTicks() {
    const t = this.options, e = t.ticks;
    let i = this.getTickLimit();
    i = Math.max(2, i);
    const s = {
      maxTicks: i,
      bounds: t.bounds,
      min: t.min,
      max: t.max,
      precision: e.precision,
      step: e.stepSize,
      count: e.count,
      maxDigits: this._maxDigits(),
      horizontal: this.isHorizontal(),
      minRotation: e.minRotation || 0,
      includeBounds: e.includeBounds !== !1
    }, o = this._range || this, a = du(s, o);
    return t.bounds === "ticks" && fc(a, this, "value"), t.reverse ? (a.reverse(), this.start = this.max, this.end = this.min) : (this.start = this.min, this.end = this.max), a;
  }
  configure() {
    const t = this.ticks;
    let e = this.min, i = this.max;
    if (super.configure(), this.options.offset && t.length) {
      const s = (i - e) / Math.max(t.length - 1, 1) / 2;
      e -= s, i += s;
    }
    this._startValue = e, this._endValue = i, this._valueRange = i - e;
  }
  getLabelForValue(t) {
    return ts(t, this.chart.options.locale, this.options.ticks.format);
  }
}
class ji extends Hi {
  determineDataLimits() {
    const { min: t, max: e } = this.getMinMax(!0);
    this.min = gt(t) ? t : 0, this.max = gt(e) ? e : 1, this.handleTickRangeOptions();
  }
  computeTickLimit() {
    const t = this.isHorizontal(), e = t ? this.width : this.height, i = Lt(this.options.ticks.minRotation), s = (t ? Math.sin(i) : Math.cos(i)) || 1e-3, o = this._resolveTickFontOptions(0);
    return Math.ceil(e / Math.min(40, o.lineHeight / s));
  }
  getPixelForValue(t) {
    return t === null ? NaN : this.getPixelForDecimal((t - this._startValue) / this._valueRange);
  }
  getValueForPixel(t) {
    return this._startValue + this.getDecimalForPixel(t) * this._valueRange;
  }
}
P(ji, "id", "linear"), P(ji, "defaults", {
  ticks: {
    callback: es.formatters.numeric
  }
});
function $i(n) {
  const t = n.ticks;
  if (t.display && n.display) {
    const e = xt(t.backdropPadding);
    return V(t.font && t.font.size, ot.font.size) + e.height;
  }
  return 0;
}
function hu(n, t, e) {
  return e = nt(e) ? e : [
    e
  ], {
    w: Nc(n, t.string, e),
    h: e.length * t.lineHeight
  };
}
function $o(n, t, e, i, s) {
  return n === i || n === s ? {
    start: t - e / 2,
    end: t + e / 2
  } : n < i || n > s ? {
    start: t - e,
    end: t
  } : {
    start: t,
    end: t + e
  };
}
function fu(n) {
  const t = {
    l: n.left + n._padding.left,
    r: n.right - n._padding.right,
    t: n.top + n._padding.top,
    b: n.bottom - n._padding.bottom
  }, e = Object.assign({}, t), i = [], s = [], o = n._pointLabels.length, a = n.options.pointLabels, r = a.centerPointLabels ? X / o : 0;
  for (let l = 0; l < o; l++) {
    const c = a.setContext(n.getPointLabelContext(l));
    s[l] = c.padding;
    const d = n.getPointPosition(l, n.drawingArea + s[l], r), h = ht(c.font), f = hu(n.ctx, h, n._pointLabels[l]);
    i[l] = f;
    const u = mt(n.getIndexAngle(l) + r), p = Math.round(qi(u)), m = $o(p, d.x, f.w, 0, 180), x = $o(p, d.y, f.h, 90, 270);
    uu(e, t, u, m, x);
  }
  n.setCenterPoint(t.l - e.l, e.r - t.r, t.t - e.t, e.b - t.b), n._pointLabelItems = mu(n, i, s);
}
function uu(n, t, e, i, s) {
  const o = Math.abs(Math.sin(e)), a = Math.abs(Math.cos(e));
  let r = 0, l = 0;
  i.start < t.l ? (r = (t.l - i.start) / o, n.l = Math.min(n.l, t.l - r)) : i.end > t.r && (r = (i.end - t.r) / o, n.r = Math.max(n.r, t.r + r)), s.start < t.t ? (l = (t.t - s.start) / a, n.t = Math.min(n.t, t.t - l)) : s.end > t.b && (l = (s.end - t.b) / a, n.b = Math.max(n.b, t.b + l));
}
function gu(n, t, e) {
  const i = n.drawingArea, { extra: s, additionalAngle: o, padding: a, size: r } = e, l = n.getPointPosition(t, i + s + a, o), c = Math.round(qi(mt(l.angle + rt))), d = yu(l.y, r.h, c), h = bu(c), f = xu(l.x, r.w, h);
  return {
    visible: !0,
    x: l.x,
    y: d,
    textAlign: h,
    left: f,
    top: d,
    right: f + r.w,
    bottom: d + r.h
  };
}
function pu(n, t) {
  if (!t)
    return !0;
  const { left: e, top: i, right: s, bottom: o } = n;
  return !(Xt({
    x: e,
    y: i
  }, t) || Xt({
    x: e,
    y: o
  }, t) || Xt({
    x: s,
    y: i
  }, t) || Xt({
    x: s,
    y: o
  }, t));
}
function mu(n, t, e) {
  const i = [], s = n._pointLabels.length, o = n.options, { centerPointLabels: a, display: r } = o.pointLabels, l = {
    extra: $i(o) / 2,
    additionalAngle: a ? X / s : 0
  };
  let c;
  for (let d = 0; d < s; d++) {
    l.padding = e[d], l.size = t[d];
    const h = gu(n, d, l);
    i.push(h), r === "auto" && (h.visible = pu(h, c), h.visible && (c = h));
  }
  return i;
}
function bu(n) {
  return n === 0 || n === 180 ? "center" : n < 180 ? "left" : "right";
}
function xu(n, t, e) {
  return e === "right" ? n -= t : e === "center" && (n -= t / 2), n;
}
function yu(n, t, e) {
  return e === 90 || e === 270 ? n -= t / 2 : (e > 270 || e < 90) && (n -= t), n;
}
function vu(n, t, e) {
  const { left: i, top: s, right: o, bottom: a } = e, { backdropColor: r } = t;
  if (!U(r)) {
    const l = me(t.borderRadius), c = xt(t.backdropPadding);
    n.fillStyle = r;
    const d = i - c.left, h = s - c.top, f = o - i + c.width, u = a - s + c.height;
    Object.values(l).some((p) => p !== 0) ? (n.beginPath(), sn(n, {
      x: d,
      y: h,
      w: f,
      h: u,
      radius: l
    }), n.fill()) : n.fillRect(d, h, f, u);
  }
}
function _u(n, t) {
  const { ctx: e, options: { pointLabels: i } } = n;
  for (let s = t - 1; s >= 0; s--) {
    const o = n._pointLabelItems[s];
    if (!o.visible)
      continue;
    const a = i.setContext(n.getPointLabelContext(s));
    vu(e, a, o);
    const r = ht(a.font), { x: l, y: c, textAlign: d } = o;
    ye(e, n._pointLabels[s], l, c + r.lineHeight / 2, r, {
      color: a.color,
      textAlign: d,
      textBaseline: "middle"
    });
  }
}
function Xa(n, t, e, i) {
  const { ctx: s } = n;
  if (e)
    s.arc(n.xCenter, n.yCenter, t, 0, tt);
  else {
    let o = n.getPointPosition(0, t);
    s.moveTo(o.x, o.y);
    for (let a = 1; a < i; a++)
      o = n.getPointPosition(a, t), s.lineTo(o.x, o.y);
  }
}
function wu(n, t, e, i, s) {
  const o = n.ctx, a = t.circular, { color: r, lineWidth: l } = t;
  !a && !i || !r || !l || e < 0 || (o.save(), o.strokeStyle = r, o.lineWidth = l, o.setLineDash(s.dash || []), o.lineDashOffset = s.dashOffset, o.beginPath(), Xa(n, e, a, i), o.closePath(), o.stroke(), o.restore());
}
function Su(n, t, e) {
  return re(n, {
    label: e,
    index: t,
    type: "pointLabel"
  });
}
class Ge extends Hi {
  constructor(t) {
    super(t), this.xCenter = void 0, this.yCenter = void 0, this.drawingArea = void 0, this._pointLabels = [], this._pointLabelItems = [];
  }
  setDimensions() {
    const t = this._padding = xt($i(this.options) / 2), e = this.width = this.maxWidth - t.width, i = this.height = this.maxHeight - t.height;
    this.xCenter = Math.floor(this.left + e / 2 + t.left), this.yCenter = Math.floor(this.top + i / 2 + t.top), this.drawingArea = Math.floor(Math.min(e, i) / 2);
  }
  determineDataLimits() {
    const { min: t, max: e } = this.getMinMax(!1);
    this.min = gt(t) && !isNaN(t) ? t : 0, this.max = gt(e) && !isNaN(e) ? e : 0, this.handleTickRangeOptions();
  }
  computeTickLimit() {
    return Math.ceil(this.drawingArea / $i(this.options));
  }
  generateTickLabels(t) {
    Hi.prototype.generateTickLabels.call(this, t), this._pointLabels = this.getLabels().map((e, i) => {
      const s = Q(this.options.pointLabels.callback, [
        e,
        i
      ], this);
      return s || s === 0 ? s : "";
    }).filter((e, i) => this.chart.getDataVisibility(i));
  }
  fit() {
    const t = this.options;
    t.display && t.pointLabels.display ? fu(this) : this.setCenterPoint(0, 0, 0, 0);
  }
  setCenterPoint(t, e, i, s) {
    this.xCenter += Math.floor((t - e) / 2), this.yCenter += Math.floor((i - s) / 2), this.drawingArea -= Math.min(this.drawingArea / 2, Math.max(t, e, i, s));
  }
  getIndexAngle(t) {
    const e = tt / (this._pointLabels.length || 1), i = this.options.startAngle || 0;
    return mt(t * e + Lt(i));
  }
  getDistanceFromCenterForValue(t) {
    if (U(t))
      return NaN;
    const e = this.drawingArea / (this.max - this.min);
    return this.options.reverse ? (this.max - t) * e : (t - this.min) * e;
  }
  getValueForDistanceFromCenter(t) {
    if (U(t))
      return NaN;
    const e = t / (this.drawingArea / (this.max - this.min));
    return this.options.reverse ? this.max - e : this.min + e;
  }
  getPointLabelContext(t) {
    const e = this._pointLabels || [];
    if (t >= 0 && t < e.length) {
      const i = e[t];
      return Su(this.getContext(), t, i);
    }
  }
  getPointPosition(t, e, i = 0) {
    const s = this.getIndexAngle(t) - rt + i;
    return {
      x: Math.cos(s) * e + this.xCenter,
      y: Math.sin(s) * e + this.yCenter,
      angle: s
    };
  }
  getPointPositionForValue(t, e) {
    return this.getPointPosition(t, this.getDistanceFromCenterForValue(e));
  }
  getBasePosition(t) {
    return this.getPointPositionForValue(t || 0, this.getBaseValue());
  }
  getPointLabelPosition(t) {
    const { left: e, top: i, right: s, bottom: o } = this._pointLabelItems[t];
    return {
      left: e,
      top: i,
      right: s,
      bottom: o
    };
  }
  drawBackground() {
    const { backgroundColor: t, grid: { circular: e } } = this.options;
    if (t) {
      const i = this.ctx;
      i.save(), i.beginPath(), Xa(this, this.getDistanceFromCenterForValue(this._endValue), e, this._pointLabels.length), i.closePath(), i.fillStyle = t, i.fill(), i.restore();
    }
  }
  drawGrid() {
    const t = this.ctx, e = this.options, { angleLines: i, grid: s, border: o } = e, a = this._pointLabels.length;
    let r, l, c;
    if (e.pointLabels.display && _u(this, a), s.display && this.ticks.forEach((d, h) => {
      if (h !== 0 || h === 0 && this.min < 0) {
        l = this.getDistanceFromCenterForValue(d.value);
        const f = this.getContext(h), u = s.setContext(f), p = o.setContext(f);
        wu(this, u, l, a, p);
      }
    }), i.display) {
      for (t.save(), r = a - 1; r >= 0; r--) {
        const d = i.setContext(this.getPointLabelContext(r)), { color: h, lineWidth: f } = d;
        !f || !h || (t.lineWidth = f, t.strokeStyle = h, t.setLineDash(d.borderDash), t.lineDashOffset = d.borderDashOffset, l = this.getDistanceFromCenterForValue(e.reverse ? this.min : this.max), c = this.getPointPosition(r, l), t.beginPath(), t.moveTo(this.xCenter, this.yCenter), t.lineTo(c.x, c.y), t.stroke());
      }
      t.restore();
    }
  }
  drawBorder() {
  }
  drawLabels() {
    const t = this.ctx, e = this.options, i = e.ticks;
    if (!i.display)
      return;
    const s = this.getIndexAngle(0);
    let o, a;
    t.save(), t.translate(this.xCenter, this.yCenter), t.rotate(s), t.textAlign = "center", t.textBaseline = "middle", this.ticks.forEach((r, l) => {
      if (l === 0 && this.min >= 0 && !e.reverse)
        return;
      const c = i.setContext(this.getContext(l)), d = ht(c.font);
      if (o = this.getDistanceFromCenterForValue(this.ticks[l].value), c.showLabelBackdrop) {
        t.font = d.string, a = t.measureText(r.label).width, t.fillStyle = c.backdropColor;
        const h = xt(c.backdropPadding);
        t.fillRect(-a / 2 - h.left, -o - d.size / 2 - h.top, a + h.width, d.size + h.height);
      }
      ye(t, r.label, 0, -o, d, {
        color: c.color,
        strokeColor: c.textStrokeColor,
        strokeWidth: c.textStrokeWidth
      });
    }), t.restore();
  }
  drawTitle() {
  }
}
P(Ge, "id", "radialLinear"), P(Ge, "defaults", {
  display: !0,
  animate: !0,
  position: "chartArea",
  angleLines: {
    display: !0,
    lineWidth: 1,
    borderDash: [],
    borderDashOffset: 0
  },
  grid: {
    circular: !1
  },
  startAngle: 0,
  ticks: {
    showLabelBackdrop: !0,
    callback: es.formatters.numeric
  },
  pointLabels: {
    backdropColor: void 0,
    backdropPadding: 2,
    display: !0,
    font: {
      size: 10
    },
    callback(t) {
      return t;
    },
    padding: 5,
    centerPointLabels: !1
  }
}), P(Ge, "defaultRoutes", {
  "angleLines.color": "borderColor",
  "pointLabels.color": "color",
  "ticks.color": "color"
}), P(Ge, "descriptors", {
  angleLines: {
    _fallback: "grid"
  }
});
const ei = {
  millisecond: {
    common: !0,
    size: 1,
    steps: 1e3
  },
  second: {
    common: !0,
    size: 1e3,
    steps: 60
  },
  minute: {
    common: !0,
    size: 6e4,
    steps: 60
  },
  hour: {
    common: !0,
    size: 36e5,
    steps: 24
  },
  day: {
    common: !0,
    size: 864e5,
    steps: 30
  },
  week: {
    common: !1,
    size: 6048e5,
    steps: 4
  },
  month: {
    common: !0,
    size: 2628e6,
    steps: 12
  },
  quarter: {
    common: !1,
    size: 7884e6,
    steps: 4
  },
  year: {
    common: !0,
    size: 3154e7
  }
}, St = /* @__PURE__ */ Object.keys(ei);
function Yo(n, t) {
  return n - t;
}
function Uo(n, t) {
  if (U(t))
    return null;
  const e = n._adapter, { parser: i, round: s, isoWeekday: o } = n._parseOpts;
  let a = t;
  return typeof i == "function" && (a = i(a)), gt(a) || (a = typeof i == "string" ? e.parse(a, i) : e.parse(a)), a === null ? null : (s && (a = s === "week" && (en(o) || o === !0) ? e.startOf(a, "isoWeek", o) : e.startOf(a, s)), +a);
}
function Go(n, t, e, i) {
  const s = St.length;
  for (let o = St.indexOf(n); o < s - 1; ++o) {
    const a = ei[St[o]], r = a.steps ? a.steps : Number.MAX_SAFE_INTEGER;
    if (a.common && Math.ceil((e - t) / (r * a.size)) <= i)
      return St[o];
  }
  return St[s - 1];
}
function Cu(n, t, e, i, s) {
  for (let o = St.length - 1; o >= St.indexOf(e); o--) {
    const a = St[o];
    if (ei[a].common && n._adapter.diff(s, i, a) >= t - 1)
      return a;
  }
  return St[e ? St.indexOf(e) : 0];
}
function ku(n) {
  for (let t = St.indexOf(n) + 1, e = St.length; t < e; ++t)
    if (ei[St[t]].common)
      return St[t];
}
function Xo(n, t, e) {
  if (!e)
    n[t] = !0;
  else if (e.length) {
    const { lo: i, hi: s } = Ji(e, t), o = e[i] >= t ? e[i] : e[s];
    n[o] = !0;
  }
}
function Mu(n, t, e, i) {
  const s = n._adapter, o = +s.startOf(t[0].value, i), a = t[t.length - 1].value;
  let r, l;
  for (r = o; r <= a; r = +s.add(r, 1, i))
    l = e[r], l >= 0 && (t[l].major = !0);
  return t;
}
function Ko(n, t, e) {
  const i = [], s = {}, o = t.length;
  let a, r;
  for (a = 0; a < o; ++a)
    r = t[a], s[r] = a, i.push({
      value: r,
      major: !1
    });
  return o === 0 || !e ? i : Mu(n, i, s, e);
}
class Gn extends Ne {
  constructor(t) {
    super(t), this._cache = {
      data: [],
      labels: [],
      all: []
    }, this._unit = "day", this._majorUnit = void 0, this._offsets = {}, this._normalized = !1, this._parseOpts = void 0;
  }
  init(t, e = {}) {
    const i = t.time || (t.time = {}), s = this._adapter = new Kd._date(t.adapters.date);
    s.init(e), Xe(i.displayFormats, s.formats()), this._parseOpts = {
      parser: i.parser,
      round: i.round,
      isoWeekday: i.isoWeekday
    }, super.init(t), this._normalized = e.normalized;
  }
  parse(t, e) {
    return t === void 0 ? null : Uo(this, t);
  }
  beforeLayout() {
    super.beforeLayout(), this._cache = {
      data: [],
      labels: [],
      all: []
    };
  }
  determineDataLimits() {
    const t = this.options, e = this._adapter, i = t.time.unit || "day";
    let { min: s, max: o, minDefined: a, maxDefined: r } = this.getUserBounds();
    function l(c) {
      !a && !isNaN(c.min) && (s = Math.min(s, c.min)), !r && !isNaN(c.max) && (o = Math.max(o, c.max));
    }
    (!a || !r) && (l(this._getLabelBounds()), (t.bounds !== "ticks" || t.ticks.source !== "labels") && l(this.getMinMax(!1))), s = gt(s) && !isNaN(s) ? s : +e.startOf(Date.now(), i), o = gt(o) && !isNaN(o) ? o : +e.endOf(Date.now(), i) + 1, this.min = Math.min(s, o - 1), this.max = Math.max(s + 1, o);
  }
  _getLabelBounds() {
    const t = this.getLabelTimestamps();
    let e = Number.POSITIVE_INFINITY, i = Number.NEGATIVE_INFINITY;
    return t.length && (e = t[0], i = t[t.length - 1]), {
      min: e,
      max: i
    };
  }
  buildTicks() {
    const t = this.options, e = t.time, i = t.ticks, s = i.source === "labels" ? this.getLabelTimestamps() : this._generate();
    t.bounds === "ticks" && s.length && (this.min = this._userMin || s[0], this.max = this._userMax || s[s.length - 1]);
    const o = this.min, a = this.max, r = mc(s, o, a);
    return this._unit = e.unit || (i.autoSkip ? Go(e.minUnit, this.min, this.max, this._getLabelCapacity(o)) : Cu(this, r.length, e.minUnit, this.min, this.max)), this._majorUnit = !i.major.enabled || this._unit === "year" ? void 0 : ku(this._unit), this.initOffsets(s), t.reverse && r.reverse(), Ko(this, r, this._majorUnit);
  }
  afterAutoSkip() {
    this.options.offsetAfterAutoskip && this.initOffsets(this.ticks.map((t) => +t.value));
  }
  initOffsets(t = []) {
    let e = 0, i = 0, s, o;
    this.options.offset && t.length && (s = this.getDecimalForValue(t[0]), t.length === 1 ? e = 1 - s : e = (this.getDecimalForValue(t[1]) - s) / 2, o = this.getDecimalForValue(t[t.length - 1]), t.length === 1 ? i = o : i = (o - this.getDecimalForValue(t[t.length - 2])) / 2);
    const a = t.length < 3 ? 0.5 : 0.25;
    e = bt(e, 0, a), i = bt(i, 0, a), this._offsets = {
      start: e,
      end: i,
      factor: 1 / (e + 1 + i)
    };
  }
  _generate() {
    const t = this._adapter, e = this.min, i = this.max, s = this.options, o = s.time, a = o.unit || Go(o.minUnit, e, i, this._getLabelCapacity(e)), r = V(s.ticks.stepSize, 1), l = a === "week" ? o.isoWeekday : !1, c = en(l) || l === !0, d = {};
    let h = e, f, u;
    if (c && (h = +t.startOf(h, "isoWeek", l)), h = +t.startOf(h, c ? "day" : a), t.diff(i, e, a) > 1e5 * r)
      throw new Error(e + " and " + i + " are too far apart with stepSize of " + r + " " + a);
    const p = s.ticks.source === "data" && this.getDataTimestamps();
    for (f = h, u = 0; f < i; f = +t.add(f, r, a), u++)
      Xo(d, f, p);
    return (f === i || s.bounds === "ticks" || u === 1) && Xo(d, f, p), Object.keys(d).sort(Yo).map((m) => +m);
  }
  getLabelForValue(t) {
    const e = this._adapter, i = this.options.time;
    return i.tooltipFormat ? e.format(t, i.tooltipFormat) : e.format(t, i.displayFormats.datetime);
  }
  format(t, e) {
    const s = this.options.time.displayFormats, o = this._unit, a = e || s[o];
    return this._adapter.format(t, a);
  }
  _tickFormatFunction(t, e, i, s) {
    const o = this.options, a = o.ticks.callback;
    if (a)
      return Q(a, [
        t,
        e,
        i
      ], this);
    const r = o.time.displayFormats, l = this._unit, c = this._majorUnit, d = l && r[l], h = c && r[c], f = i[e], u = c && h && f && f.major;
    return this._adapter.format(t, s || (u ? h : d));
  }
  generateTickLabels(t) {
    let e, i, s;
    for (e = 0, i = t.length; e < i; ++e)
      s = t[e], s.label = this._tickFormatFunction(s.value, e, t);
  }
  getDecimalForValue(t) {
    return t === null ? NaN : (t - this.min) / (this.max - this.min);
  }
  getPixelForValue(t) {
    const e = this._offsets, i = this.getDecimalForValue(t);
    return this.getPixelForDecimal((e.start + i) * e.factor);
  }
  getValueForPixel(t) {
    const e = this._offsets, i = this.getDecimalForPixel(t) / e.factor - e.end;
    return this.min + i * (this.max - this.min);
  }
  _getLabelSize(t) {
    const e = this.options.ticks, i = this.ctx.measureText(t).width, s = Lt(this.isHorizontal() ? e.maxRotation : e.minRotation), o = Math.cos(s), a = Math.sin(s), r = this._resolveTickFontOptions(0).size;
    return {
      w: i * o + r * a,
      h: i * a + r * o
    };
  }
  _getLabelCapacity(t) {
    const e = this.options.time, i = e.displayFormats, s = i[e.unit] || i.millisecond, o = this._tickFormatFunction(t, 0, Ko(this, [
      t
    ], this._majorUnit), s), a = this._getLabelSize(o), r = Math.floor(this.isHorizontal() ? this.width / a.w : this.height / a.h) - 1;
    return r > 0 ? r : 1;
  }
  getDataTimestamps() {
    let t = this._cache.data || [], e, i;
    if (t.length)
      return t;
    const s = this.getMatchingVisibleMetas();
    if (this._normalized && s.length)
      return this._cache.data = s[0].controller.getAllParsedValues(this);
    for (e = 0, i = s.length; e < i; ++e)
      t = t.concat(s[e].controller.getAllParsedValues(this));
    return this._cache.data = this.normalize(t);
  }
  getLabelTimestamps() {
    const t = this._cache.labels || [];
    let e, i;
    if (t.length)
      return t;
    const s = this.getLabels();
    for (e = 0, i = s.length; e < i; ++e)
      t.push(Uo(this, s[e]));
    return this._cache.labels = this._normalized ? t : this.normalize(t);
  }
  normalize(t) {
    return fa(t.sort(Yo));
  }
}
P(Gn, "id", "time"), P(Gn, "defaults", {
  bounds: "data",
  adapters: {},
  time: {
    parser: !1,
    unit: !1,
    round: !1,
    isoWeekday: !1,
    minUnit: "millisecond",
    displayFormats: {}
  },
  ticks: {
    source: "auto",
    callback: !1,
    major: {
      enabled: !1
    }
  }
});
function An(n, t, e) {
  let i = 0, s = n.length - 1, o, a, r, l;
  e ? (t >= n[i].pos && t <= n[s].pos && ({ lo: i, hi: s } = pe(n, "pos", t)), { pos: o, time: r } = n[i], { pos: a, time: l } = n[s]) : (t >= n[i].time && t <= n[s].time && ({ lo: i, hi: s } = pe(n, "time", t)), { time: o, pos: r } = n[i], { time: a, pos: l } = n[s]);
  const c = a - o;
  return c ? r + (l - r) * (t - o) / c : r;
}
class qo extends Gn {
  constructor(t) {
    super(t), this._table = [], this._minPos = void 0, this._tableRange = void 0;
  }
  initOffsets() {
    const t = this._getTimestampsForTable(), e = this._table = this.buildLookupTable(t);
    this._minPos = An(e, this.min), this._tableRange = An(e, this.max) - this._minPos, super.initOffsets(t);
  }
  buildLookupTable(t) {
    const { min: e, max: i } = this, s = [], o = [];
    let a, r, l, c, d;
    for (a = 0, r = t.length; a < r; ++a)
      c = t[a], c >= e && c <= i && s.push(c);
    if (s.length < 2)
      return [
        {
          time: e,
          pos: 0
        },
        {
          time: i,
          pos: 1
        }
      ];
    for (a = 0, r = s.length; a < r; ++a)
      d = s[a + 1], l = s[a - 1], c = s[a], Math.round((d + l) / 2) !== c && o.push({
        time: c,
        pos: a / (r - 1)
      });
    return o;
  }
  _generate() {
    const t = this.min, e = this.max;
    let i = super.getDataTimestamps();
    return (!i.includes(t) || !i.length) && i.splice(0, 0, t), (!i.includes(e) || i.length === 1) && i.push(e), i.sort((s, o) => s - o);
  }
  _getTimestampsForTable() {
    let t = this._cache.all || [];
    if (t.length)
      return t;
    const e = this.getDataTimestamps(), i = this.getLabelTimestamps();
    return e.length && i.length ? t = this.normalize(e.concat(i)) : t = e.length ? e : i, t = this._cache.all = t, t;
  }
  getDecimalForValue(t) {
    return (An(this._table, t) - this._minPos) / this._tableRange;
  }
  getValueForPixel(t) {
    const e = this._offsets, i = this.getDecimalForPixel(t) / e.factor - e.end;
    return An(this._table, i * this._tableRange + this._minPos, !0);
  }
}
P(qo, "id", "timeseries"), P(qo, "defaults", Gn.defaults);
const Ka = "label";
function Jo(n, t) {
  typeof n == "function" ? n(t) : n && (n.current = t);
}
function Tu(n, t) {
  const e = n.options;
  e && t && Object.assign(e, t);
}
function qa(n, t) {
  n.labels = t;
}
function Ja(n, t, e = Ka) {
  const i = [];
  n.datasets = t.map((s) => {
    const o = n.datasets.find((a) => a[e] === s[e]);
    return !o || !s.data || i.includes(o) ? {
      ...s
    } : (i.push(o), Object.assign(o, s), o);
  });
}
function Bu(n, t = Ka) {
  const e = {
    labels: [],
    datasets: []
  };
  return qa(e, n.labels), Ja(e, n.datasets, t), e;
}
function Au(n, t) {
  const { height: e = 150, width: i = 300, redraw: s = !1, datasetIdKey: o, type: a, data: r, options: l, plugins: c = [], fallbackContent: d, updateMode: h, ...f } = n, u = ne(null), p = ne(null), m = () => {
    u.current && (p.current = new Qn(u.current, {
      type: a,
      data: Bu(r, o),
      options: l && {
        ...l
      },
      plugins: c
    }), Jo(t, p.current));
  }, x = () => {
    Jo(t, null), p.current && (p.current.destroy(), p.current = null);
  };
  return ut(() => {
    !s && p.current && l && Tu(p.current, l);
  }, [
    s,
    l
  ]), ut(() => {
    !s && p.current && qa(p.current.config.data, r.labels);
  }, [
    s,
    r.labels
  ]), ut(() => {
    !s && p.current && r.datasets && Ja(p.current.config.data, r.datasets, o);
  }, [
    s,
    r.datasets
  ]), ut(() => {
    p.current && (s ? (x(), setTimeout(m)) : p.current.update(h));
  }, [
    s,
    l,
    r.labels,
    r.datasets,
    h
  ]), ut(() => {
    p.current && (x(), setTimeout(m));
  }, [
    a
  ]), ut(() => (m(), () => x()), []), /* @__PURE__ */ g("canvas", {
    ref: u,
    role: "img",
    height: e,
    width: i,
    ...f,
    children: d
  });
}
const Fu = /* @__PURE__ */ ta(Au);
function rn(n, t) {
  return Qn.register(t), /* @__PURE__ */ ta((e, i) => /* @__PURE__ */ g(Fu, {
    ...e,
    ref: i,
    type: n
  }));
}
const Pu = /* @__PURE__ */ rn("line", Dn), Nu = /* @__PURE__ */ rn("bar", Nn), Du = /* @__PURE__ */ rn("radar", On), Ou = /* @__PURE__ */ rn("doughnut", Be), zu = /* @__PURE__ */ rn("pie", zi);
Qn.register(
  Wi,
  ji,
  In,
  te,
  Ln,
  Ye,
  Ge,
  $f,
  Zf,
  au,
  qf
);
const Ru = [
  { value: "count", label: "Count" },
  { value: "sum", label: "Sum" },
  { value: "avg", label: "Average" },
  { value: "min", label: "Min" },
  { value: "max", label: "Max" }
], Lu = [
  { type: "bar", label: "Bar", icon: "▊" },
  { type: "bar-h", label: "Horiz Bar", icon: "▬" },
  { type: "line", label: "Line", icon: "📈" },
  { type: "area", label: "Area", icon: "📉" },
  { type: "pie", label: "Pie", icon: "◔" },
  { type: "doughnut", label: "Doughnut", icon: "◎" },
  { type: "radar", label: "Radar", icon: "⬡" }
], Zo = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#d97706",
  "#7c3aed",
  "#0891b2",
  "#be185d",
  "#0d9488",
  "#b45309",
  "#4f46e5"
];
function Iu(n, t) {
  if (!n.length) return 0;
  switch (t) {
    case "count":
      return n.length;
    case "sum":
      return n.reduce((e, i) => e + i, 0);
    case "avg":
      return n.reduce((e, i) => e + i, 0) / n.length;
    case "min":
      return Math.min(...n);
    case "max":
      return Math.max(...n);
  }
}
function Eu({ data: n, columnDefs: t, gridId: e, onClose: i }) {
  H(
    () => t.filter((b) => b.field && b.type !== "numericColumn" && b.type !== "rightAligned" && !(Array.isArray(b.type) && (b.type.includes("numericColumn") || b.type.includes("rightAligned")))).map((b) => ({ field: b.field, label: b.headerName ?? b.field })),
    [t]
  );
  const s = H(
    () => t.filter((b) => b.field && (b.type === "numericColumn" || b.type === "rightAligned" || Array.isArray(b.type) && (b.type.includes("numericColumn") || b.type.includes("rightAligned")))).map((b) => ({ field: b.field, label: b.headerName ?? b.field })),
    [t]
  ), o = H(() => t.filter((b) => b.field).map((b) => ({ field: b.field, label: b.headerName ?? b.field })), [t]), a = `pcb-grid-chart-${e ?? "default"}`, r = H(() => {
    try {
      const b = localStorage.getItem(a);
      return b ? JSON.parse(b) : null;
    } catch {
      return null;
    }
  }, [a]), [l, c] = R((r == null ? void 0 : r.chartType) ?? "bar"), [d, h] = R((r == null ? void 0 : r.groupBy) ?? ""), [f, u] = R((r == null ? void 0 : r.valueField) ?? ""), [p, m] = R((r == null ? void 0 : r.aggFn) ?? "sum"), [x, v] = R((r == null ? void 0 : r.topN) ?? 10);
  ut(() => {
    var b, T, B;
    !d && ((b = o[0]) != null && b.field) && h(o[0].field), f || u(((T = s[0]) == null ? void 0 : T.field) ?? ((B = o[0]) == null ? void 0 : B.field) ?? "");
  }, []), ut(() => {
    try {
      localStorage.setItem(a, JSON.stringify({ chartType: l, groupBy: d, valueField: f, aggFn: p, topN: x }));
    } catch {
    }
  }, [a, l, d, f, p, x]);
  const w = H(() => {
    if (!d) return null;
    const b = {};
    for (const N of n) {
      const L = N, J = String(L[d] ?? "—"), st = p === "count" ? 1 : Number(L[f]) || 0;
      b[J] || (b[J] = []), b[J].push(st);
    }
    const T = Object.entries(b).map(([N, L]) => ({ label: N, value: Iu(L, p) })).sort((N, L) => L.value - N.value).slice(0, x), B = T.map((N) => N.label), A = T.map((N) => N.value), D = B.map((N, L) => Zo[L % Zo.length]);
    return { labels: B, datasets: [{ label: `${p} of ${f}`, data: A, backgroundColor: D, borderColor: D, borderWidth: 1, fill: l === "area", tension: 0.3 }] };
  }, [n, d, f, p, x, l]), k = l === "bar-h", M = l === "pie" ? zu : l === "doughnut" ? Ou : l === "radar" ? Du : l === "line" || l === "area" ? Pu : Nu, C = H(() => ({
    responsive: !0,
    maintainAspectRatio: !1,
    indexAxis: k ? "y" : "x",
    plugins: { legend: { position: "bottom" }, tooltip: { callbacks: { label: (b) => ` ${b.formattedValue}` } } },
    scales: l === "pie" || l === "doughnut" || l === "radar" ? {} : {
      x: { grid: { color: "#e2e8f0" } },
      y: { grid: { color: "#e2e8f0" }, beginAtZero: !0 }
    }
  }), [l, k]);
  return o.length < 1 ? /* @__PURE__ */ g("div", { className: "eg-modal-backdrop", onClick: i, children: /* @__PURE__ */ _("div", { className: "eg-modal", style: { width: 400, padding: 24 }, onClick: (b) => b.stopPropagation(), children: [
    /* @__PURE__ */ g("p", { children: "No columns available for charting." }),
    /* @__PURE__ */ g("button", { type: "button", className: "eg-btn", onClick: i, children: "Close" })
  ] }) }) : /* @__PURE__ */ g("div", { className: "eg-modal-backdrop", onClick: i, children: /* @__PURE__ */ _("div", { className: "eg-modal", style: { width: 760 }, onClick: (b) => b.stopPropagation(), children: [
    /* @__PURE__ */ _("div", { className: "eg-modal-header", children: [
      /* @__PURE__ */ g("span", { className: "eg-modal-title", children: "Chart" }),
      /* @__PURE__ */ g("button", { type: "button", className: "eg-modal-close", onClick: i, children: "✕" })
    ] }),
    /* @__PURE__ */ _("div", { className: "eg-modal-body", style: { padding: "14px 20px" }, children: [
      /* @__PURE__ */ g("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }, children: Lu.map((b) => /* @__PURE__ */ _(
        "button",
        {
          type: "button",
          className: `eg-btn eg-btn-sm ${l === b.type ? "eg-btn-primary" : ""}`,
          onClick: () => c(b.type),
          children: [
            b.icon,
            " ",
            b.label
          ]
        },
        b.type
      )) }),
      /* @__PURE__ */ _("div", { style: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14, alignItems: "flex-end" }, children: [
        /* @__PURE__ */ _("div", { className: "eg-form-group", style: { marginBottom: 0 }, children: [
          /* @__PURE__ */ g("label", { className: "eg-form-label", children: "Group By" }),
          /* @__PURE__ */ g("select", { className: "eg-form-select", value: d, onChange: (b) => h(b.target.value), children: o.map((b) => /* @__PURE__ */ g("option", { value: b.field, children: b.label }, b.field)) })
        ] }),
        p !== "count" && /* @__PURE__ */ _("div", { className: "eg-form-group", style: { marginBottom: 0 }, children: [
          /* @__PURE__ */ g("label", { className: "eg-form-label", children: "Value" }),
          /* @__PURE__ */ g("select", { className: "eg-form-select", value: f, onChange: (b) => u(b.target.value), children: o.map((b) => /* @__PURE__ */ g("option", { value: b.field, children: b.label }, b.field)) })
        ] }),
        /* @__PURE__ */ _("div", { className: "eg-form-group", style: { marginBottom: 0 }, children: [
          /* @__PURE__ */ g("label", { className: "eg-form-label", children: "Aggregate" }),
          /* @__PURE__ */ g("select", { className: "eg-form-select", value: p, onChange: (b) => m(b.target.value), children: Ru.map((b) => /* @__PURE__ */ g("option", { value: b.value, children: b.label }, b.value)) })
        ] }),
        /* @__PURE__ */ _("div", { className: "eg-form-group", style: { marginBottom: 0 }, children: [
          /* @__PURE__ */ g("label", { className: "eg-form-label", children: "Top N" }),
          /* @__PURE__ */ g("select", { className: "eg-form-select", value: x, onChange: (b) => v(Number(b.target.value)), children: [5, 10, 20, 50].map((b) => /* @__PURE__ */ g("option", { value: b, children: b }, b)) })
        ] })
      ] }),
      /* @__PURE__ */ g("div", { style: { height: 340, position: "relative" }, children: w ? (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        /* @__PURE__ */ g(M, { data: w, options: C })
      ) : /* @__PURE__ */ g("div", { style: { textAlign: "center", paddingTop: 120, color: "#64748b" }, children: "Select columns above to render chart." }) })
    ] })
  ] }) });
}
function Fn(n, t) {
  if (n.length === 0) return 0;
  switch (t) {
    case "sum":
      return n.reduce((e, i) => e + i, 0);
    case "avg":
      return n.reduce((e, i) => e + i, 0) / n.length;
    case "count":
      return n.length;
    case "min":
      return Math.min(...n);
    case "max":
      return Math.max(...n);
  }
}
function Vu(n, t) {
  var f, u;
  const e = {}, i = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Set();
  for (const p of n) {
    const m = p, x = String(m[t.rowField] ?? "—"), v = String(m[t.colField] ?? "—"), w = Number(m[t.valueField]) || 0;
    i.add(x), s.add(v), e[x] || (e[x] = {}), e[x][v] || (e[x][v] = []), e[x][v].push(w);
  }
  const o = [...i].sort(), a = [...s].sort(), r = {}, l = {}, c = {};
  for (const p of o) {
    r[p] = {};
    const m = [];
    for (const x of a) {
      const v = ((f = e[p]) == null ? void 0 : f[x]) ?? [];
      r[p][x] = Fn(v, t.aggFn), m.push(...v);
    }
    l[p] = Fn(m, t.aggFn);
  }
  for (const p of a) {
    const m = [];
    for (const x of o)
      m.push(...((u = e[x]) == null ? void 0 : u[p]) ?? []);
    c[p] = Fn(m, t.aggFn);
  }
  const d = o.flatMap((p) => a.flatMap((m) => {
    var x;
    return ((x = e[p]) == null ? void 0 : x[m]) ?? [];
  })), h = Fn(d, t.aggFn);
  return { rowKeys: o, colKeys: a, matrix: r, rowTotals: l, colTotals: c, grandTotal: h };
}
const Wu = [
  { value: "sum", label: "Sum" },
  { value: "avg", label: "Average" },
  { value: "count", label: "Count" },
  { value: "min", label: "Min" },
  { value: "max", label: "Max" }
];
function Pn(n, t) {
  return t === "count" ? String(Math.round(n)) : n.toLocaleString(void 0, { maximumFractionDigits: 2 });
}
function Hu({ data: n, columnDefs: t, gridId: e, onClose: i }) {
  var m, x, v, w, k, M, C;
  const s = H(
    () => t.filter((b) => b.field && (b.type === "numericColumn" || b.type === "rightAligned" || Array.isArray(b.type) && (b.type.includes("numericColumn") || b.type.includes("rightAligned")))).map((b) => ({ field: b.field, label: b.headerName ?? b.field })),
    [t]
  ), o = H(
    () => t.filter((b) => b.field && b.type !== "numericColumn" && b.type !== "rightAligned" && !(Array.isArray(b.type) && (b.type.includes("numericColumn") || b.type.includes("rightAligned")))).map((b) => ({ field: b.field, label: b.headerName ?? b.field })),
    [t]
  ), a = ((m = o[0]) == null ? void 0 : m.field) ?? ((x = t[0]) == null ? void 0 : x.field) ?? "", r = ((v = o[1]) == null ? void 0 : v.field) ?? ((w = o[0]) == null ? void 0 : w.field) ?? ((k = t[0]) == null ? void 0 : k.field) ?? "", l = ((M = s[0]) == null ? void 0 : M.field) ?? ((C = t[0]) == null ? void 0 : C.field) ?? "", c = `pcb-grid-pivot-${e ?? "default"}`, d = H(() => {
    try {
      const b = localStorage.getItem(c);
      return b ? JSON.parse(b) : null;
    } catch {
      return null;
    }
  }, [c]), [h, f] = R({
    rowField: (d == null ? void 0 : d.rowField) ?? a,
    colField: (d == null ? void 0 : d.colField) ?? r,
    valueField: (d == null ? void 0 : d.valueField) ?? l,
    aggFn: (d == null ? void 0 : d.aggFn) ?? "sum"
  });
  ut(() => {
    try {
      localStorage.setItem(c, JSON.stringify(h));
    } catch {
    }
  }, [c, h]);
  const u = H(() => !h.rowField || !h.colField || !h.valueField ? { rowKeys: [], colKeys: [], matrix: {}, rowTotals: {}, colTotals: {}, grandTotal: 0 } : Vu(n, h), [n, h]), p = H(() => t.filter((b) => b.field).map((b) => ({ field: b.field, label: b.headerName ?? b.field })), [t]);
  return p.length < 2 ? /* @__PURE__ */ _("div", { style: { padding: 24, color: "#64748b" }, children: [
    "At least 2 columns are required for pivot view.",
    /* @__PURE__ */ g("button", { type: "button", className: "eg-btn eg-btn-sm", style: { marginLeft: 12 }, onClick: i, children: "Back to Grid" })
  ] }) : /* @__PURE__ */ _("div", { style: { width: "100%" }, children: [
    /* @__PURE__ */ _("div", { className: "eg-chart-controls", style: { marginBottom: 16, flexWrap: "wrap", gap: 10 }, children: [
      /* @__PURE__ */ _("div", { className: "eg-form-group", style: { marginBottom: 0 }, children: [
        /* @__PURE__ */ g("label", { className: "eg-form-label", children: "Rows" }),
        /* @__PURE__ */ g("select", { className: "eg-form-select", value: h.rowField, onChange: (b) => f((T) => ({ ...T, rowField: b.target.value })), children: p.map((b) => /* @__PURE__ */ g("option", { value: b.field, children: b.label }, b.field)) })
      ] }),
      /* @__PURE__ */ _("div", { className: "eg-form-group", style: { marginBottom: 0 }, children: [
        /* @__PURE__ */ g("label", { className: "eg-form-label", children: "Columns" }),
        /* @__PURE__ */ g("select", { className: "eg-form-select", value: h.colField, onChange: (b) => f((T) => ({ ...T, colField: b.target.value })), children: p.map((b) => /* @__PURE__ */ g("option", { value: b.field, children: b.label }, b.field)) })
      ] }),
      /* @__PURE__ */ _("div", { className: "eg-form-group", style: { marginBottom: 0 }, children: [
        /* @__PURE__ */ g("label", { className: "eg-form-label", children: "Values" }),
        /* @__PURE__ */ g("select", { className: "eg-form-select", value: h.valueField, onChange: (b) => f((T) => ({ ...T, valueField: b.target.value })), children: p.map((b) => /* @__PURE__ */ g("option", { value: b.field, children: b.label }, b.field)) })
      ] }),
      /* @__PURE__ */ _("div", { className: "eg-form-group", style: { marginBottom: 0 }, children: [
        /* @__PURE__ */ g("label", { className: "eg-form-label", children: "Aggregate" }),
        /* @__PURE__ */ g("select", { className: "eg-form-select", value: h.aggFn, onChange: (b) => f((T) => ({ ...T, aggFn: b.target.value })), children: Wu.map((b) => /* @__PURE__ */ g("option", { value: b.value, children: b.label }, b.value)) })
      ] }),
      /* @__PURE__ */ g("div", { style: { flex: 1 } }),
      /* @__PURE__ */ g("button", { type: "button", className: "eg-btn eg-btn-sm", onClick: i, children: "Back to Grid" })
    ] }),
    u.rowKeys.length === 0 ? /* @__PURE__ */ g("div", { style: { padding: "24px 0", color: "#64748b", textAlign: "center" }, children: "No data to pivot." }) : /* @__PURE__ */ g("div", { style: { overflow: "auto" }, children: /* @__PURE__ */ _("table", { className: "eg-pivot-table", children: [
      /* @__PURE__ */ g("thead", { children: /* @__PURE__ */ _("tr", { children: [
        /* @__PURE__ */ _("th", { className: "eg-pivot-row-header", children: [
          h.rowField,
          " / ",
          h.colField
        ] }),
        u.colKeys.map((b) => /* @__PURE__ */ g("th", { children: b }, b)),
        /* @__PURE__ */ g("th", { className: "eg-pivot-total", children: "Total" })
      ] }) }),
      /* @__PURE__ */ _("tbody", { children: [
        u.rowKeys.map((b) => /* @__PURE__ */ _("tr", { children: [
          /* @__PURE__ */ g("td", { className: "eg-pivot-row-header", children: b }),
          u.colKeys.map((T) => /* @__PURE__ */ g("td", { className: "eg-pivot-value", children: Pn(u.matrix[b][T], h.aggFn) }, T)),
          /* @__PURE__ */ g("td", { className: "eg-pivot-total eg-pivot-value", children: Pn(u.rowTotals[b], h.aggFn) })
        ] }, b)),
        /* @__PURE__ */ _("tr", { children: [
          /* @__PURE__ */ g("td", { className: "eg-pivot-total", children: "Total" }),
          u.colKeys.map((b) => /* @__PURE__ */ g("td", { className: "eg-pivot-total eg-pivot-value", children: Pn(u.colTotals[b], h.aggFn) }, b)),
          /* @__PURE__ */ g("td", { className: "eg-pivot-grand-total eg-pivot-value", children: Pn(u.grandTotal, h.aggFn) })
        ] })
      ] })
    ] }) })
  ] });
}
const Za = [
  // ── Standard ──────────────────────────────────────────────────────
  { label: "White Clean", category: "Standard", colors: { headerBg: "#1e3a5f", toolbarBg: "#ffffff", accentColor: "#2563eb", rowAltBg: "#f9fafb", headerText: "#f0f6ff", toolbarText: "#374151", headerFontSize: 12 } },
  { label: "White Light", category: "Standard", colors: { headerBg: "#f9fafb", toolbarBg: "#ffffff", accentColor: "#2563eb", rowAltBg: "#f9fafb", headerText: "#111827", toolbarText: "#374151", headerFontSize: 12 } },
  { label: "GitHub Style", category: "Standard", colors: { headerBg: "#ffffff", toolbarBg: "#ffffff", accentColor: "#0969da", rowAltBg: "#f6f8fa", headerText: "#24292f", toolbarText: "#24292f", headerFontSize: 12 } },
  { label: "Notion Style", category: "Standard", colors: { headerBg: "#f7f7f5", toolbarBg: "#ffffff", accentColor: "#2383e2", rowAltBg: "#f7f7f5", headerText: "#37352f", toolbarText: "#37352f", headerFontSize: 12 } },
  { label: "Salesforce", category: "Standard", colors: { headerBg: "#16325c", toolbarBg: "#ffffff", accentColor: "#0070d2", rowAltBg: "#f4f6f9", headerText: "#ffffff", toolbarText: "#16325c", headerFontSize: 12 } },
  { label: "Linear App", category: "Standard", colors: { headerBg: "#f5f5f5", toolbarBg: "#ffffff", accentColor: "#5e6ad2", rowAltBg: "#fafafa", headerText: "#1a1a1a", toolbarText: "#6b7280", headerFontSize: 12 } },
  { label: "Stripe", category: "Standard", colors: { headerBg: "#0a2540", toolbarBg: "#ffffff", accentColor: "#635bff", rowAltBg: "#f6f9fc", headerText: "#cdd5e0", toolbarText: "#425466", headerFontSize: 12 } },
  { label: "Vercel", category: "Standard", colors: { headerBg: "#000000", toolbarBg: "#ffffff", accentColor: "#0070f3", rowAltBg: "#fafafa", headerText: "#ffffff", toolbarText: "#111111", headerFontSize: 12 } },
  { label: "Shadcn", category: "Standard", colors: { headerBg: "#18181b", toolbarBg: "#ffffff", accentColor: "#6366f1", rowAltBg: "#f4f4f5", headerText: "#fafafa", toolbarText: "#18181b", headerFontSize: 12 } },
  { label: "Material", category: "Standard", colors: { headerBg: "#1565c0", toolbarBg: "#ffffff", accentColor: "#1976d2", rowAltBg: "#e3f2fd", headerText: "#ffffff", toolbarText: "#1565c0", headerFontSize: 12 } },
  // ── Corporate ─────────────────────────────────────────────────────
  { label: "Navy Professional", category: "Corporate", colors: { headerBg: "#1e3a5f", toolbarBg: "#ffffff", accentColor: "#2563eb", rowAltBg: "#f8fafc", headerText: "#f0f6ff", toolbarText: "#475569", headerFontSize: 12 } },
  { label: "Oxford Blue", category: "Corporate", colors: { headerBg: "#002147", toolbarBg: "#ffffff", accentColor: "#1d4ed8", rowAltBg: "#f8fafc", headerText: "#e0eeff", toolbarText: "#334155", headerFontSize: 12 } },
  { label: "IBM Blue", category: "Corporate", colors: { headerBg: "#0043ce", toolbarBg: "#ffffff", accentColor: "#0f62fe", rowAltBg: "#edf5ff", headerText: "#ffffff", toolbarText: "#161616", headerFontSize: 12 } },
  { label: "Midnight", category: "Corporate", colors: { headerBg: "#0d1b2a", toolbarBg: "#f8fafc", accentColor: "#4361ee", rowAltBg: "#f8fafc", headerText: "#e2e8f0", toolbarText: "#1e293b", headerFontSize: 12 } },
  { label: "Steel Blue", category: "Corporate", colors: { headerBg: "#2d6a9f", toolbarBg: "#ffffff", accentColor: "#1a78c2", rowAltBg: "#f0f7ff", headerText: "#ffffff", toolbarText: "#374151", headerFontSize: 12 } },
  { label: "Slate", category: "Corporate", colors: { headerBg: "#334155", toolbarBg: "#f8fafc", accentColor: "#7c3aed", rowAltBg: "#f8fafc", headerText: "#f1f5f9", toolbarText: "#374151", headerFontSize: 12 } },
  { label: "Gunmetal", category: "Corporate", colors: { headerBg: "#2c3e50", toolbarBg: "#ffffff", accentColor: "#3498db", rowAltBg: "#f8fafc", headerText: "#ecf0f1", toolbarText: "#2c3e50", headerFontSize: 12 } },
  { label: "Charcoal", category: "Corporate", colors: { headerBg: "#36454f", toolbarBg: "#f9fafb", accentColor: "#64748b", rowAltBg: "#f1f5f9", headerText: "#f8fafc", toolbarText: "#374151", headerFontSize: 12 } },
  { label: "Cobalt", category: "Corporate", colors: { headerBg: "#0047ab", toolbarBg: "#ffffff", accentColor: "#0066cc", rowAltBg: "#f0f7ff", headerText: "#ffffff", toolbarText: "#1e3a5f", headerFontSize: 12 } },
  { label: "Enterprise Gray", category: "Corporate", colors: { headerBg: "#4a5568", toolbarBg: "#f7fafc", accentColor: "#667eea", rowAltBg: "#f7fafc", headerText: "#f7fafc", toolbarText: "#2d3748", headerFontSize: 12 } },
  { label: "Goldman Sachs", category: "Corporate", colors: { headerBg: "#0d2240", toolbarBg: "#ffffff", accentColor: "#3b6fba", rowAltBg: "#f8f9fb", headerText: "#d4af37", toolbarText: "#0d2240", headerFontSize: 12 } },
  { label: "Morgan Stanley", category: "Corporate", colors: { headerBg: "#002e6d", toolbarBg: "#ffffff", accentColor: "#0066b3", rowAltBg: "#f5f8fc", headerText: "#ccd9e8", toolbarText: "#002e6d", headerFontSize: 12 } },
  { label: "Microsoft", category: "Corporate", colors: { headerBg: "#0078d4", toolbarBg: "#ffffff", accentColor: "#0078d4", rowAltBg: "#f3f9ff", headerText: "#ffffff", toolbarText: "#201f1e", headerFontSize: 12 } },
  { label: "SAP Fiori", category: "Corporate", colors: { headerBg: "#354a5e", toolbarBg: "#ffffff", accentColor: "#0a6ed1", rowAltBg: "#f5f7fa", headerText: "#ffffff", toolbarText: "#354a5e", headerFontSize: 12 } },
  { label: "ServiceNow", category: "Corporate", colors: { headerBg: "#81b5a1", toolbarBg: "#ffffff", accentColor: "#62a98e", rowAltBg: "#f5faf8", headerText: "#ffffff", toolbarText: "#333333", headerFontSize: 12 } },
  // ── Finance ───────────────────────────────────────────────────────
  { label: "Bloomberg Dark", category: "Finance", colors: { headerBg: "#1c1c1c", toolbarBg: "#f9fafb", accentColor: "#ff6600", rowAltBg: "#f5f5f5", headerText: "#ff6600", toolbarText: "#1c1c1c", headerFontSize: 12 } },
  { label: "Bloomberg Blue", category: "Finance", colors: { headerBg: "#003366", toolbarBg: "#ffffff", accentColor: "#ff6600", rowAltBg: "#f0f4f8", headerText: "#ffffff", toolbarText: "#003366", headerFontSize: 12 } },
  { label: "Reuters", category: "Finance", colors: { headerBg: "#ee3524", toolbarBg: "#ffffff", accentColor: "#ee3524", rowAltBg: "#fff5f5", headerText: "#ffffff", toolbarText: "#333333", headerFontSize: 12 } },
  { label: "Nasdaq", category: "Finance", colors: { headerBg: "#0033a0", toolbarBg: "#ffffff", accentColor: "#0033a0", rowAltBg: "#f0f4fc", headerText: "#ffffff", toolbarText: "#0033a0", headerFontSize: 12 } },
  { label: "NYSE", category: "Finance", colors: { headerBg: "#003087", toolbarBg: "#ffffff", accentColor: "#e31837", rowAltBg: "#f8f9fd", headerText: "#ffffff", toolbarText: "#003087", headerFontSize: 12 } },
  { label: "BlackRock", category: "Finance", colors: { headerBg: "#000000", toolbarBg: "#ffffff", accentColor: "#dc0000", rowAltBg: "#f9f9f9", headerText: "#ffffff", toolbarText: "#000000", headerFontSize: 12 } },
  { label: "Fidelity", category: "Finance", colors: { headerBg: "#68268c", toolbarBg: "#ffffff", accentColor: "#68268c", rowAltBg: "#f9f5fc", headerText: "#ffffff", toolbarText: "#68268c", headerFontSize: 12 } },
  { label: "Vanguard", category: "Finance", colors: { headerBg: "#8b0000", toolbarBg: "#ffffff", accentColor: "#8b0000", rowAltBg: "#fdf8f8", headerText: "#ffffff", toolbarText: "#8b0000", headerFontSize: 12 } },
  { label: "Charles Schwab", category: "Finance", colors: { headerBg: "#00a0b0", toolbarBg: "#ffffff", accentColor: "#1f6695", rowAltBg: "#f0fbfc", headerText: "#ffffff", toolbarText: "#004b63", headerFontSize: 12 } },
  { label: "Trading Green", category: "Finance", colors: { headerBg: "#1a3c2b", toolbarBg: "#ffffff", accentColor: "#00cc44", rowAltBg: "#f0fff4", headerText: "#00cc44", toolbarText: "#1a3c2b", headerFontSize: 12 } },
  // ── Nature ────────────────────────────────────────────────────────
  { label: "Forest", category: "Nature", colors: { headerBg: "#14532d", toolbarBg: "#ffffff", accentColor: "#16a34a", rowAltBg: "#f0fdf4", headerText: "#dcfce7", toolbarText: "#14532d", headerFontSize: 12 } },
  { label: "Emerald", category: "Nature", colors: { headerBg: "#065f46", toolbarBg: "#ffffff", accentColor: "#059669", rowAltBg: "#ecfdf5", headerText: "#a7f3d0", toolbarText: "#1f2937", headerFontSize: 12 } },
  { label: "Teal", category: "Nature", colors: { headerBg: "#134e4a", toolbarBg: "#ffffff", accentColor: "#0d9488", rowAltBg: "#f0fdfa", headerText: "#99f6e4", toolbarText: "#134e4a", headerFontSize: 12 } },
  { label: "Sage", category: "Nature", colors: { headerBg: "#3d5a3e", toolbarBg: "#f7fdf7", accentColor: "#5a9a5c", rowAltBg: "#f0fdf0", headerText: "#d4edda", toolbarText: "#2d4a2e", headerFontSize: 12 } },
  { label: "Olive", category: "Nature", colors: { headerBg: "#4a4e1a", toolbarBg: "#fefce8", accentColor: "#84cc16", rowAltBg: "#fefce8", headerText: "#ecfccb", toolbarText: "#3f3f1a", headerFontSize: 12 } },
  { label: "Jade", category: "Nature", colors: { headerBg: "#00695c", toolbarBg: "#ffffff", accentColor: "#00897b", rowAltBg: "#e8f5e9", headerText: "#b2dfdb", toolbarText: "#004d40", headerFontSize: 12 } },
  { label: "Moss", category: "Nature", colors: { headerBg: "#5c6b3c", toolbarBg: "#f9fbf5", accentColor: "#7c8c40", rowAltBg: "#f5f7ee", headerText: "#e8f0d8", toolbarText: "#3d4a28", headerFontSize: 12 } },
  { label: "Mint", category: "Nature", colors: { headerBg: "#10b981", toolbarBg: "#f0fdf4", accentColor: "#059669", rowAltBg: "#ecfdf5", headerText: "#ffffff", toolbarText: "#065f46", headerFontSize: 12 } },
  { label: "Pine", category: "Nature", colors: { headerBg: "#1b4332", toolbarBg: "#ffffff", accentColor: "#2d6a4f", rowAltBg: "#f0f8f4", headerText: "#d8f3dc", toolbarText: "#1b4332", headerFontSize: 12 } },
  { label: "Bamboo", category: "Nature", colors: { headerBg: "#4a7c59", toolbarBg: "#f6fdf8", accentColor: "#52b788", rowAltBg: "#f0f9f4", headerText: "#f0fff4", toolbarText: "#2d6a4f", headerFontSize: 12 } },
  { label: "Ocean", category: "Nature", colors: { headerBg: "#023e8a", toolbarBg: "#f0f8ff", accentColor: "#0096c7", rowAltBg: "#e8f4fd", headerText: "#90e0ef", toolbarText: "#03045e", headerFontSize: 12 } },
  { label: "Seafoam", category: "Nature", colors: { headerBg: "#1b7f79", toolbarBg: "#f0fdfd", accentColor: "#2dd4bf", rowAltBg: "#f0fdfa", headerText: "#ccfbf1", toolbarText: "#134e4a", headerFontSize: 12 } },
  { label: "Rainforest", category: "Nature", colors: { headerBg: "#2d6a4f", toolbarBg: "#f8fdf9", accentColor: "#40916c", rowAltBg: "#f0f8f4", headerText: "#b7e4c7", toolbarText: "#1b4332", headerFontSize: 12 } },
  { label: "Desert Sand", category: "Nature", colors: { headerBg: "#7c6a42", toolbarBg: "#fdf8f0", accentColor: "#a68b5b", rowAltBg: "#fdf8ee", headerText: "#f5e6c8", toolbarText: "#5c4a2a", headerFontSize: 12 } },
  // ── Warm ──────────────────────────────────────────────────────────
  { label: "Crimson", category: "Warm", colors: { headerBg: "#7f1d1d", toolbarBg: "#ffffff", accentColor: "#dc2626", rowAltBg: "#fef2f2", headerText: "#fecaca", toolbarText: "#7f1d1d", headerFontSize: 12 } },
  { label: "Rose", category: "Warm", colors: { headerBg: "#881337", toolbarBg: "#ffffff", accentColor: "#e11d48", rowAltBg: "#fff1f2", headerText: "#fecdd3", toolbarText: "#881337", headerFontSize: 12 } },
  { label: "Burgundy", category: "Warm", colors: { headerBg: "#4a0e0e", toolbarBg: "#fff8f8", accentColor: "#b91c1c", rowAltBg: "#fff8f8", headerText: "#fca5a5", toolbarText: "#4a0e0e", headerFontSize: 12 } },
  { label: "Coral", category: "Warm", colors: { headerBg: "#c2410c", toolbarBg: "#fff7ed", accentColor: "#ea580c", rowAltBg: "#fff7ed", headerText: "#fed7aa", toolbarText: "#7c2d12", headerFontSize: 12 } },
  { label: "Terra Cotta", category: "Warm", colors: { headerBg: "#92400e", toolbarBg: "#fffbeb", accentColor: "#d97706", rowAltBg: "#fffbeb", headerText: "#fde68a", toolbarText: "#78350f", headerFontSize: 12 } },
  { label: "Amber", category: "Warm", colors: { headerBg: "#78350f", toolbarBg: "#fffbeb", accentColor: "#d97706", rowAltBg: "#fffbeb", headerText: "#fcd34d", toolbarText: "#78350f", headerFontSize: 12 } },
  { label: "Rust", category: "Warm", colors: { headerBg: "#7c3311", toolbarBg: "#fff7f0", accentColor: "#c2410c", rowAltBg: "#fff7f0", headerText: "#fed7aa", toolbarText: "#7c2d12", headerFontSize: 12 } },
  { label: "Marigold", category: "Warm", colors: { headerBg: "#92400e", toolbarBg: "#fffbeb", accentColor: "#f59e0b", rowAltBg: "#fefce8", headerText: "#fef3c7", toolbarText: "#78350f", headerFontSize: 12 } },
  { label: "Saffron", category: "Warm", colors: { headerBg: "#854d0e", toolbarBg: "#fffbeb", accentColor: "#ca8a04", rowAltBg: "#fefce8", headerText: "#fef08a", toolbarText: "#713f12", headerFontSize: 12 } },
  { label: "Maroon", category: "Warm", colors: { headerBg: "#800000", toolbarBg: "#fff8f8", accentColor: "#b91c1c", rowAltBg: "#fff5f5", headerText: "#ffd6d6", toolbarText: "#800000", headerFontSize: 12 } },
  { label: "Chestnut", category: "Warm", colors: { headerBg: "#954535", toolbarBg: "#fdf7f5", accentColor: "#c0392b", rowAltBg: "#fdf5f3", headerText: "#fde8e4", toolbarText: "#7b3626", headerFontSize: 12 } },
  { label: "Bronze", category: "Warm", colors: { headerBg: "#8c5e2a", toolbarBg: "#fdf8f3", accentColor: "#b8860b", rowAltBg: "#fdf6eb", headerText: "#f5deb3", toolbarText: "#6b4423", headerFontSize: 12 } },
  // ── Purple ────────────────────────────────────────────────────────
  { label: "Purple", category: "Purple", colors: { headerBg: "#581c87", toolbarBg: "#ffffff", accentColor: "#9333ea", rowAltBg: "#faf5ff", headerText: "#e9d5ff", toolbarText: "#581c87", headerFontSize: 12 } },
  { label: "Indigo", category: "Purple", colors: { headerBg: "#312e81", toolbarBg: "#ffffff", accentColor: "#4f46e5", rowAltBg: "#eef2ff", headerText: "#c7d2fe", toolbarText: "#312e81", headerFontSize: 12 } },
  { label: "Violet", category: "Purple", colors: { headerBg: "#4c1d95", toolbarBg: "#faf5ff", accentColor: "#7c3aed", rowAltBg: "#faf5ff", headerText: "#ddd6fe", toolbarText: "#4c1d95", headerFontSize: 12 } },
  { label: "Grape", category: "Purple", colors: { headerBg: "#6b21a8", toolbarBg: "#fdf4ff", accentColor: "#a855f7", rowAltBg: "#fdf4ff", headerText: "#f0abfc", toolbarText: "#6b21a8", headerFontSize: 12 } },
  { label: "Plum", category: "Purple", colors: { headerBg: "#701a75", toolbarBg: "#fdf4ff", accentColor: "#c026d3", rowAltBg: "#fdf4ff", headerText: "#f5d0fe", toolbarText: "#701a75", headerFontSize: 12 } },
  { label: "Midnight Purple", category: "Purple", colors: { headerBg: "#1e1b4b", toolbarBg: "#f5f3ff", accentColor: "#6d28d9", rowAltBg: "#f5f3ff", headerText: "#ddd6fe", toolbarText: "#1e1b4b", headerFontSize: 12 } },
  { label: "Amethyst", category: "Purple", colors: { headerBg: "#7b2d8b", toolbarBg: "#fdf4ff", accentColor: "#a21caf", rowAltBg: "#fdf4ff", headerText: "#f5d0fe", toolbarText: "#5b1a6a", headerFontSize: 12 } },
  { label: "Deep Purple", category: "Purple", colors: { headerBg: "#2d1b69", toolbarBg: "#f8f5ff", accentColor: "#5b21b6", rowAltBg: "#f5f3ff", headerText: "#c4b5fd", toolbarText: "#1e1b4b", headerFontSize: 12 } },
  { label: "Periwinkle", category: "Purple", colors: { headerBg: "#5c5f9e", toolbarBg: "#f5f5ff", accentColor: "#818cf8", rowAltBg: "#f0f0ff", headerText: "#e0e0f8", toolbarText: "#3730a3", headerFontSize: 12 } },
  { label: "Mauve", category: "Purple", colors: { headerBg: "#8b4aab", toolbarBg: "#fdf4ff", accentColor: "#a855f7", rowAltBg: "#fdf8ff", headerText: "#f3e8ff", toolbarText: "#6b21a8", headerFontSize: 12 } },
  // ── Sky / Blue ────────────────────────────────────────────────────
  { label: "Sky Blue", category: "Sky", colors: { headerBg: "#0c4a6e", toolbarBg: "#f0f9ff", accentColor: "#0284c7", rowAltBg: "#f0f9ff", headerText: "#bae6fd", toolbarText: "#0c4a6e", headerFontSize: 12 } },
  { label: "Azure", category: "Sky", colors: { headerBg: "#1e40af", toolbarBg: "#eff6ff", accentColor: "#3b82f6", rowAltBg: "#eff6ff", headerText: "#bfdbfe", toolbarText: "#1e40af", headerFontSize: 12 } },
  { label: "Royal Blue", category: "Sky", colors: { headerBg: "#1e3a8a", toolbarBg: "#ffffff", accentColor: "#2563eb", rowAltBg: "#eff6ff", headerText: "#dbeafe", toolbarText: "#1e3a8a", headerFontSize: 12 } },
  { label: "Ocean", category: "Sky", colors: { headerBg: "#0e4d6f", toolbarBg: "#f0f9ff", accentColor: "#0891b2", rowAltBg: "#f0fdff", headerText: "#a5f3fc", toolbarText: "#0e4d6f", headerFontSize: 12 } },
  { label: "Cyan", category: "Sky", colors: { headerBg: "#164e63", toolbarBg: "#ecfeff", accentColor: "#06b6d4", rowAltBg: "#ecfeff", headerText: "#a5f3fc", toolbarText: "#164e63", headerFontSize: 12 } },
  { label: "Ice Blue", category: "Sky", colors: { headerBg: "#1e6fa0", toolbarBg: "#f0f7ff", accentColor: "#38bdf8", rowAltBg: "#f0f9ff", headerText: "#e0f2fe", toolbarText: "#0c4a6e", headerFontSize: 12 } },
  { label: "Powder Blue", category: "Sky", colors: { headerBg: "#4a90b8", toolbarBg: "#f5fbff", accentColor: "#5ba3d9", rowAltBg: "#f0f7ff", headerText: "#e8f4fd", toolbarText: "#2c5f7a", headerFontSize: 12 } },
  { label: "Denim", category: "Sky", colors: { headerBg: "#1560bd", toolbarBg: "#f0f6ff", accentColor: "#1877f2", rowAltBg: "#eef4ff", headerText: "#dbeafe", toolbarText: "#1560bd", headerFontSize: 12 } },
  { label: "Navy Seal", category: "Sky", colors: { headerBg: "#001f54", toolbarBg: "#f0f5ff", accentColor: "#034bd9", rowAltBg: "#eff6ff", headerText: "#bcd0f7", toolbarText: "#001f54", headerFontSize: 12 } },
  { label: "Atlantic", category: "Sky", colors: { headerBg: "#1a4e6b", toolbarBg: "#f0f8ff", accentColor: "#2980b9", rowAltBg: "#ebf5fb", headerText: "#aed6f1", toolbarText: "#154360", headerFontSize: 12 } },
  // ── Pastel ────────────────────────────────────────────────────────
  { label: "Pastel Blue", category: "Pastel", colors: { headerBg: "#7dd3fc", toolbarBg: "#f0f9ff", accentColor: "#0284c7", rowAltBg: "#f8fbff", headerText: "#0c4a6e", toolbarText: "#0c4a6e", headerFontSize: 12 } },
  { label: "Pastel Green", category: "Pastel", colors: { headerBg: "#86efac", toolbarBg: "#f0fdf4", accentColor: "#16a34a", rowAltBg: "#f7fdf8", headerText: "#14532d", toolbarText: "#14532d", headerFontSize: 12 } },
  { label: "Pastel Rose", category: "Pastel", colors: { headerBg: "#fda4af", toolbarBg: "#fff1f2", accentColor: "#e11d48", rowAltBg: "#fff8f9", headerText: "#881337", toolbarText: "#881337", headerFontSize: 12 } },
  { label: "Pastel Purple", category: "Pastel", colors: { headerBg: "#c4b5fd", toolbarBg: "#faf5ff", accentColor: "#7c3aed", rowAltBg: "#fdf8ff", headerText: "#4c1d95", toolbarText: "#4c1d95", headerFontSize: 12 } },
  { label: "Pastel Peach", category: "Pastel", colors: { headerBg: "#fdba74", toolbarBg: "#fff7ed", accentColor: "#ea580c", rowAltBg: "#fffbf5", headerText: "#7c2d12", toolbarText: "#7c2d12", headerFontSize: 12 } },
  { label: "Lavender", category: "Pastel", colors: { headerBg: "#a78bfa", toolbarBg: "#f5f3ff", accentColor: "#6d28d9", rowAltBg: "#faf8ff", headerText: "#2e1065", toolbarText: "#4c1d95", headerFontSize: 12 } },
  { label: "Pastel Yellow", category: "Pastel", colors: { headerBg: "#fde68a", toolbarBg: "#fffbeb", accentColor: "#ca8a04", rowAltBg: "#fefce8", headerText: "#78350f", toolbarText: "#92400e", headerFontSize: 12 } },
  { label: "Pastel Teal", category: "Pastel", colors: { headerBg: "#5eead4", toolbarBg: "#f0fdfa", accentColor: "#0d9488", rowAltBg: "#f0fdfb", headerText: "#134e4a", toolbarText: "#0f766e", headerFontSize: 12 } },
  { label: "Baby Blue", category: "Pastel", colors: { headerBg: "#93c5fd", toolbarBg: "#eff6ff", accentColor: "#3b82f6", rowAltBg: "#f5f9ff", headerText: "#1e3a8a", toolbarText: "#1d4ed8", headerFontSize: 12 } },
  { label: "Mint Cream", category: "Pastel", colors: { headerBg: "#6ee7b7", toolbarBg: "#ecfdf5", accentColor: "#059669", rowAltBg: "#f0fdf7", headerText: "#064e3b", toolbarText: "#065f46", headerFontSize: 12 } },
  { label: "Cotton Candy", category: "Pastel", colors: { headerBg: "#f9a8d4", toolbarBg: "#fdf2f8", accentColor: "#db2777", rowAltBg: "#fdf6fa", headerText: "#831843", toolbarText: "#9d174d", headerFontSize: 12 } },
  { label: "Lilac", category: "Pastel", colors: { headerBg: "#d8b4fe", toolbarBg: "#faf5ff", accentColor: "#9333ea", rowAltBg: "#fdf8ff", headerText: "#581c87", toolbarText: "#6b21a8", headerFontSize: 12 } },
  // ── Special ───────────────────────────────────────────────────────
  { label: "Sunset", category: "Special", colors: { headerBg: "#9d174d", toolbarBg: "#fff7ed", accentColor: "#f97316", rowAltBg: "#fff7ed", headerText: "#fecdd3", toolbarText: "#9d174d", headerFontSize: 12 } },
  { label: "Autumn", category: "Special", colors: { headerBg: "#7c2d12", toolbarBg: "#fff7ed", accentColor: "#b45309", rowAltBg: "#fffbeb", headerText: "#fed7aa", toolbarText: "#7c2d12", headerFontSize: 12 } },
  { label: "Aurora", category: "Special", colors: { headerBg: "#065f46", toolbarBg: "#f0fdf4", accentColor: "#7c3aed", rowAltBg: "#ecfdf5", headerText: "#a7f3d0", toolbarText: "#065f46", headerFontSize: 12 } },
  { label: "Cherry Blossom", category: "Special", colors: { headerBg: "#be185d", toolbarBg: "#fdf2f8", accentColor: "#db2777", rowAltBg: "#fdf2f8", headerText: "#fbcfe8", toolbarText: "#be185d", headerFontSize: 12 } },
  { label: "Mango", category: "Special", colors: { headerBg: "#b45309", toolbarBg: "#fffbeb", accentColor: "#f59e0b", rowAltBg: "#fffbeb", headerText: "#fcd34d", toolbarText: "#92400e", headerFontSize: 12 } },
  { label: "Midnight Gold", category: "Special", colors: { headerBg: "#1a1a2e", toolbarBg: "#ffffff", accentColor: "#e2b714", rowAltBg: "#fefce8", headerText: "#e2b714", toolbarText: "#1a1a2e", headerFontSize: 12 } },
  { label: "Northern Lights", category: "Special", colors: { headerBg: "#1a3a4a", toolbarBg: "#f0fdfa", accentColor: "#06b6d4", rowAltBg: "#f0fdfa", headerText: "#67e8f9", toolbarText: "#164e63", headerFontSize: 12 } },
  { label: "Volcanic", category: "Special", colors: { headerBg: "#4a0000", toolbarBg: "#fff5f5", accentColor: "#ef4444", rowAltBg: "#fff8f8", headerText: "#ff8080", toolbarText: "#7f0000", headerFontSize: 12 } },
  { label: "Cyber Teal", category: "Special", colors: { headerBg: "#003333", toolbarBg: "#f0fdfa", accentColor: "#00b4d8", rowAltBg: "#f0fdfa", headerText: "#00ffdd", toolbarText: "#003333", headerFontSize: 12 } },
  { label: "Dusk", category: "Special", colors: { headerBg: "#3b0764", toolbarBg: "#faf5ff", accentColor: "#c026d3", rowAltBg: "#fdf4ff", headerText: "#e879f9", toolbarText: "#581c87", headerFontSize: 12 } },
  { label: "Deep Ocean", category: "Special", colors: { headerBg: "#001524", toolbarBg: "#f0f9ff", accentColor: "#0ea5e9", rowAltBg: "#f0f9ff", headerText: "#7dd3fc", toolbarText: "#0c4a6e", headerFontSize: 12 } },
  { label: "Galaxy", category: "Special", colors: { headerBg: "#13002e", toolbarBg: "#f5f3ff", accentColor: "#8b5cf6", rowAltBg: "#faf5ff", headerText: "#c4b5fd", toolbarText: "#4c1d95", headerFontSize: 12 } },
  // ── Accessible ────────────────────────────────────────────────────
  { label: "High Contrast", category: "Accessible", colors: { headerBg: "#000000", toolbarBg: "#ffffff", accentColor: "#0000ff", rowAltBg: "#f0f0f0", headerText: "#ffffff", toolbarText: "#000000", headerFontSize: 13 } },
  { label: "Print Friendly", category: "Accessible", colors: { headerBg: "#ffffff", toolbarBg: "#ffffff", accentColor: "#000000", rowAltBg: "#f5f5f5", headerText: "#000000", toolbarText: "#000000", headerFontSize: 12 } },
  { label: "Grayscale", category: "Accessible", colors: { headerBg: "#374151", toolbarBg: "#f9fafb", accentColor: "#6b7280", rowAltBg: "#f3f4f6", headerText: "#f9fafb", toolbarText: "#374151", headerFontSize: 12 } },
  { label: "Paper", category: "Accessible", colors: { headerBg: "#f5f5dc", toolbarBg: "#fffff0", accentColor: "#8b7355", rowAltBg: "#fffff0", headerText: "#3d3000", toolbarText: "#5c4b00", headerFontSize: 12 } },
  { label: "Colorblind Safe", category: "Accessible", colors: { headerBg: "#005073", toolbarBg: "#ffffff", accentColor: "#007ba7", rowAltBg: "#f0f7fa", headerText: "#ffffff", toolbarText: "#005073", headerFontSize: 12 } },
  { label: "Large Text", category: "Accessible", colors: { headerBg: "#1e3a5f", toolbarBg: "#ffffff", accentColor: "#2563eb", rowAltBg: "#f9fafb", headerText: "#f0f6ff", toolbarText: "#374151", headerFontSize: 14 } }
], ju = Array.from(new Set(Za.map((n) => n.category)));
function $u({ colors: n, onChange: t, onClose: e }) {
  const [i, s] = R("Standard"), o = Za.filter((r) => r.category === i), a = [
    { key: "headerBg", label: "Header Background", type: "color" },
    { key: "headerText", label: "Header Text Color", type: "color" },
    { key: "toolbarBg", label: "Toolbar Background", type: "color" },
    { key: "toolbarText", label: "Toolbar Text Color", type: "color" },
    { key: "accentColor", label: "Accent Color", type: "color" },
    { key: "rowAltBg", label: "Alternate Row", type: "color" },
    { key: "headerFontSize", label: "Header Font Size", type: "number" }
  ];
  return /* @__PURE__ */ _("div", { className: "eg-panel", style: { width: 320 }, children: [
    /* @__PURE__ */ _("div", { className: "eg-panel-header", children: [
      /* @__PURE__ */ g("span", { className: "eg-panel-title", children: "Customize Theme" }),
      /* @__PURE__ */ g("button", { type: "button", className: "eg-modal-close", onClick: e, children: "✕" })
    ] }),
    /* @__PURE__ */ _("div", { className: "eg-panel-body", style: { maxHeight: 520, overflowY: "auto" }, children: [
      /* @__PURE__ */ g("div", { style: { display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }, children: ju.map((r) => /* @__PURE__ */ g(
        "button",
        {
          type: "button",
          className: `eg-btn eg-btn-sm ${i === r ? "eg-btn-primary" : ""}`,
          style: { padding: "2px 8px", fontSize: 11 },
          onClick: () => s(r),
          children: r
        },
        r
      )) }),
      /* @__PURE__ */ _("div", { style: { fontSize: 10, color: "var(--cell-text-muted)", marginBottom: 6 }, children: [
        o.length,
        " presets — click to apply instantly"
      ] }),
      /* @__PURE__ */ g("div", { style: { display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4, marginBottom: 14 }, children: o.map((r) => /* @__PURE__ */ g(
        "button",
        {
          type: "button",
          title: r.label,
          onClick: () => t(r.colors),
          style: {
            width: "100%",
            aspectRatio: "1",
            background: r.colors.headerBg,
            border: n.headerBg === r.colors.headerBg ? "2px solid var(--accent)" : "2px solid transparent",
            borderRadius: 6,
            cursor: "pointer",
            position: "relative",
            overflow: "hidden"
          },
          children: /* @__PURE__ */ g("div", { style: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "40%",
            background: r.colors.toolbarBg,
            opacity: 0.9
          } })
        },
        r.label
      )) }),
      /* @__PURE__ */ g("p", { style: { fontSize: 11, color: "var(--cell-text-muted)", margin: "0 0 8px", fontWeight: 600 }, children: "Fine-tune" }),
      a.map((r) => /* @__PURE__ */ g("div", { className: "eg-form-group", style: { marginBottom: 8 }, children: /* @__PURE__ */ g("label", { className: "eg-form-label", style: { display: "flex", alignItems: "center", gap: 8, fontSize: 12 }, children: r.type === "color" ? /* @__PURE__ */ _(Ut, { children: [
        /* @__PURE__ */ g(
          "input",
          {
            type: "color",
            value: String(n[r.key]),
            onChange: (l) => t({ ...n, [r.key]: l.target.value }),
            style: { width: 26, height: 26, border: "none", padding: 0, cursor: "pointer", borderRadius: 3 }
          }
        ),
        r.label,
        /* @__PURE__ */ g("code", { style: { marginLeft: "auto", fontSize: 10, color: "var(--cell-text-muted)" }, children: String(n[r.key]) })
      ] }) : /* @__PURE__ */ _(Ut, { children: [
        r.label,
        /* @__PURE__ */ g(
          "input",
          {
            type: "range",
            min: 10,
            max: 16,
            step: 1,
            value: Number(n[r.key]),
            onChange: (l) => t({ ...n, [r.key]: Number(l.target.value) }),
            style: { flex: 1, marginLeft: 8 }
          }
        ),
        /* @__PURE__ */ _("code", { style: { fontSize: 10, color: "var(--cell-text-muted)", minWidth: 28 }, children: [
          Number(n[r.key]),
          "px"
        ] })
      ] }) }) }, r.key)),
      /* @__PURE__ */ g(
        "button",
        {
          type: "button",
          className: "eg-btn eg-btn-sm",
          style: { marginTop: 4 },
          onClick: () => t({ headerBg: "#1e3a5f", toolbarBg: "#ffffff", accentColor: "#2563eb", rowAltBg: "#f8fafc", headerText: "#f0f6ff", toolbarText: "#475569", headerFontSize: 12 }),
          children: "Reset to Default"
        }
      )
    ] })
  ] });
}
function Yu({ column: n, currentFilter: t, isNumeric: e, onFilterChange: i, onClose: s, anchorEl: o }) {
  const a = ne(null), [r, l] = R(""), [c, d] = R((t == null ? void 0 : t.values) ?? []), [h, f] = R((t == null ? void 0 : t.type) === "number" ? t.value ?? "" : ""), [u, p] = R((t == null ? void 0 : t.type) === "number" ? t.valueTo ?? "" : ""), m = H(() => Array.from(n.getFacetedUniqueValues().keys()).map((b) => String(b ?? "")).filter(Boolean).sort((b, T) => b.localeCompare(T)), [n]), x = H(
    () => r.trim() ? m.filter((b) => b.toLowerCase().includes(r.toLowerCase())) : m,
    [m, r]
  ), v = H(() => {
    if (!o) return {};
    const b = o.getBoundingClientRect();
    return { position: "fixed", top: b.bottom + 2, left: Math.max(0, b.left - 20), zIndex: 1e4 };
  }, [o]);
  ut(() => {
    const b = (B) => {
      a.current && !a.current.contains(B.target) && !(o != null && o.contains(B.target)) && s();
    }, T = (B) => {
      B.key === "Escape" && s();
    };
    return document.addEventListener("mousedown", b), document.addEventListener("keydown", T), () => {
      document.removeEventListener("mousedown", b), document.removeEventListener("keydown", T);
    };
  }, [s, o]);
  const w = (b) => {
    d((T) => T.includes(b) ? T.filter((B) => B !== b) : [...T, b]);
  }, k = () => {
    e ? i(!h && !u ? null : { columnId: n.id, type: "number", value: h, valueTo: u }) : c.length === 0 ? i(null) : i({ columnId: n.id, type: "multiselect", value: c.join(","), values: c }), s();
  }, M = () => {
    d([]), f(""), p(""), i(null), s();
  }, C = e ? !!h || !!u : c.length > 0;
  return /* @__PURE__ */ _("div", { ref: a, style: v, className: "eg-header-filter-popover", children: [
    /* @__PURE__ */ _("div", { className: "eg-header-filter-header", children: [
      /* @__PURE__ */ _("span", { className: "eg-header-filter-title", children: [
        "Filter: ",
        n.id
      ] }),
      C && /* @__PURE__ */ g("button", { type: "button", className: "eg-btn eg-btn-sm eg-btn-danger", onClick: M, style: { padding: "0 6px", height: 20, fontSize: 10 }, children: "Clear" }),
      /* @__PURE__ */ g("button", { type: "button", className: "eg-modal-close", onClick: s, style: { marginLeft: "auto" }, children: "✕" })
    ] }),
    e ? /* @__PURE__ */ _("div", { style: { padding: "8px 10px 4px", display: "flex", flexDirection: "column", gap: 6 }, children: [
      /* @__PURE__ */ g(
        "input",
        {
          className: "eg-form-input",
          type: "number",
          placeholder: "Min value",
          value: h,
          onChange: (b) => f(b.target.value)
        }
      ),
      /* @__PURE__ */ g(
        "input",
        {
          className: "eg-form-input",
          type: "number",
          placeholder: "Max value",
          value: u,
          onChange: (b) => p(b.target.value)
        }
      )
    ] }) : /* @__PURE__ */ _(Ut, { children: [
      /* @__PURE__ */ g("div", { style: { padding: "6px 8px 4px" }, children: /* @__PURE__ */ g(
        "input",
        {
          className: "eg-form-input",
          placeholder: "Search values...",
          value: r,
          onChange: (b) => l(b.target.value),
          autoFocus: !0
        }
      ) }),
      /* @__PURE__ */ _("div", { className: "eg-header-filter-list", children: [
        x.length === 0 && /* @__PURE__ */ g("div", { style: { padding: "6px 10px", color: "var(--cell-text-muted)", fontSize: 12 }, children: "No values" }),
        x.map((b) => /* @__PURE__ */ _("label", { className: "eg-header-filter-item", onClick: () => w(b), children: [
          /* @__PURE__ */ g("span", { className: `eg-header-filter-checkbox ${c.includes(b) ? "checked" : ""}`, children: c.includes(b) && /* @__PURE__ */ g("svg", { viewBox: "0 0 10 10", width: "9", height: "9", children: /* @__PURE__ */ g("polyline", { points: "1.5,5 4,7.5 8.5,2.5", stroke: "#fff", strokeWidth: "1.5", fill: "none", strokeLinecap: "round" }) }) }),
          /* @__PURE__ */ g("span", { style: { fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: b })
        ] }, b))
      ] }),
      /* @__PURE__ */ _("div", { style: { padding: "2px 8px", fontSize: 10, color: "var(--cell-text-muted)" }, children: [
        m.length,
        " unique values"
      ] })
    ] }),
    /* @__PURE__ */ _("div", { style: { display: "flex", gap: 6, padding: "6px 8px 8px" }, children: [
      /* @__PURE__ */ g("button", { type: "button", className: "eg-btn eg-btn-primary eg-btn-sm", style: { flex: 1 }, onClick: k, children: "Apply" }),
      /* @__PURE__ */ g("button", { type: "button", className: "eg-btn eg-btn-sm", onClick: s, children: "Cancel" })
    ] })
  ] });
}
function Uu(n, t) {
  const e = t.filter((c) => c.field && !c.field.startsWith("_")), i = ["Field", ...n.map((c, d) => `Row ${d + 1}`)].join(","), s = e.map((c) => {
    const d = n.map((f) => {
      const u = String(f[c.field] ?? "");
      return u.includes(",") ? `"${u}"` : u;
    });
    return [c.headerName ?? c.field ?? "", ...d].join(",");
  }), o = [i, ...s].join(`
`), a = new Blob([o], { type: "text/csv" }), r = URL.createObjectURL(a), l = document.createElement("a");
  l.href = r, l.download = `row-compare-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`, document.body.appendChild(l), l.click(), document.body.removeChild(l), URL.revokeObjectURL(r);
}
function Gu({ rows: n, columnDefs: t, onClose: e }) {
  const i = t.filter((o) => {
    var a;
    return o.field && !o.field.startsWith("_") && !Array.isArray((a = n[0]) == null ? void 0 : a[o.field]);
  }), s = {
    background: "var(--header-bg)",
    color: "var(--header-text)",
    padding: "7px 10px",
    textAlign: "left",
    position: "sticky",
    top: 0,
    zIndex: 2,
    fontSize: 11,
    fontWeight: 600,
    borderRight: "1px solid var(--grid-border)",
    borderBottom: "2px solid var(--grid-border)",
    whiteSpace: "nowrap"
  };
  return /* @__PURE__ */ g("div", { className: "eg-modal-backdrop", onClick: e, children: /* @__PURE__ */ _(
    "div",
    {
      className: "eg-modal",
      style: { maxWidth: 960, width: "96vw", maxHeight: "88vh", display: "flex", flexDirection: "column" },
      onClick: (o) => o.stopPropagation(),
      children: [
        /* @__PURE__ */ _("div", { className: "eg-modal-header", style: { flexShrink: 0 }, children: [
          /* @__PURE__ */ _("span", { className: "eg-modal-title", children: [
            "Row Compare — ",
            n.length,
            " rows selected"
          ] }),
          /* @__PURE__ */ _("div", { style: { display: "flex", gap: 8, marginLeft: "auto", alignItems: "center" }, children: [
            /* @__PURE__ */ g(
              "button",
              {
                type: "button",
                className: "eg-btn eg-btn-sm eg-btn-primary",
                onClick: () => Uu(n, t),
                children: "Export CSV"
              }
            ),
            /* @__PURE__ */ g("button", { type: "button", className: "eg-modal-close", onClick: e, children: "✕" })
          ] })
        ] }),
        /* @__PURE__ */ g("div", { style: { flex: 1, overflow: "auto", minHeight: 0 }, children: /* @__PURE__ */ _("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 12, tableLayout: "fixed" }, children: [
          /* @__PURE__ */ _("colgroup", { children: [
            /* @__PURE__ */ g("col", { style: { width: 140 } }),
            n.map((o, a) => /* @__PURE__ */ g("col", { style: { width: `${Math.max(160, Math.floor(820 / n.length))}px` } }, a))
          ] }),
          /* @__PURE__ */ g("thead", { children: /* @__PURE__ */ _("tr", { children: [
            /* @__PURE__ */ g("th", { style: { ...s, background: "var(--row-bg-alt)", color: "var(--cell-text-muted)" }, children: "Field" }),
            n.map((o, a) => /* @__PURE__ */ _("th", { style: s, children: [
              "Row ",
              a + 1,
              o.id !== void 0 && /* @__PURE__ */ _("span", { style: { fontWeight: 400, marginLeft: 4, opacity: 0.7 }, children: [
                "#",
                String(o.id)
              ] })
            ] }, a))
          ] }) }),
          /* @__PURE__ */ g("tbody", { children: i.map((o) => {
            const a = n.map((l) => String(l[o.field] ?? "")), r = a.every((l) => l === a[0]);
            return /* @__PURE__ */ _("tr", { children: [
              /* @__PURE__ */ g("td", { style: {
                padding: "5px 10px",
                borderBottom: "1px solid var(--grid-border-light)",
                borderRight: "1px solid var(--grid-border)",
                background: "var(--row-bg-alt)",
                color: "var(--cell-text-muted)",
                fontWeight: 600,
                fontSize: 11,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }, children: o.headerName ?? o.field }),
              a.map((l, c) => {
                const d = !r && (n.length === 2 ? l !== a[1 - c] : a.some((h, f) => f !== c && h !== l));
                return /* @__PURE__ */ g("td", { style: {
                  padding: "5px 10px",
                  borderBottom: "1px solid var(--grid-border-light)",
                  borderRight: "1px solid var(--grid-border)",
                  background: d ? "#fef9c3" : "transparent",
                  color: d ? "#713f12" : "var(--cell-text)",
                  fontWeight: d ? 600 : 400,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }, children: l !== "" ? l : /* @__PURE__ */ g("span", { style: { color: "var(--cell-text-muted)", fontStyle: "italic" }, children: "—" }) }, c);
              })
            ] }, o.field);
          }) })
        ] }) }),
        /* @__PURE__ */ _("div", { style: { padding: "8px 14px", borderTop: "1px solid var(--grid-border)", fontSize: 11, color: "var(--cell-text-muted)", flexShrink: 0, display: "flex", alignItems: "center", gap: 12 }, children: [
          /* @__PURE__ */ g("span", { style: { display: "inline-block", width: 10, height: 10, background: "#fef9c3", border: "1px solid #d97706", borderRadius: 2 } }),
          "Amber = values differ",
          /* @__PURE__ */ _("span", { style: { marginLeft: "auto" }, children: [
            i.length,
            " fields compared"
          ] })
        ] })
      ]
    }
  ) });
}
const Xu = [];
function ag({
  columnDefs: n = [],
  rowData: t = [],
  title: e,
  nowDate: i,
  gridId: s = "enterprise",
  licenseKey: o,
  themeColors: a
}) {
  var Ms, Ts;
  const r = t;
  ut(() => {
    Rr(o);
  }, [o]);
  const l = H(() => {
    const y = /* @__PURE__ */ new Set();
    return n.forEach((S) => {
      const F = S.field ?? S.colId ?? "";
      if (!F) return;
      const O = S.type;
      (O === "numericColumn" || O === "rightAligned" || Array.isArray(O) && (O.includes("numericColumn") || O.includes("rightAligned"))) && y.add(F);
    }), y;
  }, [n]), c = H(() => n.filter((y) => !y.hide).map((y) => {
    const S = y.colId ?? y.field, F = {
      id: S,
      header: y.headerName ?? y.field ?? "",
      enableSorting: y.sortable !== !1,
      size: y.width ?? y.minWidth ?? 150,
      minSize: y.minWidth ?? 80,
      maxSize: y.maxWidth,
      meta: { isNumeric: l.has(S ?? ""), aggregate: y.aggregate, headerName: y.headerName ?? y.field }
    };
    if (y.field && (F.accessorKey = y.field), y.cellRenderer === "badge") {
      const O = y.badgeMap;
      F.cell = ({ getValue: z }) => /* @__PURE__ */ g(Lr, { value: z(), badgeMap: O });
    } else if (y.cellRenderer === "sparkline" || y.cellRenderer === "sparkline-line") {
      const O = y.cellRenderer === "sparkline-line" ? "line" : "bar", z = y.sparklineColor;
      F.cell = ({ getValue: W }) => {
        const E = W(), Y = Array.isArray(E) ? E.map(Number) : typeof E == "string" ? E.split(",").map((Z) => Number(Z.trim())).filter((Z) => !isNaN(Z)) : [];
        return /* @__PURE__ */ g(Ir, { value: Y, type: O, color: z });
      };
    } else if (typeof y.cellRenderer == "function") {
      const O = y.cellRenderer;
      F.cell = ({ getValue: z, row: W }) => O({ value: z(), data: W.original, node: { data: W.original } });
    } else if (typeof y.valueFormatter == "function") {
      const O = y.valueFormatter;
      F.cell = ({ getValue: z, row: W }) => {
        const E = O({ value: z(), data: W.original });
        return /* @__PURE__ */ g(Ut, { children: E != null ? String(E) : "" });
      };
    } else
      F.cell = ({ getValue: O }) => /* @__PURE__ */ g(Ut, { children: String(O() ?? "") });
    return F;
  }), [n, l]), [d, h] = R([]), [f, u] = R([]), [p, m] = R({}), [x, v] = R({}), [w, k] = R(() => ({
    left: n.filter((y) => y.pinned === "left" || y.pinned === !0).map((y) => y.field ?? y.colId ?? "").filter(Boolean),
    right: n.filter((y) => y.pinned === "right").map((y) => y.field ?? y.colId ?? "").filter(Boolean)
  })), [M, C] = R([]), [b, T] = R({}), [B, A] = R({}), [D, N] = R([]), [L, J] = R(""), [st, $] = R({ pageIndex: 0, pageSize: 50 }), [G, it] = R("pagination"), [yt, dt] = R(!1), [Pt, Kt] = R(!1), [Et, le] = R(!1), [Nt, qt] = R(!1), [kt, Qa] = R("light"), [De, tr] = R("normal"), [er, cs] = R(!1), [nr, ds] = R(!1), [ir, ln] = R(!1), [sr, cn] = R(!1), [or, hs] = R(!1), [ar, fs] = R(!1), [dn, rr] = R(!1), [lr, us] = R(!1), [ce, ni] = R(null), [gs, ii] = R(null), [si, ps] = R([]), [vt, ve] = R(null), [oi, hn] = R(""), [_e, ai] = R(/* @__PURE__ */ new Map()), [Vt, ms] = R(null), bs = ne(null), xs = ne(null), ri = ne(null), [lt, cr] = R(() => {
    const y = {
      headerBg: (a == null ? void 0 : a.headerBg) ?? "#1e3a5f",
      toolbarBg: (a == null ? void 0 : a.toolbarBg) ?? "#ffffff",
      accentColor: (a == null ? void 0 : a.accentColor) ?? "#2563eb",
      rowAltBg: (a == null ? void 0 : a.rowAltBg) ?? "#f9fafb",
      headerText: "#f0f6ff",
      toolbarText: "#374151",
      headerFontSize: 12
    };
    try {
      const S = localStorage.getItem(`pcb-grid-theme-${s}`);
      if (S) return { ...y, ...JSON.parse(S) };
    } catch {
    }
    return y;
  });
  ut(() => {
    try {
      localStorage.setItem(`pcb-grid-theme-${s}`, JSON.stringify(lt));
    } catch {
    }
  }, [lt, s]);
  const { menu: K, openMenu: ys, closeMenu: dr } = dl(), { views: hr, saveView: vs, deleteView: fr, setDefaultView: ur, defaultView: Dt } = pl(s), li = H(() => D.length === 0 ? r : r.filter(
    (y) => D.every((S) => {
      const F = y[S.columnId];
      return cl(F, S, i);
    })
  ), [r, D, i]), ci = H(() => {
    if (!L.trim()) return li;
    const y = L.toLowerCase();
    return li.filter(
      (S) => Object.values(S).some((F) => String(F ?? "").toLowerCase().includes(y))
    );
  }, [li, L]), Wt = H(() => _e.size === 0 ? ci : ci.map((y, S) => {
    const F = { ...y };
    return _e.forEach((O, z) => {
      const [W, E] = z.split("::");
      Number(W) === S && (F[E] = O);
    }), F;
  }), [ci, _e]), _s = si, gr = H(() => Er(), []), pr = H(() => Vr(), []), mr = H(() => Wr(), []), br = H(() => Hr(), []), xr = H(() => jr(), []), yr = H(() => $r(), []), vr = H(() => Yr(), []), _r = H(() => Ur(), []), wr = H(() => Gr(), []), I = Xr({
    data: Wt,
    columns: c,
    state: {
      sorting: d,
      columnOrder: f.length > 0 ? f : void 0,
      columnVisibility: p,
      columnSizing: x,
      columnPinning: w,
      grouping: Pt ? M : Xu,
      expanded: b,
      rowSelection: B,
      pagination: st
    },
    onSortingChange: h,
    onColumnOrderChange: u,
    onColumnVisibilityChange: m,
    onColumnSizingChange: v,
    onColumnPinningChange: k,
    onGroupingChange: C,
    onExpandedChange: T,
    onRowSelectionChange: A,
    onPaginationChange: $,
    getCoreRowModel: gr,
    getSortedRowModel: pr,
    getPaginationRowModel: mr,
    getGroupedRowModel: br,
    getExpandedRowModel: xr,
    getFilteredRowModel: yr,
    getFacetedRowModel: vr,
    getFacetedUniqueValues: _r,
    getFacetedMinMaxValues: wr,
    enableMultiSort: !0,
    enableSortingRemoval: !0,
    sortDescFirst: !1,
    enableColumnResizing: !0,
    columnResizeMode: "onChange",
    enableRowSelection: !0
  }), { exportCSV: we, exportExcel: Se, exportPDF: Oe } = fl(I), ze = ft(() => {
    var _t;
    const S = document.createElement("canvas").getContext("2d");
    if (!S) return;
    S.font = "500 13px 'Public Sans', 'Segoe UI', sans-serif";
    const F = [], O = I.getVisibleLeafColumns(), z = I.getFilteredRowModel().rows;
    for (const at of O) {
      const et = String(at.columnDef.header ?? at.id);
      let Bt = S.measureText(et.toUpperCase()).width + 32;
      for (const Ct of z) {
        const Le = String(Ct.getValue(at.id) ?? ""), mn = S.measureText(Le).width + 32;
        mn > Bt && (Bt = mn);
      }
      const ke = at.columnDef.minSize ?? 50;
      F.push({
        id: at.id,
        size: Math.ceil(Math.max(ke, Math.min(Bt, 400))),
        maxSize: at.columnDef.maxSize
      });
    }
    const W = ((_t = ri.current) == null ? void 0 : _t.clientWidth) ?? 0, E = Math.floor(W - 44), Y = F.reduce((at, et) => at + et.size, 0);
    if (E > Y && Y > 0) {
      let at = E - Y, et = F.filter((Bt) => Bt.maxSize === void 0 || Bt.size < Bt.maxSize);
      for (; at >= 1 && et.length > 0; ) {
        const Bt = et.reduce((Ct, Le) => Ct + Le.size, 0);
        let ke = at, pn = 0;
        for (const Ct of et) {
          if (ke <= 0) break;
          const Le = Ct.maxSize === void 0 ? ke : Math.min(ke, Math.max(0, Ct.maxSize - Ct.size)), mn = Math.max(1, Math.floor(at * Ct.size / Bt)), di = Math.min(Le, mn);
          Ct.size += di, pn += di, ke -= di;
        }
        if (pn === 0) break;
        at -= pn, et = et.filter((Ct) => Ct.maxSize === void 0 || Ct.size < Ct.maxSize);
      }
    }
    const Z = {};
    F.forEach((at) => {
      Z[at.id] = at.size;
    }), v(Z);
  }, [I]), Sr = ft((y) => {
    N(y ? (S) => [...S.filter((O) => O.columnId !== y.columnId), y] : (S) => S.filter((F) => F.columnId !== ce));
  }, [ce]), fn = ft((y) => {
    const S = I.getColumn(y);
    if (!S) return;
    const O = document.createElement("canvas").getContext("2d");
    if (!O) return;
    O.font = "500 13px 'Public Sans', 'Segoe UI', sans-serif";
    const z = String(S.columnDef.header ?? S.id);
    let W = O.measureText(z.toUpperCase()).width + 32;
    const E = I.getSortedRowModel().rows;
    for (const Z of E) {
      const _t = String(Z.getValue(y) ?? "");
      W = Math.max(W, O.measureText(_t).width + 32);
    }
    const Y = Math.max(S.columnDef.minSize ?? 60, Math.min(W, 600));
    v((Z) => ({ ...Z, [y]: Y }));
  }, [I]);
  ut(() => {
    const y = xs.current;
    if (!y) return;
    const S = (F) => {
      var _t, at;
      const O = I.getVisibleLeafColumns(), z = I.getRowModel().rows, W = O.length + 1;
      if (!Vt) return;
      let { row: E, col: Y } = Vt;
      switch (F.key) {
        case "ArrowUp":
          E = Math.max(0, E - 1), F.preventDefault();
          break;
        case "ArrowDown":
          E = Math.min(z.length - 1, E + 1), F.preventDefault();
          break;
        case "ArrowLeft":
          Y = Math.max(0, Y - 1), F.preventDefault();
          break;
        case "ArrowRight":
          Y = Math.min(W - 1, Y + 1), F.preventDefault();
          break;
        case "Enter":
        case "F2":
          if (Y > 0) {
            const et = O[Y - 1], Bt = (_t = z[E]) == null ? void 0 : _t.getValue(et.id);
            ve({ rowIndex: E, columnId: et.id }), hn(String(Bt ?? ""));
          }
          F.preventDefault();
          return;
        case "Escape":
          vt && (ve(null), F.preventDefault());
          return;
        default:
          return;
      }
      ms({ row: E, col: Y });
      const Z = (at = bs.current) == null ? void 0 : at.querySelector(`[data-row="${E}"][data-col="${Y}"]`);
      Z == null || Z.focus();
    };
    return y.addEventListener("keydown", S), () => y.removeEventListener("keydown", S);
  }, [Vt, vt]);
  const ws = ft(() => {
    if (!vt) return;
    const y = `${vt.rowIndex}::${vt.columnId}`;
    ai((S) => {
      const F = new Map(S);
      return F.set(y, oi), F;
    }), ve(null);
  }, [vt, oi]), Cr = H(() => {
    if (!K) return [];
    const y = K.columnId;
    return [
      { label: "Sort Ascending", icon: "↑", onClick: () => h([{ id: y, desc: !1 }]) },
      { label: "Sort Descending", icon: "↓", onClick: () => h([{ id: y, desc: !0 }]) },
      { label: "Clear Sort", icon: "⊘", onClick: () => h((S) => S.filter((F) => F.id !== y)), separator: !0 },
      { label: "Group by this column", icon: "▤", onClick: () => {
        C((S) => S.includes(y) ? S : [...S, y]), Kt(!0);
      } },
      { label: "Ungroup", icon: "▢", onClick: () => C((S) => S.filter((F) => F !== y)), separator: !0 },
      { label: "Hide Column", icon: "👁", onClick: () => m((S) => ({ ...S, [y]: !1 })) },
      { label: "Best Fit This Column", icon: "📐", onClick: () => fn(y) },
      { label: "Fit All Columns", icon: "📏", onClick: ze, separator: !0 },
      { label: "Pin Left", icon: "📌", onClick: () => {
        var S;
        return (S = I.getColumn(y)) == null ? void 0 : S.pin("left");
      } },
      { label: "Pin Right", icon: "📌", onClick: () => {
        var S;
        return (S = I.getColumn(y)) == null ? void 0 : S.pin("right");
      } },
      { label: "Unpin", icon: "📌", onClick: () => {
        var S;
        return (S = I.getColumn(y)) == null ? void 0 : S.pin(!1);
      } },
      { label: "Export CSV", icon: "📥", onClick: () => we() },
      { label: "Export Excel", icon: "📊", onClick: () => Se() },
      { label: "Export PDF", icon: "📄", onClick: () => Oe() }
    ];
  }, [K, ze, fn, I, we, Se, Oe]), kr = H(() => K ? [
    { label: "Sort Ascending", icon: "↑", onClick: () => {
      const y = K.columnId;
      y && I.setSorting([{ id: y, desc: !1 }]);
    }, separator: !1 },
    { label: "Sort Descending", icon: "↓", onClick: () => {
      const y = K.columnId;
      y && I.setSorting([{ id: y, desc: !0 }]);
    }, separator: !1 },
    { label: "Clear Sort", icon: "⊘", onClick: () => I.setSorting([]), separator: !0 },
    {
      label: "Edit Cell",
      icon: "✏️",
      shortcut: "F2",
      onClick: () => {
        if (K.rowIndex != null) {
          const y = I.getRowModel().rows[K.rowIndex], S = y == null ? void 0 : y.getValue(K.columnId);
          ve({ rowIndex: K.rowIndex, columnId: K.columnId }), hn(String(S ?? ""));
        }
      }
    },
    {
      label: "Copy Value",
      icon: "📋",
      shortcut: "Ctrl+C",
      onClick: () => {
        if (K.rowIndex != null) {
          const y = I.getRowModel().rows[K.rowIndex], S = String((y == null ? void 0 : y.getValue(K.columnId)) ?? "");
          navigator.clipboard.writeText(S);
        }
      },
      separator: !0
    },
    {
      label: "Copy Row",
      icon: "📄",
      onClick: () => {
        if (K.rowIndex == null) return;
        const y = I.getRowModel().rows[K.rowIndex];
        if (!y) return;
        const S = y.getVisibleCells().map((F) => String(F.getValue() ?? "")).join("	");
        navigator.clipboard.writeText(S);
      }
    },
    {
      label: "Filter By This Value",
      icon: "🔍",
      onClick: () => {
        if (K.rowIndex == null) return;
        const y = I.getRowModel().rows[K.rowIndex];
        if (!y) return;
        const S = String(y.getValue(K.columnId) ?? "");
        N((F) => {
          const O = F.find((Y) => Y.columnId === K.columnId), z = K.columnId.toLowerCase(), W = (O == null ? void 0 : O.type) ?? (l.has(K.columnId) ? "number" : z.includes("date") || z.endsWith("_at") || z.endsWith("_on") ? "date" : "text"), E = F.filter((Y) => Y.columnId !== K.columnId);
          return E.push({ columnId: K.columnId, type: W, value: S }), E;
        }), dt(!0);
      }
    },
    { label: "Best Fit This Column", icon: "📐", onClick: () => fn(K.columnId) },
    { label: "Fit All Columns", icon: "📏", onClick: ze },
    { label: "Group By This Column", icon: "➕", onClick: () => {
      C((y) => y.includes(K.columnId) ? y : [...y, K.columnId]), Kt(!0);
    }, separator: !0 },
    { label: "Export CSV", icon: "📄", onClick: () => we() },
    { label: "Export Excel", icon: "📊", onClick: () => Se() },
    { label: "Export PDF", icon: "📄", onClick: () => Oe(), separator: !0 },
    { label: "Delete Row", icon: "🗑", danger: !0, onClick: () => {
    } }
  ] : [], [K, I, we, Se, Oe, ze, fn]), Mr = ft(
    (y) => {
      vs({
        name: y,
        sorting: d,
        columnOrder: f,
        columnVisibility: p,
        columnSizing: x,
        columnPinning: w,
        grouping: M,
        globalFilter: L,
        columnFilters: D,
        pageSize: st.pageSize
      });
    },
    [vs, d, f, p, x, w, M, L, D, st.pageSize]
  ), Tr = ft(
    (y) => {
      h(y.sorting), u(y.columnOrder), m(y.columnVisibility), v(y.columnSizing), k(y.columnPinning ?? { left: ["id"], right: [] }), C(y.grouping ?? []), J(y.globalFilter ?? ""), N(y.columnFilters ?? []), $({ pageIndex: 0, pageSize: y.pageSize || 50 }), ln(!1), cn(!1);
    },
    []
  );
  ut(() => {
    Dt && (h(Dt.sorting), u(Dt.columnOrder), m(Dt.columnVisibility), v(Dt.columnSizing), k(Dt.columnPinning ?? { left: ["id"], right: [] }), C(Dt.grouping ?? []), J(Dt.globalFilter ?? ""), N(Dt.columnFilters ?? []), $({ pageIndex: 0, pageSize: Dt.pageSize || 50 }));
  }, []);
  const Br = ft((y) => {
    ps((S) => [...S, y]);
  }, []), Ar = ft((y) => {
    ps((S) => S.filter((F) => F.id !== y));
  }, []), Ss = H(() => {
    const y = n.filter((O) => O.aggregate && O.field);
    if (y.length === 0) return null;
    const S = I.getSelectedRowModel().rows, F = S.length > 1 ? S.map((O) => O.original) : Wt;
    return y.flatMap((O) => {
      const z = O.field, W = O.aggregate, E = F.map((Z) => Number(Z[z])).filter((Z) => !isNaN(Z));
      if (E.length === 0) return [];
      let Y = 0;
      switch (W) {
        case "sum":
          Y = E.reduce((Z, _t) => Z + _t, 0);
          break;
        case "avg":
          Y = E.reduce((Z, _t) => Z + _t, 0) / E.length;
          break;
        case "count":
          Y = E.length;
          break;
        case "min":
          Y = Math.min(...E);
          break;
        case "max":
          Y = Math.max(...E);
          break;
      }
      return [{ label: O.headerName ?? z, agg: W, value: Y, count: E.length }];
    });
  }, [n, Wt, B]), un = H(() => {
    if (!dn) return null;
    const y = {};
    return l.forEach((S) => {
      const F = Wt.map((O) => Number(O[S])).filter((O) => !isNaN(O));
      F.length > 0 && (y[S] = { min: Math.min(...F), max: Math.max(...F) });
    }), y;
  }, [dn, l, Wt]), Fr = ft((y, S) => {
    if (!un || !un[y]) return {};
    const { min: F, max: O } = un[y], z = O - F || 1, W = (Number(S) - F) / z, E = Math.round(W * 120);
    return { background: `hsl(${E},70%,92%)`, color: `hsl(${E},60%,25%)` };
  }, [un]), gn = I.getVisibleLeafColumns(), Cs = I.getTotalSize() + 44, Pr = De === "compact" ? 30 : De === "comfortable" ? 48 : 36, Ce = G === "virtual" ? I.getRowModel().rows : I.getPaginationRowModel().rows, Re = Kr({
    count: G === "virtual" ? Ce.length : 0,
    getScrollElement: () => ri.current,
    estimateSize: () => Pr,
    overscan: 20
  }), Nr = H(() => kt === "dark" ? {} : {
    "--header-bg": lt.headerBg,
    "--header-bg-hover": lt.headerBg + "ee",
    "--header-bg-sorted": lt.headerBg + "cc",
    "--header-text": lt.headerText,
    "--header-text-muted": lt.headerText + "99",
    "--toolbar-bg": lt.toolbarBg,
    "--toolbar-btn-text": lt.toolbarText,
    "--accent": lt.accentColor,
    "--accent-dark": lt.accentColor,
    "--accent-light": lt.accentColor + "22",
    "--row-selected": lt.accentColor + "33",
    "--cell-focused": lt.accentColor,
    "--row-bg-alt": lt.rowAltBg,
    "--header-font-size": `${lt.headerFontSize}px`,
    "--pag-btn-active": lt.accentColor,
    "--pag-btn-border": lt.accentColor + "44"
  }, [kt, lt]), ks = (y, S) => {
    if (y.getIsGrouped()) {
      const z = n.find((Y) => Y.field === y.groupingColumnId), W = z ? z.headerName ?? z.field ?? "" : y.groupingColumnId ?? "", E = y.subRows.reduce((Y, Z) => Y + (Z.subRows.length > 0 ? 0 : 1), 0) || y.subRows.length;
      return /* @__PURE__ */ g("tr", { className: "eg-group-row", onClick: () => y.toggleExpanded(), children: /* @__PURE__ */ _(
        "td",
        {
          colSpan: gn.length + 1,
          style: { paddingLeft: `${y.depth * 24 + 12}px` },
          children: [
            /* @__PURE__ */ g("span", { className: `eg-group-toggle ${y.getIsExpanded() ? "" : "collapsed"}`, children: "▼" }),
            /* @__PURE__ */ _("span", { className: "eg-group-col-name", children: [
              W,
              ":"
            ] }),
            String(y.groupingValue),
            " (",
            E,
            ")"
          ]
        }
      ) }, y.id);
    }
    const F = nl(y.original, _s), O = y.getIsSelected();
    return /* @__PURE__ */ _(
      "tr",
      {
        className: `eg-tr ${O ? "selected" : ""}`,
        style: F,
        role: "row",
        "aria-selected": O,
        children: [
          /* @__PURE__ */ g("td", { className: "eg-td eg-td-select", style: { width: 44, textAlign: "center" }, role: "gridcell", children: /* @__PURE__ */ g(
            "input",
            {
              type: "checkbox",
              className: "eg-checkbox",
              checked: O,
              onChange: y.getToggleSelectedHandler()
            }
          ) }),
          y.getVisibleCells().map((z, W) => {
            const E = (vt == null ? void 0 : vt.rowIndex) === S && (vt == null ? void 0 : vt.columnId) === z.column.id, Y = el(y.original, z.column.id, _s), Z = (Vt == null ? void 0 : Vt.row) === S && (Vt == null ? void 0 : Vt.col) === W + 1, _t = l.has(z.column.id), at = dn && _t ? Fr(z.column.id, z.getValue()) : {};
            return /* @__PURE__ */ g(
              "td",
              {
                className: `eg-td${_t ? " eg-col-numeric" : ""}${E ? " editing" : ""}${z.column.getIsPinned() === "left" ? " pinned-left" : ""}${z.column.getIsPinned() === "right" ? " pinned-right" : ""}`,
                style: {
                  width: z.column.getSize(),
                  left: z.column.getIsPinned() === "left" ? `${z.column.getStart("left") + 44}px` : void 0,
                  right: z.column.getIsPinned() === "right" ? `${z.column.getAfter("right")}px` : void 0,
                  ...Y,
                  ...at
                },
                "data-row": S,
                "data-col": W + 1,
                tabIndex: Z ? 0 : -1,
                onClick: () => ms({ row: S, col: W + 1 }),
                onDoubleClick: () => {
                  const et = z.getValue();
                  ve({ rowIndex: S, columnId: z.column.id }), hn(String(et ?? ""));
                },
                onContextMenu: (et) => ys(et, "body", z.column.id, S),
                role: "gridcell",
                children: E ? /* @__PURE__ */ g(
                  "input",
                  {
                    autoFocus: !0,
                    type: l.has(vt.columnId) ? "number" : "text",
                    value: oi,
                    onChange: (et) => hn(et.target.value),
                    onBlur: ws,
                    onKeyDown: (et) => {
                      l.has(vt.columnId) && et.key.length === 1 && !/[\d.\-]/.test(et.key) && et.preventDefault(), et.key === "Enter" && ws(), et.key === "Escape" && ve(null);
                    }
                  }
                ) : z.getIsAggregated() ? hi(z.column.columnDef.aggregatedCell ?? z.column.columnDef.cell, z.getContext()) : hi(z.column.columnDef.cell, z.getContext())
              },
              z.id
            );
          })
        ]
      },
      y.id
    );
  };
  return /* @__PURE__ */ _(
    "div",
    {
      className: `eg-wrapper${Et ? " eg-fullscreen" : ""}${kt === "dark" ? " eg-dark" : ""}${De !== "normal" ? ` eg-${De}` : ""}${G === "virtual" ? " eg-virtual" : ""}`,
      style: Nr,
      ref: xs,
      tabIndex: -1,
      role: "grid",
      "aria-label": e || "Enterprise Data Grid",
      children: [
        /* @__PURE__ */ g(
          Ml,
          {
            showFilters: yt,
            onToggleFilters: () => dt((y) => !y),
            showGrouping: Pt,
            onToggleGrouping: () => Kt((y) => !y),
            isFullscreen: Et,
            onToggleFullscreen: () => le((y) => !y),
            isPivotView: Nt,
            onTogglePivot: () => qt((y) => !y),
            onExportCSV: () => we(),
            onExportExcel: () => Se(),
            onExportPDF: () => Oe(),
            onOpenChart: () => hs(!0),
            onOpenColumnChooser: () => cs((y) => !y),
            onOpenConditionalFormat: () => ds((y) => !y),
            onOpenSaveView: () => {
              ln(!0), cn(!1);
            },
            onOpenLoadView: () => {
              cn(!0), ln(!1);
            },
            onClearFilters: () => {
              N([]), J(""), $((y) => ({ ...y, pageIndex: 0 }));
            },
            onBestFitAll: ze,
            globalFilter: L,
            onGlobalFilterChange: J,
            theme: kt,
            onThemeToggle: () => Qa((y) => y === "light" ? "dark" : "light"),
            density: De,
            onDensityChange: tr,
            selectedCount: Object.keys(B).length,
            unsavedCount: _e.size,
            onSaveEdits: () => ai(/* @__PURE__ */ new Map()),
            onDiscardEdits: () => ai(/* @__PURE__ */ new Map()),
            pageSize: st.pageSize,
            onPageSizeChange: (y) => $({ pageIndex: 0, pageSize: y }),
            totalRows: r.length,
            filteredRows: Wt.length,
            hasActiveFilters: D.length > 0,
            hasActiveCondFormat: si.length > 0,
            activeFilterCount: D.length + (L ? 1 : 0),
            onOpenCustomize: () => fs(!0),
            rowModelType: G,
            onRowModelTypeChange: it,
            heatMapMode: dn,
            onToggleHeatMap: () => rr((y) => !y)
          }
        ),
        Object.keys(B).length > 0 && /* @__PURE__ */ _("div", { className: "eg-bulkbar", children: [
          /* @__PURE__ */ g("span", { className: "eg-toolbar-label", children: "Bulk Actions" }),
          /* @__PURE__ */ g(
            "button",
            {
              type: "button",
              className: "eg-btn eg-btn-sm",
              onClick: () => {
                const y = I.getSelectedRowModel().rows.map((S) => S.getVisibleCells().map((F) => String(F.getValue() ?? "")).join("	")).join(`
`);
                navigator.clipboard.writeText(y);
              },
              children: "Copy Selected"
            }
          ),
          /* @__PURE__ */ g("button", { type: "button", className: "eg-btn eg-btn-sm", onClick: () => we(void 0, !0), children: "Export Selected CSV" }),
          /* @__PURE__ */ g("button", { type: "button", className: "eg-btn eg-btn-sm", onClick: () => Se(void 0, !0), children: "Export Selected Excel" }),
          /* @__PURE__ */ g("button", { type: "button", className: "eg-btn eg-btn-sm", onClick: () => A({}), children: "Clear Selection" }),
          Object.keys(B).length >= 2 && /* @__PURE__ */ _(
            "button",
            {
              type: "button",
              className: "eg-btn eg-btn-sm eg-btn-primary",
              style: { marginLeft: 8 },
              onClick: () => us(!0),
              children: [
                "Compare (",
                Object.keys(B).length,
                ")"
              ]
            }
          )
        ] }),
        Pt && /* @__PURE__ */ _("div", { className: "eg-toolbar", style: { borderTop: "none" }, children: [
          /* @__PURE__ */ g("span", { className: "eg-toolbar-label", style: { fontWeight: 600 }, children: "Group by:" }),
          n.filter((y) => y.field && !l.has(y.field)).map((y) => {
            const S = y.field, F = M.includes(S);
            return /* @__PURE__ */ g(
              "button",
              {
                type: "button",
                className: `eg-btn eg-btn-sm ${F ? "eg-btn-primary" : ""}`,
                onClick: () => C(
                  (O) => F ? O.filter((z) => z !== S) : [...O, S]
                ),
                children: y.headerName ?? y.field
              },
              S
            );
          })
        ] }),
        Nt ? /* @__PURE__ */ g("div", { className: "eg-table-container", style: { padding: 16 }, children: /* @__PURE__ */ g(Hu, { data: Wt, columnDefs: n, gridId: s, onClose: () => qt(!1) }) }) : /* @__PURE__ */ _(Ut, { children: [
          /* @__PURE__ */ g(
            "div",
            {
              className: "eg-table-container",
              ref: ri,
              style: { minHeight: G === "virtual" ? "400px" : void 0 },
              children: /* @__PURE__ */ _(
                "table",
                {
                  className: "eg-table",
                  ref: bs,
                  style: { width: `max(100%, ${Cs}px)`, minWidth: Cs },
                  children: [
                    /* @__PURE__ */ _("thead", { className: "eg-thead", children: [
                      I.getHeaderGroups().map((y) => /* @__PURE__ */ _("tr", { role: "row", children: [
                        /* @__PURE__ */ g("th", { className: "eg-th eg-th-select", style: { width: 44 }, role: "columnheader", "aria-sort": "none", children: /* @__PURE__ */ g(
                          "input",
                          {
                            type: "checkbox",
                            className: "eg-checkbox",
                            checked: I.getIsAllPageRowsSelected(),
                            onChange: I.getToggleAllPageRowsSelectedHandler()
                          }
                        ) }),
                        y.headers.map((S) => {
                          const F = S.column.getIsSorted(), O = d.findIndex((W) => W.id === S.column.id), z = l.has(S.column.id);
                          return /* @__PURE__ */ _(
                            "th",
                            {
                              className: `eg-th${z ? " eg-col-numeric" : ""}${S.column.getIsPinned() === "left" ? " pinned-left" : ""}${S.column.getIsPinned() === "right" ? " pinned-right" : ""}`,
                              style: {
                                width: S.getSize(),
                                left: S.column.getIsPinned() === "left" ? `${S.column.getStart("left") + 44}px` : void 0,
                                right: S.column.getIsPinned() === "right" ? `${S.column.getAfter("right")}px` : void 0
                              },
                              onContextMenu: (W) => ys(W, "header", S.column.id),
                              role: "columnheader",
                              "aria-sort": F === "asc" ? "ascending" : F === "desc" ? "descending" : "none",
                              children: [
                                /* @__PURE__ */ _("div", { className: "eg-th-content", children: [
                                  /* @__PURE__ */ _(
                                    "div",
                                    {
                                      className: "eg-th-label",
                                      onClick: () => S.column.getCanSort() && S.column.toggleSorting(),
                                      children: [
                                        hi(S.column.columnDef.header, S.getContext()),
                                        F === "asc" && /* @__PURE__ */ _("span", { className: "eg-sort-icon", children: [
                                          "↑",
                                          d.length > 1 && O >= 0 && /* @__PURE__ */ g("span", { className: "eg-sort-index", children: O + 1 })
                                        ] }),
                                        F === "desc" && /* @__PURE__ */ _("span", { className: "eg-sort-icon", children: [
                                          "↓",
                                          d.length > 1 && O >= 0 && /* @__PURE__ */ g("span", { className: "eg-sort-index", children: O + 1 })
                                        ] })
                                      ]
                                    }
                                  ),
                                  /* @__PURE__ */ g("div", { className: "eg-th-actions", children: !S.column.id.startsWith("_") && /* @__PURE__ */ g(
                                    "button",
                                    {
                                      type: "button",
                                      className: `eg-th-filter-btn ${D.some((W) => W.columnId === S.column.id) ? "active" : ""}`,
                                      title: "Filter column",
                                      onClick: (W) => {
                                        W.stopPropagation(), ce === S.column.id ? (ni(null), ii(null)) : (ni(S.column.id), ii(W.currentTarget));
                                      },
                                      children: /* @__PURE__ */ g("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: /* @__PURE__ */ g("polygon", { points: "22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" }) })
                                    }
                                  ) })
                                ] }),
                                /* @__PURE__ */ g(
                                  "div",
                                  {
                                    className: `eg-resize-handle ${S.column.getIsResizing() ? "resizing" : ""}`,
                                    onMouseDown: S.getResizeHandler(),
                                    onTouchStart: S.getResizeHandler(),
                                    onClick: (W) => W.stopPropagation()
                                  }
                                )
                              ]
                            },
                            S.id
                          );
                        })
                      ] }, y.id)),
                      yt && /* @__PURE__ */ g(
                        Cl,
                        {
                          table: I,
                          filters: D,
                          onFilterChange: N,
                          data: r,
                          numericColIds: l
                        }
                      )
                    ] }),
                    /* @__PURE__ */ g("tbody", { children: Ce.length === 0 ? /* @__PURE__ */ g("tr", { children: /* @__PURE__ */ g("td", { colSpan: gn.length + 1, children: /* @__PURE__ */ _("div", { className: "eg-empty", children: [
                      /* @__PURE__ */ g("div", { className: "eg-empty-icon", children: "🔍" }),
                      /* @__PURE__ */ g("div", { className: "eg-empty-text", children: "No matching records found" })
                    ] }) }) }) : G === "virtual" ? /* @__PURE__ */ _(Ut, { children: [
                      (((Ms = Re.getVirtualItems()[0]) == null ? void 0 : Ms.start) ?? 0) > 0 && /* @__PURE__ */ g("tr", { children: /* @__PURE__ */ g("td", { colSpan: gn.length + 1, style: { height: ((Ts = Re.getVirtualItems()[0]) == null ? void 0 : Ts.start) ?? 0 } }) }),
                      Re.getVirtualItems().map((y) => {
                        const S = Ce[y.index];
                        return ks(S, y.index);
                      }),
                      (() => {
                        const y = Re.getVirtualItems(), S = y[y.length - 1], F = (S == null ? void 0 : S.end) ?? 0, O = Re.getTotalSize() - F;
                        return O > 0 ? /* @__PURE__ */ g("tr", { children: /* @__PURE__ */ g("td", { colSpan: gn.length + 1, style: { height: O } }) }) : null;
                      })()
                    ] }) : Ce.map((y, S) => ks(y, S)) })
                  ]
                }
              )
            }
          ),
          G !== "virtual" && /* @__PURE__ */ g(
            Tl,
            {
              pageIndex: I.getState().pagination.pageIndex,
              pageCount: I.getPageCount(),
              onPageChange: (y) => I.setPageIndex(y),
              canPreviousPage: I.getCanPreviousPage(),
              canNextPage: I.getCanNextPage(),
              rangeStart: Ce.length === 0 ? 0 : I.getState().pagination.pageIndex * I.getState().pagination.pageSize + 1,
              rangeEnd: I.getState().pagination.pageIndex * I.getState().pagination.pageSize + Ce.length,
              filteredTotal: Wt.length,
              total: r.length
            }
          )
        ] }),
        /* @__PURE__ */ _("div", { className: "eg-statusbar", children: [
          /* @__PURE__ */ _("div", { className: "eg-statusbar-left", children: [
            /* @__PURE__ */ _("span", { className: "eg-statusbar-item", children: [
              /* @__PURE__ */ g("span", { className: "eg-statusbar-dot eg-dot-total" }),
              /* @__PURE__ */ g("span", { className: "eg-statusbar-label", children: "Total:" }),
              /* @__PURE__ */ g("span", { className: "eg-statusbar-value", children: I.getCoreRowModel().rows.length.toLocaleString("en-US", { maximumFractionDigits: 2 }) })
            ] }),
            I.getFilteredRowModel().rows.length !== I.getCoreRowModel().rows.length && /* @__PURE__ */ _("span", { className: "eg-statusbar-item", children: [
              /* @__PURE__ */ g("span", { className: "eg-statusbar-dot eg-dot-filtered" }),
              /* @__PURE__ */ g("span", { className: "eg-statusbar-label", children: "Filtered:" }),
              /* @__PURE__ */ g("span", { className: "eg-statusbar-value", children: I.getFilteredRowModel().rows.length.toLocaleString("en-US", { maximumFractionDigits: 2 }) })
            ] }),
            Object.keys(B).length > 0 && /* @__PURE__ */ _("span", { className: "eg-statusbar-item", children: [
              /* @__PURE__ */ g("span", { className: "eg-statusbar-dot eg-dot-selected" }),
              /* @__PURE__ */ g("span", { className: "eg-statusbar-label", children: "Selected:" }),
              /* @__PURE__ */ g("span", { className: "eg-statusbar-value", children: Object.keys(B).length.toLocaleString("en-US", { maximumFractionDigits: 2 }) })
            ] }),
            D.length > 0 && /* @__PURE__ */ _("span", { className: "eg-statusbar-item", children: [
              /* @__PURE__ */ g("span", { className: "eg-statusbar-dot eg-dot-filter" }),
              /* @__PURE__ */ g("span", { className: "eg-statusbar-label", children: "Filters:" }),
              /* @__PURE__ */ _("span", { className: "eg-statusbar-value", children: [
                D.length,
                " active"
              ] })
            ] }),
            M.length > 0 && /* @__PURE__ */ _("span", { className: "eg-statusbar-item", children: [
              /* @__PURE__ */ g("span", { className: "eg-statusbar-dot eg-dot-group" }),
              /* @__PURE__ */ g("span", { className: "eg-statusbar-label", children: "Grouped by:" }),
              /* @__PURE__ */ g("span", { className: "eg-statusbar-value", children: M.join(", ") })
            ] }),
            _e.size > 0 && /* @__PURE__ */ _("span", { className: "eg-statusbar-item", children: [
              /* @__PURE__ */ g("span", { className: "eg-statusbar-dot eg-dot-edited" }),
              /* @__PURE__ */ g("span", { className: "eg-statusbar-label", children: "Edited:" }),
              /* @__PURE__ */ _("span", { className: "eg-statusbar-value", children: [
                _e.size,
                " cells"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ g("div", { className: "eg-statusbar-right", children: Ss && Ss.map((y, S) => /* @__PURE__ */ _("span", { className: "eg-statusbar-item", children: [
            /* @__PURE__ */ _("span", { className: "eg-statusbar-label", children: [
              y.label,
              " ",
              y.agg,
              ":"
            ] }),
            /* @__PURE__ */ g("span", { className: "eg-statusbar-value eg-statusbar-agg", children: y.value.toLocaleString("en-US", { maximumFractionDigits: 2 }) })
          ] }, S)) })
        ] }),
        K && /* @__PURE__ */ g(
          kl,
          {
            menu: K,
            onClose: dr,
            headerActions: Cr,
            bodyActions: kr
          }
        ),
        er && /* @__PURE__ */ g(Bl, { table: I, onClose: () => cs(!1) }),
        nr && /* @__PURE__ */ g(
          Fl,
          {
            columnDefs: n,
            customRules: si,
            onAddCustomRule: Br,
            onRemoveCustomRule: Ar,
            onClose: () => ds(!1)
          }
        ),
        (ir || sr) && /* @__PURE__ */ g(
          Pl,
          {
            views: hr,
            onSave: Mr,
            onLoad: Tr,
            onDelete: fr,
            onSetDefault: ur,
            onClose: () => {
              ln(!1), cn(!1);
            }
          }
        ),
        ar && /* @__PURE__ */ g(
          $u,
          {
            colors: lt,
            onChange: cr,
            onClose: () => fs(!1)
          }
        ),
        or && /* @__PURE__ */ g(Eu, { data: Wt, columnDefs: n, gridId: s, onClose: () => hs(!1) }),
        ce && gs && /* @__PURE__ */ g(
          Yu,
          {
            column: I.getColumn(ce),
            currentFilter: D.find((y) => y.columnId === ce),
            isNumeric: l.has(ce),
            onFilterChange: Sr,
            onClose: () => {
              ni(null), ii(null);
            },
            anchorEl: gs
          }
        ),
        lr && /* @__PURE__ */ g(
          Gu,
          {
            rows: I.getSelectedRowModel().rows.map((y) => y.original),
            columnDefs: n,
            onClose: () => us(!1)
          }
        )
      ]
    }
  );
}
const Ku = [
  "James",
  "Mary",
  "Robert",
  "Patricia",
  "John",
  "Jennifer",
  "Michael",
  "Linda",
  "David",
  "Elizabeth",
  "William",
  "Barbara",
  "Richard",
  "Susan",
  "Joseph",
  "Jessica",
  "Thomas",
  "Sarah",
  "Charles",
  "Karen",
  "Christopher",
  "Lisa",
  "Daniel",
  "Nancy",
  "Matthew",
  "Betty",
  "Anthony",
  "Margaret",
  "Mark",
  "Sandra",
  "Donald",
  "Ashley",
  "Steven",
  "Kimberly",
  "Paul",
  "Emily",
  "Andrew",
  "Donna",
  "Joshua",
  "Michelle",
  "Kenneth",
  "Carol",
  "Kevin",
  "Amanda",
  "Brian",
  "Dorothy",
  "George",
  "Melissa"
], qu = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
  "Walker",
  "Young",
  "Allen",
  "King",
  "Wright",
  "Scott",
  "Torres",
  "Nguyen",
  "Hill",
  "Flores"
], Ju = ["HR", "Engineering", "Finance", "Sales", "Operations"], Zu = ["USA", "UK", "India", "Germany", "Australia"];
function Qu(n) {
  let t = n;
  return () => (t = (t * 16807 + 0) % 2147483647, (t - 1) / 2147483646);
}
function Xn(n, t) {
  return n[Math.floor(t() * n.length)];
}
function Qo(n) {
  return `${Xn(Ku, n)} ${Xn(qu, n)}`;
}
function tg(n) {
  const t = Date.now(), e = 10 * 365.25 * 24 * 60 * 60 * 1e3, i = t - Math.floor(n() * e);
  return new Date(i).toISOString();
}
function rg(n = 200) {
  const t = Qu(42), e = [];
  for (let i = 1; i <= n; i++)
    e.push({
      id: i,
      name: Qo(t),
      department: Xn(Ju, t),
      salary: Math.round((3e4 + t() * 15e4) / 100) * 100,
      startDate: tg(t),
      isActive: t() > 0.2,
      performance: Math.ceil(t() * 5),
      country: Xn(Zu, t),
      bonusPercent: Math.round(t() * 30 * 10) / 10,
      manager: Qo(t)
    });
  return e;
}
export {
  ag as EnterpriseGrid,
  rg as generateEnterpriseGridData
};
