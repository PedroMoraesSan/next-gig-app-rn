import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const { width } = Dimensions.get('window');

export default function OfflineNotice() {
  const [isOffline, setIsOffline] = useState(false);
  const animatedValue = useState(new Animated.Value(0))[0];
  
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const offline = !state.isConnected;
      setIsOffline(offline);
      
      if (offline) {
        // Animate in
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        // Animate out
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 0],
  });
  
  if (!isOffline) return null;
  
  return (
    <Animated.View 
      style={[
        styles.container,
        { transform: [{ translateY }] }
      ]}
    >
      <Text style={styles.text}>No Internet Connection</Text>
      <Text style={styles.subText}>Some features may be limited</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8d7da',
    width,
    padding: 10,
    position: 'absolute',
    top: 0,
    zIndex: 1000,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f5c6cb',
  },
  text: {
    color: '#721c24',
    fontWeight: 'bold',
  },
  subText: {
    color: '#721c24',
    fontSize: 12,
  },
});
