import { gql } from '@apollo/client';
import { JOB_FRAGMENT } from '../fragments';

// Get all jobs with filtering options
export const GET_JOBS = gql`
  query GetJobs($limit: Int, $offset: Int, $where: jobs_bool_exp) {
    jobs(limit: $limit, offset: $offset, where: $where, order_by: {posted_date: desc}) {
      ...JobFields
    }
  }
  ${JOB_FRAGMENT}
`;

// Get a specific job by ID
export const GET_JOB_BY_ID = gql`
  query GetJobById($id: uuid!) {
    jobs_by_pk(id: $id) {
      ...JobFields
    }
  }
  ${JOB_FRAGMENT}
`;

// Search jobs by term
export const SEARCH_JOBS = gql`
  query SearchJobs($searchTerm: String!, $limit: Int, $offset: Int) {
    jobs(
      limit: $limit, 
      offset: $offset, 
      where: {
        _or: [
          {title: {_ilike: $searchTerm}},
          {company: {_ilike: $searchTerm}},
          {description: {_ilike: $searchTerm}},
          {tags: {_contains: $searchTerm}}
        ]
      },
      order_by: {posted_date: desc}
    ) {
      ...JobFields
    }
  }
  ${JOB_FRAGMENT}
`;

// Get featured jobs
export const GET_FEATURED_JOBS = gql`
  query GetFeaturedJobs($limit: Int) {
    jobs(
      limit: $limit,
      where: { featured: { _eq: true } },
      order_by: {posted_date: desc}
    ) {
      ...JobFields
    }
  }
  ${JOB_FRAGMENT}
`;

// Get recent jobs
export const GET_RECENT_JOBS = gql`
  query GetRecentJobs($limit: Int) {
    jobs(
      limit: $limit,
      order_by: {posted_date: desc}
    ) {
      ...JobFields
    }
  }
  ${JOB_FRAGMENT}
`;

// Get jobs by location
export const GET_JOBS_BY_LOCATION = gql`
  query GetJobsByLocation($location: String!, $limit: Int, $offset: Int) {
    jobs(
      limit: $limit,
      offset: $offset,
      where: { location: { _ilike: $location } },
      order_by: {posted_date: desc}
    ) {
      ...JobFields
    }
  }
  ${JOB_FRAGMENT}
`;

// Get remote jobs
export const GET_REMOTE_JOBS = gql`
  query GetRemoteJobs($limit: Int, $offset: Int) {
    jobs(
      limit: $limit,
      offset: $offset,
      where: { location: { _ilike: "%remote%" } },
      order_by: {posted_date: desc}
    ) {
      ...JobFields
    }
  }
  ${JOB_FRAGMENT}
`;
