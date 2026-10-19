import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { customersApi } from '../../src/api/endpoints';
import { Input } from '../../src/components/common/Input';
import { Button } from '../../src/components/common/Button';

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  mobile: z.string().min(10, 'Valid mobile number required'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  morningQuantity: z.string().optional(),
  eveningQuantity: z.string().optional(),
  milkType: z.string(),
  ratePerLiter: z.string().min(1, 'Rate required'),
  billingMode: z.string(),
}).refine(
  (data) => (parseFloat(data.morningQuantity || '0') || 0) + (parseFloat(data.eveningQuantity || '0') || 0) > 0,
  { message: 'Enter a morning or evening quantity', path: ['morningQuantity'] },
);

type FormData = z.infer<typeof schema>;

const milkTypes = ['Cow Milk', 'Buffalo Milk', 'Aavin Milk', 'Other'];
const billingModes = ['Monthly Full Check', 'Daily Check'];

export default function AddCustomerScreen() {
  const qc = useQueryClient();
  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      milkType: 'Cow Milk',
      billingMode: 'Monthly Full Check',
      morningQuantity: '',
      eveningQuantity: '',
    },
  });

  const mutation = useMutation({
    mutationFn: customersApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      Toast.show({ type: 'success', text1: 'Customer added successfully' });
      router.back();
    },
    onError: () => Toast.show({ type: 'error', text1: 'Failed to add customer' }),
  });

  const selectedMilkType = watch('milkType');
  const selectedBillingMode = watch('billingMode');

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white pt-14 pb-4 px-4 shadow-sm flex-row items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800 ml-4">Add Customer</Text>
        </View>

        <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
          <View className="bg-white rounded-2xl p-4 mb-4">
            <Text className="text-gray-700 font-semibold mb-4">Personal Info</Text>
            <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
              <Input label="Full Name" placeholder="e.g. Ramu Kumar" value={value ?? ''} onChangeText={onChange} error={errors.name?.message} required />
            )} />
            <Controller control={control} name="mobile" render={({ field: { onChange, value } }) => (
              <Input label="Mobile Number" placeholder="9999999999" value={value ?? ''} onChangeText={onChange} keyboardType="phone-pad" error={errors.mobile?.message} required />
            )} />
            <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
              <Input label="Email" placeholder="optional" value={value ?? ''} onChangeText={onChange} keyboardType="email-address" autoCapitalize="none" error={errors.email?.message} />
            )} />
            <Controller control={control} name="address" render={({ field: { onChange, value } }) => (
              <Input label="Address" placeholder="House address" value={value ?? ''} onChangeText={onChange} multiline numberOfLines={2} />
            )} />
          </View>

          <View className="bg-white rounded-2xl p-4 mb-4">
            <Text className="text-gray-700 font-semibold mb-4">Milk Details</Text>

            <Text className="text-sm font-medium text-gray-700 mb-2">Milk Type</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {milkTypes.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setValue('milkType', t)}
                  className={`px-3 py-2 rounded-xl border ${selectedMilkType === t ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'}`}
                >
                  <Text className={selectedMilkType === t ? 'text-white font-medium' : 'text-gray-600'}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-sm font-medium text-gray-700 mb-2">Milk Quantity (Liters)</Text>
            <Text className="text-xs text-gray-400 -mt-1 mb-2">
              Fill in morning, evening, or both — whichever this customer takes.
            </Text>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Controller control={control} name="morningQuantity" render={({ field: { onChange, value } }) => (
                  <Input label="Morning" placeholder="e.g. 1" value={String(value)} onChangeText={(text) => onChange(String(text))} keyboardType="decimal-pad" error={errors.morningQuantity?.message} />
                )} />
              </View>
              <View className="flex-1">
                <Controller control={control} name="eveningQuantity" render={({ field: { onChange, value } }) => (
                  <Input label="Evening" placeholder="e.g. 1" value={String(value)} onChangeText={(text) => onChange(String(text))} keyboardType="decimal-pad" />
                )} />
              </View>
            </View>
            <Controller control={control} name="ratePerLiter" render={({ field: { onChange, value } }) => (
              <Input label="Rate Per Liter (₹)" placeholder="e.g. 60" value={String(value ?? '')} onChangeText={(text) => onChange(String(text))} keyboardType="decimal-pad" error={errors.ratePerLiter?.message} required />
            )} />
          </View>

          <View className="bg-white rounded-2xl p-4 mb-6">
            <Text className="text-gray-700 font-semibold mb-4">Billing Mode</Text>
            {billingModes.map((mode) => (
              <TouchableOpacity
                key={mode}
                onPress={() => setValue('billingMode', mode)}
                className={`flex-row items-center p-3 rounded-xl mb-2 border ${selectedBillingMode === mode ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}
              >
                <View className={`w-5 h-5 rounded-full border-2 mr-3 ${selectedBillingMode === mode ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`} />
                <View className="flex-1">
                  <Text className={`font-medium ${selectedBillingMode === mode ? 'text-blue-600' : 'text-gray-700'}`}>{mode}</Text>
                  <Text className="text-xs text-gray-400 mt-0.5">
                    {mode === 'Monthly Full Check'
                      ? 'All days marked delivered; uncheck missed days'
                      : 'Mark each delivery day manually'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title="Add Customer"
            onPress={handleSubmit((data) => mutation.mutate(data))}
            loading={mutation.isPending}
            className="mb-8"
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
