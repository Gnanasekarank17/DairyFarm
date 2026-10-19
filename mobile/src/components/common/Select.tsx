import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface SelectOption {
  label: string;
  value: string;
  /** Optional accent colour dot shown before the label. */
  color?: string;
  /** Render this option in an emphasised style (e.g. "+ Add new"). */
  accent?: boolean;
}

export interface SelectProps {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

// Native dropdown: a field that opens a bottom-sheet list. Web uses Select.web.tsx (<select>).
export function Select({ label, value, options, onChange, placeholder = 'Select…', required, error, disabled }: SelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View className="mb-4">
      {label ? (
        <Text className="text-sm font-medium text-gray-700 mb-1.5">
          {label}{required ? <Text className="text-red-500"> *</Text> : null}
        </Text>
      ) : null}
      <TouchableOpacity
        onPress={() => !disabled && setOpen(true)}
        activeOpacity={0.8}
        className={`flex-row items-center border rounded-2xl px-4 py-3.5 bg-white ${error ? 'border-red-400' : 'border-slate-300'} ${disabled ? 'opacity-60' : ''}`}
      >
        {selected?.color ? <View className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: selected.color }} /> : null}
        <Text className={`flex-1 text-base ${selected ? 'text-gray-900' : 'text-gray-400'}`} numberOfLines={1}>
          {selected?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#64748B" />
      </TouchableOpacity>
      {error ? <Text className="text-red-500 text-xs mt-1">{error}</Text> : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setOpen(false)}>
          <Pressable className="bg-white rounded-t-3xl max-h-[70%] pb-6" onPress={() => {}}>
            <View className="items-center pt-3 pb-1">
              <View className="w-10 h-1 rounded-full bg-gray-300" />
            </View>
            {label ? <Text className="text-gray-800 font-semibold text-base px-5 py-2">{label}</Text> : null}
            <FlatList
              data={options}
              keyExtractor={(o) => o.value}
              renderItem={({ item }) => {
                const active = item.value === value;
                return (
                  <TouchableOpacity
                    onPress={() => { onChange(item.value); setOpen(false); }}
                    className={`flex-row items-center px-5 py-3.5 border-b border-gray-100 ${active ? 'bg-slate-50' : ''}`}
                  >
                    {item.color ? <View className="w-2.5 h-2.5 rounded-full mr-3" style={{ backgroundColor: item.color }} /> : null}
                    <Text className={`flex-1 text-base ${item.accent ? 'text-blue-600 font-semibold' : active ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
                      {item.label}
                    </Text>
                    {active ? <Ionicons name="checkmark" size={18} color="#0F172A" /> : null}
                  </TouchableOpacity>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
