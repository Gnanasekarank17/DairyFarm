import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { cowsApi } from '../../src/api/endpoints';
import { Input } from '../../src/components/common/Input';
import { Button } from '../../src/components/common/Button';

const COW_STATUSES = ['Active', 'Pregnant', 'Dry Period', 'Sold', 'Deceased'];

const ANIMAL_TYPES = ['Cow', 'Buffalo'];

interface CowFormData {
  name: string;
  tagNumber?: string;
  breed?: string;
  color?: string;
  gender: string;
  animalType: string;
  dateOfBirth?: string;
  purchaseDate?: string;
  purchaseCost?: string;
  currentStatus: string;
  notes?: string;
}

export default function AddCowScreen() {
  const qc = useQueryClient();
  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<CowFormData>({
    defaultValues: { currentStatus: 'Active', gender: 'Female', animalType: 'Cow' },
  });

  const selectedStatus = watch('currentStatus');
  const selectedGender = watch('gender');
  const selectedAnimalType = watch('animalType');

  const mutation = useMutation({
    mutationFn: cowsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cows'] });
      Toast.show({ type: 'success', text1: 'Cow added successfully' });
      router.back();
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || 'Failed to add cow';
      Toast.show({ type: 'error', text1: message });
    },
  });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
      <View className="flex-1 bg-gray-50">
        <View className="bg-white pt-14 pb-4 px-4 shadow-sm flex-row items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800 ml-4">Add Cow</Text>
        </View>

        <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
          <View className="bg-white rounded-2xl p-4 mb-4">
            <Text className="text-gray-700 font-semibold mb-4">Cow Details</Text>
            <Controller control={control} name="name" rules={{ required: 'Name required' }} render={({ field: { onChange, value } }) => (
              <Input label="Cow Name" placeholder="e.g. Lakshmi" value={value ?? ''} onChangeText={onChange} error={errors.name?.message} required />
            )} />
            <Controller control={control} name="tagNumber" render={({ field: { onChange, value } }) => (
              <Input label="Tag Number" placeholder="e.g. T001" value={value ?? ''} onChangeText={onChange} />
            )} />
            <Text className="text-xs text-slate-500 -mt-2 mb-2">Tag number must be unique if provided.</Text>
            <Controller control={control} name="breed" render={({ field: { onChange, value } }) => (
              <Input label="Breed" placeholder="e.g. Holstein, Gir, Murrah" value={value ?? ''} onChangeText={onChange} />
            )} />
            <Controller control={control} name="color" render={({ field: { onChange, value } }) => (
              <Input label="Color" placeholder="e.g. Black & White" value={value ?? ''} onChangeText={onChange} />
            )} />
            <Text className="text-sm font-medium text-gray-700 mb-2 mt-1">Animal Type</Text>
            <View className="flex-row gap-2 mb-4">
              {ANIMAL_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setValue('animalType', t, { shouldDirty: true })}
                  className={`flex-1 px-3 py-2 rounded-xl border items-center ${selectedAnimalType === t ? 'bg-purple-600 border-purple-600' : 'bg-white border-gray-200'}`}
                >
                  <Text className={selectedAnimalType === t ? 'text-white font-medium' : 'text-gray-600'}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text className="text-sm font-medium text-gray-700 mb-2 mt-1">Gender</Text>
            <View className="flex-row gap-2 mb-1">
              {['Female', 'Male'].map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => setValue('gender', g, { shouldDirty: true })}
                  className={`flex-1 px-3 py-2 rounded-xl border items-center ${selectedGender === g ? 'bg-purple-600 border-purple-600' : 'bg-white border-gray-200'}`}
                >
                  <Text className={selectedGender === g ? 'text-white font-medium' : 'text-gray-600'}>
                    {g === 'Female' ? '♀ Female' : '♂ Male (Bull)'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text className="text-xs text-slate-500 mb-1">Males are bulls used for mating only — they are excluded from milk production.</Text>
          </View>

          <View className="bg-white rounded-2xl p-4 mb-4">
            <Text className="text-gray-700 font-semibold mb-4">Dates & Cost</Text>
            <Controller control={control} name="dateOfBirth" render={({ field: { onChange, value } }) => (
              <Input label="Date of Birth" placeholder="YYYY-MM-DD" value={value ?? ''} onChangeText={onChange} />
            )} />
            <Controller control={control} name="purchaseDate" render={({ field: { onChange, value } }) => (
              <Input label="Purchase Date" placeholder="YYYY-MM-DD" value={value ?? ''} onChangeText={onChange} />
            )} />
            <Controller control={control} name="purchaseCost" render={({ field: { onChange, value } }) => (
              <Input label="Purchase Cost (₹)" placeholder="e.g. 50000" value={value ?? ''} onChangeText={onChange} keyboardType="numeric" />
            )} />
          </View>

          <View className="bg-white rounded-2xl p-4 mb-4">
            <Text className="text-gray-700 font-semibold mb-3">Current Status</Text>
            <Text className="text-xs text-slate-500 mb-2">Available: Active, Pregnant, Dry Period, Sold, Deceased</Text>
            <View className="flex-row flex-wrap gap-2">
              {COW_STATUSES.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setValue('currentStatus', s, { shouldDirty: true })}
                  className={`px-3 py-2 rounded-xl border ${selectedStatus === s ? 'bg-purple-600 border-purple-600' : 'bg-white border-gray-200'}`}
                >
                  <Text className={selectedStatus === s ? 'text-white font-medium' : 'text-gray-600'}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="bg-white rounded-2xl p-4 mb-6">
            <Controller control={control} name="notes" render={({ field: { onChange, value } }) => (
              <Input label="Notes" placeholder="Any additional notes" value={value ?? ''} onChangeText={onChange} multiline numberOfLines={3} />
            )} />
          </View>

          <Button
            title="Add Cow"
            onPress={handleSubmit((data) => mutation.mutate(data))}
            loading={mutation.isPending}
            className="mb-8"
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
