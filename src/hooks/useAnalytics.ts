import { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { analytics, EventType } from '../services/analytics';
import { useAuth } from '../context/AuthContext';

// Hook for tracking screen views and user events
export const useAnalytics = (screenName: string, screenProps: Record<string, any> = {}) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const isFirstRender = useRef(true);
  
  // Track screen view on mount
  useEffect(() => {
    if (isFirstRender.current) {
      analytics.trackScreenView(screenName, {
        ...screenProps,
        userId: user?.id
      });
      isFirstRender.current = false;
    }
  }, [screenName, screenProps, user?.id]);
  
  // Track events
  const trackEvent = (event: EventType, properties: Record<string, any> = {}) => {
    analytics.trackEvent(event, {
      ...properties,
      screenName,
      userId: user?.id
    });
  };
  
  // Track job view
  const trackJobView = (jobId: string, jobTitle: string, company: string) => {
    trackEvent(EventType.VIEW_JOB, {
      jobId,
      jobTitle,
      company
    });
  };
  
  // Track job save
  const trackJobSave = (jobId: string, jobTitle: string, company: string) => {
    trackEvent(EventType.SAVE_JOB, {
      jobId,
      jobTitle,
      company
    });
  };
  
  // Track job unsave
  const trackJobUnsave = (jobId: string, jobTitle: string, company: string) => {
    trackEvent(EventType.UNSAVE_JOB, {
      jobId,
      jobTitle,
      company
    });
  };
  
  // Track job application
  const trackJobApplication = (jobId: string, jobTitle: string, company: string) => {
    trackEvent(EventType.APPLY_JOB, {
      jobId,
      jobTitle,
      company
    });
  };
  
  // Track job search
  const trackJobSearch = (searchTerm: string, filters: Record<string, any> = {}, resultCount: number) => {
    trackEvent(EventType.SEARCH_JOBS, {
      searchTerm,
      filters,
      resultCount
    });
  };
  
  // Track filter jobs
  const trackFilterJobs = (filters: Record<string, any>, resultCount: number) => {
    trackEvent(EventType.FILTER_JOBS, {
      filters,
      resultCount
    });
  };
  
  // Track resume upload
  const trackResumeUpload = (fileSize: number, fileType: string) => {
    trackEvent(EventType.UPLOAD_RESUME, {
      fileSize,
      fileType
    });
  };
  
  // Track job alert creation
  const trackJobAlertCreation = (keywords: string[], location: string | null, jobType: string | null) => {
    trackEvent(EventType.CREATE_JOB_ALERT, {
      keywords,
      location,
      jobType
    });
  };
  
  // Track interview scheduling
  const trackInterviewScheduling = (jobId: string, jobTitle: string, company: string) => {
    trackEvent(EventType.SCHEDULE_INTERVIEW, {
      jobId,
      jobTitle,
      company
    });
  };
  
  // Track error
  const trackError = (errorName: string, errorDetails: Record<string, any> = {}) => {
    analytics.trackError(errorName, {
      ...errorDetails,
      screenName,
      userId: user?.id
    });
  };
  
  return {
    trackEvent,
    trackJobView,
    trackJobSave,
    trackJobUnsave,
    trackJobApplication,
    trackJobSearch,
    trackFilterJobs,
    trackResumeUpload,
    trackJobAlertCreation,
    trackInterviewScheduling,
    trackError
  };
};
