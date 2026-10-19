import { CSSProperties, ReactNode } from 'react';
export interface CellRenderContext<TData = any> {
    value: any;
    data: TData;
    node: {
        data: TData;
    };
}
export type ICellRendererParams<TData = any> = CellRenderContext<TData>;
export interface FormatContext<TData = any> {
    value: any;
    data: TData;
}
export interface GridColumn<TData = any> {
    field?: (string & keyof TData) | string;
    headerName?: string;
    colId?: string;
    width?: number;
    minWidth?: number;
    maxWidth?: number;
    flex?: number | null;
    sortable?: boolean;
    filter?: boolean | string;
    resizable?: boolean;
    hide?: boolean | null;
    pinned?: "left" | "right" | boolean | null;
    type?: string | string[];
    cellRenderer?: "badge" | "sparkline" | "sparkline-line" | ((params: CellRenderContext<TData>) => ReactNode);
    badgeMap?: Record<string, "success" | "warning" | "danger" | "info">;
    sparklineColor?: string;
    sparklineType?: "bar" | "line";
    valueFormatter?: string | ((params: any) => any);
    valueGetter?: string | ((params: any) => any);
    cellStyle?: any;
    tooltipField?: string;
    headerTooltip?: string;
    checkboxSelection?: boolean | ((params: any) => boolean);
    selectable?: boolean;
    headerFilter?: boolean;
    draggable?: boolean;
    aggregate?: "sum" | "avg" | "count" | "min" | "max";
    [key: string]: any;
}
export type ColDef<TData = any> = GridColumn<TData>;
type DensityMode = "compact" | "comfortable" | "spacious";
export interface DataGridProps<TData = any> {
    columns?: GridColumn<TData>[];
    data?: TData[];
    columnDefs?: GridColumn<TData>[];
    rowData?: TData[];
    rows?: TData[];
    loading?: boolean;
    totalCount?: number;
    page?: number;
    pageSize?: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    onSortChange?: (sortField: string | null, sortDir: "asc" | "desc" | null) => void;
    onRowClicked?: (data: TData) => void;
    getRowClass?: (params: {
        data: TData | undefined;
    }) => string | undefined;
    height?: string | number;
    enableExport?: boolean;
    exportFilename?: string;
    noRowsMessage?: string;
    serverSidePagination?: boolean;
    style?: CSSProperties;
    domLayout?: "normal" | "autoHeight" | "print";
    headerActions?: ReactNode;
    pageSizes?: number[];
    rowSelection?: "single" | "multiple";
    onSelectionChanged?: (event: {
        api: {
            getSelectedRows: () => TData[];
        };
    }) => void;
    defaultDensity?: DensityMode;
    enableFullscreen?: boolean;
    enableKeyboardNav?: boolean;
    stateId?: string;
    useEnterpriseToolbar?: boolean;
    showClickTracker?: boolean;
    /** Fires when the user types in a column header filter input. */
    onHeaderFiltersChange?: (filters: Record<string, string>) => void;
    /** Fires when the user types in the toolbar global search input. */
    onGlobalSearchChange?: (search: string) => void;
    /** Auto-apply Best Fit All Columns whenever displayed data changes. */
    autoBestFitAllColumns?: boolean;
    /** Called when the user scrolls within `infiniteScrollThreshold` px of the bottom.
     *  The parent should fetch the next page and append rows to `data`. */
    onLoadMore?: () => void;
    /** Set to false when the last page has been fetched (stops calling onLoadMore). Default: true */
    hasMore?: boolean;
    /** Set to true while the next page is loading (shows a spinner). Default: false */
    isLoadingMore?: boolean;
    /** Distance in px from the bottom that triggers onLoadMore. Default: 300 */
    infiniteScrollThreshold?: number;
    /**
     * License key issued by the PCB-Grid platform team (see packages/datagrid-lib/README.md
     * for how to request one). Advisory only — an invalid or missing key logs a
     * console warning but never blocks rendering.
     */
    licenseKey?: string;
}
export declare function DataGrid<TData = any>({ columns: columnsProp, data: dataProp, columnDefs, rowData, rows, loading, totalCount, page, pageSize, onPageChange, onPageSizeChange, onSortChange, onRowClicked, getRowClass, height, enableExport, exportFilename, noRowsMessage, serverSidePagination, style, domLayout, headerActions, pageSizes, rowSelection, onSelectionChanged, defaultDensity, enableFullscreen, enableKeyboardNav, stateId, useEnterpriseToolbar, showClickTracker, onHeaderFiltersChange, onGlobalSearchChange, onLoadMore, hasMore, isLoadingMore, infiniteScrollThreshold, autoBestFitAllColumns, licenseKey, }: DataGridProps<TData>): import("react").JSX.Element;
export default DataGrid;
