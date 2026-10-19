import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { reportsApi } from '../../src/api/endpoints';
import { formatCurrency, formatDisplay } from '../../src/utils/helpers';
import { LoadingScreen } from '../../src/components/common/LoadingScreen';
import { ReportGrid } from '../../src/components/grid/ReportGrid';
import type { ReportColumn } from '../../src/components/grid/ReportGrid.types';

const COLUMNS: ReportColumn[] = [
  { field: 'customer', headerName: 'Customer', minWidth: 160 },
  { field: 'invoiceNumber', headerName: 'Invoice No', minWidth: 140 },
  { field: 'period', headerName: 'Period', minWidth: 100 },
  { field: 'given', headerName: 'Given (days)', minWidth: 110, aggregate: 'sum' },
  { field: 'notGiven', headerName: 'Not Given (days)', minWidth: 130, aggregate: 'sum' },
  { field: 'amount', headerName: 'Amount (₹)', minWidth: 120, aggregate: 'sum' },
  { field: 'status', headerName: 'Status', minWidth: 100 },
  { field: 'mobile', headerName: 'Mobile', minWidth: 120 },
];

// The MissedDetails column may hold either a bare array of {date,reason}
// or an object { missed: [...], extras: [...], cutoffDate }. Handle both.
function parseMissedDates(raw: any): { date: string; reason?: string }[] {
  if (!raw) return [];
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const arr = Array.isArray(parsed) ? parsed : parsed?.missed;
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function StatCard({ label, value, tone }: { label: string; value: number | string; tone: 'green' | 'red' }) {
  const color = tone === 'green' ? 'text-green-600' : 'text-red-600';
  const bg = tone === 'green' ? 'bg-green-50' : 'bg-red-50';
  return (
    <View className={`flex-1 rounded-2xl p-4 ${bg}`}>
      <Text className={`text-3xl font-bold ${color}`}>{value}</Text>
      <Text className="text-gray-500 text-xs mt-1">{label}</Text>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-1.5 border-b border-gray-100">
      <Text className="text-gray-500 text-sm">{label}</Text>
      <Text className="text-gray-800 text-sm font-medium">{value}</Text>
    </View>
  );
}

export default function PendingPaymentsReport() {
  const { data, isLoading } = useQuery({
    queryKey: ['report-pending-payments'],
    queryFn: () => reportsApi.pendingPayments().then((r) => r.data.data),
  });

  const [selected, setSelected] = useState<any | null>(null);

  const pending: any[] = data?.pending || [];
  const totalPending = data?.totalPending || 0;
  const rows = pending.map((inv: any) => ({
    id: inv.id || inv.invoiceNumber,
    customer: inv.customerName || 'Customer',
    invoiceNumber: inv.invoiceNumber || '',
    period: inv.year && inv.month ? `${inv.year}-${String(inv.month).padStart(2, '0')}` : '',
    given: Number(inv.deliveredDays || 0),
    notGiven: Number(inv.missedDays || 0),
    amount: Number(inv.amount || 0),
    status: inv.paymentStatus || 'Pending',
    mobile: inv.mobile || '',
    _raw: inv,
  }));

  const inv = selected?._raw;
  const given = Number(inv?.deliveredDays || 0);
  const notGiven = Number(inv?.missedDays || 0);
  const missedDates = parseMissedDates(inv?.missedDetails);

  const openCalendar = () => {
    if (!inv) return;
    setSelected(null);
    router.push(`/delivery/${inv.customerId}?year=${inv.year}&month=${inv.month}` as any);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800 ml-4 flex-1">Pending Payments</Text>
      </View>

      {isLoading ? (
        <LoadingScreen />
      ) : (
        <View className="flex-1">
          <View className="bg-white mx-4 mt-3 rounded-2xl p-4 shadow-sm">
            <Text className="text-gray-500 text-sm">Total Outstanding</Text>
            <Text className="text-red-600 font-bold text-3xl mt-1">{formatCurrency(totalPending)}</Text>
            <Text className="text-gray-400 text-sm mt-1">{rows.length} unpaid invoice{rows.length === 1 ? '' : 's'}</Text>
          </View>
          <View className="flex-1 pt-3">
            <ReportGrid
              columns={COLUMNS}
              rows={rows}
              filename="pending-payments"
              noRowsMessage="All invoices are settled."
              stateId="report-pending-payments"
              onRowPress={(row) => setSelected(row)}
            />
          </View>
        </View>
      )}

      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[85%]">
            <View className="flex-row items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
              <View className="flex-1 pr-3">
                <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>
                  {inv?.customerName || 'Customer'}
                </Text>
                <Text className="text-gray-400 text-xs mt-0.5">
                  {inv?.invoiceNumber ? `${inv.invoiceNumber} · ` : ''}
                  {inv?.year && inv?.month ? `${inv.year}-${String(inv.month).padStart(2, '0')}` : ''}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelected(null)} className="p-1">
                <Ionicons name="close" size={26} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView className="px-5 py-4" showsVerticalScrollIndicator={false}>
              <View className="flex-row gap-3">
                <StatCard label="Days milk given" value={given} tone="green" />
                <StatCard label="Days not given" value={notGiven} tone="red" />
              </View>

              <View className="mt-4 bg-gray-50 rounded-2xl p-4">
                <DetailRow label="Total days in month" value={String(given + notGiven)} />
                <DetailRow label="Total quantity" value={`${Number(inv?.totalQuantity || 0)} L`} />
                <DetailRow label="Daily quantity" value={`${Number(inv?.dailyQuantity || 0)} L`} />
                <DetailRow label="Rate / litre" value={formatCurrency(Number(inv?.ratePerLiter || 0))} />
                {Number(inv?.deliveryCharge || 0) > 0 ? (
                  <DetailRow label="Delivery charge" value={formatCurrency(Number(inv?.deliveryCharge || 0))} />
                ) : null}
                <DetailRow label="Amount due" value={formatCurrency(Number(inv?.amount || 0))} />
                <View className="flex-row justify-between pt-2">
                  <Text className="text-gray-500 text-sm">Payment status</Text>
                  <Text className="text-orange-600 text-sm font-bold">{inv?.paymentStatus || 'Pending'}</Text>
                </View>
              </View>

              <Text className="text-gray-700 font-semibold mt-5 mb-2">
                Not-given dates ({missedDates.length})
              </Text>
              {missedDates.length === 0 ? (
                <View className="bg-green-50 rounded-xl p-3">
                  <Text className="text-green-700 text-sm">Milk was delivered every day this month.</Text>
                </View>
              ) : (
                missedDates.map((m, idx) => (
                  <View key={`${m.date}-${idx}`} className="flex-row items-start py-2 border-b border-gray-100">
                    <Ionicons name="close-circle" size={16} color="#DC2626" style={{ marginTop: 2 }} />
                    <View className="ml-2 flex-1">
                      <Text className="text-gray-800 text-sm font-medium">{formatDisplay(m.date)}</Text>
                      {m.reason ? <Text className="text-gray-500 text-xs mt-0.5">{m.reason}</Text> : null}
                    </View>
                  </View>
                ))
              )}

              <TouchableOpacity
                onPress={openCalendar}
                className="mt-5 mb-6 bg-blue-600 rounded-2xl py-3.5 flex-row items-center justify-center"
              >
                <Ionicons name="calendar-outline" size={18} color="#fff" />
                <Text className="text-white font-semibold ml-2">Open day-by-day calendar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
