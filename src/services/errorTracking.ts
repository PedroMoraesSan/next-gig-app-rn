import * as Sentry from '@sentry/react-native';
import { Platform, View, Text, TouchableOpacity } from 'react-native';

// Initialize Sentry
export const initSentry = () => {
  Sentry.init({
    dsn: 'YOUR_SENTRY_DSN', // Replace with your actual Sentry DSN
    debug: __DEV__, // Enable debug in development
    environment: __DEV__ ? 'development' : 'production',
    tracesSampleRate: 1.0, // Capture 100% of transactions
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30000, // 30 seconds
    attachStacktrace: true,
    // Add any other configuration options here
  });
  
  // Set default tags
  Sentry.setTag('platform', Platform.OS);
  Sentry.setTag('platform_version', Platform.Version.toString());
  
  console.log('Sentry initialized');
};

// Set user context
export const setUserContext = (userId: string, email?: string, username?: string) => {
  Sentry.setUser({
    id: userId,
    email,
    username
  });
};

// Clear user context
export const clearUserContext = () => {
  Sentry.setUser(null);
};

// Capture exception
export const captureException = (error: any, context?: Record<string, any>) => {
  Sentry.captureException(error, {
    extra: context
  });
};

// Capture message
export const captureMessage = (message: string, level?: Sentry.Severity, context?: Record<string, any>) => {
  Sentry.captureMessage(message, {
    level,
    extra: context
  });
};

// Start transaction
export const startTransaction = (name: string, op: string) => {
  return Sentry.startTransaction({
    name,
    op
  });
};

// Add breadcrumb
export const addBreadcrumb = (
  category: string,
  message: string,
  level: Sentry.Severity = Sentry.Severity.Info,
  data?: Record<string, any>
) => {
  Sentry.addBreadcrumb({
    category,
    message,
    level,
    data
  });
};

// Set tag
export const setTag = (key: string, value: string) => {
  Sentry.setTag(key, value);
};

// Set context
export const setContext = (name: string, context: Record<string, any>) => {
  Sentry.setContext(name, context);
};

// Error boundary component
export const ErrorBoundary = Sentry.ErrorBoundary;

// Wrap component with error boundary
export const withErrorBoundary = Sentry.withErrorBoundary;

// Create error boundary props
export const makeErrorBoundaryProps = (componentName: string) => ({
  fallback: ({ error, resetError }) => {
    // You can create a custom fallback UI here
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          Something went wrong
        </Text>
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>
          {error.message || 'An unexpected error occurred'}
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#0070f3',
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 5
          }}
          onPress={resetError}
        >
          <Text style={{ color: 'white' }}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  },
  onError: (error, componentStack) => {
    captureException(error, {
      componentName,
      componentStack
    });
  }
});
