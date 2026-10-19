import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { breedingApi, cowsApi, goatsApi } from '../../src/api/endpoints';
import { Input } from '../../src/components/common/Input';
import { Button } from '../../src/components/common/Button';
import { today } from '../../src/utils/helpers';
import type { Cow, SimpleAnimal } from '../../src/types';

// Mirrors dbo.SpeciesBreedingConfig — kept here for the info box copy rather than adding a
// dedicated endpoint just to fetch two numbers per species.
const SPECIES_INFO: Record<string, { cycleDays: number; gestationLabel: string }> = {
  Cow: { cycleDays: 21, gestationLabel: '9 months 10 days' },
  Buffalo: { cycleDays: 21, gestationLabel: '9 months 10 days' },
  Goat: { cycleDays: 19, gestationLabel: '~150 days (145-155 day range)' },
};

type BredAnimal = { id: string; name: string; tagNumber?: string };

export default function AddBreedingScreen() {
  const { cowId: cowIdParam, species: speciesParam } = useLocalSearchParams<{ cowId: string; species: string }>();
  // Opened from an animal's own "+ Breeding Record" button: species/id are fixed by that animal.
  // Opened directly (e.g. from the tab bar): let the user pick the cattle type themselves.
  const [species, setSpecies] = useState<'Cow' | 'Goat'>(speciesParam === 'Goat' ? 'Goat' : 'Cow');
  const isGoat = species === 'Goat';
  const speciesInfo = SPECIES_INFO[species] || SPECIES_INFO.Cow;
  const qc = useQueryClient();

  const { control, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      cowId: cowIdParam ?? '',
      matingDate: today(),
      breedingMethod: 'Natural',
      bullName: '',
      technicianName: '',
      notes: '',
    },
  });

  const changeSpecies = (next: 'Cow' | 'Goat') => {
    setSpecies(next);
    setValue('cowId', '');
    setValue('bullName', '');
  };

  const selectedMethod = watch('breedingMethod');
  const bullName = watch('bullName');
  const cowId = watch('cowId');

  // Mating partners (bulls for Cow/Buffalo, bucks for Goat).
  const { data: cowBulls = [] } = useQuery({
    queryKey: ['cows', 'Male'],
    queryFn: () => cowsApi.getAll(undefined, 'Male').then((r) => r.data.data as Cow[]),
    enabled: !isGoat,
  });
  const { data: goatBucks = [] } = useQuery({
    queryKey: ['goats', 'Male'],
    queryFn: () => goatsApi.getAll(undefined, 'Male').then((r) => r.data.data as SimpleAnimal[]),
    enabled: isGoat,
  });
  const bulls: BredAnimal[] = isGoat ? goatBucks : cowBulls;

  // No cowId was passed in (e.g. screen opened directly, not via an animal's "Add breeding
  // record" button) — let the user pick which female animal this mating record is for.
  const { data: femaleCows = [] } = useQuery({
    queryKey: ['cows', 'Female'],
    queryFn: () => cowsApi.getAll(undefined, 'Female').then((r) => r.data.data as Cow[]),
    enabled: !cowIdParam && !isGoat,
  });
  const { data: femaleGoats = [] } = useQuery({
    queryKey: ['goats', 'Female'],
    queryFn: () => goatsApi.getAll(undefined, 'Female').then((r) => r.data.data as SimpleAnimal[]),
    enabled: !cowIdParam && isGoat,
  });
  const femaleAnimals: BredAnimal[] = isGoat ? femaleGoats : femaleCows;

  const mutation = useMutation({
    mutationFn: (data: any) => breedingApi.create({ ...data, species }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cows'] });
      qc.invalidateQueries({ queryKey: ['goats'] });
      qc.invalidateQueries({ queryKey: ['breeding', cowId] });
      Toast.show({ type: 'success', text1: 'Breeding record added' });
      router.back();
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || 'Failed to add breeding record';
      Toast.show({ type: 'error', text1: message });
    },
  });

  const onSubmit = handleSubmit((data) => {
    if (!data.cowId) {
      Toast.show({ type: 'error', text1: `Select a ${isGoat ? 'goat' : 'cow'} before adding a breeding record` });
      return;
    }
    mutation.mutate(data);
  });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
      <View className="flex-1 bg-gray-50">
        <View className="bg-white pt-14 pb-4 px-4 shadow-sm flex-row items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800 ml-4">Add Breeding Record</Text>
        </View>

        <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
          {!cowIdParam && (
            <View className="bg-white rounded-2xl p-4 mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Cattle Type</Text>
              <View className="flex-row gap-2 mb-4">
                {(['Cow', 'Goat'] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => changeSpecies(t)}
                    className={`flex-1 py-3 rounded-xl border items-center ${species === t ? 'bg-red-600 border-red-600' : 'bg-white border-gray-200'}`}
                  >
                    <Text className={species === t ? 'text-white font-medium' : 'text-gray-600'}>{t === 'Cow' ? '🐄 Cow' : '🐐 Goat'}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="text-sm font-medium text-gray-700 mb-2">{isGoat ? 'Goat' : 'Cow'} *</Text>
              {femaleAnimals.length === 0 ? (
                <Text className="text-sm text-gray-400">No female {isGoat ? 'goats' : 'cows'} found. Add {isGoat ? 'a goat' : 'a cow'} first.</Text>
              ) : (
                <View className="flex-row flex-wrap gap-2">
                  {femaleAnimals.map((animal) => (
                    <TouchableOpacity
                      key={animal.id}
                      onPress={() => setValue('cowId', animal.id)}
                      className={`px-3 py-2 rounded-xl border ${cowId === animal.id ? 'bg-red-600 border-red-600' : 'bg-white border-gray-200'}`}
                    >
                      <Text className={cowId === animal.id ? 'text-white font-medium' : 'text-gray-600'}>
                        {isGoat ? '🐐' : '🐄'} {animal.name}{animal.tagNumber ? ` (#${animal.tagNumber})` : ''}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          <View className="bg-white rounded-2xl p-4 mb-4">
            <Controller control={control} name="matingDate" render={({ field: { onChange, value } }) => (
              <Input label="Mating Date" placeholder="YYYY-MM-DD" value={value ?? ''} onChangeText={onChange} required />
            )} />

            <Text className="text-sm font-medium text-gray-700 mb-2">Breeding Method</Text>
            <View className="flex-row gap-2 mb-4">
              {['Natural', 'Artificial Insemination'].map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setValue('breedingMethod', m)}
                  className={`flex-1 py-3 rounded-xl border items-center ${selectedMethod === m ? 'bg-red-600 border-red-600' : 'bg-white border-gray-200'}`}
                >
                  <Text className={selectedMethod === m ? 'text-white font-medium' : 'text-gray-600'}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Controller control={control} name="bullName" render={({ field: { onChange, value } }) => (
              <Input label={isGoat ? 'Buck Name' : 'Bull Name'} placeholder={`Name of ${isGoat ? 'buck' : 'bull'}`} value={value ?? ''} onChangeText={onChange} />
            )} />
            {bulls.length > 0 && (
              <View className="mb-3 -mt-1">
                <Text className="text-xs text-slate-500 mb-2">Select a {isGoat ? 'buck' : 'bull'} from your herd (males only):</Text>
                <View className="flex-row flex-wrap gap-2">
                  {bulls.map((bull) => (
                    <TouchableOpacity
                      key={bull.id}
                      onPress={() => setValue('bullName', bull.name)}
                      className={`px-3 py-2 rounded-xl border ${bullName === bull.name ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'}`}
                    >
                      <Text className={bullName === bull.name ? 'text-white font-medium' : 'text-gray-600'}>{isGoat ? '🐐' : '🐂'} {bull.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            {selectedMethod === 'Artificial Insemination' && (
              <Controller control={control} name="technicianName" render={({ field: { onChange, value } }) => (
                <Input label="Technician Name" placeholder="AI technician" value={value ?? ''} onChangeText={onChange} />
              )} />
            )}
            <Controller control={control} name="notes" render={({ field: { onChange, value } }) => (
              <Input label="Notes" placeholder="Optional notes" value={value ?? ''} onChangeText={onChange} multiline numberOfLines={2} />
            )} />
          </View>

          <View className="bg-blue-50 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center">
              <Ionicons name="information-circle-outline" size={20} color="#2563EB" />
              <Text className="text-blue-700 font-medium ml-2">Mating Cycle</Text>
            </View>
            <Text className="text-blue-600 text-sm mt-1">
              A cycle check is scheduled {speciesInfo.cycleDays} days after mating. Admin, supervisor and caretaker are notified to confirm pregnancy or re-mate. Once confirmed, the delivery date is set to {speciesInfo.gestationLabel} from the mating date.
            </Text>
          </View>

          <Button
            title="Add Breeding Record"
            onPress={onSubmit}
            loading={mutation.isPending}
            className="mb-8"
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
