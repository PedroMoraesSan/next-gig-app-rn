import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function SplashScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-3xl font-bold mb-8 text-primary">NextGig</Text>
      <ActivityIndicator size="large" color="#0070f3" />
    </View>
  );
}
