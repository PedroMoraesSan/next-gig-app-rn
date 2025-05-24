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
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { biometricService } from '../services/biometricService';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { errorTracking } from '../services/errorTracking';
import { useAnalytics } from '../hooks/useAnalytics';

const BiometricSetupScreen = () => {
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometrics');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  
  const navigation = useNavigation();
  const { isAuthenticated } = useAuth();
  const analytics = useAnalytics('BiometricSetup');
  
  // Check biometrics availability on mount
  useEffect(() => {
    const checkBiometrics = async () => {
      try {
        setInitializing(true);
        
        // Check if biometrics are available
        const available = await biometricService.isBiometricsAvailable();
        setBiometricsAvailable(available);
        
        if (available) {
          // Get biometric type
          const type = await biometricService.getBiometricType();
          setBiometricType(type);
          
          // Check if biometrics are enabled
          const enabled = await biometricService.isBiometricEnabled();
          setBiometricsEnabled(enabled);
        }
      } catch (error) {
        console.error('Error checking biometrics:', error);
        errorTracking.logError(error, {
          context: 'BiometricSetupScreen',
          action: 'checkBiometrics'
        });
      } finally {
        setInitializing(false);
      }
    };
    
    checkBiometrics();
  }, []);
  
  // Handle toggle biometrics
  const handleToggleBiometrics = async (value: boolean) => {
    if (!isAuthenticated) {
      Alert.alert('Error', 'You must be signed in to enable biometric authentication');
      return;
    }
    
    setLoading(true);
    try {
      if (value) {
        // Enable biometrics
        const success = await biometricService.showBiometricSetupPrompt('dummy-token');
        if (success) {
          setBiometricsEnabled(true);
          Alert.alert('Success', `${biometricType} authentication enabled successfully`);
          
          // Track event
          analytics.trackEvent('biometric_enabled', {
            biometricType
          });
        } else {
          // User cancelled or setup failed
          setBiometricsEnabled(false);
        }
      } else {
        // Disable biometrics
        const success = await biometricService.disableBiometrics();
        if (success) {
          setBiometricsEnabled(false);
          Alert.alert('Success', `${biometricType} authentication disabled`);
          
          // Track event
          analytics.trackEvent('biometric_disabled', {
            biometricType
          });
        } else {
          // Failed to disable
          setBiometricsEnabled(true);
          Alert.alert('Error', 'Failed to disable biometric authentication');
        }
      }
    } catch (error) {
      console.error('Error toggling biometrics:', error);
      errorTracking.logError(error, {
        context: 'BiometricSetupScreen',
        action: 'handleToggleBiometrics',
        targetState: value
      });
      Alert.alert('Error', 'Failed to update biometric authentication settings');
    } finally {
      setLoading(false);
    }
  };
  
  // Get biometric icon
  const getBiometricIcon = () => {
    if (biometricType === 'Face ID') {
      return '😊';
    } else if (biometricType === 'Touch ID' || biometricType === 'Fingerprint') {
      return '👆';
    } else {
      return '🔐';
    }
  };
  
  // Handle test biometrics
  const handleTestBiometrics = async () => {
    try {
      setLoading(true);
      const result = await biometricService.authenticate(`Test ${biometricType} Authentication`);
      
      if (result) {
        Alert.alert('Success', `${biometricType} authentication successful`);
        
        // Track event
        analytics.trackEvent('biometric_test_success', {
          biometricType
        });
      } else {
        Alert.alert('Failed', `${biometricType} authentication failed or was cancelled`);
        
        // Track event
        analytics.trackEvent('biometric_test_failed', {
          biometricType
        });
      }
    } catch (error) {
      console.error('Error testing biometrics:', error);
      errorTracking.logError(error, {
        context: 'BiometricSetupScreen',
        action: 'handleTestBiometrics'
      });
      Alert.alert('Error', 'Failed to test biometric authentication');
    } finally {
      setLoading(false);
    }
  };
  
  if (initializing) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#0070f3" />
        <Text className="mt-4 text-gray-600">Checking biometric capabilities...</Text>
      </SafeAreaView>
    );
  }
  
  if (!biometricsAvailable) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1 p-6">
          <Text className="text-3xl font-bold text-center mb-6">Biometric Authentication</Text>
          
          <View className="items-center justify-center mb-8">
            <Text className="text-5xl mb-4">🔒</Text>
            <Text className="text-xl text-center text-gray-700">
              Biometric authentication is not available on this device.
            </Text>
          </View>
          
          <Text className="text-gray-600 mb-6">
            Your device does not support biometric authentication or it has not been set up in your device settings.
          </Text>
          
          <Button
            title="Back to Settings"
            onPress={() => navigation.goBack()}
            fullWidth={true}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 p-6">
        <Text className="text-3xl font-bold text-center mb-6">Biometric Authentication</Text>
        
        <View className="items-center justify-center mb-8">
          <Text className="text-5xl mb-4">{getBiometricIcon()}</Text>
          <Text className="text-xl text-center text-gray-700">
            {biometricType} is available on your device
          </Text>
        </View>
        
        <View className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-lg font-semibold">Enable {biometricType}</Text>
              <Text className="text-gray-600 mt-1">
                Use {biometricType} for quick and secure sign-in
              </Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={handleToggleBiometrics}
              disabled={loading || !isAuthenticated}
            />
          </View>
        </View>
        
        {biometricsEnabled && (
          <Button
            title={`Test ${biometricType}`}
            onPress={handleTestBiometrics}
            disabled={loading}
            variant="outline"
            fullWidth={true}
          />
        )}
        
        <View className="mt-8">
          <Text className="text-lg font-semibold mb-2">About Biometric Authentication</Text>
          <Text className="text-gray-600 mb-4">
            Biometric authentication provides a secure and convenient way to sign in to your account without entering your password each time.
          </Text>
          <Text className="text-gray-600 mb-4">
            Your biometric data never leaves your device and is not stored on our servers.
          </Text>
          <Text className="text-gray-600">
            You can enable or disable this feature at any time from this screen.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BiometricSetupScreen;
