# @oeconnection/pcb-grid

Internal DataGrid library for the Stellantis PCB platform, built on TanStack Table and TanStack Virtual. Ships as two independent entry points so consumers only pay for what they use:

- **`@oeconnection/pcb-grid`** — the core `DataGrid`: sorting, filtering (header + advanced), grouping, column pinning/resizing/reordering, conditional formatting, a pivot table, saved views, and CSV/Excel/PDF export. This is what every product should import.
- **`@oeconnection/pcb-grid/enterprise`** — an optional `EnterpriseGrid` variant with built-in charting (chart.js) and a synthetic data generator, for prototyping/demos. Pulls in extra weight (chart.js, date-fns) that the core entry does not.

## Installation

`@oeconnection/pcb-grid` is published to the **Shared** Azure Artifacts feed (org-wide, not tied to any one project), so any team in OEC-EUR can consume it like a normal npm package.

Add a project-level `.npmrc` (commit this — it has no secret in it) pointing the scope at the feed:

```ini
@oeconnection:registry=https://pkgs.dev.azure.com/OEC-EUR/_packaging/Shared/npm/registry/
```

Then authenticate once per machine/CI agent and install as usual:

```bash
# one-time auth against the feed (Windows/macOS/Linux, via the Azure Artifacts Credential Provider)
npx google-artifactregistry-auth 2>/dev/null; npx vsts-npm-auth -config .npmrc   # Windows
# or, in CI: use the `npmAuthenticate@0` pipeline task before `npm install`

npm install @oeconnection/pcb-grid
```

If `vsts-npm-auth` isn't available for your platform, add an auth line manually (base64-encode a PAT with **Packaging (Read)** scope):

```ini
//pkgs.dev.azure.com/OEC-EUR/_packaging/Shared/npm/registry/:username=OEC-EUR
//pkgs.dev.azure.com/OEC-EUR/_packaging/Shared/npm/registry/:_password=<BASE64_PAT>
//pkgs.dev.azure.com/OEC-EUR/_packaging/Shared/npm/registry/:email=not-used@oeconnection.com
```

Never commit that auth line to a shared `.npmrc` — keep it in your user-level `~/.npmrc` or as a CI secret.

### Peer dependencies

```bash
npm install react react-dom lucide-react
```

React 18 or 19 is supported.

### Required: a CSS reset for native form elements

This package ships `@tailwind utilities` only — never Tailwind's `base` (Preflight) layer — so it never clobbers a consuming app's own global styles. That means **your app must supply its own reset for native `<button>`/`<input>`/`<select>` elements**, or the grid's toolbar controls render with raw, unstyled browser chrome (looks like an old Windows dialog).

- If your app already uses Tailwind: nothing to do, its own Preflight covers this.
- If it doesn't, add a minimal Tailwind setup just for the reset (no need to point `content` at this package's source — it ships pre-compiled CSS):

  ```bash
  npm install -D tailwindcss postcss autoprefixer
  ```

  `tailwind.config.js`:
  ```js
  /** @type {import('tailwindcss').Config} */
  export default { content: ['./src/**/*.{ts,tsx}'], theme: { extend: {} }, plugins: [] };
  ```

  `postcss.config.js`:
  ```js
  export default { plugins: { tailwindcss: {}, autoprefixer: {} } };
  ```

  `src/index.css` (import once, at your app's entry point):
  ```css
  @tailwind base;
  ```

### License key

`<DataGrid licenseKey="...">` is optional and **advisory only** — if it's missing, malformed, or expired, the grid still renders and works normally. There is no UI prompt; you'll only see a one-time `console.warn` in the browser DevTools console (`[PCB-Grid] No license key provided...`). See the [License key](#license-key-for-consuming-teams) section below to request one.

## Quick start

```tsx
import { DataGrid, type ColDef } from "@oeconnection/pcb-grid";
import "@oeconnection/pcb-grid/styles";

interface Invoice {
  id: number;
  customer: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
}

const columns: ColDef<Invoice>[] = [
  { field: "id", headerName: "ID", width: 90 },
  { field: "customer", headerName: "Customer" },
  {
    field: "amount",
    headerName: "Amount",
    type: "numericColumn",
    aggregate: "sum",
    valueFormatter: (p) => p.value.toLocaleString(undefined, { style: "currency", currency: "USD" }),
  },
  {
    field: "status",
    headerName: "Status",
    cellRenderer: (p) => (
      <span className={p.value === "paid" ? "text-emerald-600" : "text-amber-600"}>{p.value}</span>
    ),
  },
];

function App({ invoices }: { invoices: Invoice[] }) {
  return (
    <DataGrid
      columns={columns}
      rowData={invoices}
      enableExport
      exportFilename="invoices"
    />
  );
}
```

## Column definition (`GridColumn<TData>` / `ColDef<TData>`)

| Field | Type | Notes |
|---|---|---|
| `field` | `string` | Property key on the row object |
| `headerName` | `string` | Column header text |
| `width` / `minWidth` / `maxWidth` | `number` | Sizing |
| `flex` | `number` | Flexible width share |
| `sortable` / `filter` / `resizable` | `boolean` | Feature toggles, default on |
| `headerFilter` | `boolean` | Show an inline header filter input |
| `pinned` | `"left" \| "right"` | Sticky column |
| `type` | `string \| string[]` | e.g. `"numericColumn"` for right-aligned/numeric styling |
| `valueGetter` | `(params) => any` | Derive a value not backed by `field` |
| `valueFormatter` | `(params: { value, data }) => any` | Format the displayed **and exported** value |
| `cellRenderer` | `(params) => ReactNode` | Custom cell content |
| `aggregate` | `"sum" \| "avg" \| "count" \| "min" \| "max"` | Include this column in the footer totals row and export totals row |
| `checkboxSelection` | `boolean \| (params) => boolean` | Row selection checkbox column |

## Key props (`DataGridProps<TData>`)

| Prop | Type | Description |
|---|---|---|
| `columns` / `columnDefs` | `GridColumn<TData>[]` | Column definitions (either name works) |
| `rowData` / `data` / `rows` | `TData[]` | Row data (any of the three names works) |
| `loading` | `boolean` | Shows the loading indicator/skeleton rows |
| `totalCount`, `page`, `pageSize`, `onPageChange`, `onPageSizeChange` | — | Server-side pagination |
| `serverSidePagination` | `boolean` | Disable client-side paging/sorting when the server owns it |
| `onLoadMore`, `hasMore`, `isLoadingMore`, `infiniteScrollThreshold` | — | Infinite-scroll mode instead of paged mode |
| `enableExport` | `boolean` | Show CSV/Excel/PDF export controls |
| `exportFilename` | `string` | Base filename for exports (extension is added per format) |
| `onRowClicked` | `(data: TData) => void` | Row click handler |
| `defaultDensity` | `"compact" \| "comfortable" \| "spacious"` | Initial row density |
| `stateId` | `string` | Unique key to persist column layout/filters/saved views to `localStorage` |
| `noRowsMessage` | `string` | Empty-state text override |
| `height` | `string \| number` | Fixed table height (omit for auto-height) |
| `enableFullscreen`, `enableKeyboardNav` | `boolean` | UX toggles, default on |
| `licenseKey` | `string` | License key for your team (see [License](#license) below) |

## Conditional formatting

Click the palette icon in the toolbar to add cell- or row-scoped rules (`field`, operator, threshold, background/foreground color). Rules apply live on screen **and** carry over into Excel and PDF exports (CSV has no styling capability, so it only gets the totals row).

## Pivot table

Click the table icon in the toolbar to open a pivot view: pick a row field, an optional column field, a value field, and an aggregation (sum/avg/count/min/max). It computes off the currently filtered grid data and includes grand totals; the pivot result can be exported to CSV independently of the main grid export.

## Export (CSV / Excel / PDF)

All three formats reflect exactly what's on screen:
- Cell values go through `valueFormatter` (or best-effort text extraction from `cellRenderer` output) rather than the raw field value.
- Columns with `aggregate` set produce a totals row at the bottom, matching the on-screen footer.
- Conditional formatting colors are applied to Excel cell styles and PDF inline styles.

## Theming

CSS variables can be overridden on a wrapper class; see `src/styles/grid.css` for the full variable list. Import `@oeconnection/pcb-grid/styles` once per app.

## Language

English only. There is no `locale`/`labels` prop and no i18n layer — all UI strings (toolbar, filters, pivot, pagination, empty states, context menu) are plain hardcoded English text in the component, and number/date formatting uses the browser's default locale via bare `toLocaleString()` calls. There is also no RTL (right-to-left) layout support.

## Enterprise module

```tsx
import { EnterpriseGrid, generateEnterpriseGridData } from "@oeconnection/pcb-grid/enterprise";

const rows = generateEnterpriseGridData(200);

export default function Demo() {
  return <EnterpriseGrid data={rows} title="Enterprise Grid" />;
}
```

This module is an independent, in-house implementation (chart.js-backed charting, its own pivot/conditional-format panels) — it does not reuse or copy any third-party commercial grid's source or assets. It is not currently wired into any product page; treat it as a prototype surface, not a supported production path, until it gets the same review as the core grid.

## Building

```bash
npm run build
```

Outputs (per entry point):
- `dist/datagrid.js` / `dist/datagrid.cjs` — core entry (ES module / CommonJS)
- `dist/enterprise.js` / `dist/enterprise.cjs` — enterprise entry
- `dist/*.d.ts` — TypeScript declarations
- `dist/core.css` — styles

## Publishing (platform team only)

Versions are published to the `Shared` Azure Artifacts feed, not to public npm.

```bash
npm version patch   # or minor / major — updates package.json + creates a git tag
npm run build
npm publish         # uses "publishConfig.registry" in package.json
git push --follow-tags
```

The `azure-pipelines.yml` in this repo does the same automatically whenever a `v*` tag is pushed, so publishing by hand is only needed for one-off/manual releases.

## License

UNLICENSED — internal to OEC-EUR only, distributed via the private `Shared` Azure Artifacts feed rather than public npm (see [Installation](#installation)). The soft license-key mechanism below is for usage tracking/attribution across teams, not access control.

### License key (for consuming teams)

`<DataGrid>` accepts an optional `licenseKey` prop:

```tsx
<DataGrid licenseKey={import.meta.env.VITE_RTK_GRID_LICENSE_KEY} ... />
```

If it's missing, malformed, expired, or doesn't verify, the grid still renders and works normally — you'll just get a one-time `console.warn` naming the reason. This is a tracking/attribution mechanism, not a hard lock, so a bad key can never break your app in production.

**To request a key**, tell the platform team your team/product name and (optionally) a desired expiry date. Don't check the key into source control as a literal string — pass it in via an env var / app config, the same way you would any other per-environment value.

### Issuing keys (platform team only)

Keys are Ed25519-signed: a key can only be minted with the private signing key, which is **not** in this repo. One-time setup, then one command per requesting team:

```bash
# once, ever — writes license-private-key.json (gitignored) and prints the
# public key that's already embedded in src/license.ts
npm run license:generate-keypair

# per team
npm run license:issue -- --team "APAC-Fleet" --expires 2027-01-01
```

Back up `license-private-key.json` somewhere safe outside the repo (password manager / secrets vault) — it is never committed, and losing it means re-keying every team that already has a license.
