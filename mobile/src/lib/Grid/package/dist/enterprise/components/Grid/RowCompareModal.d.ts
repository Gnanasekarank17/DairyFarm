import { GridColumn } from '../../../AppDataGrid';
interface RowCompareModalProps {
    rows: Record<string, unknown>[];
    columnDefs: GridColumn[];
    onClose: () => void;
}
export declare function RowCompareModal({ rows, columnDefs, onClose }: RowCompareModalProps): import("react").JSX.Element;
export {};
