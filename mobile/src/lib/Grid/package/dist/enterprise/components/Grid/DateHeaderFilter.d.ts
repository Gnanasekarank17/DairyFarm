import { GridRow } from '../../utils/dataGenerator';
import { ColumnFilter } from '../../utils/filters';
interface DateHeaderFilterProps {
    data: GridRow[];
    currentFilter?: ColumnFilter;
    onApply: (next?: ColumnFilter) => void;
    onClose: () => void;
}
export declare function DateHeaderFilter({ data, currentFilter, onApply, onClose }: DateHeaderFilterProps): import("react").JSX.Element;
export {};
