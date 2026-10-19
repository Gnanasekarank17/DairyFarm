import React from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import type { Cow } from '../../types';

const STATUS_BADGE: Record<string, 'success' | 'purple' | 'warning' | 'error' | 'info'> = {
  Active: 'success', Pregnant: 'purple', 'Dry Period': 'warning', Sold: 'error', Deceased: 'info',
};

interface CowsDataGridProps {
  cows: Cow[];
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function CowsDataGrid({ cows, refreshing, onRefresh }: CowsDataGridProps) {
  return (
    <FlatList
      data={cows}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16, paddingTop: 0 }}
      refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} /> : undefined}
      ListEmptyComponent={
        <EmptyState icon="leaf-outline" title="No cows found" subtitle="Tap + to add your first cow" />
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => router.push(`/cows/${item.id}` as any)}
          className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
          activeOpacity={0.8}
        >
          <View className="flex-row items-start">
            <View className="w-12 h-12 bg-purple-100 rounded-xl items-center justify-center mr-3">
              <Text className="text-2xl">{item.gender === 'Male' ? '🐂' : '🐄'}</Text>
            </View>
            <View className="flex-1">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-1">
                  <Text className="text-gray-800 font-semibold text-base">{item.name}</Text>
                  <Text className={item.gender === 'Male' ? 'text-blue-600' : 'text-pink-600'}>{item.gender === 'Male' ? '♂' : '♀'}</Text>
                </View>
                <Badge label={item.currentStatus} variant={STATUS_BADGE[item.currentStatus] || 'info'} />
              </View>
              <Text className="text-gray-500 text-sm mt-0.5">Tag: {item.tagNumber || 'N/A'}</Text>
              <View className="flex-row gap-4 mt-1">
                <Text className="text-gray-400 text-xs">{item.breed || 'Unknown breed'}</Text>
                {item.gender === 'Male' && <Text className="text-blue-500 text-xs font-medium">Bull · mating only</Text>}
                {item.color && <Text className="text-gray-400 text-xs">{item.color}</Text>}
              </View>
            </View>
          </View>
          <View className="flex-row gap-2 mt-3">
            {item.gender !== 'Male' && (
              <TouchableOpacity
                onPress={() => router.push(`/breeding/add?cowId=${item.id}` as any)}
                className="flex-1 bg-red-50 rounded-xl py-2 items-center"
              >
                <Text className="text-red-600 text-xs font-medium">+ Breeding</Text>
              </TouchableOpacity>
            )}
            {item.gender !== 'Male' && (
              <TouchableOpacity
                onPress={() => router.push(`/milk/add?cowId=${item.id}` as any)}
                className="flex-1 bg-blue-50 rounded-xl py-2 items-center"
              >
                <Text className="text-blue-600 text-xs font-medium">+ Milk</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => router.push(`/cows/${item.id}/health` as any)}
              className="flex-1 bg-green-50 rounded-xl py-2 items-center"
            >
              <Text className="text-green-600 text-xs font-medium">Health</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}
