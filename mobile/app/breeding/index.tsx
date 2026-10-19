import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, RefreshControl, Platform, Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { breedingApi } from '../../src/api/endpoints';
import { EmptyState } from '../../src/components/common/EmptyState';
import { LoadingScreen } from '../../src/components/common/LoadingScreen';
import { formatDisplay, daysUntil } from '../../src/utils/helpers';
import type { BreedingRecord } from '../../src/types';

// Mirrors dbo.SpeciesBreedingConfig — see app/breeding/add.tsx for the same mapping.
const SPECIES_INFO: Record<string, { cycleDays: number; gestationLabel: string }> = {
  Cow: { cycleDays: 21, gestationLabel: '9 months 10 days' },
  Buffalo: { cycleDays: 21, gestationLabel: '9 months 10 days' },
  Goat: { cycleDays: 19, gestationLabel: '~150 days' },
};

type Filter = 'All' | 'Pending' | 'Conceived' | 'NotConceived';
const FILTERS: Filter[] = ['All', 'Pending', 'Conceived', 'NotConceived'];
const filterLabel = (f: Filter) => (f === 'NotConceived' ? 'Not Conceived' : f);

const statusStyle = (status?: string) => {
  switch (status) {
    case 'Conceived': return { bg: '#DCFCE7', fg: '#15803D', label: 'Conceived' };
    case 'NotConceived': return { bg: '#FEE2E2', fg: '#B91C1C', label: 'Not Conceived' };
    default: return { bg: '#FEF9C3', fg: '#A16207', label: 'Pending' };
  }
};

export default function BreedingCyclesScreen() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Filter>('All');

  const { data: records = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['breeding', 'all'],
    queryFn: () => breedingApi.getAll().then((r) => r.data.data as BreedingRecord[]),
  });

  const conceptionMutation = useMutation({
    mutationFn: ({ id, conceived }: { id: string; conceived: boolean }) =>
      breedingApi.setConception(id, { conceived }),
    onSuccess: (_res, variables) => {
      qc.invalidateQueries({ queryKey: ['breeding'] });
      qc.invalidateQueries({ queryKey: ['pregnancies'] });
      qc.invalidateQueries({ queryKey: ['cows'] });
      Toast.show({
        type: 'success',
        text1: variables.conceived ? 'Pregnancy confirmed' : 'Re-mating scheduled',
      });
    },
    onError: () => Toast.show({ type: 'error', text1: 'Failed to update cycle' }),
  });

  const confirmAction = (record: BreedingRecord, conceived: boolean) => {
    const info = SPECIES_INFO[record.species || 'Cow'] || SPECIES_INFO.Cow;
    const label = record.cowName || 'this animal';
    const title = conceived ? 'Confirm Pregnancy' : 'Not Conceived';
    const message = conceived
      ? `Mark ${label} as pregnant? Delivery date will be set to ${info.gestationLabel} from mating.`
      : `Mark ${label} as not conceived? A new mating cycle (${info.cycleDays}-day gap) will be scheduled.`;
    const run = () => conceptionMutation.mutate({ id: record.id, conceived });

    if (Platform.OS === 'web') {
      if (globalThis.confirm(`${title}\n\n${message}`)) run();
      return;
    }
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: conceived ? 'Confirm' : 'Re-mate', style: conceived ? 'default' : 'destructive', onPress: run },
    ]);
  };

  const filtered = records.filter((r) =>
    filter === 'All' ? true : (r.conceptionStatus || 'Pending') === filter
  );

  if (isLoading) return <LoadingScreen />;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800 ml-4">Mating & Cycles</Text>
        </View>
        <View className="flex-row gap-2 mt-3">
          {FILTERS.map((f) => {
            const count = f === 'All'
              ? records.length
              : records.filter((r) => (r.conceptionStatus || 'Pending') === f).length;
            const selected = filter === f;
            return (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full ${selected ? 'bg-red-600' : 'bg-gray-100'}`}
              >
                <Text className={`text-xs font-medium ${selected ? 'text-white' : 'text-gray-600'}`}>
                  {filterLabel(f)} {count}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          <EmptyState icon="heart-outline" title="No mating records" subtitle="Add a mating from a cow or goat's profile to start a cycle" />
        }
        renderItem={({ item }) => {
          const style = statusStyle(item.conceptionStatus);
          const isPending = (item.conceptionStatus || 'Pending') === 'Pending';
          const checkDays = item.nextCheckDate ? daysUntil(item.nextCheckDate) : null;
          const overdue = checkDays !== null && checkDays < 0;

          return (
            <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-2">
                  <Text className="text-gray-800 font-semibold text-base">
                    {item.cowName || 'Cow'}{item.tagNumber ? `  #${item.tagNumber}` : ''}
                  </Text>
                  <Text className="text-gray-500 text-sm mt-1">
                    Mated: {formatDisplay(item.matingDate)}
                    {item.cycleNumber ? `  ·  Cycle ${item.cycleNumber}` : ''}
                  </Text>
                  {item.bullName ? (
                    <Text className="text-gray-400 text-xs mt-0.5">Bull: {item.bullName}</Text>
                  ) : null}
                </View>
                <View className="px-3 py-1.5 rounded-xl" style={{ backgroundColor: style.bg }}>
                  <Text className="text-xs font-bold" style={{ color: style.fg }}>{style.label}</Text>
                </View>
              </View>

              {item.conceptionStatus === 'Conceived' && item.expectedCalvingDate ? (
                <View className="mt-3 p-2.5 rounded-xl bg-green-50 flex-row items-center">
                  <Ionicons name="calendar-outline" size={16} color="#15803D" />
                  <Text className="text-green-700 text-sm ml-2 font-medium">
                    Expected delivery {formatDisplay(item.expectedCalvingDate)}
                  </Text>
                </View>
              ) : null}

              {isPending && item.nextCheckDate ? (
                <View
                  className="mt-3 p-2.5 rounded-xl flex-row items-center"
                  style={{ backgroundColor: overdue ? '#FEF2F2' : '#EFF6FF' }}
                >
                  <Ionicons
                    name={overdue ? 'alert-circle' : 'time-outline'}
                    size={16}
                    color={overdue ? '#B91C1C' : '#2563EB'}
                  />
                  <Text
                    className="text-sm ml-2 font-medium"
                    style={{ color: overdue ? '#B91C1C' : '#2563EB' }}
                  >
                    Cycle check {formatDisplay(item.nextCheckDate)}
                    {checkDays !== null ? (overdue ? ` · ${Math.abs(checkDays)}d overdue` : ` · in ${checkDays}d`) : ''}
                  </Text>
                </View>
              ) : null}

              {isPending ? (
                <View className="flex-row gap-2 mt-3">
                  <TouchableOpacity
                    onPress={() => confirmAction(item, true)}
                    disabled={conceptionMutation.isPending}
                    className="flex-1 bg-green-600 rounded-xl py-2.5 items-center"
                  >
                    <Text className="text-white font-medium text-sm">Confirmed Pregnant</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => confirmAction(item, false)}
                    disabled={conceptionMutation.isPending}
                    className="flex-1 bg-white border border-red-300 rounded-xl py-2.5 items-center"
                  >
                    <Text className="text-red-600 font-medium text-sm">Not Conceived</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          );
        }}
      />
    </View>
  );
}
