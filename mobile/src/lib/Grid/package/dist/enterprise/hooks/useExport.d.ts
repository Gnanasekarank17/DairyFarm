import { Table } from '@tanstack/react-table';
type AnyRow = Record<string, unknown>;
export declare function useExport(table: Table<AnyRow>): {
    exportCSV: (filename?: string, selectedOnly?: boolean) => void;
    exportExcel: (filename?: string, selectedOnly?: boolean) => Promise<void>;
    exportPDF: (filename?: string, selectedOnly?: boolean) => Promise<void>;
};
export {};
