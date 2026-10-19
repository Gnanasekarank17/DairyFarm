import { GridColumn } from '../../../AppDataGrid';
interface EnterpriseGridProps {
    /** Column definitions — same ColDef shape as DataGrid */
    columnDefs: GridColumn[];
    /** Row data — any typed or plain object array */
    rowData: object[];
    title?: string;
    nowDate?: Date;
    gridId?: string;
    /** PCB-Grid license key issued via scripts/issue-license.mjs. Advisory only
     *  — see src/license.ts. */
    licenseKey?: string;
    /** Override theme colors — all optional */
    themeColors?: {
        headerBg?: string;
        toolbarBg?: string;
        accentColor?: string;
        rowAltBg?: string;
    };
}
export declare function EnterpriseGrid({ columnDefs, rowData, title, nowDate, gridId, licenseKey, themeColors: themeColorsProp, }: EnterpriseGridProps): import("react").JSX.Element;
export {};
