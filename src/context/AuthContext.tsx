import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { gql, useMutation, useApolloClient } from '@apollo/client';
import jwtDecode from 'jwt-decode';
import { biometricService } from '../services/biometricService';
import { pushNotificationService } from '../services/pushNotificationService';
import { analytics, EventType } from '../services/analytics';

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextType = {
  isLoading: boolean;
  user: User | null;
  signIn: (email: string, password: string, token?: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  setupBiometrics: () => Promise<boolean>;
  disableBiometrics: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// GraphQL mutations for authentication
const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

const SIGNUP_MUTATION = gql`
  mutation SignUp($email: String!, $password: String!, $name: String!) {
    signup(email: $email, password: $password, name: $name) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const client = useApolloClient();
  
  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [signupMutation] = useMutation(SIGNUP_MUTATION);

  useEffect(() => {
    // Check if user is already logged in
    const bootstrapAsync = async () => {
      try {
        // For development, we'll use AsyncStorage, but in production use SecureStore
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          // Decode token to get user info
          const decodedToken = jwtDecode<{
            'https://hasura.io/jwt/claims': {
              'x-hasura-user-id': string;
            };
            name: string;
            email: string;
          }>(token);
          
          const userData = {
            id: decodedToken['https://hasura.io/jwt/claims']['x-hasura-user-id'],
            name: decodedToken.name,
            email: decodedToken.email
          };
          
          setUser(userData);
          
          // Register device for push notifications
          await pushNotificationService.registerDeviceWithBackend(userData.id);
          
          // Track user for analytics
          analytics.identifyUser(userData.id, {
            name: userData.name,
            email: userData.email
          });
        }
      } catch (e) {
        console.error('Failed to get token', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const authContext = {
    isLoading,
    user,
    isAuthenticated: !!user,
    signIn: async (email: string, password: string, token?: string) => {
      try {
        let authToken = token;
        let userData = null;
        
        // If token is not provided, perform standard login
        if (!authToken) {
          const { data } = await loginMutation({ 
            variables: { email, password } 
          });
          
          authToken = data.login.token;
          userData = data.login.user;
        } else {
          // If token is provided (from biometric auth), decode it to get user data
          const decodedToken = jwtDecode<{
            'https://hasura.io/jwt/claims': {
              'x-hasura-user-id': string;
            };
            name: string;
            email: string;
          }>(token);
          
          userData = {
            id: decodedToken['https://hasura.io/jwt/claims']['x-hasura-user-id'],
            name: decodedToken.name,
            email: decodedToken.email
          };
        }
        
        // Store token
        await AsyncStorage.setItem('userToken', authToken);
        
        // Set user
        setUser(userData);
        
        // Register device for push notifications
        await pushNotificationService.registerDeviceWithBackend(userData.id);
        
        // Track login event
        analytics.trackEvent(EventType.LOGIN, {
          method: token ? 'biometric' : 'email'
        });
        
        // Identify user for analytics
        analytics.identifyUser(userData.id, {
          name: userData.name,
          email: userData.email
        });
      } catch (e) {
        console.error('Login error', e);
        throw e;
      }
    },
    signUp: async (email: string, password: string, name: string) => {
      try {
        const { data } = await signupMutation({ 
          variables: { email, password, name } 
        });
        
        const token = data.signup.token;
        await AsyncStorage.setItem('userToken', token);
        
        const userData = data.signup.user;
        setUser(userData);
        
        // Register device for push notifications
        await pushNotificationService.registerDeviceWithBackend(userData.id);
        
        // Track signup event
        analytics.trackEvent(EventType.SIGNUP);
        
        // Identify user for analytics
        analytics.identifyUser(userData.id, {
          name: userData.name,
          email: userData.email
        });
      } catch (e) {
        console.error('Signup error', e);
        throw e;
      }
    },
    signOut: async () => {
      try {
        // Track logout event before clearing user
        if (user) {
          analytics.trackEvent(EventType.LOGOUT);
          
          // Unregister device from push notifications
          await pushNotificationService.unregisterDeviceWithBackend();
        }
        
        // Reset analytics user
        analytics.resetUser();
        
        // Clear token and user
        await AsyncStorage.removeItem('userToken');
        setUser(null);
        
        // Clear Apollo cache on logout
        await client.resetStore();
      } catch (e) {
        console.error('Logout error', e);
      }
    },
    setupBiometrics: async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        return await biometricService.showBiometricSetupPrompt(token);
      } catch (e) {
        console.error('Biometric setup error', e);
        return false;
      }
    },
    disableBiometrics: async () => {
      try {
        return await biometricService.disableBiometrics();
      } catch (e) {
        console.error('Biometric disable error', e);
        return false;
      }
    }
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
