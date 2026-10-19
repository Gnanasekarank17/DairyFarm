import { GridColumn } from '../../../AppDataGrid';
interface PivotTableProps {
    data: object[];
    columnDefs: GridColumn[];
    gridId?: string;
    onClose: () => void;
}
export declare function PivotTable({ data, columnDefs, gridId, onClose }: PivotTableProps): import("react").JSX.Element;
export {};
