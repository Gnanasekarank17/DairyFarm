import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { reportsApi } from '../../src/api/endpoints';
import { formatMonthYear } from '../../src/utils/helpers';
import { LoadingScreen } from '../../src/components/common/LoadingScreen';
import { ReportGrid } from '../../src/components/grid/ReportGrid';
import type { ReportColumn } from '../../src/components/grid/ReportGrid.types';

const COLUMNS: ReportColumn[] = [
  { field: 'cowName', headerName: 'Cow', minWidth: 170 },
  { field: 'tagNumber', headerName: 'Tag', minWidth: 110 },
  { field: 'totalMilk', headerName: 'Total Milk (L)', minWidth: 140, aggregate: 'sum' },
  { field: 'avgDaily', headerName: 'Avg/Day (L)', minWidth: 130, aggregate: 'avg' },
  { field: 'recordedDays', headerName: 'Recorded Days', minWidth: 140, aggregate: 'sum' },
];

export default function MilkProductionReport() {
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
    queryKey: ['report-milk-production', year, month],
    queryFn: () => reportsApi.milkProduction(year, month).then((r) => r.data.data),
  });

  const rows = (data?.data || []).map((row: any) => ({
    id: row.cowId,
    cowName: row.cowName || '',
    tagNumber: row.tagNumber || '',
    totalMilk: Number(row.totalMilk || 0).toFixed(1),
    avgDaily: Number(row.avgDaily || 0).toFixed(1),
    recordedDays: Number(row.recordedDays || 0),
  }));
  const grandTotal = Number(data?.grandTotal || 0);

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800 ml-4 flex-1">Milk Production</Text>
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

      <View className="bg-white mx-4 mt-3 rounded-2xl p-4 shadow-sm">
        <Text className="text-gray-400 text-xs">Total Production This Month</Text>
        <Text className="text-blue-600 font-bold text-2xl">{grandTotal.toFixed(1)} L</Text>
      </View>

      {isLoading ? (
        <LoadingScreen />
      ) : (
        <View className="flex-1 pt-3">
          <ReportGrid
            columns={COLUMNS}
            rows={rows}
            filename={`milk-production-${year}-${String(month).padStart(2, '0')}`}
            noRowsMessage="No milk production recorded for this month."
            stateId="report-milk-production"
          />
        </View>
      )}
    </View>
  );
}
