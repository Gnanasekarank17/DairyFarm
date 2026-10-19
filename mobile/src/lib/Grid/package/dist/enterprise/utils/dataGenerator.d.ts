declare const DEPARTMENTS: readonly ["HR", "Engineering", "Finance", "Sales", "Operations"];
declare const COUNTRIES: readonly ["USA", "UK", "India", "Germany", "Australia"];
export type Department = (typeof DEPARTMENTS)[number];
export type Country = (typeof COUNTRIES)[number];
export interface GridRow {
    id: number;
    name: string;
    department: Department;
    salary: number;
    startDate: string;
    isActive: boolean;
    performance: number;
    country: Country;
    bonusPercent: number;
    manager: string;
}
export declare function generateData(count?: number): GridRow[];
export {};
