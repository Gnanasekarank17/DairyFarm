import React from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { breedingApi } from '../../src/api/endpoints';
import { EmptyState } from '../../src/components/common/EmptyState';
import { LoadingScreen } from '../../src/components/common/LoadingScreen';
import { formatDisplay, pregnancyStatusColor, daysUntil } from '../../src/utils/helpers';
import type { PregnancyRecord } from '../../src/types';

export default function PregnanciesScreen() {
  const { data: pregnancies = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['pregnancies'],
    queryFn: () => breedingApi.getPregnancies('Pregnant').then((r) => r.data.data as PregnancyRecord[]),
  });

  if (isLoading) return <LoadingScreen />;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800 ml-4">Pregnancies</Text>
      </View>

      <FlatList
        data={pregnancies}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          <EmptyState icon="leaf-outline" title="No active pregnancies" subtitle="Add breeding records to track pregnancies" />
        }
        renderItem={({ item }) => {
          const remaining = daysUntil(item.expectedCalvingDate);
          const statusColor = pregnancyStatusColor(remaining);
          const isOverdue = remaining < 0;
          const isDueSoon = remaining >= 0 && remaining <= 30;

          return (
            <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="text-gray-800 font-semibold text-base">{item.cowId}</Text>
                  <Text className="text-gray-500 text-sm mt-1">
                    Confirmed: {formatDisplay(item.confirmationDate)}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    Expected: {formatDisplay(item.expectedCalvingDate)}
                  </Text>
                </View>
                <View
                  className="px-3 py-2 rounded-xl"
                  style={{ backgroundColor: `${statusColor}20` }}
                >
                  <Text className="font-bold text-lg" style={{ color: statusColor }}>
                    {isOverdue ? `${Math.abs(remaining)}d` : `${remaining}d`}
                  </Text>
                  <Text className="text-xs text-center" style={{ color: statusColor }}>
                    {isOverdue ? 'overdue' : 'left'}
                  </Text>
                </View>
              </View>

              {(isOverdue || isDueSoon) && (
                <View
                  className="mt-3 p-2 rounded-xl flex-row items-center"
                  style={{ backgroundColor: `${statusColor}10` }}
                >
                  <Ionicons
                    name={isOverdue ? 'warning' : 'alert-circle'}
                    size={16}
                    color={statusColor}
                  />
                  <Text className="text-sm ml-2 font-medium" style={{ color: statusColor }}>
                    {isOverdue ? 'OVERDUE - Immediate attention required!' : 'Due within 30 days - Prepare for calving'}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                onPress={() => router.push(`/calving/record?pregnancyId=${item.id}&cowId=${item.cowId}`)}
                className="mt-3 bg-purple-600 rounded-xl py-2.5 items-center"
              >
                <Text className="text-white font-medium">Record Calving</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}
