import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  SafeAreaView, 
  Switch, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { biometricService } from '../services/biometricService';
import { useAnalytics } from '../hooks/useAnalytics';
import { EventType } from '../services/analytics';

export default function SettingsScreen() {
  const { isAuthenticated, user, signOut, setupBiometrics, disableBiometrics } = useAuth();
  const navigation = useNavigation();
  const analytics = useAnalytics('Settings');
  
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometrics');
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  
  // Check biometrics availability on mount
  useEffect(() => {
    const checkBiometrics = async () => {
      try {
        const available = await biometricService.isBiometricsAvailable();
        setBiometricsAvailable(available);
        
        if (available) {
          const enabled = await biometricService.isBiometricEnabled();
          setBiometricsEnabled(enabled);
          
          const type = await biometricService.getBiometricType();
          setBiometricType(type);
        }
      } catch (error) {
        console.error('Error checking biometrics:', error);
      }
    };
    
    checkBiometrics();
  }, []);
  
  // Handle biometrics toggle
  const handleBiometricsToggle = async (value: boolean) => {
    setLoading(true);
    try {
      if (value) {
        // Enable biometrics
        const success = await setupBiometrics();
        if (success) {
          setBiometricsEnabled(true);
          
          // Track event
          analytics.trackEvent('Enable_Biometrics', {
            biometricType
          });
        }
      } else {
        // Disable biometrics
        const success = await disableBiometrics();
        if (success) {
          setBiometricsEnabled(false);
          
          // Track event
          analytics.trackEvent('Disable_Biometrics', {
            biometricType
          });
        }
      }
    } catch (error) {
      console.error('Error toggling biometrics:', error);
      Alert.alert('Error', 'Failed to update biometric settings');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      
      // Track event
      analytics.trackEvent(EventType.LOGOUT);
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };
  
  // Handle notifications toggle
  const handleNotificationsToggle = (value: boolean) => {
    setNotificationsEnabled(value);
    
    // Track event
    analytics.trackEvent('Toggle_Notifications', {
      enabled: value
    });
  };
  
  // Handle email notifications toggle
  const handleEmailNotificationsToggle = (value: boolean) => {
    setEmailNotificationsEnabled(value);
    
    // Track event
    analytics.trackEvent('Toggle_Email_Notifications', {
      enabled: value
    });
  };
  
  // Handle dark mode toggle
  const handleDarkModeToggle = (value: boolean) => {
    setDarkModeEnabled(value);
    
    // Track event
    analytics.trackEvent('Toggle_Dark_Mode', {
      enabled: value
    });
    
    // In a real app, you would update the app's theme here
    Alert.alert('Coming Soon', 'Dark mode will be available in a future update.');
  };
  
  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center p-4">
        <Text className="text-xl font-bold mb-4">Sign in to access settings</Text>
        <Text className="text-gray-600 text-center mb-6">
          Create an account or sign in to manage your settings.
        </Text>
        <Button 
          title="Sign In" 
          onPress={() => navigation.navigate('Login' as never)} 
          fullWidth={true}
        />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="p-4">
          <Text className="text-2xl font-bold text-gray-900">Settings</Text>
          <Text className="text-gray-600 mt-1 mb-4">Manage your account preferences</Text>
          
          {/* Account Section */}
          <View className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
            <Text className="text-lg font-semibold mb-3">Account</Text>
            
            <TouchableOpacity 
              className="flex-row justify-between items-center py-3 border-b border-gray-100"
              onPress={() => navigation.navigate('Profile' as never)}
            >
              <Text className="text-gray-800">Edit Profile</Text>
              <Text className="text-gray-400">›</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-row justify-between items-center py-3 border-b border-gray-100"
              onPress={() => navigation.navigate('ResumeBuilder' as never)}
            >
              <Text className="text-gray-800">Resume Builder</Text>
              <Text className="text-gray-400">›</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-row justify-between items-center py-3"
              onPress={() => navigation.navigate('JobAlerts' as never)}
            >
              <Text className="text-gray-800">Job Alerts</Text>
              <Text className="text-gray-400">›</Text>
            </TouchableOpacity>
          </View>
          
          {/* Security Section */}
          <View className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
            <Text className="text-lg font-semibold mb-3">Security</Text>
            
            <TouchableOpacity 
              className="flex-row justify-between items-center py-3 border-b border-gray-100"
            >
              <Text className="text-gray-800">Change Password</Text>
              <Text className="text-gray-400">›</Text>
            </TouchableOpacity>
            
            {biometricsAvailable && (
              <View className="flex-row justify-between items-center py-3">
                <View>
                  <Text className="text-gray-800">{biometricType} Login</Text>
                  <Text className="text-gray-500 text-sm">Use {biometricType} to sign in</Text>
                </View>
                {loading ? (
                  <ActivityIndicator size="small" color="#0070f3" />
                ) : (
                  <Switch
                    value={biometricsEnabled}
                    onValueChange={handleBiometricsToggle}
                    trackColor={{ false: '#d1d5db', true: '#0070f3' }}
                    thumbColor={Platform.OS === 'ios' ? '#ffffff' : biometricsEnabled ? '#ffffff' : '#f4f3f4'}
                  />
                )}
              </View>
            )}
          </View>
          
          {/* Notifications Section */}
          <View className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
            <Text className="text-lg font-semibold mb-3">Notifications</Text>
            
            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <View>
                <Text className="text-gray-800">Push Notifications</Text>
                <Text className="text-gray-500 text-sm">Receive alerts on your device</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: '#d1d5db', true: '#0070f3' }}
                thumbColor={Platform.OS === 'ios' ? '#ffffff' : notificationsEnabled ? '#ffffff' : '#f4f3f4'}
              />
            </View>
            
            <View className="flex-row justify-between items-center py-3">
              <View>
                <Text className="text-gray-800">Email Notifications</Text>
                <Text className="text-gray-500 text-sm">Receive alerts via email</Text>
              </View>
              <Switch
                value={emailNotificationsEnabled}
                onValueChange={handleEmailNotificationsToggle}
                trackColor={{ false: '#d1d5db', true: '#0070f3' }}
                thumbColor={Platform.OS === 'ios' ? '#ffffff' : emailNotificationsEnabled ? '#ffffff' : '#f4f3f4'}
              />
            </View>
          </View>
          
          {/* Appearance Section */}
          <View className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
            <Text className="text-lg font-semibold mb-3">Appearance</Text>
            
            <View className="flex-row justify-between items-center py-3">
              <View>
                <Text className="text-gray-800">Dark Mode</Text>
                <Text className="text-gray-500 text-sm">Use dark theme</Text>
              </View>
              <Switch
                value={darkModeEnabled}
                onValueChange={handleDarkModeToggle}
                trackColor={{ false: '#d1d5db', true: '#0070f3' }}
                thumbColor={Platform.OS === 'ios' ? '#ffffff' : darkModeEnabled ? '#ffffff' : '#f4f3f4'}
              />
            </View>
          </View>
          
          {/* About Section */}
          <View className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
            <Text className="text-lg font-semibold mb-3">About</Text>
            
            <TouchableOpacity 
              className="flex-row justify-between items-center py-3 border-b border-gray-100"
            >
              <Text className="text-gray-800">Privacy Policy</Text>
              <Text className="text-gray-400">›</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-row justify-between items-center py-3 border-b border-gray-100"
            >
              <Text className="text-gray-800">Terms of Service</Text>
              <Text className="text-gray-400">›</Text>
            </TouchableOpacity>
            
            <View className="py-3">
              <Text className="text-gray-800">Version</Text>
              <Text className="text-gray-500 text-sm">1.0.0</Text>
            </View>
          </View>
          
          {/* Sign Out Button */}
          <View className="mt-4 mb-6">
            <Button 
              title="Sign Out" 
              onPress={handleSignOut} 
              variant="outline"
              fullWidth={true}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
