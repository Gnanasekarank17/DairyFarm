import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { customersApi } from '../../../src/api/endpoints';
import { LoadingScreen } from '../../../src/components/common/LoadingScreen';
import { EmptyState } from '../../../src/components/common/EmptyState';
import { Badge } from '../../../src/components/common/Badge';
import { isActiveValue } from '../../../src/utils/helpers';
import { useAuthStore } from '../../../src/store/authStore';
import { hasPermission } from '../../../src/utils/permissions';
import type { Customer } from '../../../src/types';

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <View className="flex-row justify-between py-2 border-b border-gray-100">
      <Text className="text-gray-500 text-sm">{label}</Text>
      <Text className="text-gray-800 text-sm font-medium">{String(value)}</Text>
    </View>
  );
}

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const canManage = hasPermission(user, 'customers:manage');

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersApi.getById(id!).then((r) => r.data.data as Customer),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => customersApi.delete(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      Toast.show({ type: 'success', text1: 'Customer deleted' });
      router.back();
    },
    onError: (err: any) => Toast.show({ type: 'error', text1: err?.response?.data?.message || 'Failed to delete customer' }),
  });

  const confirmDelete = () => {
    const run = () => deleteMutation.mutate();
    const msg = `Delete ${customer?.name || 'this customer'}? This cannot be undone.`;
    if (Platform.OS === 'web') {
      if (globalThis.confirm(msg)) run();
      return;
    }
    Alert.alert('Delete Customer', msg, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: run },
    ]);
  };

  if (isLoading) return <LoadingScreen />;
  const active = customer ? isActiveValue(customer.isActive) : false;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800 ml-4 flex-1">Customer Details</Text>
        {canManage && customer && (
          <View className="flex-row gap-3">
            <TouchableOpacity onPress={() => router.push(`/customers/${id}/edit` as any)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="pencil" size={20} color="#2563EB" />
            </TouchableOpacity>
            <TouchableOpacity onPress={confirmDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="trash-outline" size={20} color="#DC2626" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {!customer ? (
        <EmptyState icon="people-outline" title="Customer not found" subtitle="This record may have been removed." />
      ) : (
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm items-center">
            <View className="w-20 h-20 bg-blue-100 rounded-2xl items-center justify-center mb-2">
              <Text className="text-3xl">👤</Text>
            </View>
            <Text className="text-gray-800 font-bold text-lg">{customer.name}</Text>
            <View className="mt-1"><Badge label={active ? 'Active' : 'Inactive'} variant={active ? 'success' : 'error'} /></View>
          </View>

          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <Text className="text-gray-700 font-semibold mb-2">Contact</Text>
            <Row label="Mobile" value={customer.mobile} />
            <Row label="Email" value={customer.email} />
            <Row label="Address" value={customer.address} />
          </View>

          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <Text className="text-gray-700 font-semibold mb-2">Milk Subscription</Text>
            <Row label="Milk Type" value={customer.milkType} />
            <Row label="Daily Quantity" value={`${customer.dailyQuantity} L`} />
            <Row label="Morning" value={customer.morningQuantity ? `${customer.morningQuantity} L` : ''} />
            <Row label="Evening" value={customer.eveningQuantity ? `${customer.eveningQuantity} L` : ''} />
            <Row label="Rate" value={`₹${customer.ratePerLiter}/L`} />
            <Row label="Billing Mode" value={customer.billingMode} />
          </View>

          <TouchableOpacity onPress={() => router.push(`/delivery/${id}` as any)} className="bg-white rounded-2xl p-4 mb-4 shadow-sm flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={20} color="#2563EB" />
              <Text className="text-gray-700 font-medium ml-3">View Deliveries</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          {canManage && (
            <TouchableOpacity onPress={() => router.push(`/customers/${id}/edit` as any)} className="bg-blue-600 rounded-2xl py-3 items-center mb-3">
              <Text className="text-white font-semibold">Edit Customer</Text>
            </TouchableOpacity>
          )}
          {canManage && (
            <TouchableOpacity onPress={confirmDelete} className="bg-red-50 rounded-2xl py-3 items-center mb-8">
              <Text className="text-red-600 font-semibold">Delete Customer</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
}
