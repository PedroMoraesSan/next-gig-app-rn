import { gql } from '@apollo/client';

// Save a job
export const SAVE_JOB = gql`
  mutation SaveJob($jobId: uuid!) {
    insert_saved_jobs_one(object: {job_id: $jobId}) {
      id
      job_id
      created_at
    }
  }
`;

// Unsave a job
export const UNSAVE_JOB = gql`
  mutation UnsaveJob($jobId: uuid!) {
    delete_saved_jobs(where: {job_id: {_eq: $jobId}}) {
      affected_rows
    }
  }
`;

// Apply for a job
export const APPLY_FOR_JOB = gql`
  mutation ApplyForJob($jobId: uuid!, $resumeUrl: String!, $coverLetter: String) {
    insert_applications_one(
      object: {
        job_id: $jobId, 
        resume_url: $resumeUrl, 
        cover_letter: $coverLetter,
        status: "submitted"
      }
    ) {
      id
      status
      created_at
    }
  }
`;

// Create job alert
export const CREATE_JOB_ALERT = gql`
  mutation CreateJobAlert($keywords: [String!], $location: String, $jobType: String, $frequency: String!) {
    insert_job_alerts_one(
      object: {
        keywords: $keywords,
        location: $location,
        job_type: $jobType,
        frequency: $frequency
      }
    ) {
      id
      created_at
    }
  }
`;

// Delete job alert
export const DELETE_JOB_ALERT = gql`
  mutation DeleteJobAlert($id: uuid!) {
    delete_job_alerts_by_pk(id: $id) {
      id
    }
  }
`;
