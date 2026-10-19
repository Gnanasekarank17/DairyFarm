import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { EmptyState } from '../common/EmptyState';
import type { ReportGridProps } from './ReportGrid.types';

// Native fallback: a simple card list (RTK DataGrid is web-only).
export function ReportGrid({ columns, rows, noRowsMessage, onRowPress }: ReportGridProps) {
  if (!rows.length) {
    return <EmptyState icon="document-outline" title="No data" subtitle={noRowsMessage} />;
  }
  return (
    <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
      {rows.map((row, i) => (
        <TouchableOpacity
          key={row.id || i}
          activeOpacity={onRowPress ? 0.7 : 1}
          disabled={!onRowPress}
          onPress={() => onRowPress?.(row)}
          className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
        >
          {columns.map((c) => (
            <View key={c.field} className="flex-row justify-between py-1">
              <Text className="text-gray-500 text-sm">{c.headerName}</Text>
              <Text className="text-gray-800 text-sm font-medium">{String(row[c.field] ?? '')}</Text>
            </View>
          ))}
          {onRowPress ? (
            <Text className="text-blue-600 text-xs font-semibold mt-1">Tap for delivered / missed breakdown</Text>
          ) : null}
        </TouchableOpacity>
      ))}
      <View className="h-8" />
    </ScrollView>
  );
}
