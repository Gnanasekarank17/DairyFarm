import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { LoadingScreen } from '../src/components/common/LoadingScreen';

export default function Index() {
  const { user, isLoading } = useAuthStore();
  if (isLoading) return <LoadingScreen message="Starting Dairy Farm Manager..." />;
  return <Redirect href={user ? '/(tabs)/dashboard' : '/auth/login'} />;
}
