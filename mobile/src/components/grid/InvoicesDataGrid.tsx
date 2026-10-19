import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { formatCurrency } from '../../utils/helpers';
import type { InvoicesDataGridProps } from './InvoicesDataGrid.types';

const STATUS_BADGE: Record<string, 'success' | 'error' | 'warning'> = { Paid: 'success', Pending: 'error', Partial: 'warning' };

// Native fallback for the web EnterpriseGrid: a compact table (horizontal scroll) of invoices.
export function InvoicesDataGrid({ invoices, onMessage, onPay, canManage }: InvoicesDataGridProps) {
  if (!invoices.length) return <EmptyState icon="receipt-outline" title="No invoices" />;
  const cols = [
    { label: 'Invoice', w: 150 }, { label: 'Customer', w: 140 }, { label: 'Days', w: 60 }, { label: 'Missed', w: 60 },
    { label: 'Qty (L)', w: 70 }, { label: 'Amount', w: 100 }, { label: 'Status', w: 90 }, { label: '', w: 120 },
  ];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator className="px-4">
      <View>
        <View className="flex-row bg-slate-900 rounded-t-xl px-2 py-2">
          {cols.map((c) => <Text key={c.label || 'actions'} style={{ width: c.w }} className="text-white text-xs font-semibold">{c.label}</Text>)}
        </View>
        {invoices.map((inv, i) => (
          <TouchableOpacity key={inv.id} onPress={() => router.push(`/invoices/${inv.id}` as any)} className={`flex-row items-center px-2 py-2 border-b border-gray-100 ${i % 2 ? 'bg-gray-50' : 'bg-white'}`}>
            <Text style={{ width: 150 }} className="text-blue-700 text-xs font-semibold" numberOfLines={1}>{inv.invoiceNumber}</Text>
            <Text style={{ width: 140 }} className="text-gray-800 text-xs" numberOfLines={1}>{inv.customerName}</Text>
            <Text style={{ width: 60 }} className="text-gray-700 text-xs">{inv.deliveredDays}</Text>
            <Text style={{ width: 60 }} className={`text-xs ${parseFloat(inv.missedDays) > 0 ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>{inv.missedDays}</Text>
            <Text style={{ width: 70 }} className="text-gray-700 text-xs">{inv.totalQuantity}</Text>
            <Text style={{ width: 100 }} className="text-gray-900 text-xs font-bold">{formatCurrency(inv.amount)}</Text>
            <View style={{ width: 90 }}><Badge label={inv.paymentStatus} variant={STATUS_BADGE[inv.paymentStatus] || 'warning'} /></View>
            <View style={{ width: 120 }} className="flex-row gap-2">
              <TouchableOpacity onPress={() => onMessage(inv.id, 'whatsapp')} className="w-8 h-8 rounded-lg bg-green-50 items-center justify-center"><Ionicons name="logo-whatsapp" size={15} color="#16A34A" /></TouchableOpacity>
              <TouchableOpacity onPress={() => onMessage(inv.id, 'sms')} className="w-8 h-8 rounded-lg bg-slate-100 items-center justify-center"><Ionicons name="chatbubble-ellipses-outline" size={15} color="#475569" /></TouchableOpacity>
              {canManage && inv.paymentStatus !== 'Paid' && (
                <TouchableOpacity onPress={() => onPay(inv)} className="w-8 h-8 rounded-lg bg-blue-50 items-center justify-center"><Ionicons name="cash-outline" size={15} color="#2563EB" /></TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
