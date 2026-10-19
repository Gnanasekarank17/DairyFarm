import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Pencil, Play, Pause } from 'lucide-react';
import { EnterpriseGrid } from '@oeconnection/pcb-grid/dist/enterprise.js';
import { type ColDef, type ICellRendererParams } from '@oeconnection/pcb-grid';
import '@oeconnection/pcb-grid/dist/core.css';
import { customersApi } from '../../api/endpoints';
import { isActiveValue } from '../../utils/helpers';
import { EditableCell, useCellEditing } from './EditableCell.web';
import type { Customer } from '../../types';

const MILK_TYPES = ['Cow Milk', 'Buffalo Milk', 'Aavin Milk', 'Other'];
const BILLING_MODES = ['Monthly Full Check', 'Daily Check'];

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 999,
        fontSize: 12, fontWeight: 600,
        color: active ? '#16A34A' : '#DC2626',
        backgroundColor: active ? '#16A34A18' : '#DC262618',
      }}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

interface CustomersDataGridProps {
  customers: Customer[];
  onToggleActive: (id: string) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function CustomersDataGrid({ customers, onToggleActive }: CustomersDataGridProps) {
  const qc = useQueryClient();
  const { isEditing, startEdit, stopEdit } = useCellEditing();

  const updateMutation = useMutation({
    mutationFn: ({ customer, field, value }: { customer: Customer; field: keyof Customer; value: string }) => {
      // Normalize numeric fields to strings
      const normalized = {
        ...customer,
        morningQuantity: String(customer.morningQuantity ?? ''),
        eveningQuantity: String(customer.eveningQuantity ?? ''),
        ratePerLiter: String(customer.ratePerLiter ?? ''),
        [field]: value,
      };
      return customersApi.update(customer.id, normalized);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      Toast.show({ type: 'success', text1: 'Customer updated' });
    },
    onError: () => Toast.show({ type: 'error', text1: 'Failed to update customer' }),
    onSettled: stopEdit,
  });

  const editableColumn = (
    field: keyof Customer,
    headerName: string,
    opts: { minWidth?: number; type?: 'text' | 'number'; render?: (v: string) => React.ReactNode; aggregate?: 'sum' | 'avg' | 'count' | 'min' | 'max' } = {},
  ): ColDef<Customer> => ({
    field: field as string,
    headerName,
    minWidth: opts.minWidth ?? 130,
    aggregate: opts.aggregate,
    cellRenderer: (p: ICellRendererParams<Customer>) => {
      const customer = p.data!;
      return (
        <EditableCell
          value={String(p.value ?? '')}
          type={opts.type}
          editing={isEditing(customer.id, field as string)}
          onStartEdit={() => startEdit(customer.id, field as string)}
          onCancel={stopEdit}
          onCommit={(value) => updateMutation.mutate({ customer, field, value })}
          displayValue={opts.render ? opts.render(String(p.value ?? '')) : undefined}
        />
      );
    },
  });

  const selectColumn = (
    field: keyof Customer,
    headerName: string,
    options: string[],
    minWidth = 160,
  ): ColDef<Customer> => ({
    field: field as string,
    headerName,
    minWidth,
    cellRenderer: (p: ICellRendererParams<Customer>) => {
      const customer = p.data!;
      return (
        <EditableCell
          value={p.value}
          options={options}
          editing={isEditing(customer.id, field as string)}
          onStartEdit={() => startEdit(customer.id, field as string)}
          onCancel={stopEdit}
          onCommit={(value) => updateMutation.mutate({ customer, field, value })}
        />
      );
    },
  });

  const columns: ColDef<Customer>[] = [
    editableColumn('name', 'Name', { minWidth: 160 }),
    editableColumn('mobile', 'Mobile', { minWidth: 115 }),
    editableColumn('email', 'Email', { minWidth: 160, render: (v) => v || '—' }),
    editableColumn('address', 'Address', { minWidth: 180, render: (v) => v || '—' }),
    editableColumn('morningQuantity', 'Morning (L)', { minWidth: 100, type: 'number', aggregate: 'sum', render: (v) => (parseFloat(v) > 0 ? `☀️ ${v}` : '—') }),
    editableColumn('eveningQuantity', 'Evening (L)', { minWidth: 100, type: 'number', aggregate: 'sum', render: (v) => (parseFloat(v) > 0 ? `🌙 ${v}` : '—') }),
    editableColumn('ratePerLiter', 'Rate (₹/L)', { minWidth: 100, type: 'number' }),
    selectColumn('milkType', 'Milk Type', MILK_TYPES, 130),
    selectColumn('billingMode', 'Billing Mode', BILLING_MODES, 150),
    {
      headerName: 'Status', minWidth: 100, sortable: false, filter: false,
      cellRenderer: (p: ICellRendererParams<Customer>) => <ActiveBadge active={isActiveValue(p.data!.isActive)} />,
    },
    {
      headerName: 'Actions', minWidth: 100, width: 100, sortable: false, filter: false, pinned: 'right',
      cellRenderer: (p: ICellRendererParams<Customer>) => {
        const customer = p.data!;
        const active = isActiveValue(customer.isActive);
        return (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', height: '100%' }}>
            <button
              onClick={(e) => { e.stopPropagation(); router.push(`/customers/${customer.id}/edit` as any); }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, borderRadius: 6, background: '#F1F5F9', color: '#475569', border: 'none', padding: '4px 8px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              title="Open full edit form"
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleActive(customer.id); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4, borderRadius: 6, border: 'none', padding: '4px 8px',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: active ? '#FEF2F2' : '#F0FDF4', color: active ? '#DC2626' : '#16A34A',
              }}
              title={active ? 'Deactivate' : 'Activate'}
            >
              {active ? <Pause size={12} /> : <Play size={12} />}
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '0 16px 16px' }}>
      <div style={{ fontSize: 12, color: '#94A3B8', margin: '0 0 8px 2px' }}>
        Click any cell to edit it directly — press Enter to save, Escape to cancel.
      </div>
      <EnterpriseGrid columnDefs={columns} rowData={customers} title="Customers" gridId="customers-grid" />
    </div>
  );
}
