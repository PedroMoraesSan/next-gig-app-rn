import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  Alert, 
  StyleSheet,
  ActivityIndicator,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { biometricService } from '../services/biometricService';
import { useAnalytics } from '../hooks/useAnalytics';
import { EventType } from '../services/analytics';
import { errorTracking } from '../services/errorTracking';
import { validateData } from '../utils/dataValidation';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometrics');
  const [biometricLoading, setBiometricLoading] = useState(false);
  
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { signIn } = useAuth();
  const analytics = useAnalytics('Login');
  
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
          
          // If biometrics are enabled, show biometric prompt automatically
          if (enabled) {
            handleBiometricLogin();
          }
        }
      } catch (error) {
        console.error('Error checking biometrics:', error);
      }
    };
    
    checkBiometrics();
  }, []);
  
  // Handle standard login
  const handleLogin = async () => {
    // Validate inputs
    const validationRules = {
      required: ['email', 'password'],
      format: {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      },
      minLength: {
        password: 6
      }
    };
    
    const validationResult = validateData({ email, password }, validationRules);
    
    if (!validationResult.isValid) {
      Alert.alert('Validation Error', Object.values(validationResult.errors)[0]);
      return;
    }
    
    setLoading(true);
    try {
      await signIn(email, password);
      
      // Track login event
      analytics.trackEvent(EventType.LOGIN, {
        method: 'email'
      });
    } catch (error) {
      console.error('Login error:', error);
      errorTracking.logError(error, {
        context: 'LoginScreen',
        action: 'handleLogin',
        email: email.length > 0 ? `${email.substring(0, 3)}...` : 'empty'
      });
      Alert.alert('Login Failed', 'Invalid email or password');
      
      // Track error
      analytics.trackError('login_failed', {
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle biometric login
  const handleBiometricLogin = async () => {
    if (!biometricsEnabled) return;
    
    setBiometricLoading(true);
    try {
      const token = await biometricService.authenticate(`Sign in to NextGig with ${biometricType}`);
      
      if (token) {
        // Use the token to authenticate
        // In a real app, you would validate this token with your backend
        await signIn('', '', token);
        
        // Track login event
        analytics.trackEvent(EventType.LOGIN, {
          method: 'biometric',
          biometricType
        });
      }
    } catch (error) {
      console.error('Biometric login error:', error);
      errorTracking.logError(error, {
        context: 'LoginScreen',
        action: 'handleBiometricLogin',
        biometricType
      });
      
      // Only show alert for non-cancellation errors
      if (!error.message?.includes('User canceled')) {
        Alert.alert('Biometric Authentication Failed', 'Please try again or use email and password');
      }
      
      // Track error
      analytics.trackError('biometric_login_failed', {
        error: error.message,
        biometricType
      });
    } finally {
      setBiometricLoading(false);
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
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-6 flex-1 justify-center">
        <Text className="text-3xl font-bold text-center mb-8">Welcome Back</Text>
        
        <View className="mb-4">
          <Text className="text-gray-600 mb-2">Email</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading && !biometricLoading}
          />
        </View>
        
        <View className="mb-6">
          <Text className="text-gray-600 mb-2">Password</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading && !biometricLoading}
          />
        </View>
        
        <Button
          title="Sign In"
          onPress={handleLogin}
          loading={loading}
          disabled={loading || biometricLoading}
          fullWidth={true}
        />
        
        {biometricsAvailable && (
          <TouchableOpacity 
            className="mt-4 flex-row justify-center items-center"
            onPress={handleBiometricLogin}
            disabled={loading || biometricLoading || !biometricsEnabled}
          >
            {biometricLoading ? (
              <ActivityIndicator size="small" color="#0070f3" />
            ) : (
              <>
                <Text className="text-2xl mr-2">{getBiometricIcon()}</Text>
                <Text className="text-primary">
                  Sign in with {biometricType}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          className="mt-6" 
          onPress={() => navigation.navigate('Register')}
          disabled={loading || biometricLoading}
        >
          <Text className="text-center text-primary">
            Don't have an account? Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
