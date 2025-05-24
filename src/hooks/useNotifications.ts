import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_USER_NOTIFICATIONS, GET_UNREAD_NOTIFICATION_COUNT } from '../graphql/queries/user';
import { useAuth } from '../context/AuthContext';

export const useNotifications = () => {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Get notifications
  const { 
    data: notificationsData, 
    loading: notificationsLoading, 
    error: notificationsError,
    refetch: refetchNotifications,
    fetchMore: fetchMoreNotifications
  } = useQuery(GET_USER_NOTIFICATIONS, {
    variables: { limit: 20, offset: 0 },
    skip: !isAuthenticated
  });
  
  // Get unread notification count
  const { 
    data: countData, 
    loading: countLoading, 
    error: countError,
    refetch: refetchCount
  } = useQuery(GET_UNREAD_NOTIFICATION_COUNT, {
    skip: !isAuthenticated,
    pollInterval: 60000 // Poll every minute
  });
  
  // Update unread count when data changes
  useEffect(() => {
    if (countData?.notifications_aggregate?.aggregate?.count !== undefined) {
      setUnreadCount(countData.notifications_aggregate.aggregate.count);
    }
  }, [countData]);
  
  // Get notifications
  const getNotifications = () => {
    return notificationsData?.notifications || [];
  };
  
  // Get unread count
  const getUnreadCount = () => {
    return unreadCount;
  };
  
  // Load more notifications
  const loadMoreNotifications = async () => {
    if (notificationsLoading || !notificationsData?.notifications) return;
    
    try {
      await fetchMoreNotifications({
        variables: {
          offset: notificationsData.notifications.length,
          limit: 20
        }
      });
    } catch (error) {
      console.error('Error loading more notifications:', error);
    }
  };
  
  // Refresh notifications
  const refreshNotifications = async () => {
    try {
      await Promise.all([
        refetchNotifications(),
        refetchCount()
      ]);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  };
  
  return {
    notifications: getNotifications(),
    unreadCount: getUnreadCount(),
    loading: notificationsLoading || countLoading,
    error: notificationsError || countError,
    getUnreadCount,
    loadMoreNotifications,
    refreshNotifications
  };
};
