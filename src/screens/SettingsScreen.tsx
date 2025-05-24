import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Linking
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { biometricService } from '../services/biometricService';
import { pushNotificationService } from '../services/pushNotificationService';
import { errorTracking } from '../services/errorTracking';
import { useAnalytics } from '../hooks/useAnalytics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { offlineQueue } from '../services/offlineQueue';
import { useSyncStatus } from '../context/SyncContext';

const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appVersion, setAppVersion] = useState('1.0.0');
  
  const navigation = useNavigation();
  const { user, signOut } = useAuth();
  const { hasPendingOperations, forceSync } = useSyncStatus();
  const analytics = useAnalytics('Settings');
  
  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Check biometrics
        const biometricsAvailable = await biometricService.isBiometricsAvailable();
        setBiometricsAvailable(biometricsAvailable);
        
        if (biometricsAvailable) {
          const biometricsEnabled = await biometricService.isBiometricEnabled();
          setBiometricsEnabled(biometricsEnabled);
        }
        
        // Check notifications
        const notificationsEnabled = await AsyncStorage.getItem('notifications_enabled');
        setNotificationsEnabled(notificationsEnabled === 'true');
        
        // Check analytics
        const analyticsEnabled = await AsyncStorage.getItem('analytics_enabled');
        setAnalyticsEnabled(analyticsEnabled !== 'false'); // Default to true
        
        // Check theme
        const darkMode = await AsyncStorage.getItem('dark_mode');
        setDarkModeEnabled(darkMode === 'true');
        
        // Get app version
        // In a real app, you would use a package like react-native-device-info
        setAppVersion('1.0.0');
      } catch (error) {
        console.error('Error loading settings:', error);
        errorTracking.logError(error, {
          context: 'SettingsScreen',
          action: 'loadSettings'
        });
      }
    };
    
    loadSettings();
  }, []);
  
  // Handle toggle notifications
  const handleToggleNotifications = async (value: boolean) => {
    try {
      setLoading(true);
      
      if (value) {
        // Request notification permissions
        const granted = await pushNotificationService.requestPermission();
        if (granted) {
          setNotificationsEnabled(true);
          await AsyncStorage.setItem('notifications_enabled', 'true');
          
          // Track event
          analytics.trackEvent('notifications_enabled');
        } else {
          setNotificationsEnabled(false);
          await AsyncStorage.setItem('notifications_enabled', 'false');
          
          // Show settings prompt
          pushNotificationService.showPermissionDeniedAlert();
        }
      } else {
        // Disable notifications
        setNotificationsEnabled(false);
        await AsyncStorage.setItem('notifications_enabled', 'false');
        
        // Track event
        analytics.trackEvent('notifications_disabled');
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      errorTracking.logError(error, {
        context: 'SettingsScreen',
        action: 'handleToggleNotifications',
        targetState: value
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle toggle analytics
  const handleToggleAnalytics = async (value: boolean) => {
    try {
      setAnalyticsEnabled(value);
      await AsyncStorage.setItem('analytics_enabled', value.toString());
      
      // In a real app, you would update analytics settings
      // analytics.setEnabled(value);
      
      // Track event (only if enabling or still enabled)
      if (value) {
        analytics.trackEvent('analytics_setting_changed', {
          enabled: value
        });
      }
    } catch (error) {
      console.error('Error toggling analytics:', error);
      errorTracking.logError(error, {
        context: 'SettingsScreen',
        action: 'handleToggleAnalytics',
        targetState: value
      });
    }
  };
  
  // Handle toggle dark mode
  const handleToggleDarkMode = async (value: boolean) => {
    try {
      setDarkModeEnabled(value);
      await AsyncStorage.setItem('dark_mode', value.toString());
      
      // In a real app, you would update theme
      // themeService.setDarkMode(value);
      
      // Track event
      analytics.trackEvent('theme_changed', {
        darkMode: value
      });
    } catch (error) {
      console.error('Error toggling dark mode:', error);
      errorTracking.logError(error, {
        context: 'SettingsScreen',
        action: 'handleToggleDarkMode',
        targetState: value
      });
    }
  };
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      // Check for pending operations
      if (hasPendingOperations) {
        Alert.alert(
          'Pending Changes',
          'You have pending changes that have not been synced. Signing out now may result in data loss.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Sync Now', 
              onPress: () => forceSync() 
            },
            { 
              text: 'Sign Out Anyway', 
              style: 'destructive',
              onPress: () => signOut() 
            }
          ]
        );
        return;
      }
      
      // Sign out
      await signOut();
      
      // Track event
      analytics.trackEvent('sign_out');
    } catch (error) {
      console.error('Error signing out:', error);
      errorTracking.logError(error, {
        context: 'SettingsScreen',
        action: 'handleSignOut'
      });
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };
  
  // Handle clear cache
  const handleClearCache = async () => {
    try {
      setLoading(true);
      
      // Clear Apollo cache
      // In a real app, you would clear the Apollo cache
      // client.clearStore();
      
      // Clear offline queue
      await offlineQueue.clearQueue();
      
      // Clear other caches
      // await AsyncStorage.multiRemove(['cache_key_1', 'cache_key_2']);
      
      // Track event
      analytics.trackEvent('cache_cleared');
      
      Alert.alert('Success', 'Cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error);
      errorTracking.logError(error, {
        context: 'SettingsScreen',
        action: 'handleClearCache'
      });
      Alert.alert('Error', 'Failed to clear cache');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle navigation to biometric setup
  const handleNavigateToBiometricSetup = () => {
    navigation.navigate('BiometricSetup' as never);
  };
  
  // Handle navigation to notification preferences
  const handleNavigateToNotificationPreferences = () => {
    navigation.navigate('NotificationPreferences' as never);
  };
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="p-4">
          <Text className="text-2xl font-bold mb-6">Settings</Text>
          
          {/* Account Section */}
          <View className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
            <Text className="text-lg font-semibold mb-4">Account</Text>
            
            {user ? (
              <View className="mb-4">
                <Text className="text-gray-600">{user.name}</Text>
                <Text className="text-gray-600">{user.email}</Text>
              </View>
            ) : (
              <View className="mb-4">
                <Text className="text-gray-600">Not signed in</Text>
              </View>
            )}
            
            {user ? (
              <Button
                title="Sign Out"
                onPress={handleSignOut}
                variant="outline"
                fullWidth={true}
              />
            ) : (
              <Button
                title="Sign In"
                onPress={() => navigation.navigate('Login' as never)}
                fullWidth={true}
              />
            )}
          </View>
          
          {/* Preferences Section */}
          <View className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
            <Text className="text-lg font-semibold mb-4">Preferences</Text>
            
            {/* Notifications */}
            <TouchableOpacity 
              className="flex-row justify-between items-center py-3 border-b border-gray-200"
              onPress={handleNavigateToNotificationPreferences}
              disabled={!user}
            >
              <View>
                <Text className="text-base">Notifications</Text>
                <Text className="text-sm text-gray-500">
                  {notificationsEnabled ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
                disabled={loading || !user}
              />
            </TouchableOpacity>
            
            {/* Biometric Authentication */}
            {biometricsAvailable && (
              <TouchableOpacity 
                className="flex-row justify-between items-center py-3 border-b border-gray-200"
                onPress={handleNavigateToBiometricSetup}
                disabled={!user}
              >
                <View>
                  <Text className="text-base">Biometric Authentication</Text>
                  <Text className="text-sm text-gray-500">
                    {biometricsEnabled ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
                <Text className="text-2xl">
                  {biometricsEnabled ? '✓' : '→'}
                </Text>
              </TouchableOpacity>
            )}
            
            {/* Dark Mode */}
            <View className="flex-row justify-between items-center py-3 border-b border-gray-200">
              <View>
                <Text className="text-base">Dark Mode</Text>
                <Text className="text-sm text-gray-500">
                  {darkModeEnabled ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
              <Switch
                value={darkModeEnabled}
                onValueChange={handleToggleDarkMode}
              />
            </View>
            
            {/* Analytics */}
            <View className="flex-row justify-between items-center py-3">
              <View>
                <Text className="text-base">Analytics</Text>
                <Text className="text-sm text-gray-500">
                  Help us improve by sharing usage data
                </Text>
              </View>
              <Switch
                value={analyticsEnabled}
                onValueChange={handleToggleAnalytics}
              />
            </View>
          </View>
          
          {/* Data & Storage Section */}
          <View className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
            <Text className="text-lg font-semibold mb-4">Data & Storage</Text>
            
            {/* Clear Cache */}
            <TouchableOpacity 
              className="flex-row justify-between items-center py-3 border-b border-gray-200"
              onPress={handleClearCache}
              disabled={loading}
            >
              <Text className="text-base">Clear Cache</Text>
              {loading ? (
                <ActivityIndicator size="small" color="#0070f3" />
              ) : (
                <Text className="text-2xl">→</Text>
              )}
            </TouchableOpacity>
            
            {/* Offline Data */}
            <TouchableOpacity 
              className="flex-row justify-between items-center py-3"
              onPress={() => navigation.navigate('OfflineData' as never)}
            >
              <View>
                <Text className="text-base">Offline Data</Text>
                <Text className="text-sm text-gray-500">
                  {hasPendingOperations ? 'Pending changes available' : 'All changes synced'}
                </Text>
              </View>
              <Text className="text-2xl">→</Text>
            </TouchableOpacity>
          </View>
          
          {/* About Section */}
          <View className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
            <Text className="text-lg font-semibold mb-4">About</Text>
            
            {/* Version */}
            <View className="flex-row justify-between items-center py-3 border-b border-gray-200">
              <Text className="text-base">Version</Text>
              <Text className="text-gray-500">{appVersion}</Text>
            </View>
            
            {/* Privacy Policy */}
            <TouchableOpacity 
              className="flex-row justify-between items-center py-3 border-b border-gray-200"
              onPress={() => Linking.openURL('https://example.com/privacy')}
            >
              <Text className="text-base">Privacy Policy</Text>
              <Text className="text-2xl">→</Text>
            </TouchableOpacity>
            
            {/* Terms of Service */}
            <TouchableOpacity 
              className="flex-row justify-between items-center py-3"
              onPress={() => Linking.openURL('https://example.com/terms')}
            >
              <Text className="text-base">Terms of Service</Text>
              <Text className="text-2xl">→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
