import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  SafeAreaView
} from 'react-native';
import { useMutation } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';
import { useNotifications } from '../hooks/useNotifications';
import { formatDistanceToNow } from '../utils/dateUtils';
import { NotificationType } from '../services/pushNotificationService';
import { UPDATE_NOTIFICATION_READ_STATUS } from '../graphql/mutations/user';
import { useAuth } from '../context/AuthContext';

export default function NotificationsScreen() {
  const { isAuthenticated } = useAuth();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  
  // Get notifications
  const { 
    notifications, 
    loading, 
    error, 
    loadMoreNotifications, 
    refreshNotifications 
  } = useNotifications();
  
  // Update notification read status mutation
  const [updateNotificationReadStatus] = useMutation(UPDATE_NOTIFICATION_READ_STATUS);
  
  // Handle notification press
  const handleNotificationPress = async (notification: any) => {
    try {
      // Mark notification as read
      if (!notification.read) {
        await updateNotificationReadStatus({
          variables: {
            id: notification.id,
            read: true
          }
        });
      }
      
      // Navigate based on notification type
      switch (notification.type) {
        case NotificationType.JOB_ALERT:
          if (notification.data?.jobId) {
            navigation.navigate('JobDetail' as never, { jobId: notification.data.jobId } as never);
          } else {
            navigation.navigate('Search' as never);
          }
          break;
        case NotificationType.APPLICATION_UPDATE:
          if (notification.data?.applicationId) {
            navigation.navigate('Application' as never, { applicationId: notification.data.applicationId } as never);
          } else {
            navigation.navigate('Profile' as never);
          }
          break;
        case NotificationType.MESSAGE:
          // Navigate to messages screen (not implemented yet)
          break;
        default:
          // Do nothing for system notifications
          break;
      }
    } catch (error) {
      console.error('Error handling notification press:', error);
    }
  };
  
  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshNotifications();
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Render notification item
  const renderNotificationItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        className={`p-4 border-b border-gray-200 ${item.read ? 'bg-white' : 'bg-blue-50'}`}
        onPress={() => handleNotificationPress(item)}
      >
        <View className="flex-row justify-between">
          <Text className="font-bold text-base">{item.title}</Text>
          <Text className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(item.created_at))}
          </Text>
        </View>
        <Text className="text-gray-700 mt-1">{item.body}</Text>
      </TouchableOpacity>
    );
  };
  
  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center p-4">
        <Text className="text-xl font-bold text-center mb-4">Sign In Required</Text>
        <Text className="text-gray-600 text-center mb-6">
          Please sign in to view your notifications.
        </Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMoreNotifications}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={() => (
          <View className="p-4 bg-white border-b border-gray-200">
            <Text className="text-lg font-bold">Notifications</Text>
          </View>
        )}
        ListFooterComponent={() => (
          loading && !refreshing ? (
            <View className="py-4">
              <ActivityIndicator size="small" color="#0070f3" />
            </View>
          ) : null
        )}
        ListEmptyComponent={() => (
          !loading ? (
            <View className="p-4 items-center justify-center">
              <Text className="text-gray-500">No notifications yet</Text>
            </View>
          ) : null
        )}
      />
    </SafeAreaView>
  );
}
