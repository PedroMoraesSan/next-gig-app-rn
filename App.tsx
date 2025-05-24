import React, { useState, useEffect } from 'react';
import { ApolloProvider } from '@apollo/client';
import { ActivityIndicator, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';
import Navigation from './src/navigation';
import initApolloClient from './src/services/apollo';
import { AuthProvider } from './src/context/AuthContext';
import { initializeAnalytics } from './src/services/analytics';
import { pushNotificationService } from './src/services/pushNotificationService';
import { initSentry } from './src/services/errorTracking';
import OfflineNotice from './src/components/OfflineNotice';

// Initialize Sentry
initSentry();

// Create error boundary component
const AppWithErrorBoundary = Sentry.withErrorBoundary(
  function App(): React.JSX.Element {
    const [client, setClient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const initApp = async () => {
        try {
          // Initialize Apollo Client
          const apolloClient = await initApolloClient();
          setClient(apolloClient);
          
          // Initialize Analytics
          await initializeAnalytics();
          
          // Initialize Push Notifications
          await pushNotificationService.initialize();
        } catch (e) {
          console.error('Failed to initialize application', e);
          setError('Failed to initialize application. Please restart.');
          
          // Log error to Sentry
          Sentry.captureException(e);
        } finally {
          setLoading(false);
        }
      };

      initApp();
    }, []);

    if (loading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
          <ActivityIndicator size="large" color="#0070f3" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f9fafb' }}>
          <Text style={{ color: 'red', textAlign: 'center', marginBottom: 20 }}>{error}</Text>
        </View>
      );
    }

    return (
      <SafeAreaProvider>
        <ApolloProvider client={client}>
          <AuthProvider>
            <OfflineNotice />
            <Navigation />
          </AuthProvider>
        </ApolloProvider>
      </SafeAreaProvider>
    );
  },
  {
    fallback: (props) => (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          Something went wrong
        </Text>
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>
          The application encountered an unexpected error.
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#0070f3',
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 5
          }}
          onPress={() => props.resetError()}
        >
          <Text style={{ color: 'white' }}>Try Again</Text>
        </TouchableOpacity>
      </View>
    )
  }
);

export default AppWithErrorBoundary;
