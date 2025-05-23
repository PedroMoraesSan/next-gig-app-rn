import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  SafeAreaView, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useNotifications } from '../hooks/useNotifications';
import Button from '../components/Button';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  
  const { 
    notifications, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearNotifications 
  } = useNotifications();
  
  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    // In a real app, you would fetch new notifications from the server
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  // Handle notification press
  const handleNotificationPress = async (notification) => {
    // Mark as read
    await markAsRead(notification.id);
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'job_alert':
        navigation.navigate('JobDetail', { jobId: notification.data.jobId });
        break;
      case 'application_update':
        // Navigate to application details
        // This would typically go to a specific application screen
        navigation.navigate('Profile');
        break;
      case 'message':
        // Navigate to messages
        break;
      case 'system':
        // System notifications don't navigate anywhere
        break;
    }
  };
  
  // Handle clear all
  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: clearNotifications
        }
      ]
    );
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Get notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'job_alert':
        return '🔍';
      case 'application_update':
        return '📝';
      case 'message':
        return '💬';
      case 'system':
        return '🔔';
      default:
        return '📌';
    }
  };
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4 flex-row justify-between items-center border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Notifications</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={handleClearAll}>
            <Text className="text-primary">Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {loading && !refreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0070f3" />
        </View>
      ) : notifications.length === 0 ? (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-xl font-medium text-gray-800 mb-2">No notifications</Text>
          <Text className="text-center text-gray-500 mb-6">
            You'll receive notifications about job alerts, application updates, and more.
          </Text>
          <Button 
            title="Browse Jobs" 
            onPress={() => navigation.navigate('Main')}
            variant="outline"
          />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              className={`p-4 border-b border-gray-200 ${!item.read ? 'bg-blue-50' : 'bg-white'}`}
              onPress={() => handleNotificationPress(item)}
            >
              <View className="flex-row">
                <Text className="text-2xl mr-3">{getNotificationIcon(item.type)}</Text>
                <View className="flex-1">
                  <Text className={`font-medium ${!item.read ? 'text-black' : 'text-gray-800'}`}>
                    {item.title}
                  </Text>
                  <Text className={`mt-1 ${!item.read ? 'text-gray-700' : 'text-gray-500'}`}>
                    {item.body}
                  </Text>
                  <Text className="text-gray-400 text-xs mt-2">
                    {formatDate(item.createdAt)}
                  </Text>
                </View>
                <TouchableOpacity
                  className="ml-2 p-2"
                  onPress={(e) => {
                    e.stopPropagation();
                    deleteNotification(item.id);
                  }}
                  hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                  <Text className="text-gray-400">✕</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}
