import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  style?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
}

const variants = {
  primary: { bg: 'bg-slate-900', text: 'text-white' },
  secondary: { bg: 'bg-slate-200', text: 'text-slate-800' },
  danger: { bg: 'bg-rose-600', text: 'text-white' },
  success: { bg: 'bg-emerald-600', text: 'text-white' },
  outline: { bg: 'bg-transparent border border-slate-900', text: 'text-slate-900' },
};

const sizes = {
  sm: { btn: 'px-3 py-2', text: 'text-sm' },
  md: { btn: 'px-5 py-3', text: 'text-base' },
  lg: { btn: 'px-6 py-4', text: 'text-lg' },
};

export const Button = ({
  title, onPress, variant = 'primary', loading, disabled, className = '', size = 'md'
}: ButtonProps) => {
  const v = variants[variant];
  const s = sizes[size];
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${v.bg} ${s.btn} rounded-2xl items-center justify-center flex-row shadow-sm ${disabled ? 'opacity-50' : ''} ${className}`}
      activeOpacity={0.8}
    >
      {loading && <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />}
      <Text className={`${v.text} ${s.text} font-semibold`}>{title}</Text>
    </TouchableOpacity>
  );
};
