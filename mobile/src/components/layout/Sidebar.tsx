import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { hasPermission, ROLE_LABELS, normalizeRole } from '../../utils/permissions';
import type { Permission } from '../../types';

interface NavItem {
  label: string;
  href: string;
  icon: keyof typeof Ionicons.glyphMap;
  permission: Permission;
  /** Route-name fragments that should also mark this item active (e.g. nested screens) */
  match?: string[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/(tabs)/dashboard', icon: 'grid-outline', permission: 'dashboard:view' },
      { label: 'Delivery', href: '/(tabs)/delivery', icon: 'calendar-outline', permission: 'deliveries:view', match: ['delivery'] },
    ],
  },
  {
    title: 'Customers & Billing',
    items: [
      { label: 'Customers', href: '/customers', icon: 'people-outline', permission: 'customers:view' },
      { label: 'Invoices', href: '/(tabs)/invoices', icon: 'receipt-outline', permission: 'billing:view' },
      { label: 'Payments', href: '/payments/record', icon: 'cash-outline', permission: 'billing:manage', match: ['payments'] },
    ],
  },
  {
    title: 'Herd Management',
    items: [
      { label: 'Cows', href: '/(tabs)/cows', icon: 'leaf-outline', permission: 'cattle:view' },
      { label: 'Breeding', href: '/breeding/add', icon: 'heart-outline', permission: 'cattle:manage', match: ['breeding'] },
      { label: 'Pregnancies', href: '/breeding/pregnancies', icon: 'happy-outline', permission: 'cattle:view' },
      { label: 'Milk Production', href: '/milk/add', icon: 'water-outline', permission: 'cattle:manage', match: ['milk'] },
      { label: 'Medicine Details', href: '/medicines', icon: 'medkit-outline', permission: 'cattle:view' },
      { label: 'Goats', href: '/animals/goats', icon: 'paw-outline', permission: 'cattle:view', match: ['animals/goats'] },
      { label: 'Hens', href: '/animals/hens', icon: 'egg-outline', permission: 'cattle:view', match: ['animals/hens'] },
      { label: 'Ducks', href: '/animals/ducks', icon: 'water-outline', permission: 'cattle:view', match: ['animals/ducks'] },
    ],
  },
  {
    title: 'Finance',
    items: [
      { label: 'Finance Overview', href: '/(tabs)/finance', icon: 'pie-chart-outline', permission: 'expenses:view' },
      { label: 'Expenses', href: '/finance/expenses', icon: 'wallet-outline', permission: 'expenses:view', match: ['finance/expenses', 'expenses'] },
      { label: 'Income', href: '/finance/income', icon: 'trending-up-outline', permission: 'income:view', match: ['finance/income'] },
      { label: 'Profit & Loss', href: '/reports/finance', icon: 'stats-chart-outline', permission: 'reports:view', match: ['reports/finance'] },
    ],
  },
  {
    title: 'Reports & Settings',
    items: [
      { label: 'Reports', href: '/reports', icon: 'bar-chart-outline', permission: 'reports:view' },
      { label: 'Settings', href: '/settings', icon: 'settings-outline', permission: 'settings:manage' },
    ],
  },
];

function isActive(pathname: string, item: NavItem): boolean {
  const base = item.href.replace('/(tabs)', '');
  if (pathname === base) return true;
  if (item.match?.some((m) => pathname.includes(m))) return true;
  return false;
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const role = normalizeRole(user?.role);

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
    <View
      style={{
        width: 240,
        flexShrink: 0,
        background: 'linear-gradient(180deg, #0D3B2E 0%, #082A20 100%)',
      } as any}
    >
      {/* Brand mark */}
      <View
        style={{
          height: 64, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16,
          borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
        }}
      >
        <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 16 }}>🐄</Text>
        </View>
        <View>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>Dairy Farm</Text>
          <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: '500' }}>Manager</Text>
        </View>
      </View>

      {/* Navigation */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 10, paddingTop: 16 }} showsVerticalScrollIndicator={false}>
        {NAV_GROUPS.map((group) => ({ ...group, items: group.items.filter((item) => hasPermission(user, item.permission)) }))
          .filter((group) => group.items.length > 0)
          .map((group) => (
          <View key={group.title} style={{ marginBottom: 18 }}>
            <Text style={{
              fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
              letterSpacing: 1, paddingHorizontal: 10, marginBottom: 6,
            }}>
              {group.title}
            </Text>
            {group.items.map((item) => {
              const active = isActive(pathname, item);
              return (
                <TouchableOpacity
                  key={item.href}
                  onPress={() => router.push(item.href as any)}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 10,
                    borderRadius: 10, paddingVertical: 9, paddingHorizontal: 10, marginBottom: 2,
                    backgroundColor: active ? 'rgba(255,255,255,0.14)' : 'transparent',
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name={item.icon} size={17} color={active ? '#4ADE9A' : 'rgba(255,255,255,0.55)'} />
                  <Text style={{
                    fontSize: 13, fontWeight: active ? '700' : '500',
                    color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                  }}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* User + sign out */}
      <View style={{ padding: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, paddingVertical: 8 }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>
              {(user?.name ?? 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={{ fontSize: 12, fontWeight: '600', color: '#fff' }}>{user?.name}</Text>
            <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{role ? ROLE_LABELS[role] : user?.role}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleLogout}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 10 }}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={17} color="#F87171" />
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#F87171' }}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
