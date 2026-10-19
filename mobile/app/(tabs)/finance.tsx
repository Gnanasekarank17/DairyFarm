import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, RefreshControl, useWindowDimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { reportsApi } from '../../src/api/endpoints';
import { Card } from '../../src/components/common/Card';
import { MiniBarChart } from '../../src/components/common/MiniBarChart';
import { LEDGER_CONFIG, getCategoryMeta } from '../../src/config/ledgers';
import { formatCurrency, formatMonthYear } from '../../src/utils/helpers';
import { useAuthStore } from '../../src/store/authStore';
import { hasPermission } from '../../src/utils/permissions';
import type { FinanceTrendPoint, MonthlyFinanceReport, Permission } from '../../src/types';

interface FinanceMenuItem {
  label: string;
  subtitle: string;
  href: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  permission: Permission;
}

const MENU: FinanceMenuItem[] = [
  { label: 'Expenses', subtitle: 'Feed, medicine, doctor fee, salary, EB, petty cash', href: '/finance/expenses', icon: 'wallet-outline', color: '#DC2626', permission: 'expenses:view' },
  { label: 'Income', subtitle: 'Cattle, calf, manure, egg sales, subsidies', href: '/finance/income', icon: 'trending-up-outline', color: '#16A34A', permission: 'income:view' },
  { label: 'Profit & Loss', subtitle: 'Monthly income vs expense with 12-month trend', href: '/reports/finance', icon: 'stats-chart-outline', color: '#0891B2', permission: 'reports:view' },
  { label: 'Finance Ledger', subtitle: 'Every transaction with running balance, export', href: '/reports/finance-ledger', icon: 'list-outline', color: '#0F766E', permission: 'reports:view' },
];

// Finance hub tab: this-month snapshot + entry points to the ledgers and reports.
export default function FinanceHubScreen() {
  const user = useAuthStore((s) => s.user);
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const isWeb = Platform.OS === 'web';
  const { width } = useWindowDimensions();
  const isWide = isWeb && width >= 900;

  const { data, refetch, isRefetching } = useQuery({
    queryKey: ['report-finance', year, month],
    queryFn: () => reportsApi.monthlyFinance(year, month).then((r) => r.data.data as MonthlyFinanceReport),
    enabled: hasPermission(user, 'reports:view'),
  });
  const { data: trend } = useQuery({
    queryKey: ['report-finance-trend', year],
    queryFn: () => reportsApi.financeTrend(year).then((r) => r.data.data.months as FinanceTrendPoint[]),
    enabled: hasPermission(user, 'reports:view'),
  });

  const recent = (trend ?? []).filter((t) => t.month <= month).slice(-6);
  const netPositive = (data?.netProfit ?? 0) >= 0;
  const items = MENU.filter((m) => hasPermission(user, m.permission));
  const topExpenses = [...(data?.expense.byCategory ?? [])].filter((r) => r.total > 0).sort((a, b) => b.total - a.total).slice(0, 3);

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ backgroundColor: isWeb ? '#F2F7F5' : '#F9FAFB' }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ width: '100%', maxWidth: isWeb ? 1180 : undefined, alignSelf: 'center' }}>
        <View
          className={isWeb ? 'pt-14 pb-7 px-6 rounded-b-3xl' : 'pt-14 pb-6 px-5 bg-blue-600'}
          style={isWeb ? { background: 'linear-gradient(135deg, #0D3B2E 0%, #0F4536 55%, #082A20 100%)' } as any : undefined}
        >
          <Text className={isWeb ? 'text-emerald-100/70 text-sm' : 'text-blue-200 text-sm'}>Farm accounts</Text>
          <Text className="text-white text-2xl font-bold mt-0.5">Finance</Text>
          <Text className={isWeb ? 'text-emerald-100/70 text-sm mt-1' : 'text-blue-200 text-sm mt-1'}>{formatMonthYear(year, month)}</Text>
        </View>

        <View className="px-4 -mt-4">
          {data && (
            <Card className="mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-gray-700 font-semibold">This Month</Text>
                <TouchableOpacity onPress={() => router.push('/reports/finance' as any)}>
                  <Text className="text-blue-600 text-xs font-medium">Full report</Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row gap-2">
                <View className="flex-1 bg-green-50 rounded-xl p-3 items-center">
                  <Text className="text-green-700 text-base font-bold" numberOfLines={1} adjustsFontSizeToFit>{formatCurrency(data.income.total)}</Text>
                  <Text className="text-green-600 text-xs mt-1">Income</Text>
                </View>
                <View className="flex-1 bg-red-50 rounded-xl p-3 items-center">
                  <Text className="text-red-700 text-base font-bold" numberOfLines={1} adjustsFontSizeToFit>{formatCurrency(data.expense.total)}</Text>
                  <Text className="text-red-600 text-xs mt-1">Expense</Text>
                </View>
                <View className={`flex-1 rounded-xl p-3 items-center ${netPositive ? 'bg-emerald-100' : 'bg-orange-50'}`}>
                  <Text className={`text-base font-bold ${netPositive ? 'text-emerald-800' : 'text-orange-700'}`} numberOfLines={1} adjustsFontSizeToFit>
                    {netPositive ? '' : '-'}{formatCurrency(Math.abs(data.netProfit))}
                  </Text>
                  <Text className={`text-xs mt-1 ${netPositive ? 'text-emerald-700' : 'text-orange-600'}`}>Net {netPositive ? 'Profit' : 'Loss'}</Text>
                </View>
              </View>

              <View className={isWide ? 'flex-row gap-6 mt-4' : 'mt-4'}>
                {recent.length > 0 && (
                  <View className={isWide ? 'flex-1' : ''}>
                    <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">Last {recent.length} months</Text>
                    <MiniBarChart data={recent} height={isWide ? 110 : 80} highlightMonth={month} />
                  </View>
                )}
                <View className={isWide ? 'flex-1' : 'mt-4'}>
                  <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">Top expenses</Text>
                  {topExpenses.length === 0 ? (
                    <Text className="text-gray-400 text-xs">No expenses recorded yet this month.</Text>
                  ) : topExpenses.map((row) => {
                    const meta = getCategoryMeta(LEDGER_CONFIG.expenses, row.category);
                    const pct = data.expense.total > 0 ? Math.round((row.total / data.expense.total) * 100) : 0;
                    return (
                      <View key={row.category} className="mb-2">
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center flex-1">
                            <Ionicons name={meta.icon} size={14} color={meta.color} />
                            <Text className="text-gray-600 text-xs ml-1.5 flex-1" numberOfLines={1}>{row.category}</Text>
                          </View>
                          <Text className="text-gray-800 text-xs font-semibold">{formatCurrency(row.total)}</Text>
                        </View>
                        <View className="h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                          <View className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: meta.color }} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            </Card>
          )}

          <View className="flex-row gap-2 mb-4">
            {hasPermission(user, 'expenses:manage') && (
              <TouchableOpacity onPress={() => router.push('/finance/expenses/add' as any)} className="flex-1 bg-red-600 rounded-xl py-3 items-center flex-row justify-center" activeOpacity={0.85}>
                <Ionicons name="remove-circle-outline" size={18} color="#fff" />
                <Text className="text-white font-semibold ml-1.5">Add Expense</Text>
              </TouchableOpacity>
            )}
            {hasPermission(user, 'income:manage') && (
              <TouchableOpacity onPress={() => router.push('/finance/income/add' as any)} className="flex-1 bg-emerald-600 rounded-xl py-3 items-center flex-row justify-center" activeOpacity={0.85}>
                <Ionicons name="add-circle-outline" size={18} color="#fff" />
                <Text className="text-white font-semibold ml-1.5">Add Income</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text className="text-gray-700 font-semibold mb-3">Finance Menu</Text>
          <View className={`${isWide ? 'flex-row flex-wrap gap-3' : ''} mb-8`}>
            {items.map((item) => (
              <TouchableOpacity
                key={item.label}
                onPress={() => router.push(item.href as any)}
                className="bg-white rounded-2xl p-4 shadow-sm flex-row items-center mb-3"
                style={isWide ? { width: '48.5%' } : undefined}
                activeOpacity={0.8}
              >
                <View className="w-11 h-11 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: `${item.color}15` }}>
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 font-semibold">{item.label}</Text>
                  <Text className="text-gray-400 text-xs mt-0.5">{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
