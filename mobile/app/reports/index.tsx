import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { reportsApi } from '../../src/api/endpoints';
import { formatMonthYear, formatCurrency } from '../../src/utils/helpers';
import { EmptyState } from '../../src/components/common/EmptyState';
import { LoadingScreen } from '../../src/components/common/LoadingScreen';

export default function ReportsScreen() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const { data: pendingData } = useQuery({
    queryKey: ['report-pending'],
    queryFn: () => reportsApi.pendingPayments().then((r) => r.data.data),
  });

  const { data: pregnantData } = useQuery({
    queryKey: ['report-pregnant'],
    queryFn: () => reportsApi.pregnantCows().then((r) => r.data.data),
  });

  const { data: milkData } = useQuery({
    queryKey: ['report-milk', year, month],
    queryFn: () => reportsApi.milkProduction(year, month).then((r) => r.data.data),
  });

  const reportCards = [
    {
      title: 'Monthly Report',
      description: 'View & export (Excel/CSV/PDF)',
      icon: 'document-text-outline',
      color: '#16A34A',
      onPress: () => router.push('/reports/monthly' as any),
    },
    {
      title: 'Income & Expense',
      description: 'Monthly profit/loss summary',
      icon: 'wallet-outline',
      color: '#0891B2',
      onPress: () => router.push('/reports/finance' as any),
    },
    {
      title: 'Finance Ledger',
      description: 'All income & expense lines, export',
      icon: 'list-outline',
      color: '#0F766E',
      onPress: () => router.push('/reports/finance-ledger' as any),
    },
    {
      title: 'Delivery Exceptions',
      description: 'View missed delivery reasons',
      icon: 'calendar-outline',
      color: '#D97706',
      onPress: () => router.push('/reports/delivery-exceptions' as any),
    },
    {
      title: 'Pending Payments',
      description: `${pendingData?.pending?.length || 0} pending invoices`,
      icon: 'cash-outline',
      color: '#DC2626',
      onPress: () => router.push('/reports/pending-payments' as any),
    },
    {
      title: 'Milk Production',
      description: 'Cow-wise production & export',
      icon: 'water-outline',
      color: '#2563EB',
      onPress: () => router.push('/reports/milk-production' as any),
    },
    {
      title: 'Pregnant Cows',
      description: `${pregnantData?.length || 0} active pregnancies`,
      icon: 'leaf-outline',
      color: '#7C3AED',
      onPress: () => router.push('/breeding/pregnancies'),
    },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800 ml-4">Reports & Analytics</Text>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* Month Selector */}
        <View className="flex-row items-center justify-between bg-white rounded-xl p-3 mb-4 shadow-sm">
          <TouchableOpacity onPress={prevMonth}>
            <Ionicons name="chevron-back" size={20} color="#374151" />
          </TouchableOpacity>
          <Text className="font-semibold text-gray-800">{formatMonthYear(year, month)}</Text>
          <TouchableOpacity onPress={nextMonth}>
            <Ionicons name="chevron-forward" size={20} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Report Cards */}
        <View className="flex-row flex-wrap gap-3 mb-4">
          {reportCards.map((card) => (
            <TouchableOpacity
              key={card.title}
              onPress={card.onPress}
              className="bg-white rounded-2xl p-4 shadow-sm"
              style={{ width: '47.5%' }}
              activeOpacity={0.8}
            >
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mb-3"
                style={{ backgroundColor: `${card.color}15` }}
              >
                <Ionicons name={card.icon as any} size={22} color={card.color} />
              </View>
              <Text className="text-gray-800 font-semibold text-sm">{card.title}</Text>
              <Text className="text-gray-400 text-xs mt-1">{card.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Milk Production Summary */}
        {milkData && (
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <Text className="text-gray-700 font-semibold mb-3">Milk Production - {formatMonthYear(year, month)}</Text>
            <Text className="text-blue-600 font-bold text-2xl">{milkData.grandTotal?.toFixed(1)} L</Text>
            <Text className="text-gray-400 text-sm">Total production this month</Text>

            {milkData.data?.map((cowData: any) => (
              <View key={cowData.cowId} className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <View className="flex-row items-center">
                  <Text className="text-xl mr-2">🐄</Text>
                  <Text className="text-gray-700 font-medium">{cowData.cowName}</Text>
                </View>
                <Text className="text-gray-600 font-semibold">{Number(cowData.totalMilk ?? 0).toFixed(1)} L</Text>
              </View>
            ))}
          </View>
        )}

        {/* Pending Payments Summary */}
        {pendingData && (
          <View className="bg-white rounded-2xl p-4 mb-8 shadow-sm">
            <Text className="text-gray-700 font-semibold mb-3">Pending Collections</Text>
            <Text className="text-red-600 font-bold text-2xl">{formatCurrency(pendingData.totalPending || 0)}</Text>
            <Text className="text-gray-400 text-sm">{pendingData.pending?.length || 0} unpaid invoices</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
