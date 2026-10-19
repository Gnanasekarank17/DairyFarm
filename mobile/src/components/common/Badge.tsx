import React from 'react';
import { View, Text } from 'react-native';

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'purple';

const styles: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: 'bg-green-100', text: 'text-green-700' },
  error: { bg: 'bg-red-100', text: 'text-red-700' },
  warning: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  info: { bg: 'bg-blue-100', text: 'text-blue-700' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700' },
};

export const Badge = ({ label, variant = 'info' }: { label: string; variant?: BadgeVariant }) => {
  const s = styles[variant];
  return (
    <View className={`${s.bg} px-2 py-0.5 rounded-full self-start`}>
      <Text className={`${s.text} text-xs font-medium`}>{label}</Text>
    </View>
  );
};
