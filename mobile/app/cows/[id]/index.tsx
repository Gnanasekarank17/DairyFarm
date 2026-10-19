import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { cowsApi } from '../../../src/api/endpoints';
import { LoadingScreen } from '../../../src/components/common/LoadingScreen';
import { EmptyState } from '../../../src/components/common/EmptyState';
import { Badge } from '../../../src/components/common/Badge';
import { useAuthStore } from '../../../src/store/authStore';
import { hasPermission } from '../../../src/utils/permissions';
import type { Cow } from '../../../src/types';

const STATUS_BADGE: Record<string, 'success' | 'purple' | 'warning' | 'error' | 'info'> = {
  Active: 'success', Pregnant: 'purple', 'Dry Period': 'warning', Sold: 'error', Deceased: 'info',
};

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <View className="flex-row justify-between py-2 border-b border-gray-100">
      <Text className="text-gray-500 text-sm">{label}</Text>
      <Text className="text-gray-800 text-sm font-medium">{String(value)}</Text>
    </View>
  );
}

export default function CowDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const canManage = hasPermission(user, 'cattle:manage');

  const { data: cow, isLoading } = useQuery({
    queryKey: ['cow', id],
    queryFn: () => cowsApi.getById(id!).then((r) => r.data.data as Cow),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => cowsApi.delete(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cows'] });
      Toast.show({ type: 'success', text1: 'Cow deleted' });
      router.back();
    },
    onError: (err: any) => Toast.show({ type: 'error', text1: err?.response?.data?.message || 'Failed to delete cow' }),
  });

  const confirmDelete = () => {
    const run = () => deleteMutation.mutate();
    const msg = `Delete ${cow?.name || 'this cow'}? This cannot be undone.`;
    if (Platform.OS === 'web') {
      if (globalThis.confirm(msg)) run();
      return;
    }
    Alert.alert('Delete Cow', msg, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: run },
    ]);
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800 ml-4 flex-1">Cow Details</Text>
        {canManage && cow && (
          <View className="flex-row gap-3">
            <TouchableOpacity onPress={() => router.push(`/cows/${id}/edit` as any)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="pencil" size={20} color="#2563EB" />
            </TouchableOpacity>
            <TouchableOpacity onPress={confirmDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="trash-outline" size={20} color="#DC2626" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {!cow ? (
        <EmptyState icon="leaf-outline" title="Cow not found" subtitle="This record may have been removed." />
      ) : (
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm items-center">
            <View className="w-20 h-20 bg-purple-100 rounded-2xl items-center justify-center mb-2">
              <Text className="text-4xl">🐄</Text>
            </View>
            <Text className="text-gray-800 font-bold text-lg">{cow.name}</Text>
            <View className="mt-1"><Badge label={cow.currentStatus} variant={STATUS_BADGE[cow.currentStatus] || 'info'} /></View>
          </View>

          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <Text className="text-gray-700 font-semibold mb-2">Profile</Text>
            <Row label="Animal Type" value={cow.animalType === 'Buffalo' ? '🐃 Buffalo' : '🐄 Cow'} />
            <Row label="Gender" value={cow.gender === 'Male' ? '♂ Male (Bull — mating only)' : '♀ Female'} />
            <Row label="Tag Number" value={cow.tagNumber || 'N/A'} />
            <Row label="Breed" value={cow.breed} />
            <Row label="Color" value={cow.color} />
            <Row label="Date of Birth" value={(cow.dateOfBirth || '').slice(0, 10)} />
            <Row label="Purchase Date" value={(cow.purchaseDate || '').slice(0, 10)} />
            <Row label="Purchase Cost" value={cow.purchaseCost ? `₹${cow.purchaseCost}` : ''} />
            <Row label="Notes" value={cow.notes} />
          </View>

          <View className="flex-row gap-2 mb-4">
            <TouchableOpacity onPress={() => router.push(`/breeding/add?cowId=${id}` as any)} className="flex-1 bg-red-50 rounded-xl py-3 items-center">
              <Text className="text-red-600 text-sm font-medium">+ Breeding</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push(`/milk/add?cowId=${id}` as any)} className="flex-1 bg-blue-50 rounded-xl py-3 items-center">
              <Text className="text-blue-600 text-sm font-medium">+ Milk</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push(`/cows/${id}/health` as any)} className="flex-1 bg-green-50 rounded-xl py-3 items-center">
              <Text className="text-green-600 text-sm font-medium">Health</Text>
            </TouchableOpacity>
          </View>

          {canManage && (
            <TouchableOpacity onPress={() => router.push(`/cows/${id}/edit` as any)} className="bg-blue-600 rounded-2xl py-3 items-center mb-3">
              <Text className="text-white font-semibold">Edit Cow</Text>
            </TouchableOpacity>
          )}
          {canManage && (
            <TouchableOpacity onPress={confirmDelete} className="bg-red-50 rounded-2xl py-3 items-center mb-8">
              <Text className="text-red-600 font-semibold">Delete Cow</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
}
