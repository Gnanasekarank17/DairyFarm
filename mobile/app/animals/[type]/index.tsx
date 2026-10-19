import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LoadingScreen } from '../../../src/components/common/LoadingScreen';
import { SimpleAnimalDataGrid } from '../../../src/components/grid/SimpleAnimalDataGrid';
import {
  SIMPLE_ANIMAL_CONFIG, SIMPLE_ANIMAL_STATUSES, BREEDING_ANIMAL_STATUSES, isSimpleAnimalTypeSlug,
  getWeightTrend, WEIGHT_TREND_LABEL, type WeightTrend,
} from '../../../src/config/simpleAnimals';
import type { SimpleAnimal } from '../../../src/types';

const GENDER_FILTERS = ['All', 'Female', 'Male'];
const WEIGHT_TREND_FILTERS: ('All' | WeightTrend)[] = ['All', 'gain', 'stable', 'loss'];

export default function SimpleAnimalListScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const [filter, setFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [weightTrendFilter, setWeightTrendFilter] = useState<'All' | WeightTrend>('All');

  if (!isSimpleAnimalTypeSlug(type)) return <Redirect href="/(tabs)/more" />;
  const config = SIMPLE_ANIMAL_CONFIG[type];
  const statusFilters = ['All', ...(config.hasBreeding ? BREEDING_ANIMAL_STATUSES : SIMPLE_ANIMAL_STATUSES)];

  const { data: fetchedAnimals = [], isLoading } = useQuery({
    queryKey: [type, filter, genderFilter],
    queryFn: () => config.api.getAll(
      filter === 'All' ? undefined : filter,
      config.hasGender && genderFilter !== 'All' ? genderFilter : undefined,
    ).then((r) => r.data.data as SimpleAnimal[]),
  });

  // Weight trend is derived (current vs previous weigh-in), not a stored/filterable column —
  // filter the already-fetched list client-side, cheap given typical herd sizes.
  const animals = (config.hasWeightTracking && weightTrendFilter !== 'All')
    ? fetchedAnimals.filter((a) => getWeightTrend(a.currentWeightKg, a.previousWeightKg) === weightTrendFilter)
    : fetchedAnimals;

  if (isLoading) return <LoadingScreen />;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xl font-bold text-gray-800">{config.label}</Text>
          <TouchableOpacity
            onPress={() => router.push(`/animals/${type}/add` as any)}
            style={{ backgroundColor: config.color }}
            className="rounded-full w-9 h-9 items-center justify-center"
          >
            <Ionicons name="add" size={22} color="white" />
          </TouchableOpacity>
        </View>

        <FlatList
          horizontal
          data={statusFilters}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setFilter(item)}
              className={`mr-2 px-4 py-2 rounded-full ${filter === item ? 'bg-slate-900' : 'bg-gray-100'}`}
            >
              <Text className={filter === item ? 'text-white font-medium' : 'text-gray-600'}>{item}</Text>
            </TouchableOpacity>
          )}
        />

        {config.hasGender && (
          <View className="flex-row gap-2 mt-3">
            {GENDER_FILTERS.map((g) => (
              <TouchableOpacity
                key={g}
                onPress={() => setGenderFilter(g)}
                className={`px-4 py-1.5 rounded-full ${genderFilter === g ? 'bg-slate-900' : 'bg-gray-100'}`}
              >
                <Text className={`text-sm ${genderFilter === g ? 'text-white font-medium' : 'text-gray-600'}`}>
                  {g === 'Female' ? '♀ Female' : g === 'Male' ? '♂ Male' : 'All'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {config.hasWeightTracking && (
          <View className="flex-row gap-2 mt-3">
            {WEIGHT_TREND_FILTERS.map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setWeightTrendFilter(t)}
                className={`px-4 py-1.5 rounded-full ${weightTrendFilter === t ? 'bg-slate-900' : 'bg-gray-100'}`}
              >
                <Text className={`text-sm ${weightTrendFilter === t ? 'text-white font-medium' : 'text-gray-600'}`}>
                  {t === 'All' ? 'All' : WEIGHT_TREND_LABEL[t]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <SimpleAnimalDataGrid type={type} config={config} animals={animals} />
    </View>
  );
}
