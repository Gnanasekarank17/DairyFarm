import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { useAuthStore } from '../store/authStore';

// Hosted API (Vercel). The web build is served from the same Vercel project, so it
// calls the API on its own origin; native builds use the absolute URL.
export const HOSTED_API_URL = 'https://dairy-farm-web-vert.vercel.app/api/v1';

const resolveBaseUrl = () => {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv && fromEnv.trim()) return fromEnv.trim();
  if (Platform.OS === 'web' && typeof window !== 'undefined') return '/api/v1';
  return HOSTED_API_URL;
};

export const BASE_URL = resolveBaseUrl();

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Object.prototype.toString.call(value) === '[object Object]';

const toCamelKey = (key: string) => {
  if (!key) return key;
  return key.charAt(0).toLowerCase() + key.slice(1);
};

const camelize = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(camelize);
  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {};
    Object.entries(value).forEach(([k, v]) => {
      result[toCamelKey(k)] = camelize(v);
    });
    return result;
  }
  return value;
};

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => {
    // Keep binary payloads untouched (report downloads).
    if (response.config.responseType !== 'blob') {
      response.data = camelize(response.data);
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      await useAuthStore.getState().clearAuth();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
