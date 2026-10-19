export type AggregateFunction = "sum" | "avg" | "count" | "min" | "max";
export interface PivotConfig {
    rowField: string;
    colField: string;
    valueField: string;
    aggFn: AggregateFunction;
}
export interface PivotResult {
    rowKeys: string[];
    colKeys: string[];
    matrix: Record<string, Record<string, number>>;
    rowTotals: Record<string, number>;
    colTotals: Record<string, number>;
    grandTotal: number;
}
export declare function computePivot(data: object[], config: PivotConfig): PivotResult;
