import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import type { LedgerConfig } from '../config/ledgers';
import type { LedgerCategory } from '../types';

export const ledgerCategoriesKey = (config: LedgerConfig) => [`${config.queryKey}-categories`];

/** Expense / Income types from the server (system defaults + user-added), with the seeded list as fallback. */
export function useLedgerCategories(config: LedgerConfig, enabled = true) {
  const query = useQuery({
    queryKey: ledgerCategoriesKey(config),
    queryFn: () => config.api.getCategories().then((r) => r.data.data as LedgerCategory[]),
    enabled,
    staleTime: 10 * 60 * 1000,
  });

  const names = useMemo<string[]>(
    () => (query.data?.length ? query.data.map((c) => c.name) : [...config.defaultCategories]),
    [query.data, config],
  );

  return { ...query, categories: query.data ?? [], names };
}

/** Adds a custom type (e.g. "Machinery", "Pump") and refreshes every list that shows categories. */
export function useAddLedgerCategory(config: LedgerConfig, onAdded?: (category: LedgerCategory) => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => config.api.createCategory({ name }).then((r) => r.data.data as LedgerCategory),
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ledgerCategoriesKey(config) });
      qc.invalidateQueries({ queryKey: [`${config.queryKey}-summary`] });
      Toast.show({ type: 'success', text1: `"${created.name}" added to ${config.label.toLowerCase()} types` });
      onAdded?.(created);
    },
    onError: (err: any) => Toast.show({ type: 'error', text1: err?.response?.data?.message || 'Failed to add type' }),
  });
}
