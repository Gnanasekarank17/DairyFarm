import { GridRow } from '../utils/dataGenerator';
import { ColumnFilter } from '../utils/filters';
export declare function useGridData(data: GridRow[], columnFilters: ColumnFilter[], nowDate?: Date): {
    filteredData: GridRow[];
};
