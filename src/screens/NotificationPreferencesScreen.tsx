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
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { pushNotificationService } from '../services/pushNotificationService';
import { firebaseService } from '../services/firebase';
import { errorTracking } from '../services/errorTracking';
import { useAnalytics } from '../hooks/useAnalytics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery } from '@apollo/client';
import { GET_USER_NOTIFICATION_PREFERENCES } from '../graphql/queries/user';
import { UPDATE_NOTIFICATION_PREFERENCES } from '../graphql/mutations/user';
import { useMutationWithOfflineSupport } from '../hooks/useMutationWithOfflineSupport';

// Notification preference types
interface NotificationPreference {
  id: string;
  type: string;
  title: string;
  description: string;
  enabled: boolean;
}

const NotificationPreferencesScreen = () => {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
  
  const navigation = useNavigation();
  const { isAuthenticated, user } = useAuth();
  const analytics = useAnalytics('NotificationPreferences');
  
  // Get user notification preferences
  const { data, error, refetch } = useQuery(GET_USER_NOTIFICATION_PREFERENCES, {
    skip: !isAuthenticated,
    fetchPolicy: 'network-only'
  });
  
  // Update notification preferences mutation
  const [updatePreferences] = useMutationWithOfflineSupport(
    UPDATE_NOTIFICATION_PREFERENCES,
    { entityType: 'notificationPreference' }
  );
  
  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setLoading(true);
        
        // Check notification permission status
        const hasPermission = await pushNotificationService.hasPermission();
        setNotificationsEnabled(hasPermission);
        
        // Get permission status string
        const status = await pushNotificationService.getPermissionStatus();
        setPermissionStatus(status);
        
        // If we have data from the query, use it
        if (data?.notification_preferences) {
          setPreferences(data.notification_preferences);
        } else {
          // Otherwise use default preferences
          setPreferences([
            {
              id: '1',
              type: 'job_alerts',
              title: 'Job Alerts',
              description: 'Notifications for new job matches',
              enabled: true
            },
            {
              id: '2',
              type: 'application_updates',
              title: 'Application Updates',
              description: 'Status changes for your job applications',
              enabled: true
            },
            {
              id: '3',
              type: 'messages',
              title: 'Messages',
              description: 'New messages from employers',
              enabled: true
            },
            {
              id: '4',
              type: 'reminders',
              title: 'Reminders',
              description: 'Interview and deadline reminders',
              enabled: true
            },
            {
              id: '5',
              type: 'marketing',
              title: 'Marketing',
              description: 'Tips, news, and special offers',
              enabled: false
            }
          ]);
        }
      } catch (error) {
        console.error('Error loading notification preferences:', error);
        errorTracking.logError(error, {
          context: 'NotificationPreferencesScreen',
          action: 'loadPreferences'
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadPreferences();
  }, [data]);
  
  // Handle toggle notification permission
  const handleToggleNotifications = async () => {
    try {
      if (notificationsEnabled) {
        // Show settings to disable notifications
        pushNotificationService.showNotificationSettings();
      } else {
        // Request permission
        const granted = await pushNotificationService.requestPermission();
        setNotificationsEnabled(granted);
        
        // Get updated permission status
        const status = await pushNotificationService.getPermissionStatus();
        setPermissionStatus(status);
        
        // Track event
        analytics.trackEvent('notification_permission_request', {
          granted
        });
        
        if (!granted) {
          // Show settings prompt
          pushNotificationService.showPermissionDeniedAlert();
        }
      }
    } catch (error) {
      console.error('Error toggling notification permission:', error);
      errorTracking.logError(error, {
        context: 'NotificationPreferencesScreen',
        action: 'handleToggleNotifications'
      });
    }
  };
  
  // Handle toggle preference
  const handleTogglePreference = async (id: string, value: boolean) => {
    try {
      // Update local state
      const updatedPreferences = preferences.map(pref => 
        pref.id === id ? { ...pref, enabled: value } : pref
      );
      setPreferences(updatedPreferences);
      
      // Get preference type
      const preference = preferences.find(p => p.id === id);
      if (!preference) return;
      
      // Update in database
      await updatePreferences({
        variables: {
          id,
          enabled: value
        }
      });
      
      // Subscribe/unsubscribe from topic
      if (value) {
        await firebaseService.subscribeToTopic(preference.type);
      } else {
        await firebaseService.unsubscribeFromTopic(preference.type);
      }
      
      // Track event
      analytics.trackEvent('notification_preference_changed', {
        preferenceType: preference.type,
        enabled: value
      });
    } catch (error) {
      // Don't show error if it's just queued for offline
      if (!error.message?.includes('Mutation queued for offline execution')) {
        console.error('Error updating notification preference:', error);
        errorTracking.logError(error, {
          context: 'NotificationPreferencesScreen',
          action: 'handleTogglePreference',
          preferenceId: id,
          targetState: value
        });
        Alert.alert('Error', 'Failed to update notification preference');
        
        // Revert local state
        setPreferences(preferences);
      }
    }
  };
  
  // Get permission status text
  const getPermissionStatusText = () => {
    switch (permissionStatus) {
      case 'authorized':
        return 'Notifications are enabled';
      case 'denied':
        return 'Notifications are disabled in system settings';
      case 'provisional':
        return 'Notifications will be delivered silently';
      case 'ephemeral':
        return 'Notifications are temporarily enabled';
      case 'not-determined':
        return 'Notification permission not requested yet';
      default:
        return 'Notification status unknown';
    }
  };
  
  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center p-4">
        <Text className="text-xl font-bold text-center mb-4">Sign In Required</Text>
        <Text className="text-gray-600 text-center mb-6">
          Please sign in to manage your notification preferences.
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
          <Text className="text-2xl font-bold mb-6">Notification Preferences</Text>
          
          {/* Permission Status */}
          <View className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-lg font-semibold">Push Notifications</Text>
                <Text className="text-gray-600 mt-1">
                  {getPermissionStatusText()}
                </Text>
              </View>
              <Button
                title={notificationsEnabled ? "Settings" : "Enable"}
                onPress={handleToggleNotifications}
                variant="outline"
                fullWidth={false}
              />
            </View>
          </View>
          
          {/* Notification Types */}
          {loading ? (
            <View className="bg-white p-4 rounded-lg border border-gray-200 items-center justify-center py-8">
              <ActivityIndicator size="large" color="#0070f3" />
              <Text className="mt-4 text-gray-600">Loading preferences...</Text>
            </View>
          ) : (
            <View className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
              <Text className="text-lg font-semibold mb-4">Notification Types</Text>
              
              {preferences.map((preference) => (
                <View 
                  key={preference.id}
                  className="flex-row justify-between items-center py-3 border-b border-gray-200 last:border-b-0"
                >
                  <View className="flex-1">
                    <Text className="text-base">{preference.title}</Text>
                    <Text className="text-sm text-gray-500">
                      {preference.description}
                    </Text>
                  </View>
                  <Switch
                    value={preference.enabled}
                    onValueChange={(value) => handleTogglePreference(preference.id, value)}
                    disabled={!notificationsEnabled}
                  />
                </View>
              ))}
            </View>
          )}
          
          {/* About Notifications */}
          <View className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
            <Text className="text-lg font-semibold mb-2">About Notifications</Text>
            <Text className="text-gray-600 mb-2">
              Push notifications help you stay updated on job opportunities, application status changes, and important reminders.
            </Text>
            <Text className="text-gray-600">
              You can change your notification settings at any time from this screen or from your device settings.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationPreferencesScreen;
