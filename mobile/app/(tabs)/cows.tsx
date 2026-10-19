import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { cowsApi } from '../../src/api/endpoints';
import { LoadingScreen } from '../../src/components/common/LoadingScreen';
import { CowsDataGrid } from '../../src/components/grid/CowsDataGrid';
import type { Cow } from '../../src/types';

const COW_STATUS_FILTERS = ['All', 'Active', 'Mated', 'Pregnant', 'Dry Period', 'Sold', 'Deceased'];
const COW_GENDER_FILTERS = ['All', 'Female', 'Male'];
const ANIMAL_TYPE_FILTERS = ['All', 'Cow', 'Buffalo'];

export default function CowsTab() {
  const [filter, setFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [animalTypeFilter, setAnimalTypeFilter] = useState('All');

  const { data: cows = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['cows', filter, genderFilter, animalTypeFilter],
    queryFn: () => cowsApi.getAll(
      filter === 'All' ? undefined : filter,
      genderFilter === 'All' ? undefined : genderFilter,
      animalTypeFilter === 'All' ? undefined : animalTypeFilter,
    ).then((r) => r.data.data as Cow[]),
  });

  if (isLoading) return <LoadingScreen />;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xl font-bold text-gray-800">Cow Management</Text>
          <TouchableOpacity
            onPress={() => router.push('/cows/new')}
            className="bg-purple-600 rounded-full w-9 h-9 items-center justify-center"
          >
            <Ionicons name="add" size={22} color="white" />
          </TouchableOpacity>
        </View>

        {/* Filter tabs */}
        <FlatList
          horizontal
          data={COW_STATUS_FILTERS}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setFilter(item)}
              className={`mr-2 px-4 py-2 rounded-full ${filter === item ? 'bg-purple-600' : 'bg-gray-100'}`}
            >
              <Text className={filter === item ? 'text-white font-medium' : 'text-gray-600'}>{item}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Gender filter */}
        <View className="flex-row gap-2 mt-3">
          {COW_GENDER_FILTERS.map((g) => (
            <TouchableOpacity
              key={g}
              onPress={() => setGenderFilter(g)}
              className={`px-4 py-1.5 rounded-full ${genderFilter === g ? 'bg-slate-900' : 'bg-gray-100'}`}
            >
              <Text className={`text-sm ${genderFilter === g ? 'text-white font-medium' : 'text-gray-600'}`}>
                {g === 'Female' ? '♀ Female' : g === 'Male' ? '♂ Bulls' : 'All'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Animal type filter (Cow vs Buffalo) */}
        <View className="flex-row gap-2 mt-2">
          {ANIMAL_TYPE_FILTERS.map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setAnimalTypeFilter(t)}
              className={`px-4 py-1.5 rounded-full ${animalTypeFilter === t ? 'bg-purple-600' : 'bg-gray-100'}`}
            >
              <Text className={`text-sm ${animalTypeFilter === t ? 'text-white font-medium' : 'text-gray-600'}`}>
                {t === 'Cow' ? '🐄 Cow' : t === 'Buffalo' ? '🐃 Buffalo' : 'All'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick links */}
      <View className="flex-row gap-2 px-4 py-3">
        {[
          { label: 'Breeding', href: '/breeding', icon: 'heart-outline', color: '#DC2626' },
          { label: 'Pregnancies', href: '/breeding/pregnancies', icon: 'leaf-outline', color: '#7C3AED' },
          { label: 'Calving', href: '/calving/record', icon: 'happy-outline', color: '#D97706' },
          { label: 'Milk', href: '/milk/add', icon: 'water-outline', color: '#2563EB' },
        ].map((action) => (
          <TouchableOpacity
            key={action.label}
            onPress={() => router.push(action.href as any)}
            className="flex-1 bg-white rounded-xl p-2 items-center shadow-sm"
          >
            <Ionicons name={action.icon as any} size={18} color={action.color} />
            <Text className="text-gray-600 text-xs mt-1">{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <CowsDataGrid cows={cows} refreshing={isRefetching} onRefresh={refetch} />
    </View>
  );
}
