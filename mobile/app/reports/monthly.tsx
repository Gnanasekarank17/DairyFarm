import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { invoicesApi } from '../../src/api/endpoints';
import { formatMonthYear, formatCurrency } from '../../src/utils/helpers';
import { LoadingScreen } from '../../src/components/common/LoadingScreen';
import { ReportGrid } from '../../src/components/grid/ReportGrid';
import type { ReportColumn } from '../../src/components/grid/ReportGrid.types';

const COLUMNS: ReportColumn[] = [
  { field: 'invoiceNumber', headerName: 'Invoice No', minWidth: 150 },
  { field: 'customer', headerName: 'Customer', minWidth: 170 },
  { field: 'dailyQuantity', headerName: 'Daily Qty (L)', minWidth: 120 },
  { field: 'rate', headerName: 'Rate (₹/L)', minWidth: 110 },
  { field: 'deliveredDays', headerName: 'Delivered', minWidth: 110, aggregate: 'sum' },
  { field: 'missedDays', headerName: 'Missed', minWidth: 100, aggregate: 'sum' },
  { field: 'totalQuantity', headerName: 'Total Qty (L)', minWidth: 120, aggregate: 'sum' },
  { field: 'amount', headerName: 'Amount (₹)', minWidth: 130, aggregate: 'sum' },
  { field: 'status', headerName: 'Status', minWidth: 120 },
];

export default function MonthlyReport() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['report-monthly', year, month],
    queryFn: () => invoicesApi.getAll(year, month).then((r) => r.data.data),
  });

  const invoices: any[] = Array.isArray(data) ? data : [];
  const rows = invoices.map((inv: any) => ({
    id: inv.id || inv.invoiceNumber,
    invoiceNumber: inv.invoiceNumber || '',
    customer: inv.customerName || 'Customer',
    dailyQuantity: Number(inv.dailyQuantity || 0),
    rate: Number(inv.ratePerLiter || 0),
    deliveredDays: Number(inv.deliveredDays || 0),
    missedDays: Number(inv.missedDays || 0),
    totalQuantity: Number(inv.totalQuantity || 0),
    amount: Number(inv.amount || 0),
    status: inv.paymentStatus || 'Pending',
  }));
  const totalAmount = rows.reduce((s, r) => s + r.amount, 0);

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800 ml-4 flex-1">Monthly Report</Text>
      </View>

      <View className="flex-row items-center justify-between bg-white mx-4 mt-3 rounded-xl p-3 shadow-sm">
        <TouchableOpacity onPress={prevMonth}>
          <Ionicons name="chevron-back" size={20} color="#374151" />
        </TouchableOpacity>
        <Text className="font-semibold text-gray-800">{formatMonthYear(year, month)}</Text>
        <TouchableOpacity onPress={nextMonth}>
          <Ionicons name="chevron-forward" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      <View className="flex-row mx-4 mt-3 gap-3">
        <View className="flex-1 bg-white rounded-2xl p-3 shadow-sm">
          <Text className="text-gray-400 text-xs">Invoices</Text>
          <Text className="text-gray-800 font-bold text-xl">{rows.length}</Text>
        </View>
        <View className="flex-1 bg-white rounded-2xl p-3 shadow-sm">
          <Text className="text-gray-400 text-xs">Total Amount</Text>
          <Text className="text-blue-600 font-bold text-xl">{formatCurrency(totalAmount)}</Text>
        </View>
      </View>

      {isLoading ? (
        <LoadingScreen />
      ) : (
        <View className="flex-1 pt-3">
          <ReportGrid
            columns={COLUMNS}
            rows={rows}
            filename={`monthly-report-${year}-${String(month).padStart(2, '0')}`}
            noRowsMessage="No invoices for this month. Generate invoices first."
            stateId="report-monthly"
          />
        </View>
      )}
    </View>
  );
}
