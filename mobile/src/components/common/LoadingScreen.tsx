import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

export const LoadingScreen = ({ message = 'Loading...' }: { message?: string }) => (
  <View className="flex-1 items-center justify-center bg-gray-50">
    <ActivityIndicator size="large" color="#2563EB" />
    <Text className="text-gray-500 mt-3">{message}</Text>
  </View>
);
