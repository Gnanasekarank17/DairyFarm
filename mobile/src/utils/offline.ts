import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'cache_';
const QUEUE_KEY = 'offline_queue';

export const cacheData = async (key: string, data: any, ttlMs = 5 * 60 * 1000) => {
  await AsyncStorage.setItem(
    `${CACHE_PREFIX}${key}`,
    JSON.stringify({ data, expiresAt: Date.now() + ttlMs })
  );
};

export const getCachedData = async <T>(key: string): Promise<T | null> => {
  const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  if (Date.now() > parsed.expiresAt) return null;
  return parsed.data as T;
};

export const queueOfflineAction = async (action: {
  method: string;
  url: string;
  data?: any;
}) => {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  const queue = raw ? JSON.parse(raw) : [];
  queue.push({ ...action, timestamp: Date.now() });
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const getOfflineQueue = async () => {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
};

export const clearOfflineQueue = async () => {
  await AsyncStorage.removeItem(QUEUE_KEY);
};
