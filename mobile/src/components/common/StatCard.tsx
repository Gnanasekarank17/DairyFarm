import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  bgColor: string;
  iconColor: string;
  textColor?: string;
  subtitle?: string;
}

export const StatCard = ({
  title, value, icon, bgColor, iconColor, textColor = '#0F172A', subtitle
}: StatCardProps) => (
  <View className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex-1 min-w-[45%]">
    <View className="flex-row items-start justify-between">
      <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider flex-1" numberOfLines={1}>
        {title}
      </Text>
      <View className="w-9 h-9 rounded-[10px] items-center justify-center ml-2" style={{ backgroundColor: bgColor }}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
    </View>
    <Text className="text-2xl font-extrabold mt-2" style={{ color: textColor }}>{value}</Text>
    {subtitle && <Text className="text-xs text-slate-400 mt-0.5">{subtitle}</Text>}
  </View>
);
