export type FilterType = "text" | "number" | "date" | "boolean" | "select" | "multiselect";
export interface ColumnFilter {
    columnId: string;
    type: FilterType;
    value: string;
    valueTo?: string;
    values?: string[];
}
export declare const DATE_PERIOD_OPTIONS: readonly ["Today", "Yesterday", "This Week", "Next Week", "Last Month", "This Month", "Next Month", "Last Year", "This Year", "Next Year"];
export declare function matchesTextFilter(cellValue: unknown, filterValue: string): boolean;
export declare function matchesNumberFilter(cellValue: unknown, min: string, max: string): boolean;
export declare function matchesDateFilter(cellValue: unknown, from: string, to: string, nowDate?: Date): boolean;
export declare function matchesBooleanFilter(cellValue: unknown, filterValue: string): boolean;
export declare function matchesSelectFilter(cellValue: unknown, filterValue: string): boolean;
export declare function applyFilter(cellValue: unknown, filter: ColumnFilter, nowDate?: Date): boolean;
