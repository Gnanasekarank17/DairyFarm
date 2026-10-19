import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Pencil, Trash2 } from 'lucide-react';
import { EnterpriseGrid } from '@oeconnection/pcb-grid/dist/enterprise.js';
import { type ColDef, type ICellRendererParams } from '@oeconnection/pcb-grid';
import '@oeconnection/pcb-grid/dist/core.css';
import { EditableCell, useCellEditing } from './EditableCell.web';
import { getCategoryMeta, ledgerInvalidationKeys } from '../../config/ledgers';
import { useLedgerCategories } from '../../hooks/useLedgerCategories';
import { PAYMENT_MODES, type LedgerEntry } from '../../types';
import type { LedgerDataGridProps } from './LedgerDataGrid.types';

type Row = LedgerEntry & Record<string, any>;

const inr = (v: unknown) => {
  const n = parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';
};

function CategoryPill({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 999,
        fontSize: 12, fontWeight: 600, color, backgroundColor: `${color}18`, whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

// Web ledger grid backed by the PCB EnterpriseGrid: toolbar with Excel/CSV/PDF export, column
// filters, grouping (group by Category / Payment Mode for sub-totals), pivot, charts, and a
// footer totals row from `aggregate: 'sum'` on Amount. Cells are click-to-edit when canManage.
export function LedgerDataGrid({ type, config, entries, canManage }: LedgerDataGridProps) {
  const qc = useQueryClient();
  const { isEditing, startEdit, stopEdit } = useCellEditing();
  const { names: categoryNames } = useLedgerCategories(config);
  const invalidate = () => ledgerInvalidationKeys(config).forEach((k) => qc.invalidateQueries({ queryKey: k }));

  const updateMutation = useMutation({
    mutationFn: ({ row, field, value }: { row: Row; field: string; value: string }) =>
      config.api.update(row.id, { ...row, quantity: row.quantity ?? '', [field]: value }),
    onSuccess: () => { invalidate(); Toast.show({ type: 'success', text1: `${config.singular} updated` }); },
    onError: (err: any) => Toast.show({ type: 'error', text1: err?.response?.data?.message || `Failed to update ${config.singular.toLowerCase()}` }),
    onSettled: stopEdit,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => config.api.delete(id),
    onSuccess: () => { invalidate(); Toast.show({ type: 'success', text1: `${config.singular} deleted` }); },
    onError: () => Toast.show({ type: 'error', text1: `Failed to delete ${config.singular.toLowerCase()}` }),
  });

  const confirmDelete = (row: Row) => {
    if (globalThis.confirm(`Delete this ${row.category} ${config.singular.toLowerCase()} of ${inr(row.amount)}? This cannot be undone.`)) {
      deleteMutation.mutate(row.id);
    }
  };

  // Text / number cell: inline editable when allowed, plain text otherwise.
  const textColumn = (
    field: string,
    headerName: string,
    opts: { minWidth?: number; type?: 'text' | 'number'; render?: (v: string) => React.ReactNode; aggregate?: 'sum' | 'avg' | 'count' | 'min' | 'max'; valueFormatter?: (p: any) => any } = {},
  ): ColDef<Row> => ({
    field,
    headerName,
    minWidth: opts.minWidth ?? 130,
    aggregate: opts.aggregate,
    valueFormatter: opts.valueFormatter,
    cellRenderer: (p: ICellRendererParams<Row>) => {
      const row = p.data!;
      const raw = String(p.value ?? '');
      const display = opts.render ? opts.render(raw) : (raw || <span style={{ color: '#CBD5E1' }}>—</span>);
      if (!canManage) return <div style={{ padding: '3px 6px' }}>{display}</div>;
      return (
        <EditableCell
          value={raw}
          type={opts.type}
          editing={isEditing(row.id, field)}
          onStartEdit={() => startEdit(row.id, field)}
          onCancel={stopEdit}
          onCommit={(value) => updateMutation.mutate({ row, field, value })}
          displayValue={opts.render ? display : undefined}
        />
      );
    },
  });

  const selectColumn = (field: string, headerName: string, options: readonly string[], minWidth: number, render?: (v: string) => React.ReactNode): ColDef<Row> => ({
    field,
    headerName,
    minWidth,
    cellRenderer: (p: ICellRendererParams<Row>) => {
      const row = p.data!;
      const raw = String(p.value ?? '');
      const display = render ? render(raw) : raw;
      if (!canManage) return <div style={{ padding: '3px 6px' }}>{display}</div>;
      return (
        <EditableCell
          value={raw}
          options={[...options]}
          editing={isEditing(row.id, field)}
          onStartEdit={() => startEdit(row.id, field)}
          onCancel={stopEdit}
          onCommit={(value) => updateMutation.mutate({ row, field, value })}
          displayValue={display}
        />
      );
    },
  });

  const columns: ColDef<Row>[] = [
    textColumn(config.dateField, 'Date', { minWidth: 115 }),
    selectColumn('category', 'Category', categoryNames, 170, (v) => (
      <CategoryPill label={v || '—'} color={getCategoryMeta(config, v).color} />
    )),
    textColumn('accountName', 'Account (Other)', { minWidth: 150 }),
    textColumn('itemName', 'Item / Details', { minWidth: 170 }),
    textColumn(config.partyField, config.partyHeader, { minWidth: 160 }),
    textColumn('quantity', 'Qty', { minWidth: 80, type: 'number', render: (v) => (v ? String(parseFloat(v)) : '—') }),
    textColumn('unit', 'Unit', { minWidth: 80 }),
    textColumn('amount', 'Amount (₹)', {
      minWidth: 130,
      type: 'number',
      aggregate: 'sum',
      valueFormatter: (p: any) => inr(p?.value),
      render: (v) => (
        <span style={{ fontWeight: 700, color: config.tone === 'expense' ? '#B91C1C' : '#15803D' }}>{inr(v)}</span>
      ),
    }),
    selectColumn('paymentMode', 'Payment Mode', PAYMENT_MODES, 130),
    textColumn('notes', 'Notes', { minWidth: 180 }),
    ...(canManage
      ? [{
          headerName: 'Actions', minWidth: 100, width: 100, sortable: false, filter: false, pinned: 'right',
          cellRenderer: (p: ICellRendererParams<Row>) => {
            const row = p.data!;
            return (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', height: '100%' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); router.push(`/finance/${type}/add?id=${row.id}` as any); }}
                  style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 6, background: '#F1F5F9', color: '#475569', border: 'none', padding: '4px 8px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  title="Open full edit form"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); confirmDelete(row); }}
                  style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 6, background: '#FEF2F2', color: '#DC2626', border: 'none', padding: '4px 8px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          },
        } as ColDef<Row>]
      : []),
  ];

  return (
    <div style={{ padding: '0 16px 16px' }}>
      <div style={{ fontSize: 12, color: '#94A3B8', margin: '0 0 8px 2px' }}>
        {canManage
          ? 'Click any cell to edit it directly — press Enter to save, Escape to cancel. Use the toolbar to group by Category or export to Excel / PDF.'
          : 'Use the toolbar to filter, group by Category or export to Excel / CSV / PDF.'}
      </div>
      <EnterpriseGrid columnDefs={columns} rowData={entries} title={config.label} gridId={`${type}-ledger-grid`} />
    </div>
  );
}
