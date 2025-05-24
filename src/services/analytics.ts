import { Platform } from 'react-native';
import React from 'react';
import Segment from 'react-native-analytics-segment';

// Event types
export enum EventType {
  // User events
  LOGIN = 'Login',
  SIGNUP = 'Signup',
  LOGOUT = 'Logout',
  
  // Job events
  JOB_VIEW = 'Job View',
  JOB_SEARCH = 'Job Search',
  JOB_SAVE = 'Job Save',
  JOB_UNSAVE = 'Job Unsave',
  JOB_APPLICATION = 'Job Application',
  JOB_SHARE = 'Job Share',
  
  // Profile events
  PROFILE_UPDATE = 'Profile Update',
  RESUME_UPDATE = 'Resume Update',
  
  // Alert events
  JOB_ALERT_CREATE = 'Job Alert Create',
  JOB_ALERT_DELETE = 'Job Alert Delete',
  
  // Interview events
  INTERVIEW_SCHEDULING = 'Interview Scheduling',
  
  // App events
  APP_OPEN = 'App Open',
  APP_BACKGROUND = 'App Background',
  APP_FOREGROUND = 'App Foreground',
  SCREEN_VIEW = 'Screen View',
  ERROR = 'Error',
}

// Analytics service
class AnalyticsService {
  private isInitialized: boolean = false;
  
  // Initialize analytics
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Initialize Segment
      await Segment.setup('YOUR_SEGMENT_WRITE_KEY', {
        trackApplicationLifecycleEvents: true,
        recordScreenViews: true,
        ios: {
          trackAdvertising: false,
          trackDeepLinks: true,
        },
        android: {
          collectDeviceId: false,
        },
      });
      
      // Set common properties
      Segment.setContext({
        app: {
          version: '1.0.0', // Replace with actual app version
          build: '1', // Replace with actual build number
        },
        device: {
          type: Platform.OS,
        },
      });
      
      this.isInitialized = true;
      console.log('Analytics initialized');
    } catch (error) {
      console.error('Error initializing analytics:', error);
    }
  }
  
  // Track event
  trackEvent(event: EventType, properties?: Record<string, any>) {
    try {
      Segment.track(event, properties);
    } catch (error) {
      console.error(`Error tracking event ${event}:`, error);
    }
  }
  
  // Track screen view
  trackScreenView(screenName: string, properties?: Record<string, any>) {
    try {
      Segment.screen(screenName, properties);
    } catch (error) {
      console.error(`Error tracking screen view ${screenName}:`, error);
    }
  }
  
  // Identify user
  identifyUser(userId: string, traits?: Record<string, any>) {
    try {
      Segment.identify(userId, traits);
    } catch (error) {
      console.error(`Error identifying user ${userId}:`, error);
    }
  }
  
  // Reset user
  resetUser() {
    try {
      Segment.reset();
    } catch (error) {
      console.error('Error resetting user:', error);
    }
  }
  
  // Track job view
  trackJobView(jobId: string, jobTitle: string, company: string) {
    this.trackEvent(EventType.JOB_VIEW, {
      job_id: jobId,
      job_title: jobTitle,
      company,
    });
  }
  
  // Track job search
  trackJobSearch(query: string, filters?: Record<string, any>, resultCount?: number) {
    this.trackEvent(EventType.JOB_SEARCH, {
      query,
      filters,
      result_count: resultCount,
    });
  }
  
  // Track job save
  trackJobSave(jobId: string, jobTitle: string, company: string) {
    this.trackEvent(EventType.JOB_SAVE, {
      job_id: jobId,
      job_title: jobTitle,
      company,
    });
  }
  
  // Track job unsave
  trackJobUnsave(jobId: string, jobTitle: string, company: string) {
    this.trackEvent(EventType.JOB_UNSAVE, {
      job_id: jobId,
      job_title: jobTitle,
      company,
    });
  }
  
  // Track job application
  trackJobApplication(jobId: string, jobTitle: string, company: string) {
    this.trackEvent(EventType.JOB_APPLICATION, {
      job_id: jobId,
      job_title: jobTitle,
      company,
    });
  }
  
  // Track job share
  trackJobShare(jobId: string, jobTitle: string, company: string, shareMethod?: string) {
    this.trackEvent(EventType.JOB_SHARE, {
      job_id: jobId,
      job_title: jobTitle,
      company,
      share_method: shareMethod,
    });
  }
  
  // Track interview scheduling
  trackInterviewScheduling(jobId: string, jobTitle: string, company: string) {
    this.trackEvent(EventType.INTERVIEW_SCHEDULING, {
      job_id: jobId,
      job_title: jobTitle,
      company,
    });
  }
  
  // Track error
  trackError(error: Error, context?: Record<string, any>) {
    this.trackEvent(EventType.ERROR, {
      error_message: error.message,
      error_stack: error.stack,
      ...context,
    });
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// Initialize analytics
export const initializeAnalytics = async () => {
  await analytics.initialize();
};

// Create a hook for analytics
export const useAnalytics = (screenName: string, properties?: Record<string, any>) => {
  // Track screen view
  React.useEffect(() => {
    analytics.trackScreenView(screenName, properties);
  }, [screenName]);
  
  return analytics;
};
