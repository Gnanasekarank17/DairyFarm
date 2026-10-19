import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { medicinesApi } from '../../src/api/endpoints';
import { Input } from '../../src/components/common/Input';
import { Button } from '../../src/components/common/Button';
import { LoadingScreen } from '../../src/components/common/LoadingScreen';
import { EmptyState } from '../../src/components/common/EmptyState';
import type { MedicineMaster } from '../../src/types';

const ANIMAL_TYPE_OPTIONS = [
  { value: 'Cow', label: '🐄 Cow' },
  { value: 'Goat', label: '🐐 Goat' },
  { value: 'Hen', label: '🐔 Hen' },
  { value: 'Duck', label: '🦆 Duck' },
];

interface FormValues {
  name: string;
  dosageMg: string;
  purpose: string;
  comments: string;
  animalTypes: string[];
}

const EMPTY_FORM: FormValues = { name: '', dosageMg: '', purpose: '', comments: '', animalTypes: [] };

export default function MedicineDetailsScreen() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { control, handleSubmit, reset, watch, setValue } = useForm<FormValues>({ defaultValues: EMPTY_FORM });
  const selectedAnimalTypes = watch('animalTypes');

  const toggleAnimalType = (value: string) => {
    setValue(
      'animalTypes',
      selectedAnimalTypes.includes(value)
        ? selectedAnimalTypes.filter((t) => t !== value)
        : [...selectedAnimalTypes, value],
    );
  };

  const { data: medicines = [], isLoading } = useQuery({
    queryKey: ['medicines'],
    queryFn: () => medicinesApi.getAll().then((r) => r.data.data as MedicineMaster[]),
  });

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    reset(EMPTY_FORM);
  };

  const saveMutation = useMutation({
    mutationFn: (data: FormValues) => {
      const payload = { ...data, dosageMg: data.dosageMg || undefined, animalTypes: data.animalTypes.join(',') };
      return editingId ? medicinesApi.update(editingId, payload) : medicinesApi.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medicines'] });
      Toast.show({ type: 'success', text1: editingId ? 'Medicine updated' : 'Medicine added' });
      closeForm();
    },
    onError: (err: any) => Toast.show({
      type: 'error',
      text1: err?.response?.data?.message || 'Failed to save medicine',
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => medicinesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medicines'] });
      Toast.show({ type: 'success', text1: 'Medicine deleted' });
    },
    onError: () => Toast.show({ type: 'error', text1: 'Failed to delete medicine' }),
  });

  const startEdit = (medicine: MedicineMaster) => {
    setEditingId(medicine.id);
    reset({
      name: medicine.name,
      dosageMg: medicine.dosageMg !== undefined && medicine.dosageMg !== null ? String(medicine.dosageMg) : '',
      purpose: medicine.purpose || '',
      comments: medicine.comments || '',
      animalTypes: medicine.animalTypes ? medicine.animalTypes.split(',').filter(Boolean) : [],
    });
    setFormOpen(true);
  };

  const confirmDelete = (medicine: MedicineMaster) => {
    Alert.alert('Delete Medicine', `Remove "${medicine.name}" from the medicine list?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(medicine.id) },
    ]);
  };

  const onSubmit = (data: FormValues) => {
    if (!data.name.trim()) {
      Alert.alert('Name required', 'Please enter the medicine name.');
      return;
    }
    saveMutation.mutate(data);
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
      <View className="flex-1 bg-gray-50">
        <View className="bg-white pt-14 pb-4 px-4 shadow-sm flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-800 ml-4">Medicine Details</Text>
          </View>
          <TouchableOpacity
            onPress={() => (formOpen ? closeForm() : setFormOpen(true))}
            className={`rounded-full w-9 h-9 items-center justify-center ${formOpen ? 'bg-gray-200' : 'bg-blue-600'}`}
          >
            <Ionicons name={formOpen ? 'close' : 'add'} size={22} color={formOpen ? '#374151' : 'white'} />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
          {formOpen && (
            <View className="bg-white rounded-2xl p-4 mb-4 border border-blue-100">
              <Text className="text-gray-700 font-semibold mb-3">{editingId ? 'Edit Medicine' : 'Add Medicine'}</Text>

              <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
                <Input label="Medicine Name" placeholder="e.g. Oxytetracycline" value={value} onChangeText={onChange} required />
              )} />

              <Controller control={control} name="dosageMg" render={({ field: { onChange, value } }) => (
                <Input label="Dosage (mg)" placeholder="e.g. 500" value={value} onChangeText={onChange} keyboardType="decimal-pad" />
              )} />

              <Text className="text-sm font-medium text-gray-700 mb-2">Cattle Type</Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {ANIMAL_TYPE_OPTIONS.map((opt) => {
                  const selected = selectedAnimalTypes.includes(opt.value);
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => toggleAnimalType(opt.value)}
                      className={`px-3 py-2 rounded-xl border ${selected ? 'bg-red-600 border-red-600' : 'bg-white border-gray-200'}`}
                    >
                      <Text className={selected ? 'text-white font-medium' : 'text-gray-600'}>{opt.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Controller control={control} name="purpose" render={({ field: { onChange, value } }) => (
                <Input label="Purpose" placeholder="What is this medicine used for?" value={value} onChangeText={onChange} multiline numberOfLines={2} />
              )} />

              <Controller control={control} name="comments" render={({ field: { onChange, value } }) => (
                <Input label="Comments" placeholder="Optional notes" value={value} onChangeText={onChange} multiline numberOfLines={2} />
              )} />

              <View className="flex-row gap-3 mt-1">
                <Button title="Cancel" onPress={closeForm} variant="secondary" className="flex-1" />
                <Button
                  title={editingId ? 'Update' : 'Save'}
                  onPress={handleSubmit(onSubmit)}
                  loading={saveMutation.isPending}
                  variant="success"
                  className="flex-1"
                />
              </View>
            </View>
          )}

          {medicines.length === 0 ? (
            <EmptyState icon="medkit-outline" title="No medicines added" subtitle="Add medicine name, dosage, cattle type, purpose and comments." />
          ) : (
            <View className="gap-3 pb-8">
              {medicines.map((medicine) => (
                <TouchableOpacity
                  key={medicine.id}
                  onPress={() => startEdit(medicine)}
                  onLongPress={() => confirmDelete(medicine)}
                  activeOpacity={0.8}
                  className="bg-white rounded-2xl p-4 shadow-sm"
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-row items-center flex-1">
                      <View className="w-9 h-9 rounded-xl items-center justify-center mr-3 bg-red-50">
                        <Ionicons name="medkit-outline" size={18} color="#DC2626" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-800 font-semibold text-base">{medicine.name}</Text>
                        {medicine.dosageMg !== undefined && medicine.dosageMg !== null && medicine.dosageMg !== '' && (
                          <Text className="text-blue-600 text-xs font-medium mt-0.5">{medicine.dosageMg} mg</Text>
                        )}
                      </View>
                    </View>
                  </View>
                  {medicine.animalTypes ? (
                    <View className="flex-row flex-wrap gap-1.5 mt-2">
                      {medicine.animalTypes.split(',').filter(Boolean).map((t) => {
                        const opt = ANIMAL_TYPE_OPTIONS.find((o) => o.value === t);
                        return (
                          <View key={t} className="px-2 py-0.5 rounded-full bg-red-50">
                            <Text className="text-red-600 text-xs font-medium">{opt?.label || t}</Text>
                          </View>
                        );
                      })}
                    </View>
                  ) : null}
                  {medicine.purpose ? (
                    <Text className="text-gray-600 text-sm mt-3">
                      <Text className="text-gray-400">Purpose: </Text>{medicine.purpose}
                    </Text>
                  ) : null}
                  {medicine.comments ? (
                    <Text className="text-gray-500 text-sm mt-1">
                      <Text className="text-gray-400">Comments: </Text>{medicine.comments}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
