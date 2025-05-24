import { gql } from '@apollo/client';

// Update user profile
export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($name: String, $bio: String, $location: String, $avatarUrl: String) {
    update_users(
      where: {},
      _set: { name: $name }
    ) {
      affected_rows
      returning {
        id
        name
        email
      }
    }
    update_profiles(
      where: {},
      _set: { 
        bio: $bio, 
        location: $location, 
        avatar_url: $avatarUrl 
      }
    ) {
      affected_rows
    }
  }
`;

// Update resume
export const UPDATE_RESUME = gql`
  mutation UpdateResume($resumeUrl: String!) {
    update_profiles(
      where: {},
      _set: { resume_url: $resumeUrl }
    ) {
      affected_rows
    }
  }
`;

// Update application status
export const UPDATE_APPLICATION_STATUS = gql`
  mutation UpdateApplicationStatus($id: uuid!, $status: String!) {
    update_applications_by_pk(
      pk_columns: { id: $id },
      _set: { status: $status }
    ) {
      id
      status
      updated_at
    }
  }
`;

// Delete application
export const DELETE_APPLICATION = gql`
  mutation DeleteApplication($id: uuid!) {
    delete_applications_by_pk(id: $id) {
      id
    }
  }
`;

// Update notification read status
export const UPDATE_NOTIFICATION_READ_STATUS = gql`
  mutation UpdateNotificationReadStatus($id: uuid!, $read: Boolean!) {
    update_notifications_by_pk(
      pk_columns: { id: $id },
      _set: { read: $read }
    ) {
      id
      read
    }
  }
`;

// Mark all notifications as read
export const MARK_ALL_NOTIFICATIONS_READ = gql`
  mutation MarkAllNotificationsRead {
    update_notifications(
      where: { read: { _eq: false } },
      _set: { read: true }
    ) {
      affected_rows
    }
  }
`;
// Update notification preferences
export const UPDATE_NOTIFICATION_PREFERENCES = gql`
  mutation UpdateNotificationPreferences($id: uuid!, $enabled: Boolean!) {
    update_notification_preferences_by_pk(
      pk_columns: { id: $id },
      _set: { enabled: $enabled }
    ) {
      id
      enabled
      updated_at
    }
  }
`;
