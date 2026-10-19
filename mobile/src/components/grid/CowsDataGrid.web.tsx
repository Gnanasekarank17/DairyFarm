import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Heart, Droplet, HeartPulse } from 'lucide-react';
import { EnterpriseGrid } from '@oeconnection/pcb-grid/dist/enterprise.js';
import { type ColDef, type ICellRendererParams } from '@oeconnection/pcb-grid';
import '@oeconnection/pcb-grid/dist/core.css';
import { cowsApi } from '../../api/endpoints';
import { EditableCell, useCellEditing } from './EditableCell.web';
import type { Cow } from '../../types';

const STATUS_COLOR: Record<string, string> = {
  Active: '#16A34A',
  Pregnant: '#7C3AED',
  'Dry Period': '#D97706',
  Sold: '#DC2626',
  Deceased: '#6B7280',
};

const COW_STATUSES = ['Active', 'Pregnant', 'Dry Period', 'Sold', 'Deceased'];
const ANIMAL_TYPES = ['Cow', 'Buffalo'];

function StatusBadge({ value }: { value: string }) {
  const color = STATUS_COLOR[value] || '#6B7280';
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 999,
        fontSize: 12, fontWeight: 600, color, backgroundColor: `${color}18`,
      }}
    >
      {value}
    </span>
  );
}

function AnimalTypeBadge({ value }: { value: string }) {
  const isBuffalo = value === 'Buffalo';
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 999,
        fontSize: 12, fontWeight: 600, color: isBuffalo ? '#0F766E' : '#7C3AED', backgroundColor: isBuffalo ? '#0F766E18' : '#7C3AED18',
      }}
    >
      {isBuffalo ? '🐃 Buffalo' : '🐄 Cow'}
    </span>
  );
}

function GenderBadge({ value }: { value: string }) {
  const male = value === 'Male';
  const color = male ? '#2563EB' : '#DB2777';
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 999,
        fontSize: 12, fontWeight: 600, color, backgroundColor: `${color}18`,
      }}
    >
      {male ? '♂ Bull' : '♀ Female'}
    </span>
  );
}

function ActionButtons({ cow }: { cow: Cow }) {
  const isMale = cow.gender === 'Male';
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', height: '100%' }}>
      {!isMale && (
        <button
          onClick={(e) => { e.stopPropagation(); router.push(`/breeding/add?cowId=${cow.id}` as any); }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, borderRadius: 6, background: '#FEF2F2', color: '#DC2626', border: 'none', padding: '4px 8px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          title="Add breeding record"
        >
          <Heart size={12} /> Breeding
        </button>
      )}
      {!isMale && (
        <button
          onClick={(e) => { e.stopPropagation(); router.push(`/milk/add?cowId=${cow.id}` as any); }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, borderRadius: 6, background: '#EFF6FF', color: '#2563EB', border: 'none', padding: '4px 8px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          title="Log milk production"
        >
          <Droplet size={12} /> Milk
        </button>
      )}
      {isMale && (
        <span style={{ fontSize: 12, color: '#2563EB', fontWeight: 600 }}>Bull · mating only</span>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); router.push(`/cows/${cow.id}/health` as any); }}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, borderRadius: 6, background: '#F0FDF4', color: '#16A34A', border: 'none', padding: '4px 8px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
        title="Health records"
      >
        <HeartPulse size={12} /> Health
      </button>
    </div>
  );
}

interface CowsDataGridProps {
  cows: Cow[];
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function CowsDataGrid({ cows }: CowsDataGridProps) {
  const qc = useQueryClient();
  const { editing, isEditing, startEdit, stopEdit } = useCellEditing();

  const updateMutation = useMutation({
    mutationFn: ({ cow, field, value }: { cow: Cow; field: keyof Cow; value: string }) =>
      cowsApi.update(cow.id, { ...cow, [field]: value }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cows'] });
      Toast.show({ type: 'success', text1: 'Cow updated' });
    },
    onError: () => Toast.show({ type: 'error', text1: 'Failed to update cow' }),
    onSettled: stopEdit,
  });

  const editableTextColumn = (
    field: keyof Cow,
    headerName: string,
    opts: { minWidth?: number; type?: 'text' | 'number'; render?: (v: string) => React.ReactNode; aggregate?: 'sum' | 'avg' | 'count' | 'min' | 'max' } = {},
  ): ColDef<Cow> => ({
    field: field as string,
    headerName,
    minWidth: opts.minWidth ?? 130,
    aggregate: opts.aggregate,
    cellRenderer: (p: ICellRendererParams<Cow>) => {
      const cow = p.data!;
      return (
        <EditableCell
          value={String(p.value ?? '')}
          type={opts.type}
          editing={isEditing(cow.id, field as string)}
          onStartEdit={() => startEdit(cow.id, field as string)}
          onCancel={stopEdit}
          onCommit={(value) => updateMutation.mutate({ cow, field, value })}
          displayValue={opts.render ? opts.render(String(p.value ?? '')) : undefined}
        />
      );
    },
  });

  const columns: ColDef<Cow>[] = [
    editableTextColumn('name', 'Name', { minWidth: 160 }),
    {
      field: 'animalType', headerName: 'Animal Type', minWidth: 130,
      cellRenderer: (p: ICellRendererParams<Cow>) => {
        const cow = p.data!;
        return (
          <EditableCell
            value={p.value || 'Cow'}
            options={ANIMAL_TYPES}
            editing={isEditing(cow.id, 'animalType')}
            onStartEdit={() => startEdit(cow.id, 'animalType')}
            onCancel={stopEdit}
            onCommit={(value) => updateMutation.mutate({ cow, field: 'animalType', value })}
            displayValue={<AnimalTypeBadge value={p.value || 'Cow'} />}
          />
        );
      },
    },
    editableTextColumn('tagNumber', 'Tag', { minWidth: 100, render: (v) => v || 'N/A' }),
    editableTextColumn('breed', 'Breed', { minWidth: 130, render: (v) => v || 'Unknown' }),
    editableTextColumn('color', 'Color', { minWidth: 110, render: (v) => v || '—' }),
    {
      field: 'gender', headerName: 'Gender', minWidth: 130,
      cellRenderer: (p: ICellRendererParams<Cow>) => {
        const cow = p.data!;
        return (
          <EditableCell
            value={p.value || 'Female'}
            options={['Female', 'Male']}
            editing={isEditing(cow.id, 'gender')}
            onStartEdit={() => startEdit(cow.id, 'gender')}
            onCancel={stopEdit}
            onCommit={(value) => updateMutation.mutate({ cow, field: 'gender', value })}
            displayValue={<GenderBadge value={p.value || 'Female'} />}
          />
        );
      },
    },
    {
      field: 'currentStatus', headerName: 'Status', minWidth: 140,
      cellRenderer: (p: ICellRendererParams<Cow>) => {
        const cow = p.data!;
        return (
          <EditableCell
            value={p.value}
            options={COW_STATUSES}
            editing={isEditing(cow.id, 'currentStatus')}
            onStartEdit={() => startEdit(cow.id, 'currentStatus')}
            onCancel={stopEdit}
            onCommit={(value) => updateMutation.mutate({ cow, field: 'currentStatus', value })}
            displayValue={<StatusBadge value={p.value} />}
          />
        );
      },
    },
    editableTextColumn('dateOfBirth', 'Date of Birth', { minWidth: 130, render: (v) => v || '—' }),
    editableTextColumn('purchaseCost', 'Purchase Cost', {
      minWidth: 130, type: 'number', aggregate: 'sum',
      render: (v) => (v ? `₹${Number(v).toLocaleString('en-IN')}` : '—'),
    }),
    {
      headerName: 'Actions', minWidth: 260, sortable: false, filter: false, pinned: 'right',
      cellRenderer: (p: ICellRendererParams<Cow>) => (p.data ? <ActionButtons cow={p.data} /> : null),
    },
  ];

  return (
    <div style={{ padding: '0 16px 16px' }}>
      <div style={{ fontSize: 12, color: '#94A3B8', margin: '0 0 8px 2px' }}>
        Click any cell to edit it directly — press Enter to save, Escape to cancel.
      </div>
      <EnterpriseGrid columnDefs={columns} rowData={cows} title="Cows" gridId="cows-grid" />
    </div>
  );
}
