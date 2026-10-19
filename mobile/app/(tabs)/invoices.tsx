import React, { useMemo, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, RefreshControl, Alert, Linking, ScrollView, Platform, TextInput, useWindowDimensions,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { customersApi, invoicesApi } from '../../src/api/endpoints';
import { Badge } from '../../src/components/common/Badge';
import { EmptyState } from '../../src/components/common/EmptyState';
import { LoadingScreen } from '../../src/components/common/LoadingScreen';
import { MonthPicker } from '../../src/components/common/MonthPicker';
import { InvoicesDataGrid } from '../../src/components/grid/InvoicesDataGrid';
import { useAuthStore } from '../../src/store/authStore';
import { hasPermission } from '../../src/utils/permissions';
import { formatCurrency, formatMonthYear } from '../../src/utils/helpers';
import type { Customer, Invoice } from '../../src/types';

const STATUS_BADGE: Record<string, 'success' | 'error' | 'warning'> = {
  Paid: 'success', Pending: 'error', Partial: 'warning',
};

export default function InvoicesTab() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedCustomerId, setSelectedCustomerId] = useState('all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Paid' | 'Partial' | 'Pending'>('all');
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const user = useAuthStore((s) => s.user);
  const canManage = hasPermission(user, 'billing:manage');
  // Grid (PCB EnterpriseGrid) is the default on wide web; cards everywhere else. User can toggle.
  const [viewMode, setViewMode] = useState<'cards' | 'grid'>(isWeb && width >= 900 ? 'grid' : 'cards');
  const qc = useQueryClient();

  const { data: invoices = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['invoices', year, month, selectedCustomerId],
    queryFn: () => invoicesApi.getAll(year, month, selectedCustomerId === 'all' ? undefined : selectedCustomerId).then((r) => r.data.data as Invoice[]),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers-active'],
    queryFn: () => customersApi.getAll('true').then((r) => r.data.data as Customer[]),
  });

  const generateMutation = useMutation({
    mutationFn: () => invoicesApi.generate(year, month, selectedCustomerId === 'all' ? undefined : selectedCustomerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices', year, month] });
      Toast.show({ type: 'success', text1: selectedCustomerId === 'all' ? 'Invoices recalculated' : 'Customer invoice recalculated' });
    },
    onError: () => Toast.show({ type: 'error', text1: 'Failed to generate invoices' }),
  });

  const monthlyWhatsAppMutation = useMutation({
    mutationFn: () => invoicesApi.sendMonthlyWhatsApp(year, month),
    onSuccess: (response) => {
      const data = response.data.data;
      const fallback = (data.results || []).find((item: any) => !item.sent && item.whatsappUrl);

      if (data.sent === 0 && fallback?.whatsappUrl) {
        Linking.openURL(fallback.whatsappUrl);
      }

      Toast.show({
        type: data.sent > 0 ? 'success' : 'info',
        text1: `WhatsApp sent: ${data.sent}, failed: ${data.failed}, skipped: ${data.skipped}`,
        text2: `Total billing: ${formatCurrency(parseFloat(data.totalAmount || '0'))}`,
      });
    },
    onError: () => Toast.show({ type: 'error', text1: 'Failed to send monthly WhatsApp bills' }),
  });

  const openInvoiceMessage = async (invoiceId: string, channel: 'whatsapp' | 'sms') => {
    try {
      const response = await invoicesApi.getWhatsAppLink(invoiceId);
      const data = response.data.data;
      const url = channel === 'whatsapp' ? data.link : data.smsUrl;

      if (!url) {
        Toast.show({ type: 'info', text1: 'Customer mobile number is missing' });
        return;
      }

      await Linking.openURL(url);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to open message' });
    }
  };

  const goToPayment = (inv: Invoice) => router.push(
    `/payments/record?invoiceId=${inv.id}&customerId=${inv.customerId}&amount=${inv.amount}&name=${encodeURIComponent(inv.customerName)}` as any,
  );

  const confirmGenerateInvoices = () => {
    const message = `Calculate ${selectedCustomerId === 'all' ? 'all customer invoices' : 'selected customer invoice'} for ${formatMonthYear(year, month)}?`;

    if (Platform.OS === 'web') {
      if (globalThis.confirm(message)) generateMutation.mutate();
      return;
    }

    Alert.alert('Generate Invoices', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Generate', onPress: () => generateMutation.mutate() },
    ]);
  };

  // Client-side filters on top of the month/customer query: name / invoice no / mobile search + status.
  const filteredInvoices = useMemo(() => {
    const q = search.trim().toLowerCase();
    return invoices.filter((i) => {
      if (statusFilter !== 'all' && i.paymentStatus !== statusFilter) return false;
      if (!q) return true;
      return [i.customerName, i.invoiceNumber, (i as any).mobile].some((v) => String(v ?? '').toLowerCase().includes(q));
    });
  }, [invoices, search, statusFilter]);

  const totalRevenue = filteredInvoices.reduce((s, i) => s + parseFloat(i.amount || '0'), 0);
  const paidCount = filteredInvoices.filter((i) => i.paymentStatus === 'Paid').length;
  const statusCounts = {
    all: invoices.length,
    Paid: invoices.filter((i) => i.paymentStatus === 'Paid').length,
    Partial: invoices.filter((i) => i.paymentStatus === 'Partial').length,
    Pending: invoices.filter((i) => i.paymentStatus === 'Pending').length,
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xl font-bold text-gray-800">Invoices</Text>
          {isWeb && (
            <View className="flex-row bg-gray-100 rounded-xl p-1">
              {([
                { key: 'grid', icon: 'grid-outline', label: 'Grid' },
                { key: 'cards', icon: 'albums-outline', label: 'Cards' },
              ] as const).map((v) => {
                const active = viewMode === v.key;
                return (
                  <TouchableOpacity
                    key={v.key}
                    onPress={() => setViewMode(v.key)}
                    className={`flex-row items-center px-3 py-1.5 rounded-lg ${active ? 'bg-white shadow-sm' : ''}`}
                  >
                    <Ionicons name={v.icon} size={14} color={active ? '#0F172A' : '#64748B'} />
                    <Text className={`text-xs font-semibold ml-1 ${active ? 'text-gray-900' : 'text-gray-500'}`}>{v.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
        <MonthPicker year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} className="mb-3" />

        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2 mb-3">
          <Ionicons name="search-outline" size={18} color="#64748B" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by customer name, invoice no. or mobile"
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-2 text-gray-800"
            style={Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : undefined}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')} accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}
        </View>

        <View className="flex-row gap-2 mb-3">
          {([
            { key: 'all', label: 'All', on: 'bg-slate-900 border-slate-900', text: 'text-white' },
            { key: 'Paid', label: 'Paid', on: 'bg-green-600 border-green-600', text: 'text-white' },
            { key: 'Partial', label: 'Partial', on: 'bg-amber-500 border-amber-500', text: 'text-white' },
            { key: 'Pending', label: 'Pending', on: 'bg-red-600 border-red-600', text: 'text-white' },
          ] as const).map((f) => {
            const active = statusFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                onPress={() => setStatusFilter(f.key)}
                className={`flex-1 flex-row items-center justify-center px-2 py-1.5 rounded-xl border ${active ? f.on : 'bg-white border-gray-200'}`}
              >
                <Text className={`text-xs font-semibold ${active ? f.text : 'text-gray-600'}`}>{f.label}</Text>
                <Text className={`text-[10px] ml-1 ${active ? 'text-white/80' : 'text-gray-400'}`}>{statusCounts[f.key]}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
          <TouchableOpacity
            onPress={() => setSelectedCustomerId('all')}
            className={`mr-2 px-3 py-2 rounded-xl border ${selectedCustomerId === 'all' ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'}`}
          >
            <Text className={selectedCustomerId === 'all' ? 'text-white font-semibold' : 'text-gray-600'}>All Customers</Text>
          </TouchableOpacity>
          {customers.map((customer) => (
            <TouchableOpacity
              key={customer.id}
              onPress={() => setSelectedCustomerId(customer.id)}
              className={`mr-2 px-3 py-2 rounded-xl border ${selectedCustomerId === customer.id ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'}`}
            >
              <Text className={selectedCustomerId === customer.id ? 'text-white font-semibold' : 'text-gray-600'}>{customer.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View className="flex-row gap-2 mb-3">
          <View className="flex-1 bg-blue-50 rounded-xl p-2 items-center">
            <Text className="text-blue-600 font-bold">{formatCurrency(totalRevenue)}</Text>
            <Text className="text-blue-600 text-xs">Total Revenue</Text>
          </View>
          <View className="flex-1 bg-green-50 rounded-xl p-2 items-center">
            <Text className="text-green-600 font-bold">{paidCount}/{invoices.length}</Text>
            <Text className="text-green-600 text-xs">Paid</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={confirmGenerateInvoices}
          className="bg-blue-600 rounded-xl py-3 items-center flex-row justify-center"
        >
          {generateMutation.isPending
            ? <Text className="text-white font-semibold">Generating...</Text>
            : <>
                <Ionicons name="document-text-outline" size={18} color="white" />
                <Text className="text-white font-semibold ml-2">{selectedCustomerId === 'all' ? 'Generate Invoices' : 'Generate Selected Invoice'}</Text>
              </>
          }
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => monthlyWhatsAppMutation.mutate()}
          disabled={monthlyWhatsAppMutation.isPending || invoices.length === 0}
          className={`mt-2 rounded-xl py-3 items-center flex-row justify-center ${invoices.length === 0 ? 'bg-gray-300' : 'bg-green-600'}`}
        >
          {monthlyWhatsAppMutation.isPending
            ? <Text className="text-white font-semibold">Sending WhatsApp bills...</Text>
            : <>
                <Ionicons name="logo-whatsapp" size={18} color="white" />
                <Text className="text-white font-semibold ml-2">Send Monthly WhatsApp Bills</Text>
              </>
          }
        </TouchableOpacity>
      </View>

      {viewMode === 'grid' ? (
        <ScrollView className="flex-1 pt-4" refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}>
          {filteredInvoices.length === 0 ? (
            invoices.length > 0
              ? <EmptyState icon="search-outline" title="No matching invoices" subtitle={`Nothing matches the current filters for ${formatMonthYear(year, month)}.`} />
              : <EmptyState icon="receipt-outline" title="No invoices" subtitle={`No invoices for ${formatMonthYear(year, month)} yet. Tap 'Generate Invoices' to create them.`} />
          ) : (
            <InvoicesDataGrid invoices={filteredInvoices} onMessage={openInvoiceMessage} onPay={goToPayment} canManage={canManage} />
          )}
          <View className="h-8" />
        </ScrollView>
      ) : (
      <FlatList
        data={filteredInvoices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          invoices.length > 0
            ? <EmptyState icon="search-outline" title="No matching invoices" subtitle={`No ${statusFilter === 'all' ? '' : statusFilter.toLowerCase() + ' '}invoices match "${search}" for ${formatMonthYear(year, month)}.`} />
            : <EmptyState icon="receipt-outline" title="No invoices" subtitle={`No invoices for ${formatMonthYear(year, month)} yet. Tap 'Generate Invoices' to create them.`} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/invoices/${item.id}`)}
            className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
            activeOpacity={0.8}
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="text-gray-800 font-semibold text-base">{item.customerName}</Text>
                <Text className="text-gray-400 text-xs mt-0.5">{item.invoiceNumber}</Text>
                <View className="flex-row items-center gap-3 mt-2">
                  <Text className="text-gray-500 text-sm">📅 {item.deliveredDays} days</Text>
                  <Text className="text-gray-500 text-sm">🥛 {item.totalQuantity}L</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-gray-800 font-bold text-lg">{formatCurrency(parseFloat(item.amount))}</Text>
                {parseFloat(item.deliveryCharge || '0') > 0 && (
                  <Text className="text-gray-400 text-[11px] mt-0.5">
                    incl. {formatCurrency(parseFloat(item.deliveryCharge))} delivery
                  </Text>
                )}
                <Badge label={item.paymentStatus} variant={STATUS_BADGE[item.paymentStatus] || 'warning'} />
              </View>
            </View>
            <View className="flex-row gap-2 mt-3">
              <TouchableOpacity
                onPress={() => openInvoiceMessage(item.id, 'whatsapp')}
                className="flex-1 bg-green-50 rounded-xl py-2 items-center flex-row justify-center gap-1"
              >
                <Ionicons name="logo-whatsapp" size={16} color="#16A34A" />
                <Text className="text-green-700 text-sm font-medium">WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => openInvoiceMessage(item.id, 'sms')}
                className="flex-1 bg-slate-50 rounded-xl py-2 items-center flex-row justify-center gap-1"
              >
                <Ionicons name="chatbubble-ellipses-outline" size={16} color="#475569" />
                <Text className="text-slate-700 text-sm font-medium">SMS</Text>
              </TouchableOpacity>
              {canManage && item.paymentStatus !== 'Paid' && (
              <TouchableOpacity
                onPress={() => goToPayment(item)}
                className="flex-1 bg-blue-50 rounded-xl py-2 items-center flex-row justify-center gap-1"
              >
                <Ionicons name="cash-outline" size={16} color="#2563EB" />
                <Text className="text-blue-700 text-sm font-medium">Pay</Text>
              </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
      )}
    </View>
  );
}
