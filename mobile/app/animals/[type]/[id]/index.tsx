import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { LoadingScreen } from '../../../../src/components/common/LoadingScreen';
import { EmptyState } from '../../../../src/components/common/EmptyState';
import { Badge } from '../../../../src/components/common/Badge';
import { Input } from '../../../../src/components/common/Input';
import { Button } from '../../../../src/components/common/Button';
import { useAuthStore } from '../../../../src/store/authStore';
import { hasPermission } from '../../../../src/utils/permissions';
import { today } from '../../../../src/utils/helpers';
import { SIMPLE_ANIMAL_CONFIG, isSimpleAnimalTypeSlug, getWeightTrend, WEIGHT_TREND_COLOR } from '../../../../src/config/simpleAnimals';
import type { SimpleAnimal } from '../../../../src/types';

const STATUS_BADGE: Record<string, 'success' | 'purple' | 'warning' | 'error' | 'info'> = {
  Active: 'success', Mated: 'warning', Pregnant: 'purple', Sold: 'info', Deceased: 'error',
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

export default function SimpleAnimalDetailScreen() {
  const { type, id } = useLocalSearchParams<{ type: string; id: string }>();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const canManage = hasPermission(user, 'cattle:manage');
  const [weighFormOpen, setWeighFormOpen] = useState(false);
  const [weighDate, setWeighDate] = useState(today());
  const [weighKg, setWeighKg] = useState('');
  const [weighNotes, setWeighNotes] = useState('');

  if (!isSimpleAnimalTypeSlug(type)) return <Redirect href="/(tabs)/more" />;
  const config = SIMPLE_ANIMAL_CONFIG[type];

  const { data: animal, isLoading } = useQuery({
    queryKey: [type, id],
    queryFn: () => config.api.getById(id!).then((r) => r.data.data as SimpleAnimal),
    enabled: !!id,
  });

  const addWeightMutation = useMutation({
    mutationFn: () => (config.api as any).addWeight(id!, { weighedDate: weighDate, weightKg: weighKg, notes: weighNotes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [type, id] });
      qc.invalidateQueries({ queryKey: [type] });
      Toast.show({ type: 'success', text1: 'Weight logged' });
      setWeighFormOpen(false);
      setWeighKg('');
      setWeighNotes('');
      setWeighDate(today());
    },
    onError: (err: any) => Toast.show({ type: 'error', text1: err?.response?.data?.message || 'Failed to log weight' }),
  });

  const submitWeight = () => {
    const kg = parseFloat(weighKg);
    if (!Number.isFinite(kg) || kg <= 0) {
      Toast.show({ type: 'error', text1: 'Enter a valid weight in kg' });
      return;
    }
    addWeightMutation.mutate();
  };

  const deleteMutation = useMutation({
    mutationFn: () => config.api.delete(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [type] });
      Toast.show({ type: 'success', text1: `${config.singular} deleted` });
      router.back();
    },
    onError: (err: any) => Toast.show({ type: 'error', text1: err?.response?.data?.message || `Failed to delete ${config.singular.toLowerCase()}` }),
  });

  const confirmDelete = () => {
    const run = () => deleteMutation.mutate();
    const msg = `Delete ${animal?.name || `this ${config.singular.toLowerCase()}`}? This cannot be undone.`;
    if (Platform.OS === 'web') {
      if (globalThis.confirm(msg)) run();
      return;
    }
    Alert.alert(`Delete ${config.singular}`, msg, [
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
        <Text className="text-xl font-bold text-gray-800 ml-4 flex-1">{config.singular} Details</Text>
        {canManage && animal && (
          <View className="flex-row gap-3">
            <TouchableOpacity onPress={() => router.push(`/animals/${type}/${id}/edit` as any)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="pencil" size={20} color="#2563EB" />
            </TouchableOpacity>
            <TouchableOpacity onPress={confirmDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="trash-outline" size={20} color="#DC2626" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {!animal ? (
        <EmptyState icon={config.icon} title={`${config.singular} not found`} subtitle="This record may have been removed." />
      ) : (
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm items-center">
            <View className="w-20 h-20 bg-purple-100 rounded-2xl items-center justify-center mb-2">
              <Text className="text-4xl">{config.emoji}</Text>
            </View>
            <Text className="text-gray-800 font-bold text-lg">{animal.name}</Text>
            <View className="mt-1"><Badge label={animal.currentStatus} variant={STATUS_BADGE[animal.currentStatus] || 'info'} /></View>
          </View>

          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <Text className="text-gray-700 font-semibold mb-2">Profile</Text>
            {config.hasGender && (
              <Row label="Gender" value={animal.gender === 'Male' ? '♂ Male (Buck — mating only)' : '♀ Female (Doe)'} />
            )}
            <Row label="Tag Number" value={animal.tagNumber || 'N/A'} />
            <Row label="Breed" value={animal.breed} />
            <Row label="Color" value={animal.color} />
            <Row label="Date of Birth" value={(animal.dateOfBirth || '').slice(0, 10)} />
            <Row label="Purchase Date" value={(animal.purchaseDate || '').slice(0, 10)} />
            <Row label="Purchase Cost" value={animal.purchaseCost ? `₹${animal.purchaseCost}` : ''} />
            <Row label="Notes" value={animal.notes} />
          </View>

          {config.hasWeightTracking && (
            <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-700 font-semibold">Weight Tracking</Text>
                {canManage && (
                  <TouchableOpacity onPress={() => setWeighFormOpen(!weighFormOpen)}>
                    <Text className="text-blue-600 text-sm font-medium">{weighFormOpen ? 'Cancel' : '+ Log Weight'}</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-gray-500 text-sm">Current Weight</Text>
                <Text
                  className="text-sm font-medium"
                  style={animal.currentWeightKg ? { color: WEIGHT_TREND_COLOR[getWeightTrend(animal.currentWeightKg, animal.weightHistory?.[1]?.weightKg)] } : { color: '#374151' }}
                >
                  {animal.currentWeightKg ? `${Number(animal.currentWeightKg).toFixed(1)} kg` : 'Not weighed yet'}
                </Text>
              </View>
              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-gray-500 text-sm">Last Weighed</Text>
                <Text className="text-gray-800 text-sm font-medium">{animal.lastWeighedDate ? animal.lastWeighedDate.slice(0, 10) : 'N/A'}</Text>
              </View>

              {weighFormOpen && (
                <View className="mt-3 p-3 rounded-xl bg-gray-50">
                  <Input label="Date" placeholder="YYYY-MM-DD" value={weighDate} onChangeText={setWeighDate} required />
                  <Input label="Weight (kg)" placeholder="e.g. 22.5" value={weighKg} onChangeText={setWeighKg} keyboardType="decimal-pad" required />
                  <Input label="Notes" placeholder="Optional notes" value={weighNotes} onChangeText={setWeighNotes} />
                  <Button title="Save Weight" onPress={submitWeight} loading={addWeightMutation.isPending} className="mt-1" />
                </View>
              )}

              <Text className="text-xs text-slate-500 mt-3 mb-1">Weigh-in history since purchase (recommended every 2 weeks):</Text>
              {!animal.weightHistory || animal.weightHistory.length === 0 ? (
                <Text className="text-sm text-gray-400 py-2">No weigh-ins logged yet.</Text>
              ) : (
                animal.weightHistory.map((w, i) => {
                  const previous = animal.weightHistory![i + 1]?.weightKg;
                  return (
                    <View key={w.id} className="flex-row justify-between py-2 border-b border-gray-100">
                      <Text className="text-gray-500 text-sm">{w.weighedDate.slice(0, 10)}</Text>
                      <Text className="text-sm font-medium" style={{ color: WEIGHT_TREND_COLOR[getWeightTrend(w.weightKg, previous)] }}>
                        {Number(w.weightKg).toFixed(1)} kg
                      </Text>
                    </View>
                  );
                })
              )}
            </View>
          )}

          {config.hasBreeding && (
            <TouchableOpacity
              onPress={() => router.push(`/breeding/add?cowId=${id}&species=${config.singular}` as any)}
              className="bg-red-50 rounded-2xl py-3 items-center mb-3"
            >
              <Text className="text-red-600 font-semibold">+ Breeding Record</Text>
            </TouchableOpacity>
          )}

          {canManage && (
            <TouchableOpacity onPress={() => router.push(`/animals/${type}/${id}/edit` as any)} className="bg-blue-600 rounded-2xl py-3 items-center mb-3">
              <Text className="text-white font-semibold">Edit {config.singular}</Text>
            </TouchableOpacity>
          )}
          {canManage && (
            <TouchableOpacity onPress={confirmDelete} className="bg-red-50 rounded-2xl py-3 items-center mb-8">
              <Text className="text-red-600 font-semibold">Delete {config.singular}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
}
