import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { productsApi, settingsApi } from '../../src/api/endpoints';
import { Input } from '../../src/components/common/Input';
import { Button } from '../../src/components/common/Button';
import { LoadingScreen } from '../../src/components/common/LoadingScreen';
import { useAuthStore } from '../../src/store/authStore';
import { hasPermission } from '../../src/utils/permissions';
import type { Product } from '../../src/types';

const UNITS: Product['unit'][] = ['liter', 'kg'];
const unitLabel = (unit: Product['unit']) => (unit === 'kg' ? '1 kg' : '1 litre');

export default function ProductsPricingScreen() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const canManage = hasPermission(user, 'settings:manage');

  const [newProduct, setNewProduct] = useState<{ name: string; unit: Product['unit']; rate: string }>({
    name: '',
    unit: 'liter',
    rate: '',
  });
  const [deliveryCharge, setDeliveryCharge] = useState('');
  const [deliveryDirty, setDeliveryDirty] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getAll().then((r) => r.data.data as Product[]),
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get().then((r) => r.data.data),
  });

  React.useEffect(() => {
    if (settings && !deliveryDirty) {
      setDeliveryCharge(String(settings.monthlyDeliveryCharge ?? '0'));
    }
  }, [settings, deliveryDirty]);

  const createMutation = useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      setNewProduct({ name: '', unit: 'liter', rate: '' });
      Toast.show({ type: 'success', text1: 'Product added' });
    },
    onError: (err: any) =>
      Toast.show({ type: 'error', text1: err?.response?.data?.message || 'Failed to add product' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => productsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      Toast.show({ type: 'success', text1: 'Product updated' });
    },
    onError: (err: any) =>
      Toast.show({ type: 'error', text1: err?.response?.data?.message || 'Failed to update product' }),
  });

  const toggleMutation = useMutation({
    mutationFn: productsApi.toggleActive,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
    onError: () => Toast.show({ type: 'error', text1: 'Failed to update product' }),
  });

  const deleteMutation = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      Toast.show({ type: 'success', text1: 'Product deleted' });
    },
    onError: () => Toast.show({ type: 'error', text1: 'Failed to delete product' }),
  });

  const deliveryMutation = useMutation({
    mutationFn: (value: string) => settingsApi.update({ monthlyDeliveryCharge: value }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      setDeliveryDirty(false);
      Toast.show({ type: 'success', text1: 'Delivery charge saved' });
    },
    onError: () => Toast.show({ type: 'error', text1: 'Failed to save delivery charge' }),
  });

  const confirmDelete = (product: Product) => {
    const run = () => deleteMutation.mutate(product.id);
    if (Platform.OS === 'web') {
      if (globalThis.confirm(`Delete ${product.name}?`)) run();
      return;
    }
    Alert.alert('Delete Product', `Delete ${product.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: run },
    ]);
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800 ml-4">Products & Pricing</Text>
      </View>

      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        {/* Monthly delivery charge */}
        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text className="text-gray-700 font-semibold mb-1">Monthly Delivery Charge</Text>
          <Text className="text-gray-400 text-xs mb-3">Added once per customer on the monthly invoice.</Text>
          <View className="flex-row items-center gap-2">
            <Text className="text-gray-500 text-base">₹</Text>
            <TextInput
              className="flex-1 border border-slate-300 rounded-2xl px-4 py-3 text-gray-900 bg-white"
              value={deliveryCharge}
              onChangeText={(text) => {
                setDeliveryDirty(true);
                setDeliveryCharge(text.replace(/[^0-9.]/g, ''));
              }}
              keyboardType="decimal-pad"
              placeholder="0"
              editable={canManage}
            />
            {canManage && (
              <Button
                title="Save"
                onPress={() => deliveryMutation.mutate(String(parseFloat(deliveryCharge) || 0))}
                loading={deliveryMutation.isPending}
                className="px-5"
              />
            )}
          </View>
        </View>

        {/* Add product */}
        {canManage && (
          <View className="bg-white rounded-2xl p-4 mb-4">
            <Text className="text-gray-700 font-semibold mb-3">Add Product</Text>
            <Input
              label="Product Name"
              value={newProduct.name}
              onChangeText={(value) => setNewProduct((c) => ({ ...c, name: value }))}
              placeholder="e.g. Flavoured Milk"
              required
            />
            <Text className="text-sm font-medium text-gray-700 mb-2">Unit</Text>
            <View className="flex-row gap-2 mb-4">
              {UNITS.map((unit) => (
                <TouchableOpacity
                  key={unit}
                  onPress={() => setNewProduct((c) => ({ ...c, unit }))}
                  className={`px-4 py-2 rounded-xl border ${newProduct.unit === unit ? 'bg-slate-900 border-slate-900' : 'bg-white border-gray-200'}`}
                >
                  <Text className={newProduct.unit === unit ? 'text-white font-medium' : 'text-gray-600'}>
                    Per {unitLabel(unit)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Input
              label={`Rate (₹ per ${unitLabel(newProduct.unit)})`}
              value={newProduct.rate}
              onChangeText={(value) => setNewProduct((c) => ({ ...c, rate: value.replace(/[^0-9.]/g, '') }))}
              placeholder="0"
              keyboardType="decimal-pad"
            />
            <Button
              title="Add Product"
              onPress={() => createMutation.mutate({ ...newProduct, rate: parseFloat(newProduct.rate) || 0 })}
              loading={createMutation.isPending}
              disabled={!newProduct.name.trim()}
            />
          </View>
        )}

        {/* Price list */}
        <View className="bg-white rounded-2xl p-4 mb-8">
          <Text className="text-gray-700 font-semibold mb-1">Price List</Text>
          <Text className="text-gray-400 text-xs mb-3">Rate for 1 kg / 1 litre of each product.</Text>
          {products.length === 0 && (
            <Text className="text-gray-400 text-sm py-4 text-center">No products yet.</Text>
          )}
          {products.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              canManage={canManage}
              onSave={(data) => updateMutation.mutate({ id: product.id, data })}
              onToggle={() => toggleMutation.mutate(product.id)}
              onDelete={() => confirmDelete(product)}
              saving={updateMutation.isPending}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function ProductRow({
  product,
  canManage,
  onSave,
  onToggle,
  onDelete,
  saving,
}: {
  product: Product;
  canManage: boolean;
  onSave: (data: { name: string; unit: Product['unit']; rate: number; sortOrder: number }) => void;
  onToggle: () => void;
  onDelete: () => void;
  saving: boolean;
}) {
  const [rate, setRate] = useState(String(product.rate ?? 0));
  const [unit, setUnit] = useState<Product['unit']>(product.unit);

  React.useEffect(() => {
    setRate(String(product.rate ?? 0));
    setUnit(product.unit);
  }, [product.rate, product.unit]);

  const dirty = String(product.rate ?? 0) !== rate || product.unit !== unit;
  const lowStock = typeof product.stock === 'number' && typeof product.minStock === 'number'
    && product.minStock > 0 && product.stock <= product.minStock;

  return (
    <View className="border-t border-gray-100 py-3">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-gray-800 font-semibold flex-1">{product.name}</Text>
        {typeof product.stock === 'number' && (
          <View className={`px-2 py-0.5 rounded-lg mr-2 ${lowStock ? 'bg-red-50' : 'bg-gray-100'}`}>
            <Text className={`text-[11px] font-semibold ${lowStock ? 'text-red-600' : 'text-gray-500'}`}>
              Stock: {product.stock}{lowStock ? ' • Low' : ''}
            </Text>
          </View>
        )}
        <TouchableOpacity
          onPress={onToggle}
          disabled={!canManage}
          className={`px-3 py-1 rounded-xl ${product.isActive ? 'bg-green-50' : 'bg-gray-100'}`}
        >
          <Text className={`text-xs font-semibold ${product.isActive ? 'text-green-700' : 'text-gray-500'}`}>
            {product.isActive ? 'Active' : 'Inactive'}
          </Text>
        </TouchableOpacity>
      </View>
      <View className="flex-row items-center gap-2">
        <View className="flex-row gap-1">
          {UNITS.map((u) => (
            <TouchableOpacity
              key={u}
              onPress={() => canManage && setUnit(u)}
              className={`px-3 py-2 rounded-xl border ${unit === u ? 'bg-slate-900 border-slate-900' : 'bg-white border-gray-200'}`}
            >
              <Text className={`text-xs ${unit === u ? 'text-white font-medium' : 'text-gray-600'}`}>
                {u === 'kg' ? 'kg' : 'ltr'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View className="flex-row items-center flex-1 border border-slate-300 rounded-2xl px-3 bg-white">
          <Text className="text-gray-500">₹</Text>
          <TextInput
            className="flex-1 px-2 py-2.5 text-gray-900"
            value={rate}
            onChangeText={(text) => setRate(text.replace(/[^0-9.]/g, ''))}
            keyboardType="decimal-pad"
            editable={canManage}
            placeholder="0"
          />
          <Text className="text-gray-400 text-xs">/{unit === 'kg' ? 'kg' : 'ltr'}</Text>
        </View>
        {canManage && dirty && (
          <TouchableOpacity
            onPress={() => onSave({ name: product.name, unit, rate: parseFloat(rate) || 0, sortOrder: product.sortOrder })}
            disabled={saving}
            className="bg-blue-600 rounded-xl px-4 py-2.5"
          >
            <Text className="text-white text-xs font-semibold">Save</Text>
          </TouchableOpacity>
        )}
        {canManage && !dirty && (
          <TouchableOpacity onPress={onDelete} className="px-2 py-2">
            <Ionicons name="trash-outline" size={18} color="#DC2626" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
