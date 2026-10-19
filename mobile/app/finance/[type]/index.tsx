import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LoadingScreen } from '../../../src/components/common/LoadingScreen';
import { LedgerDataGrid } from '../../../src/components/grid/LedgerDataGrid';
import { formatCurrency, formatMonthYear } from '../../../src/utils/helpers';
import { useAuthStore } from '../../../src/store/authStore';
import { hasPermission } from '../../../src/utils/permissions';
import { LEDGER_CONFIG, getCategoryMeta, isLedgerTypeSlug, type LedgerTypeSlug } from '../../../src/config/ledgers';
import { useLedgerCategories } from '../../../src/hooks/useLedgerCategories';
import type { LedgerEntry, LedgerMonthlySummary } from '../../../src/types';

// One list screen for both ledgers: /finance/expenses and /finance/income.
export default function LedgerListScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const user = useAuthStore((s) => s.user);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Hooks must run on every render, so resolve a safe config first and redirect after the hooks.
  const validType = isLedgerTypeSlug(type);
  const slug: LedgerTypeSlug = validType ? type : 'expenses';
  const config = LEDGER_CONFIG[slug];
  const canView = validType && hasPermission(user, config.viewPermission);
  const canManage = canView && hasPermission(user, config.managePermission);
  const isWeb = Platform.OS === 'web';

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); } else setMonth((m) => m + 1);
  };

  const { data: entries = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: [config.queryKey, year, month],
    queryFn: () => config.api.getAll({ year, month }).then((r) => r.data.data as LedgerEntry[]),
    enabled: canView,
  });

  const { data: summary } = useQuery({
    queryKey: [`${config.queryKey}-summary`, year, month],
    queryFn: () => config.api.getMonthlySummary(year, month).then((r) => r.data.data as LedgerMonthlySummary),
    enabled: canView,
  });

  const { names: categoryNames } = useLedgerCategories(config, canView);

  const filtered = useMemo(
    () => (categoryFilter === 'all' ? entries : entries.filter((e) => e.category === categoryFilter)),
    [entries, categoryFilter],
  );
  const grandTotal = summary?.grandTotal ?? 0;
  const toneBg = config.tone === 'expense' ? 'bg-red-50' : 'bg-emerald-50';
  const toneText = config.tone === 'expense' ? 'text-red-500' : 'text-emerald-600';
  const toneStrong = config.tone === 'expense' ? 'text-red-700' : 'text-emerald-800';

  if (!validType) return <Redirect href="/(tabs)/more" />;
  if (!user) return <LoadingScreen />;
  if (!canView) return <Redirect href="/(tabs)/dashboard" />;
  if (isLoading) return <LoadingScreen message={`Loading ${config.label.toLowerCase()}...`} />;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm">
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">{config.emoji} {config.label}</Text>
          {canManage ? (
            <TouchableOpacity
              onPress={() => router.push(`/finance/${slug}/add` as any)}
              className="rounded-full w-9 h-9 items-center justify-center"
              style={{ backgroundColor: config.color }}
            >
              <Ionicons name="add" size={22} color="white" />
            </TouchableOpacity>
          ) : <View className="w-9 h-9" />}
        </View>

        <View className="flex-row items-center justify-between bg-gray-100 rounded-xl p-2">
          <TouchableOpacity onPress={prevMonth} className="p-1">
            <Ionicons name="chevron-back" size={20} color="#374151" />
          </TouchableOpacity>
          <Text className="font-semibold text-gray-800">{formatMonthYear(year, month)}</Text>
          <TouchableOpacity onPress={nextMonth} className="p-1">
            <Ionicons name="chevron-forward" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <View style={{ width: '100%', maxWidth: isWeb ? 1400 : undefined, alignSelf: 'center' }}>
          <View className={`${toneBg} mx-4 mt-4 rounded-2xl p-4 flex-row items-center justify-between`}>
            <View>
              <Text className={`${toneText} text-sm`}>Total {config.label} • {formatMonthYear(year, month)}</Text>
              <Text className={`${toneStrong} text-3xl font-bold mt-1`}>{formatCurrency(grandTotal)}</Text>
              <Text className="text-gray-500 text-xs mt-1">{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</Text>
            </View>
            <View className="w-12 h-12 rounded-2xl items-center justify-center" style={{ backgroundColor: `${config.color}20` }}>
              <Ionicons name={config.icon} size={26} color={config.color} />
            </View>
          </View>

          {summary?.byCategory && (
            <View className="flex-row flex-wrap gap-3 mx-4 mt-4">
              {summary.byCategory.map((row) => {
                const meta = getCategoryMeta(config, row.category);
                const selected = categoryFilter === row.category;
                return (
                  <TouchableOpacity
                    key={row.category}
                    onPress={() => setCategoryFilter(selected ? 'all' : row.category)}
                    className={`bg-white rounded-2xl p-3 shadow-sm border ${selected ? 'border-slate-800' : 'border-transparent'}`}
                    style={{ width: isWeb ? '23.5%' : '47.5%', minWidth: isWeb ? 160 : undefined }}
                    activeOpacity={0.8}
                  >
                    <View className="flex-row items-center mb-1">
                      <Ionicons name={meta.icon} size={16} color={meta.color} />
                      <Text className="text-gray-500 text-xs ml-1 flex-1" numberOfLines={1}>{row.category}</Text>
                    </View>
                    <Text className="text-gray-800 font-bold text-base">{formatCurrency(row.total)}</Text>
                    <Text className="text-gray-400 text-xs mt-0.5">{row.count ?? 0} {row.count === 1 ? 'entry' : 'entries'}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4" contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
            {['all', ...categoryNames].map((cat) => {
              const selected = categoryFilter === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl ${selected ? 'bg-slate-900' : 'bg-white border border-gray-200'}`}
                >
                  <Text className={`text-xs font-medium ${selected ? 'text-white' : 'text-gray-600'}`}>
                    {cat === 'all' ? 'All' : cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View className={`${isWeb ? 'pt-4' : 'px-4 pt-4'} mb-8`}>
            <LedgerDataGrid type={slug} config={config} entries={filtered} canManage={canManage} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
