import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl, Platform, TextInput, Modal,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { customerRequestsApi, dashboardApi } from '../../src/api/endpoints';
import { StatCard } from '../../src/components/common/StatCard';
import { Card } from '../../src/components/common/Card';
import { LoadingScreen } from '../../src/components/common/LoadingScreen';
import { formatCurrency } from '../../src/utils/helpers';
import { useAuthStore } from '../../src/store/authStore';
import type { CustomerDashboardSummary, DashboardSummary } from '../../src/types';
import { hasPermission, normalizeRole } from '../../src/utils/permissions';
import { MiniBarChart } from '../../src/components/common/MiniBarChart';
import { LEDGER_CONFIG, getCategoryMeta } from '../../src/config/ledgers';

interface QuickAction {
  icon: string;
  label: string;
  href: string;
  color: string;
}

const quickActions: QuickAction[] = [
  { icon: 'calendar', label: 'Delivery', href: '/(tabs)/delivery', color: '#2563EB' },
  { icon: 'people', label: 'Customers', href: '/customers', color: '#7C3AED' },
  { icon: 'receipt', label: 'Invoices', href: '/(tabs)/invoices', color: '#16A34A' },
  { icon: 'cash', label: 'Payments', href: '/payments', color: '#D97706' },
  { icon: 'leaf', label: 'Cows', href: '/(tabs)/cows', color: '#0891B2' },
  { icon: 'heart', label: 'Breeding', href: '/breeding', color: '#DC2626' },
  { icon: 'wallet', label: 'Expenses', href: '/finance/expenses', color: '#DC2626' },
  { icon: 'trending-up', label: 'Income', href: '/finance/income', color: '#16A34A' },
  { icon: 'bar-chart', label: 'Reports', href: '/reports', color: '#4F46E5' },
  { icon: 'settings', label: 'Settings', href: '/settings', color: '#6B7280' },
];

interface CustomerAlert {
  id: string;
  title: string;
  message: string;
  tone: 'success' | 'warning' | 'danger';
}

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const qc = useQueryClient();
  const isCustomer = normalizeRole(user?.role) === 'customer';
  const [requestType, setRequestType] = React.useState<'extra_milk' | 'cancel_delivery'>('extra_milk');
  const [requestDate, setRequestDate] = React.useState(todayStr);
  const [endDate, setEndDate] = React.useState(todayStr);
  const [extraQuantity, setExtraQuantity] = React.useState('1');
  const [reason, setReason] = React.useState('');
  const [alertsOpen, setAlertsOpen] = React.useState(false);
  const [lastAlertKey, setLastAlertKey] = React.useState('');

  React.useEffect(() => {
    if (requestType === 'cancel_delivery' && endDate < requestDate) {
      setEndDate(requestDate);
    }
  }, [endDate, requestDate, requestType]);

  const { data, isLoading, refetch, isRefetching } = useQuery<DashboardSummary | CustomerDashboardSummary>({
    queryKey: ['dashboard', user?.role],
    queryFn: () => isCustomer
      ? dashboardApi.getCustomerSummary().then((r) => r.data.data as CustomerDashboardSummary)
      : dashboardApi.getSummary().then((r) => r.data.data as DashboardSummary),
  });

  const requestMutation = useMutation({
    mutationFn: () => customerRequestsApi.create({
      requestDate,
      endDate: requestType === 'cancel_delivery' ? endDate : requestDate,
      requestType,
      extraQuantity,
      reason,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dashboard', user?.role] });
      Toast.show({ type: 'success', text1: 'Request submitted' });
      setReason('');
    },
    onError: (err: any) => Toast.show({ type: 'error', text1: err?.response?.data?.message || 'Request failed' }),
  });

  const submitCustomerRequest = () => {
    if (requestDate < todayStr) {
      Toast.show({ type: 'error', text1: 'Select today or a future date' });
      return;
    }

    if (requestType === 'cancel_delivery' && endDate < requestDate) {
      Toast.show({ type: 'error', text1: 'To date must be same as or after From date' });
      return;
    }

    requestMutation.mutate();
  };

  const customerAlerts = React.useMemo<CustomerAlert[]>(() => {
    if (!isCustomer || !data || !('billing' in data)) return [];

    const customerData = data as CustomerDashboardSummary;
    const alerts: CustomerAlert[] = [];
    const lastMonthDue = customerData.billing.lastMonthDue || 0;
    if (lastMonthDue > 0) {
      alerts.push({
        id: 'last-month-payment-pending',
        title: 'Last month bill due',
        message: `${formatCurrency(lastMonthDue)} pending from last month`,
        tone: 'warning',
      });
    } else if (customerData.billing.pendingDues > 0) {
      alerts.push({
        id: 'payment-pending',
        title: 'Payment pending',
        message: `${formatCurrency(customerData.billing.pendingDues)} due for payment`,
        tone: 'warning',
      });
    }

    customerData.recentRequests
      .filter((item) => item.status === 'Approved' || item.status === 'Rejected')
      .forEach((item) => {
        alerts.push({
          id: item.id,
          title: item.status === 'Approved' ? 'Milk request approved' : 'Milk request rejected',
          message: `${item.requestDate} ${item.requestType === 'extra_milk' ? `extra ${parseFloat(item.extraQuantity || '0').toFixed(1)} L` : item.requestType === 'dispute_delivery' ? 'delivery correction' : 'cancellation'}${item.actionReason ? ` - ${item.actionReason}` : ''}`,
          tone: item.status === 'Approved' ? 'success' : 'danger',
        });
      });

    return alerts;
  }, [data, isCustomer]);

  React.useEffect(() => {
    if (!customerAlerts.length) return;
    const alertKey = customerAlerts.map((item) => `${item.id}:${item.message}`).join('|');
    if (alertKey === lastAlertKey) return;

    setLastAlertKey(alertKey);
    Toast.show({
      type: customerAlerts.some((item) => item.tone === 'danger') ? 'error' : 'info',
      text1: `${customerAlerts.length} alert${customerAlerts.length > 1 ? 's' : ''}`,
      text2: customerAlerts[0].message,
    });
  }, [customerAlerts, lastAlertKey]);

  if (isLoading) return <LoadingScreen message="Loading dashboard..." />;

  if (isCustomer) {
    const customerData = data as CustomerDashboardSummary;
    return (
      <ScrollView
        className="flex-1 bg-gray-50"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        keyboardShouldPersistTaps="handled"
      >
        <View className="bg-blue-600 pt-14 pb-6 px-5">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-blue-100 text-sm">Welcome,</Text>
              <Text className="text-white text-2xl font-bold mt-0.5">{customerData.customer.name}</Text>
              <Text className="text-blue-100 text-sm mt-1">{customerData.customer.milkType} · {customerData.customer.dailyQuantity} L daily</Text>
            </View>
            <TouchableOpacity
              onPress={() => setAlertsOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              className="w-11 h-11 bg-white/20 rounded-full items-center justify-center"
              activeOpacity={0.8}
            >
              <Ionicons name="notifications-outline" size={22} color="white" />
              {customerAlerts.length > 0 && (
                <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[20px] h-5 px-1 items-center justify-center">
                  <Text className="text-white text-[10px] font-bold">{customerAlerts.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <Modal visible={alertsOpen} transparent animationType="fade">
          <TouchableOpacity className="flex-1 bg-black/40 justify-center px-6" activeOpacity={1} onPress={() => setAlertsOpen(false)}>
            <View className="bg-white rounded-2xl p-4 shadow-xl">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-gray-800 text-lg font-bold">Notifications</Text>
                <Ionicons name="notifications-outline" size={20} color="#2563EB" />
              </View>
              {customerAlerts.length === 0 ? (
                <Text className="text-gray-500 text-sm py-3">No alerts</Text>
              ) : customerAlerts.map((item) => (
                <View key={item.id} className="border-t border-gray-100 py-3">
                  <Text className={`${item.tone === 'success' ? 'text-green-700' : item.tone === 'danger' ? 'text-red-700' : 'text-orange-600'} font-semibold`}>
                    {item.title}
                  </Text>
                  <Text className="text-gray-600 text-sm mt-1">{item.message}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        <View className="px-4 -mt-4">
          <Card className="mb-4">
            <Text className="text-gray-700 font-semibold mb-3">My Milk Summary</Text>
            <View className="flex-row gap-2">
              <View className="flex-1 bg-green-50 rounded-xl p-3 items-center">
                <Text className="text-green-600 text-xl font-bold">{customerData.delivery.deliveredDays}</Text>
                <Text className="text-green-600 text-xs mt-1">Given Days</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push(`/delivery/${customerData.customer.id}?year=${customerData.currentMonth.year}&month=${customerData.currentMonth.month}` as any)}
                className="flex-1 bg-red-50 rounded-xl p-3 items-center"
                activeOpacity={0.8}
              >
                <Text className="text-red-600 text-xl font-bold">{customerData.delivery.missedDays}</Text>
                <Text className="text-red-600 text-xs mt-1">Missing Days</Text>
              </TouchableOpacity>
              <View className="flex-1 bg-blue-50 rounded-xl p-3 items-center">
                <Text className="text-blue-600 text-xl font-bold">{customerData.milk.averageLiters.toFixed(2)}L</Text>
                <Text className="text-blue-600 text-xs mt-1">Average</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push(`/delivery/${customerData.customer.id}?year=${customerData.currentMonth.year}&month=${customerData.currentMonth.month}` as any)}
              className="mt-3 bg-red-600 rounded-xl py-2.5 items-center"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold">View Delivery Calendar</Text>
            </TouchableOpacity>
          </Card>

          <View className="flex-row flex-wrap gap-3 mb-4">
            <StatCard title="Total Liters" value={`${customerData.milk.totalLiters.toFixed(2)} L`} icon="water-outline" bgColor="#EFF6FF" iconColor="#2563EB" />
            <StatCard title="Extra Liters" value={`${(customerData.milk.extraLiters || 0).toFixed(2)} L`} icon="add-circle-outline" bgColor="#ECFEFF" iconColor="#0891B2" />
            <StatCard title="Current Month Bill" value={formatCurrency(customerData.billing.currentMonthEstimate || 0)} icon="calculator-outline" bgColor="#F0FDF4" iconColor="#16A34A" />
            <StatCard title="Last Month Due" value={formatCurrency(customerData.billing.lastMonthDue || 0)} icon="time-outline" bgColor="#FFF7ED" iconColor="#D97706" />
          </View>

          {customerData.billing.currentMonthCutoffDate && (
            <Text className="text-gray-500 text-xs mb-4 text-center">
              Current month bill is calculated up to {customerData.billing.currentMonthCutoffDate}.
            </Text>
          )}

          <Card className="mb-4">
            <Text className="text-gray-700 font-semibold mb-3">Request Delivery Change</Text>
            <View className="flex-row bg-gray-100 rounded-xl p-1 mb-4">
              <TouchableOpacity onPress={() => setRequestType('extra_milk')} className={`flex-1 py-2 rounded-lg items-center ${requestType === 'extra_milk' ? 'bg-white shadow-sm' : ''}`}>
                <Text className={`font-semibold ${requestType === 'extra_milk' ? 'text-blue-600' : 'text-gray-500'}`}>Extra Milk</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setRequestType('cancel_delivery'); setEndDate(requestDate); }} className={`flex-1 py-2 rounded-lg items-center ${requestType === 'cancel_delivery' ? 'bg-white shadow-sm' : ''}`}>
                <Text className={`font-semibold ${requestType === 'cancel_delivery' ? 'text-red-600' : 'text-gray-500'}`}>Cancel Milk</Text>
              </TouchableOpacity>
            </View>
            <Text className="text-sm font-medium text-gray-700 mb-1">{requestType === 'cancel_delivery' ? 'From Date' : 'Date'}</Text>
            <TextInput value={requestDate} onChangeText={setRequestDate} placeholder="YYYY-MM-DD" className="border border-slate-300 rounded-2xl px-4 py-3.5 text-gray-900 bg-white text-base mb-4" />
            <Text className="text-gray-400 text-xs -mt-2 mb-4">Use today or a future date only.</Text>
            {requestType === 'cancel_delivery' && (
              <>
                <Text className="text-sm font-medium text-gray-700 mb-1">To Date</Text>
                <TextInput value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" className="border border-slate-300 rounded-2xl px-4 py-3.5 text-gray-900 bg-white text-base mb-4" />
                <Text className="text-gray-400 text-xs -mt-2 mb-4">Cancel milk from Date to To Date.</Text>
              </>
            )}
            {requestType === 'extra_milk' && (
              <>
                <Text className="text-sm font-medium text-gray-700 mb-1">Extra Liters</Text>
                <TextInput value={extraQuantity} onChangeText={setExtraQuantity} keyboardType="decimal-pad" placeholder="1.0" className="border border-slate-300 rounded-2xl px-4 py-3.5 text-gray-900 bg-white text-base mb-4" />
              </>
            )}
            <Text className="text-sm font-medium text-gray-700 mb-1">Reason</Text>
            <TextInput value={reason} onChangeText={setReason} placeholder={requestType === 'extra_milk' ? 'Function at home, need extra milk' : 'Out of station'} multiline className="border border-slate-300 rounded-2xl px-4 py-3.5 text-gray-900 bg-white text-base mb-4 min-h-[88px]" />
            <TouchableOpacity onPress={submitCustomerRequest} disabled={requestMutation.isPending} className="bg-blue-600 rounded-xl py-3 items-center">
              <Text className="text-white font-semibold">{requestMutation.isPending ? 'Submitting...' : 'Submit Request'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push(`/delivery/${customerData.customer.id}?year=${customerData.currentMonth.year}&month=${customerData.currentMonth.month}` as any)}
              className="mt-3"
            >
              <Text className="text-blue-600 text-xs text-center">Milk marked wrong on a past day? Open the calendar and tap that day to report it.</Text>
            </TouchableOpacity>
          </Card>

          <Card className="mb-8">
            <Text className="text-gray-700 font-semibold mb-3">Recent Requests</Text>
            {customerData.recentRequests.length === 0 ? <Text className="text-gray-400 text-sm">No requests yet</Text> : customerData.recentRequests.map((item) => (
              <View key={item.id} className="border-t border-gray-100 py-3">
                <Text className="text-gray-800 font-semibold">{item.requestType === 'extra_milk' ? `Extra ${item.extraQuantity} L` : item.requestType === 'dispute_delivery' ? 'Delivery correction' : 'Cancel delivery'} · {item.requestDate}</Text>
                <Text className="text-gray-500 text-xs mt-1">{item.reason || 'No reason'} · {item.status}{item.actionReason ? ` - ${item.actionReason}` : ''}</Text>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    );
  }

  const d = data;
  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ backgroundColor: Platform.OS === 'web' ? '#F2F7F5' : '#F9FAFB' }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ width: '100%', maxWidth: Platform.OS === 'web' ? 1180 : undefined, alignSelf: 'center' }}>
      {/* Header */}
      <View
        className={Platform.OS === 'web'
          ? 'overflow-hidden pt-14 pb-7 px-6 rounded-b-3xl'
          : 'pt-14 pb-6 px-5 bg-blue-600'}
        style={Platform.OS === 'web'
          ? { background: 'linear-gradient(135deg, #0D3B2E 0%, #0F4536 55%, #082A20 100%)' } as any
          : undefined}
      >
        {Platform.OS === 'web' && (
          <>
            <View
              className="absolute -top-10 -right-6 w-56 h-56 rounded-full bg-emerald-400/15"
              style={{ filter: 'blur(55px)' } as any}
            />
            <View className="flex-row items-center gap-2 self-start bg-white/10 border border-emerald-200/20 rounded-full px-3 py-1 mb-3">
              <View className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
              <Text className="text-emerald-200 text-[10px] font-bold uppercase tracking-widest">
                Farm Overview
              </Text>
            </View>
          </>
        )}
        <Text className={Platform.OS === 'web' ? 'text-emerald-100/70 text-sm' : 'text-blue-200 text-sm'}>
          {greeting},
        </Text>
        <Text className="text-white text-2xl font-bold mt-0.5">{user?.name?.split(' ')[0]} 👋</Text>
        <Text className={Platform.OS === 'web' ? 'text-emerald-100/70 text-sm mt-1' : 'text-blue-200 text-sm mt-1'}>
          {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
      </View>

      <View className="px-4 -mt-4">
        {/* Today's Delivery Status */}
        <Card className="mb-4">
          <Text className="text-gray-700 font-semibold mb-3">Today's Delivery</Text>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-green-50 rounded-xl p-3 items-center">
              <Text className="text-green-600 text-2xl font-bold">
                {d?.deliveries.todayDelivered ?? 0}
              </Text>
              <Text className="text-green-600 text-xs mt-1">Delivered</Text>
            </View>
            <View className="flex-1 bg-red-50 rounded-xl p-3 items-center">
              <Text className="text-red-600 text-2xl font-bold">
                {d?.deliveries.todayMissed ?? 0}
              </Text>
              <Text className="text-red-600 text-xs mt-1">Missed</Text>
            </View>
            <View className="flex-1 bg-blue-50 rounded-xl p-3 items-center">
              <Text className="text-blue-600 text-2xl font-bold">
                {d?.deliveries.activeCustomers ?? 0}
              </Text>
              <Text className="text-blue-600 text-xs mt-1">Active</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/delivery')}
            className="mt-3 bg-blue-600 rounded-xl py-2.5 items-center"
          >
            <Text className="text-white font-semibold">Update Deliveries</Text>
          </TouchableOpacity>
        </Card>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap gap-3 mb-4">
          <StatCard
            title="Active Customers"
            value={d?.customers.active ?? 0}
            icon="people-outline"
            bgColor="#EFF6FF"
            iconColor="#2563EB"
          />
          <StatCard
            title="Monthly Revenue"
            value={formatCurrency(d?.revenue.monthly ?? 0)}
            icon="cash-outline"
            bgColor="#F0FDF4"
            iconColor="#16A34A"
          />
          <StatCard
            title="Pending Amount"
            value={formatCurrency(d?.revenue.pendingAmount ?? 0)}
            icon="time-outline"
            bgColor="#FFF7ED"
            iconColor="#D97706"
          />
          <StatCard
            title="Pregnant Cows"
            value={d?.cows.pregnant ?? 0}
            icon="leaf-outline"
            bgColor="#F5F3FF"
            iconColor="#7C3AED"
          />
        </View>

        {/* Finance: income vs expense this month + 6-month trend */}
        {d?.finance && hasPermission(user, 'expenses:view') && (() => {
          const f = d.finance;
          const netPositive = f.net >= 0;
          const topExpenses = f.expenseByCategory.slice(0, 4);
          const isWeb = Platform.OS === 'web';
          return (
            <Card className="mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-gray-700 font-semibold">Finance - This Month</Text>
                <TouchableOpacity onPress={() => router.push('/reports/finance' as any)}>
                  <Text className="text-blue-600 text-xs font-medium">Full report</Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row gap-2">
                <View className="flex-1 bg-green-50 rounded-xl p-3 items-center">
                  <Text className="text-green-700 text-base font-bold" numberOfLines={1} adjustsFontSizeToFit>{formatCurrency(f.income)}</Text>
                  <Text className="text-green-600 text-xs mt-1">Income</Text>
                </View>
                <View className="flex-1 bg-red-50 rounded-xl p-3 items-center">
                  <Text className="text-red-700 text-base font-bold" numberOfLines={1} adjustsFontSizeToFit>{formatCurrency(f.expense)}</Text>
                  <Text className="text-red-600 text-xs mt-1">Expense</Text>
                </View>
                <View className={`flex-1 rounded-xl p-3 items-center ${netPositive ? 'bg-emerald-100' : 'bg-orange-50'}`}>
                  <Text className={`text-base font-bold ${netPositive ? 'text-emerald-800' : 'text-orange-700'}`} numberOfLines={1} adjustsFontSizeToFit>
                    {netPositive ? '' : '-'}{formatCurrency(Math.abs(f.net))}
                  </Text>
                  <Text className={`text-xs mt-1 ${netPositive ? 'text-emerald-700' : 'text-orange-600'}`}>Net {netPositive ? 'Profit' : 'Loss'}</Text>
                </View>
              </View>

              <View className={isWeb ? 'flex-row gap-6 mt-4' : 'mt-4'}>
                <View className={isWeb ? 'flex-1' : ''}>
                  <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">Last 6 months</Text>
                  <MiniBarChart data={f.trend} height={isWeb ? 110 : 80} highlightMonth={f.month} />
                </View>
                <View className={isWeb ? 'flex-1' : 'mt-4'}>
                  <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">Top expenses</Text>
                  {topExpenses.length === 0 ? (
                    <Text className="text-gray-400 text-xs">No expenses recorded yet this month.</Text>
                  ) : topExpenses.map((row) => {
                    const meta = getCategoryMeta(LEDGER_CONFIG.expenses, row.category);
                    const pct = f.expense > 0 ? Math.round((row.total / f.expense) * 100) : 0;
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

              <View className="flex-row gap-2 mt-3">
                {hasPermission(user, 'expenses:manage') && (
                  <TouchableOpacity onPress={() => router.push('/finance/expenses/add' as any)} className="flex-1 bg-red-600 rounded-xl py-2.5 items-center flex-row justify-center">
                    <Ionicons name="remove-circle-outline" size={16} color="#fff" />
                    <Text className="text-white font-semibold text-sm ml-1.5">Add Expense</Text>
                  </TouchableOpacity>
                )}
                {hasPermission(user, 'income:manage') && (
                  <TouchableOpacity onPress={() => router.push('/finance/income/add' as any)} className="flex-1 bg-emerald-600 rounded-xl py-2.5 items-center flex-row justify-center">
                    <Ionicons name="add-circle-outline" size={16} color="#fff" />
                    <Text className="text-white font-semibold text-sm ml-1.5">Add Income</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => router.push('/reports/finance-ledger' as any)} className="flex-1 bg-slate-900 rounded-xl py-2.5 items-center flex-row justify-center">
                  <Ionicons name="list-outline" size={16} color="#fff" />
                  <Text className="text-white font-semibold text-sm ml-1.5">Ledger</Text>
                </TouchableOpacity>
              </View>
            </Card>
          );
        })()}

        {/* Cow Status */}
        <Card className="mb-4">
          <Text className="text-gray-700 font-semibold mb-3">Cow Status</Text>
          <View className="flex-row gap-2">
            {[
              { label: 'Total', value: d?.cows.total ?? 0, color: '#6B7280' },
              { label: 'Active', value: d?.cows.active ?? 0, color: '#16A34A' },
              { label: 'Pregnant', value: d?.cows.pregnant ?? 0, color: '#7C3AED' },
              { label: 'Dry', value: d?.cows.dryPeriod ?? 0, color: '#D97706' },
            ].map((item) => (
              <View key={item.label} className="flex-1 items-center">
                <Text className="text-xl font-bold" style={{ color: item.color }}>{item.value}</Text>
                <Text className="text-xs text-gray-500 mt-0.5">{item.label}</Text>
              </View>
            ))}
          </View>
          {(d?.pregnancies.dueSoon ?? 0) > 0 && (
            <View className="mt-3 bg-orange-50 rounded-xl p-3 flex-row items-center">
              <Ionicons name="warning-outline" size={16} color="#D97706" />
              <Text className="text-orange-700 text-sm ml-2 flex-1">
                {d?.pregnancies.dueSoon} cow(s) due to calve within 30 days!
              </Text>
            </View>
          )}
        </Card>

        {/* Payment Summary */}
        <Card className="mb-4">
          <Text className="text-gray-700 font-semibold mb-3">Payment Status</Text>
          <View className="flex-row gap-2">
            <View className="flex-1 bg-green-50 rounded-xl p-3 items-center">
              <Text className="text-green-600 text-xl font-bold">{d?.payments.paid ?? 0}</Text>
              <Text className="text-green-600 text-xs mt-1">Paid</Text>
            </View>
            <View className="flex-1 bg-red-50 rounded-xl p-3 items-center">
              <Text className="text-red-600 text-xl font-bold">{d?.payments.unpaid ?? 0}</Text>
              <Text className="text-red-600 text-xs mt-1">Unpaid</Text>
            </View>
            <View className="flex-1 bg-yellow-50 rounded-xl p-3 items-center">
              <Text className="text-yellow-600 text-xl font-bold">{d?.payments.pending ?? 0}</Text>
              <Text className="text-yellow-600 text-xs mt-1">Pending</Text>
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <Text className="text-gray-700 font-semibold mb-3">Quick Actions</Text>
        <View className="flex-row flex-wrap gap-3 mb-8">
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.label}
              onPress={() => router.push(action.href as any)}
              className="bg-white rounded-2xl p-4 items-center shadow-sm"
              style={{ width: '22%' }}
              activeOpacity={0.8}
            >
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mb-2"
                style={{ backgroundColor: `${action.color}15` }}
              >
                <Ionicons name={action.icon as any} size={20} color={action.color} />
              </View>
              <Text className="text-gray-600 text-xs font-medium text-center">{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      </View>
    </ScrollView>
  );
}
