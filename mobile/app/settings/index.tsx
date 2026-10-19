import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Switch, Alert, Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { settingsApi, backupApi, usersApi } from '../../src/api/endpoints';
import { Input } from '../../src/components/common/Input';
import { Button } from '../../src/components/common/Button';
import { LoadingScreen } from '../../src/components/common/LoadingScreen';
import { useForm, Controller } from 'react-hook-form';
import { useAuthStore } from '../../src/store/authStore';
import { hasPermission, ROLE_LABELS } from '../../src/utils/permissions';
import type { UserRole } from '../../src/types';

const ROLE_OPTIONS = Object.entries(ROLE_LABELS) as [UserRole, string][];

export default function SettingsScreen() {
  const qc = useQueryClient();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const user = useAuthStore((s) => s.user);
  const [newUser, setNewUser] = React.useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    role: 'deliveryperson' as UserRole,
  });
  const [userStatusFilter, setUserStatusFilter] = React.useState<'all' | 'active' | 'inactive'>('all');
  const canManageUsers = hasPermission(user, 'users:manage');

  const signOut = async () => {
    await clearAuth();
    router.replace('/auth/login');
  };

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      const confirmed = globalThis.confirm('Are you sure you want to sign out?');
      if (confirmed) signOut();
      return;
    }

    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get().then((r) => r.data.data),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll().then((r) => r.data.data),
    enabled: canManageUsers,
  });

  const { control, handleSubmit, reset } = useForm({
    defaultValues: settings || {},
  });

  React.useEffect(() => {
    if (settings) reset(settings);
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: settingsApi.update,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      Toast.show({ type: 'success', text1: 'Settings saved' });
    },
    onError: () => Toast.show({ type: 'error', text1: 'Failed to save settings' }),
  });

  const backupMutation = useMutation({
    mutationFn: backupApi.create,
    onSuccess: () => Toast.show({ type: 'success', text1: 'Backup created successfully' }),
    onError: () => Toast.show({ type: 'error', text1: 'Backup failed' }),
  });

  const createUserMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setNewUser({ name: '', mobile: '', email: '', password: '', role: 'deliveryperson' });
      Toast.show({ type: 'success', text1: 'User created' });
    },
    onError: (err: any) => Toast.show({ type: 'error', text1: err?.response?.data?.message || 'Failed to create user' }),
  });

  const toggleUserMutation = useMutation({
    mutationFn: usersApi.toggleActive,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
    onError: () => Toast.show({ type: 'error', text1: 'Failed to update user' }),
  });

  const [editingUserId, setEditingUserId] = React.useState<string | null>(null);

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => usersApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setEditingUserId(null);
      setNewUser({ name: '', mobile: '', email: '', password: '', role: 'deliveryperson' });
      Toast.show({ type: 'success', text1: 'User updated' });
    },
    onError: (err: any) => Toast.show({ type: 'error', text1: err?.response?.data?.message || 'Failed to update user' }),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      Toast.show({ type: 'success', text1: 'User deleted' });
    },
    onError: (err: any) => Toast.show({ type: 'error', text1: err?.response?.data?.message || 'Failed to delete user' }),
  });

  const startEditUser = (u: any) => {
    setEditingUserId(u.id);
    setNewUser({ name: u.name || '', mobile: u.mobile || '', email: u.email || '', password: '', role: (u.role || 'deliveryperson') as UserRole });
  };
  const cancelEditUser = () => {
    setEditingUserId(null);
    setNewUser({ name: '', mobile: '', email: '', password: '', role: 'deliveryperson' });
  };
  const submitUser = () => {
    if (editingUserId) {
      const payload: any = { name: newUser.name, mobile: newUser.mobile, email: newUser.email, role: newUser.role };
      if (newUser.password) payload.password = newUser.password;
      updateUserMutation.mutate({ id: editingUserId, data: payload });
    } else {
      createUserMutation.mutate(newUser);
    }
  };
  const confirmDeleteUser = (u: any) => {
    const run = () => deleteUserMutation.mutate(u.id);
    const msg = `Delete user ${u.name}? This cannot be undone.`;
    if (Platform.OS === 'web') { if (globalThis.confirm(msg)) run(); return; }
    Alert.alert('Delete User', msg, [
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
        <Text className="text-xl font-bold text-gray-800 ml-4">Settings</Text>
      </View>

      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        {/* Business Info */}
        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text className="text-gray-700 font-semibold mb-4">Business Information</Text>
          <Controller control={control} name="businessName" render={({ field: { onChange, value } }) => (
            <Input label="Business Name" value={value ?? ''} onChangeText={onChange} placeholder="Your dairy farm name" />
          )} />
          <Controller control={control} name="businessAddress" render={({ field: { onChange, value } }) => (
            <Input label="Address" value={value ?? ''} onChangeText={onChange} placeholder="Full address" multiline />
          )} />
          <Controller control={control} name="businessPhone" render={({ field: { onChange, value } }) => (
            <Input label="Phone Number" value={value ?? ''} onChangeText={onChange} keyboardType="phone-pad" />
          )} />
          <Controller control={control} name="businessEmail" render={({ field: { onChange, value } }) => (
            <Input label="Email Address" value={value ?? ''} onChangeText={onChange} placeholder="billing@yourfarm.com" keyboardType="email-address" autoCapitalize="none" />
          )} />
          <Controller control={control} name="businessGst" render={({ field: { onChange, value } }) => (
            <Input label="GST Number" value={value ?? ''} onChangeText={onChange} placeholder="22AAAAA0000A1Z5" autoCapitalize="characters" />
          )} />
          <Text className="text-gray-400 text-xs -mt-2">These details appear in the header of every invoice PDF.</Text>
        </View>

        {/* Products & Pricing */}
        <TouchableOpacity
          onPress={() => router.push('/settings/products' as any)}
          className="bg-white rounded-2xl p-4 mb-4 flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <Ionicons name="pricetags-outline" size={20} color="#2563EB" />
            <View className="ml-3">
              <Text className="text-gray-700 font-semibold">Products & Pricing</Text>
              <Text className="text-gray-400 text-xs">Rate list & monthly delivery charge</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Backup */}
        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text className="text-gray-700 font-semibold mb-3">Data & Backup</Text>
          <Button
            title="Backup to Google Drive"
            onPress={() => Alert.alert('Create Backup', 'This will save a copy of all data to Google Drive.',
              [{ text: 'Cancel' }, { text: 'Backup', onPress: () => backupMutation.mutate() }])}
            loading={backupMutation.isPending}
            variant="secondary"
            className="mb-2"
          />
          <TouchableOpacity
            onPress={() => router.push('/settings/backup' as any)}
            className="flex-row items-center justify-between py-3"
          >
            <Text className="text-gray-600">View Backup History</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {canManageUsers && (
          <View className="bg-white rounded-2xl p-4 mb-4">
            <Text className="text-gray-700 font-semibold mb-4">{editingUserId ? 'Edit User' : 'Users & Roles'}</Text>
            <Input
              label="Name"
              value={newUser.name}
              onChangeText={(value) => setNewUser((current) => ({ ...current, name: value }))}
              placeholder="Employee name"
              required
            />
            <Input
              label="Mobile Number"
              value={newUser.mobile}
              onChangeText={(value) => setNewUser((current) => ({ ...current, mobile: value.replace(/\D/g, '').slice(0, 10) }))}
              placeholder="9876543210"
              keyboardType="phone-pad"
              maxLength={10}
              required
            />
            <Input
              label="Email"
              value={newUser.email}
              onChangeText={(value) => setNewUser((current) => ({ ...current, email: value }))}
              placeholder="optional"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label={editingUserId ? 'Password (leave blank to keep)' : 'Password'}
              value={newUser.password}
              onChangeText={(value) => setNewUser((current) => ({ ...current, password: value }))}
              placeholder={editingUserId ? 'Leave blank to keep current' : 'Temporary password'}
              secureTextEntry
              required={!editingUserId}
            />
            <Text className="text-sm font-medium text-gray-700 mb-2">Role</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {ROLE_OPTIONS.map(([role, label]) => (
                <TouchableOpacity
                  key={role}
                  onPress={() => setNewUser((current) => ({ ...current, role }))}
                  className={`px-3 py-2 rounded-xl border ${newUser.role === role ? 'bg-slate-900 border-slate-900' : 'bg-white border-gray-200'}`}
                >
                  <Text className={newUser.role === role ? 'text-white font-medium' : 'text-gray-600'}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button
              title={editingUserId ? 'Update User' : 'Add User'}
              onPress={submitUser}
              loading={createUserMutation.isPending || updateUserMutation.isPending}
              disabled={!newUser.name || newUser.mobile.length !== 10 || (!editingUserId && !newUser.password)}
              className="mb-2"
            />
            {editingUserId && (
              <TouchableOpacity onPress={cancelEditUser} className="items-center py-2 mb-2">
                <Text className="text-gray-500 font-medium">Cancel Edit</Text>
              </TouchableOpacity>
            )}

            <View className="flex-row gap-2 mb-3">
              {(['all', 'active', 'inactive'] as const).map((key) => {
                const count =
                  key === 'all'
                    ? users.length
                    : users.filter((u: any) => Boolean(u.isActive) === (key === 'active')).length;
                const label = key === 'all' ? 'All' : key === 'active' ? 'Active' : 'Inactive';
                const selected = userStatusFilter === key;
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setUserStatusFilter(key)}
                    className={`rounded-xl px-3 py-1 ${selected ? 'bg-slate-900' : 'bg-gray-100'}`}
                  >
                    <Text
                      className={`text-xs font-medium ${selected ? 'text-white' : 'text-gray-600'}`}
                    >
                      {count} {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {users
              .filter((item: any) => {
                if (userStatusFilter === 'all') return true;
                return userStatusFilter === 'active' ? Boolean(item.isActive) : !item.isActive;
              })
              .map((item: any) => (
              <View key={item.id} className="flex-row items-center justify-between border-t border-gray-100 py-3">
                <View className="flex-1 pr-3">
                  <Text className="text-gray-800 font-semibold">{item.name}</Text>
                  <Text className="text-gray-500 text-xs">{item.mobile || item.email || 'No contact'} · {ROLE_LABELS[item.role as UserRole] || item.role}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    onPress={() => toggleUserMutation.mutate(item.id)}
                    className={`px-3 py-2 rounded-xl ${item.isActive ? 'bg-green-50' : 'bg-gray-100'}`}
                  >
                    <Text className={`text-xs font-semibold ${item.isActive ? 'text-green-700' : 'text-gray-500'}`}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => startEditUser(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} className="px-1">
                    <Ionicons name="pencil-outline" size={18} color="#2563EB" />
                  </TouchableOpacity>
                  {item.id !== user?.id && (
                    <TouchableOpacity onPress={() => confirmDeleteUser(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} className="px-1">
                      <Ionicons name="trash-outline" size={18} color="#DC2626" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        <Button
          title="Save Settings"
          onPress={handleSubmit((data) => saveMutation.mutate(data))}
          loading={saveMutation.isPending}
          className="mb-4"
        />

        {/* Sign Out */}
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="danger"
          className="mb-8"
        />
      </ScrollView>
    </View>
  );
}
