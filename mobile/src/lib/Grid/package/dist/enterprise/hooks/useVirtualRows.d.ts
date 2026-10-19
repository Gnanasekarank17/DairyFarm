import { Row } from '@tanstack/react-table';
import { GridRow } from '../utils/dataGenerator';
export declare function useVirtualRows(rows: Row<GridRow>[], rowHeight?: number): {
    parentRef: import('react').RefObject<HTMLDivElement | null>;
    virtualizer: import('@tanstack/virtual-core').Virtualizer<HTMLDivElement, Element>;
};
