import { useEffect } from 'react';
import { View, Platform, useWindowDimensions } from 'react-native';
import { Stack, usePathname, router } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../src/store/authStore';
import { registerForPushNotifications } from '../src/utils/notifications';
import { Sidebar } from '../src/components/layout/Sidebar';
import '../global.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 5 * 60 * 1000 } },
});

function AppStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="customers/index" />
      <Stack.Screen name="customers/add" />
      <Stack.Screen name="customers/new" />
      <Stack.Screen name="customers/[id]/edit" />
      <Stack.Screen name="delivery/[customerId]" />
      <Stack.Screen name="payments/record" />
      <Stack.Screen name="cows/add" />
      <Stack.Screen name="cows/new" />
      <Stack.Screen name="breeding/add" />
      <Stack.Screen name="breeding/pregnancies" />
      <Stack.Screen name="calving/record" />
      <Stack.Screen name="milk/add" />
      <Stack.Screen name="reports/index" />
      <Stack.Screen name="settings/index" />
    </Stack>
  );
}

export default function RootLayout() {
  const loadAuth = useAuthStore((s) => s.loadAuth);
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const pathname = usePathname();
  const { width } = useWindowDimensions();

  useEffect(() => {
    loadAuth();
    void registerForPushNotifications();
  }, []);

  useEffect(() => {
    if (!isLoading && !user && !pathname.startsWith('/auth')) {
      router.replace('/auth/login');
    }
  }, [isLoading, user, pathname]);

  const showSidebar = Platform.OS === 'web' && width >= 900 && !!user && !pathname.startsWith('/auth');

  return (
    <QueryClientProvider client={queryClient}>
      <View style={{ flex: 1, flexDirection: 'row', minHeight: '100%' }}>
        {showSidebar && <Sidebar />}
        <View style={{ flex: 1, minWidth: 0 }}>
          <AppStack />
        </View>
      </View>
      <Toast />
    </QueryClientProvider>
  );
}
