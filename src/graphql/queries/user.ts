import { gql } from '@apollo/client';
import { USER_FRAGMENT, APPLICATION_FRAGMENT, SAVED_JOB_FRAGMENT } from '../fragments';

// Get user profile
export const GET_USER_PROFILE = gql`
  query GetUserProfile {
    users {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

// Get user applications
export const GET_USER_APPLICATIONS = gql`
  query GetUserApplications {
    applications(order_by: {created_at: desc}) {
      ...ApplicationFields
    }
  }
  ${APPLICATION_FRAGMENT}
`;

// Get user saved jobs
export const GET_USER_SAVED_JOBS = gql`
  query GetUserSavedJobs {
    saved_jobs(order_by: {created_at: desc}) {
      ...SavedJobFields
    }
  }
  ${SAVED_JOB_FRAGMENT}
`;

// Get application by ID
export const GET_APPLICATION_BY_ID = gql`
  query GetApplicationById($id: uuid!) {
    applications_by_pk(id: $id) {
      ...ApplicationFields
      job {
        ...JobFields
      }
    }
  }
  ${APPLICATION_FRAGMENT}
  ${JOB_FRAGMENT}
`;

// Check if job is saved
export const CHECK_JOB_SAVED = gql`
  query CheckJobSaved($jobId: uuid!) {
    saved_jobs(where: {job_id: {_eq: $jobId}}) {
      id
    }
  }
`;

// Get user job alerts
export const GET_USER_JOB_ALERTS = gql`
  query GetUserJobAlerts {
    job_alerts(order_by: {created_at: desc}) {
      id
      keywords
      location
      job_type
      frequency
      created_at
      updated_at
    }
  }
`;

// Get user notifications
export const GET_USER_NOTIFICATIONS = gql`
  query GetUserNotifications($limit: Int, $offset: Int) {
    notifications(
      order_by: {created_at: desc}
      limit: $limit
      offset: $offset
    ) {
      id
      type
      title
      body
      data
      read
      created_at
    }
  }
`;

// Get notification preferences
export const GET_USER_NOTIFICATION_PREFERENCES = gql`
  query GetUserNotificationPreferences {
    notification_preferences {
      id
      type
      title
      description
      enabled
      created_at
      updated_at
    }
  }
`;
// Get unread notification count
export const GET_UNREAD_NOTIFICATION_COUNT = gql`
  query GetUnreadNotificationCount {
    notifications_aggregate(where: {read: {_eq: false}}) {
      aggregate {
        count
      }
    }
  }
`;
