import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}

export const EmptyState = ({ icon = 'document-outline', title, subtitle }: EmptyStateProps) => (
  <View className="flex-1 items-center justify-center py-16">
    <Ionicons name={icon} size={64} color="#D1D5DB" />
    <Text className="text-gray-500 text-lg font-medium mt-4">{title}</Text>
    {subtitle && <Text className="text-gray-400 text-sm mt-2 text-center px-8">{subtitle}</Text>}
  </View>
);
