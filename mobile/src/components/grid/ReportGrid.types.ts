export interface ReportColumn {
  field: string;
  headerName: string;
  minWidth?: number;
  aggregate?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

export interface ReportGridProps {
  columns: ReportColumn[];
  rows: any[];
  filename: string;
  noRowsMessage?: string;
  stateId?: string;
  /** Optional handler fired when a row is tapped/clicked (drill-down). */
  onRowPress?: (row: any) => void;
}
