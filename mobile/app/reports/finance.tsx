import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { reportsApi } from '../../src/api/endpoints';
import { formatMonthYear, formatCurrency } from '../../src/utils/helpers';
import { LoadingScreen } from '../../src/components/common/LoadingScreen';
import { MiniBarChart } from '../../src/components/common/MiniBarChart';
import { LEDGER_CONFIG, getCategoryMeta } from '../../src/config/ledgers';
import { useAuthStore } from '../../src/store/authStore';
import { hasPermission } from '../../src/utils/permissions';
import type { FinanceTrendPoint, LedgerCategoryTotal, MonthlyFinanceReport } from '../../src/types';

function BreakdownRow({ label, value, total, icon, color, indent = false }: {
  label: string; value: number; total: number; icon: keyof typeof Ionicons.glyphMap; color: string; indent?: boolean;
}) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <View className={`py-2 border-b border-gray-100 ${indent ? 'pl-4' : ''}`}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <Ionicons name={icon} size={18} color={color} />
          <Text className="text-gray-600 ml-2 flex-1" numberOfLines={1}>{label}</Text>
        </View>
        <Text className="text-gray-800 font-semibold ml-2">{formatCurrency(value)}</Text>
        <Text className="text-gray-400 text-xs w-10 text-right">{pct}%</Text>
      </View>
      <View className="h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
        <View className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </View>
    </View>
  );
}

// Monthly profit & loss: income (auto + manual) vs expenses by category, with a 12-month trend.
export default function MonthlyFinanceReportScreen() {
  const user = useAuthStore((s) => s.user);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); } else setMonth((m) => m + 1);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['report-finance', year, month],
    queryFn: () => reportsApi.monthlyFinance(year, month).then((r) => r.data.data as MonthlyFinanceReport),
  });

  const { data: trend } = useQuery({
    queryKey: ['report-finance-trend', year],
    queryFn: () => reportsApi.financeTrend(year).then((r) => r.data.data.months as FinanceTrendPoint[]),
  });

  if (isLoading || !data) return <LoadingScreen />;

  const netPositive = data.netProfit >= 0;
  const manualIncome: LedgerCategoryTotal[] = (data.income.byCategory ?? []).filter((r) => r.total > 0);
  const expenseRows = [...data.expense.byCategory].sort((a, b) => b.total - a.total);
  const canSeeExpenses = hasPermission(user, 'expenses:view');
  const canSeeIncome = hasPermission(user, 'income:view');
  const isWeb = Platform.OS === 'web';

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800 ml-4">Income & Expense</Text>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        <View style={{ width: '100%', maxWidth: isWeb ? 1100 : undefined, alignSelf: 'center' }}>
          <View className="flex-row items-center justify-between bg-white rounded-xl p-3 mb-4 shadow-sm">
            <TouchableOpacity onPress={prevMonth}>
              <Ionicons name="chevron-back" size={20} color="#374151" />
            </TouchableOpacity>
            <Text className="font-semibold text-gray-800">{formatMonthYear(year, month)}</Text>
            <TouchableOpacity onPress={nextMonth}>
              <Ionicons name="chevron-forward" size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          <View className={`${isWeb ? 'flex-row gap-4' : ''} mb-4`}>
            <View className={`${isWeb ? 'flex-1' : 'mb-4'} rounded-2xl p-4 ${netPositive ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <Text className={`text-sm ${netPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                Net {netPositive ? 'Profit' : 'Loss'} • {formatMonthYear(year, month)}
              </Text>
              <Text className={`text-3xl font-bold mt-1 ${netPositive ? 'text-emerald-700' : 'text-red-700'}`}>
                {formatCurrency(Math.abs(data.netProfit))}
              </Text>
              <Text className="text-gray-500 text-xs mt-1">
                Income {formatCurrency(data.income.total)} − Expense {formatCurrency(data.expense.total)}
              </Text>
            </View>

            <View className={`flex-row gap-3 ${isWeb ? 'flex-1' : ''}`}>
              <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
                <View className="flex-row items-center mb-1">
                  <Ionicons name="arrow-down-circle-outline" size={18} color="#16A34A" />
                  <Text className="text-gray-500 text-xs ml-1">Income</Text>
                </View>
                <Text className="text-emerald-700 font-bold text-xl">{formatCurrency(data.income.total)}</Text>
              </View>
              <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
                <View className="flex-row items-center mb-1">
                  <Ionicons name="arrow-up-circle-outline" size={18} color="#DC2626" />
                  <Text className="text-gray-500 text-xs ml-1">Expense</Text>
                </View>
                <Text className="text-red-700 font-bold text-xl">{formatCurrency(data.expense.total)}</Text>
              </View>
            </View>
          </View>

          {trend && trend.length > 0 && (
            <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-gray-700 font-semibold">{year} Trend</Text>
                <Text className="text-gray-400 text-xs">
                  YTD net {formatCurrency(trend.reduce((s, t) => s + t.net, 0))}
                </Text>
              </View>
              <MiniBarChart data={trend} height={isWeb ? 140 : 100} highlightMonth={month} showValues={isWeb} />
            </View>
          )}

          <View className={isWeb ? 'flex-row gap-4' : ''}>
            <View className={`bg-white rounded-2xl p-4 mb-4 shadow-sm ${isWeb ? 'flex-1' : ''}`}>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-gray-700 font-semibold">Income Breakdown</Text>
                {canSeeIncome && (
                  <TouchableOpacity onPress={() => router.push('/finance/income' as any)}>
                    <Text className="text-blue-600 text-xs font-medium">Income entries →</Text>
                  </TouchableOpacity>
                )}
              </View>
              <BreakdownRow label="Milk Collections (Payments)" value={data.income.milkPayments} total={data.income.total} icon="water-outline" color="#2563EB" />
              <BreakdownRow label="Product Sales (Orders)" value={data.income.otherItemSales} total={data.income.total} icon="cube-outline" color="#7C3AED" />
              {manualIncome.map((row) => (
                <BreakdownRow
                  key={row.category}
                  label={row.category}
                  value={row.total}
                  total={data.income.total}
                  icon={getCategoryMeta(LEDGER_CONFIG.income, row.category).icon}
                  color={getCategoryMeta(LEDGER_CONFIG.income, row.category).color}
                />
              ))}
              {manualIncome.length === 0 && (
                <Text className="text-gray-400 text-xs mt-2">No other income recorded this month.</Text>
              )}
            </View>

            <View className={`bg-white rounded-2xl p-4 mb-4 shadow-sm ${isWeb ? 'flex-1' : ''}`}>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-gray-700 font-semibold">Expense Breakdown</Text>
                {canSeeExpenses && (
                  <TouchableOpacity onPress={() => router.push('/finance/expenses' as any)}>
                    <Text className="text-blue-600 text-xs font-medium">Expense entries →</Text>
                  </TouchableOpacity>
                )}
              </View>
              {expenseRows.map((row) => (
                <BreakdownRow
                  key={row.category}
                  label={row.category}
                  value={row.total}
                  total={data.expense.total}
                  icon={getCategoryMeta(LEDGER_CONFIG.expenses, row.category).icon}
                  color={getCategoryMeta(LEDGER_CONFIG.expenses, row.category).color}
                />
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/reports/finance-ledger' as any)}
            className="bg-slate-900 rounded-2xl py-3.5 items-center flex-row justify-center mb-8"
            activeOpacity={0.85}
          >
            <Ionicons name="list-outline" size={18} color="#fff" />
            <Text className="text-white font-semibold ml-2">Open full ledger (all transactions, export)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
