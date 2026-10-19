import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { paymentsApi } from '../../src/api/endpoints';
import { Input } from '../../src/components/common/Input';
import { Button } from '../../src/components/common/Button';

const PAYMENT_MODES = ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Other'];

export default function RecordPaymentScreen() {
  const { invoiceId, customerId, amount, name } = useLocalSearchParams<{
    invoiceId: string; customerId: string; amount: string; name: string;
  }>();
  const qc = useQueryClient();

  const { control, handleSubmit, setValue, watch } = useForm({
    defaultValues: { amountPaid: amount, paymentMode: 'Cash', notes: '' },
  });

  const selectedMode = watch('paymentMode');

  const mutation = useMutation({
    mutationFn: (data: any) => paymentsApi.record({
      invoiceId, customerId, ...data,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      Toast.show({ type: 'success', text1: 'Payment recorded' });
      router.back();
    },
    onError: () => Toast.show({ type: 'error', text1: 'Failed to record payment' }),
  });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
      <View className="flex-1 bg-gray-50">
        <View className="bg-white pt-14 pb-4 px-4 shadow-sm flex-row items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800 ml-4">Record Payment</Text>
        </View>

        <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
          <View className="bg-blue-50 rounded-2xl p-4 mb-4">
            <Text className="text-blue-600 font-semibold text-base">{name}</Text>
            <Text className="text-blue-800 text-2xl font-bold mt-1">₹{parseFloat(amount).toFixed(2)}</Text>
            <Text className="text-blue-500 text-sm">Amount Due</Text>
          </View>

          <View className="bg-white rounded-2xl p-4 mb-4">
            <Controller control={control} name="amountPaid" render={({ field: { onChange, value } }) => (
              <Input label="Amount Paid (₹)" value={value ?? ''} onChangeText={onChange} keyboardType="decimal-pad" required />
            )} />

            <Text className="text-sm font-medium text-gray-700 mb-2">Payment Mode</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {PAYMENT_MODES.map((mode) => (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setValue('paymentMode', mode)}
                  className={`px-3 py-2 rounded-xl border ${selectedMode === mode ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'}`}
                >
                  <Text className={selectedMode === mode ? 'text-white font-medium' : 'text-gray-600'}>{mode}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Controller control={control} name="notes" render={({ field: { onChange, value } }) => (
              <Input label="Notes" placeholder="Optional" value={value ?? ''} onChangeText={onChange} multiline numberOfLines={2} />
            )} />
          </View>

          <Button
            title="Record Payment"
            onPress={handleSubmit((data) => mutation.mutate(data))}
            loading={mutation.isPending}
            variant="success"
            className="mb-8"
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
