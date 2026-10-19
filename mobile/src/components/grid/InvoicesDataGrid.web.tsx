import React from 'react';
import { router } from 'expo-router';
import { Eye, MessageCircle, MessageSquare, Wallet } from 'lucide-react';
import { EnterpriseGrid } from '@oeconnection/pcb-grid/dist/enterprise.js';
import { type ColDef, type ICellRendererParams } from '@oeconnection/pcb-grid';
import '@oeconnection/pcb-grid/dist/core.css';
import type { Invoice } from '../../types';
import type { InvoicesDataGridProps } from './InvoicesDataGrid.types';

const inr = (v: unknown) => {
  const n = parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';
};
const num = (v: unknown) => { const n = parseFloat(String(v ?? '')); return Number.isFinite(n) ? n : 0; };

const STATUS: Record<string, { fg: string; bg: string }> = {
  Paid: { fg: '#15803D', bg: '#DCFCE7' },
  Partial: { fg: '#B45309', bg: '#FEF3C7' },
  Pending: { fg: '#B91C1C', bg: '#FEE2E2' },
};

function StatusPill({ value }: { value: string }) {
  const s = STATUS[value] ?? { fg: '#475569', bg: '#F1F5F9' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, color: s.fg, backgroundColor: s.bg }}>
      {value}
    </span>
  );
}

const iconBtn = (bg: string, fg: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 4, borderRadius: 6, background: bg, color: fg,
  border: 'none', padding: '4px 8px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
});

// Web invoices grid on the PCB EnterpriseGrid: sortable/filterable columns, group by Status or
// Customer for sub-totals, Excel/CSV/PDF export, and a footer sum on Amount.
export function InvoicesDataGrid({ invoices, onMessage, onPay, canManage }: InvoicesDataGridProps) {
  // Pre-compute numeric fields so sorting, aggregation and export use numbers, not strings.
  const rows = invoices.map((i) => ({
    ...i,
    deliveredDaysN: num(i.deliveredDays),
    missedDaysN: num(i.missedDays),
    totalQuantityN: num(i.totalQuantity),
    rateN: num(i.ratePerLiter),
    deliveryChargeN: num(i.deliveryCharge),
    amountN: num(i.amount),
  }));
  type Row = (typeof rows)[number];

  const columns: ColDef<Row>[] = [
    { field: 'invoiceNumber', headerName: 'Invoice No', minWidth: 160, cellRenderer: (p: ICellRendererParams<Row>) => (
      <button onClick={() => router.push(`/invoices/${p.data!.id}` as any)} style={{ background: 'none', border: 'none', padding: 0, color: '#1D4ED8', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>
        {p.value}
      </button>
    ) },
    { field: 'customerName', headerName: 'Customer', minWidth: 170 },
    { field: 'deliveredDaysN', headerName: 'Delivered', minWidth: 95, type: 'numericColumn', aggregate: 'sum' },
    { field: 'missedDaysN', headerName: 'Missed', minWidth: 85, type: 'numericColumn', aggregate: 'sum',
      cellRenderer: (p: ICellRendererParams<Row>) => <span style={{ color: p.value > 0 ? '#B91C1C' : '#94A3B8', fontWeight: p.value > 0 ? 600 : 400 }}>{p.value}</span> },
    { field: 'totalQuantityN', headerName: 'Qty (L)', minWidth: 90, type: 'numericColumn', aggregate: 'sum', valueFormatter: (p: any) => `${num(p?.value).toLocaleString('en-IN', { maximumFractionDigits: 2 })} L` },
    { field: 'rateN', headerName: 'Rate (₹/L)', minWidth: 100, type: 'numericColumn', valueFormatter: (p: any) => inr(p?.value) },
    { field: 'deliveryChargeN', headerName: 'Delivery (₹)', minWidth: 105, type: 'numericColumn', aggregate: 'sum', valueFormatter: (p: any) => (num(p?.value) > 0 ? inr(p?.value) : '—') },
    { field: 'amountN', headerName: 'Amount (₹)', minWidth: 125, type: 'numericColumn', aggregate: 'sum', valueFormatter: (p: any) => inr(p?.value),
      cellRenderer: (p: ICellRendererParams<Row>) => <span style={{ fontWeight: 700, color: '#0F172A' }}>{inr(p.value)}</span> },
    { field: 'paymentStatus', headerName: 'Status', minWidth: 105, cellRenderer: (p: ICellRendererParams<Row>) => <StatusPill value={String(p.value ?? '')} /> },
    { headerName: 'Actions', minWidth: canManage ? 190 : 150, width: canManage ? 190 : 150, sortable: false, filter: false, pinned: 'right',
      cellRenderer: (p: ICellRendererParams<Row>) => {
        const inv = p.data! as Invoice;
        return (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', height: '100%' }}>
            <button title="Open invoice" onClick={(e) => { e.stopPropagation(); router.push(`/invoices/${inv.id}` as any); }} style={iconBtn('#F1F5F9', '#475569')}><Eye size={13} /></button>
            <button title="WhatsApp" onClick={(e) => { e.stopPropagation(); onMessage(inv.id, 'whatsapp'); }} style={iconBtn('#F0FDF4', '#15803D')}><MessageCircle size={13} /></button>
            <button title="SMS" onClick={(e) => { e.stopPropagation(); onMessage(inv.id, 'sms'); }} style={iconBtn('#F8FAFC', '#334155')}><MessageSquare size={13} /></button>
            {canManage && inv.paymentStatus !== 'Paid' && (
              <button title="Record payment" onClick={(e) => { e.stopPropagation(); onPay(inv); }} style={iconBtn('#EFF6FF', '#1D4ED8')}><Wallet size={13} /> Pay</button>
            )}
          </div>
        );
      } },
  ];

  return (
    <div style={{ padding: '0 16px 16px' }}>
      <div style={{ fontSize: 12, color: '#94A3B8', margin: '0 0 8px 2px' }}>
        Click an invoice number to open it. Use the toolbar to group by Status or Customer, or export to Excel / CSV / PDF.
      </div>
      <EnterpriseGrid columnDefs={columns} rowData={rows} title="Invoices" gridId="invoices-grid" />
    </div>
  );
}
