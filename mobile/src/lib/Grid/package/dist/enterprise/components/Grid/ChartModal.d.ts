import { GridColumn } from '../../../AppDataGrid';
interface ChartModalProps {
    data: object[];
    columnDefs: GridColumn[];
    gridId?: string;
    onClose: () => void;
}
export declare function ChartModal({ data, columnDefs, gridId, onClose }: ChartModalProps): import("react").JSX.Element;
export {};
