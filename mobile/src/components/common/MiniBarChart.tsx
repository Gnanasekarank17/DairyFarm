import React from 'react';
import { View, Text } from 'react-native';
import type { FinanceTrendPoint } from '../../types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const INCOME_COLOR = '#16A34A';
export const EXPENSE_COLOR = '#DC2626';

const compact = (n: number) => {
  const abs = Math.abs(n);
  if (abs >= 1_00_00_000) return `${(n / 1_00_00_000).toFixed(1)}Cr`;
  if (abs >= 1_00_000) return `${(n / 1_00_000).toFixed(1)}L`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}k`;
  return `${Math.round(n)}`;
};

interface MiniBarChartProps {
  data: FinanceTrendPoint[];
  /** Height of the bar area in px. */
  height?: number;
  /** Highlight this month (1-12) with a darker label. */
  highlightMonth?: number;
  showValues?: boolean;
}

// Grouped income (green) vs expense (red) bars per month, drawn with plain Views so it renders
// identically on native and web without a charting dependency.
export function MiniBarChart({ data, height = 96, highlightMonth, showValues = false }: MiniBarChartProps) {
  const max = Math.max(1, ...data.flatMap((d) => [d.income, d.expense]));

  return (
    <View>
      <View className="flex-row items-end justify-between" style={{ height: height + (showValues ? 16 : 0) }}>
        {data.map((d) => {
          const incH = Math.max(d.income > 0 ? 3 : 0, Math.round((d.income / max) * height));
          const expH = Math.max(d.expense > 0 ? 3 : 0, Math.round((d.expense / max) * height));
          const top = Math.max(d.income, d.expense);
          return (
            <View key={`${d.year}-${d.month}`} className="flex-1 items-center justify-end" style={{ height: height + (showValues ? 16 : 0) }}>
              {showValues && top > 0 ? (
                <Text className="text-[9px] text-gray-500 mb-0.5">{compact(top)}</Text>
              ) : null}
              <View className="flex-row items-end gap-0.5">
                <View style={{ width: 9, height: incH, backgroundColor: INCOME_COLOR, borderTopLeftRadius: 3, borderTopRightRadius: 3 }} />
                <View style={{ width: 9, height: expH, backgroundColor: EXPENSE_COLOR, borderTopLeftRadius: 3, borderTopRightRadius: 3 }} />
              </View>
            </View>
          );
        })}
      </View>
      <View className="flex-row justify-between mt-1.5">
        {data.map((d) => (
          <Text
            key={`${d.year}-${d.month}-l`}
            className={`flex-1 text-center text-[10px] ${d.month === highlightMonth ? 'text-gray-800 font-bold' : 'text-gray-400'}`}
          >
            {MONTHS[d.month - 1]}
          </Text>
        ))}
      </View>
      <View className="flex-row items-center justify-center gap-4 mt-2">
        <View className="flex-row items-center">
          <View className="w-2.5 h-2.5 rounded-sm mr-1" style={{ backgroundColor: INCOME_COLOR }} />
          <Text className="text-[11px] text-gray-500">Income</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-2.5 h-2.5 rounded-sm mr-1" style={{ backgroundColor: EXPENSE_COLOR }} />
          <Text className="text-[11px] text-gray-500">Expense</Text>
        </View>
      </View>
    </View>
  );
}
