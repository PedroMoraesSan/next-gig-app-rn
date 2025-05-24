import AsyncStorage from '@react-native-async-storage/async-storage';
import { networkService } from './networkService';

// Event types
export enum AnalyticsEventType {
  VIEW_SCREEN = 'view_screen',
  CLICK = 'click',
  SEARCH = 'search',
  APPLY = 'apply',
  SAVE_JOB = 'save_job',
  CREATE_ALERT = 'create_alert',
  ERROR = 'error',
  SYNC = 'sync',
  OFFLINE_OPERATION = 'offline_operation',
}

// Analytics event interface
export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  name: string;
  timestamp: number;
  properties: Record<string, any>;
  sessionId: string;
}

/**
 * Offline analytics service
 * Tracks events when offline and syncs when online
 */
class OfflineAnalyticsService {
  private static instance: OfflineAnalyticsService;
  private events: AnalyticsEvent[] = [];
  private storageKey = 'offline_analytics_events';
  private sessionId: string;
  private isInitialized = false;
  private syncInProgress = false;
  private maxBatchSize = 50;
  private syncEndpoint = 'https://api.example.com/analytics'; // Replace with actual endpoint

  private constructor() {
    this.sessionId = `session_${Date.now()}`;
  }

  static getInstance(): OfflineAnalyticsService {
    if (!OfflineAnalyticsService.instance) {
      OfflineAnalyticsService.instance = new OfflineAnalyticsService();
    }
    return OfflineAnalyticsService.instance;
  }

  /**
   * Initialize the analytics service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load cached events
      await this.loadEvents();

      // Set up network listener
      networkService.addConnectivityListener(this.handleConnectivityChange);
      networkService.startMonitoring();

      // Try to sync if online
      if (networkService.isNetworkConnected()) {
        this.syncEvents();
      }

      this.isInitialized = true;
      console.log('Offline analytics service initialized');
    } catch (error) {
      console.error('Error initializing offline analytics:', error);
    }
  }

  /**
   * Track an event
   */
  async trackEvent(
    type: AnalyticsEventType,
    name: string,
    properties: Record<string, any> = {}
  ): Promise<void> {
    try {
      const event: AnalyticsEvent = {
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type,
        name,
        timestamp: Date.now(),
        properties,
        sessionId: this.sessionId,
      };

      // Add to events array
      this.events.push(event);

      // Save to storage
      await this.saveEvents();

      // Try to sync if online
      if (networkService.isNetworkConnected() && !this.syncInProgress) {
        this.syncEvents();
      }
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  /**
   * Track offline operation
   */
  async trackOfflineOperation(
    operationType: string,
    entityType: string,
    properties: Record<string, any> = {}
  ): Promise<void> {
    await this.trackEvent(AnalyticsEventType.OFFLINE_OPERATION, operationType, {
      entityType,
      ...properties,
      isOffline: true,
    });
  }

  /**
   * Track sync event
   */
  async trackSync(
    success: boolean,
    itemsProcessed: number,
    duration: number
  ): Promise<void> {
    await this.trackEvent(AnalyticsEventType.SYNC, 'sync_completed', {
      success,
      itemsProcessed,
      duration,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle connectivity changes
   */
  private handleConnectivityChange = (isConnected: boolean): void => {
    if (isConnected && this.events.length > 0 && !this.syncInProgress) {
      this.syncEvents();
    }
  };

  /**
   * Load events from storage
   */
  private async loadEvents(): Promise<void> {
    try {
      const eventsData = await AsyncStorage.getItem(this.storageKey);
      if (eventsData) {
        this.events = JSON.parse(eventsData);
        console.log(`Loaded ${this.events.length} analytics events from storage`);
      }
    } catch (error) {
      console.error('Error loading analytics events:', error);
    }
  }

  /**
   * Save events to storage
   */
  private async saveEvents(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(this.events));
    } catch (error) {
      console.error('Error saving analytics events:', error);
    }
  }

  /**
   * Sync events with server
   */
  private async syncEvents(): Promise<void> {
    if (this.syncInProgress || this.events.length === 0) return;

    this.syncInProgress = true;
    const syncStartTime = Date.now();

    try {
      // Process events in batches
      let processedCount = 0;
      while (this.events.length > 0) {
        // Get batch of events
        const batch = this.events.slice(0, this.maxBatchSize);
        
        // Send batch to server
        const success = await this.sendEventsToServer(batch);
        
        if (success) {
          // Remove sent events from queue
          this.events = this.events.slice(batch.length);
          processedCount += batch.length;
          
          // Save updated events
          await this.saveEvents();
        } else {
          // Stop if send failed
          break;
        }
      }

      // Track sync completion
      const syncDuration = Date.now() - syncStartTime;
      await this.trackSync(processedCount > 0, processedCount, syncDuration);
      
      console.log(`Synced ${processedCount} analytics events`);
    } catch (error) {
      console.error('Error syncing analytics events:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Send events to server
   */
  private async sendEventsToServer(events: AnalyticsEvent[]): Promise<boolean> {
    try {
      // In a real app, this would send events to your analytics service
      // For now, we'll simulate a successful send
      console.log(`Sending ${events.length} events to analytics server`);
      
      // Simulate API call
      // const response = await fetch(this.syncEndpoint, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ events }),
      // });
      // return response.ok;
      
      // Simulate successful send
      return true;
    } catch (error) {
      console.error('Error sending events to server:', error);
      return false;
    }
  }

  /**
   * Get pending events count
   */
  getPendingEventsCount(): number {
    return this.events.length;
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    networkService.removeConnectivityListener(this.handleConnectivityChange);
  }
}

export const offlineAnalytics = OfflineAnalyticsService.getInstance();
