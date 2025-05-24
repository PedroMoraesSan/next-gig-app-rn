import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { errorTracking } from './errorTracking';

// Storage keys
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const BIOMETRIC_TOKEN_KEY = 'biometric_token';

/**
 * Service for handling biometric authentication
 */
class BiometricService {
  private rnBiometrics: ReactNativeBiometrics;
  
  constructor() {
    this.rnBiometrics = new ReactNativeBiometrics({
      allowDeviceCredentials: true // Allow PIN/pattern/password as fallback
    });
  }
  
  /**
   * Check if biometrics are available on the device
   */
  async isBiometricsAvailable(): Promise<boolean> {
    try {
      const { available, biometryType } = await this.rnBiometrics.isSensorAvailable();
      return available;
    } catch (error) {
      console.error('Error checking biometrics availability:', error);
      errorTracking.logError(error, {
        context: 'BiometricService',
        action: 'isBiometricsAvailable'
      });
      return false;
    }
  }
  
  /**
   * Get the type of biometrics available on the device
   */
  async getBiometricType(): Promise<string> {
    try {
      const { available, biometryType } = await this.rnBiometrics.isSensorAvailable();
      
      if (!available) return 'None';
      
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
      errorTracking.logError(error, {
        context: 'BiometricService',
        action: 'getBiometricType'
      });
      return 'Biometrics';
    }
  }
  
  /**
   * Check if biometric authentication is enabled for the user
   */
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking if biometrics are enabled:', error);
      errorTracking.logError(error, {
        context: 'BiometricService',
        action: 'isBiometricEnabled'
      });
      return false;
    }
  }
  
  /**
   * Show biometric prompt to authenticate the user
   * @param promptMessage Message to show in the biometric prompt
   */
  async authenticate(promptMessage: string): Promise<string | null> {
    try {
      // Check if biometrics are available
      const { available } = await this.rnBiometrics.isSensorAvailable();
      if (!available) {
        throw new Error('Biometrics not available on this device');
      }
      
      // Check if biometrics are enabled for the user
      const enabled = await this.isBiometricEnabled();
      if (!enabled) {
        throw new Error('Biometrics not enabled for this user');
      }
      
      // Get stored token
      const storedToken = await AsyncStorage.getItem(BIOMETRIC_TOKEN_KEY);
      if (!storedToken) {
        throw new Error('No biometric token found');
      }
      
      // Authenticate with biometrics
      const { success } = await this.rnBiometrics.simplePrompt({
        promptMessage,
        cancelButtonText: 'Cancel'
      });
      
      if (success) {
        return storedToken;
      } else {
        throw new Error('Biometric authentication failed');
      }
    } catch (error) {
      console.error('Error authenticating with biometrics:', error);
      errorTracking.logError(error, {
        context: 'BiometricService',
        action: 'authenticate',
        promptMessage
      });
      return null;
    }
  }
  
  /**
   * Show biometric prompt to set up biometric authentication
   * @param token Authentication token to store for biometric login
   */
  async showBiometricSetupPrompt(token: string): Promise<boolean> {
    try {
      // Check if biometrics are available
      const { available, biometryType } = await this.rnBiometrics.isSensorAvailable();
      if (!available) {
        throw new Error('Biometrics not available on this device');
      }
      
      // Get biometric type name for prompt
      const biometricName = await this.getBiometricType();
      
      // Create keys if needed
      const { publicKey } = await this.rnBiometrics.createKeys();
      if (!publicKey) {
        throw new Error('Failed to create biometric keys');
      }
      
      // Authenticate with biometrics to confirm setup
      const { success } = await this.rnBiometrics.simplePrompt({
        promptMessage: `Set up ${biometricName} for quick sign-in`,
        cancelButtonText: 'Skip'
      });
      
      if (success) {
        // Store token and enable biometrics
        await AsyncStorage.setItem(BIOMETRIC_TOKEN_KEY, token);
        await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error setting up biometrics:', error);
      errorTracking.logError(error, {
        context: 'BiometricService',
        action: 'showBiometricSetupPrompt'
      });
      return false;
    }
  }
  
  /**
   * Disable biometric authentication for the user
   */
  async disableBiometrics(): Promise<boolean> {
    try {
      // Remove stored token and disable biometrics
      await AsyncStorage.removeItem(BIOMETRIC_TOKEN_KEY);
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'false');
      
      // Delete keys
      await this.rnBiometrics.deleteKeys();
      
      return true;
    } catch (error) {
      console.error('Error disabling biometrics:', error);
      errorTracking.logError(error, {
        context: 'BiometricService',
        action: 'disableBiometrics'
      });
      return false;
    }
  }
  
  /**
   * Sign payload with biometric keys
   * @param payload Payload to sign
   */
  async signWithBiometrics(payload: string): Promise<string | null> {
    try {
      // Check if biometrics are available
      const { available } = await this.rnBiometrics.isSensorAvailable();
      if (!available) {
        throw new Error('Biometrics not available on this device');
      }
      
      // Get biometric type name for prompt
      const biometricName = await this.getBiometricType();
      
      // Sign payload with biometrics
      const { success, signature } = await this.rnBiometrics.createSignature({
        promptMessage: `Authenticate with ${biometricName}`,
        payload,
        cancelButtonText: 'Cancel'
      });
      
      if (success && signature) {
        return signature;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error signing with biometrics:', error);
      errorTracking.logError(error, {
        context: 'BiometricService',
        action: 'signWithBiometrics'
      });
      return null;
    }
  }
}

export const biometricService = new BiometricService();
