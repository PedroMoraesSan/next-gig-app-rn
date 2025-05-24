import axios from 'axios';
import { errorTracking } from './errorTracking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationType } from './pushNotificationService';

// Notification payload interface
export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  imageUrl?: string;
  priority?: 'normal' | 'high';
}

// Target types for notifications
export enum NotificationTarget {
  TOKEN = 'token',
  TOPIC = 'topic',
  CONDITION = 'condition',
  USER_ID = 'user_id',
}

/**
 * Backend service for sending push notifications
 */
class NotificationDeliveryService {
  private apiUrl: string = 'https://api.example.com/notifications'; // Replace with actual API URL
  private apiKey: string | null = null;
  
  /**
   * Initialize the service with API key
   */
  async initialize(): Promise<boolean> {
    try {
      // In a real app, this would be loaded from environment variables or secure storage
      this.apiKey = 'YOUR_API_KEY';
      return true;
    } catch (error) {
      console.error('Error initializing notification delivery service:', error);
      errorTracking.logError(error, {
        context: 'NotificationDeliveryService',
        action: 'initialize'
      });
      return false;
    }
  }
  
  /**
   * Send notification to a specific device token
   */
  async sendToDevice(
    token: string,
    notification: NotificationPayload
  ): Promise<boolean> {
    try {
      const response = await this.makeApiRequest('/send', {
        target: {
          type: NotificationTarget.TOKEN,
          value: token
        },
        notification
      });
      
      return response.success;
    } catch (error) {
      console.error('Error sending notification to device:', error);
      errorTracking.logError(error, {
        context: 'NotificationDeliveryService',
        action: 'sendToDevice'
      });
      return false;
    }
  }
  
  /**
   * Send notification to a topic
   */
  async sendToTopic(
    topic: string,
    notification: NotificationPayload
  ): Promise<boolean> {
    try {
      const response = await this.makeApiRequest('/send', {
        target: {
          type: NotificationTarget.TOPIC,
          value: topic
        },
        notification
      });
      
      return response.success;
    } catch (error) {
      console.error('Error sending notification to topic:', error);
      errorTracking.logError(error, {
        context: 'NotificationDeliveryService',
        action: 'sendToTopic'
      });
      return false;
    }
  }
  
  /**
   * Send notification to a user by ID
   */
  async sendToUser(
    userId: string,
    notification: NotificationPayload
  ): Promise<boolean> {
    try {
      const response = await this.makeApiRequest('/send', {
        target: {
          type: NotificationTarget.USER_ID,
          value: userId
        },
        notification
      });
      
      return response.success;
    } catch (error) {
      console.error('Error sending notification to user:', error);
      errorTracking.logError(error, {
        context: 'NotificationDeliveryService',
        action: 'sendToUser'
      });
      return false;
    }
  }
  
  /**
   * Send notification to multiple devices
   */
  async sendToDevices(
    tokens: string[],
    notification: NotificationPayload
  ): Promise<boolean> {
    try {
      const response = await this.makeApiRequest('/send-batch', {
        targets: tokens.map(token => ({
          type: NotificationTarget.TOKEN,
          value: token
        })),
        notification
      });
      
      return response.success;
    } catch (error) {
      console.error('Error sending notification to devices:', error);
      errorTracking.logError(error, {
        context: 'NotificationDeliveryService',
        action: 'sendToDevices'
      });
      return false;
    }
  }
  
  /**
   * Send job alert notification
   */
  async sendJobAlert(
    userId: string,
    jobId: string,
    jobTitle: string,
    company: string
  ): Promise<boolean> {
    const notification: NotificationPayload = {
      title: 'New Job Match',
      body: `${jobTitle} at ${company} matches your job alerts`,
      data: {
        type: NotificationType.JOB_ALERT,
        jobId,
        screen: 'JobDetail',
        params: { jobId }
      }
    };
    
    return this.sendToUser(userId, notification);
  }
  
  /**
   * Send application update notification
   */
  async sendApplicationUpdate(
    userId: string,
    applicationId: string,
    jobTitle: string,
    company: string,
    status: string
  ): Promise<boolean> {
    const notification: NotificationPayload = {
      title: 'Application Update',
      body: `Your application for ${jobTitle} at ${company} is now ${status}`,
      data: {
        type: NotificationType.APPLICATION_UPDATE,
        applicationId,
        screen: 'Application',
        params: { applicationId }
      }
    };
    
    return this.sendToUser(userId, notification);
  }
  
  /**
   * Send interview reminder notification
   */
  async sendInterviewReminder(
    userId: string,
    applicationId: string,
    jobTitle: string,
    company: string,
    interviewTime: string
  ): Promise<boolean> {
    const notification: NotificationPayload = {
      title: 'Interview Reminder',
      body: `Your interview for ${jobTitle} at ${company} is scheduled for ${interviewTime}`,
      data: {
        type: NotificationType.APPLICATION_UPDATE,
        applicationId,
        screen: 'Application',
        params: { applicationId }
      },
      priority: 'high'
    };
    
    return this.sendToUser(userId, notification);
  }
  
  /**
   * Send message notification
   */
  async sendMessageNotification(
    userId: string,
    messageId: string,
    senderName: string,
    messagePreview: string
  ): Promise<boolean> {
    const notification: NotificationPayload = {
      title: `New message from ${senderName}`,
      body: messagePreview,
      data: {
        type: NotificationType.MESSAGE,
        messageId,
        screen: 'Messages',
        params: { messageId }
      }
    };
    
    return this.sendToUser(userId, notification);
  }
  
  /**
   * Make API request to notification backend
   */
  private async makeApiRequest(
    endpoint: string,
    data: any
  ): Promise<any> {
    try {
      if (!this.apiKey) {
        await this.initialize();
      }
      
      const response = await axios.post(`${this.apiUrl}${endpoint}`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }
}

export const notificationDeliveryService = new NotificationDeliveryService();
