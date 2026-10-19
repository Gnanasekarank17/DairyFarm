import { Table } from '@tanstack/react-table';
import { GridRow } from '../../utils/dataGenerator';
interface ColumnChooserProps {
    table: Table<GridRow>;
    onClose: () => void;
}
export declare function ColumnChooser({ table, onClose }: ColumnChooserProps): import("react").JSX.Element;
export {};
