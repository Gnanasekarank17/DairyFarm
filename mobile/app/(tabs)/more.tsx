import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { hasPermission, ROLE_LABELS, normalizeRole } from '../../src/utils/permissions';
import type { Permission } from '../../src/types';

interface MenuItemProps {
  icon: string;
  label: string;
  subtitle?: string;
  href?: string;
  onPress?: () => void;
  color?: string;
  badge?: string;
  permission?: Permission;
}

const MENU_GROUPS: MenuItemProps[][] = [
  [
    { icon: 'people-outline', label: 'Customers', subtitle: 'Manage milk customers', href: '/customers', color: '#2563EB', permission: 'customers:view' },
    { icon: 'calendar-outline', label: 'Delivery Calendar', subtitle: 'Track daily deliveries', href: '/(tabs)/delivery', color: '#16A34A', permission: 'deliveries:view' },
    { icon: 'cash-outline', label: 'Payments', subtitle: 'Collect & track payments', href: '/payments', color: '#D97706', permission: 'billing:manage' },
    { icon: 'wallet-outline', label: 'Expenses', subtitle: 'Feed, medicine, doctor, salary, EB, petty cash', href: '/finance/expenses', color: '#DC2626', permission: 'expenses:view' },
    { icon: 'trending-up-outline', label: 'Income', subtitle: 'Cattle, calf, manure, egg sales & subsidies', href: '/finance/income', color: '#16A34A', permission: 'income:view' },
  ],
  [
    { icon: 'leaf-outline', label: 'Cows', subtitle: 'Manage your herd', href: '/(tabs)/cows', color: '#7C3AED', permission: 'cattle:view' },
    { icon: 'heart-outline', label: 'Breeding Records', subtitle: 'Mating & AI records', href: '/breeding/add', color: '#DC2626', permission: 'cattle:manage' },
    { icon: 'happy-outline', label: 'Pregnancies', subtitle: 'Track calving dates', href: '/breeding/pregnancies', color: '#D97706', permission: 'cattle:view' },
    { icon: 'water-outline', label: 'Milk Production', subtitle: 'Daily milk tracking', href: '/milk/add', color: '#0891B2', permission: 'cattle:manage' },
    { icon: 'medkit-outline', label: 'Medicine Details', subtitle: 'Name, dosage, purpose & comments', href: '/medicines', color: '#DC2626', permission: 'cattle:view' },
    { icon: 'paw-outline', label: 'Goats', subtitle: 'Manage your goat herd', href: '/animals/goats', color: '#7C3AED', permission: 'cattle:view' },
    { icon: 'egg-outline', label: 'Hens', subtitle: 'Manage your poultry flock', href: '/animals/hens', color: '#D97706', permission: 'cattle:view' },
    { icon: 'water-outline', label: 'Ducks', subtitle: 'Manage your duck flock', href: '/animals/ducks', color: '#0891B2', permission: 'cattle:view' },
  ],
  [
    { icon: 'bar-chart-outline', label: 'Reports', subtitle: 'Analytics & exports', href: '/reports/index', color: '#4F46E5', permission: 'reports:view' },
    { icon: 'stats-chart-outline', label: 'Income & Expense', subtitle: 'Monthly profit/loss & ledger', href: '/reports/finance', color: '#0891B2', permission: 'reports:view' },
    { icon: 'cloud-upload-outline', label: 'Backup to Drive', subtitle: 'Save data to Google Drive', href: '/settings/index', color: '#16A34A', permission: 'backup:manage' },
    { icon: 'settings-outline', label: 'Settings', subtitle: 'Business & app settings', href: '/settings/index', color: '#6B7280', permission: 'settings:manage' },
  ],
];

const MenuItem = ({ icon, label, subtitle, href, onPress, color = '#374151', badge }: MenuItemProps) => (
  <TouchableOpacity
    onPress={href ? () => router.push(href as any) : onPress}
    className="flex-row items-center py-4 border-b border-gray-100"
    activeOpacity={0.8}
  >
    <View className="w-9 h-9 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: `${color}15` }}>
      <Ionicons name={icon as any} size={20} color={color} />
    </View>
    <View className="flex-1">
      <Text className="text-gray-800 font-medium">{label}</Text>
      {subtitle && <Text className="text-gray-400 text-xs mt-0.5">{subtitle}</Text>}
    </View>
    {badge && (
      <View className="bg-red-500 rounded-full w-5 h-5 items-center justify-center mr-2">
        <Text className="text-white text-xs font-bold">{badge}</Text>
      </View>
    )}
    <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
  </TouchableOpacity>
);

export default function MoreTab() {
  const { user, clearAuth } = useAuthStore();
  const role = normalizeRole(user?.role);
  const customerId = user?.customerIds?.[0];

  const signOut = async () => {
    await clearAuth();
    router.replace('/auth/login');
  };

  const handleLogout = () => {
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

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Profile Header */}
      <View className="bg-blue-600 pt-14 pb-6 px-5">
        <View className="flex-row items-center">
          <View className="w-14 h-14 bg-white rounded-full items-center justify-center">
            <Text className="text-2xl">👤</Text>
          </View>
          <View className="ml-4">
            <Text className="text-white text-xl font-bold">{user?.name}</Text>
            <Text className="text-blue-200 text-sm">{user?.email}</Text>
            <View className="mt-1 bg-white/20 rounded-full px-2 py-0.5 self-start">
              <Text className="text-white text-xs font-medium">{role ? ROLE_LABELS[role] : user?.role}</Text>
            </View>
          </View>
        </View>
      </View>

      {role === 'customer' && customerId && (
        <View className="bg-white mx-4 -mt-3 rounded-2xl shadow-sm px-4 mb-4">
          <MenuItem
            icon="calendar-outline"
            label="My Delivery Calendar"
            subtitle="View given and missing milk days"
            href={`/delivery/${customerId}`}
            color="#DC2626"
          />
        </View>
      )}

      {MENU_GROUPS.map((group, index) => {
        const items = group.filter((item) => !item.permission || hasPermission(user, item.permission));
        if (items.length === 0) return null;
        return (
          <View key={index} className={`${index === 0 ? 'bg-white mx-4 -mt-3' : 'bg-white mx-4'} rounded-2xl shadow-sm px-4 mb-4`}>
            {items.map((item) => <MenuItem key={item.label} {...item} />)}
          </View>
        );
      })}

      <View className="bg-white mx-4 rounded-2xl shadow-sm px-4 mb-8">
        <MenuItem
          icon="log-out-outline"
          label="Sign Out"
          onPress={handleLogout}
          color="#DC2626"
        />
      </View>
    </ScrollView>
  );
}
