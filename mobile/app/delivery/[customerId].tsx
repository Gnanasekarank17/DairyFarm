import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal, Alert, TextInput,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { customerRequestsApi, deliveriesApi, customersApi } from '../../src/api/endpoints';
import { Button } from '../../src/components/common/Button';
import { LoadingScreen } from '../../src/components/common/LoadingScreen';
import {
  formatMonthYear, formatDisplay, getMonthDateArray,
} from '../../src/utils/helpers';
import { REASON_CATEGORIES } from '../../src/types';
import type { CustomerDeliveryRequest, DeliveryRecord, Customer } from '../../src/types';
import { useAuthStore } from '../../src/store/authStore';
import { normalizeRole } from '../../src/utils/permissions';

function parseReasonData(raw: any): Record<string, { reason: string; comments: string }> {
  try { return typeof raw === 'string' ? JSON.parse(raw) : (raw || {}); }
  catch { return {}; }
}

// Earliest date a customer may dispute: the first day of the previous month.
function disputeWindowStart(): string {
  const n = new Date();
  const f = new Date(n.getFullYear(), n.getMonth() - 1, 1);
  return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-01`;
}

function requestsByDate(requests: CustomerDeliveryRequest[]) {
  return requests.reduce<Record<string, CustomerDeliveryRequest[]>>((acc, request) => {
    acc[request.requestDate] = [...(acc[request.requestDate] || []), request];
    return acc;
  }, {});
}

function CustomerRequestMarker({ requests }: { requests?: CustomerDeliveryRequest[] }) {
  if (!requests?.length) return null;
  const rejected = requests.find((request) => request.status === 'Rejected');
  const approved = requests.find((request) => request.status === 'Approved');
  const pending = requests.find((request) => request.status === 'Pending');
  const request = rejected || approved || pending || requests[0];
  const isExtra = request.requestType === 'extra_milk';
  const isDispute = request.requestType === 'dispute_delivery';
  const statusClass = request.status === 'Rejected'
    ? 'text-red-700'
    : request.status === 'Approved'
      ? 'text-green-700'
      : 'text-orange-600';
  const label = isExtra
    ? `+${parseFloat(request.extraQuantity || '0').toFixed(1)}L`
    : isDispute
      ? (String(request.claimedStatus).toLowerCase() === 'delivered' ? 'Says given' : 'Says missed')
      : (request.reason || 'Cancel');
  const labelClass = isExtra ? 'text-blue-700' : isDispute ? 'text-purple-700' : 'text-red-700';

  return (
    <View className="mt-0.5 items-center max-w-full">
      <Text className={`text-[8px] font-bold ${statusClass}`} numberOfLines={1}>
        {request.status}
      </Text>
      <Text className={`text-[8px] font-bold ${labelClass}`} numberOfLines={1}>
        {label}
      </Text>
      {request.status === 'Rejected' && request.actionReason ? (
        <Text className="text-[8px] font-bold text-red-700" numberOfLines={1}>{request.actionReason}</Text>
      ) : null}
    </View>
  );
}

export default function CustomerDeliveryScreen() {
  const { customerId, year: yearStr, month: monthStr } = useLocalSearchParams<{
    customerId: string; year: string; month: string;
  }>();
  const now = new Date();
  const year = parseInt(yearStr || String(now.getFullYear()));
  const month = parseInt(monthStr || String(now.getMonth() + 1));
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isCustomer = normalizeRole(user?.role) === 'customer';

  const [reasonModal, setReasonModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [comment, setComment] = useState('');
  const [disputeModal, setDisputeModal] = useState(false);
  const [disputeDate, setDisputeDate] = useState('');
  const [disputeClaim, setDisputeClaim] = useState<'Delivered' | 'Missed'>('Missed');
  const [disputeReason, setDisputeReason] = useState('');

  const { data: delivery, isLoading } = useQuery({
    queryKey: ['delivery', customerId, year, month],
    queryFn: () => deliveriesApi.getMonthly(customerId, year, month).then((r) => r.data.data as DeliveryRecord),
  });

  const { data: customer } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => customersApi.getById(customerId).then((r) => r.data.data as Customer),
    enabled: !isCustomer,
  });

  const { data: requests = [] } = useQuery({
    queryKey: ['customer-requests', year, month, customerId],
    queryFn: () => customerRequestsApi.getMonthly(year, month, customerId).then((r) => r.data.data as CustomerDeliveryRequest[]),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: any) => deliveriesApi.updateDay(customerId, year, month, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['delivery', customerId, year, month] });
      qc.invalidateQueries({ queryKey: ['deliveries-monthly'] });
      setReasonModal(false);
      setSelectedReason('');
      setComment('');
    },
    onError: () => Toast.show({ type: 'error', text1: 'Failed to update delivery' }),
  });

  const markAllMutation = useMutation({
    mutationFn: (delivered: boolean) => deliveriesApi.markAll(customerId, year, month, delivered),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['delivery', customerId, year, month] });
      Toast.show({ type: 'success', text1: 'Month updated' });
    },
  });

  const disputeMutation = useMutation({
    mutationFn: (payload: { requestDate: string; claimedStatus: string; reason: string }) =>
      customerRequestsApi.create({ customerId, requestType: 'dispute_delivery', ...payload }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer-requests', year, month, customerId] });
      qc.invalidateQueries({ queryKey: ['delivery', customerId, year, month] });
      setDisputeModal(false);
      setDisputeReason('');
      Toast.show({ type: 'success', text1: 'Report submitted for review' });
    },
    onError: (err: any) => Toast.show({ type: 'error', text1: err?.response?.data?.message || 'Failed to submit report' }),
  });

  if (isLoading || !delivery) return <LoadingScreen />;

  const deliveryData = typeof delivery.deliveryData === 'string'
    ? JSON.parse(delivery.deliveryData) : delivery.deliveryData;
  const reasonData = parseReasonData(delivery.reasonData);
  const missedDates = datesFromData(deliveryData).filter((date) => deliveryData[date] === false);
  const requestMap = requestsByDate(requests);

  const handleDayPress = (date: string) => {
    if (isCustomer) {
      const todayStr = new Date().toISOString().slice(0, 10);
      if (date > todayStr || date < disputeWindowStart()) {
        Toast.show({ type: 'info', text1: 'You can report issues only for this or last month' });
        return;
      }
      setDisputeDate(date);
      setDisputeClaim(deliveryData[date] === false ? 'Delivered' : 'Missed');
      setDisputeReason('');
      setDisputeModal(true);
      return;
    }

    const isDelivered = deliveryData[date] !== false;
    if (isDelivered) {
      // Marking as NOT delivered - show reason modal
      setSelectedDate(date);
      setReasonModal(true);
    } else {
      // Marking back as delivered
      Alert.alert(
        'Mark as Delivered',
        `Mark ${formatDisplay(date)} as delivered?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes',
            onPress: () => updateMutation.mutate({ date, delivered: true }),
          },
        ]
      );
    }
  };

  const handleConfirmMissed = () => {
    if (!selectedReason) {
      Toast.show({ type: 'error', text1: 'Please select a reason' });
      return;
    }
    updateMutation.mutate({
      date: selectedDate,
      delivered: false,
      reason: selectedReason,
      comments: comment,
    });
  };

  const dates = getMonthDateArray(year, month);
  const today = new Date().toISOString().slice(0, 10);
  const customerName = customer?.name || (isCustomer ? user?.name : '');
  const [currentYear, currentMonth] = today.split('-').map(Number);
  const billableDates = isCustomer
    ? dates.filter((date) => {
        if (year > currentYear || (year === currentYear && month > currentMonth)) return false;
        return year === currentYear && month === currentMonth ? date <= today : true;
      })
    : dates;
  const approvedRequests = requests.filter((request) => request.status === 'Approved');
  const approvedCancelDates = new Set(approvedRequests.filter((request) => request.requestType === 'cancel_delivery').map((request) => request.requestDate));
  const currentDeliveredDays = billableDates.filter((date) => deliveryData[date] !== false && !approvedCancelDates.has(date)).length;
  const currentMissedDays = billableDates.length - currentDeliveredDays;
  const currentExtraLiters = approvedRequests
    .filter((request) => request.requestType === 'extra_milk' && billableDates.includes(request.requestDate) && deliveryData[request.requestDate] !== false)
    .reduce((sum, request) => sum + parseFloat(request.extraQuantity || '0'), 0);

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1 ml-3">
            <Text className="text-xl font-bold text-gray-800">{customerName}</Text>
            <Text className="text-gray-500 text-sm">{formatMonthYear(year, month)}</Text>
          </View>
        </View>

        {/* Summary */}
        <View className="flex-row gap-2 mt-3">
          <View className="flex-1 bg-green-50 rounded-xl p-3 items-center">
            <Text className="text-green-600 font-bold text-xl">{isCustomer ? currentDeliveredDays : delivery.deliveredDays}</Text>
            <Text className="text-green-600 text-xs">Delivered</Text>
          </View>
          <View className="flex-1 bg-red-50 rounded-xl p-3 items-center">
            <Text className="text-red-600 font-bold text-xl">{isCustomer ? currentMissedDays : delivery.missedDays}</Text>
            <Text className="text-red-600 text-xs">Missed</Text>
          </View>
          <View className="flex-1 bg-blue-50 rounded-xl p-3 items-center">
            <Text className="text-blue-600 font-bold text-xl">{delivery.totalQuantity}L</Text>
            <Text className="text-blue-600 text-xs">Total</Text>
          </View>
          <View className="flex-1 bg-purple-50 rounded-xl p-3 items-center">
            <Text className="text-purple-600 font-bold text-lg">₹{parseFloat(delivery.totalAmount).toFixed(0)}</Text>
            <Text className="text-purple-600 text-xs">Amount</Text>
          </View>
        </View>
        {isCustomer && (
          <Text className="text-blue-100 text-xs mt-2 text-center">
            Current month counts up to {today}. Approved extra milk: {currentExtraLiters.toFixed(1)} L.
          </Text>
        )}

        {!isCustomer && (
          <View className="flex-row gap-2 mt-3">
            <TouchableOpacity
              onPress={() => markAllMutation.mutate(true)}
              className="flex-1 bg-green-600 rounded-xl py-2.5 items-center"
            >
              <Text className="text-white font-medium text-sm">✓ Mark All Delivered</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Alert.alert('Mark All Missed?', 'This will mark entire month as not delivered.',
                [{ text: 'Cancel' }, { text: 'Yes', onPress: () => markAllMutation.mutate(false) }])}
              className="flex-1 bg-red-600 rounded-xl py-2.5 items-center"
            >
              <Text className="text-white font-medium text-sm">✗ Mark All Missed</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Calendar Grid */}
      <ScrollView className="flex-1 p-4">
        <Text className="text-gray-500 text-xs mb-3 text-center">
          {isCustomer ? 'Green = milk given, red = not given. Tap a day (this or last month) to report a wrong entry.' : 'Tap a date to toggle delivery status. Green = Delivered, Red = Not Delivered.'}
        </Text>

        <View className="bg-white rounded-2xl p-4 shadow-sm">
          {/* Weekday headers */}
          <View className="flex-row mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <View key={d} className="flex-1 items-center">
                <Text className="text-gray-400 text-xs font-medium">{d}</Text>
              </View>
            ))}
          </View>

          {/* Calendar days */}
          {(() => {
            const firstDay = new Date(year, month - 1, 1).getDay();
            const rows = [];
            let dayIndex = 0;

            while (dayIndex < dates.length) {
              const row = [];
              for (let col = 0; col < 7; col++) {
                if (rows.length === 0 && col < firstDay) {
                  row.push(<View key={`empty-${col}`} className="flex-1" />);
                } else if (dayIndex < dates.length) {
                  const date = dates[dayIndex];
                  const isDelivered = deliveryData[date] !== false;
                  const isToday = date === today;
                  const missedReason = reasonData[date];
                  const dayRequests = requestMap[date] || [];
                  const dayNum = dayIndex + 1;
                  dayIndex++;

                  row.push(
                    <TouchableOpacity
                      key={date}
                      onPress={() => handleDayPress(date)}
                      disabled={isCustomer && (date > today || date < disputeWindowStart())}
                      className={`flex-1 aspect-square m-0.5 rounded-xl items-center justify-center
                        ${isDelivered ? 'bg-green-100' : 'bg-red-100'}
                        ${isToday ? 'border-2 border-blue-500' : ''}
                      `}
                      activeOpacity={0.7}
                    >
                      <Text className={`text-sm font-semibold ${isDelivered ? 'text-green-700' : 'text-red-700'}`}>
                        {dayNum}
                      </Text>
                      <Text className={`text-xs ${isDelivered ? 'text-green-500' : 'text-red-500'}`}>
                        {isDelivered ? '✓' : '✗'}
                      </Text>
                      {!isDelivered && missedReason?.reason && (
                        <Text className="text-[8px] text-red-700 font-bold mt-0.5" numberOfLines={1}>
                          {missedReason.reason}
                        </Text>
                      )}
                      <CustomerRequestMarker requests={dayRequests} />
                    </TouchableOpacity>
                  );
                } else {
                  row.push(<View key={`end-${col}`} className="flex-1" />);
                }
              }
              rows.push(
                <View key={rows.length} className="flex-row mb-1">{row}</View>
              );
              if (dayIndex >= dates.length && rows[rows.length - 1].props.children.every(
                (c: any) => c.type === View
              )) break;
            }
            return rows;
          })()}
        </View>

        {missedDates.length > 0 && (
          <View className="bg-white rounded-2xl p-4 shadow-sm mt-4">
            <Text className="text-gray-700 font-semibold mb-3">Missing Delivery Dates</Text>
            {missedDates.map((date) => (
              <View key={date} className="border-t border-gray-100 py-3">
                <Text className="text-red-700 font-semibold">{formatDisplay(date)}</Text>
                <Text className="text-gray-500 text-xs mt-1">
                  {reasonData[date]?.reason || 'No reason recorded'}{reasonData[date]?.comments ? ` - ${reasonData[date].comments}` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}

        {requests.length > 0 && (
          <View className="bg-white rounded-2xl p-4 shadow-sm mt-4">
            <Text className="text-gray-700 font-semibold mb-3">Milk Request Status</Text>
            {requests.map((request) => (
              <View key={request.id} className="border-t border-gray-100 py-3">
                <Text className="text-gray-800 font-semibold">
                  {formatDisplay(request.requestDate)} · {
                    request.requestType === 'extra_milk'
                      ? `Extra ${parseFloat(request.extraQuantity || '0').toFixed(1)} L`
                      : request.requestType === 'dispute_delivery'
                        ? `Report: ${String(request.claimedStatus).toLowerCase() === 'delivered' ? 'milk was given' : 'milk not given'}`
                        : 'Cancel milk'
                  }
                </Text>
                <Text className={`text-xs mt-1 font-semibold ${request.status === 'Rejected' ? 'text-red-700' : request.status === 'Approved' ? 'text-green-700' : 'text-orange-600'}`}>
                  {request.status}{request.actionReason ? ` - ${request.actionReason}` : ''}
                </Text>
                <Text className="text-gray-500 text-xs mt-1">{request.reason || 'No request reason'}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Legend */}
        <View className="flex-row gap-4 mt-3 justify-center">
          <View className="flex-row items-center gap-1">
            <View className="w-4 h-4 rounded bg-green-100 items-center justify-center">
              <Text className="text-green-700 text-xs">✓</Text>
            </View>
            <Text className="text-gray-500 text-xs">Delivered</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <View className="w-4 h-4 rounded bg-red-100 items-center justify-center">
              <Text className="text-red-700 text-xs">✗</Text>
            </View>
            <Text className="text-gray-500 text-xs">Not Delivered</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <View className="w-4 h-4 rounded border-2 border-blue-500 bg-green-100" />
            <Text className="text-gray-500 text-xs">Today</Text>
          </View>
        </View>
      </ScrollView>

      {/* Reason Modal */}
      <Modal visible={reasonModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-5">
            <Text className="text-gray-800 text-lg font-bold mb-1">Mark as Not Delivered</Text>
            <Text className="text-gray-500 text-sm mb-4">
              {selectedDate && formatDisplay(selectedDate)}
            </Text>

            <Text className="text-gray-700 font-medium mb-2">Reason <Text className="text-red-500">*</Text></Text>
            <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
              {REASON_CATEGORIES.map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setSelectedReason(r)}
                  className={`p-3 rounded-xl mb-2 border ${selectedReason === r ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}
                >
                  <Text className={selectedReason === r ? 'text-blue-600 font-medium' : 'text-gray-700'}>{r}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View className="flex-row gap-3 mt-4">
              <Button title="Cancel" variant="secondary" onPress={() => setReasonModal(false)} className="flex-1" />
              <Button
                title="Confirm"
                variant="danger"
                onPress={handleConfirmMissed}
                loading={updateMutation.isPending}
                className="flex-1"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Dispute Modal — customer reports a wrong delivery entry */}
      <Modal visible={disputeModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-5">
            <Text className="text-gray-800 text-lg font-bold mb-1">Report Wrong Entry</Text>
            <Text className="text-gray-500 text-sm mb-4">{disputeDate && formatDisplay(disputeDate)}</Text>

            <View className="bg-gray-50 rounded-xl p-3 mb-4">
              <Text className="text-gray-500 text-xs">Currently recorded as</Text>
              <Text className={`font-semibold ${deliveryData[disputeDate] === false ? 'text-red-600' : 'text-green-700'}`}>
                {deliveryData[disputeDate] === false ? 'Not delivered' : 'Delivered'}
              </Text>
            </View>

            <Text className="text-gray-700 font-medium mb-2">What actually happened?</Text>
            <View className="flex-row gap-3 mb-4">
              <TouchableOpacity
                onPress={() => setDisputeClaim('Missed')}
                className={`flex-1 p-3 rounded-xl border items-center ${disputeClaim === 'Missed' ? 'border-red-600 bg-red-50' : 'border-gray-200'}`}
              >
                <Text className={disputeClaim === 'Missed' ? 'text-red-600 font-semibold' : 'text-gray-700'}>I did NOT get milk</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setDisputeClaim('Delivered')}
                className={`flex-1 p-3 rounded-xl border items-center ${disputeClaim === 'Delivered' ? 'border-green-600 bg-green-50' : 'border-gray-200'}`}
              >
                <Text className={disputeClaim === 'Delivered' ? 'text-green-700 font-semibold' : 'text-gray-700'}>I DID get milk</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-gray-700 font-medium mb-2">Details <Text className="text-red-500">*</Text></Text>
            <TextInput
              value={disputeReason}
              onChangeText={setDisputeReason}
              placeholder="e.g. No delivery came on this day"
              multiline
              className="border border-gray-200 rounded-xl px-3 py-3 text-gray-800 bg-gray-50 text-sm min-h-[80px]"
            />

            <Text className="text-gray-400 text-xs mt-2">An admin will review and correct your record if approved.</Text>

            <View className="flex-row gap-3 mt-4">
              <Button title="Cancel" variant="secondary" onPress={() => setDisputeModal(false)} className="flex-1" />
              <Button
                title="Submit Report"
                onPress={() => {
                  if (!disputeReason.trim()) { Toast.show({ type: 'error', text1: 'Please add details' }); return; }
                  disputeMutation.mutate({ requestDate: disputeDate, claimedStatus: disputeClaim, reason: disputeReason.trim() });
                }}
                loading={disputeMutation.isPending}
                className="flex-1"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function datesFromData(data: Record<string, boolean>) {
  return Object.keys(data).sort();
}
