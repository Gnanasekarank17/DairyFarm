import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  required?: boolean;
}

export const Input = ({ label, error, required, className = '', ...props }: InputProps) => (
  <View className="mb-4">
    {label && (
      <Text className="text-sm font-medium text-gray-700 mb-1">
        {label} {required && <Text className="text-red-500">*</Text>}
      </Text>
    )}
    <TextInput
      className={`border rounded-2xl px-4 py-3.5 text-gray-900 bg-white text-base shadow-sm
        ${error ? 'border-red-400' : 'border-slate-300'} ${className}`}
      placeholderTextColor="#9CA3AF"
      {...props}
    />
    {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
  </View>
);
