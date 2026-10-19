import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert, FlatList, Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { deliveriesApi, customersApi, customerRequestsApi } from '../../src/api/endpoints';
import { LoadingScreen } from '../../src/components/common/LoadingScreen';
import { Button } from '../../src/components/common/Button';
import {
  formatMonthYear, formatDisplay, getMonthDateArray, today as todayFn,
} from '../../src/utils/helpers';
import { REASON_CATEGORIES } from '../../src/types';
import type { CustomerDeliveryRequest, DeliveryRecord, Customer } from '../../src/types';
import { hasPermission, normalizeRole } from '../../src/utils/permissions';
import { useAuthStore } from '../../src/store/authStore';

// ─── helpers ──────────────────────────────────────────────────────────────────
function parseData(raw: any): Record<string, boolean> {
  try { return typeof raw === 'string' ? JSON.parse(raw) : (raw || {}); }
  catch { return {}; }
}

function parseReasonData(raw: any): Record<string, { reason: string; comments: string }> {
  try { return typeof raw === 'string' ? JSON.parse(raw) : (raw || {}); }
  catch { return {}; }
}

function requestsByDate(requests: CustomerDeliveryRequest[]) {
  return requests.reduce<Record<string, CustomerDeliveryRequest[]>>((acc, request) => {
    acc[request.requestDate] = [...(acc[request.requestDate] || []), request];
    return acc;
  }, {});
}

function RequestMarker({ requests }: { requests?: CustomerDeliveryRequest[] }) {
  if (!requests?.length) return null;
  const cancellation = requests.find((request) => request.requestType === 'cancel_delivery');
  const extra = requests.find((request) => request.requestType === 'extra_milk');
  const dispute = requests.find((request) => request.requestType === 'dispute_delivery');

  return (
    <View className="mt-0.5 items-center">
      {cancellation && <Text className="text-[8px] font-bold text-red-700" numberOfLines={1}>{cancellation.reason || 'Cancelled'}</Text>}
      {dispute && <Text className="text-[8px] font-bold text-purple-700" numberOfLines={1}>⚠ {dispute.status === 'Pending' ? 'Dispute' : dispute.status}</Text>}
      {extra && (
        <Text
          className="text-[8px] font-bold text-blue-700 animate-pulse"
          numberOfLines={1}
          style={Platform.OS === 'web' ? ({ animation: 'pulse 1s infinite' } as any) : undefined}
        >
          +{parseFloat(extra.extraQuantity || '0').toFixed(1)}L
        </Text>
      )}
    </View>
  );
}

function RequestActionList({ requests }: { requests: CustomerDeliveryRequest[] }) {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [actionReasons, setActionReasons] = useState<Record<string, string>>({});
  const canManageRequests = hasPermission(user, 'customer_requests:manage');
  const isAdmin = normalizeRole(user?.role) === 'admin';

  const actionMutation = useMutation({
    mutationFn: ({ id, status, actionReason }: { id: string; status: 'Approved' | 'Rejected'; actionReason: string }) =>
      customerRequestsApi.updateStatus(id, { status, actionReason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer-requests'] });
      // Approving a dispute/cancel/extra request corrects delivery data on the
      // backend, so refresh the delivery grid and per-customer calendars too.
      qc.invalidateQueries({ queryKey: ['deliveries-monthly'] });
      qc.invalidateQueries({ queryKey: ['delivery'] });
      Toast.show({ type: 'success', text1: 'Request updated' });
    },
    onError: (err: any) => Toast.show({ type: 'error', text1: err?.response?.data?.message || 'Failed to update request' }),
  });

  if (!requests.length) return null;

  return (
    <View className="mx-4 mb-4">
      <Text className="text-gray-500 text-xs font-semibold mb-2 uppercase tracking-wide">Customer Requests</Text>
      {requests.map((request) => {
        const isPending = request.status === 'Pending';
        const reasonValue = actionReasons[request.id] || '';
        const isDispute = request.requestType === 'dispute_delivery';
        const canAct = isDispute ? isAdmin : canManageRequests;
        return (
          <View key={request.id} className="bg-white rounded-xl px-4 py-3 mb-2 shadow-sm border border-gray-100">
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1">
                <Text className="text-gray-800 font-semibold text-sm">
                  {request.customerName ? `${request.customerName} · ` : ''}{formatDisplay(request.requestDate)}
                </Text>
                <Text className={isDispute ? 'text-purple-700 text-xs mt-1 font-semibold' : request.requestType === 'extra_milk' ? 'text-blue-700 text-xs mt-1 font-semibold' : 'text-red-700 text-xs mt-1 font-semibold'}>
                  {isDispute
                    ? `Reports milk was ${String(request.claimedStatus).toLowerCase() === 'delivered' ? 'GIVEN' : 'NOT given'} on this day`
                    : request.requestType === 'extra_milk'
                      ? `Extra milk ${parseFloat(request.extraQuantity || '0').toFixed(1)} L`
                      : 'Cancel milk'}
                </Text>
                <Text className="text-gray-500 text-xs mt-1">{request.reason || 'No customer reason'}</Text>
                {request.actionReason ? <Text className="text-gray-400 text-xs mt-1">Action reason: {request.actionReason}</Text> : null}
              </View>
              <Text className={`text-xs font-bold ${request.status === 'Approved' ? 'text-green-700' : request.status === 'Rejected' ? 'text-red-700' : 'text-orange-600'}`}>
                {request.status}
              </Text>
            </View>

            {canAct && isPending && (
              <>
                <TextInput
                  value={reasonValue}
                  onChangeText={(value) => setActionReasons((current) => ({ ...current, [request.id]: value }))}
                  placeholder="Reason for approval/rejection"
                  className="border border-gray-200 rounded-xl px-3 py-2 text-gray-800 bg-gray-50 text-sm mt-3"
                />
                <View className="flex-row gap-2 mt-3">
                  <TouchableOpacity
                    onPress={() => actionMutation.mutate({ id: request.id, status: 'Approved', actionReason: reasonValue || 'Approved' })}
                    disabled={actionMutation.isPending}
                    className="flex-1 bg-green-600 rounded-xl py-2.5 items-center"
                  >
                    <Text className="text-white font-semibold text-sm">Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => actionMutation.mutate({ id: request.id, status: 'Rejected', actionReason: reasonValue })}
                    disabled={actionMutation.isPending}
                    className="flex-1 bg-red-600 rounded-xl py-2.5 items-center"
                  >
                    <Text className="text-white font-semibold text-sm">Reject</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
            {isDispute && isPending && !isAdmin && (
              <Text className="text-orange-600 text-xs mt-3 font-medium">Awaiting admin approval</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

// ─── Reason Tooltip ──────────────────────────────────────────────────────────
interface ReasonTooltipProps {
  reason?: { reason: string; comments: string };
  children: React.ReactNode;
}
function ReasonTooltip({ reason, children }: ReasonTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const hoverProps = Platform.OS === 'web'
    ? ({ onMouseEnter: () => setShowTooltip(true), onMouseLeave: () => setShowTooltip(false) } as any)
    : {};

  if (!reason) {
    return <>{children}</>;
  }

  return (
    <View
      {...hoverProps}
      style={{ position: 'relative' }}
    >
      {children}
      {showTooltip && Platform.OS === 'web' && (
        <View
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            marginLeft: -75,
            width: 150,
            backgroundColor: '#1F2937',
            color: '#fff',
            textAlign: 'center',
            padding: 8,
            borderRadius: 6,
            fontSize: 12,
            zIndex: 1000,
            whiteSpace: 'normal',
            marginBottom: 5,
          } as any}
        >
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '500' }}>
            {reason.reason}
          </Text>
          {reason.comments && (
            <Text style={{ color: '#d1d5db', fontSize: 10, marginTop: 4 }}>
              {reason.comments}
            </Text>
          )}
          {/* Tooltip arrow */}
          <View
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              marginLeft: -5,
              width: 0,
              height: 0,
              borderLeftWidth: 5,
              borderRightWidth: 5,
              borderTopWidth: 5,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderTopColor: '#1F2937',
            }}
          />
        </View>
      )}
      {showTooltip && Platform.OS !== 'web' && (
        <Modal transparent animationType="fade" visible={showTooltip}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowTooltip(false)}
            className="flex-1 justify-center items-center bg-black/50"
          >
            <View className="bg-gray-800 px-4 py-3 rounded-xl max-w-xs">
              <Text className="text-white text-sm font-medium">{reason.reason}</Text>
              {reason.comments && <Text className="text-gray-300 text-xs mt-1">{reason.comments}</Text>}
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

// ─── Client Dropdown ──────────────────────────────────────────────────────────
interface DropdownProps {
  customers: Customer[];
  selected: string;          // 'all' | customerId
  onChange: (v: string) => void;
}
function ClientDropdown({ customers, selected, onChange }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const label = selected === 'all'
    ? 'All Clients'
    : customers.find((c) => c.id === selected)?.name ?? 'Select Client';

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className="flex-row items-center justify-between bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm"
        activeOpacity={0.8}
      >
        <View className="flex-row items-center gap-2">
          <Ionicons name="people-outline" size={18} color="#2563EB" />
          <Text className="text-gray-800 font-semibold text-base">{label}</Text>
        </View>
        <Ionicons name="chevron-down" size={18} color="#6B7280" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity
          className="flex-1 bg-black/40 justify-center px-6"
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View className="bg-white rounded-2xl overflow-hidden shadow-xl">
            <View className="px-4 py-3 border-b border-gray-100">
              <Text className="text-gray-800 font-bold text-base">Select Client</Text>
            </View>
            <ScrollView style={{ maxHeight: 360 }} bounces={false}>
              {/* All option */}
              <TouchableOpacity
                onPress={() => { onChange('all'); setOpen(false); }}
                className={`flex-row items-center justify-between px-4 py-3.5 border-b border-gray-50 ${
                  selected === 'all' ? 'bg-blue-50' : ''
                }`}
              >
                <Text className={`font-semibold ${selected === 'all' ? 'text-blue-600' : 'text-gray-800'}`}>
                  All Clients
                </Text>
                {selected === 'all' && <Ionicons name="checkmark" size={18} color="#2563EB" />}
              </TouchableOpacity>
              {/* Individual clients */}
              {customers.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => { onChange(c.id); setOpen(false); }}
                  className={`flex-row items-center justify-between px-4 py-3.5 border-b border-gray-50 ${
                    selected === c.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <View>
                    <Text className={`font-medium ${selected === c.id ? 'text-blue-600' : 'text-gray-800'}`}>
                      {c.name}
                    </Text>
                    <Text className="text-gray-400 text-xs mt-0.5">
                      {c.dailyQuantity}L · {c.milkType}
                    </Text>
                  </View>
                  {selected === c.id && <Ionicons name="checkmark" size={18} color="#2563EB" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

// ─── Reason Modal ─────────────────────────────────────────────────────────────
interface ReasonModalProps {
  visible: boolean;
  date: string;
  loading: boolean;
  onConfirm: (reason: string, comment: string) => void;
  onCancel: () => void;
}
function ReasonModal({ visible, date, loading, onConfirm, onCancel }: ReasonModalProps) {
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');

  const reset = () => { setReason(''); setComment(''); };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-white rounded-t-3xl p-5">
          <Text className="text-gray-800 text-lg font-bold mb-1">Mark as Not Delivered</Text>
          {date ? <Text className="text-gray-500 text-sm mb-4">{formatDisplay(date)}</Text> : null}

          <Text className="text-gray-700 font-medium mb-2">
            Reason <Text className="text-red-500">*</Text>
          </Text>
          <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
            {REASON_CATEGORIES.map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setReason(r)}
                className={`p-3 rounded-xl mb-2 border ${reason === r ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}
              >
                <Text className={reason === r ? 'text-blue-600 font-medium' : 'text-gray-700'}>{r}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text className="text-gray-700 font-medium mt-3 mb-1">Comment (optional)</Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-gray-50 text-sm"
            placeholder="e.g. Customer went to native place"
            placeholderTextColor="#9CA3AF"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={2}
          />

          <View className="flex-row gap-3 mt-4">
            <Button title="Cancel" variant="secondary" onPress={() => { reset(); onCancel(); }} className="flex-1" />
            <Button
              title="Confirm"
              variant="danger"
              loading={loading}
              onPress={() => {
                if (!reason) { Toast.show({ type: 'error', text1: 'Please select a reason' }); return; }
                onConfirm(reason, comment);
                reset();
              }}
              className="flex-1"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Report Strip ─────────────────────────────────────────────────────────────
interface ReportStripProps {
  deliveredDays: number;
  missedDays: number;
  totalLiters: number;
  totalAmount: number;
  customerName?: string;
}
function ReportStrip({ deliveredDays, missedDays, totalLiters, totalAmount, customerName }: ReportStripProps) {
  return (
    <View className="bg-white rounded-2xl shadow-sm overflow-hidden mx-4 mb-4">
      {customerName && (
        <View className="bg-blue-600 px-4 py-2">
          <Text className="text-white font-semibold text-sm">{customerName} — Monthly Report</Text>
        </View>
      )}
      {!customerName && (
        <View className="bg-blue-600 px-4 py-2">
          <Text className="text-white font-semibold text-sm">All Clients — Monthly Summary</Text>
        </View>
      )}
      <View className="flex-row">
        <View className="flex-1 items-center py-4 border-r border-gray-100">
          <Text className="text-green-600 font-bold text-2xl">{deliveredDays}</Text>
          <Text className="text-gray-500 text-xs mt-0.5">Delivered Days</Text>
        </View>
        <View className="flex-1 items-center py-4 border-r border-gray-100">
          <Text className="text-red-500 font-bold text-2xl">{missedDays}</Text>
          <Text className="text-gray-500 text-xs mt-0.5">Missed Days</Text>
        </View>
        <View className="flex-1 items-center py-4 border-r border-gray-100">
          <Text className="text-blue-600 font-bold text-2xl">{totalLiters.toFixed(1)}</Text>
          <Text className="text-gray-500 text-xs mt-0.5">Milk (L)</Text>
        </View>
        <View className="flex-1 items-center py-4">
          <Text className="text-purple-600 font-bold text-xl">₹{totalAmount.toFixed(0)}</Text>
          <Text className="text-gray-500 text-xs mt-0.5">Amount</Text>
        </View>
      </View>
    </View>
  );
}

// ─── ALL-CLIENTS Calendar ─────────────────────────────────────────────────────
// Each day cell is green if ALL delivered, red if ALL missed, orange if mixed.
interface AllCalendarProps {
  deliveries: DeliveryRecord[];
  requests: CustomerDeliveryRequest[];
  year: number;
  month: number;
}
function AllClientsCalendar({ deliveries, requests, year, month }: AllCalendarProps) {
  const todayStr = todayFn();
  const dates = getMonthDateArray(year, month);
  const firstDay = new Date(year, month - 1, 1).getDay();
  const requestMap = useMemo(() => requestsByDate(requests), [requests]);

  // Build per-date aggregate across all customers
  const dayStats = useMemo(() => {
    const stats: Record<string, { delivered: number; missed: number }> = {};
    dates.forEach((d) => { stats[d] = { delivered: 0, missed: 0 }; });
    deliveries.forEach((rec) => {
      const data = parseData(rec.deliveryData);
      dates.forEach((d) => {
        if (data[d] !== false) stats[d].delivered++;
        else stats[d].missed++;
      });
    });
    return stats;
  }, [deliveries, dates]);

  // Summary for report
  const totalCustomers = deliveries.length;
  const totalDelivered = deliveries.reduce((s, d) => s + Number(d.deliveredDays || 0), 0);
  const totalMissed    = deliveries.reduce((s, d) => s + Number(d.missedDays || 0), 0);
  const totalLiters    = deliveries.reduce((s, d) => s + parseFloat(d.totalQuantity || '0'), 0);
  const totalAmount    = deliveries.reduce((s, d) => s + parseFloat(d.totalAmount || '0'), 0);

  // Build calendar rows
  const rows: React.ReactNode[][] = [];
  let idx = 0;
  while (idx < dates.length) {
    const row: React.ReactNode[] = [];
    for (let col = 0; col < 7; col++) {
      if (rows.length === 0 && col < firstDay) {
        row.push(<View key={`pre-${col}`} className="flex-1 aspect-square m-0.5" />);
      } else if (idx < dates.length) {
        const date = dates[idx];
        const { delivered, missed } = dayStats[date] ?? { delivered: 0, missed: 0 };
        const total = delivered + missed;
        const allDelivered = total > 0 && missed === 0;
        const allMissed    = total > 0 && delivered === 0;
        const isToday = date === todayStr;
        const dayNum = idx + 1;
        idx++;

        const reasons = deliveries
          .map((rec) => {
            const reasonData = parseReasonData(rec.reasonData || {});
            return reasonData[date];
          })
          .filter(Boolean);
        const reasonsText = reasons.length > 0
          ? reasons.map((r: any) => r.reason).join(', ')
          : '';
        const firstReason = reasons.length > 0 ? reasons[0] : null;
        const dayRequests = requestMap[date] || [];
        const cancelRequests = dayRequests.filter((request) => request.requestType === 'cancel_delivery').length;
        const extraRequests = dayRequests.filter((request) => request.requestType === 'extra_milk').length;

        const bg   = total === 0 ? 'bg-gray-100'
                   : allDelivered ? 'bg-green-100'
                   : allMissed    ? 'bg-red-100'
                   : 'bg-orange-100';
        const txt  = total === 0 ? 'text-gray-400'
                   : allDelivered ? 'text-green-700'
                   : allMissed    ? 'text-red-700'
                   : 'text-orange-700';
        const icon = allMissed ? '✗' : '✓';

        row.push(
          <ReasonTooltip key={date} reason={firstReason}>
            <View
              className={[
                'flex-1 aspect-square m-0.5 rounded-xl items-center justify-center',
                bg,
                isToday ? 'border-2 border-blue-500' : '',
              ].join(' ')}
            >
              <Text className={`text-sm font-bold ${txt}`}>{dayNum}</Text>
              {total > 0 && (
                <Text className={`text-xs font-medium ${txt}`}>
                  {allDelivered || allMissed ? icon : `${delivered}/${total}`}
                </Text>
              )}
              {cancelRequests > 0 && <Text className="text-[8px] font-bold text-red-700" numberOfLines={1}>{cancelRequests} cancel</Text>}
              {extraRequests > 0 && (
                <Text className="text-[8px] font-bold text-blue-700 animate-pulse" numberOfLines={1} style={Platform.OS === 'web' ? ({ animation: 'pulse 1s infinite' } as any) : undefined}>
                  {extraRequests} extra
                </Text>
              )}
            </View>
          </ReasonTooltip>,
        );
      } else {
        row.push(<View key={`post-${col}`} className="flex-1 aspect-square m-0.5" />);
      }
    }
    rows.push(row);
  }

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
      {/* Calendar */}
      <View className="bg-white rounded-2xl shadow-sm mx-4 mb-4 p-4">
        {/* Weekday headers */}
        <View className="flex-row mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <View key={d} className="flex-1 items-center">
              <Text className="text-gray-400 text-xs font-semibold">{d}</Text>
            </View>
          ))}
        </View>
        {rows.map((row, i) => (
          <View key={i} className="flex-row mb-1">{row}</View>
        ))}

        {/* Legend */}
        <View className="flex-row gap-3 mt-3 justify-center flex-wrap">
          <View className="flex-row items-center gap-1">
            <View className="w-4 h-4 rounded bg-green-100" />
            <Text className="text-gray-500 text-xs">All Delivered</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <View className="w-4 h-4 rounded bg-orange-100" />
            <Text className="text-gray-500 text-xs">Partial (n/total)</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <View className="w-4 h-4 rounded bg-red-100" />
            <Text className="text-gray-500 text-xs">All Missed</Text>
          </View>
        </View>
      </View>

      {/* Per-customer mini summary list */}
      <RequestActionList requests={requests} />

      {deliveries.length > 0 && (
        <View className="mx-4 mb-4">
          <Text className="text-gray-500 text-xs font-semibold mb-2 uppercase tracking-wide">
            Per-Client Summary
          </Text>
          {deliveries.map((rec) => (
            <View key={rec.id ?? rec.customerId} className="bg-white rounded-xl px-4 py-3 mb-2 shadow-sm">
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-800 font-semibold text-sm flex-1" numberOfLines={1}>
                  {rec.customerName}
                </Text>
                <Text className="text-purple-600 font-bold text-sm">
                  ₹{parseFloat(rec.totalAmount || '0').toFixed(0)}
                </Text>
              </View>
              <View className="flex-row gap-3 mt-1">
                <Text className="text-green-600 text-xs">{rec.deliveredDays} days ✓</Text>
                <Text className="text-red-500 text-xs">{rec.missedDays} missed</Text>
                <Text className="text-blue-500 text-xs">{rec.totalQuantity}L</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Report strip */}
      <ReportStrip
        deliveredDays={totalDelivered}
        missedDays={totalMissed}
        totalLiters={totalLiters}
        totalAmount={totalAmount}
      />
    </ScrollView>
  );
}

// ─── SINGLE-CLIENT Calendar ───────────────────────────────────────────────────
type DeliveryMode = 'monthly' | 'daily';

interface SingleCalendarProps {
  customer: Customer;
  requests: CustomerDeliveryRequest[];
  year: number;
  month: number;
}
function SingleClientCalendar({ customer, requests, year, month }: SingleCalendarProps) {
  const qc = useQueryClient();
  const todayStr = todayFn();

  const [mode, setMode] = useState<DeliveryMode>(
    customer.billingMode === 'Daily Check' ? 'daily' : 'monthly',
  );
  const [reasonModal, setReasonModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const { data: delivery, isLoading } = useQuery({
    queryKey: ['delivery', customer.id, year, month],
    queryFn: () => deliveriesApi.getMonthly(customer.id, year, month).then((r) => r.data.data as DeliveryRecord),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: any) => deliveriesApi.updateDay(customer.id, year, month, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['delivery', customer.id, year, month] });
      qc.invalidateQueries({ queryKey: ['deliveries-monthly'] });
      setReasonModal(false);
    },
    onError: () => Toast.show({ type: 'error', text1: 'Failed to update delivery' }),
  });

  const markAllMutation = useMutation({
    mutationFn: (delivered: boolean) => deliveriesApi.markAll(customer.id, year, month, delivered),
    onSuccess: (_, delivered) => {
      qc.invalidateQueries({ queryKey: ['delivery', customer.id, year, month] });
      qc.invalidateQueries({ queryKey: ['deliveries-monthly'] });
      Toast.show({ type: 'success', text1: delivered ? 'All marked delivered' : 'All marked missed' });
    },
  });

  const deliveryData: Record<string, boolean> = useMemo(
    () => parseData(delivery?.deliveryData),
    [delivery?.deliveryData],
  );

  const reasonData: Record<string, any> = useMemo(
    () => parseReasonData(delivery?.reasonData),
    [delivery?.reasonData],
  );

  const dates = useMemo(() => getMonthDateArray(year, month), [year, month]);
  const firstDay = new Date(year, month - 1, 1).getDay();
  const requestMap = useMemo(() => requestsByDate(requests), [requests]);

  const handleDayPress = (date: string) => {
    const isDelivered = deliveryData[date] !== false;
    if (mode === 'monthly') {
      if (isDelivered) { setSelectedDate(date); setReasonModal(true); }
      else Alert.alert('Mark as Delivered?', `Restore ${formatDisplay(date)} as delivered?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: () => updateMutation.mutate({ date, delivered: true }) },
      ]);
    } else {
      if (!isDelivered) { updateMutation.mutate({ date, delivered: true }); }
      else { setSelectedDate(date); setReasonModal(true); }
    }
  };

  if (isLoading || !delivery) return <LoadingScreen />;

  // Build calendar rows
  const rows: React.ReactNode[][] = [];
  let idx = 0;
  while (idx < dates.length) {
    const row: React.ReactNode[] = [];
    for (let col = 0; col < 7; col++) {
      if (rows.length === 0 && col < firstDay) {
        row.push(<View key={`pre-${col}`} className="flex-1 aspect-square m-0.5" />);
      } else if (idx < dates.length) {
        const date = dates[idx];
        const isDelivered = deliveryData[date] !== false;
        const isToday = date === todayStr;
        const dayNum = idx + 1;
        const reason = !isDelivered ? reasonData[date] : null;
        const dayRequests = requestMap[date] || [];
        const requestReason = dayRequests.find((request) => request.requestType === 'cancel_delivery')?.reason;
        const tooltipReason = reason || (requestReason ? { reason: 'Customer cancelled milk', comments: requestReason } : undefined);
        idx++;
        row.push(
          <ReasonTooltip key={date} reason={tooltipReason}>
            <TouchableOpacity
              onPress={() => handleDayPress(date)}
              disabled={updateMutation.isPending}
              className={[
                'flex-1 aspect-square m-0.5 rounded-xl items-center justify-center',
                isDelivered ? 'bg-green-100' : 'bg-red-100',
                isToday ? 'border-2 border-blue-500' : '',
              ].join(' ')}
              activeOpacity={0.7}
            >
              <Text className={`text-sm font-bold ${isDelivered ? 'text-green-700' : 'text-red-600'}`}>
                {dayNum}
              </Text>
              <Text className={`text-xs ${isDelivered ? 'text-green-500' : 'text-red-400'}`}>
                {isDelivered ? '✓' : '✗'}
              </Text>
              <RequestMarker requests={dayRequests} />
            </TouchableOpacity>
          </ReasonTooltip>,
        );
      } else {
        row.push(<View key={`post-${col}`} className="flex-1 aspect-square m-0.5" />);
      }
    }
    rows.push(row);
  }

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
      {/* Mode Toggle */}
      <View className="flex-row bg-gray-100 rounded-2xl p-1 mx-4 mb-4">
        {(['monthly', 'daily'] as DeliveryMode[]).map((m) => (
          <TouchableOpacity
            key={m}
            onPress={() => setMode(m)}
            className={`flex-1 py-2.5 rounded-xl items-center ${mode === m ? 'bg-white shadow-sm' : ''}`}
          >
            <Text className={`text-sm font-semibold ${mode === m ? 'text-blue-600' : 'text-gray-500'}`}>
              {m === 'monthly' ? 'Monthly Full Check' : 'Daily Check'}
            </Text>
            <Text className={`text-xs mt-0.5 ${mode === m ? 'text-blue-400' : 'text-gray-400'}`}>
              {m === 'monthly' ? 'All ✓, uncheck missed' : 'Mark each day ✓'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Mark All buttons */}
      <View className="flex-row gap-2 mx-4 mb-4">
        <TouchableOpacity
          onPress={() => markAllMutation.mutate(true)}
          disabled={markAllMutation.isPending}
          className="flex-1 bg-green-600 rounded-xl py-3 items-center"
        >
          <Text className="text-white font-semibold text-sm">✓ Mark All Delivered</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Alert.alert('Mark All Missed?', 'This will mark the entire month as not delivered.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Yes', onPress: () => markAllMutation.mutate(false) },
          ])}
          disabled={markAllMutation.isPending}
          className="flex-1 bg-red-600 rounded-xl py-3 items-center"
        >
          <Text className="text-white font-semibold text-sm">✗ Mark All Missed</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar */}
      <View className="bg-white rounded-2xl shadow-sm mx-4 mb-4 p-4">
        <View className="flex-row mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <View key={d} className="flex-1 items-center">
              <Text className="text-gray-400 text-xs font-semibold">{d}</Text>
            </View>
          ))}
        </View>
        {rows.map((row, i) => <View key={i} className="flex-row mb-1">{row}</View>)}

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
              <Text className="text-red-600 text-xs">✗</Text>
            </View>
            <Text className="text-gray-500 text-xs">Not Delivered</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <View className="w-4 h-4 rounded border-2 border-blue-500 bg-green-100" />
            <Text className="text-gray-500 text-xs">Today</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Text className="text-red-700 text-xs font-bold">Cancelled</Text>
            <Text className="text-gray-500 text-xs">Customer Request</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Text className="text-blue-700 text-xs font-bold">+L</Text>
            <Text className="text-gray-500 text-xs">Extra Milk</Text>
          </View>
        </View>
      </View>

      {/* Report Strip */}
      <RequestActionList requests={requests} />

      <ReportStrip
        customerName={customer.name}
        deliveredDays={Number(delivery.deliveredDays)}
        missedDays={Number(delivery.missedDays)}
        totalLiters={parseFloat(delivery.totalQuantity || '0')}
        totalAmount={parseFloat(delivery.totalAmount || '0')}
      />

      <ReasonModal
        visible={reasonModal}
        date={selectedDate}
        loading={updateMutation.isPending}
        onConfirm={(reason, comment) =>
          updateMutation.mutate({ date: selectedDate, delivered: false, reason, comments: comment })
        }
        onCancel={() => setReasonModal(false)}
      />
    </ScrollView>
  );
}

// ─── Main Tab Screen ───────────────────────────────────────────────────────────
export default function DeliveryTab() {
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedId, setSelectedId] = useState<string>('all');

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); } else setMonth((m) => m + 1);
  };

  const { data: customers = [], isLoading: cLoading } = useQuery({
    queryKey: ['customers-active'],
    queryFn: () => customersApi.getAll('true').then((r) => r.data.data as Customer[]),
  });

  const { data: deliveries = [], isLoading: dLoading, refetch } = useQuery({
    queryKey: ['deliveries-monthly', year, month],
    queryFn: () => deliveriesApi.getAllMonthly(year, month).then((r) => r.data.data as DeliveryRecord[]),
  });

  const { data: requests = [], isLoading: rLoading } = useQuery({
    queryKey: ['customer-requests', year, month],
    queryFn: () => customerRequestsApi.getMonthly(year, month).then((r) => r.data.data as CustomerDeliveryRequest[]),
  });

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedId),
    [customers, selectedId],
  );

  if (cLoading || dLoading || rLoading) return <LoadingScreen />;

  const selectedRequests = selectedId === 'all'
    ? requests
    : requests.filter((request) => request.customerId === selectedId);

  return (
    <View className="flex-1 bg-gray-50">
      {/* ── Header ── */}
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm">
        <Text className="text-xl font-bold text-gray-800 mb-3">Milk Delivery</Text>

        {/* Month Navigator */}
        <View className="flex-row items-center justify-between bg-gray-100 rounded-xl p-1.5 mb-3">
          <TouchableOpacity onPress={prevMonth} className="w-9 h-9 items-center justify-center">
            <Ionicons name="chevron-back" size={20} color="#374151" />
          </TouchableOpacity>
          <Text className="font-semibold text-gray-800">{formatMonthYear(year, month)}</Text>
          <TouchableOpacity onPress={nextMonth} className="w-9 h-9 items-center justify-center">
            <Ionicons name="chevron-forward" size={20} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Client Dropdown */}
        <ClientDropdown customers={customers} selected={selectedId} onChange={setSelectedId} />
      </View>

      {/* ── Content ── */}
      {selectedId === 'all' ? (
        <AllClientsCalendar deliveries={deliveries} requests={requests} year={year} month={month} />
      ) : selectedCustomer ? (
        <SingleClientCalendar customer={selectedCustomer} requests={selectedRequests} year={year} month={month} />
      ) : null}
    </View>
  );
}
