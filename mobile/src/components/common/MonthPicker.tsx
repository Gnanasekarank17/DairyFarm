import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatMonthYear } from '../../utils/helpers';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface MonthPickerProps {
  year: number;
  month: number; // 1-12
  onChange: (year: number, month: number) => void;
  /** Earliest selectable year (default: current year - 5). */
  minYear?: number;
  /** Latest selectable year (default: current year + 1). */
  maxYear?: number;
  /** Do not allow picking months after the current month. */
  disableFuture?: boolean;
  /** Extra classes for the wrapper bar. */
  className?: string;
}

// Month selector: ‹ › arrows for quick stepping, plus tap-the-label to open a year/month grid
// so any month can be reached directly. Plain RN (Modal works on web too).
export function MonthPicker({ year, month, onChange, minYear, maxYear, disableFuture = false, className }: MonthPickerProps) {
  const now = new Date();
  const lo = minYear ?? now.getFullYear() - 5;
  const hi = maxYear ?? now.getFullYear() + 1;
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(year);

  const isFuture = (y: number, m: number) => disableFuture && (y > now.getFullYear() || (y === now.getFullYear() && m > now.getMonth() + 1));
  const isCurrent = (y: number, m: number) => y === now.getFullYear() && m === now.getMonth() + 1;

  const step = (delta: number) => {
    let m = month + delta; let y = year;
    if (m < 1) { m = 12; y -= 1; } else if (m > 12) { m = 1; y += 1; }
    if (y < lo || y > hi || isFuture(y, m)) return;
    onChange(y, m);
  };

  const openPicker = () => { setViewYear(year); setOpen(true); };
  const pick = (m: number) => { onChange(viewYear, m); setOpen(false); };

  return (
    <>
      <View className={`flex-row items-center justify-between bg-gray-100 rounded-xl p-2 ${className ?? ''}`}>
        <TouchableOpacity onPress={() => step(-1)} className="w-9 h-9 items-center justify-center" accessibilityLabel="Previous month">
          <Ionicons name="chevron-back" size={20} color="#374151" />
        </TouchableOpacity>
        <TouchableOpacity onPress={openPicker} className="flex-row items-center px-3 py-1.5 rounded-lg bg-white shadow-sm" activeOpacity={0.8} accessibilityLabel="Choose month">
          <Ionicons name="calendar-outline" size={16} color="#0F172A" />
          <Text className="font-semibold text-gray-800 ml-2">{formatMonthYear(year, month)}</Text>
          <Ionicons name="chevron-down" size={14} color="#64748B" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => step(1)} disabled={isFuture(month === 12 ? year + 1 : year, month === 12 ? 1 : month + 1)} className="w-9 h-9 items-center justify-center" accessibilityLabel="Next month">
          <Ionicons name="chevron-forward" size={20} color={isFuture(month === 12 ? year + 1 : year, month === 12 ? 1 : month + 1) ? '#CBD5E1' : '#374151'} />
        </TouchableOpacity>
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-black/40 items-center justify-center px-4" onPress={() => setOpen(false)}>
          <Pressable className="bg-white rounded-3xl p-4 w-full" style={{ maxWidth: 360 }} onPress={() => {}}>
            <View className="flex-row items-center justify-between mb-3">
              <TouchableOpacity onPress={() => setViewYear((y) => Math.max(lo, y - 1))} disabled={viewYear <= lo} className="w-9 h-9 items-center justify-center rounded-xl bg-gray-100">
                <Ionicons name="chevron-back" size={18} color={viewYear <= lo ? '#CBD5E1' : '#374151'} />
              </TouchableOpacity>
              <Text className="text-lg font-bold text-gray-800">{viewYear}</Text>
              <TouchableOpacity onPress={() => setViewYear((y) => Math.min(hi, y + 1))} disabled={viewYear >= hi} className="w-9 h-9 items-center justify-center rounded-xl bg-gray-100">
                <Ionicons name="chevron-forward" size={18} color={viewYear >= hi ? '#CBD5E1' : '#374151'} />
              </TouchableOpacity>
            </View>

            <View className="flex-row flex-wrap">
              {MONTHS.map((label, i) => {
                const m = i + 1;
                const selected = viewYear === year && m === month;
                const disabled = isFuture(viewYear, m);
                const current = isCurrent(viewYear, m);
                return (
                  <View key={label} style={{ width: '25%', padding: 4 }}>
                    <TouchableOpacity
                      onPress={() => pick(m)}
                      disabled={disabled}
                      className={`items-center justify-center rounded-xl py-3 border ${selected ? 'bg-slate-900 border-slate-900' : current ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-gray-200'} ${disabled ? 'opacity-40' : ''}`}
                    >
                      <Text className={`text-sm font-semibold ${selected ? 'text-white' : current ? 'text-emerald-700' : 'text-gray-700'}`}>{label}</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            <View className="flex-row justify-between items-center mt-3">
              <TouchableOpacity onPress={() => { onChange(now.getFullYear(), now.getMonth() + 1); setOpen(false); }} className="px-3 py-2 rounded-xl bg-emerald-50">
                <Text className="text-emerald-700 text-sm font-semibold">This month</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setOpen(false)} className="px-3 py-2">
                <Text className="text-gray-500 text-sm font-medium">Close</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
