import { ReactNode, default as React } from 'react';
import { GridRow, Department, Country } from '../../utils/dataGenerator';
export declare function DepartmentCell({ value }: {
    value: Department;
}): React.JSX.Element;
export declare function SalaryCell({ value, avg }: {
    value: number;
    avg: number;
}): React.JSX.Element;
export declare function DateCell({ value }: {
    value: string;
}): React.JSX.Element;
export declare function ActiveCell({ value }: {
    value: boolean;
}): React.JSX.Element;
export declare function StarsCell({ value }: {
    value: number;
}): React.JSX.Element;
export declare function CountryCell({ value }: {
    value: Country;
}): React.JSX.Element;
export declare function BonusCell({ value }: {
    value: number;
}): React.JSX.Element;
export declare function IdCell({ value }: {
    value: number;
}): React.JSX.Element;
interface SparklineProps {
    value: number[];
    type?: "bar" | "line";
    color?: string;
    width?: number;
    height?: number;
}
export declare function SparklineCell({ value, type, color, width, height }: SparklineProps): ReactNode;
interface BadgeCellProps {
    value: unknown;
    badgeMap?: Record<string, "success" | "warning" | "danger" | "info">;
}
export declare function BadgeCell({ value, badgeMap }: BadgeCellProps): ReactNode;
export declare function renderCell(columnId: string, value: unknown, _row: GridRow, avgSalary: number): ReactNode;
export {};
