import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { milkApi } from '../../src/api/endpoints';
import { Input } from '../../src/components/common/Input';
import { Button } from '../../src/components/common/Button';
import { today } from '../../src/utils/helpers';

export default function AddMilkProductionScreen() {
  const { cowId } = useLocalSearchParams<{ cowId: string }>();
  const qc = useQueryClient();

  const { control, handleSubmit, watch } = useForm({
    defaultValues: { cowId, date: today(), morningMilk: '', eveningMilk: '', notes: '' },
  });

  const morning = parseFloat(watch('morningMilk') || '0');
  const evening = parseFloat(watch('eveningMilk') || '0');
  const total = morning + evening;

  const mutation = useMutation({
    mutationFn: milkApi.addEntry,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['milk-production'] });
      Toast.show({ type: 'success', text1: 'Milk production recorded' });
      router.back();
    },
    onError: () => Toast.show({ type: 'error', text1: 'Failed to record' }),
  });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
      <View className="flex-1 bg-gray-50">
        <View className="bg-white pt-14 pb-4 px-4 shadow-sm flex-row items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800 ml-4">Record Milk Production</Text>
        </View>

        <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
          <View className="bg-white rounded-2xl p-4 mb-4">
            <Controller control={control} name="date" render={({ field: { onChange, value } }) => (
              <Input label="Date" value={value ?? ''} onChangeText={onChange} required />
            )} />

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Controller control={control} name="morningMilk" render={({ field: { onChange, value } }) => (
                  <Input label="Morning (L)" placeholder="0.0" value={String(value ?? '')} onChangeText={(text) => onChange(String(text))} keyboardType="decimal-pad" />
                )} />
              </View>
              <View className="flex-1">
                <Controller control={control} name="eveningMilk" render={({ field: { onChange, value } }) => (
                  <Input label="Evening (L)" placeholder="0.0" value={String(value ?? '')} onChangeText={(text) => onChange(String(text))} keyboardType="decimal-pad" />
                )} />
              </View>
            </View>

            <View className="bg-blue-50 rounded-xl p-3 items-center mb-4">
              <Text className="text-blue-500 text-sm">Total Production</Text>
              <Text className="text-blue-700 text-2xl font-bold">{total.toFixed(1)} L</Text>
            </View>

            <Controller control={control} name="notes" render={({ field: { onChange, value } }) => (
              <Input label="Notes" placeholder="Optional notes" value={value ?? ''} onChangeText={onChange} multiline />
            )} />
          </View>

          <Button
            title="Save Production"
            onPress={handleSubmit((data) => mutation.mutate(data))}
            loading={mutation.isPending}
            className="mb-8"
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
