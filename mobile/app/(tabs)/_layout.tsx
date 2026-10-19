import { Tabs } from 'expo-router';
import { View, Platform, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { Redirect } from 'expo-router';
import { hasPermission } from '../../src/utils/permissions';

function TabIcon({ name, color, focused }: { name: keyof typeof Ionicons.glyphMap; color: string; focused: boolean }) {
  return (
    <View
      style={{
        width: 34,
        height: 28,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: focused ? 'rgba(255,255,255,0.16)' : 'transparent',
      }}
    >
      <Ionicons name={name} size={20} color={color} />
    </View>
  );
}

export default function TabsLayout() {
  const user = useAuthStore((s) => s.user);
  const { width } = useWindowDimensions();
  const isWideWeb = Platform.OS === 'web' && width >= 900;
  if (!user) return <Redirect href="/auth/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4ADE9A',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.55)',
        tabBarStyle: {
          display: isWideWeb ? 'none' : 'flex',
          backgroundColor: '#0D3B2E',
          borderTopColor: 'rgba(255,255,255,0.08)',
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 6,
          height: 64,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => <TabIcon name="grid-outline" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="delivery"
        options={{
          href: hasPermission(user, 'deliveries:view') ? undefined : null,
          title: 'Delivery',
          tabBarIcon: ({ color, focused }) => <TabIcon name="calendar-outline" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="cows"
        options={{
          href: hasPermission(user, 'cattle:view') ? undefined : null,
          title: 'Cows',
          tabBarIcon: ({ color, focused }) => <TabIcon name="leaf-outline" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="invoices"
        options={{
          href: hasPermission(user, 'billing:view') ? undefined : null,
          title: 'Invoices',
          tabBarIcon: ({ color, focused }) => <TabIcon name="receipt-outline" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          href: hasPermission(user, 'expenses:view') || hasPermission(user, 'income:view') ? undefined : null,
          title: 'Finance',
          tabBarIcon: ({ color, focused }) => <TabIcon name="wallet-outline" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, focused }) => <TabIcon name="menu-outline" color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
