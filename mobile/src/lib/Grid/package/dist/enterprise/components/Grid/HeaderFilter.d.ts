import { Column } from '@tanstack/react-table';
import { ColumnFilter } from '../../utils/filters';
type AnyRow = Record<string, unknown>;
interface HeaderFilterProps {
    column: Column<AnyRow, unknown>;
    currentFilter: ColumnFilter | undefined;
    isNumeric: boolean;
    onFilterChange: (f: ColumnFilter | null) => void;
    onClose: () => void;
    anchorEl: HTMLElement | null;
}
export declare function HeaderFilter({ column, currentFilter, isNumeric, onFilterChange, onClose, anchorEl }: HeaderFilterProps): import("react").JSX.Element;
export {};
