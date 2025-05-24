import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class FirebaseService {
  private static instance: FirebaseService;
  private initialized: boolean = false;

  static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Request permission for iOS
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          throw new Error('User declined push notifications');
        }
      }

      // Get the FCM token
      const fcmToken = await this.getFCMToken();
      if (fcmToken) {
        await this.saveFCMToken(fcmToken);
      }

      // Listen for token refresh
      this.setupTokenRefreshListener();

      this.initialized = true;
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      throw error;
    }
  }

  private async getFCMToken(): Promise<string | null> {
    try {
      const fcmToken = await messaging().getToken();
      return fcmToken;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  private async saveFCMToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('fcmToken', token);
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  }

  private setupTokenRefreshListener(): void {
    messaging().onTokenRefresh(async (token) => {
      console.log('FCM Token refreshed:', token);
      await this.saveFCMToken(token);
      // TODO: Update token on backend
    });
  }

  async getInitialNotification(): Promise<any> {
    try {
      const remoteMessage = await messaging().getInitialNotification();
      return remoteMessage;
    } catch (error) {
      console.error('Error getting initial notification:', error);
      return null;
    }
  }

  onMessageReceived(callback: (message: any) => void): () => void {
    return messaging().onMessage(callback);
  }

  onNotificationOpenedApp(callback: (message: any) => void): () => void {
    return messaging().onNotificationOpenedApp(callback);
  }

  async subscribeToTopic(topic: string): Promise<void> {
    try {
      await messaging().subscribeToTopic(topic);
      console.log(`Subscribed to topic: ${topic}`);
    } catch (error) {
      console.error(`Error subscribing to topic ${topic}:`, error);
      throw error;
    }
  }

  async unsubscribeFromTopic(topic: string): Promise<void> {
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`Unsubscribed from topic: ${topic}`);
    } catch (error) {
      console.error(`Error unsubscribing from topic ${topic}:`, error);
      throw error;
    }
  }
}

export const firebaseService = FirebaseService.getInstance();
