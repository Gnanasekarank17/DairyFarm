import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { calvingApi } from '../../src/api/endpoints';
import { Input } from '../../src/components/common/Input';
import { Button } from '../../src/components/common/Button';
import { today } from '../../src/utils/helpers';

const DELIVERY_TYPES = ['Normal', 'Assisted', 'Caesarean'];
const CALF_GENDERS = ['Female', 'Male'];

export default function RecordCalvingScreen() {
  const { pregnancyId, cowId } = useLocalSearchParams<{ pregnancyId: string; cowId: string }>();
  const qc = useQueryClient();
  const [calfCount, setCalfCount] = useState(1);
  const [calves, setCalves] = useState([{ name: '', gender: 'Female', birthWeight: '', healthStatus: 'Healthy', notes: '' }]);

  const { control, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      cowId,
      pregnancyId,
      deliveryDate: today(),
      deliveryType: 'Normal',
      complications: '',
      notes: '',
    },
  });

  const selectedDeliveryType = watch('deliveryType');

  const addCalf = () => {
    setCalfCount(c => c + 1);
    setCalves(prev => [...prev, { name: '', gender: 'Female', birthWeight: '', healthStatus: 'Healthy', notes: '' }]);
  };

  const updateCalf = (index: number, field: string, value: string) => {
    setCalves(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  const mutation = useMutation({
    mutationFn: (data: any) => calvingApi.record({ ...data, numberOfCalves: calfCount, calves }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cows'] });
      qc.invalidateQueries({ queryKey: ['pregnancies'] });
      Toast.show({ type: 'success', text1: 'Calving recorded successfully' });
      router.back();
    },
    onError: () => Toast.show({ type: 'error', text1: 'Failed to record calving' }),
  });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
      <View className="flex-1 bg-gray-50">
        <View className="bg-white pt-14 pb-4 px-4 shadow-sm flex-row items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800 ml-4">Record Calving</Text>
        </View>

        <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
          <View className="bg-white rounded-2xl p-4 mb-4">
            <Text className="text-gray-700 font-semibold mb-4">Delivery Details</Text>
            <Controller control={control} name="deliveryDate" render={({ field: { onChange, value } }) => (
              <Input label="Delivery Date" placeholder="YYYY-MM-DD" value={value ?? ''} onChangeText={onChange} required />
            )} />

            <Text className="text-sm font-medium text-gray-700 mb-2">Delivery Type</Text>
            <View className="flex-row gap-2 mb-4">
              {DELIVERY_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setValue('deliveryType', t)}
                  className={`flex-1 py-2.5 rounded-xl border items-center ${selectedDeliveryType === t ? 'bg-purple-600 border-purple-600' : 'bg-white border-gray-200'}`}
                >
                  <Text className={selectedDeliveryType === t ? 'text-white font-medium text-sm' : 'text-gray-600 text-sm'}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Controller control={control} name="complications" render={({ field: { onChange, value } }) => (
              <Input label="Complications" placeholder="Any complications during delivery" value={value ?? ''} onChangeText={onChange} multiline numberOfLines={2} />
            )} />
            <Controller control={control} name="notes" render={({ field: { onChange, value } }) => (
              <Input label="Notes" placeholder="Additional notes" value={value ?? ''} onChangeText={onChange} multiline numberOfLines={2} />
            )} />
          </View>

          {/* Calf Details */}
          {calves.map((calf, index) => (
            <View key={index} className="bg-white rounded-2xl p-4 mb-4">
              <Text className="text-gray-700 font-semibold mb-4">Calf {index + 1} Details</Text>
              <Input label="Calf Name" placeholder="Name (optional)" value={calf.name}
                onChangeText={(v) => updateCalf(index, 'name', v)} />

              <Text className="text-sm font-medium text-gray-700 mb-2">Gender</Text>
              <View className="flex-row gap-2 mb-4">
                {CALF_GENDERS.map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => updateCalf(index, 'gender', g)}
                    className={`flex-1 py-2.5 rounded-xl border items-center ${calf.gender === g ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'}`}
                  >
                    <Text className={calf.gender === g ? 'text-white font-medium' : 'text-gray-600'}>
                      {g === 'Female' ? '♀ Female' : '♂ Male'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Input label="Birth Weight (kg)" placeholder="e.g. 32" value={calf.birthWeight}
                onChangeText={(v) => updateCalf(index, 'birthWeight', v)} keyboardType="decimal-pad" />
              <Input label="Health Status" placeholder="e.g. Healthy, Weak" value={calf.healthStatus}
                onChangeText={(v) => updateCalf(index, 'healthStatus', v)} />
            </View>
          ))}

          <TouchableOpacity
            onPress={addCalf}
            className="border-2 border-dashed border-purple-300 rounded-2xl py-4 items-center mb-4"
          >
            <Ionicons name="add-circle-outline" size={24} color="#7C3AED" />
            <Text className="text-purple-600 font-medium mt-1">Add Another Calf</Text>
          </TouchableOpacity>

          <Button
            title="Record Calving"
            onPress={handleSubmit((data) => mutation.mutate(data))}
            loading={mutation.isPending}
            className="mb-8"
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
