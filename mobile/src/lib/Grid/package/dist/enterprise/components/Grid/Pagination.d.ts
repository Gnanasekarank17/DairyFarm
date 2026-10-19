interface PaginationProps {
    pageIndex: number;
    pageCount: number;
    onPageChange: (page: number) => void;
    canPreviousPage: boolean;
    canNextPage: boolean;
    rangeStart: number;
    rangeEnd: number;
    filteredTotal: number;
    total: number;
}
export declare function Pagination({ pageIndex, pageCount, onPageChange, canPreviousPage, canNextPage, rangeStart, rangeEnd, filteredTotal, total }: PaginationProps): import("react").JSX.Element | null;
export {};
