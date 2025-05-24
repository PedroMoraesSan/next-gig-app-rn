import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { ApolloProvider } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'react-native';
import initApolloClient from './services/apollo';
import { AuthProvider } from './context/AuthContext';
import { SyncProvider } from './context/SyncContext';
import AppNavigator from './navigation';
import SplashScreen from './screens/SplashScreen';
import OfflineNotice from './components/SyncIndicator';
import { networkService } from './services/networkService';
import { offlineAnalytics } from './services/offlineAnalytics';
import { firebaseService } from './services/firebase';
import { notificationService } from './services/notificationService';
import { errorTracking } from './services/errorTracking';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState<any>(null);

  // Initialize app services
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize Apollo Client
        const apolloClient = await initApolloClient();
        setClient(apolloClient);

        // Initialize network service
        networkService.startMonitoring();

        // Initialize offline analytics
        await offlineAnalytics.initialize();
        
        // Initialize error tracking
        errorTracking.initialize('YOUR_SENTRY_DSN'); // Replace with actual DSN in production

        // Initialize Firebase and notifications (if available)
        try {
          await firebaseService.initialize();
          await notificationService.initialize();
        } catch (error) {
          console.log('Notification services not available:', error);
          errorTracking.logError(error, {
            context: 'App',
            action: 'initializeNotifications'
          });
        }

        // Simulate loading time (remove in production)
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error initializing app:', error);
        errorTracking.logError(error, {
          context: 'App',
          action: 'initializeApp'
        });
        setIsLoading(false);
      }
    };

    initializeApp();

    // Clean up on unmount
    return () => {
      networkService.stopMonitoring();
      offlineAnalytics.cleanup();
      errorTracking.cleanup();
    };
  }, []);

  // Show splash screen while loading
  if (isLoading || !client) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <ApolloProvider client={client}>
        <AuthProvider>
          <SyncProvider>
            <NavigationContainer>
              <AppNavigator />
              <OfflineNotice />
            </NavigationContainer>
          </SyncProvider>
        </AuthProvider>
      </ApolloProvider>
    </SafeAreaProvider>
  );
};

export default App;
