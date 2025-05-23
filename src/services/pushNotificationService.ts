import { Platform, Alert, Linking } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const FCM_TOKEN_KEY = 'fcm_token';
const NOTIFICATION_PERMISSION_KEY = 'notification_permission';

// Notification types
export enum NotificationType {
  JOB_ALERT = 'job_alert',
  APPLICATION_UPDATE = 'application_update',
  MESSAGE = 'message',
  SYSTEM = 'system'
}

// Notification data interface
export interface NotificationData {
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
}

// Push notification service
class PushNotificationService {
  private isInitialized: boolean = false;
  private navigationRef: any = null;
  
  // Set navigation reference
  setNavigationRef(ref: any) {
    this.navigationRef = ref;
  }
  
  // Initialize push notifications
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Request permission
      await this.requestPermission();
      
      // Get FCM token
      await this.getFCMToken();
      
      // Set up notification handlers
      this.setupNotificationHandlers();
      
      this.isInitialized = true;
      console.log('Push notifications initialized');
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }
  
  // Request notification permission
  async requestPermission() {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
      await AsyncStorage.setItem(NOTIFICATION_PERMISSION_KEY, enabled.toString());
      
      return enabled;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }
  
  // Check if notification permission is granted
  async hasPermission() {
    try {
      const authStatus = await messaging().hasPermission();
      return (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      );
    } catch (error) {
      console.error('Error checking notification permission:', error);
      return false;
    }
  }
  
  // Get FCM token
  async getFCMToken() {
    try {
      // Check if we have a token stored
      const storedToken = await AsyncStorage.getItem(FCM_TOKEN_KEY);
      
      // If not, get a new token
      if (!storedToken) {
        const fcmToken = await messaging().getToken();
        if (fcmToken) {
          await AsyncStorage.setItem(FCM_TOKEN_KEY, fcmToken);
          console.log('FCM Token:', fcmToken);
          
          // In a real app, you would send this token to your backend
          // await this.sendTokenToBackend(fcmToken);
        }
        return fcmToken;
      }
      
      return storedToken;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }
  
  // Set up notification handlers
  setupNotificationHandlers() {
    // Handle notifications when app is in foreground
    messaging().onMessage(async remoteMessage => {
      console.log('Foreground notification received:', remoteMessage);
      
      // In a real app, you would show a custom notification UI here
      // For now, we'll just log it
      if (remoteMessage.notification) {
        Alert.alert(
          remoteMessage.notification.title || 'New Notification',
          remoteMessage.notification.body || ''
        );
      }
    });
    
    // Handle notification opened when app is in background or closed
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Background notification opened:', remoteMessage);
      
      // Handle navigation based on notification type
      this.handleNotificationNavigation(remoteMessage);
    });
    
    // Check if app was opened from a notification
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('App opened from notification:', remoteMessage);
          
          // Handle navigation based on notification type
          this.handleNotificationNavigation(remoteMessage);
        }
      });
    
    // Handle FCM token refresh
    messaging().onTokenRefresh(token => {
      AsyncStorage.setItem(FCM_TOKEN_KEY, token);
      
      // In a real app, you would send this token to your backend
      // this.sendTokenToBackend(token);
    });
  }
  
  // Handle navigation based on notification type
  handleNotificationNavigation(remoteMessage: any) {
    if (!remoteMessage || !remoteMessage.data) return;
    
    const { type } = remoteMessage.data;
    
    // Make sure we have navigation reference
    if (!this.navigationRef || !this.navigationRef.isReady()) {
      console.log('Navigation not ready, storing notification for later');
      // In a real app, you would store the notification and handle it when navigation is ready
      return;
    }
    
    switch (type) {
      case NotificationType.JOB_ALERT:
        if (remoteMessage.data.jobId) {
          this.navigationRef.navigate('JobDetail', { jobId: remoteMessage.data.jobId });
        } else {
          this.navigationRef.navigate('Search');
        }
        break;
      case NotificationType.APPLICATION_UPDATE:
        if (remoteMessage.data.applicationId) {
          this.navigationRef.navigate('Application', { applicationId: remoteMessage.data.applicationId });
        } else {
          this.navigationRef.navigate('Profile');
        }
        break;
      case NotificationType.MESSAGE:
        // Navigate to messages screen (not implemented yet)
        break;
      case NotificationType.SYSTEM:
      default:
        this.navigationRef.navigate('Notifications');
        break;
    }
  }
  
  // Show notification settings
  showNotificationSettings() {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  }
  
  // Show permission denied alert
  showPermissionDeniedAlert() {
    Alert.alert(
      'Notification Permission',
      'To receive job alerts and application updates, please enable notifications in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Settings', onPress: () => this.showNotificationSettings() }
      ]
    );
  }
  
  // Send local notification (for testing)
  async sendLocalNotification(notification: NotificationData) {
    // This is a mock implementation
    // In a real app, you would use a library like react-native-push-notification
    console.log('Sending local notification:', notification);
    
    // For now, just show an alert
    Alert.alert(notification.title, notification.body);
  }
  
  // Register device with backend
  async registerDeviceWithBackend(userId: string) {
    try {
      const token = await this.getFCMToken();
      if (!token) return;
      
      // In a real app, you would make an API call to register the device
      console.log(`Registering device token ${token} for user ${userId}`);
      
      // Example API call:
      // await api.post('/users/register-device', { userId, token, platform: Platform.OS });
      
      return true;
    } catch (error) {
      console.error('Error registering device with backend:', error);
      return false;
    }
  }
  
  // Unregister device with backend
  async unregisterDeviceWithBackend() {
    try {
      const token = await this.getFCMToken();
      if (!token) return;
      
      // In a real app, you would make an API call to unregister the device
      console.log(`Unregistering device token ${token}`);
      
      // Example API call:
      // await api.post('/users/unregister-device', { token });
      
      return true;
    } catch (error) {
      console.error('Error unregistering device with backend:', error);
      return false;
    }
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();
