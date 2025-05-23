import { Platform } from 'react-native';
import { createClient } from '@segment/analytics-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define event types
export enum EventType {
  // Screen views
  SCREEN_VIEW = 'Screen View',
  
  // Authentication events
  LOGIN = 'Login',
  SIGNUP = 'Signup',
  LOGOUT = 'Logout',
  
  // Job search events
  SEARCH_JOBS = 'Search Jobs',
  FILTER_JOBS = 'Filter Jobs',
  VIEW_JOB = 'View Job',
  SAVE_JOB = 'Save Job',
  UNSAVE_JOB = 'Unsave Job',
  
  // Application events
  APPLY_JOB = 'Apply for Job',
  UPDATE_APPLICATION = 'Update Application',
  DELETE_APPLICATION = 'Delete Application',
  
  // Resume events
  UPLOAD_RESUME = 'Upload Resume',
  UPDATE_RESUME = 'Update Resume',
  
  // Job alert events
  CREATE_JOB_ALERT = 'Create Job Alert',
  DELETE_JOB_ALERT = 'Delete Job Alert',
  
  // Interview events
  SCHEDULE_INTERVIEW = 'Schedule Interview',
  UPDATE_INTERVIEW = 'Update Interview',
  DELETE_INTERVIEW = 'Delete Interview',
  
  // Profile events
  UPDATE_PROFILE = 'Update Profile',
  
  // Error events
  ERROR = 'Error'
}

// Define user properties
export enum UserProperty {
  USER_ID = 'user_id',
  EMAIL = 'email',
  NAME = 'name',
  LOCATION = 'location',
  JOB_TITLE = 'job_title',
  EXPERIENCE_LEVEL = 'experience_level',
  SKILLS = 'skills',
  PREFERRED_JOB_TYPE = 'preferred_job_type',
  PREFERRED_LOCATION = 'preferred_location',
  ACCOUNT_CREATED_AT = 'account_created_at',
  LAST_ACTIVE_AT = 'last_active_at'
}

// Analytics service
class AnalyticsService {
  private segmentClient: any = null;
  private isInitialized: boolean = false;
  private userId: string | null = null;
  private offlineEvents: any[] = [];
  private storageKey: string = 'offline_analytics_events';
  
  // Initialize analytics
  async initialize(writeKey: string) {
    if (this.isInitialized) return;
    
    try {
      // Create Segment client
      this.segmentClient = createClient({
        writeKey,
        trackAppLifecycleEvents: true, // Track app lifecycle events automatically
        recordScreenViews: true, // Record screen views automatically
        flushAt: 20, // Batch events
        flushInterval: 30, // Flush every 30 seconds
        debug: __DEV__ // Enable debug mode in development
      });
      
      // Load offline events
      await this.loadOfflineEvents();
      
      // Process offline events if any
      if (this.offlineEvents.length > 0) {
        await this.processOfflineEvents();
      }
      
      this.isInitialized = true;
      console.log('Analytics initialized');
    } catch (error) {
      console.error('Error initializing analytics:', error);
    }
  }
  
  // Load offline events from storage
  private async loadOfflineEvents() {
    try {
      const eventsData = await AsyncStorage.getItem(this.storageKey);
      if (eventsData) {
        this.offlineEvents = JSON.parse(eventsData);
        console.log(`Loaded ${this.offlineEvents.length} offline events`);
      }
    } catch (error) {
      console.error('Error loading offline events:', error);
    }
  }
  
  // Save offline events to storage
  private async saveOfflineEvents() {
    try {
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(this.offlineEvents));
    } catch (error) {
      console.error('Error saving offline events:', error);
    }
  }
  
  // Process offline events
  private async processOfflineEvents() {
    if (!this.segmentClient || this.offlineEvents.length === 0) return;
    
    try {
      console.log(`Processing ${this.offlineEvents.length} offline events`);
      
      for (const event of this.offlineEvents) {
        switch (event.type) {
          case 'track':
            await this.segmentClient.track(event.name, event.properties);
            break;
          case 'screen':
            await this.segmentClient.screen(event.name, event.properties);
            break;
          case 'identify':
            await this.segmentClient.identify(event.userId, event.traits);
            break;
        }
      }
      
      // Clear offline events
      this.offlineEvents = [];
      await this.saveOfflineEvents();
    } catch (error) {
      console.error('Error processing offline events:', error);
    }
  }
  
  // Identify user
  async identifyUser(userId: string, traits: Record<string, any> = {}) {
    this.userId = userId;
    
    try {
      if (this.segmentClient) {
        await this.segmentClient.identify(userId, {
          ...traits,
          platform: Platform.OS,
          appVersion: '1.0.0', // Replace with actual app version
        });
      } else {
        // Store offline
        this.offlineEvents.push({
          type: 'identify',
          userId,
          traits: {
            ...traits,
            platform: Platform.OS,
            appVersion: '1.0.0',
          }
        });
        await this.saveOfflineEvents();
      }
    } catch (error) {
      console.error('Error identifying user:', error);
    }
  }
  
  // Track event
  async trackEvent(event: EventType, properties: Record<string, any> = {}) {
    try {
      if (this.segmentClient) {
        await this.segmentClient.track(event, {
          ...properties,
          userId: this.userId,
          platform: Platform.OS,
          timestamp: new Date().toISOString()
        });
      } else {
        // Store offline
        this.offlineEvents.push({
          type: 'track',
          name: event,
          properties: {
            ...properties,
            userId: this.userId,
            platform: Platform.OS,
            timestamp: new Date().toISOString()
          }
        });
        await this.saveOfflineEvents();
      }
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }
  
  // Track screen view
  async trackScreenView(screenName: string, properties: Record<string, any> = {}) {
    try {
      if (this.segmentClient) {
        await this.segmentClient.screen(screenName, {
          ...properties,
          userId: this.userId,
          platform: Platform.OS,
          timestamp: new Date().toISOString()
        });
      } else {
        // Store offline
        this.offlineEvents.push({
          type: 'screen',
          name: screenName,
          properties: {
            ...properties,
            userId: this.userId,
            platform: Platform.OS,
            timestamp: new Date().toISOString()
          }
        });
        await this.saveOfflineEvents();
      }
    } catch (error) {
      console.error('Error tracking screen view:', error);
    }
  }
  
  // Track error
  async trackError(errorName: string, errorDetails: Record<string, any> = {}) {
    await this.trackEvent(EventType.ERROR, {
      errorName,
      ...errorDetails
    });
  }
  
  // Reset user
  async resetUser() {
    this.userId = null;
    
    try {
      if (this.segmentClient) {
        await this.segmentClient.reset();
      }
    } catch (error) {
      console.error('Error resetting user:', error);
    }
  }
  
  // Flush events
  async flushEvents() {
    try {
      if (this.segmentClient) {
        await this.segmentClient.flush();
      }
    } catch (error) {
      console.error('Error flushing events:', error);
    }
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// Initialize analytics with your Segment write key
export const initializeAnalytics = async () => {
  // Replace with your actual Segment write key
  const SEGMENT_WRITE_KEY = 'YOUR_SEGMENT_WRITE_KEY';
  
  await analytics.initialize(SEGMENT_WRITE_KEY);
};
