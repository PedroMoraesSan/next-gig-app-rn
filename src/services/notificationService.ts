import { firebaseService } from './firebase';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export enum NotificationType {
  JOB_ALERT = 'job_alert',
  APPLICATION_UPDATE = 'application_update',
  MESSAGE = 'message',
  SYSTEM = 'system',
}

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
}

class NotificationService {
  private static instance: NotificationService;
  private initialized: boolean = false;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize Firebase
      await firebaseService.initialize();

      // Set up notification handlers
      this.setupNotificationHandlers();

      // Check for initial notification
      await this.checkInitialNotification();

      this.initialized = true;
      console.log('Notification service initialized successfully');
    } catch (error) {
      console.error('Notification service initialization failed:', error);
      throw error;
    }
  }

  private setupNotificationHandlers(): void {
    // Handle foreground messages
    firebaseService.onMessageReceived((message) => {
      this.handleNotification(message);
    });

    // Handle notification opened app
    firebaseService.onNotificationOpenedApp((message) => {
      this.handleNotificationOpen(message);
    });
  }

  private async checkInitialNotification(): Promise<void> {
    const message = await firebaseService.getInitialNotification();
    if (message) {
      this.handleNotificationOpen(message);
    }
  }

  private async handleNotification(message: any): Promise<void> {
    const notification: NotificationPayload = {
      type: message.data?.type || NotificationType.SYSTEM,
      title: message.notification?.title || '',
      body: message.notification?.body || '',
      data: message.data,
    };

    // Store notification
    await this.storeNotification(notification);

    // Update badge count
    await this.updateBadgeCount();

    // Emit notification event
    this.emitNotificationReceived(notification);
  }

  private async handleNotificationOpen(message: any): Promise<void> {
    const notification: NotificationPayload = {
      type: message.data?.type || NotificationType.SYSTEM,
      title: message.notification?.title || '',
      body: message.notification?.body || '',
      data: message.data,
    };

    // Mark notification as read
    await this.markNotificationAsRead(message.messageId);

    // Handle navigation based on notification type
    this.handleNotificationNavigation(notification);
  }

  private async storeNotification(notification: NotificationPayload): Promise<void> {
    try {
      const notifications = await this.getStoredNotifications();
      notifications.unshift({
        id: Date.now().toString(),
        ...notification,
        read: false,
        timestamp: new Date().toISOString(),
      });

      await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error storing notification:', error);
    }
  }

  private async getStoredNotifications(): Promise<any[]> {
    try {
      const notifications = await AsyncStorage.getItem('notifications');
      return notifications ? JSON.parse(notifications) : [];
    } catch (error) {
      console.error('Error getting stored notifications:', error);
      return [];
    }
  }

  private async markNotificationAsRead(messageId: string): Promise<void> {
    try {
      const notifications = await this.getStoredNotifications();
      const updatedNotifications = notifications.map((notification) => {
        if (notification.id === messageId) {
          return { ...notification, read: true };
        }
        return notification;
      });

      await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      await this.updateBadgeCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  private async updateBadgeCount(): Promise<void> {
    if (Platform.OS === 'ios') {
      try {
        const notifications = await this.getStoredNotifications();
        const unreadCount = notifications.filter((n) => !n.read).length;
        // Update app badge count
        // Note: You'll need to implement this using a native module
      } catch (error) {
        console.error('Error updating badge count:', error);
      }
    }
  }

  private emitNotificationReceived(notification: NotificationPayload): void {
    // Implement event emitter logic here
    console.log('Notification received:', notification);
  }

  private handleNotificationNavigation(notification: NotificationPayload): void {
    // Implement navigation logic based on notification type
    switch (notification.type) {
      case NotificationType.JOB_ALERT:
        // Navigate to job details or search
        break;
      case NotificationType.APPLICATION_UPDATE:
        // Navigate to application details
        break;
      case NotificationType.MESSAGE:
        // Navigate to messages
        break;
      case NotificationType.SYSTEM:
        // Navigate to notifications list
        break;
    }
  }

  // Public methods
  async subscribeToJobAlerts(jobType: string): Promise<void> {
    await firebaseService.subscribeToTopic(`job_alerts_${jobType}`);
  }

  async unsubscribeFromJobAlerts(jobType: string): Promise<void> {
    await firebaseService.unsubscribeFromTopic(`job_alerts_${jobType}`);
  }

  async getNotifications(): Promise<any[]> {
    return this.getStoredNotifications();
  }

  async clearNotifications(): Promise<void> {
    await AsyncStorage.setItem('notifications', JSON.stringify([]));
    await this.updateBadgeCount();
  }
}

export const notificationService = NotificationService.getInstance();
