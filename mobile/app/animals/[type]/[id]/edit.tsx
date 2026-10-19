import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Input } from '../../../../src/components/common/Input';
import { Button } from '../../../../src/components/common/Button';
import { LoadingScreen } from '../../../../src/components/common/LoadingScreen';
import { SIMPLE_ANIMAL_CONFIG, SIMPLE_ANIMAL_STATUSES, BREEDING_ANIMAL_STATUSES, isSimpleAnimalTypeSlug } from '../../../../src/config/simpleAnimals';
import type { SimpleAnimal } from '../../../../src/types';

interface SimpleAnimalFormData {
  name: string;
  tagNumber?: string;
  breed?: string;
  color?: string;
  gender?: string;
  dateOfBirth?: string;
  purchaseDate?: string;
  purchaseCost?: string;
  currentStatus: string;
  notes?: string;
}

export default function EditSimpleAnimalScreen() {
  const { type, id } = useLocalSearchParams<{ type: string; id: string }>();
  const qc = useQueryClient();

  if (!isSimpleAnimalTypeSlug(type)) return <Redirect href="/(tabs)/more" />;
  const config = SIMPLE_ANIMAL_CONFIG[type];
  const statuses = config.hasBreeding ? BREEDING_ANIMAL_STATUSES : SIMPLE_ANIMAL_STATUSES;

  const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<SimpleAnimalFormData>({
    defaultValues: { currentStatus: 'Active', gender: 'Female' },
  });
  const selectedStatus = watch('currentStatus');
  const selectedGender = watch('gender');

  const { data: animal, isLoading } = useQuery({
    queryKey: [type, id],
    queryFn: () => config.api.getById(id!).then((r) => r.data.data as SimpleAnimal),
    enabled: !!id,
  });

  useEffect(() => {
    if (animal) {
      reset({
        name: animal.name || '',
        tagNumber: animal.tagNumber || '',
        breed: animal.breed || '',
        color: animal.color || '',
        gender: animal.gender || 'Female',
        dateOfBirth: (animal.dateOfBirth || '').slice(0, 10),
        purchaseDate: (animal.purchaseDate || '').slice(0, 10),
        purchaseCost: animal.purchaseCost ? String(animal.purchaseCost) : '',
        currentStatus: animal.currentStatus || 'Active',
        notes: animal.notes || '',
      });
    }
  }, [animal, reset]);

  const mutation = useMutation({
    mutationFn: (data: SimpleAnimalFormData) => config.api.update(id!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [type] });
      qc.invalidateQueries({ queryKey: [type, id] });
      Toast.show({ type: 'success', text1: `${config.singular} updated` });
      router.back();
    },
    onError: (err: any) => Toast.show({ type: 'error', text1: err?.response?.data?.message || `Failed to update ${config.singular.toLowerCase()}` }),
  });

  if (isLoading) return <LoadingScreen />;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
      <View className="flex-1 bg-gray-50">
        <View className="bg-white pt-14 pb-4 px-4 shadow-sm flex-row items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800 ml-4">Edit {config.singular}</Text>
        </View>

        <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
          <View className="bg-white rounded-2xl p-4 mb-4">
            <Text className="text-gray-700 font-semibold mb-4">{config.singular} Details</Text>
            <Controller control={control} name="name" rules={{ required: 'Name required' }} render={({ field: { onChange, value } }) => (
              <Input label="Name" placeholder={`e.g. ${config.singular}'s name`} value={value ?? ''} onChangeText={onChange} error={errors.name?.message} required />
            )} />
            <Controller control={control} name="tagNumber" render={({ field: { onChange, value } }) => (
              <Input label="Tag Number" placeholder="e.g. T001" value={value ?? ''} onChangeText={onChange} />
            )} />
            <Controller control={control} name="breed" render={({ field: { onChange, value } }) => (
              <Input label="Breed" placeholder="Breed" value={value ?? ''} onChangeText={onChange} />
            )} />
            <Controller control={control} name="color" render={({ field: { onChange, value } }) => (
              <Input label="Color" placeholder="e.g. Black & White" value={value ?? ''} onChangeText={onChange} />
            )} />
            {config.hasGender && (
              <>
                <Text className="text-sm font-medium text-gray-700 mb-2 mt-1">Gender</Text>
                <View className="flex-row gap-2 mb-1">
                  {['Female', 'Male'].map((g) => (
                    <TouchableOpacity
                      key={g}
                      onPress={() => setValue('gender', g, { shouldDirty: true })}
                      className={`flex-1 px-3 py-2 rounded-xl border items-center ${selectedGender === g ? 'border-transparent' : 'bg-white border-gray-200'}`}
                      style={selectedGender === g ? { backgroundColor: config.color } : undefined}
                    >
                      <Text className={selectedGender === g ? 'text-white font-medium' : 'text-gray-600'}>
                        {g === 'Female' ? '♀ Female (Doe)' : '♂ Male (Buck)'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
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
              <Input label="Purchase Cost (₹)" placeholder="e.g. 5000" value={value ?? ''} onChangeText={onChange} keyboardType="numeric" />
            )} />
          </View>

          <View className="bg-white rounded-2xl p-4 mb-4">
            <Text className="text-gray-700 font-semibold mb-3">Current Status</Text>
            <View className="flex-row flex-wrap gap-2">
              {statuses.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setValue('currentStatus', s, { shouldDirty: true })}
                  className={`px-3 py-2 rounded-xl border ${selectedStatus === s ? 'border-transparent' : 'bg-white border-gray-200'}`}
                  style={selectedStatus === s ? { backgroundColor: config.color } : undefined}
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
            title="Save Changes"
            onPress={handleSubmit((data) => mutation.mutate(data))}
            loading={mutation.isPending}
            className="mb-8"
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
