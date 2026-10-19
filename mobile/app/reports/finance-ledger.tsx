import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { reportsApi } from '../../src/api/endpoints';
import { ReportGrid } from '../../src/components/grid/ReportGrid';
import type { ReportColumn } from '../../src/components/grid/ReportGrid.types';
import { LoadingScreen } from '../../src/components/common/LoadingScreen';
import { formatCurrency, formatDisplay, formatMonthYear } from '../../src/utils/helpers';
import type { FinanceLedgerReport } from '../../src/types';

const COLUMNS: ReportColumn[] = [
  { field: 'date', headerName: 'Date', minWidth: 115 },
  { field: 'type', headerName: 'Type', minWidth: 95 },
  { field: 'category', headerName: 'Category', minWidth: 190 },
  { field: 'description', headerName: 'Details', minWidth: 190 },
  { field: 'party', headerName: 'Party', minWidth: 160 },
  { field: 'paymentMode', headerName: 'Mode', minWidth: 100 },
  { field: 'income', headerName: 'Income (₹)', minWidth: 120, aggregate: 'sum' },
  { field: 'expense', headerName: 'Expense (₹)', minWidth: 120, aggregate: 'sum' },
  { field: 'balance', headerName: 'Running Balance (₹)', minWidth: 150 },
];

// Combined cash book: every income line (milk collections, product orders, manual income)
// and every expense for the month, with a running balance. Web = PCB grid with export.
export default function FinanceLedgerScreen() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); } else setMonth((m) => m + 1);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['report-finance-ledger', year, month],
    queryFn: () => reportsApi.financeLedger(year, month).then((r) => r.data.data as FinanceLedgerReport),
  });

  const rows = useMemo(
    () => (data?.rows ?? []).map((r) => ({
      ...r,
      date: Platform.OS === 'web' ? r.date : formatDisplay(r.date),
      income: Number(r.income || 0),
      expense: Number(r.expense || 0),
      balance: Number(r.balance || 0),
    })),
    [data],
  );

  if (isLoading || !data) return <LoadingScreen message="Loading ledger..." />;

  const netPositive = data.net >= 0;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800 ml-4">Finance Ledger</Text>
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

      <View className="flex-row gap-3 mx-4 mt-3">
        <View className="flex-1 bg-white rounded-2xl p-3 shadow-sm">
          <Text className="text-gray-500 text-xs">Income</Text>
          <Text className="text-emerald-700 font-bold text-lg">{formatCurrency(data.totalIncome)}</Text>
        </View>
        <View className="flex-1 bg-white rounded-2xl p-3 shadow-sm">
          <Text className="text-gray-500 text-xs">Expense</Text>
          <Text className="text-red-700 font-bold text-lg">{formatCurrency(data.totalExpense)}</Text>
        </View>
        <View className={`flex-1 rounded-2xl p-3 shadow-sm ${netPositive ? 'bg-emerald-50' : 'bg-red-50'}`}>
          <Text className={`text-xs ${netPositive ? 'text-emerald-600' : 'text-red-600'}`}>Net {netPositive ? 'Profit' : 'Loss'}</Text>
          <Text className={`font-bold text-lg ${netPositive ? 'text-emerald-800' : 'text-red-800'}`}>{formatCurrency(Math.abs(data.net))}</Text>
        </View>
      </View>

      <View className="flex-1 pt-3">
        <ReportGrid
          columns={COLUMNS}
          rows={rows}
          filename={`finance-ledger-${year}-${String(month).padStart(2, '0')}`}
          noRowsMessage="No income or expense entries for this month."
          stateId="report-finance-ledger"
        />
      </View>
    </View>
  );
}
