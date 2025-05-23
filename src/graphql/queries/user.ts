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
