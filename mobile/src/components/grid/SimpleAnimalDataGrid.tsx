import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { EmptyState } from '../common/EmptyState';
import { getWeightTrend, WEIGHT_TREND_COLOR, type SimpleAnimalTypeSlug, type SimpleAnimalConfig } from '../../config/simpleAnimals';
import type { SimpleAnimal } from '../../types';

interface SimpleAnimalDataGridProps {
  type: SimpleAnimalTypeSlug;
  config: SimpleAnimalConfig;
  animals: SimpleAnimal[];
}

// Native has no grid library — a simple tappable list; row detail (incl. weight history/edit
// for Goat) lives on the detail screen at /animals/[type]/[id]. See the .web.tsx sibling for
// the EnterpriseGrid-based web version with inline-editable cells.
export function SimpleAnimalDataGrid({ type, config, animals }: SimpleAnimalDataGridProps) {
  if (animals.length === 0) {
    return (
      <EmptyState icon={config.icon} title={`No ${config.label.toLowerCase()} found`} subtitle={`Add your first ${config.singular.toLowerCase()} to get started.`} />
    );
  }

  return (
    <FlatList
      data={animals}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => router.push(`/animals/${type}/${item.id}` as any)}
          className="bg-white rounded-2xl p-4 mb-3 shadow-sm flex-row items-center"
        >
          <Text className="text-3xl mr-3">{config.emoji}</Text>
          <View className="flex-1">
            <Text className="text-gray-800 font-semibold text-base">{item.name}</Text>
            <Text className="text-gray-400 text-xs mt-0.5">
              {item.tagNumber ? `#${item.tagNumber} · ` : ''}{item.breed || config.singular}
              {config.hasWeightTracking && item.currentWeightKg ? (
                <Text style={{ color: WEIGHT_TREND_COLOR[getWeightTrend(item.currentWeightKg, item.previousWeightKg)], fontWeight: '600' }}>
                  {' · '}{Number(item.currentWeightKg).toFixed(1)} kg
                </Text>
              ) : null}
            </Text>
          </View>
          <Text className="text-gray-400 text-xs">{item.currentStatus}</Text>
        </TouchableOpacity>
      )}
    />
  );
}
