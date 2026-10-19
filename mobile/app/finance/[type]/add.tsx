import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Input } from '../../../src/components/common/Input';
import { Button } from '../../../src/components/common/Button';
import { Select, type SelectOption } from '../../../src/components/common/Select';
import { LoadingScreen } from '../../../src/components/common/LoadingScreen';
import { today } from '../../../src/utils/helpers';
import { useAuthStore } from '../../../src/store/authStore';
import { hasPermission } from '../../../src/utils/permissions';
import { useAddLedgerCategory, useLedgerCategories } from '../../../src/hooks/useLedgerCategories';
import {
  LEDGER_CONFIG, getCategoryMeta, getFieldLabels, isLedgerTypeSlug, ledgerDate, ledgerInvalidationKeys, ledgerParty,
  type LedgerTypeSlug,
} from '../../../src/config/ledgers';
import { PAYMENT_MODES, type LedgerEntry } from '../../../src/types';

const ADD_NEW = '__add_new__';

const schema = z.object({
  category: z.string().min(1, 'Pick a type'),
  accountName: z.string(),
  itemName: z.string(),
  party: z.string(),
  quantity: z.string().refine((v) => v === '' || (!Number.isNaN(parseFloat(v)) && parseFloat(v) >= 0), 'Enter a valid quantity'),
  unit: z.string(),
  amount: z.string().refine((v) => parseFloat(v) > 0, 'Amount must be greater than 0'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
  paymentMode: z.string(),
  notes: z.string(),
}).refine((d) => d.category !== 'Other' || d.accountName.trim().length > 0, {
  message: 'Account name is required for "Other"',
  path: ['accountName'],
});
type FormValues = z.infer<typeof schema>;

// One add/edit form for both ledgers: /finance/[type]/add and /finance/[type]/add?id=...
export default function LedgerFormScreen() {
  const { type, id } = useLocalSearchParams<{ type: string; id?: string }>();
  const user = useAuthStore((s) => s.user);
  const isEdit = Boolean(id);
  const qc = useQueryClient();

  // Hooks must run on every render, so resolve a safe config first and redirect after the hooks.
  const validType = isLedgerTypeSlug(type);
  const slug: LedgerTypeSlug = validType ? type : 'expenses';
  const config = LEDGER_CONFIG[slug];
  const canManage = validType && hasPermission(user, config.managePermission);

  const { data: existing, isLoading } = useQuery({
    queryKey: [config.queryKey.replace(/s$/, ''), id],
    queryFn: () => config.api.getById(id as string).then((r) => r.data.data as LedgerEntry),
    enabled: isEdit && canManage,
  });

  const { names: categoryNames } = useLedgerCategories(config, canManage);
  const [addingType, setAddingType] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');

  const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: config.defaultCategories[0],
      accountName: '', itemName: '', party: '', quantity: '', unit: '', amount: '',
      date: today(), paymentMode: 'Cash', notes: '',
    },
  });

  useEffect(() => {
    if (existing) {
      reset({
        category: existing.category,
        accountName: existing.accountName || '',
        itemName: existing.itemName || '',
        party: ledgerParty(existing, config),
        quantity: existing.quantity !== undefined && existing.quantity !== null ? String(existing.quantity) : '',
        unit: existing.unit || '',
        amount: String(existing.amount ?? ''),
        date: ledgerDate(existing, config) || today(),
        paymentMode: existing.paymentMode || 'Cash',
        notes: existing.notes || '',
      });
    }
  }, [existing, reset]);

  const category = watch('category');
  const paymentMode = watch('paymentMode');
  const labels = getFieldLabels(config, category);
  const meta = getCategoryMeta(config, category);

  const addCategory = useAddLedgerCategory(config, (created) => {
    setValue('category', created.name, { shouldValidate: true });
    setAddingType(false);
    setNewTypeName('');
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => {
      const payload = {
        category: data.category,
        accountName: data.accountName,
        itemName: data.itemName,
        [config.partyField]: data.party,
        quantity: data.quantity ? data.quantity : undefined,
        unit: data.unit,
        amount: data.amount,
        [config.dateField]: data.date,
        paymentMode: data.paymentMode,
        notes: data.notes,
      };
      return isEdit ? config.api.update(id as string, payload) : config.api.create(payload);
    },
    onSuccess: () => {
      ledgerInvalidationKeys(config).forEach((k) => qc.invalidateQueries({ queryKey: k }));
      Toast.show({ type: 'success', text1: isEdit ? `${config.singular} updated` : `${config.singular} recorded` });
      router.back();
    },
    onError: (err: any) => Toast.show({
      type: 'error',
      text1: err?.response?.data?.message || `Failed to save ${config.singular.toLowerCase()}`,
    }),
  });

  if (!validType) return <Redirect href="/(tabs)/more" />;
  if (!user) return <LoadingScreen />;
  if (!canManage) return <Redirect href={`/finance/${slug}` as any} />;
  if (isEdit && isLoading) return <LoadingScreen />;

  // Existing rows may carry a type that was later removed; keep it selectable so edits still work.
  const typeNames = category && !categoryNames.includes(category) ? [...categoryNames, category] : categoryNames;
  const typeOptions: SelectOption[] = [
    ...typeNames.map((n) => ({ label: n, value: n, color: getCategoryMeta(config, n).color })),
    { label: `+ Add new ${config.singular.toLowerCase()} type…`, value: ADD_NEW, accent: true },
  ];

  const onTypeChange = (value: string) => {
    if (value === ADD_NEW) { setAddingType(true); return; }
    setValue('category', value, { shouldValidate: true });
  };

  const submitNewType = () => {
    const name = newTypeName.trim();
    if (name.length < 2) { Toast.show({ type: 'error', text1: 'Enter a type name (at least 2 characters)' }); return; }
    addCategory.mutate(name);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
      <View className="flex-1 bg-gray-50">
        <View className="bg-white pt-14 pb-4 px-4 shadow-sm flex-row items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800 ml-4">
            {isEdit ? `Edit ${config.singular}` : `Record ${config.singular}`}
          </Text>
        </View>

        <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
          <View style={{ width: '100%', maxWidth: Platform.OS === 'web' ? 760 : undefined, alignSelf: 'center' }}>
            <View className="bg-white rounded-2xl p-4 mb-4">
              <Select
                label={`${config.singular} Type`}
                required
                value={category}
                options={typeOptions}
                onChange={onTypeChange}
                error={errors.category?.message}
              />

              {addingType && (
                <View className="bg-slate-50 border border-slate-200 rounded-2xl p-3 mb-4">
                  <Text className="text-gray-700 font-semibold mb-1">New {config.singular.toLowerCase()} type</Text>
                  <Text className="text-gray-400 text-xs mb-3">
                    e.g. Machinery, Pump repair, Insurance. It will be available in the dropdown for every entry from now on.
                  </Text>
                  <Input
                    placeholder="Type name"
                    value={newTypeName}
                    onChangeText={setNewTypeName}
                    autoFocus
                    onSubmitEditing={submitNewType}
                    returnKeyType="done"
                  />
                  <View className="flex-row gap-2 -mt-1">
                    <View className="flex-1">
                      <Button title="Add Type" size="sm" onPress={submitNewType} loading={addCategory.isPending} />
                    </View>
                    <View className="flex-1">
                      <Button title="Cancel" size="sm" variant="secondary" onPress={() => { setAddingType(false); setNewTypeName(''); }} />
                    </View>
                  </View>
                </View>
              )}

              {!addingType && category ? (
                <View className="flex-row items-center -mt-2 mb-4">
                  <View className="flex-row items-center px-2.5 py-1 rounded-full" style={{ backgroundColor: `${meta.color}18` }}>
                    <Ionicons name={meta.icon} size={13} color={meta.color} />
                    <Text className="text-xs font-semibold ml-1" style={{ color: meta.color }}>{category}</Text>
                  </View>
                </View>
              ) : null}

              {category === 'Other' && (
                <Controller control={control} name="accountName" render={({ field: { onChange, value } }) => (
                  <Input
                    label="Account Name"
                    placeholder={config.accountNamePlaceholder}
                    value={value}
                    onChangeText={onChange}
                    error={errors.accountName?.message}
                    required
                  />
                )} />
              )}

              <Controller control={control} name="itemName" render={({ field: { onChange, value } }) => (
                <Input label={labels.item} placeholder={labels.itemPlaceholder} value={value} onChangeText={onChange} />
              )} />

              <Controller control={control} name="party" render={({ field: { onChange, value } }) => (
                <Input label={labels.party} placeholder={labels.partyPlaceholder} value={value} onChangeText={onChange} />
              )} />

              {labels.showQuantity && (
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Controller control={control} name="quantity" render={({ field: { onChange, value } }) => (
                      <Input label="Quantity" placeholder="0" value={value} onChangeText={onChange} keyboardType="decimal-pad" error={errors.quantity?.message} />
                    )} />
                  </View>
                  <View className="flex-1">
                    <Controller control={control} name="unit" render={({ field: { onChange, value } }) => (
                      <Input label="Unit" placeholder="kg / bags / L / units" value={value} onChangeText={onChange} />
                    )} />
                  </View>
                </View>
              )}

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Controller control={control} name="amount" render={({ field: { onChange, value } }) => (
                    <Input label="Amount (₹)" placeholder="0.00" value={value} onChangeText={onChange} keyboardType="decimal-pad" error={errors.amount?.message} required />
                  )} />
                </View>
                <View className="flex-1">
                  <Controller control={control} name="date" render={({ field: { onChange, value } }) => (
                    <Input label="Date" placeholder="YYYY-MM-DD" value={value} onChangeText={onChange} error={errors.date?.message} required />
                  )} />
                </View>
              </View>

              <Text className="text-sm font-medium text-gray-700 mb-2">Payment Mode</Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {PAYMENT_MODES.map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    onPress={() => setValue('paymentMode', mode)}
                    className={`px-3 py-2 rounded-xl border ${paymentMode === mode ? 'bg-slate-900 border-slate-900' : 'bg-white border-gray-200'}`}
                  >
                    <Text className={paymentMode === mode ? 'text-white font-medium' : 'text-gray-600'}>{mode}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Controller control={control} name="notes" render={({ field: { onChange, value } }) => (
                <Input label="Notes" placeholder="Optional" value={value} onChangeText={onChange} multiline numberOfLines={2} />
              )} />
            </View>

            <Button
              title={isEdit ? `Update ${config.singular}` : `Save ${config.singular}`}
              onPress={handleSubmit((data) => mutation.mutate(data))}
              loading={mutation.isPending}
              variant={config.tone === 'expense' ? 'primary' : 'success'}
              className="mb-8"
            />
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
