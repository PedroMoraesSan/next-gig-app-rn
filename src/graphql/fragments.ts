import { gql } from '@apollo/client';

// Job fragment to reuse across queries
export const JOB_FRAGMENT = gql`
  fragment JobFields on jobs {
    id
    title
    company
    company_logo
    location
    job_type
    tags
    salary
    description
    posted_date
    requirements
    benefits
    featured
  }
`;

// User fragment
export const USER_FRAGMENT = gql`
  fragment UserFields on users {
    id
    name
    email
    profile {
      bio
      location
      avatar_url
      resume_url
    }
  }
`;

// Application fragment
export const APPLICATION_FRAGMENT = gql`
  fragment ApplicationFields on applications {
    id
    status
    created_at
    updated_at
    resume_url
    cover_letter
    job {
      id
      title
      company
      company_logo
    }
  }
`;

// Saved job fragment
export const SAVED_JOB_FRAGMENT = gql`
  fragment SavedJobFields on saved_jobs {
    id
    created_at
    job {
      id
      title
      company
      company_logo
      location
      job_type
      salary
      posted_date
    }
  }
`;
