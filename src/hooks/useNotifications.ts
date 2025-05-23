import { useState, useEffect } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock implementation of push notification functionality
// In a real app, you would use a library like react-native-push-notification,
// Firebase Cloud Messaging, or OneSignal

// Notification types
export type NotificationType = 'job_alert' | 'application_update' | 'message' | 'system';

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: any;
  read: boolean;
  createdAt: string;
}

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  // Request notification permissions
  const requestPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        // For Android 13+ (API level 33+), we need to request POST_NOTIFICATIONS permission
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            'android.permission.POST_NOTIFICATIONS' as any,
            {
              title: "Notification Permission",
              message: "NextGig needs notification permission to alert you about job opportunities.",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK"
            }
          );
          setPermissionGranted(granted === PermissionsAndroid.RESULTS.GRANTED);
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        // For Android < 13, permissions are granted at install time
        setPermissionGranted(true);
        return true;
      } else if (Platform.OS === 'ios') {
        // For iOS, we would use the actual notification library's permission request
        // This is a mock implementation
        setPermissionGranted(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error requesting notification permissions:', err);
      return false;
    }
  };
  
  // Load notifications from storage
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const storedNotifications = await AsyncStorage.getItem('notifications');
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Save notifications to storage
  const saveNotifications = async (notifs: Notification[]) => {
    try {
      await AsyncStorage.setItem('notifications', JSON.stringify(notifs));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };
  
  // Add a new notification
  const addNotification = async (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
      createdAt: new Date().toISOString()
    };
    
    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);
    
    // In a real app, you would show the notification here
    console.log('New notification:', newNotification);
    
    return newNotification;
  };
  
  // Mark a notification as read
  const markAsRead = async (id: string) => {
    const updatedNotifications = notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    );
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);
  };
  
  // Delete a notification
  const deleteNotification = async (id: string) => {
    const updatedNotifications = notifications.filter(notif => notif.id !== id);
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);
  };
  
  // Clear all notifications
  const clearNotifications = async () => {
    setNotifications([]);
    await saveNotifications([]);
  };
  
  // Get unread count
  const getUnreadCount = () => {
    return notifications.filter(notif => !notif.read).length;
  };
  
  // Schedule a job alert notification
  const scheduleJobAlert = async (jobTitle: string, company: string, jobId: string) => {
    return addNotification({
      title: 'New Job Match',
      body: `${jobTitle} at ${company} matches your job alert`,
      type: 'job_alert',
      data: { jobId }
    });
  };
  
  // Schedule an application update notification
  const scheduleApplicationUpdate = async (
    jobTitle: string, 
    company: string, 
    status: string, 
    applicationId: string
  ) => {
    return addNotification({
      title: 'Application Update',
      body: `Your application for ${jobTitle} at ${company} is now ${status}`,
      type: 'application_update',
      data: { applicationId, status }
    });
  };
  
  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      await requestPermissions();
      await loadNotifications();
    };
    
    init();
  }, []);
  
  return {
    notifications,
    loading,
    permissionGranted,
    requestPermissions,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearNotifications,
    getUnreadCount,
    scheduleJobAlert,
    scheduleApplicationUpdate
  };
};
