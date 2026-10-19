import React from 'react';
import { View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}

export const Card = ({ children, className = '', style }: CardProps) => (
  <View
    className={`bg-white rounded-3xl shadow-sm border border-slate-200 p-4 ${className}`}
    style={style}
  >
    {children}
  </View>
);
