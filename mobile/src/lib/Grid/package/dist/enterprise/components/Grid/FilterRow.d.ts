import { Table } from '@tanstack/react-table';
import { ColumnFilter } from '../../utils/filters';
type AnyRow = Record<string, unknown>;
interface FilterRowProps {
    table: Table<AnyRow>;
    filters: ColumnFilter[];
    onFilterChange: (filters: ColumnFilter[]) => void;
    data: AnyRow[];
    numericColIds: Set<string>;
}
export declare function FilterRow({ table, filters, onFilterChange, data, numericColIds }: FilterRowProps): import("react").JSX.Element;
export {};
