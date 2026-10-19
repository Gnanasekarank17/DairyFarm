import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { reportsApi } from '../../src/api/endpoints';
import { LoadingScreen } from '../../src/components/common/LoadingScreen';
import { ReportGrid } from '../../src/components/grid/ReportGrid';
import type { ReportColumn } from '../../src/components/grid/ReportGrid.types';

const COLUMNS: ReportColumn[] = [
  { field: 'date', headerName: 'Date', minWidth: 120 },
  { field: 'status', headerName: 'Status', minWidth: 140 },
  { field: 'reason', headerName: 'Reason', minWidth: 200 },
  { field: 'comments', headerName: 'Comments', minWidth: 220 },
  { field: 'by', headerName: 'Recorded By', minWidth: 150 },
];

export default function DeliveryExceptionsReport() {
  const { data, isLoading } = useQuery({
    queryKey: ['report-delivery-exceptions'],
    queryFn: () => reportsApi.deliveryExceptions().then((r) => r.data.data),
  });

  const rows = (Array.isArray(data) ? data : []).map((row: any) => ({
    id: row.id,
    date: (row.createdAt || '').slice(0, 10),
    status: row.newValue || 'Not Delivered',
    reason: row.reason || '',
    comments: row.comments || '',
    by: row.userName || '',
  }));

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800 ml-4 flex-1">Delivery Exceptions</Text>
        <Text className="text-gray-400 text-xs">{rows.length} record{rows.length === 1 ? '' : 's'}</Text>
      </View>

      {isLoading ? (
        <LoadingScreen />
      ) : (
        <View className="flex-1 pt-3">
          <ReportGrid
            columns={COLUMNS}
            rows={rows}
            filename="delivery-exceptions"
            noRowsMessage="No missed-delivery changes have been logged."
            stateId="report-delivery-exceptions"
          />
        </View>
      )}
    </View>
  );
}
