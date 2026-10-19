import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Linking, RefreshControl, useWindowDimensions } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import apiClient from '../../src/api/client';
import { invoicesApi, paymentsApi } from '../../src/api/endpoints';
import { Badge } from '../../src/components/common/Badge';
import { Card } from '../../src/components/common/Card';
import { EmptyState } from '../../src/components/common/EmptyState';
import { LoadingScreen } from '../../src/components/common/LoadingScreen';
import { formatCurrency, formatDisplay, formatMonthYear } from '../../src/utils/helpers';
import { useAuthStore } from '../../src/store/authStore';
import { hasPermission } from '../../src/utils/permissions';
import type { Invoice, Payment } from '../../src/types';

const STATUS_BADGE: Record<string, 'success' | 'error' | 'warning'> = {
  Paid: 'success', Pending: 'error', Partial: 'warning',
};

// MissedDetails holds either a bare array of {date,reason} or { missed: [...], extras: [...] }.
function parseMissedDates(raw: unknown): { date: string; reason?: string }[] {
  if (!raw) return [];
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const arr = Array.isArray(parsed) ? parsed : (parsed as any)?.missed;
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

const num = (v: unknown) => {
  const n = parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : 0;
};

function Row({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <View className="flex-row justify-between py-2 border-b border-gray-100">
      <Text className="text-gray-500 text-sm">{label}</Text>
      <Text className={`text-gray-800 text-sm ${bold ? 'font-bold' : 'font-medium'}`}>{value}</Text>
    </View>
  );
}

function ActionButton({ icon, label, onPress, bg, fg, disabled }: {
  icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; bg: string; fg: string; disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`flex-1 rounded-xl py-2.5 items-center flex-row justify-center gap-1 ${bg} ${disabled ? 'opacity-50' : ''}`}
      style={{ minWidth: 110 }}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={16} color={fg} />
      <Text className="text-sm font-medium ml-1" style={{ color: fg }}>{label}</Text>
    </TouchableOpacity>
  );
}

// Invoice detail: billing breakdown, missed dates, payment history, and send/pay/download actions.
export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const canManage = hasPermission(user, 'billing:manage');
  const [downloading, setDownloading] = useState(false);
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width >= 900;

  const { data: invoice, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoicesApi.getById(id as string).then((r) => r.data.data as Invoice),
    enabled: !!id,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['invoice-payments', id],
    queryFn: () => paymentsApi.getAll({ invoiceId: id }).then((r) => r.data.data as Payment[]),
    enabled: !!id,
  });

  const emailMutation = useMutation({
    mutationFn: () => invoicesApi.sendEmail(id as string),
    onSuccess: () => Toast.show({ type: 'success', text1: 'Invoice emailed to customer' }),
    onError: (err: any) => Toast.show({ type: 'error', text1: err?.response?.data?.message || 'Failed to send email' }),
  });

  const openMessage = async (channel: 'whatsapp' | 'sms') => {
    try {
      const response = await invoicesApi.getWhatsAppLink(id as string);
      const url = channel === 'whatsapp' ? response.data.data.link : response.data.data.smsUrl;
      if (!url) { Toast.show({ type: 'info', text1: 'Customer mobile number is missing' }); return; }
      await Linking.openURL(url);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to open message' });
    }
  };

  // The PDF endpoint needs the bearer token, so a plain link will not work: fetch it, then open/share.
  const downloadPdf = async () => {
    if (!invoice) return;
    setDownloading(true);
    const fileName = `invoice-${invoice.invoiceNumber}.pdf`;
    try {
      if (Platform.OS === 'web') {
        const res = await apiClient.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
        const url = URL.createObjectURL(res.data as Blob);
        const a = document.createElement('a');
        a.href = url; a.download = fileName; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
      } else {
        const token = await AsyncStorage.getItem('auth_token');
        const target = `${FileSystem.cacheDirectory}${fileName}`;
        const result = await FileSystem.downloadAsync(invoicesApi.getPdfUrl(id as string), target, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (result.status !== 200) throw new Error(`HTTP ${result.status}`);
        if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(result.uri, { mimeType: 'application/pdf' });
        else Toast.show({ type: 'success', text1: 'PDF saved', text2: result.uri });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to download PDF' });
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) return <LoadingScreen message="Loading invoice..." />;

  if (isError || !invoice) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="bg-white pt-14 pb-4 px-4 shadow-sm flex-row items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800 ml-4">Invoice</Text>
        </View>
        <EmptyState icon="receipt-outline" title="Invoice not found" subtitle="It may have been regenerated or deleted. Go back to the invoices list." />
      </View>
    );
  }

  const amount = num(invoice.amount);
  const deliveryCharge = num(invoice.deliveryCharge);
  const milkAmount = Math.max(0, amount - deliveryCharge);
  const paid = payments.reduce((s, p) => s + num(p.amountPaid), 0);
  const balance = Math.max(0, amount - paid);
  const missed = parseMissedDates(invoice.missedDetails);
  const isWeb = Platform.OS === 'web';
  const amountClass = isWide ? 'text-xl' : 'text-base';
  const isPaid = invoice.paymentStatus === 'Paid';

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <View className="flex-1 ml-4">
          <Text className="text-xl font-bold text-gray-800">{invoice.invoiceNumber}</Text>
          <Text className="text-gray-400 text-xs">{formatMonthYear(Number(invoice.year), Number(invoice.month))}</Text>
        </View>
        <Badge label={invoice.paymentStatus} variant={STATUS_BADGE[invoice.paymentStatus] || 'warning'} />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <View className="p-4" style={{ width: '100%', maxWidth: isWeb ? 960 : undefined, alignSelf: 'center' }}>
          {/* Amount summary */}
          <Card className="mb-4">
            <TouchableOpacity onPress={() => router.push(`/customers/${invoice.customerId}` as any)} className="flex-row items-center mb-3">
              <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center mr-3">
                <Ionicons name="person-outline" size={20} color="#2563EB" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 font-semibold text-base">{invoice.customerName}</Text>
                <Text className="text-blue-600 text-xs">View customer →</Text>
              </View>
            </TouchableOpacity>
            <View className="flex-row gap-2">
              <View className="flex-1 bg-slate-900 rounded-xl p-3">
                <Text className="text-slate-300 text-xs">Invoice Total</Text>
                <Text className={`text-white ${amountClass} font-bold mt-0.5`}>{formatCurrency(amount)}</Text>
              </View>
              <View className="flex-1 bg-green-50 rounded-xl p-3">
                <Text className="text-green-600 text-xs">Paid</Text>
                <Text className={`text-green-700 ${amountClass} font-bold mt-0.5`}>{formatCurrency(paid)}</Text>
              </View>
              <View className={`flex-1 rounded-xl p-3 ${balance > 0 ? 'bg-red-50' : 'bg-emerald-50'}`}>
                <Text className={`text-xs ${balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>Balance</Text>
                <Text className={`${amountClass} font-bold mt-0.5 ${balance > 0 ? 'text-red-700' : 'text-emerald-700'}`}>{formatCurrency(balance)}</Text>
              </View>
            </View>
          </Card>

          {/* Actions */}
          <View className="flex-row flex-wrap gap-2 mb-4">
            {canManage && !isPaid && (
              <ActionButton
                icon="cash-outline" label="Record Payment" bg="bg-blue-600" fg="#ffffff"
                onPress={() => router.push(`/payments/record?invoiceId=${invoice.id}&customerId=${invoice.customerId}&amount=${balance}&name=${encodeURIComponent(invoice.customerName)}` as any)}
              />
            )}
            <ActionButton icon="logo-whatsapp" label="WhatsApp" bg="bg-green-50" fg="#15803D" onPress={() => openMessage('whatsapp')} />
            <ActionButton icon="chatbubble-ellipses-outline" label="SMS" bg="bg-slate-100" fg="#334155" onPress={() => openMessage('sms')} />
            {canManage && (
              <ActionButton icon="mail-outline" label={emailMutation.isPending ? 'Sending…' : 'Email'} bg="bg-purple-50" fg="#6D28D9" onPress={() => emailMutation.mutate()} disabled={emailMutation.isPending} />
            )}
            <ActionButton icon="download-outline" label={downloading ? 'Preparing…' : 'PDF'} bg="bg-amber-50" fg="#B45309" onPress={downloadPdf} disabled={downloading} />
          </View>

          <View className={isWide ? 'flex-row gap-4' : ''}>
            {/* Billing breakdown */}
            <Card className={`mb-4 ${isWide ? 'flex-1' : ''}`}>
              <Text className="text-gray-700 font-semibold mb-2">Billing Details</Text>
              <Row label="Billing month" value={formatMonthYear(Number(invoice.year), Number(invoice.month))} />
              <Row label="Daily quantity" value={`${num(invoice.dailyQuantity)} L`} />
              <Row label="Rate per litre" value={formatCurrency(invoice.ratePerLiter)} />
              <Row label="Delivered days" value={String(num(invoice.deliveredDays))} />
              <Row label="Missed days" value={String(num(invoice.missedDays))} />
              <Row label="Total quantity" value={`${num(invoice.totalQuantity)} L`} />
              <Row label="Milk amount" value={formatCurrency(milkAmount)} />
              {deliveryCharge > 0 && <Row label="Delivery charge" value={formatCurrency(deliveryCharge)} />}
              <Row label="Invoice total" value={formatCurrency(amount)} bold />
              <Text className="text-gray-400 text-xs mt-2">Generated {invoice.createdAt ? formatDisplay(invoice.createdAt) : '—'}</Text>
            </Card>

            <View className={isWide ? 'flex-1' : ''}>
              {/* Missed deliveries */}
              <Card className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">Missed Deliveries ({missed.length})</Text>
                {missed.length === 0 ? (
                  <Text className="text-gray-400 text-sm">No missed deliveries this month.</Text>
                ) : missed.map((m, i) => (
                  <View key={`${m.date}-${i}`} className="flex-row items-start py-2 border-b border-gray-100">
                    <Ionicons name="close-circle-outline" size={16} color="#DC2626" style={{ marginTop: 2 }} />
                    <View className="flex-1 ml-2">
                      <Text className="text-gray-800 text-sm font-medium">{m.date ? formatDisplay(m.date) : '—'}</Text>
                      {m.reason ? <Text className="text-gray-400 text-xs mt-0.5">{m.reason}</Text> : null}
                    </View>
                  </View>
                ))}
              </Card>

              {/* Payment history */}
              <Card className="mb-8">
                <Text className="text-gray-700 font-semibold mb-2">Payments ({payments.length})</Text>
                {payments.length === 0 ? (
                  <Text className="text-gray-400 text-sm">No payments recorded yet.</Text>
                ) : payments.map((p) => (
                  <View key={p.id} className="flex-row items-center py-2 border-b border-gray-100">
                    <View className="w-8 h-8 rounded-lg bg-green-50 items-center justify-center mr-3">
                      <Ionicons name="checkmark-done-outline" size={16} color="#16A34A" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-800 text-sm font-medium">{formatCurrency(p.amountPaid)}</Text>
                      <Text className="text-gray-400 text-xs">
                        {p.paymentDate ? formatDisplay(p.paymentDate) : '—'} • {p.paymentMode || 'Cash'}{p.notes ? ` • ${p.notes}` : ''}
                      </Text>
                    </View>
                    <Badge label={p.status} variant={STATUS_BADGE[p.status] || 'warning'} />
                  </View>
                ))}
              </Card>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
