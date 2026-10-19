import React from 'react';
import { EnterpriseGrid } from '@oeconnection/pcb-grid/dist/enterprise.js';
import { type ColDef } from '@oeconnection/pcb-grid';
import '@oeconnection/pcb-grid/dist/core.css';
import type { ReportGridProps } from './ReportGrid.types';

// Web report grid backed by the PCB EnterpriseGrid — includes the toolbar with
// Export to Excel / CSV / PDF, column filters, grouping, pivot, charting, etc.
export function ReportGrid({ columns, rows, filename, stateId }: ReportGridProps) {
  const colDefs: ColDef<any>[] = columns.map((c) => ({
    field: c.field,
    headerName: c.headerName,
    minWidth: c.minWidth ?? 130,
    aggregate: c.aggregate,
  }));

  return (
    <div style={{ padding: '0 16px 16px' }}>
      <div style={{ fontSize: 12, color: '#94A3B8', margin: '0 0 8px 2px' }}>
        Use the toolbar to export this report to Excel, CSV or PDF.
      </div>
      <EnterpriseGrid columnDefs={colDefs} rowData={rows} title={filename} gridId={stateId || filename} />
    </div>
  );
}
