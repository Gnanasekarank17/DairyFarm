import { ColumnDef, Row, TableOptions } from '@tanstack/react-table';
import { UseQueryOptions } from '@tanstack/react-query';
import { ReactNode } from 'react';
export interface SortModel {
    field: string;
    dir: 'asc' | 'desc';
}
export type FilterOperator = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'startsWith' | 'endsWith' | 'between' | 'in';
export interface FilterModel {
    field: string;
    operator: FilterOperator;
    value: unknown;
    /** For "between" operator, provides second bound */
    valueTo?: unknown;
}
export interface QueryModel {
    page: number;
    pageSize: number;
    sort: SortModel[];
    filters: FilterModel[];
    search: string;
}
export interface QueryResult<TData> {
    data: TData[];
    totalCount: number;
}
export interface DataGridFeatures {
    sorting?: boolean;
    multiSort?: boolean;
    filtering?: boolean;
    pagination?: boolean;
    export?: boolean;
    columnVisibility?: boolean;
    columnResizing?: boolean;
    rowSelection?: boolean;
    expandableRows?: boolean;
    globalSearch?: boolean;
    stickyHeader?: boolean;
    stickyColumns?: boolean;
    virtualScrolling?: boolean;
    alternateRowColors?: boolean;
    hoverHighlight?: boolean;
}
export type FilterType = 'text' | 'number' | 'date' | 'select' | 'multi-select';
export interface FilterConfig {
    type: FilterType;
    /** Options for select/multi-select filters */
    options?: {
        label: string;
        value: string;
    }[];
    /** Placeholder text */
    placeholder?: string;
}
export interface ConditionalFormat<TData> {
    condition: (value: unknown, row: TData) => boolean;
    className?: string;
    style?: React.CSSProperties;
}
export interface DataGridColumnMeta<TData = unknown> {
    /** Filter configuration for this column */
    filterConfig?: FilterConfig;
    /** Whether this column is pinned (sticky) */
    pinned?: 'left' | 'right';
    /** Conditional formatting rules */
    conditionalFormats?: ConditionalFormat<TData>[];
    /** Display as a status badge */
    badge?: boolean;
    /** Badge color mapping: status -> color */
    badgeColors?: Record<string, string>;
}
export type DataGridColumn<TData> = ColumnDef<TData, unknown> & {
    meta?: DataGridColumnMeta<TData>;
};
export type DataGridTheme = 'light' | 'dark';
export interface ExportConfig {
    /** API endpoint to call for export */
    endpoint: string;
    /** HTTP method (defaults to POST) */
    method?: 'GET' | 'POST';
    /** Custom filename for download */
    filename?: string;
    /** Additional headers to send */
    headers?: Record<string, string>;
}
export type DataFetcher<TData> = (query: QueryModel) => Promise<QueryResult<TData>>;
export type ExpandedRowRenderer<TData> = (row: Row<TData>) => ReactNode;
export interface DataGridProps<TData> {
    /** Column definitions */
    columns: DataGridColumn<TData>[];
    /** Data fetcher function called with the current query model */
    fetcher: DataFetcher<TData>;
    /** Feature flags to enable/disable functionality */
    features?: DataGridFeatures;
    /** Theme: light or dark */
    theme?: DataGridTheme;
    /** Additional CSS class name */
    className?: string;
    /** Unique query key for TanStack Query caching */
    queryKey?: string;
    /** Initial page size (default: 50) */
    pageSize?: number;
    /** Page size options */
    pageSizeOptions?: number[];
    /** Export configuration */
    exportConfig?: ExportConfig;
    /** Render function for expandable rows */
    renderExpandedRow?: ExpandedRowRenderer<TData>;
    /** Additional TanStack Query options */
    queryOptions?: Partial<UseQueryOptions>;
    /** Debounce delay for search/filter inputs in ms (default: 300) */
    debounceMs?: number;
    /** Height of each row in pixels for virtual scrolling (default: 40) */
    rowHeight?: number;
    /** Maximum height of the table container in pixels (default: 600) */
    maxHeight?: number;
    /** Callback when row selection changes */
    onSelectionChange?: (rows: TData[]) => void;
    /** Custom empty state renderer */
    renderEmpty?: () => ReactNode;
    /** Custom loading state renderer */
    renderLoading?: () => ReactNode;
    /** Table options override for advanced TanStack Table config */
    tableOptions?: Partial<TableOptions<TData>>;
}
export interface DataGridState {
    page: number;
    pageSize: number;
    sorting: SortModel[];
    filters: FilterModel[];
    search: string;
    columnVisibility: Record<string, boolean>;
    rowSelection: Record<string, boolean>;
    expanded: Record<string, boolean>;
}
export type DataGridAction = {
    type: 'SET_PAGE';
    page: number;
} | {
    type: 'SET_PAGE_SIZE';
    pageSize: number;
} | {
    type: 'SET_SORTING';
    sorting: SortModel[];
} | {
    type: 'SET_FILTERS';
    filters: FilterModel[];
} | {
    type: 'ADD_FILTER';
    filter: FilterModel;
} | {
    type: 'REMOVE_FILTER';
    field: string;
} | {
    type: 'CLEAR_FILTERS';
} | {
    type: 'SET_SEARCH';
    search: string;
} | {
    type: 'SET_COLUMN_VISIBILITY';
    visibility: Record<string, boolean>;
} | {
    type: 'TOGGLE_COLUMN';
    columnId: string;
} | {
    type: 'SET_ROW_SELECTION';
    selection: Record<string, boolean>;
} | {
    type: 'SET_EXPANDED';
    expanded: Record<string, boolean>;
} | {
    type: 'RESET';
};
