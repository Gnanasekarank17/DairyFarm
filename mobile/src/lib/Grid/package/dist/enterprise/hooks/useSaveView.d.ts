import { ColumnOrderState, VisibilityState, SortingState, ColumnPinningState, GroupingState } from '@tanstack/react-table';
import { ColumnFilter } from '../utils/filters';
export interface SavedView {
    name: string;
    /** When true this view is applied automatically when the grid mounts. */
    isDefault?: boolean;
    sorting: SortingState;
    columnOrder: ColumnOrderState;
    columnVisibility: VisibilityState;
    columnSizing: Record<string, number>;
    columnPinning: ColumnPinningState;
    grouping: GroupingState;
    globalFilter: string;
    columnFilters: ColumnFilter[];
    pageSize: number;
}
/**
 * Manages saved grid views per grid instance.
 * @param gridId  Unique key identifying this grid (e.g. "orders", "shipments").
 *                Views are stored under separate localStorage keys so grids
 *                never share each other's views.
 */
export declare function useSaveView(gridId?: string): {
    views: SavedView[];
    saveView: (view: SavedView) => void;
    deleteView: (name: string) => void;
    setDefaultView: (name: string) => void;
    defaultView: SavedView | null;
};
