import { GridRow } from './dataGenerator';
export interface ConditionalRule {
    id: string;
    label: string;
    column: string;
    condition: "lt" | "gt" | "eq" | "between" | "contains" | "isEmpty" | "isTrue" | "isFalse";
    value1: string;
    value2?: string;
    bgColor: string;
    textColor: string;
}
export declare const BUILT_IN_RULES: ConditionalRule[];
export interface CellStyle {
    backgroundColor?: string;
    color?: string;
}
export declare function getCellStyle(row: GridRow, columnId: string, rules: ConditionalRule[]): CellStyle | undefined;
export declare function getRowStyle(row: GridRow, rules: ConditionalRule[]): CellStyle | undefined;
