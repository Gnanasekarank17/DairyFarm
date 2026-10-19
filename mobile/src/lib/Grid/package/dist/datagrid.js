import { jsxs as o, jsx as e, Fragment as Z } from "react/jsx-runtime";
import { useEffect as G, useRef as ae, useState as $, useCallback as W, useMemo as U, Fragment as nl } from "react";
import { c as Jl, u as _l, a as Yl, f as rl, B as Xl, S as Ql, g as Zl, b as en } from "./license-BDHB6t-k.js";
import { E as tn } from "./jspdf.es.min-EWkPWmJW.js";
import { autoTable as ln } from "./jspdf.plugin.autotable-BWwdgleA.js";
import { Search as nt, X as q, Filter as rt, SlidersHorizontal as pl, ListFilter as gl, RotateCcw as xl, LayoutGrid as bl, Palette as vl, TableProperties as yl, FileSpreadsheet as At, FileText as Mt, Download as Nl, AlignJustify as nn, AlignCenter as rn, AlignStartVertical as on, FileDown as Ge, FolderOpen as st, Check as wl, Minimize2 as ol, Maximize2 as al, Loader2 as sl, GripVertical as an, ArrowUpDown as il, ChevronUp as sn, ChevronDown as cl, Pin as Ft, BarChart3 as Tt, ChevronRight as dl, Sigma as cn, ChevronsLeft as dn, ChevronLeft as un, ChevronsRight as mn, Columns3 as Cl, Trash2 as kl, Plus as Sl, ArrowUp as fn, ArrowDown as hn, EyeOff as pn, RectangleVertical as gn, PinOff as xn, Copy as bn, ClipboardCopy as vn, PieChart as yn } from "lucide-react";
const ul = "PCB-Grid", Nn = {
  compact: { headerPy: "py-1.5", cellPy: "py-1", cellText: "text-xs", label: "Compact", fontSize: 12 },
  comfortable: { headerPy: "py-2", cellPy: "py-1.5", cellText: "text-[13px]", label: "Comfortable", fontSize: 13 },
  spacious: { headerPy: "py-3", cellPy: "py-2.5", cellText: "text-sm", label: "Spacious", fontSize: 14 }
}, wn = [
  { value: "contains", label: "Contains", types: ["text"] },
  { value: "equals", label: "Equals", types: ["text", "number"] },
  { value: "startsWith", label: "Starts With", types: ["text"] },
  { value: "endsWith", label: "Ends With", types: ["text"] },
  { value: "!=", label: "Not Equals", types: ["text", "number"] },
  { value: ">", label: "Greater Than", types: ["number"] },
  { value: "<", label: "Less Than", types: ["number"] },
  { value: ">=", label: "Greater or Equal", types: ["number"] },
  { value: "<=", label: "Less or Equal", types: ["number"] },
  { value: "between", label: "Between", types: ["number"] }
];
function Cn(r, n) {
  const g = r.filter((b) => b.aggregate && b.field);
  if (g.length === 0) return null;
  const f = {};
  for (const b of g) {
    const v = b.field, m = b.aggregate ?? "sum", x = n.map((a) => Number(a[v])).filter((a) => !isNaN(a));
    let C = 0;
    switch (m) {
      case "sum":
        C = x.reduce((a, c) => a + c, 0);
        break;
      case "avg":
        C = x.length ? x.reduce((a, c) => a + c, 0) / x.length : 0;
        break;
      case "count":
        C = x.length;
        break;
      case "min":
        C = x.length ? Math.min(...x) : 0;
        break;
      case "max":
        C = x.length ? Math.max(...x) : 0;
        break;
    }
    f[v] = {
      label: m.toUpperCase(),
      value: m === "count" ? String(C) : C.toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    };
  }
  return f;
}
function Lt(r, n) {
  return n ? r.map((g, f) => {
    const b = g.field && n[g.field];
    return b ? `${b.label}: ${b.value}` : f === 0 ? "Totals" : "";
  }) : null;
}
function Dt(r) {
  var n;
  return r == null || typeof r == "boolean" ? "" : typeof r == "string" || typeof r == "number" ? String(r) : Array.isArray(r) ? r.map(Dt).join("") : typeof r == "object" && "props" in r ? Dt((n = r.props) == null ? void 0 : n.children) : "";
}
function kn(r, n) {
  const g = typeof r.valueGetter == "function" ? r.valueGetter({ data: n }) : r.field ? n[r.field] : void 0;
  if (typeof r.valueFormatter == "function") {
    const f = r.valueFormatter({ value: g, data: n });
    return f != null ? String(f) : "";
  }
  if (typeof r.cellRenderer == "function") {
    const f = r.cellRenderer({ value: g, data: n, node: { data: n } }), b = Dt(f);
    if (b.trim()) return b;
  }
  return g != null ? String(g) : "";
}
function Sn(r, n, g) {
  if (!g.length) return;
  const f = $l(r, g), b = n ? Dl(r, n, g) : void 0;
  if (!(!f && !b))
    return { ...f, ...b };
}
function Rt(r, n, g = []) {
  const f = r.filter((m) => !m.hide && (m.field || m.valueGetter)), b = f.map((m) => m.headerName ?? m.field ?? ""), v = n.map((m) => ({
    cells: f.map((x) => ({
      text: kn(x, m),
      style: Sn(m, x.field, g)
    }))
  }));
  return { headers: b, exportCols: f, rows: v };
}
function Ae(r) {
  return r.includes(",") || r.includes('"') || r.includes(`
`) ? `"${r.replace(/"/g, '""')}"` : r;
}
function kt(r) {
  return r.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function $t(r, n, g, f = null) {
  const { headers: b, exportCols: v, rows: m } = Rt(r, n), x = [b.map(Ae).join(",")];
  m.forEach((a) => x.push(a.cells.map((c) => Ae(c.text)).join(",")));
  const C = Lt(v, f);
  C && x.push(C.map(Ae).join(",")), it(new Blob([x.join(`
`)], { type: "text/csv;charset=utf-8;" }), g);
}
function ml(r) {
  return r.startsWith("#") ? r.toUpperCase() : "#000000";
}
function Et(r, n, g, f = [], b = null) {
  const { headers: v, exportCols: m, rows: x } = Rt(r, n, f), C = (w) => w !== "" && !isNaN(Number(w)), a = /* @__PURE__ */ new Map();
  let c = 0;
  const d = (w) => {
    if (!w) return;
    const k = w.backgroundColor ?? "", E = w.color ?? "", T = w.fontWeight === 700 || w.fontWeight === "bold";
    if (!k && !E && !T) return;
    const O = `${k}|${E}|${T}`;
    return a.has(O) || a.set(O, `cf${++c}`), a.get(O);
  }, i = x.map((w) => w.cells.map((k) => d(k.style)));
  let s = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
`;
  s += `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
`, s += `<Styles><Style ss:ID="hdr"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#334155" ss:Pattern="Solid"/></Style>
`, s += `<Style ss:ID="totals"><Font ss:Bold="1"/><Interior ss:Color="#EFF6FF" ss:Pattern="Solid"/></Style>
`;
  for (const [w, k] of a) {
    const [E, T, O] = w.split("|");
    s += `<Style ss:ID="${k}">`, (T || O === "true") && (s += `<Font${T ? ` ss:Color="${ml(T)}"` : ""}${O === "true" ? ' ss:Bold="1"' : ""}/>`), E && (s += `<Interior ss:Color="${ml(E)}" ss:Pattern="Solid"/>`), s += `</Style>
`;
  }
  s += `</Styles>
`, s += `<Worksheet ss:Name="Sheet1"><Table>
`, s += '<Row ss:StyleID="hdr">', v.forEach((w) => {
    s += `<Cell><Data ss:Type="String">${kt(w)}</Data></Cell>`;
  }), s += `</Row>
`, x.forEach((w, k) => {
    s += "<Row>", w.cells.forEach((E, T) => {
      const O = i[k][T], le = C(E.text) ? "Number" : "String";
      s += `<Cell${O ? ` ss:StyleID="${O}"` : ""}><Data ss:Type="${le}">${kt(E.text)}</Data></Cell>`;
    }), s += `</Row>
`;
  });
  const D = Lt(m, b);
  D && (s += '<Row ss:StyleID="totals">', D.forEach((w) => {
    s += `<Cell><Data ss:Type="String">${kt(w)}</Data></Cell>`;
  }), s += `</Row>
`), s += "</Table></Worksheet></Workbook>", it(new Blob([s], { type: "application/vnd.ms-excel" }), g);
}
function Vt(r, n, g, f = [], b = null) {
  const { headers: v, exportCols: m, rows: x } = Rt(r, n, f), C = Lt(m, b), a = g.replace(/\.pdf$/i, ""), c = new tn({ orientation: v.length > 6 ? "landscape" : "portrait" });
  c.setFontSize(14), c.setTextColor("#334155"), c.text(a, 14, 15), c.setFontSize(9), c.setTextColor("#64748b"), c.text(`${n.length.toLocaleString()} rows  ·  Exported ${(/* @__PURE__ */ new Date()).toLocaleString()}`, 14, 21), ln(c, {
    startY: 26,
    head: [v],
    body: x.map((d) => d.cells.map((i) => i.text)),
    foot: C ? [C] : void 0,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    footStyles: { fillColor: [239, 246, 255], textColor: [15, 23, 42], fontStyle: "bold" },
    didParseCell: (d) => {
      var s, D;
      if (d.section !== "body") return;
      const i = (D = (s = x[d.row.index]) == null ? void 0 : s.cells[d.column.index]) == null ? void 0 : D.style;
      i != null && i.backgroundColor && (d.cell.styles.fillColor = String(i.backgroundColor)), i != null && i.color && (d.cell.styles.textColor = String(i.color)), ((i == null ? void 0 : i.fontWeight) === "bold" || Number(i == null ? void 0 : i.fontWeight) >= 600) && (d.cell.styles.fontStyle = "bold");
    }
  }), it(c.output("blob"), g);
}
function it(r, n) {
  const g = URL.createObjectURL(r), f = document.createElement("a");
  f.href = g, f.download = n, document.body.appendChild(f), f.click(), document.body.removeChild(f), URL.revokeObjectURL(g);
}
function Fn({
  columns: r,
  data: n,
  filename: g,
  condRules: f,
  aggregations: b
}) {
  const [v, m] = $(!1), x = ae(null);
  return G(() => {
    function a(c) {
      x.current && !x.current.contains(c.target) && m(!1);
    }
    return document.addEventListener("mousedown", a), () => document.removeEventListener("mousedown", a);
  }, []), /* @__PURE__ */ o("div", { ref: x, className: "relative h-full", children: [
    /* @__PURE__ */ e(
      "button",
      {
        onClick: () => m(!v),
        className: "h-full px-2.5 flex items-center text-slate-300 hover:bg-slate-700/70 hover:text-white transition-colors",
        title: "Export",
        children: /* @__PURE__ */ e(Nl, { className: "h-4 w-4" })
      }
    ),
    v && /* @__PURE__ */ e("div", { className: "absolute right-0 mt-0.5 w-44 rounded-lg border bg-white dark:bg-slate-800  shadow-lg z-50 py-1 animate-in fade-in-0 zoom-in-95 duration-150", children: [
      {
        icon: Ge,
        label: "Export CSV",
        ext: ".csv",
        fn: () => $t(r, n, `${g}.csv`, b)
      },
      {
        icon: At,
        label: "Export Excel",
        ext: ".xls",
        fn: () => Et(r, n, `${g}.xls`, f, b)
      },
      {
        icon: Mt,
        label: "Export PDF",
        ext: ".pdf",
        fn: () => Vt(r, n, `${g}.pdf`, f, b)
      }
    ].map((a) => /* @__PURE__ */ o(
      "button",
      {
        onClick: () => {
          a.fn(), m(!1);
        },
        className: "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors",
        children: [
          /* @__PURE__ */ e(a.icon, { className: "h-4 w-4 text-muted-foreground" }),
          a.label
        ]
      },
      a.ext
    )) })
  ] });
}
function Dn({
  state: r,
  onClose: n,
  onCopyCell: g,
  onCopyRow: f,
  onExportCsv: b,
  onExportExcel: v,
  onExportPdf: m,
  onSortAsc: x,
  onSortDesc: C,
  onClearSort: a,
  onHideColumn: c,
  onAutoFitColumns: d,
  onBestFitColumn: i,
  onPinLeft: s,
  onPinRight: D,
  onUnpin: w,
  isPinned: k,
  onGroupByThis: E,
  isGrouped: T,
  onChartColumn: O,
  onOpenFilterEditor: le,
  onColumnChooser: Me,
  onBestFitAll: Te
}) {
  const Y = ae(null);
  G(() => {
    function V(te) {
      Y.current && !Y.current.contains(te.target) && n();
    }
    function X(te) {
      te.key === "Escape" && n();
    }
    return document.addEventListener("mousedown", V), document.addEventListener("keydown", X), () => {
      document.removeEventListener("mousedown", V), document.removeEventListener("keydown", X);
    };
  }, [n]);
  const [Le, ct] = $({ x: r.x, y: r.y });
  G(() => {
    if (!Y.current) return;
    const V = Y.current.getBoundingClientRect(), X = V.right > window.innerWidth ? r.x - V.width : r.x, te = V.bottom > window.innerHeight ? r.y - V.height : r.y;
    ct({ x: Math.max(0, X), y: Math.max(0, te) });
  }, [r.x, r.y]);
  const ee = () => /* @__PURE__ */ e("div", { className: "my-1 border-t border-gray-200" }), j = ({
    icon: V,
    label: X,
    onClick: te,
    danger: ye,
    iconColor: Ne
  }) => /* @__PURE__ */ o(
    "button",
    {
      onClick: () => {
        te(), n();
      },
      className: `flex w-full items-center gap-2.5 px-3 py-[5px] text-[13px] transition-colors ${ye ? "text-red-600 hover:bg-red-50" : "hover:bg-gray-100"}`,
      children: [
        /* @__PURE__ */ e(V, { className: `h-4 w-4 ${Ne ?? "text-gray-400"}` }),
        /* @__PURE__ */ e("span", { children: X })
      ]
    }
  );
  return /* @__PURE__ */ o(
    "div",
    {
      ref: Y,
      className: "fixed rounded-lg border border-gray-200 shadow-2xl z-[100] py-1.5 min-w-[220px] animate-in fade-in-0 zoom-in-95 duration-100 backdrop-blur-sm",
      style: { left: Le.x, top: Le.y, backgroundColor: "rgba(255,255,255,0.98)" },
      children: [
        r.colField && /* @__PURE__ */ o(Z, { children: [
          /* @__PURE__ */ e(j, { icon: fn, label: "Sort Ascending", onClick: x, iconColor: "text-emerald-500" }),
          /* @__PURE__ */ e(j, { icon: hn, label: "Sort Descending", onClick: C, iconColor: "text-emerald-500" }),
          /* @__PURE__ */ e(j, { icon: xl, label: "Clear Sorting", onClick: a, iconColor: "text-gray-400" }),
          /* @__PURE__ */ e(ee, {}),
          /* @__PURE__ */ e(
            j,
            {
              icon: st,
              label: T ? "Remove Grouping" : "Group By This Column",
              onClick: E,
              iconColor: "text-blue-500"
            }
          ),
          /* @__PURE__ */ e(ee, {}),
          /* @__PURE__ */ e(j, { icon: pn, label: "Hide This Column", onClick: c, iconColor: "text-amber-500" }),
          /* @__PURE__ */ e(j, { icon: Cl, label: "Column Chooser", onClick: Me, iconColor: "text-violet-500" }),
          /* @__PURE__ */ e(ee, {}),
          /* @__PURE__ */ e(j, { icon: gn, label: "Best Fit", onClick: i, iconColor: "text-teal-500" }),
          /* @__PURE__ */ e(j, { icon: bl, label: "Best Fit (all columns)", onClick: Te, iconColor: "text-teal-500" }),
          /* @__PURE__ */ e(ee, {}),
          k ? /* @__PURE__ */ e(j, { icon: xn, label: "Unpin Column", onClick: w, iconColor: "text-orange-500" }) : /* @__PURE__ */ o(Z, { children: [
            /* @__PURE__ */ e(j, { icon: Ft, label: "Freeze Left", onClick: s, iconColor: "text-orange-500" }),
            /* @__PURE__ */ e(j, { icon: Ft, label: "Freeze Right", onClick: D, iconColor: "text-orange-500" })
          ] }),
          /* @__PURE__ */ e(ee, {}),
          /* @__PURE__ */ e(j, { icon: gl, label: "Filter Editor...", onClick: le, iconColor: "text-indigo-500" }),
          /* @__PURE__ */ e(j, { icon: Tt, label: "Chart This Column", onClick: O, iconColor: "text-pink-500" }),
          /* @__PURE__ */ e(ee, {})
        ] }),
        /* @__PURE__ */ e(j, { icon: bn, label: "Copy Cell", onClick: g, iconColor: "text-gray-500" }),
        /* @__PURE__ */ e(j, { icon: vn, label: "Copy Row", onClick: f, iconColor: "text-gray-500" }),
        /* @__PURE__ */ e(ee, {}),
        /* @__PURE__ */ e(j, { icon: Ge, label: "Export CSV", onClick: b, iconColor: "text-green-600" }),
        /* @__PURE__ */ e(j, { icon: At, label: "Export Excel", onClick: v, iconColor: "text-green-700" }),
        /* @__PURE__ */ e(j, { icon: Mt, label: "Export PDF", onClick: m, iconColor: "text-red-500" })
      ]
    }
  );
}
function $n(r = []) {
  return r.filter((n) => !n.hide).map((n) => {
    const g = n.colId ?? n.field ?? void 0, f = n.type === "numericColumn" || n.type === "rightAligned" || Array.isArray(n.type) && (n.type.includes("numericColumn") || n.type.includes("rightAligned")), b = {
      id: g,
      header: n.headerName ?? n.field ?? "",
      enableSorting: n.sortable !== !1,
      enableColumnFilter: n.filter !== !1,
      size: n.width ?? n.minWidth ?? (n.flex ? void 0 : 150),
      minSize: n.minWidth ?? 80,
      maxSize: n.maxWidth
    };
    if (typeof n.valueGetter == "function") {
      const v = n.valueGetter;
      b.accessorFn = (m) => v({ data: m });
    } else n.field && (b.accessorKey = n.field);
    if (n.cellRenderer === "badge") {
      const v = n.badgeMap;
      b.cell = ({ getValue: m, row: x }) => /* @__PURE__ */ e(Ve, { cellStyle: n.cellStyle, data: x.original, value: m(), isNumeric: !1, tooltipField: n.tooltipField, children: /* @__PURE__ */ e(Xl, { value: m(), badgeMap: v }) });
    } else if (n.cellRenderer === "sparkline" || n.cellRenderer === "sparkline-line") {
      const v = n.cellRenderer === "sparkline-line" ? "line" : "bar", m = n.sparklineColor;
      b.cell = ({ getValue: x, row: C }) => {
        const a = x(), c = Array.isArray(a) ? a.map(Number) : typeof a == "string" ? a.split(",").map((d) => Number(d.trim())).filter((d) => !isNaN(d)) : [];
        return /* @__PURE__ */ e(Ve, { cellStyle: n.cellStyle, data: C.original, value: x(), isNumeric: !1, tooltipField: n.tooltipField, children: /* @__PURE__ */ e(Ql, { value: c, type: v, color: m }) });
      };
    } else if (typeof n.cellRenderer == "function") {
      const v = n.cellRenderer;
      b.cell = ({ getValue: m, row: x }) => {
        const C = v({
          value: m(),
          data: x.original,
          node: { data: x.original }
        });
        return /* @__PURE__ */ e(
          Ve,
          {
            cellStyle: n.cellStyle,
            data: x.original,
            value: m(),
            isNumeric: f,
            tooltipField: n.tooltipField,
            children: C
          }
        );
      };
    } else if (n.valueFormatter) {
      const v = n.valueFormatter;
      b.cell = ({ getValue: m, row: x }) => /* @__PURE__ */ e(
        Ve,
        {
          cellStyle: n.cellStyle,
          data: x.original,
          value: m(),
          isNumeric: f,
          tooltipField: n.tooltipField,
          children: typeof v == "function" ? v({ value: m(), data: x.original }) : m() !== null && m() !== void 0 ? String(m()) : ""
        }
      );
    } else
      b.cell = ({ getValue: v, row: m }) => {
        const x = v();
        if (typeof x == "boolean" || x === "true" || x === "false") {
          const C = x === !0 || x === "true";
          return /* @__PURE__ */ e(
            Ve,
            {
              cellStyle: n.cellStyle,
              data: m.original,
              value: x,
              isNumeric: !1,
              tooltipField: n.tooltipField,
              children: /* @__PURE__ */ e("span", { className: "flex items-center justify-center", children: C ? /* @__PURE__ */ e(wl, { className: "h-4 w-4 text-emerald-600" }) : /* @__PURE__ */ e(q, { className: "h-4 w-4 text-gray-300" }) })
            }
          );
        }
        return /* @__PURE__ */ e(
          Ve,
          {
            cellStyle: n.cellStyle,
            data: m.original,
            value: x,
            isNumeric: f,
            tooltipField: n.tooltipField,
            children: x != null ? String(x) : ""
          }
        );
      };
    return b.meta = {
      pinned: n.pinned,
      isNumeric: f,
      flex: n.flex,
      headerTooltip: n.headerTooltip,
      field: n.field,
      headerName: n.headerName ?? n.field ?? ""
    }, b;
  });
}
function Ve({
  children: r,
  cellStyle: n,
  data: g,
  value: f,
  isNumeric: b,
  tooltipField: v
}) {
  let m;
  typeof n == "function" ? m = n({ data: g, value: f }) ?? void 0 : n && (m = n);
  const x = v ? String(g[v] ?? "") : void 0;
  return /* @__PURE__ */ e("span", { className: b ? "block text-right tabular-nums" : void 0, style: m, title: x, children: r });
}
function En({
  columns: r,
  filters: n,
  onFiltersChange: g,
  onClose: f
}) {
  const b = r.filter((c) => c.field && c.filter !== !1), v = () => {
    var d;
    const c = ((d = b[0]) == null ? void 0 : d.field) ?? "";
    g([...n, { id: crypto.randomUUID(), field: c, operator: "contains", value: "" }]);
  }, m = (c, d) => {
    g(n.map((i) => i.id === c ? { ...i, ...d } : i));
  }, x = (c) => {
    g(n.filter((d) => d.id !== c));
  }, C = () => {
    g([]), f();
  }, a = (c) => {
    const d = r.find((s) => s.field === c);
    if (!d) return "text";
    const i = d.type;
    return i === "numericColumn" || i === "rightAligned" || Array.isArray(i) && (i.includes("numericColumn") || i.includes("rightAligned")) ? "number" : "text";
  };
  return /* @__PURE__ */ o("div", { className: "rounded-lg border bg-card p-4 shadow-lg space-y-3 animate-in slide-in-from-top-2 duration-200", children: [
    /* @__PURE__ */ o("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ o("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ e(pl, { className: "h-4 w-4 text-primary" }),
        /* @__PURE__ */ e("h3", { className: "text-sm font-semibold", children: "Advanced Filters" })
      ] }),
      /* @__PURE__ */ e("button", { onClick: f, className: "rounded-md p-1 hover:bg-muted", children: /* @__PURE__ */ e(q, { className: "h-4 w-4" }) })
    ] }),
    n.length === 0 && /* @__PURE__ */ e("p", { className: "text-sm text-muted-foreground py-2", children: 'No filters applied. Click "Add Condition" to start filtering.' }),
    n.map((c) => {
      const d = a(c.field), i = wn.filter((s) => s.types.includes(d));
      return /* @__PURE__ */ o("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ e(
          "select",
          {
            className: "h-8 rounded-md border bg-background px-2 text-sm min-w-[140px]",
            value: c.field,
            onChange: (s) => m(c.id, { field: s.target.value, operator: "contains", value: "" }),
            children: b.map((s) => /* @__PURE__ */ e("option", { value: s.field, children: s.headerName ?? s.field }, s.field))
          }
        ),
        /* @__PURE__ */ e(
          "select",
          {
            className: "h-8 rounded-md border bg-background px-2 text-sm min-w-[130px]",
            value: c.operator,
            onChange: (s) => m(c.id, { operator: s.target.value }),
            children: i.map((s) => /* @__PURE__ */ e("option", { value: s.value, children: s.label }, s.value))
          }
        ),
        /* @__PURE__ */ e(
          "input",
          {
            type: d === "number" ? "number" : "text",
            className: "h-8 rounded-md border bg-background px-2 text-sm min-w-[140px] flex-1 max-w-[200px]",
            placeholder: "Value...",
            value: c.value,
            onChange: (s) => m(c.id, { value: s.target.value })
          }
        ),
        c.operator === "between" && /* @__PURE__ */ o(Z, { children: [
          /* @__PURE__ */ e("span", { className: "text-xs text-muted-foreground", children: "and" }),
          /* @__PURE__ */ e(
            "input",
            {
              type: d === "number" ? "number" : "text",
              className: "h-8 rounded-md border bg-background px-2 text-sm min-w-[140px] flex-1 max-w-[200px]",
              placeholder: "To...",
              value: c.valueTo ?? "",
              onChange: (s) => m(c.id, { valueTo: s.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: () => x(c.id),
            className: "rounded-md p-1.5 text-destructive hover:bg-destructive/10",
            children: /* @__PURE__ */ e(kl, { className: "h-3.5 w-3.5" })
          }
        )
      ] }, c.id);
    }),
    /* @__PURE__ */ o("div", { className: "flex items-center justify-between pt-2 border-t", children: [
      /* @__PURE__ */ o(
        "button",
        {
          onClick: v,
          className: "inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80",
          children: [
            /* @__PURE__ */ e(Sl, { className: "h-3.5 w-3.5" }),
            " ",
            "Add Condition"
          ]
        }
      ),
      /* @__PURE__ */ o("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ e(
          "button",
          {
            onClick: C,
            className: "inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs hover:bg-muted",
            children: "Clear All"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: f,
            className: "inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:bg-primary/90",
            children: "Apply"
          }
        )
      ] })
    ] })
  ] });
}
const fl = [
  { value: "gt", label: "greater than", needsValue: !0 },
  { value: "lt", label: "less than", needsValue: !0 },
  { value: "gte", label: "greater or equal", needsValue: !0 },
  { value: "lte", label: "less or equal", needsValue: !0 },
  { value: "eq", label: "equals", needsValue: !0 },
  { value: "neq", label: "not equal", needsValue: !0 },
  { value: "between", label: "between", needsValue: !0, needsValue2: !0 },
  { value: "contains", label: "contains", needsValue: !0 },
  { value: "startsWith", label: "starts with", needsValue: !0 },
  { value: "isEmpty", label: "is empty", needsValue: !1 },
  { value: "isTrue", label: "is true", needsValue: !1 },
  { value: "isFalse", label: "is false", needsValue: !1 }
], St = [
  { label: "Red", bg: "#fee2e2", fg: "#b91c1c" },
  { label: "Green", bg: "#dcfce7", fg: "#15803d" },
  { label: "Amber", bg: "#fef9c3", fg: "#a16207" },
  { label: "Blue", bg: "#dbeafe", fg: "#1d4ed8" },
  { label: "Violet", bg: "#ede9fe", fg: "#6d28d9" },
  { label: "Slate", bg: "#e2e8f0", fg: "#334155" }
];
function Fl(r, n) {
  const g = Number(r), f = Number(n.value1), b = String(r ?? "").toLowerCase(), v = (n.value1 ?? "").toLowerCase();
  switch (n.operator) {
    case "gt":
      return !isNaN(g) && !isNaN(f) && g > f;
    case "lt":
      return !isNaN(g) && !isNaN(f) && g < f;
    case "gte":
      return !isNaN(g) && !isNaN(f) && g >= f;
    case "lte":
      return !isNaN(g) && !isNaN(f) && g <= f;
    case "eq":
      return b === v;
    case "neq":
      return b !== v;
    case "between": {
      const m = Number(n.value2);
      return !isNaN(g) && !isNaN(f) && !isNaN(m) && g >= f && g <= m;
    }
    case "contains":
      return v !== "" && b.includes(v);
    case "startsWith":
      return v !== "" && b.startsWith(v);
    case "isEmpty":
      return r == null || b === "";
    case "isTrue":
      return r === !0 || b === "true";
    case "isFalse":
      return r === !1 || b === "false";
    default:
      return !1;
  }
}
function Dl(r, n, g) {
  for (const f of g)
    if (!(f.scope !== "cell" || f.field !== n) && Fl(r == null ? void 0 : r[f.field], f))
      return { backgroundColor: f.bg, color: f.fg, ...f.bold ? { fontWeight: 700 } : {} };
}
function $l(r, n) {
  for (const g of n)
    if (g.scope === "row" && Fl(r == null ? void 0 : r[g.field], g))
      return { backgroundColor: g.bg, color: g.fg, ...g.bold ? { fontWeight: 700 } : {} };
}
function Vn({
  columns: r,
  rules: n,
  onRulesChange: g,
  onClose: f
}) {
  const b = (c) => c.field ?? c.colId ?? "", v = r.filter((c) => !!c.field || !!c.colId), m = () => {
    const c = b(v[0]) ?? "";
    g([
      ...n,
      {
        id: crypto.randomUUID(),
        field: c,
        operator: "gt",
        value1: "",
        value2: "",
        bg: St[0].bg,
        fg: St[0].fg,
        scope: "cell",
        bold: !1
      }
    ]);
  }, x = (c, d) => g(n.map((i) => i.id === c ? { ...i, ...d } : i)), C = (c) => g(n.filter((d) => d.id !== c)), a = () => {
    g([]), f();
  };
  return /* @__PURE__ */ o("div", { className: "rounded-lg border bg-card p-4 shadow-lg space-y-3 animate-in slide-in-from-top-2 duration-200", children: [
    /* @__PURE__ */ o("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ o("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ e(vl, { className: "h-4 w-4 text-amber-600" }),
        /* @__PURE__ */ e("h3", { className: "text-sm font-semibold", children: "Conditional Formatting" })
      ] }),
      /* @__PURE__ */ e("button", { onClick: f, className: "rounded-md p-1 hover:bg-muted", children: /* @__PURE__ */ e(q, { className: "h-4 w-4" }) })
    ] }),
    n.length === 0 && /* @__PURE__ */ e("p", { className: "text-sm text-muted-foreground py-2", children: 'No rules yet. Click "Add Rule" to highlight cells or rows that match a condition.' }),
    n.map((c) => {
      const d = fl.find((i) => i.value === c.operator);
      return /* @__PURE__ */ o(
        "div",
        {
          className: "flex items-center gap-2 flex-wrap rounded-md border border-slate-100 bg-slate-50/50 p-2",
          children: [
            /* @__PURE__ */ e(
              "select",
              {
                className: "h-8 rounded-md border bg-background px-2 text-sm min-w-[140px]",
                value: c.field,
                onChange: (i) => x(c.id, { field: i.target.value }),
                children: v.map((i) => /* @__PURE__ */ e("option", { value: b(i), children: i.headerName ?? b(i) }, b(i)))
              }
            ),
            /* @__PURE__ */ e(
              "select",
              {
                className: "h-8 rounded-md border bg-background px-2 text-sm min-w-[140px]",
                value: c.operator,
                onChange: (i) => x(c.id, { operator: i.target.value }),
                children: fl.map((i) => /* @__PURE__ */ e("option", { value: i.value, children: i.label }, i.value))
              }
            ),
            (d == null ? void 0 : d.needsValue) && /* @__PURE__ */ e(
              "input",
              {
                type: "text",
                className: "h-8 rounded-md border bg-background px-2 text-sm w-[110px]",
                placeholder: "Value...",
                value: c.value1,
                onChange: (i) => x(c.id, { value1: i.target.value })
              }
            ),
            (d == null ? void 0 : d.needsValue2) && /* @__PURE__ */ o(Z, { children: [
              /* @__PURE__ */ e("span", { className: "text-xs text-muted-foreground", children: "and" }),
              /* @__PURE__ */ e(
                "input",
                {
                  type: "text",
                  className: "h-8 rounded-md border bg-background px-2 text-sm w-[110px]",
                  placeholder: "To...",
                  value: c.value2 ?? "",
                  onChange: (i) => x(c.id, { value2: i.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ o(
              "select",
              {
                className: "h-8 rounded-md border bg-background px-2 text-sm",
                value: c.scope,
                onChange: (i) => x(c.id, { scope: i.target.value }),
                title: "Apply to the matching cell or the whole row",
                children: [
                  /* @__PURE__ */ e("option", { value: "cell", children: "this cell" }),
                  /* @__PURE__ */ e("option", { value: "row", children: "whole row" })
                ]
              }
            ),
            /* @__PURE__ */ e("div", { className: "flex items-center gap-1", children: St.map((i) => {
              const s = c.bg === i.bg && c.fg === i.fg;
              return /* @__PURE__ */ e(
                "button",
                {
                  type: "button",
                  onClick: () => x(c.id, { bg: i.bg, fg: i.fg }),
                  title: i.label,
                  className: `h-6 w-6 rounded border text-[10px] font-bold flex items-center justify-center ${s ? "ring-2 ring-offset-1 ring-slate-500" : ""}`,
                  style: { backgroundColor: i.bg, color: i.fg },
                  children: "A"
                },
                i.label
              );
            }) }),
            /* @__PURE__ */ e(
              "button",
              {
                type: "button",
                onClick: () => x(c.id, { bold: !c.bold }),
                className: `h-8 px-2 rounded-md border text-sm font-bold ${c.bold ? "bg-slate-800 text-white" : "bg-background"}`,
                title: "Bold matching text",
                children: "B"
              }
            ),
            /* @__PURE__ */ e(
              "button",
              {
                onClick: () => C(c.id),
                className: "rounded-md p-1.5 text-destructive hover:bg-destructive/10",
                children: /* @__PURE__ */ e(kl, { className: "h-3.5 w-3.5" })
              }
            )
          ]
        },
        c.id
      );
    }),
    /* @__PURE__ */ o("div", { className: "flex items-center justify-between pt-2 border-t", children: [
      /* @__PURE__ */ o("button", { onClick: m, className: "inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80", children: [
        /* @__PURE__ */ e(Sl, { className: "h-3.5 w-3.5" }),
        " ",
        "Add Rule"
      ] }),
      /* @__PURE__ */ o("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ e(
          "button",
          {
            onClick: a,
            className: "inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs hover:bg-muted",
            children: "Clear All"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: f,
            className: "inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:bg-primary/90",
            children: "Done"
          }
        )
      ] })
    ] })
  ] });
}
const hl = "—";
function ot(r, n) {
  if (r.length === 0) return 0;
  switch (n) {
    case "sum":
      return r.reduce((g, f) => g + f, 0);
    case "avg":
      return r.reduce((g, f) => g + f, 0) / r.length;
    case "count":
      return r.length;
    case "min":
      return Math.min(...r);
    case "max":
      return Math.max(...r);
  }
}
function An(r, n) {
  const { rowField: g, colField: f, valueField: b, agg: v } = n, m = /* @__PURE__ */ new Set(), x = /* @__PURE__ */ new Set(), C = /* @__PURE__ */ new Map();
  for (const w of r) {
    const k = String(w[g] ?? hl), E = f ? String(w[f] ?? hl) : "Value";
    m.add(k), x.add(E);
    const T = Number(w[b]), O = `${k} ${E}`;
    C.has(O) || C.set(O, []), isNaN(T) || C.get(O).push(T);
  }
  const a = Array.from(m).sort((w, k) => w.localeCompare(k)), c = Array.from(x).sort((w, k) => w.localeCompare(k)), d = a.map((w) => {
    const k = {};
    let E = [];
    for (const T of c) {
      const O = C.get(`${w} ${T}`) ?? [];
      k[T] = ot(O, v), E = E.concat(O);
    }
    return { rowKey: w, cells: k, total: ot(E, v) };
  }), i = {};
  let s = [];
  for (const w of c) {
    let k = [];
    for (const E of a) k = k.concat(C.get(`${E} ${w}`) ?? []);
    i[w] = ot(k, v), s = s.concat(k);
  }
  const D = ot(s, v);
  return { rowKeys: a, colKeys: c, rows: d, colTotals: i, grandTotal: D };
}
function ue(r, n) {
  return n === "count" ? r.toLocaleString() : r.toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function Mn({
  columns: r,
  data: n,
  onClose: g
}) {
  const f = U(() => r.filter((d) => !!d.field && !d.hide), [r]), b = U(
    () => f.filter((d) => {
      const i = d.type;
      return i === "numericColumn" || i === "rightAligned" || !!d.aggregate || Array.isArray(i) && (i.includes("numericColumn") || i.includes("rightAligned"));
    }),
    [f]
  ), v = b.length > 0 ? b : f, [m, x] = $(() => {
    var d, i;
    return {
      rowField: ((d = f[0]) == null ? void 0 : d.field) ?? "",
      colField: "",
      valueField: ((i = v[0]) == null ? void 0 : i.field) ?? "",
      agg: "sum"
    };
  }), C = (d) => {
    var i;
    return ((i = f.find((s) => s.field === d)) == null ? void 0 : i.headerName) ?? d;
  }, a = U(() => !m.rowField || !m.valueField ? null : An(n, m), [n, m]), c = () => {
    if (!a) return;
    const i = [[C(m.rowField), ...a.colKeys, "Grand Total"].map(Ae).join(",")];
    a.rows.forEach((s) => {
      const D = [s.rowKey, ...a.colKeys.map((w) => ue(s.cells[w] ?? 0, m.agg)), ue(s.total, m.agg)];
      i.push(D.map(Ae).join(","));
    }), i.push(
      ["Grand Total", ...a.colKeys.map((s) => ue(a.colTotals[s] ?? 0, m.agg)), ue(a.grandTotal, m.agg)].map(Ae).join(",")
    ), it(new Blob([i.join(`
`)], { type: "text/csv;charset=utf-8;" }), "pivot-export.csv");
  };
  return /* @__PURE__ */ e("div", { className: "fixed inset-0 z-[300] flex items-center justify-center bg-black/30 p-6", onMouseDown: g, children: /* @__PURE__ */ o(
    "div",
    {
      className: "flex max-h-full w-full max-w-4xl flex-col rounded-xl border bg-white shadow-2xl",
      onMouseDown: (d) => d.stopPropagation(),
      children: [
        /* @__PURE__ */ o("div", { className: "flex items-center justify-between border-b px-4 py-2.5", style: { backgroundColor: "#f1f5f9" }, children: [
          /* @__PURE__ */ o("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ e(yl, { className: "h-4 w-4 text-indigo-600" }),
            /* @__PURE__ */ e("span", { className: "text-sm font-semibold", children: "Pivot Table" })
          ] }),
          /* @__PURE__ */ e("button", { onClick: g, className: "rounded p-1 hover:bg-gray-200", children: /* @__PURE__ */ e(q, { className: "h-4 w-4" }) })
        ] }),
        /* @__PURE__ */ o("div", { className: "flex flex-wrap items-end gap-3 border-b bg-slate-50/60 px-4 py-3", children: [
          /* @__PURE__ */ o("label", { className: "flex flex-col gap-1 text-xs font-medium text-slate-600", children: [
            "Rows",
            /* @__PURE__ */ e(
              "select",
              {
                className: "h-8 min-w-[150px] rounded-md border bg-white px-2 text-sm",
                value: m.rowField,
                onChange: (d) => x((i) => ({ ...i, rowField: d.target.value })),
                children: f.map((d) => /* @__PURE__ */ e("option", { value: d.field, children: d.headerName ?? d.field }, d.field))
              }
            )
          ] }),
          /* @__PURE__ */ o("label", { className: "flex flex-col gap-1 text-xs font-medium text-slate-600", children: [
            "Columns",
            /* @__PURE__ */ o(
              "select",
              {
                className: "h-8 min-w-[150px] rounded-md border bg-white px-2 text-sm",
                value: m.colField,
                onChange: (d) => x((i) => ({ ...i, colField: d.target.value })),
                children: [
                  /* @__PURE__ */ e("option", { value: "", children: "(none)" }),
                  f.filter((d) => d.field !== m.rowField).map((d) => /* @__PURE__ */ e("option", { value: d.field, children: d.headerName ?? d.field }, d.field))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ o("label", { className: "flex flex-col gap-1 text-xs font-medium text-slate-600", children: [
            "Values",
            /* @__PURE__ */ e(
              "select",
              {
                className: "h-8 min-w-[150px] rounded-md border bg-white px-2 text-sm",
                value: m.valueField,
                onChange: (d) => x((i) => ({ ...i, valueField: d.target.value })),
                children: v.map((d) => /* @__PURE__ */ e("option", { value: d.field, children: d.headerName ?? d.field }, d.field))
              }
            )
          ] }),
          /* @__PURE__ */ o("label", { className: "flex flex-col gap-1 text-xs font-medium text-slate-600", children: [
            "Summarize by",
            /* @__PURE__ */ o(
              "select",
              {
                className: "h-8 min-w-[110px] rounded-md border bg-white px-2 text-sm",
                value: m.agg,
                onChange: (d) => x((i) => ({ ...i, agg: d.target.value })),
                children: [
                  /* @__PURE__ */ e("option", { value: "sum", children: "Sum" }),
                  /* @__PURE__ */ e("option", { value: "avg", children: "Average" }),
                  /* @__PURE__ */ e("option", { value: "count", children: "Count" }),
                  /* @__PURE__ */ e("option", { value: "min", children: "Min" }),
                  /* @__PURE__ */ e("option", { value: "max", children: "Max" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ o(
            "button",
            {
              type: "button",
              onClick: c,
              disabled: !a,
              className: "ml-auto inline-flex h-8 items-center gap-1.5 rounded-md border bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40",
              children: [
                /* @__PURE__ */ e(Ge, { className: "h-3.5 w-3.5" }),
                " ",
                "Export CSV"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ e("div", { className: "min-h-0 flex-1 overflow-auto p-4", children: a ? a.rows.length === 0 ? /* @__PURE__ */ e("p", { className: "py-8 text-center text-sm text-muted-foreground", children: "No data to pivot." }) : /* @__PURE__ */ o("table", { className: "w-full border-collapse text-xs", children: [
          /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ o("tr", { className: "bg-indigo-50 text-indigo-900", children: [
            /* @__PURE__ */ e("th", { className: "sticky left-0 border border-indigo-100 bg-indigo-50 px-3 py-2 text-left font-semibold", children: C(m.rowField) }),
            a.colKeys.map((d) => /* @__PURE__ */ e("th", { className: "border border-indigo-100 px-3 py-2 text-right font-semibold", children: d }, d)),
            /* @__PURE__ */ e("th", { className: "border border-indigo-100 px-3 py-2 text-right font-semibold", children: "Grand Total" })
          ] }) }),
          /* @__PURE__ */ o("tbody", { children: [
            a.rows.map((d, i) => /* @__PURE__ */ o("tr", { className: i % 2 === 1 ? "bg-slate-50/60" : "bg-white", children: [
              /* @__PURE__ */ e("td", { className: "sticky left-0 border border-slate-100 bg-inherit px-3 py-1.5 font-medium", children: d.rowKey }),
              a.colKeys.map((s) => /* @__PURE__ */ e("td", { className: "border border-slate-100 px-3 py-1.5 text-right tabular-nums", children: ue(d.cells[s] ?? 0, m.agg) }, s)),
              /* @__PURE__ */ e("td", { className: "border border-slate-100 px-3 py-1.5 text-right font-semibold tabular-nums", children: ue(d.total, m.agg) })
            ] }, d.rowKey)),
            /* @__PURE__ */ o("tr", { className: "bg-indigo-50 font-semibold text-indigo-900", children: [
              /* @__PURE__ */ e("td", { className: "sticky left-0 border border-indigo-100 bg-indigo-50 px-3 py-1.5", children: "Grand Total" }),
              a.colKeys.map((d) => /* @__PURE__ */ e("td", { className: "border border-indigo-100 px-3 py-1.5 text-right tabular-nums", children: ue(a.colTotals[d] ?? 0, m.agg) }, d)),
              /* @__PURE__ */ e("td", { className: "border border-indigo-100 px-3 py-1.5 text-right tabular-nums", children: ue(a.grandTotal, m.agg) })
            ] })
          ] })
        ] }) : /* @__PURE__ */ e("p", { className: "py-8 text-center text-sm text-muted-foreground", children: "Choose a row field and a value field to build the pivot." }) })
      ]
    }
  ) });
}
function Tn({
  columns: r,
  visibility: n,
  onToggle: g
}) {
  const [f, b] = $(!1), v = ae(null);
  return G(() => {
    function m(x) {
      v.current && !v.current.contains(x.target) && b(!1);
    }
    return document.addEventListener("mousedown", m), () => document.removeEventListener("mousedown", m);
  }, []), /* @__PURE__ */ o("div", { ref: v, className: "relative h-full", children: [
    /* @__PURE__ */ e(
      "button",
      {
        onClick: () => b(!f),
        className: "h-full px-2.5 flex items-center text-slate-300 hover:bg-slate-700/70 hover:text-white transition-colors",
        title: "Column Chooser",
        "data-rtk-action": "column-chooser",
        children: /* @__PURE__ */ e(Cl, { className: "h-4 w-4" })
      }
    ),
    f && /* @__PURE__ */ o(
      "div",
      {
        className: "absolute right-0 mt-0.5 w-56 rounded-lg border shadow-lg z-50 py-1.5 max-h-72 overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-150",
        style: { backgroundColor: "#fff" },
        children: [
          /* @__PURE__ */ e("div", { className: "px-3 py-1.5 text-xs font-semibold text-muted-foreground border-b mb-1", children: "Toggle Columns" }),
          r.map((m) => {
            const x = m.colId ?? (typeof m.field == "string" ? m.field : void 0);
            if (!x) return null;
            const C = m.headerName ?? x, a = n[x] !== !1;
            return /* @__PURE__ */ o("label", { className: "flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted cursor-pointer", children: [
              /* @__PURE__ */ e(
                "input",
                {
                  type: "checkbox",
                  checked: a,
                  onChange: () => g(x),
                  className: "rounded border-muted-foreground/40 accent-primary"
                }
              ),
              /* @__PURE__ */ e("span", { className: "truncate", children: C })
            ] }, x);
          })
        ]
      }
    )
  ] });
}
function Ln({
  state: r,
  data: n,
  selectedValues: g,
  onApply: f,
  onClose: b
}) {
  const v = ae(null), [m, x] = $(""), [C, a] = $(new Set(g));
  G(() => {
    function w(k) {
      v.current && !v.current.contains(k.target) && b();
    }
    return document.addEventListener("mousedown", w), () => document.removeEventListener("mousedown", w);
  }, [b]);
  const c = U(() => {
    const w = {};
    return n.forEach((k) => {
      const E = k[r.field], T = E != null ? String(E) : "(Blank)";
      w[T] = (w[T] || 0) + 1;
    }), Object.entries(w).sort((k, E) => k[0].localeCompare(E[0]));
  }, [n, r.field]), d = m.trim() ? c.filter(([w]) => w.toLowerCase().includes(m.toLowerCase())) : c, i = d.every(([w]) => C.size === 0 || C.has(w)), s = () => {
    if (i && C.size > 0) {
      const w = new Set(C);
      d.forEach(([k]) => w.delete(k)), a(w);
    } else {
      const w = new Set(C);
      d.forEach(([k]) => w.add(k)), a(w);
    }
  }, D = (w) => {
    const k = new Set(C);
    k.has(w) ? k.delete(w) : k.add(w), a(k);
  };
  return /* @__PURE__ */ o(
    "div",
    {
      ref: v,
      className: "fixed rounded-lg border shadow-2xl z-[250] w-64 animate-in fade-in-0 zoom-in-95 duration-100",
      style: {
        left: Math.min(r.x, window.innerWidth - 280),
        top: Math.min(r.y, window.innerHeight - 400),
        backgroundColor: "#fff"
      },
      children: [
        /* @__PURE__ */ o("div", { className: "flex items-center justify-between px-3 py-2 border-b", style: { backgroundColor: "#f1f5f9" }, children: [
          /* @__PURE__ */ e("span", { className: "text-xs font-semibold", children: r.header }),
          /* @__PURE__ */ e("button", { onClick: b, className: "rounded p-0.5 hover:bg-gray-200", children: /* @__PURE__ */ e(q, { className: "h-3.5 w-3.5" }) })
        ] }),
        /* @__PURE__ */ e("div", { className: "px-3 py-2 border-b", children: /* @__PURE__ */ e(
          "input",
          {
            type: "text",
            placeholder: "Search values...",
            value: m,
            onChange: (w) => x(w.target.value),
            className: "w-full h-7 rounded border px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400",
            autoFocus: !0
          }
        ) }),
        /* @__PURE__ */ o("div", { className: "max-h-52 overflow-y-auto", children: [
          /* @__PURE__ */ o("label", { className: "flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 cursor-pointer border-b font-semibold", children: [
            /* @__PURE__ */ e(
              "input",
              {
                type: "checkbox",
                checked: i && C.size > 0,
                onChange: s,
                className: "accent-blue-600"
              }
            ),
            "(Select All)"
          ] }),
          d.map(([w, k]) => /* @__PURE__ */ o("label", { className: "flex items-center gap-2 px-3 py-1 text-xs hover:bg-gray-50 cursor-pointer", children: [
            /* @__PURE__ */ e(
              "input",
              {
                type: "checkbox",
                checked: C.has(w),
                onChange: () => D(w),
                className: "accent-blue-600"
              }
            ),
            /* @__PURE__ */ e("span", { className: "truncate flex-1", children: w }),
            /* @__PURE__ */ e("span", { className: "text-gray-400 text-[10px] shrink-0", children: k })
          ] }, w)),
          d.length === 0 && /* @__PURE__ */ e("div", { className: "px-3 py-3 text-xs text-gray-400 text-center", children: "No matches" })
        ] }),
        /* @__PURE__ */ o("div", { className: "flex items-center justify-between px-3 py-2 border-t gap-2", children: [
          /* @__PURE__ */ e(
            "button",
            {
              onClick: () => {
                f(r.field, /* @__PURE__ */ new Set()), b();
              },
              className: "text-xs text-blue-600 hover:underline",
              children: "Clear"
            }
          ),
          /* @__PURE__ */ o("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ e("button", { onClick: b, className: "px-3 py-1 text-xs border rounded hover:bg-gray-50", children: "Cancel" }),
            /* @__PURE__ */ e(
              "button",
              {
                onClick: () => {
                  f(r.field, C), b();
                },
                className: "px-3 py-1 text-xs bg-slate-700 text-white rounded hover:bg-slate-800",
                children: "OK"
              }
            )
          ] })
        ] })
      ]
    }
  );
}
function Rn({ state: r, onClose: n }) {
  const g = ae(null), [f, b] = $("bar");
  G(() => {
    function a(c) {
      g.current && !g.current.contains(c.target) && n();
    }
    return document.addEventListener("mousedown", a), () => document.removeEventListener("mousedown", a);
  }, [n]);
  const v = Math.max(...r.data.map((a) => a.value), 1), m = r.data.reduce((a, c) => a + c.value, 0) || 1, x = [
    "#3b82f6",
    "#ef4444",
    "#22c55e",
    "#f59e0b",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
    "#14b8a6",
    "#f97316",
    "#6366f1"
  ], C = U(() => {
    let a = 0;
    return r.data.map((c, d) => {
      const i = c.value / m * 360, s = a;
      a += i;
      const D = (s - 90) * (Math.PI / 180), w = (s + i - 90) * (Math.PI / 180), k = i > 180 ? 1 : 0, E = 80, T = 100, O = 100, le = T + E * Math.cos(D), Me = O + E * Math.sin(D), Te = T + E * Math.cos(w), Y = O + E * Math.sin(w);
      return { path: `M ${T} ${O} L ${le} ${Me} A ${E} ${E} 0 ${k} 1 ${Te} ${Y} Z`, color: x[d % x.length], label: c.label, pct: (c.value / m * 100).toFixed(1) };
    });
  }, [r.data, m]);
  return /* @__PURE__ */ o(
    "div",
    {
      ref: g,
      className: "fixed rounded-xl border shadow-2xl z-[300] w-[420px] animate-in fade-in-0 zoom-in-95 duration-150",
      style: { left: "50%", top: "50%", transform: "translate(-50%, -50%)", backgroundColor: "#fff" },
      children: [
        /* @__PURE__ */ o("div", { className: "flex items-center justify-between px-4 py-2.5 border-b", style: { backgroundColor: "#f1f5f9" }, children: [
          /* @__PURE__ */ o("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ e(yn, { className: "h-4 w-4 text-blue-600" }),
            /* @__PURE__ */ e("span", { className: "text-sm font-semibold", children: r.title })
          ] }),
          /* @__PURE__ */ e("button", { onClick: n, className: "rounded p-0.5 hover:bg-gray-200", children: /* @__PURE__ */ e(q, { className: "h-3.5 w-3.5" }) })
        ] }),
        /* @__PURE__ */ e("div", { className: "flex border-b px-4", children: ["bar", "pie", "line"].map((a) => /* @__PURE__ */ o(
          "button",
          {
            onClick: () => b(a),
            className: `px-3 py-2 text-xs font-medium border-b-2 capitalize transition-colors ${f === a ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`,
            children: [
              a,
              " Chart"
            ]
          },
          a
        )) }),
        /* @__PURE__ */ o("div", { className: "p-4", children: [
          f === "bar" && /* @__PURE__ */ e("div", { className: "space-y-1.5", children: r.data.slice(0, 12).map((a, c) => /* @__PURE__ */ o("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ e("span", { className: "text-[11px] w-24 truncate text-right text-gray-600", children: a.label }),
            /* @__PURE__ */ e("div", { className: "flex-1 h-5 rounded-sm overflow-hidden", style: { backgroundColor: "#f1f5f9" }, children: /* @__PURE__ */ e(
              "div",
              {
                className: "h-full rounded-sm transition-all duration-500",
                style: { width: `${a.value / v * 100}%`, backgroundColor: x[c % x.length] }
              }
            ) }),
            /* @__PURE__ */ e("span", { className: "text-[11px] w-16 text-right tabular-nums font-medium", children: a.value.toLocaleString() })
          ] }, a.label)) }),
          f === "pie" && /* @__PURE__ */ o("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ e("svg", { viewBox: "0 0 200 200", className: "w-40 h-40 shrink-0", children: C.map((a, c) => /* @__PURE__ */ e(
              "path",
              {
                d: a.path,
                fill: a.color,
                stroke: "#fff",
                strokeWidth: "1.5",
                className: "transition-all duration-300 hover:opacity-80"
              },
              c
            )) }),
            /* @__PURE__ */ e("div", { className: "flex-1 space-y-1 mt-2 max-h-36 overflow-y-auto", children: C.slice(0, 10).map((a, c) => /* @__PURE__ */ o("div", { className: "flex items-center gap-1.5 text-[11px]", children: [
              /* @__PURE__ */ e("div", { className: "w-2.5 h-2.5 rounded-sm shrink-0", style: { backgroundColor: a.color } }),
              /* @__PURE__ */ e("span", { className: "truncate flex-1", children: a.label }),
              /* @__PURE__ */ o("span", { className: "text-gray-400 tabular-nums", children: [
                a.pct,
                "%"
              ] })
            ] }, c)) })
          ] }),
          f === "line" && /* @__PURE__ */ o("svg", { viewBox: "0 0 380 150", className: "w-full", children: [
            [0, 25, 50, 75, 100].map((a) => /* @__PURE__ */ e(
              "line",
              {
                x1: "40",
                x2: "370",
                y1: 130 - a * 1.2,
                y2: 130 - a * 1.2,
                stroke: "#e2e8f0",
                strokeWidth: "0.5"
              },
              a
            )),
            r.data.length > 1 && /* @__PURE__ */ o(Z, { children: [
              /* @__PURE__ */ e(
                "polyline",
                {
                  fill: "none",
                  stroke: "#3b82f6",
                  strokeWidth: "2",
                  strokeLinejoin: "round",
                  points: r.data.slice(0, 15).map((a, c, d) => {
                    const i = 50 + c / Math.max(d.length - 1, 1) * 310, s = 130 - a.value / v * 110;
                    return `${i},${s}`;
                  }).join(" ")
                }
              ),
              r.data.slice(0, 15).map((a, c, d) => {
                const i = 50 + c / Math.max(d.length - 1, 1) * 310, s = 130 - a.value / v * 110;
                return /* @__PURE__ */ e("circle", { cx: i, cy: s, r: "3", fill: "#3b82f6", stroke: "#fff", strokeWidth: "1.5" }, c);
              }),
              r.data.slice(0, 15).map((a, c, d) => {
                const i = 50 + c / Math.max(d.length - 1, 1) * 310;
                return d.length <= 8 || c % Math.ceil(d.length / 8) === 0 ? /* @__PURE__ */ e("text", { x: i, y: 145, textAnchor: "middle", fontSize: "8", fill: "#94a3b8", children: a.label.length > 6 ? a.label.slice(0, 6) + ".." : a.label }, c) : null;
              })
            ] })
          ] })
        ] })
      ]
    }
  );
}
function On({
  state: r,
  data: n,
  onClose: g
}) {
  const f = ae(null);
  G(() => {
    function s(D) {
      f.current && !f.current.contains(D.target) && g();
    }
    return document.addEventListener("mousedown", s), () => document.removeEventListener("mousedown", s);
  }, [g]);
  const b = n.map((s) => s[r.field]).filter((s) => s != null), v = b.map(Number).filter((s) => !isNaN(s)), m = v.length > b.length * 0.5, x = new Set(b.map(String)).size, C = n.length > 0 ? (b.length / n.length * 100).toFixed(1) : "0", a = m && v.length > 0 ? {
    sum: v.reduce((s, D) => s + D, 0),
    avg: v.reduce((s, D) => s + D, 0) / v.length,
    min: Math.min(...v),
    max: Math.max(...v),
    median: (() => {
      const s = [...v].sort((w, k) => w - k), D = Math.floor(s.length / 2);
      return s.length % 2 ? s[D] : (s[D - 1] + s[D]) / 2;
    })(),
    stdDev: (() => {
      const s = v.reduce((w, k) => w + k, 0) / v.length, D = v.reduce((w, k) => w + (k - s) ** 2, 0) / v.length;
      return Math.sqrt(D);
    })()
  } : null, c = m && v.length > 0 ? (() => {
    const D = Math.min(...v), k = Math.max(...v) - D || 1, E = Array(8).fill(0);
    v.forEach((O) => {
      const le = Math.min(Math.floor((O - D) / k * 8), 7);
      E[le]++;
    });
    const T = Math.max(...E);
    return E.map((O) => O / (T || 1));
  })() : null, d = m ? null : (() => {
    const s = {};
    return b.forEach((D) => {
      const w = String(D);
      s[w] = (s[w] || 0) + 1;
    }), Object.entries(s).sort((D, w) => w[1] - D[1]).slice(0, 5).map(([D, w]) => ({ value: D, count: w, pct: (w / b.length * 100).toFixed(1) }));
  })(), i = (s) => s.toLocaleString(void 0, { maximumFractionDigits: 2 });
  return /* @__PURE__ */ o(
    "div",
    {
      ref: f,
      className: "fixed rounded-xl border shadow-2xl z-[200] w-72 animate-in fade-in-0 zoom-in-95 duration-150",
      style: {
        left: Math.min(r.x, window.innerWidth - 300),
        top: Math.min(r.y + 8, window.innerHeight - 400),
        backgroundColor: "#fff"
      },
      children: [
        /* @__PURE__ */ o(
          "div",
          {
            className: "flex items-center justify-between px-4 py-2.5 border-b rounded-t-xl",
            style: { backgroundColor: "#f1f5f9" },
            children: [
              /* @__PURE__ */ o("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ e(Tt, { className: "h-4 w-4 text-blue-600" }),
                /* @__PURE__ */ e("span", { className: "text-sm font-semibold", children: r.header })
              ] }),
              /* @__PURE__ */ e("button", { onClick: g, className: "rounded p-0.5 hover:bg-muted", children: /* @__PURE__ */ e(q, { className: "h-3.5 w-3.5" }) })
            ]
          }
        ),
        /* @__PURE__ */ o("div", { className: "px-4 py-3 space-y-3", children: [
          /* @__PURE__ */ e("div", { className: "grid grid-cols-3 gap-2 text-center", children: [
            { label: "Total", value: String(n.length) },
            { label: "Unique", value: String(x) },
            { label: "Fill %", value: `${C}%` }
          ].map((s) => /* @__PURE__ */ o("div", { className: "rounded-lg px-2 py-1.5", style: { backgroundColor: "#f1f5f9" }, children: [
            /* @__PURE__ */ e("div", { className: "text-xs text-muted-foreground", children: s.label }),
            /* @__PURE__ */ e("div", { className: "text-sm font-bold tabular-nums", children: s.value })
          ] }, s.label)) }),
          a && /* @__PURE__ */ o("div", { className: "space-y-2", children: [
            /* @__PURE__ */ e("div", { className: "text-[11px] font-semibold text-muted-foreground uppercase tracking-wide", children: "Statistics" }),
            /* @__PURE__ */ e("div", { className: "grid grid-cols-2 gap-x-4 gap-y-1 text-xs", children: [
              { label: "Sum", value: i(a.sum) },
              { label: "Average", value: i(a.avg) },
              { label: "Median", value: i(a.median) },
              { label: "Std Dev", value: i(a.stdDev) },
              { label: "Min", value: i(a.min) },
              { label: "Max", value: i(a.max) }
            ].map((s) => /* @__PURE__ */ o("div", { className: "flex justify-between py-0.5", children: [
              /* @__PURE__ */ e("span", { className: "text-muted-foreground", children: s.label }),
              /* @__PURE__ */ e("span", { className: "font-semibold tabular-nums", children: s.value })
            ] }, s.label)) })
          ] }),
          c && /* @__PURE__ */ o("div", { className: "space-y-1", children: [
            /* @__PURE__ */ e("div", { className: "text-[11px] font-semibold text-muted-foreground uppercase tracking-wide", children: "Distribution" }),
            /* @__PURE__ */ e("div", { className: "flex items-end gap-0.5 h-10", children: c.map((s, D) => /* @__PURE__ */ e("div", { className: "flex-1 flex items-end", children: /* @__PURE__ */ e(
              "div",
              {
                className: "w-full rounded-t-sm bg-blue-500/70 transition-all duration-300",
                style: { height: `${Math.max(s * 100, 4)}%` }
              }
            ) }, D)) })
          ] }),
          d && d.length > 0 && /* @__PURE__ */ o("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ e("div", { className: "text-[11px] font-semibold text-muted-foreground uppercase tracking-wide", children: "Top Values" }),
            d.map((s) => /* @__PURE__ */ e("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ o("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ o("div", { className: "flex justify-between text-xs mb-0.5", children: [
                /* @__PURE__ */ e("span", { className: "truncate font-medium", children: s.value }),
                /* @__PURE__ */ o("span", { className: "text-muted-foreground shrink-0 ml-2", children: [
                  s.count,
                  " (",
                  s.pct,
                  "%)"
                ] })
              ] }),
              /* @__PURE__ */ e("div", { className: "h-1 rounded-full overflow-hidden", style: { backgroundColor: "rgba(0,0,0,0.06)" }, children: /* @__PURE__ */ e("div", { className: "h-full rounded-full bg-blue-500/60", style: { width: `${s.pct}%` } }) })
            ] }) }, s.value))
          ] })
        ] })
      ]
    }
  );
}
function _(r) {
  if (!r) return null;
  try {
    const n = localStorage.getItem(`rtk-grid-views-${r}`), f = (n ? JSON.parse(n) : []).find((b) => b.isDefault);
    return (f == null ? void 0 : f.state) ?? null;
  } catch {
    return null;
  }
}
function at(r) {
  if (!r) return null;
  try {
    const n = localStorage.getItem(`rtk-grid-${r}`);
    return n ? JSON.parse(n) : null;
  } catch {
    return null;
  }
}
function Kn({
  columns: r,
  data: n,
  columnDefs: g,
  rowData: f,
  rows: b,
  loading: v = !1,
  totalCount: m,
  page: x = 1,
  pageSize: C = 25,
  onPageChange: a,
  onPageSizeChange: c,
  onSortChange: d,
  onRowClicked: i,
  getRowClass: s,
  height: D = "calc(100vh - 220px)",
  enableExport: w = !0,
  exportFilename: k = "export",
  noRowsMessage: E = "No rows to display",
  serverSidePagination: T = !0,
  style: O,
  domLayout: le = "normal",
  headerActions: Me,
  pageSizes: Te = [10, 25, 50, 100],
  rowSelection: Y,
  onSelectionChanged: Le,
  defaultDensity: ct = "comfortable",
  enableFullscreen: ee = !0,
  enableKeyboardNav: j = !0,
  stateId: V,
  useEnterpriseToolbar: X = !0,
  showClickTracker: te = !1,
  onHeaderFiltersChange: ye,
  onGlobalSearchChange: Ne,
  onLoadMore: Re,
  hasMore: dt = !0,
  isLoadingMore: He = !1,
  infiniteScrollThreshold: Ot = 300,
  autoBestFitAllColumns: zt = !1,
  licenseKey: jt
}) {
  const L = r ?? g ?? [], qe = n ?? f ?? b ?? [];
  G(() => {
    Jl(jt);
  }, [jt]);
  const we = ae(null), It = ae(null), ut = ae(null), [ne, El] = $(() => {
    var t;
    return ((t = _(V)) == null ? void 0 : t.globalSearch) ?? "";
  }), [Oe, mt] = $(() => {
    var t;
    return ((t = _(V)) == null ? void 0 : t.showHeaderFilters) ?? !1;
  }), [se, Vl] = $(() => {
    var t;
    return ((t = _(V)) == null ? void 0 : t.headerFilters) ?? {};
  }), me = W(
    (t) => {
      Vl((l) => {
        const h = typeof t == "function" ? t(l) : t;
        return ye == null || ye(h), h;
      });
    },
    [ye]
  ), fe = W(
    (t) => {
      El((l) => {
        const h = typeof t == "function" ? t(l) : t;
        return Ne == null || Ne(h), h;
      });
    },
    [Ne]
  ), [ft, ht] = $(!1), [Bt, Pt] = $(!1), [Wt, Gt] = $(!1), [H, pt] = $(() => {
    var t;
    return ((t = _(V)) == null ? void 0 : t.condRules) ?? [];
  }), [he, Ke] = $(() => {
    var t;
    return ((t = _(V)) == null ? void 0 : t.advancedFilters) ?? [];
  }), [ze, gt] = $(() => {
    var t;
    return ((t = _(V)) == null ? void 0 : t.showGrouping) ?? !0;
  }), [Ce, ke] = $(
    () => {
      var t, l;
      return ((t = _(V)) == null ? void 0 : t.columnVisibility) ?? ((l = at(V)) == null ? void 0 : l.columnVisibility) ?? {};
    }
  ), [z, xt] = $(null), [re, Ue] = $(
    () => {
      var t, l;
      return ((t = _(V)) == null ? void 0 : t.density) ?? ((l = at(V)) == null ? void 0 : l.density) ?? ct;
    }
  ), [J, Ht] = $(!1), [Q, bt] = $(null), [qt, Kt] = $(null), [Al, Je] = $(!1), [Ut, Se] = $(!1), [je, _e] = $(""), [In, vt] = $(0), [ie, Ie] = $(
    () => {
      var t, l;
      return ((t = _(V)) == null ? void 0 : t.columnOrder) ?? ((l = at(V)) == null ? void 0 : l.columnOrder) ?? [];
    }
  ), [Be, Pe] = $(null), [Jt, Fe] = $(null);
  G(() => {
    const t = () => {
      Pe(null), Fe(null);
    };
    return window.addEventListener("dragend", t), window.addEventListener("mouseup", t), () => {
      window.removeEventListener("dragend", t), window.removeEventListener("mouseup", t);
    };
  }, []), G(() => {
    const t = (l) => {
      const h = l.target;
      ut.current && !ut.current.contains(h) && Je(!1);
    };
    return document.addEventListener("mousedown", t), () => document.removeEventListener("mousedown", t);
  }, []);
  const [pe, De] = $(
    () => {
      var t, l;
      return ((t = _(V)) == null ? void 0 : t.pinnedColumns) ?? ((l = at(V)) == null ? void 0 : l.pinnedColumns) ?? {};
    }
  ), [P, ge] = $(() => {
    var t;
    return ((t = _(V)) == null ? void 0 : t.groupByField) ?? null;
  }), [Ml, $e] = $(/* @__PURE__ */ new Set()), [yt, _t] = $(null), [xe, Ye] = $(() => {
    var l;
    const t = (l = _(V)) == null ? void 0 : l.excelFilterValues;
    if (!t) return {};
    try {
      return Object.fromEntries(
        Object.entries(t).map(([h, u]) => [h, new Set(u)])
      );
    } catch {
      return {};
    }
  }), [Yt, Nt] = $(null), [Xt, Tl] = $("No click captured yet"), ce = Nn[re];
  G(() => {
    if (V)
      try {
        const t = localStorage.getItem(`rtk-grid-views-${V}`);
        if (t ? JSON.parse(t).some((u) => u.isDefault) : !1) return;
        const h = localStorage.getItem(`rtk-grid-${V}`);
        if (h) {
          const u = JSON.parse(h);
          u.columnVisibility && ke(u.columnVisibility), u.density && Ue(u.density), u.columnOrder && Ie(u.columnOrder), u.pinnedColumns && De(u.pinnedColumns);
        }
      } catch {
      }
  }, [V]), G(() => {
    if (!V) return;
    const t = { columnVisibility: Ce, density: re, columnOrder: ie, pinnedColumns: pe };
    try {
      localStorage.setItem(`rtk-grid-${V}`, JSON.stringify(t));
    } catch {
    }
  }, [V, Ce, re, ie, pe]);
  const Qt = W(() => Ht((t) => !t), []);
  G(() => {
    if (!J) return;
    document.body.style.overflow = "hidden";
    const t = (l) => {
      l.key === "Escape" && Ht(!1);
    };
    return document.addEventListener("keydown", t), () => {
      document.body.style.overflow = "", document.removeEventListener("keydown", t);
    };
  }, [J]);
  const Ll = U(() => $n(L), [L]), [be, Xe] = zn(d), [Rl, Ol] = jn(
    Y,
    qe,
    Le
  ), R = U(() => {
    let t = qe;
    if (ne.trim()) {
      const u = ne.toLowerCase();
      t = t.filter((p) => L.some((y) => {
        if (y.hide || !y.field) return !1;
        const N = p[y.field];
        return N != null && String(N).toLowerCase().includes(u);
      }));
    }
    const l = Object.entries(se).filter(([, u]) => u.trim());
    l.length > 0 && (t = t.filter(
      (u) => l.every(([p, y]) => {
        const N = u[p];
        return N == null ? !1 : /^\d{4}-\d{2}-\d{2}$/.test(y) ? String(N).substring(0, 10) === y : String(N).toLowerCase().includes(y.toLowerCase());
      })
    ));
    const h = Object.entries(xe).filter(([, u]) => u.size > 0);
    return h.length > 0 && (t = t.filter(
      (u) => h.every(([p, y]) => {
        const N = u[p], F = N != null ? String(N) : "(Blank)";
        return y.has(F);
      })
    )), he.length > 0 && (t = t.filter(
      (u) => he.every((p) => {
        if (!p.value.trim()) return !0;
        const y = u[p.field], N = y != null ? String(y).toLowerCase() : "", F = p.value.toLowerCase();
        switch (p.operator) {
          case "contains":
            return N.includes(F);
          case "equals":
            return N === F;
          case "startsWith":
            return N.startsWith(F);
          case "endsWith":
            return N.endsWith(F);
          case "!=":
            return N !== F;
          case ">":
            return Number(y) > Number(p.value);
          case "<":
            return Number(y) < Number(p.value);
          case ">=":
            return Number(y) >= Number(p.value);
          case "<=":
            return Number(y) <= Number(p.value);
          case "between":
            return Number(y) >= Number(p.value) && Number(y) <= Number(p.valueTo ?? p.value);
          default:
            return !0;
        }
      })
    )), t;
  }, [qe, ne, se, he, xe, L]), zl = U(() => {
    if (T) return R;
    const t = (x - 1) * C;
    return R.slice(t, t + C);
  }, [R, T, x, C]), I = _l({
    data: T ? R : zl,
    columns: Ll,
    state: {
      sorting: be,
      rowSelection: Rl,
      columnVisibility: Ce,
      columnOrder: ie.length > 0 ? ie : void 0
    },
    onSortingChange: Xe,
    onRowSelectionChange: Ol,
    onColumnVisibilityChange: ke,
    onColumnOrderChange: Ie,
    getCoreRowModel: en(),
    getSortedRowModel: Zl(),
    enableSorting: !0,
    enableMultiSort: !0,
    enableRowSelection: !!Y,
    enableMultiRowSelection: Y === "multiple",
    enableColumnResizing: !0,
    columnResizeMode: "onChange",
    manualPagination: !0
  }), jl = W((t) => {
    ke((l) => ({ ...l, [t]: l[t] === !1 }));
  }, []), Ee = m ?? R.length, Qe = Math.max(1, Math.ceil(Ee / C)), Il = le === "autoHeight", ve = !!Re, Bl = re === "compact" ? 28 : re === "spacious" ? 44 : 36, We = Yl({
    count: ve ? I.getRowModel().rows.length : 0,
    getScrollElement: () => we.current,
    estimateSize: () => Bl,
    overscan: 5
  });
  G(() => {
    if (!ve) return;
    const t = we.current;
    if (!t) return;
    const l = () => {
      if (!dt || He) return;
      const { scrollTop: h, scrollHeight: u, clientHeight: p } = t;
      u - h - p < Ot && (Re == null || Re());
    };
    return t.addEventListener("scroll", l, { passive: !0 }), () => t.removeEventListener("scroll", l);
  }, [ve, dt, He, Ot, Re]);
  const Ze = he.filter((t) => t.value.trim()).length, et = Object.values(se).filter((t) => t.trim()).length, Pl = Object.values(xe).filter((t) => t.size > 0).length, tt = Ze + et + Pl, wt = U(() => L.filter((t) => {
    if (!t.field || t.hide) return !1;
    const l = t.type;
    return !(l === "numericColumn" || l === "rightAligned" || Array.isArray(l) && (l.includes("numericColumn") || l.includes("rightAligned")));
  }).map((t) => ({ field: t.field, label: t.headerName ?? t.field })), [L]), Zt = U(() => {
    if (!ze || !P) return null;
    const t = {};
    return R.forEach((l) => {
      const h = String(l[P] ?? "(Blank)");
      (t[h] || (t[h] = [])).push(l);
    }), Object.entries(t).sort((l, h) => l[0].localeCompare(h[0]));
  }, [R, P, ze]), oe = U(() => Cn(L, R), [L, R]), el = U(() => L.filter((t) => {
    if (!t.field || t.hide) return !1;
    const l = t.type;
    return l === "numericColumn" || l === "rightAligned" || Array.isArray(l) && (l.includes("numericColumn") || l.includes("rightAligned"));
  }).map((t) => ({ field: t.field, label: t.headerName ?? t.field })), [L]);
  G(() => {
    if (!j || !we.current) return;
    function t(h) {
      var A, S;
      if (!Q) return;
      const u = I.getRowModel().rows, p = I.getVisibleLeafColumns();
      let { row: y, col: N } = Q, F = !0;
      switch (h.key) {
        case "ArrowDown":
          y = Math.min(y + 1, u.length - 1);
          break;
        case "ArrowUp":
          y = Math.max(y - 1, 0);
          break;
        case "ArrowRight":
          N = Math.min(N + 1, p.length - 1);
          break;
        case "ArrowLeft":
          N = Math.max(N - 1, 0);
          break;
        case "Home":
          N = 0, h.ctrlKey && (y = 0);
          break;
        case "End":
          N = p.length - 1, h.ctrlKey && (y = u.length - 1);
          break;
        case "PageDown":
          y = Math.min(y + 10, u.length - 1);
          break;
        case "PageUp":
          y = Math.max(y - 10, 0);
          break;
        case "c":
          if ((h.ctrlKey || h.metaKey) && Q) {
            const M = (A = u[y]) == null ? void 0 : A.getVisibleCells()[N];
            M && navigator.clipboard.writeText(String(M.getValue() ?? ""));
          }
          F = !1;
          break;
        default:
          F = !1;
      }
      if (F) {
        h.preventDefault(), bt({ row: y, col: N });
        const M = (S = we.current) == null ? void 0 : S.querySelector("tbody"), B = M == null ? void 0 : M.children[y], de = B == null ? void 0 : B.children[N];
        de == null || de.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
    }
    const l = we.current;
    return l.addEventListener("keydown", t), () => l.removeEventListener("keydown", t);
  }, [j, Q, I]);
  const Wl = W(() => {
    Ue((t) => {
      const l = ["compact", "comfortable", "spacious"];
      return l[(l.indexOf(t) + 1) % l.length];
    });
  }, []), Gl = W((t) => {
    const l = t.target;
    if (!l) return;
    const u = l.closest(
      "[role='columnheader'], th, td, button, input, select, [data-testid]"
    ) ?? l, p = u.tagName.toLowerCase(), y = u.getAttribute("role"), N = u.getAttribute("data-testid"), F = u.getAttribute("title"), A = (u.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 42), S = (u.className || "").toString().split(/\s+/).filter(Boolean).slice(0, 3).join("."), M = `${Math.round(t.clientX)},${Math.round(t.clientY)}`, de = [
      `${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`,
      `${p}${y ? `[${y}]` : ""}`,
      S ? `.${S}` : "",
      N ? `id:${N}` : "",
      F ? `title:${F}` : "",
      A ? `txt:${A}` : "",
      `@${M}`
    ].filter(Boolean);
    Tl(de.join(" | "));
  }, []), lt = W(() => {
    const l = document.createElement("canvas").getContext("2d");
    if (!l) return;
    l.font = `${ce.fontSize}px Inter, system-ui, sans-serif`;
    const h = {};
    L.filter((u) => !u.hide && u.field).forEach((u) => {
      const p = u.field;
      let y = l.measureText(u.headerName ?? p).width + 32;
      R.forEach((N) => {
        const F = String(N[p] ?? ""), A = l.measureText(F).width + 32;
        A > y && (y = A);
      }), h[p] = Math.min(Math.max(Math.ceil(y), u.minWidth ?? 60), u.maxWidth ?? 500);
    }), I.setColumnSizing(h);
  }, [L, R, I, ce.fontSize]);
  G(() => {
    if (!zt || R.length === 0) return;
    const t = window.requestAnimationFrame(() => {
      lt();
    });
    return () => window.cancelAnimationFrame(t);
  }, [zt, R, lt]);
  const Hl = W(() => {
    me({}), Ke([]), fe(""), Ye({});
  }, []), K = `rtk-grid-views-${V ?? "default"}`, tl = W(
    (t) => {
      var N;
      const l = t.trim();
      if (!l) return;
      const h = localStorage.getItem(K), u = h ? JSON.parse(h) : [], p = {
        name: l,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        // Preserve isDefault flag when overwriting a view with the same name
        isDefault: ((N = u.find((F) => F.name === l)) == null ? void 0 : N.isDefault) ?? !1,
        state: {
          columnVisibility: Ce,
          columnOrder: ie,
          pinnedColumns: pe,
          groupByField: P,
          showGrouping: ze,
          density: re,
          headerFilters: se,
          advancedFilters: he,
          condRules: H,
          showHeaderFilters: Oe,
          globalSearch: ne,
          excelFilterValues: Object.fromEntries(Object.entries(xe).map(([F, A]) => [F, Array.from(A)]))
        }
      }, y = u.filter((F) => F.name !== l);
      localStorage.setItem(K, JSON.stringify([...y, p])), vt((F) => F + 1), _e("");
    },
    [
      K,
      Ce,
      ie,
      pe,
      P,
      ze,
      re,
      se,
      he,
      Oe,
      xe,
      H
    ]
  );
  W(() => {
    Se(!0), _e("");
  }, []);
  const ql = W(
    (t) => {
      const l = localStorage.getItem(K), u = (l ? JSON.parse(l) : [])[t];
      if (!(u != null && u.state)) return;
      const p = u.state;
      if (p.columnVisibility && ke(p.columnVisibility), p.columnOrder && Ie(p.columnOrder), p.pinnedColumns && De(p.pinnedColumns), ge(p.groupByField ?? null), gt(p.showGrouping ?? !0), p.density && Ue(p.density), me(p.headerFilters ?? {}), Ke(p.advancedFilters ?? []), pt(p.condRules ?? []), mt(p.showHeaderFilters ?? !1), p.excelFilterValues) {
        const y = Object.fromEntries(
          Object.entries(p.excelFilterValues).map(([N, F]) => [N, new Set(F)])
        );
        Ye(y);
      }
      fe(p.globalSearch ?? ""), Se(!1);
    },
    [
      K,
      ke,
      Ie,
      De,
      ge,
      gt,
      Ue,
      me,
      Ke,
      pt,
      mt,
      Ye,
      fe
    ]
  ), Kl = W(
    (t) => {
      const l = localStorage.getItem(K), h = l ? JSON.parse(l) : [];
      localStorage.setItem(K, JSON.stringify(h.filter((u) => u.name !== t))), vt((u) => u + 1);
    },
    [K]
  ), Ul = W(
    (t) => {
      var y;
      const l = localStorage.getItem(K), h = l ? JSON.parse(l) : [], u = ((y = h.find((N) => N.name === t)) == null ? void 0 : y.isDefault) === !0, p = h.map((N) => ({
        ...N,
        isDefault: u ? !1 : N.name === t
      }));
      localStorage.setItem(K, JSON.stringify(p)), vt((N) => N + 1);
    },
    [K]
  );
  W(() => {
    Se(!0);
  }, []);
  const ll = W(() => {
    const t = localStorage.getItem(K);
    return t ? JSON.parse(t) : [];
  }, [K]), Ct = (t, l, h) => {
    const u = H.length ? $l(t.original, H) : void 0;
    return /* @__PURE__ */ e(
      "tr",
      {
        role: "row",
        "aria-rowindex": l + 2,
        "aria-selected": t.getIsSelected(),
        className: `border-b border-slate-100 transition-colors duration-100 ${t.getIsSelected() ? "bg-indigo-50/70 hover:bg-indigo-50" : l % 2 === 1 ? "bg-slate-50/60 hover:bg-slate-50" : "bg-white hover:bg-slate-50"} ${i ? "cursor-pointer" : ""} ${h ?? ""}`,
        style: u,
        onClick: () => i == null ? void 0 : i(t.original),
        onContextMenu: (p) => {
          p.preventDefault();
          const y = p.target.closest("td"), N = y ? Array.from(y.parentElement.children).indexOf(y) : -1, F = t.getVisibleCells(), A = N >= 0 ? F[N] : null, S = A ? L.find((B) => (B.colId ?? B.field) === A.column.id) : null, M = A ? A.getValue() : "";
          xt({
            x: p.clientX,
            y: p.clientY,
            rowData: t.original,
            colField: (S == null ? void 0 : S.field) ?? (A == null ? void 0 : A.column.id) ?? null,
            colHeader: (S == null ? void 0 : S.headerName) ?? (A == null ? void 0 : A.column.id) ?? "",
            cellValue: M != null ? String(M) : ""
          });
        },
        children: t.getVisibleCells().map((p, y) => {
          const N = p.column.columnDef.meta, F = p.column.columnDef.accessorKey ?? p.column.id, A = pe[F] || (N == null ? void 0 : N.pinned), S = (Q == null ? void 0 : Q.row) === l && (Q == null ? void 0 : Q.col) === y, M = H.length ? Dl(t.original, F, H) : void 0;
          return /* @__PURE__ */ e(
            "td",
            {
              role: "gridcell",
              className: `px-3 ${ce.cellPy} ${ce.cellText} border-r border-slate-100 last:border-r-0 ${N != null && N.isNumeric ? "text-right font-mono tabular-nums" : ""} ${S ? "outline outline-2 outline-indigo-500 outline-offset-[-2px] z-10 relative" : ""}`,
              style: {
                width: p.column.getSize(),
                minWidth: p.column.columnDef.minSize,
                maxWidth: p.column.columnDef.maxSize,
                position: A ? "sticky" : void 0,
                left: A === "left" ? 0 : void 0,
                right: A === "right" ? 0 : void 0,
                zIndex: A ? 10 : void 0,
                ...A ? { backgroundColor: "inherit" } : {},
                ...M
              },
              onClick: (B) => {
                j && (B.stopPropagation(), bt({ row: l, col: y }), i == null || i(t.original));
              },
              children: rl(p.column.columnDef.cell, p.getContext())
            },
            p.id
          );
        })
      },
      t.id
    );
  };
  return /* @__PURE__ */ o(
    "div",
    {
      ref: It,
      onClickCapture: te ? Gl : void 0,
      className: J ? "fixed inset-0 z-[9999] flex flex-col p-4" : "",
      style: J ? { backgroundColor: "#fff" } : void 0,
      children: [
        X ? /* @__PURE__ */ o(
          "div",
          {
            className: "relative z-30 flex items-center gap-0 border border-b-0 border-slate-300 h-11 overflow-hidden",
            style: { background: "#e7edf4" },
            children: [
              /* @__PURE__ */ o("div", { className: "relative flex items-center border-r border-slate-300 h-full px-2", children: [
                /* @__PURE__ */ e(nt, { className: "absolute left-4 h-4 w-4 text-slate-500 pointer-events-none" }),
                /* @__PURE__ */ e(
                  "input",
                  {
                    type: "text",
                    placeholder: "Search all columns...",
                    value: ne,
                    onChange: (t) => fe(t.target.value),
                    className: "h-8 w-64 pl-8 pr-7 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors text-slate-700 placeholder:text-slate-400"
                  }
                ),
                ne && /* @__PURE__ */ e(
                  "button",
                  {
                    onClick: () => fe(""),
                    className: "absolute right-4 text-slate-500 hover:text-slate-700",
                    children: /* @__PURE__ */ e(q, { className: "h-3.5 w-3.5" })
                  }
                )
              ] }),
              /* @__PURE__ */ e("div", { className: "h-6 w-px bg-slate-300" }),
              /* @__PURE__ */ o(
                "button",
                {
                  type: "button",
                  onMouseDown: (t) => t.preventDefault(),
                  onClick: () => mt(!Oe),
                  className: `relative h-full px-2.5 flex items-center transition-colors ${Oe || et > 0 ? "bg-sky-100 text-sky-700" : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"}`,
                  title: "Column Filters",
                  children: [
                    /* @__PURE__ */ e(rt, { className: "h-4 w-4" }),
                    et > 0 && /* @__PURE__ */ e("span", { className: "absolute -top-0.5 -right-0.5 bg-teal-600 text-white text-[8px] rounded-full h-3.5 w-3.5 flex items-center justify-center font-bold", children: et })
                  ]
                }
              ),
              /* @__PURE__ */ o(
                "button",
                {
                  type: "button",
                  onMouseDown: (t) => t.preventDefault(),
                  onClick: () => ht(!ft),
                  className: `relative h-full px-2.5 flex items-center transition-colors ${ft || Ze > 0 ? "bg-violet-100 text-violet-700" : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"}`,
                  title: "Advanced Filter",
                  children: [
                    /* @__PURE__ */ e(pl, { className: "h-4 w-4" }),
                    Ze > 0 && /* @__PURE__ */ e("span", { className: "absolute -top-0.5 -right-0.5 bg-violet-600 text-white text-[8px] rounded-full h-3.5 w-3.5 flex items-center justify-center font-bold", children: Ze })
                  ]
                }
              ),
              /* @__PURE__ */ e(
                "button",
                {
                  type: "button",
                  onMouseDown: (t) => t.preventDefault(),
                  onClick: () => {
                    gt((t) => {
                      var h;
                      const l = !t;
                      if (l && !P) {
                        const u = (h = wt[0]) == null ? void 0 : h.field;
                        u && (ge(u), $e(/* @__PURE__ */ new Set()));
                      }
                      return l;
                    });
                  },
                  className: `relative h-full px-2.5 flex items-center transition-colors ${ze ? "bg-sky-100 text-sky-700" : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"}`,
                  title: "Toggle Grouping",
                  children: /* @__PURE__ */ e(gl, { className: "h-4 w-4" })
                }
              ),
              /* @__PURE__ */ e(
                "button",
                {
                  type: "button",
                  onMouseDown: (t) => t.preventDefault(),
                  className: "h-full px-2.5 flex items-center text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 transition-colors",
                  title: "Reset Grouping",
                  onClick: () => {
                    ge(null), $e(/* @__PURE__ */ new Set());
                  },
                  children: /* @__PURE__ */ e(xl, { className: "h-4 w-4" })
                }
              ),
              /* @__PURE__ */ e("div", { className: "h-6 w-px bg-slate-300" }),
              /* @__PURE__ */ e(Tn, { columns: L, visibility: Ce, onToggle: jl }),
              /* @__PURE__ */ e(
                "button",
                {
                  type: "button",
                  onMouseDown: (t) => t.preventDefault(),
                  onClick: lt,
                  className: "h-full px-2.5 flex items-center text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 transition-colors",
                  title: "Best Fit All Columns",
                  children: /* @__PURE__ */ e(bl, { className: "h-4 w-4" })
                }
              ),
              /* @__PURE__ */ o(
                "button",
                {
                  type: "button",
                  onMouseDown: (t) => t.preventDefault(),
                  onClick: () => Pt((t) => !t),
                  className: `relative h-full px-2.5 flex items-center transition-colors ${Bt || H.length > 0 ? "bg-amber-100 text-amber-700" : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"}`,
                  title: "Conditional Formatting",
                  children: [
                    /* @__PURE__ */ e(vl, { className: "h-4 w-4" }),
                    H.length > 0 && /* @__PURE__ */ e("span", { className: "absolute -top-0.5 -right-0.5 bg-amber-600 text-white text-[8px] rounded-full h-3.5 w-3.5 flex items-center justify-center font-bold", children: H.length })
                  ]
                }
              ),
              /* @__PURE__ */ e(
                "button",
                {
                  type: "button",
                  onMouseDown: (t) => t.preventDefault(),
                  onClick: () => Gt((t) => !t),
                  className: `h-full px-2.5 flex items-center transition-colors ${Wt ? "bg-indigo-100 text-indigo-700" : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"}`,
                  title: "Pivot Table",
                  children: /* @__PURE__ */ e(yl, { className: "h-4 w-4" })
                }
              ),
              w && /* @__PURE__ */ o(Z, { children: [
                /* @__PURE__ */ e(
                  "button",
                  {
                    type: "button",
                    onMouseDown: (t) => t.preventDefault(),
                    onClick: () => Et(L, R, `${k}.xls`, H, oe),
                    className: "h-full px-2.5 flex items-center text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 transition-colors",
                    title: "Export Excel",
                    children: /* @__PURE__ */ e(At, { className: "h-4 w-4" })
                  }
                ),
                /* @__PURE__ */ e(
                  "button",
                  {
                    type: "button",
                    onMouseDown: (t) => t.preventDefault(),
                    onClick: () => $t(L, R, `${k}.csv`, oe),
                    className: "h-full px-2.5 flex items-center text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 transition-colors",
                    title: "Export CSV",
                    children: /* @__PURE__ */ e(Mt, { className: "h-4 w-4" })
                  }
                ),
                /* @__PURE__ */ e(
                  "button",
                  {
                    type: "button",
                    onMouseDown: (t) => t.preventDefault(),
                    onClick: () => Vt(L, R, `${k}.pdf`, H, oe),
                    className: "h-full px-2.5 flex items-center text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 transition-colors",
                    title: "Export PDF",
                    children: /* @__PURE__ */ e(Nl, { className: "h-4 w-4" })
                  }
                )
              ] }),
              /* @__PURE__ */ e("div", { className: "h-6 w-px bg-slate-300" }),
              /* @__PURE__ */ e(
                "button",
                {
                  type: "button",
                  onMouseDown: (t) => t.preventDefault(),
                  onClick: Wl,
                  className: "h-full px-2.5 flex items-center text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 transition-colors",
                  title: `Density: ${ce.label}`,
                  children: re === "compact" ? /* @__PURE__ */ e(nn, { className: "h-4 w-4" }) : re === "comfortable" ? /* @__PURE__ */ e(rn, { className: "h-4 w-4" }) : /* @__PURE__ */ e(on, { className: "h-4 w-4" })
                }
              ),
              /* @__PURE__ */ o(
                "button",
                {
                  type: "button",
                  onMouseDown: (t) => t.preventDefault(),
                  onClick: () => {
                    Se((t) => !t), _e("");
                  },
                  className: `h-full px-3 flex items-center gap-1.5 transition-colors ${Ut ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"}`,
                  title: "Save and load grid views",
                  children: [
                    /* @__PURE__ */ e(Ge, { className: "h-4 w-4" }),
                    /* @__PURE__ */ e("span", { className: "text-xs font-medium", children: "Views" }),
                    (() => {
                      const t = ll().length;
                      return t > 0 ? /* @__PURE__ */ e("span", { className: "bg-indigo-100 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none", children: t }) : null;
                    })()
                  ]
                }
              ),
              /* @__PURE__ */ e("div", { className: "h-6 w-px bg-slate-300" }),
              wt.length > 0 && /* @__PURE__ */ o("div", { className: "relative h-full", ref: ut, children: [
                /* @__PURE__ */ e(
                  "button",
                  {
                    type: "button",
                    onMouseDown: (t) => t.preventDefault(),
                    onClick: () => {
                      Je((t) => !t);
                    },
                    className: `h-full px-2.5 flex items-center transition-colors ${P ? "bg-indigo-100 text-indigo-700" : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"}`,
                    title: P ? `Grouped: ${P}` : "Group By",
                    children: /* @__PURE__ */ e(st, { className: "h-4 w-4" })
                  }
                ),
                Al && /* @__PURE__ */ o(
                  "div",
                  {
                    className: "absolute right-0 mt-0.5 w-48 rounded-lg border shadow-lg z-50 py-1 animate-in fade-in-0 zoom-in-95 duration-150",
                    style: { backgroundColor: "#fff" },
                    children: [
                      /* @__PURE__ */ e("div", { className: "px-3 py-1.5 text-xs font-semibold text-muted-foreground border-b mb-1", children: "Group By" }),
                      /* @__PURE__ */ e(
                        "button",
                        {
                          type: "button",
                          onClick: () => {
                            ge(null), $e(/* @__PURE__ */ new Set()), Je(!1);
                          },
                          className: `flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-100 ${P ? "" : "font-semibold text-primary"}`,
                          children: "None"
                        }
                      ),
                      wt.map((t) => /* @__PURE__ */ o(
                        "button",
                        {
                          type: "button",
                          onClick: () => {
                            ge(t.field), $e(/* @__PURE__ */ new Set()), Je(!1);
                          },
                          className: `flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-100 ${P === t.field ? "font-semibold text-primary" : ""}`,
                          children: [
                            P === t.field && /* @__PURE__ */ e(wl, { className: "h-3 w-3" }),
                            t.label
                          ]
                        },
                        t.field
                      ))
                    ]
                  }
                )
              ] }),
              ee && /* @__PURE__ */ e(
                "button",
                {
                  type: "button",
                  onMouseDown: (t) => t.preventDefault(),
                  onClick: Qt,
                  className: `h-full px-2.5 flex items-center transition-colors ${J ? "bg-sky-100 text-sky-700" : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"}`,
                  title: J ? "Exit Fullscreen (Esc)" : "Fullscreen",
                  children: J ? /* @__PURE__ */ e(ol, { className: "h-4 w-4" }) : /* @__PURE__ */ e(al, { className: "h-4 w-4" })
                }
              ),
              Me,
              /* @__PURE__ */ o("div", { className: "ml-auto flex items-center gap-2 pr-2 text-xs text-slate-600", children: [
                tt > 0 && /* @__PURE__ */ o(
                  "button",
                  {
                    type: "button",
                    onClick: Hl,
                    className: "inline-flex items-center gap-1 rounded-full bg-red-50 text-red-600 px-2 py-0.5 hover:bg-red-100 transition-colors font-medium",
                    children: [
                      /* @__PURE__ */ e(q, { className: "h-2.5 w-2.5" }),
                      " ",
                      tt + (ne ? 1 : 0)
                    ]
                  }
                ),
                P && /* @__PURE__ */ o("span", { className: "inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-600 px-2 py-0.5 font-medium", children: [
                  /* @__PURE__ */ e(st, { className: "h-2.5 w-2.5" }),
                  " ",
                  P
                ] }),
                /* @__PURE__ */ o("span", { className: "font-medium tabular-nums mr-2", children: [
                  v ? /* @__PURE__ */ e(sl, { className: "h-3 w-3 animate-spin inline" }) : Ee.toLocaleString(),
                  " ",
                  !v && "rows"
                ] }),
                T && !ve && /* @__PURE__ */ o("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ e("span", { className: "text-slate-600", children: "Rows" }),
                  /* @__PURE__ */ e(
                    "select",
                    {
                      value: C,
                      onChange: (t) => c == null ? void 0 : c(Number(t.target.value)),
                      className: "h-8 rounded-md border border-slate-300 bg-white px-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500",
                      children: Te.map((t) => /* @__PURE__ */ e("option", { value: t, children: t }, t))
                    }
                  )
                ] }),
                ee && /* @__PURE__ */ e(
                  "button",
                  {
                    type: "button",
                    onClick: Qt,
                    className: "h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 transition-colors",
                    title: J ? "Exit Fullscreen (Esc)" : "Fullscreen",
                    children: J ? /* @__PURE__ */ e(ol, { className: "h-4 w-4" }) : /* @__PURE__ */ e(al, { className: "h-4 w-4" })
                  }
                )
              ] })
            ]
          }
        ) : /* @__PURE__ */ o("div", { className: "relative z-30 flex items-center justify-between gap-3 border border-b-0 border-slate-200 bg-white px-3 py-2", children: [
          /* @__PURE__ */ o("div", { className: "relative w-full max-w-sm", children: [
            /* @__PURE__ */ e(nt, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" }),
            /* @__PURE__ */ e(
              "input",
              {
                type: "text",
                placeholder: "Search all columns...",
                value: ne,
                onChange: (t) => fe(t.target.value),
                className: "h-9 w-full border border-slate-200 bg-white pl-9 pr-8 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/25"
              }
            ),
            ne && /* @__PURE__ */ e(
              "button",
              {
                onClick: () => fe(""),
                className: "absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600",
                children: /* @__PURE__ */ e(q, { className: "h-3.5 w-3.5" })
              }
            )
          ] }),
          /* @__PURE__ */ o("div", { className: "flex items-center gap-2", children: [
            w && /* @__PURE__ */ e(
              Fn,
              {
                columns: L,
                data: R,
                filename: k,
                condRules: H,
                aggregations: oe
              }
            ),
            /* @__PURE__ */ e("span", { className: "whitespace-nowrap text-xs font-medium text-slate-500", children: v ? "Loading..." : `${Ee.toLocaleString()} rows` })
          ] })
        ] }),
        X && ft && /* @__PURE__ */ e(
          En,
          {
            columns: L,
            filters: he,
            onFiltersChange: Ke,
            onClose: () => ht(!1)
          }
        ),
        X && Bt && /* @__PURE__ */ e(
          Vn,
          {
            columns: L,
            rules: H,
            onRulesChange: pt,
            onClose: () => Pt(!1)
          }
        ),
        X && Wt && /* @__PURE__ */ e(Mn, { columns: L, data: R, onClose: () => Gt(!1) }),
        /* @__PURE__ */ o(
          "div",
          {
            className: `relative border border-[#e2e8f0] shadow-sm ${J ? "flex-1 flex flex-col min-h-0 overflow-hidden" : "overflow-hidden"}`,
            children: [
              v && /* @__PURE__ */ e("div", { className: "absolute top-0 left-0 right-0 h-0.5 z-30 bg-primary/30", children: /* @__PURE__ */ e(
                "div",
                {
                  className: "dg-loading-sweep h-full w-1/3 bg-primary",
                  style: { background: "linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)" }
                }
              ) }),
              /* @__PURE__ */ e(
                "div",
                {
                  ref: we,
                  className: `overflow-auto focus:outline-none ${J ? "flex-1" : ""}`,
                  tabIndex: j ? 0 : void 0,
                  role: "grid",
                  "aria-label": `${ul} data table`,
                  "aria-rowcount": Ee,
                  "aria-colcount": I.getVisibleLeafColumns().length,
                  style: Il ? { width: "100%", ...O } : { height: J ? void 0 : D, width: "100%", ...O },
                  onFocus: () => {
                    j && !Q && bt({ row: 0, col: 0 });
                  },
                  children: /* @__PURE__ */ o(
                    "table",
                    {
                      className: "border-collapse",
                      "aria-label": ul,
                      style: { tableLayout: "fixed", width: "100%", minWidth: I.getTotalSize() },
                      children: [
                        /* @__PURE__ */ e("thead", { className: "sticky top-0 z-20", children: I.getHeaderGroups().map((t) => /* @__PURE__ */ o(nl, { children: [
                          /* @__PURE__ */ e("tr", { style: { background: "#f8fafc" }, children: t.headers.map((l) => {
                            var A;
                            const h = l.column.columnDef.meta, u = l.column.getCanSort(), p = l.column.getIsSorted(), y = l.column.columnDef.accessorKey ?? l.column.id, N = pe[y] || (h == null ? void 0 : h.pinned), F = ((A = xe[h == null ? void 0 : h.field]) == null ? void 0 : A.size) > 0;
                            return /* @__PURE__ */ o(
                              "th",
                              {
                                colSpan: l.colSpan,
                                role: "columnheader",
                                onDragOver: (S) => {
                                  S.preventDefault(), Fe(y);
                                },
                                onDragLeave: () => {
                                  Jt === y && Fe(null);
                                },
                                onDragEnd: () => {
                                  Pe(null), Fe(null);
                                },
                                onDrop: () => {
                                  if (Be && Be !== y) {
                                    const S = ie.length > 0 ? [...ie] : I.getVisibleLeafColumns().map((de) => de.columnDef.accessorKey ?? de.id), M = S.indexOf(Be), B = S.indexOf(y);
                                    M !== -1 && B !== -1 && (S.splice(M, 1), S.splice(B, 0, Be), Ie(S));
                                  }
                                  Pe(null), Fe(null);
                                },
                                onContextMenu: (S) => {
                                  S.preventDefault(), S.stopPropagation();
                                  const M = L.find((B) => (B.colId ?? B.field) === l.column.id);
                                  xt({
                                    x: S.clientX,
                                    y: S.clientY,
                                    rowData: {},
                                    colField: (M == null ? void 0 : M.field) ?? l.column.id,
                                    colHeader: (M == null ? void 0 : M.headerName) ?? l.column.id,
                                    cellValue: ""
                                  });
                                },
                                "aria-sort": p === "asc" ? "ascending" : p === "desc" ? "descending" : "none",
                                className: `relative px-3 ${ce.headerPy} text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500 select-none whitespace-nowrap border-b border-slate-200 ${p ? "text-indigo-600" : ""} ${u ? "cursor-pointer group hover:bg-slate-100" : ""} ${h != null && h.isNumeric ? "text-right" : ""} ${Jt === y && Be !== y ? "ring-2 ring-indigo-400 ring-inset" : ""}`,
                                style: {
                                  width: l.getSize(),
                                  minWidth: l.column.columnDef.minSize,
                                  maxWidth: l.column.columnDef.maxSize,
                                  position: N ? "sticky" : void 0,
                                  left: N === "left" ? 0 : void 0,
                                  right: N === "right" ? 0 : void 0,
                                  zIndex: N ? 30 : void 0,
                                  ...N ? { backgroundColor: "#f8fafc" } : {},
                                  ...p ? { background: "#eef2ff", borderBottom: "2px solid #a5b4fc" } : {}
                                },
                                onClick: u ? l.column.getToggleSortingHandler() : void 0,
                                title: (h == null ? void 0 : h.headerTooltip) ?? (u ? "Click to sort � Shift+Click for multi-sort � Drag to reorder" : void 0),
                                children: [
                                  /* @__PURE__ */ o("div", { className: "flex items-center gap-1.5", children: [
                                    /* @__PURE__ */ e(
                                      "span",
                                      {
                                        draggable: !0,
                                        onDragStart: (S) => {
                                          S.stopPropagation(), Pe(y);
                                        },
                                        onDragEnd: () => {
                                          Pe(null), Fe(null);
                                        },
                                        onMouseDown: (S) => S.stopPropagation(),
                                        className: "inline-flex",
                                        title: "Drag to reorder",
                                        children: /* @__PURE__ */ e(an, { className: "h-3 w-3 opacity-0 group-hover:opacity-40 transition-opacity text-slate-400 cursor-grab shrink-0" })
                                      }
                                    ),
                                    /* @__PURE__ */ e("span", { className: "text-[12px] font-semibold tracking-[0.02em] text-slate-700", children: l.isPlaceholder ? null : rl(l.column.columnDef.header, l.getContext()) }),
                                    u && !p && /* @__PURE__ */ e(il, { className: "h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity text-slate-400" }),
                                    p === "asc" && /* @__PURE__ */ o("span", { className: "inline-flex items-center gap-0.5", children: [
                                      /* @__PURE__ */ e(sn, { className: "h-3.5 w-3.5 text-sky-700" }),
                                      be.length > 1 && /* @__PURE__ */ e("span", { className: "text-[9px] text-sky-700 font-bold", children: be.findIndex((S) => S.id === l.column.id) + 1 })
                                    ] }),
                                    p === "desc" && /* @__PURE__ */ o("span", { className: "inline-flex items-center gap-0.5", children: [
                                      /* @__PURE__ */ e(cl, { className: "h-3.5 w-3.5 text-sky-700" }),
                                      be.length > 1 && /* @__PURE__ */ e("span", { className: "text-[9px] text-sky-700 font-bold", children: be.findIndex((S) => S.id === l.column.id) + 1 })
                                    ] }),
                                    F && /* @__PURE__ */ e(rt, { className: "h-3 w-3 text-sky-700 shrink-0" }),
                                    N && /* @__PURE__ */ e(Ft, { className: "h-2.5 w-2.5 text-sky-700 shrink-0" })
                                  ] }),
                                  (h == null ? void 0 : h.field) && /* @__PURE__ */ e(
                                    "button",
                                    {
                                      type: "button",
                                      onClick: (S) => {
                                        S.stopPropagation(), _t({
                                          field: h.field,
                                          header: h.headerName ?? h.field,
                                          x: S.clientX,
                                          y: S.clientY
                                        });
                                      },
                                      className: "absolute right-7 top-1/2 -translate-y-1/2 opacity-0 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-60 hover:!opacity-100 transition-opacity",
                                      title: "Filter values",
                                      children: /* @__PURE__ */ e(rt, { className: "h-3 w-3 text-sky-700" })
                                    }
                                  ),
                                  (h == null ? void 0 : h.field) && /* @__PURE__ */ e(
                                    "button",
                                    {
                                      type: "button",
                                      onClick: (S) => {
                                        S.stopPropagation(), Kt({
                                          field: h.field,
                                          header: h.headerName ?? h.field,
                                          x: S.clientX,
                                          y: S.clientY
                                        });
                                      },
                                      className: "absolute right-3 top-1/2 -translate-y-1/2 opacity-0 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-60 hover:!opacity-100 transition-opacity",
                                      title: "Column Statistics",
                                      children: /* @__PURE__ */ e(Tt, { className: "h-3 w-3 text-sky-700" })
                                    }
                                  ),
                                  /* @__PURE__ */ e(
                                    "div",
                                    {
                                      onMouseDown: l.getResizeHandler(),
                                      onTouchStart: l.getResizeHandler(),
                                      onDoubleClick: () => l.column.resetSize(),
                                      className: `absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none hover:bg-teal-400/60 ${l.column.getIsResizing() ? "bg-teal-400" : ""}`
                                    }
                                  )
                                ]
                              },
                              l.id
                            );
                          }) }),
                          Oe && /* @__PURE__ */ e("tr", { style: { background: "#f8fafc" }, children: t.headers.map((l) => {
                            const h = l.column.columnDef.meta, u = h == null ? void 0 : h.field, p = h == null ? void 0 : h.pinned, y = u && se[u], N = u ? L.find((S) => S.field === u) : null, A = (N == null ? void 0 : N.type) === "dateColumn" || (N == null ? void 0 : N.filter) === "agDateColumnFilter" || u && /date|time|created|updated|modified/i.test(u);
                            return /* @__PURE__ */ e(
                              "th",
                              {
                                className: "border-b border-slate-200 px-2 py-1",
                                style: {
                                  position: p ? "sticky" : void 0,
                                  left: p === "left" ? 0 : void 0,
                                  right: p === "right" ? 0 : void 0,
                                  zIndex: p ? 30 : void 0,
                                  ...p ? { backgroundColor: "hsl(var(--muted) / 0.4)" } : {}
                                },
                                children: u ? /* @__PURE__ */ e("div", { className: "relative", children: A ? /* @__PURE__ */ o(Z, { children: [
                                  /* @__PURE__ */ e(
                                    "input",
                                    {
                                      type: "date",
                                      value: se[u] ?? "",
                                      onChange: (S) => me((M) => ({ ...M, [u]: S.target.value })),
                                      className: `w-full h-7 rounded-md border px-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all ${y ? "border-indigo-400 bg-indigo-50/50 " : "border-gray-200 bg-white"}`,
                                      onClick: (S) => S.stopPropagation()
                                    }
                                  ),
                                  y && /* @__PURE__ */ e(
                                    "button",
                                    {
                                      onClick: (S) => {
                                        S.stopPropagation(), me((M) => {
                                          const B = { ...M };
                                          return delete B[u], B;
                                        });
                                      },
                                      className: "absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-gray-200 transition-colors",
                                      children: /* @__PURE__ */ e(q, { className: "h-3 w-3 text-gray-400" })
                                    }
                                  )
                                ] }) : /* @__PURE__ */ o(Z, { children: [
                                  /* @__PURE__ */ e(nt, { className: "absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" }),
                                  /* @__PURE__ */ e(
                                    "input",
                                    {
                                      type: "text",
                                      placeholder: "Filter...",
                                      value: se[u] ?? "",
                                      onChange: (S) => me((M) => ({ ...M, [u]: S.target.value })),
                                      className: `w-full h-7 rounded-md border pl-7 pr-6 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all ${y ? "border-indigo-400 bg-indigo-50/50 " : "border-gray-200 bg-white"}`,
                                      onClick: (S) => S.stopPropagation()
                                    }
                                  ),
                                  y && /* @__PURE__ */ e(
                                    "button",
                                    {
                                      onClick: (S) => {
                                        S.stopPropagation(), me((M) => {
                                          const B = { ...M };
                                          return delete B[u], B;
                                        });
                                      },
                                      className: "absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-gray-200 transition-colors",
                                      children: /* @__PURE__ */ e(q, { className: "h-3 w-3 text-gray-400" })
                                    }
                                  )
                                ] }) }) : /* @__PURE__ */ e("span", {})
                              },
                              `${l.id}-filter`
                            );
                          }) }, `${t.id}-filters`)
                        ] }, t.id)) }),
                        /* @__PURE__ */ e("tbody", { children: I.getRowModel().rows.length === 0 && v ? (
                          /* Skeleton rows — shown while the first page is loading */
                          /* @__PURE__ */ e(Z, { children: Array.from({ length: 8 }).map((t, l) => /* @__PURE__ */ e("tr", { className: "animate-pulse border-b border-slate-100 last:border-0", children: I.getVisibleLeafColumns().map((h, u) => /* @__PURE__ */ e("td", { className: "px-3 py-2.5", children: /* @__PURE__ */ e(
                            "div",
                            {
                              className: "h-3 rounded-full bg-slate-200",
                              style: { width: `${45 + (l * 31 + u * 17) % 45}%` }
                            }
                          ) }, h.id)) }, l)) })
                        ) : I.getRowModel().rows.length === 0 && !v ? /* @__PURE__ */ e("tr", { children: /* @__PURE__ */ e("td", { colSpan: L.length, className: "py-16 text-center", children: /* @__PURE__ */ o("div", { className: "flex flex-col items-center gap-2 text-muted-foreground", children: [
                          /* @__PURE__ */ e(nt, { className: "h-8 w-8 opacity-30" }),
                          /* @__PURE__ */ e("span", { className: "text-sm", children: E })
                        ] }) }) }) : P && Zt ? (
                          /* --- Grouped Rows --- */
                          Zt.map(([t, l]) => {
                            const h = Ml.has(t), u = I.getRowModel().rows.filter((p) => String(p.original[P] ?? "(Blank)") === t);
                            return /* @__PURE__ */ o(nl, { children: [
                              /* @__PURE__ */ e(
                                "tr",
                                {
                                  className: "cursor-pointer hover:bg-teal-50/60",
                                  style: { backgroundColor: "#eef2ff" },
                                  onClick: () => $e((p) => {
                                    const y = new Set(p);
                                    return y.has(t) ? y.delete(t) : y.add(t), y;
                                  }),
                                  children: /* @__PURE__ */ e("td", { colSpan: I.getVisibleLeafColumns().length, className: "px-3 py-2 text-sm font-semibold", children: /* @__PURE__ */ o("div", { className: "flex items-center gap-2", children: [
                                    h ? /* @__PURE__ */ e(dl, { className: "h-4 w-4 text-slate-600" }) : /* @__PURE__ */ e(cl, { className: "h-4 w-4 text-slate-600" }),
                                    /* @__PURE__ */ e(st, { className: "h-4 w-4 text-slate-500" }),
                                    /* @__PURE__ */ o("span", { className: "text-slate-700", children: [
                                      P,
                                      ":"
                                    ] }),
                                    /* @__PURE__ */ e("span", { className: "text-blue-900 font-bold", children: t }),
                                    /* @__PURE__ */ o("span", { className: "text-xs text-slate-500 font-normal ml-2", children: [
                                      "(",
                                      l.length,
                                      " rows)"
                                    ] })
                                  ] }) })
                                }
                              ),
                              !h && u.map((p, y) => {
                                const N = s ? s({ data: p.original }) : void 0;
                                return Ct(p, y, N);
                              })
                            ] }, t);
                          })
                        ) : ve ? (
                          /* --- Infinite Scroll (TanStack Virtual — only visible rows in DOM) --- */
                          /* @__PURE__ */ o(Z, { children: [
                            We.getVirtualItems().length > 0 && /* @__PURE__ */ e("tr", { style: { height: `${We.getVirtualItems()[0].start}px` }, "aria-hidden": !0, children: /* @__PURE__ */ e("td", { colSpan: I.getVisibleLeafColumns().length }) }),
                            We.getVirtualItems().map((t) => {
                              const l = I.getRowModel().rows[t.index];
                              if (!l) return null;
                              const h = s ? s({ data: l.original }) : void 0;
                              return Ct(l, t.index, h);
                            }),
                            (() => {
                              const t = We.getVirtualItems();
                              if (!t.length) return null;
                              const l = We.getTotalSize() - t[t.length - 1].end;
                              return l > 0 ? /* @__PURE__ */ e("tr", { style: { height: `${l}px` }, "aria-hidden": !0, children: /* @__PURE__ */ e("td", { colSpan: I.getVisibleLeafColumns().length }) }) : null;
                            })()
                          ] })
                        ) : (
                          /* --- Flat Rows (classic pagination mode) --- */
                          I.getRowModel().rows.map((t, l) => {
                            const h = s ? s({ data: t.original }) : void 0;
                            return Ct(t, l, h);
                          })
                        ) }),
                        ve && (He || !dt) && /* @__PURE__ */ e("tfoot", { children: /* @__PURE__ */ e("tr", { children: /* @__PURE__ */ e(
                          "td",
                          {
                            colSpan: I.getVisibleLeafColumns().length,
                            className: "py-4 text-center border-t border-slate-100",
                            children: He ? /* @__PURE__ */ o("span", { className: "inline-flex items-center gap-2 text-xs text-slate-500", children: [
                              /* @__PURE__ */ e(sl, { className: "h-3.5 w-3.5 animate-spin" }),
                              "Loading more rows…"
                            ] }) : /* @__PURE__ */ o("span", { className: "text-xs text-slate-400", children: [
                              "✓ All ",
                              R.length.toLocaleString(),
                              " rows loaded"
                            ] })
                          }
                        ) }) }),
                        oe && /* @__PURE__ */ e("tfoot", { className: "sticky bottom-0 z-10 border-t-2 border-blue-200", style: { backgroundColor: "#eff6ff" }, children: /* @__PURE__ */ e("tr", { children: I.getVisibleLeafColumns().map((t) => {
                          const l = t.columnDef.meta, h = l == null ? void 0 : l.field, u = h && oe[h];
                          return /* @__PURE__ */ e(
                            "td",
                            {
                              className: `px-3 ${ce.cellPy} text-xs font-semibold ${l != null && l.isNumeric ? "text-right tabular-nums" : ""}`,
                              style: { backgroundColor: "#eff6ff" },
                              children: u ? /* @__PURE__ */ o("span", { className: "text-slate-700", children: [
                                u.label,
                                ": ",
                                u.value
                              ] }) : t.getIndex() === 0 ? /* @__PURE__ */ e("span", { className: "text-gray-500 font-medium", children: "Totals" }) : null
                            },
                            t.id
                          );
                        }) }) })
                      ]
                    }
                  )
                }
              )
            ]
          }
        ),
        z && /* @__PURE__ */ e(
          Dn,
          {
            state: z,
            onClose: () => xt(null),
            onCopyCell: () => navigator.clipboard.writeText(z.cellValue),
            onCopyRow: () => {
              const t = L.filter((l) => !l.hide && (l.field || l.valueGetter)).map((l) => {
                let h;
                return typeof l.valueGetter == "function" ? h = l.valueGetter({ data: z.rowData }) : l.field && (h = z.rowData[l.field]), h != null ? String(h) : "";
              });
              navigator.clipboard.writeText(t.join("	"));
            },
            onExportCsv: () => $t(L, R, `${k}.csv`, oe),
            onExportExcel: () => Et(L, R, `${k}.xls`, H, oe),
            onExportPdf: () => Vt(L, R, `${k}.pdf`, H, oe),
            onSortAsc: () => {
              z.colField && Xe([{ id: z.colField, desc: !1 }]);
            },
            onSortDesc: () => {
              z.colField && Xe([{ id: z.colField, desc: !0 }]);
            },
            onClearSort: () => Xe([]),
            onHideColumn: () => {
              z.colField && ke((t) => ({ ...t, [z.colField]: !1 }));
            },
            onAutoFitColumns: () => I.resetColumnSizing(),
            onPinLeft: () => {
              z.colField && De((t) => ({ ...t, [z.colField]: "left" }));
            },
            onPinRight: () => {
              z.colField && De((t) => ({ ...t, [z.colField]: "right" }));
            },
            onUnpin: () => {
              z.colField && De((t) => ({ ...t, [z.colField]: !1 }));
            },
            isPinned: z.colField && pe[z.colField] || !1,
            onGroupByThis: () => {
              z.colField && (ge(z.colField === P ? null : z.colField), $e(/* @__PURE__ */ new Set()));
            },
            isGrouped: z.colField === P,
            onBestFitColumn: () => {
              if (!z.colField) return;
              const t = z.colField, h = document.createElement("canvas").getContext("2d");
              if (!h) return;
              h.font = `${ce.fontSize}px Inter, system-ui, sans-serif`;
              const u = L.find((y) => y.field === t);
              let p = h.measureText((u == null ? void 0 : u.headerName) ?? t).width + 24;
              R.forEach((y) => {
                const N = String(y[t] ?? ""), F = h.measureText(N).width + 24;
                F > p && (p = F);
              }), I.setColumnSizing((y) => ({ ...y, [t]: Math.ceil(p) }));
            },
            onOpenFilterEditor: () => ht(!0),
            onColumnChooser: () => {
              var l;
              const t = (l = It.current) == null ? void 0 : l.querySelector('[data-rtk-action="column-chooser"]');
              t == null || t.click();
            },
            onBestFitAll: lt,
            onChartColumn: () => {
              if (!z.colField) return;
              const t = z.colField, l = L.find((u) => u.field === t);
              if ((l == null ? void 0 : l.type) === "numericColumn" || (l == null ? void 0 : l.type) === "rightAligned") {
                const u = L.find(
                  (p) => p.field && p.field !== t && p.type !== "numericColumn" && p.type !== "rightAligned"
                );
                if (u != null && u.field) {
                  const p = {};
                  R.forEach((N) => {
                    const F = String(N[u.field] ?? "(Other)");
                    p[F] = (p[F] || 0) + Number(N[t] || 0);
                  });
                  const y = Object.entries(p).sort((N, F) => F[1] - N[1]).slice(0, 15).map(([N, F]) => ({ label: N, value: F }));
                  Nt({
                    data: y,
                    title: `${l.headerName ?? t} by ${u.headerName ?? u.field}`
                  });
                }
              } else {
                const u = {};
                R.forEach((y) => {
                  const N = String(y[t] ?? "(Blank)");
                  u[N] = (u[N] || 0) + 1;
                });
                const p = Object.entries(u).sort((y, N) => N[1] - y[1]).slice(0, 15).map(([y, N]) => ({ label: y, value: N }));
                Nt({ data: p, title: `${(l == null ? void 0 : l.headerName) ?? t} Distribution` });
              }
            }
          }
        ),
        qt && /* @__PURE__ */ e(On, { state: qt, data: R, onClose: () => Kt(null) }),
        yt && /* @__PURE__ */ e(
          Ln,
          {
            state: yt,
            data: qe,
            selectedValues: xe[yt.field] ?? /* @__PURE__ */ new Set(),
            onApply: (t, l) => {
              Ye((h) => {
                const u = { ...h };
                return l.size === 0 ? delete u[t] : u[t] = l, u;
              });
            },
            onClose: () => _t(null)
          }
        ),
        Yt && /* @__PURE__ */ e(Rn, { state: Yt, onClose: () => Nt(null) }),
        Ut && /* @__PURE__ */ e(
          "div",
          {
            className: "fixed inset-0 z-[60] flex items-start justify-center pt-16 bg-black/20",
            onMouseDown: (t) => {
              t.target === t.currentTarget && Se(!1);
            },
            children: /* @__PURE__ */ o("div", { className: "bg-white rounded-xl shadow-2xl border border-slate-200 w-[500px] max-h-[80vh] flex flex-col", children: [
              /* @__PURE__ */ o("div", { className: "flex items-center justify-between px-5 py-4 border-b border-slate-200", children: [
                /* @__PURE__ */ o("div", { children: [
                  /* @__PURE__ */ e("h2", { className: "text-sm font-semibold text-slate-900", children: "Grid Views" }),
                  /* @__PURE__ */ e("p", { className: "text-xs text-slate-500 mt-0.5", children: "Save and restore filters, columns, and sort order" })
                ] }),
                /* @__PURE__ */ e(
                  "button",
                  {
                    type: "button",
                    onClick: () => Se(!1),
                    className: "p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors",
                    children: /* @__PURE__ */ e(q, { className: "h-4 w-4" })
                  }
                )
              ] }),
              /* @__PURE__ */ o("div", { className: "px-5 py-4 border-b border-slate-200 bg-slate-50/60", children: [
                /* @__PURE__ */ e("p", { className: "text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2", children: "Save Current View" }),
                /* @__PURE__ */ o("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ e(
                    "input",
                    {
                      type: "text",
                      value: je,
                      onChange: (t) => _e(t.target.value),
                      onKeyDown: (t) => {
                        t.key === "Enter" && je.trim() && tl(je);
                      },
                      placeholder: "e.g. Morning filter, Q2 sales…",
                      className: "flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                    }
                  ),
                  /* @__PURE__ */ e(
                    "button",
                    {
                      type: "button",
                      disabled: !je.trim(),
                      onClick: () => tl(je),
                      className: "px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors",
                      children: "Save"
                    }
                  )
                ] }),
                /* @__PURE__ */ e("p", { className: "text-[11px] text-slate-400 mt-1.5", children: "Captures active filters, search, sort, columns & visibility" })
              ] }),
              /* @__PURE__ */ e("div", { className: "flex-1 overflow-y-auto", children: (() => {
                const t = ll();
                return t.length === 0 ? /* @__PURE__ */ o("div", { className: "flex flex-col items-center justify-center py-14 text-slate-400", children: [
                  /* @__PURE__ */ e(Ge, { className: "h-9 w-9 mb-3 opacity-25" }),
                  /* @__PURE__ */ e("p", { className: "text-sm font-medium text-slate-500", children: "No saved views yet" }),
                  /* @__PURE__ */ e("p", { className: "text-xs mt-1", children: "Type a name above and click Save" })
                ] }) : /* @__PURE__ */ o("div", { children: [
                  /* @__PURE__ */ o("div", { className: "px-5 py-2.5 flex items-center justify-between border-b border-slate-100 bg-slate-50/40", children: [
                    /* @__PURE__ */ e("span", { className: "text-[11px] font-semibold text-slate-500 uppercase tracking-wide", children: "Saved Views" }),
                    /* @__PURE__ */ o("span", { className: "text-[11px] text-slate-400", children: [
                      t.length,
                      " view",
                      t.length !== 1 ? "s" : ""
                    ] })
                  ] }),
                  t.map((l, h) => /* @__PURE__ */ o("div", { className: "flex items-center gap-3 px-5 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0", children: [
                    /* @__PURE__ */ e(
                      "button",
                      {
                        type: "button",
                        onClick: () => Ul(l.name),
                        className: `shrink-0 text-xl leading-none transition-colors ${l.isDefault ? "text-amber-400 hover:text-amber-300" : "text-slate-200 hover:text-amber-400"}`,
                        title: l.isDefault ? "Remove default — click to unset" : "Set as default — auto-loads on open",
                        children: l.isDefault ? "★" : "☆"
                      }
                    ),
                    /* @__PURE__ */ o("div", { className: "flex-1 min-w-0", children: [
                      /* @__PURE__ */ o("div", { className: "flex items-center gap-2 flex-wrap", children: [
                        /* @__PURE__ */ e("span", { className: "text-sm font-medium text-slate-800 truncate", children: l.name }),
                        l.isDefault && /* @__PURE__ */ e("span", { className: "shrink-0 text-[10px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full", children: "Default" })
                      ] }),
                      l.isDefault && /* @__PURE__ */ e("p", { className: "text-[11px] text-amber-600 mt-0.5", children: "Auto-loads when you open this page" })
                    ] }),
                    /* @__PURE__ */ o("div", { className: "flex items-center gap-1 shrink-0", children: [
                      /* @__PURE__ */ e(
                        "button",
                        {
                          type: "button",
                          onClick: () => {
                            ql(h);
                          },
                          className: "px-3 py-1.5 text-xs rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium transition-colors",
                          children: "Load"
                        }
                      ),
                      /* @__PURE__ */ e(
                        "button",
                        {
                          type: "button",
                          onClick: () => Kl(l.name),
                          className: "p-1.5 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors",
                          title: "Delete this view",
                          children: /* @__PURE__ */ e(q, { className: "h-3.5 w-3.5" })
                        }
                      )
                    ] })
                  ] }, l.name))
                ] });
              })() }),
              /* @__PURE__ */ e("div", { className: "px-5 py-3 border-t border-slate-200 bg-slate-50/60 rounded-b-xl", children: /* @__PURE__ */ e("p", { className: "text-[11px] text-slate-400", children: "★ Click the star to set a default view — it will auto-load every time you open this grid" }) })
            ] })
          }
        ),
        /* @__PURE__ */ o("div", { className: "flex items-center justify-between border border-t-0 border-slate-200 px-3 py-1 text-[11px] text-slate-500 bg-white", children: [
          /* @__PURE__ */ o("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ o("span", { children: [
              /* @__PURE__ */ e("span", { className: "font-semibold text-gray-700 dark:text-slate-200", children: R.length.toLocaleString() }),
              Ee !== R.length && /* @__PURE__ */ o(Z, { children: [
                " / ",
                Ee.toLocaleString()
              ] }),
              " rows"
            ] }),
            tt > 0 && /* @__PURE__ */ o("span", { className: "inline-flex items-center gap-1 text-amber-600 font-medium", children: [
              /* @__PURE__ */ e(rt, { className: "h-2.5 w-2.5" }),
              " ",
              tt
            ] }),
            be.length > 0 && /* @__PURE__ */ o("span", { className: "inline-flex items-center gap-1", children: [
              /* @__PURE__ */ e(il, { className: "h-2.5 w-2.5" }),
              be.map((t) => t.id).join(", ")
            ] }),
            te && /* @__PURE__ */ o(
              "span",
              {
                className: "hidden xl:inline-flex max-w-[720px] truncate rounded border border-amber-200 bg-amber-50 px-2 py-0.5 font-mono text-[10px] text-amber-900",
                title: Xt,
                children: [
                  "click: ",
                  Xt
                ]
              }
            )
          ] }),
          /* @__PURE__ */ o("div", { className: "flex items-center gap-3", children: [
            el.length > 0 && R.length > 0 && (() => {
              const t = el[0], l = R.map((p) => Number(p[t.field] || 0)).filter((p) => !isNaN(p)), h = l.reduce((p, y) => p + y, 0), u = l.length > 0 ? h / l.length : 0;
              return /* @__PURE__ */ o("span", { className: "hidden md:inline-flex items-center gap-2.5 text-gray-600", children: [
                /* @__PURE__ */ o("span", { className: "inline-flex items-center gap-0.5", children: [
                  /* @__PURE__ */ e(cn, { className: "h-3 w-3 text-teal-600" }),
                  /* @__PURE__ */ e("span", { className: "font-medium", children: h.toLocaleString(void 0, { maximumFractionDigits: 2 }) })
                ] }),
                /* @__PURE__ */ e("span", { className: "text-gray-300", children: "|" }),
                /* @__PURE__ */ o("span", { children: [
                  "Avg:",
                  " ",
                  /* @__PURE__ */ e("span", { className: "font-medium", children: u.toLocaleString(void 0, { maximumFractionDigits: 2 }) })
                ] }),
                /* @__PURE__ */ e("span", { className: "text-gray-300", children: "|" }),
                /* @__PURE__ */ o("span", { children: [
                  "Count: ",
                  /* @__PURE__ */ e("span", { className: "font-medium", children: l.length.toLocaleString() })
                ] })
              ] });
            })(),
            T && !ve && /* @__PURE__ */ o("div", { className: "flex items-center gap-0.5", children: [
              /* @__PURE__ */ e(
                "button",
                {
                  className: "inline-flex h-6 w-6 items-center justify-center rounded border hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none",
                  disabled: x <= 1,
                  onClick: () => a == null ? void 0 : a(1),
                  title: "First page",
                  children: /* @__PURE__ */ e(dn, { className: "h-3 w-3" })
                }
              ),
              /* @__PURE__ */ e(
                "button",
                {
                  className: "inline-flex h-6 w-6 items-center justify-center rounded border hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none",
                  disabled: x <= 1,
                  onClick: () => a == null ? void 0 : a(x - 1),
                  title: "Previous page",
                  children: /* @__PURE__ */ e(un, { className: "h-3 w-3" })
                }
              ),
              /* @__PURE__ */ o("span", { className: "px-1.5 text-[11px] font-medium text-gray-700", children: [
                x,
                "/",
                Qe
              ] }),
              /* @__PURE__ */ e(
                "button",
                {
                  className: "inline-flex h-6 w-6 items-center justify-center rounded border hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none",
                  disabled: x >= Qe,
                  onClick: () => a == null ? void 0 : a(x + 1),
                  title: "Next page",
                  children: /* @__PURE__ */ e(dl, { className: "h-3 w-3" })
                }
              ),
              /* @__PURE__ */ e(
                "button",
                {
                  className: "inline-flex h-6 w-6 items-center justify-center rounded border hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none",
                  disabled: x >= Qe,
                  onClick: () => a == null ? void 0 : a(Qe),
                  title: "Last page",
                  children: /* @__PURE__ */ e(mn, { className: "h-3 w-3" })
                }
              )
            ] })
          ] })
        ] })
      ]
    }
  );
}
function zn(r) {
  const [n, g] = $([]), f = W(
    (b) => {
      g((v) => {
        const m = typeof b == "function" ? b(v) : b;
        return r && (m.length > 0 ? r(m[0].id, m[0].desc ? "desc" : "asc") : r(null, null)), m;
      });
    },
    [r]
  );
  return [n, f];
}
function jn(r, n, g) {
  const [f, b] = $({}), v = W(
    (m) => {
      b((x) => {
        const C = typeof m == "function" ? m(x) : m;
        if (g) {
          const a = Object.keys(C).filter((c) => C[c]).map((c) => n[Number(c)]).filter(Boolean);
          g({ api: { getSelectedRows: () => a } });
        }
        return C;
      });
    },
    [g, n]
  );
  return [f, v];
}
function Un(r, n) {
  const [g, f] = $(r), [b, v] = $();
  return U(() => {
    b && clearTimeout(b);
    const m = setTimeout(() => f(r), n);
    v(m);
  }, [r, n]), g;
}
function Jn(r, n) {
  const [g, f] = $();
  return W(
    (...b) => {
      g && clearTimeout(g);
      const v = setTimeout(() => r(...b), n);
      f(v);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [r, n]
  );
}
export {
  Kn as DataGrid,
  Un as useDebounce,
  Jn as useDebouncedCallback
};
