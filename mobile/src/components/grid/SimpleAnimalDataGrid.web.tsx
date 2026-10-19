import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Pencil, Trash2, Scale } from 'lucide-react';
import { EnterpriseGrid } from '@oeconnection/pcb-grid/dist/enterprise.js';
import { type ColDef, type ICellRendererParams } from '@oeconnection/pcb-grid';
import '@oeconnection/pcb-grid/dist/core.css';
import { EditableCell, useCellEditing } from './EditableCell.web';
import {
  SIMPLE_ANIMAL_STATUSES, BREEDING_ANIMAL_STATUSES, getWeightTrend, WEIGHT_TREND_COLOR,
  type SimpleAnimalTypeSlug, type SimpleAnimalConfig,
} from '../../config/simpleAnimals';
import type { SimpleAnimal } from '../../types';

const STATUS_COLOR: Record<string, string> = {
  Active: '#16A34A',
  Mated: '#D97706',
  Pregnant: '#7C3AED',
  Sold: '#DC2626',
  Deceased: '#6B7280',
};

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
      {male ? '♂ Male' : '♀ Female'}
    </span>
  );
}

interface SimpleAnimalDataGridProps {
  type: SimpleAnimalTypeSlug;
  config: SimpleAnimalConfig;
  animals: SimpleAnimal[];
}

export function SimpleAnimalDataGrid({ type, config, animals }: SimpleAnimalDataGridProps) {
  const qc = useQueryClient();
  const { isEditing, startEdit, stopEdit } = useCellEditing();
  const statuses = config.hasBreeding ? BREEDING_ANIMAL_STATUSES : SIMPLE_ANIMAL_STATUSES;

  const updateMutation = useMutation({
    mutationFn: ({ animal, field, value }: { animal: SimpleAnimal; field: keyof SimpleAnimal; value: string }) =>
      config.api.update(animal.id, { ...animal, [field]: value }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [type] });
      Toast.show({ type: 'success', text1: `${config.singular} updated` });
    },
    onError: () => Toast.show({ type: 'error', text1: `Failed to update ${config.singular.toLowerCase()}` }),
    onSettled: stopEdit,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => config.api.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [type] });
      Toast.show({ type: 'success', text1: `${config.singular} deleted` });
    },
    onError: () => Toast.show({ type: 'error', text1: `Failed to delete ${config.singular.toLowerCase()}` }),
  });

  const confirmDelete = (animal: SimpleAnimal) => {
    if (globalThis.confirm(`Delete ${animal.name}? This cannot be undone.`)) {
      deleteMutation.mutate(animal.id);
    }
  };

  const editableTextColumn = (
    field: keyof SimpleAnimal,
    headerName: string,
    opts: { minWidth?: number; type?: 'text' | 'number'; render?: (v: string) => React.ReactNode } = {},
  ): ColDef<SimpleAnimal> => ({
    field: field as string,
    headerName,
    minWidth: opts.minWidth ?? 130,
    cellRenderer: (p: ICellRendererParams<SimpleAnimal>) => {
      const animal = p.data!;
      return (
        <EditableCell
          value={String(p.value ?? '')}
          type={opts.type}
          editing={isEditing(animal.id, field as string)}
          onStartEdit={() => startEdit(animal.id, field as string)}
          onCancel={stopEdit}
          onCommit={(value) => updateMutation.mutate({ animal, field, value })}
          displayValue={opts.render ? opts.render(String(p.value ?? '')) : undefined}
        />
      );
    },
  });

  const columns: ColDef<SimpleAnimal>[] = [
    editableTextColumn('name', 'Name', { minWidth: 160 }),
    editableTextColumn('tagNumber', 'Tag', { minWidth: 100, render: (v) => v || 'N/A' }),
    editableTextColumn('breed', 'Breed', { minWidth: 130, render: (v) => v || 'Unknown' }),
    editableTextColumn('color', 'Color', { minWidth: 110, render: (v) => v || '—' }),
    ...(config.hasGender ? [{
      field: 'gender', headerName: 'Gender', minWidth: 130,
      cellRenderer: (p: ICellRendererParams<SimpleAnimal>) => {
        const animal = p.data!;
        return (
          <EditableCell
            value={p.value || 'Female'}
            options={['Female', 'Male']}
            editing={isEditing(animal.id, 'gender')}
            onStartEdit={() => startEdit(animal.id, 'gender')}
            onCancel={stopEdit}
            onCommit={(value) => updateMutation.mutate({ animal, field: 'gender', value })}
            displayValue={<GenderBadge value={p.value || 'Female'} />}
          />
        );
      },
    } as ColDef<SimpleAnimal>] : []),
    {
      field: 'currentStatus', headerName: 'Status', minWidth: 140,
      cellRenderer: (p: ICellRendererParams<SimpleAnimal>) => {
        const animal = p.data!;
        return (
          <EditableCell
            value={p.value}
            options={[...statuses]}
            editing={isEditing(animal.id, 'currentStatus')}
            onStartEdit={() => startEdit(animal.id, 'currentStatus')}
            onCancel={stopEdit}
            onCommit={(value) => updateMutation.mutate({ animal, field: 'currentStatus', value })}
            displayValue={<StatusBadge value={p.value} />}
          />
        );
      },
    },
    editableTextColumn('dateOfBirth', 'Date of Birth', { minWidth: 130, render: (v) => v || '—' }),
    editableTextColumn('purchaseCost', 'Purchase Cost', {
      minWidth: 130, type: 'number',
      render: (v) => (v ? `₹${Number(v).toLocaleString('en-IN')}` : '—'),
    }),
    ...(config.hasWeightTracking ? [
      {
        field: 'currentWeightKg', headerName: 'Current Weight', minWidth: 130, sortable: true, filter: false,
        cellRenderer: (p: ICellRendererParams<SimpleAnimal>) => {
          if (!p.value) return <span style={{ color: '#CBD5E1' }}>Not weighed yet</span>;
          const trend = getWeightTrend(p.value, p.data!.previousWeightKg);
          return <span style={{ color: WEIGHT_TREND_COLOR[trend], fontWeight: 600 }}>{Number(p.value).toFixed(1)} kg</span>;
        },
      } as ColDef<SimpleAnimal>,
      {
        field: 'lastWeighedDate', headerName: 'Last Weighed', minWidth: 130, sortable: true, filter: false,
        cellRenderer: (p: ICellRendererParams<SimpleAnimal>) =>
          p.value ? <span>{String(p.value).slice(0, 10)}</span> : <span style={{ color: '#CBD5E1' }}>—</span>,
      } as ColDef<SimpleAnimal>,
    ] : []),
    {
      headerName: 'Actions', minWidth: config.hasWeightTracking ? 180 : 110, sortable: false, filter: false, pinned: 'right',
      cellRenderer: (p: ICellRendererParams<SimpleAnimal>) => {
        const animal = p.data!;
        const weightColor = config.hasWeightTracking ? WEIGHT_TREND_COLOR[getWeightTrend(animal.currentWeightKg, animal.previousWeightKg)] : '#2563EB';
        return (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', height: '100%' }}>
            {config.hasWeightTracking && (
              <button
                onClick={(e) => { e.stopPropagation(); router.push(`/animals/${type}/${animal.id}` as any); }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, borderRadius: 6, background: `${weightColor}18`, color: weightColor, border: 'none', padding: '4px 8px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                title="View weight history — green: gained 2.5kg+, blue: no notable change, red: lost weight"
              >
                <Scale size={12} /> Weight
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); router.push(`/animals/${type}/${animal.id}/edit` as any); }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, borderRadius: 6, background: '#F1F5F9', color: '#475569', border: 'none', padding: '4px 8px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              title={`Edit ${config.singular.toLowerCase()}`}
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); confirmDelete(animal); }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, borderRadius: 6, background: '#FEF2F2', color: '#DC2626', border: 'none', padding: '4px 8px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              title={`Delete ${config.singular.toLowerCase()}`}
            >
              <Trash2 size={12} />
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
        {config.hasWeightTracking ? ' Click "Weight" to view weigh-in history and log a new one.' : ''}
      </div>
      <EnterpriseGrid columnDefs={columns} rowData={animals} title={config.label} gridId={`${type}-grid`} />
    </div>
  );
}
