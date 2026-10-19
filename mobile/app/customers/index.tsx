import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  TextInput,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { customersApi } from '../../src/api/endpoints';
import { LoadingScreen } from '../../src/components/common/LoadingScreen';
import { CustomersDataGrid } from '../../src/components/grid/CustomersDataGrid';
import { isActiveValue } from '../../src/utils/helpers';
import type { Customer } from '../../src/types';

export default function CustomersScreen() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const qc = useQueryClient();

  const { data: customers = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersApi.getAll().then((r) => r.data.data as Customer[]),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => customersApi.toggleActive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      Toast.show({ type: 'success', text1: 'Customer updated' });
    },
  });

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) || c.mobile.includes(search);
    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    return statusFilter === 'active' ? isActiveValue(c.isActive) : !isActiveValue(c.isActive);
  });

  if (isLoading) return <LoadingScreen />;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm">
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Customers</Text>
          <TouchableOpacity
            onPress={() => router.push('/customers/new')}
            className="bg-blue-600 rounded-full w-9 h-9 items-center justify-center"
          >
            <Ionicons name="add" size={22} color="white" />
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2">
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-gray-700"
            placeholder="Search customers..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <View className="flex-row mt-3 gap-2">
          {(['all', 'active', 'inactive'] as const).map((key) => {
            const count =
              key === 'all'
                ? customers.length
                : customers.filter((c) => isActiveValue(c.isActive) === (key === 'active')).length;
            const label = key === 'all' ? 'Total' : key === 'active' ? 'Active' : 'Inactive';
            const selected = statusFilter === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setStatusFilter(key)}
                className={`rounded-xl px-3 py-1 ${selected ? 'bg-blue-600' : 'bg-gray-100'}`}
              >
                <Text
                  className={`text-sm font-medium ${selected ? 'text-white' : 'text-gray-600'}`}
                >
                  {count} {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <CustomersDataGrid
        customers={filtered}
        onToggleActive={(id) => toggleMutation.mutate(id)}
        refreshing={isRefetching}
        onRefresh={refetch}
      />
    </View>
  );
}
