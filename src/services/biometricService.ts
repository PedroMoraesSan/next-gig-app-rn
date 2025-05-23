import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';

// Initialize biometrics
const rnBiometrics = new ReactNativeBiometrics({
  allowDeviceCredentials: true // Allow PIN/pattern/password as fallback
});

// Storage keys
const BIOMETRIC_ENABLED_KEY = 'biometric_auth_enabled';
const BIOMETRIC_KEY_NAME = 'com.argotech.nextgig.biometricKey';
const SECURE_TOKEN_KEY = 'secure_user_token';

// Biometric service
class BiometricService {
  // Check if biometrics are available on the device
  async isBiometricsAvailable(): Promise<boolean> {
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      
      return available && (
        biometryType === BiometryTypes.FaceID ||
        biometryType === BiometryTypes.TouchID ||
        biometryType === BiometryTypes.Biometrics
      );
    } catch (error) {
      console.error('Error checking biometrics availability:', error);
      return false;
    }
  }
  
  // Get biometric type name for display
  async getBiometricType(): Promise<string> {
    try {
      const { biometryType } = await rnBiometrics.isSensorAvailable();
      
      switch (biometryType) {
        case BiometryTypes.FaceID:
          return 'Face ID';
        case BiometryTypes.TouchID:
          return 'Touch ID';
        case BiometryTypes.Biometrics:
          return Platform.OS === 'android' ? 'Fingerprint' : 'Biometrics';
        default:
          return 'Biometrics';
      }
    } catch (error) {
      console.error('Error getting biometric type:', error);
      return 'Biometrics';
    }
  }
  
  // Check if biometric authentication is enabled
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking if biometrics are enabled:', error);
      return false;
    }
  }
  
  // Enable biometric authentication
  async enableBiometrics(token: string): Promise<boolean> {
    try {
      // Check if biometrics are available
      const available = await this.isBiometricsAvailable();
      if (!available) {
        return false;
      }
      
      // Create keys if they don't exist
      const { keysExist } = await rnBiometrics.biometricKeysExist();
      if (!keysExist) {
        const { publicKey } = await rnBiometrics.createKeys();
        console.log('Biometric public key created:', publicKey);
      }
      
      // Store token securely
      await AsyncStorage.setItem(SECURE_TOKEN_KEY, token);
      
      // Enable biometric authentication
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
      
      return true;
    } catch (error) {
      console.error('Error enabling biometrics:', error);
      return false;
    }
  }
  
  // Disable biometric authentication
  async disableBiometrics(): Promise<boolean> {
    try {
      // Delete keys
      await rnBiometrics.deleteKeys();
      
      // Remove stored token
      await AsyncStorage.removeItem(SECURE_TOKEN_KEY);
      
      // Disable biometric authentication
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'false');
      
      return true;
    } catch (error) {
      console.error('Error disabling biometrics:', error);
      return false;
    }
  }
  
  // Authenticate with biometrics
  async authenticate(promptMessage: string = 'Verify your identity'): Promise<string | null> {
    try {
      // Check if biometrics are enabled
      const enabled = await this.isBiometricEnabled();
      if (!enabled) {
        return null;
      }
      
      // Create signature
      const { success, signature } = await rnBiometrics.createSignature({
        promptMessage,
        payload: BIOMETRIC_KEY_NAME,
        cancelButtonText: 'Cancel'
      });
      
      if (success && signature) {
        // Get stored token
        const token = await AsyncStorage.getItem(SECURE_TOKEN_KEY);
        return token;
      }
      
      return null;
    } catch (error) {
      console.error('Error authenticating with biometrics:', error);
      return null;
    }
  }
  
  // Show biometric prompt
  async showBiometricPrompt(promptMessage: string = 'Verify your identity'): Promise<boolean> {
    try {
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage,
        cancelButtonText: 'Cancel'
      });
      
      return success;
    } catch (error) {
      console.error('Error showing biometric prompt:', error);
      return false;
    }
  }
  
  // Show biometric setup prompt
  async showBiometricSetupPrompt(token: string): Promise<boolean> {
    try {
      // Check if biometrics are available
      const available = await this.isBiometricsAvailable();
      if (!available) {
        Alert.alert(
          'Biometric Authentication Not Available',
          'Your device does not support biometric authentication or it is not set up.'
        );
        return false;
      }
      
      // Get biometric type name
      const biometricType = await this.getBiometricType();
      
      // Show setup prompt
      return new Promise((resolve) => {
        Alert.alert(
          `Enable ${biometricType}`,
          `Would you like to enable ${biometricType} for quick and secure login?`,
          [
            {
              text: 'Not Now',
              style: 'cancel',
              onPress: () => resolve(false)
            },
            {
              text: 'Enable',
              onPress: async () => {
                const success = await this.enableBiometrics(token);
                resolve(success);
              }
            }
          ]
        );
      });
    } catch (error) {
      console.error('Error showing biometric setup prompt:', error);
      return false;
    }
  }
}

// Export singleton instance
export const biometricService = new BiometricService();
