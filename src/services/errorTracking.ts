import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { networkService } from './networkService';

/**
 * Error tracking service using Sentry
 */
class ErrorTrackingService {
  private static instance: ErrorTrackingService;
  private isInitialized: boolean = false;
  private offlineErrors: any[] = [];
  private storageKey: string = 'offline_errors';
  private userId: string | null = null;

  private constructor() {}

  static getInstance(): ErrorTrackingService {
    if (!ErrorTrackingService.instance) {
      ErrorTrackingService.instance = new ErrorTrackingService();
    }
    return ErrorTrackingService.instance;
  }

  /**
   * Initialize Sentry
   */
  initialize(dsn: string): void {
    if (this.isInitialized) return;

    try {
      Sentry.init({
        dsn,
        environment: __DEV__ ? 'development' : 'production',
        debug: __DEV__,
        enableAutoSessionTracking: true,
        sessionTrackingIntervalMillis: 30000,
        attachStacktrace: true,
        maxBreadcrumbs: 50,
      });

      // Set up network listener for offline errors
      networkService.addConnectivityListener(this.handleConnectivityChange);
      networkService.startMonitoring();

      // Load offline errors
      this.loadOfflineErrors();

      this.isInitialized = true;
      console.log('Error tracking initialized');
    } catch (error) {
      console.error('Error initializing Sentry:', error);
    }
  }

  /**
   * Set user context
   */
  setUser(id: string, email?: string, username?: string): void {
    try {
      this.userId = id;
      Sentry.setUser({
        id,
        email,
        username,
      });
    } catch (error) {
      console.error('Error setting Sentry user:', error);
    }
  }

  /**
   * Clear user context
   */
  clearUser(): void {
    try {
      this.userId = null;
      Sentry.setUser(null);
    } catch (error) {
      console.error('Error clearing Sentry user:', error);
    }
  }

  /**
   * Log error to Sentry
   */
  logError(error: Error, context?: any): void {
    try {
      if (!this.isInitialized) {
        console.error('Error tracking not initialized');
        return;
      }

      // Add extra context
      if (context) {
        Sentry.setContext('error_context', context);
      }

      // Add user ID if available
      if (this.userId) {
        Sentry.setTag('user_id', this.userId);
      }

      // Add device info
      Sentry.setTag('platform', Platform.OS);
      Sentry.setTag('os_version', Platform.Version.toString());

      // Check if online
      if (networkService.isNetworkConnected()) {
        // Send error to Sentry
        Sentry.captureException(error);
      } else {
        // Store error for later
        this.storeOfflineError(error, context);
      }
    } catch (e) {
      console.error('Error logging to Sentry:', e);
    }
  }

  /**
   * Log message to Sentry
   */
  logMessage(message: string, level: Sentry.Severity = Sentry.Severity.Info): void {
    try {
      if (!this.isInitialized) {
        console.error('Error tracking not initialized');
        return;
      }

      // Check if online
      if (networkService.isNetworkConnected()) {
        // Send message to Sentry
        Sentry.captureMessage(message, level);
      } else {
        // Store message for later
        this.storeOfflineError(new Error(message), { level });
      }
    } catch (e) {
      console.error('Error logging message to Sentry:', e);
    }
  }

  /**
   * Add breadcrumb
   */
  addBreadcrumb(
    category: string,
    message: string,
    level: Sentry.Severity = Sentry.Severity.Info,
    data?: any
  ): void {
    try {
      if (!this.isInitialized) return;

      Sentry.addBreadcrumb({
        category,
        message,
        level,
        data,
      });
    } catch (e) {
      console.error('Error adding breadcrumb:', e);
    }
  }

  /**
   * Store error for offline use
   */
  private storeOfflineError(error: Error, context?: any): void {
    try {
      const offlineError = {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
      };

      this.offlineErrors.push(offlineError);
      this.saveOfflineErrors();
    } catch (e) {
      console.error('Error storing offline error:', e);
    }
  }

  /**
   * Save offline errors to storage
   */
  private async saveOfflineErrors(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(this.offlineErrors));
    } catch (e) {
      console.error('Error saving offline errors:', e);
    }
  }

  /**
   * Load offline errors from storage
   */
  private async loadOfflineErrors(): Promise<void> {
    try {
      const errors = await AsyncStorage.getItem(this.storageKey);
      if (errors) {
        this.offlineErrors = JSON.parse(errors);
      }
    } catch (e) {
      console.error('Error loading offline errors:', e);
    }
  }

  /**
   * Send offline errors to Sentry
   */
  private async sendOfflineErrors(): Promise<void> {
    try {
      if (this.offlineErrors.length === 0) return;

      for (const offlineError of this.offlineErrors) {
        // Add context if available
        if (offlineError.context) {
          Sentry.setContext('error_context', offlineError.context);
        }

        // Create error object
        const error = new Error(offlineError.message);
        error.stack = offlineError.stack;

        // Send to Sentry
        Sentry.captureException(error);
      }

      // Clear offline errors
      this.offlineErrors = [];
      await this.saveOfflineErrors();
    } catch (e) {
      console.error('Error sending offline errors:', e);
    }
  }

  /**
   * Handle connectivity changes
   */
  private handleConnectivityChange = (isConnected: boolean): void => {
    if (isConnected && this.offlineErrors.length > 0) {
      this.sendOfflineErrors();
    }
  };

  /**
   * Clean up resources
   */
  cleanup(): void {
    networkService.removeConnectivityListener(this.handleConnectivityChange);
  }
}

export const errorTracking = ErrorTrackingService.getInstance();
