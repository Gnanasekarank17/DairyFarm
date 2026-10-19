import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { EmptyState } from '../common/EmptyState';
import { formatCurrency, formatDisplay } from '../../utils/helpers';
import { getCategoryMeta, ledgerCategoryLabel, ledgerDate, ledgerInvalidationKeys, ledgerParty } from '../../config/ledgers';
import type { LedgerDataGridProps } from './LedgerDataGrid.types';

// Native fallback for the web EnterpriseGrid: a card list. Tap to edit, long-press to delete.
export function LedgerDataGrid({ type, config, entries, canManage }: LedgerDataGridProps) {
  const qc = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => config.api.delete(id),
    onSuccess: () => {
      ledgerInvalidationKeys(config).forEach((k) => qc.invalidateQueries({ queryKey: k }));
      Toast.show({ type: 'success', text1: `${config.singular} deleted` });
    },
    onError: () => Toast.show({ type: 'error', text1: `Failed to delete ${config.singular.toLowerCase()}` }),
  });

  const confirmDelete = (row: (typeof entries)[number]) => {
    if (!canManage) return;
    Alert.alert(
      `Delete ${config.singular}`,
      `Remove this ${row.category} entry of ${formatCurrency(row.amount)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(row.id) },
      ],
    );
  };

  if (!entries.length) {
    return <EmptyState icon={config.icon} title={`No ${config.label.toLowerCase()}`} subtitle={config.emptySubtitle} />;
  }

  const amountClass = config.tone === 'expense' ? 'text-red-600' : 'text-emerald-700';

  return (
    <FlatList
      data={entries}
      scrollEnabled={false}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={() => <View className="h-3" />}
      renderItem={({ item }) => {
        const meta = getCategoryMeta(config, item.category);
        const date = ledgerDate(item, config);
        const party = ledgerParty(item, config);
        const qty = item.quantity ? `${parseFloat(String(item.quantity))} ${item.unit || ''}`.trim() : '';
        const details = [item.itemName, qty, party].filter(Boolean).join(' • ');
        return (
          <TouchableOpacity
            onPress={() => canManage && router.push(`/finance/${type}/add?id=${item.id}` as any)}
            onLongPress={() => confirmDelete(item)}
            className="bg-white rounded-2xl p-4 shadow-sm flex-row items-center"
            activeOpacity={canManage ? 0.8 : 1}
          >
            <View className="w-10 h-10 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: `${meta.color}15` }}>
              <Ionicons name={meta.icon} size={20} color={meta.color} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-semibold text-sm">{ledgerCategoryLabel(item)}</Text>
              {details ? (
                <Text className="text-gray-500 text-xs mt-0.5" numberOfLines={1}>{details}</Text>
              ) : null}
              <Text className="text-gray-400 text-xs mt-0.5">
                {date ? formatDisplay(date) : ''} • {item.paymentMode || 'Cash'}
              </Text>
            </View>
            <Text className={`${amountClass} font-bold`}>{formatCurrency(item.amount)}</Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}
