import React from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { isActiveValue } from '../../utils/helpers';
import type { Customer } from '../../types';

interface CustomersDataGridProps {
  customers: Customer[];
  onToggleActive: (id: string) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function CustomersDataGrid({ customers, onToggleActive, refreshing, onRefresh }: CustomersDataGridProps) {
  return (
    <FlatList
      data={customers}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} /> : undefined}
      ListEmptyComponent={
        <EmptyState icon="people-outline" title="No customers found" subtitle="Tap + to add your first customer" />
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => router.push(`/customers/${item.id}` as any)}
          className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
          activeOpacity={0.8}
        >
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-gray-800 font-semibold text-base">{item.name}</Text>
                <Badge
                  label={isActiveValue(item.isActive) ? 'Active' : 'Inactive'}
                  variant={isActiveValue(item.isActive) ? 'success' : 'error'}
                />
              </View>
              <Text className="text-gray-500 mt-1 text-sm">📱 {item.mobile}</Text>
              {item.address ? (
                <Text className="text-gray-400 text-sm mt-0.5" numberOfLines={1}>
                  📍 {item.address}
                </Text>
              ) : null}
            </View>
            <View className="items-end ml-3">
              <Text className="text-green-600 font-bold text-base">{item.dailyQuantity}L</Text>
              <Text className="text-gray-400 text-xs mt-0.5">
                {parseFloat(item.morningQuantity || '0') > 0 ? `☀️ ${item.morningQuantity}L` : ''}
                {parseFloat(item.morningQuantity || '0') > 0 && parseFloat(item.eveningQuantity || '0') > 0 ? '  ' : ''}
                {parseFloat(item.eveningQuantity || '0') > 0 ? `🌙 ${item.eveningQuantity}L` : ''}
              </Text>
              <Text className="text-gray-400 text-xs mt-0.5">₹{item.ratePerLiter}/L</Text>
              <Text className="text-gray-400 text-xs mt-0.5">{item.milkType}</Text>
            </View>
          </View>
          <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <Text className="text-gray-400 text-xs">{item.billingMode}</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => router.push(`/customers/${item.id}/edit` as any)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="pencil-outline" size={18} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onToggleActive(item.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={isActiveValue(item.isActive) ? 'pause-circle-outline' : 'play-circle-outline'}
                  size={18}
                  color={isActiveValue(item.isActive) ? '#DC2626' : '#16A34A'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}
