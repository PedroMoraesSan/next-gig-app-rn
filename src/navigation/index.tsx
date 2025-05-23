import React, { useRef } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { pushNotificationService } from '../services/pushNotificationService';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import SavedScreen from '../screens/SavedScreen';
import ProfileScreen from '../screens/ProfileScreen';
import JobDetailScreen from '../screens/JobDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SplashScreen from '../screens/SplashScreen';
import ApplyScreen from '../screens/ApplyScreen';
import ResumeBuilderScreen from '../screens/ResumeBuilderScreen';
import JobAlertsScreen from '../screens/JobAlertsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Define navigation types
export type RootStackParamList = {
  Main: undefined;
  JobDetail: { jobId: string };
  Login: undefined;
  Register: undefined;
  Apply: { jobId: string };
  Application: { applicationId: string };
  ResumeBuilder: undefined;
  JobAlerts: undefined;
  Notifications: undefined;
  Settings: undefined;
};

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Saved: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Notification button component
function NotificationButton() {
  const navigation = useNavigation();
  const { getUnreadCount } = useNotifications();
  const unreadCount = getUnreadCount();
  
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Notifications' as never)}
      className="relative p-2"
    >
      <Text className="text-2xl">🔔</Text>
      {unreadCount > 0 && (
        <View className="absolute top-0 right-0 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
          <Text className="text-white text-xs font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// Settings button component
function SettingsButton() {
  const navigation = useNavigation();
  
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Settings' as never)}
      className="p-2"
    >
      <Text className="text-2xl">⚙️</Text>
    </TouchableOpacity>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ navigation }) => ({
        tabBarActiveTintColor: '#0070f3',
        tabBarInactiveTintColor: '#6c757d',
        headerRight: () => (
          <View className="flex-row mr-4">
            <NotificationButton />
            <SettingsButton />
          </View>
        )
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>🏠</Text>
          )
        }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen} 
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>🔍</Text>
          )
        }}
      />
      <Tab.Screen 
        name="Saved" 
        component={SavedScreen} 
        options={{
          tabBarLabel: 'Saved',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>♡</Text>
          )
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>👤</Text>
          )
        }}
      />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  // Set navigation reference for push notifications
  React.useEffect(() => {
    if (navigationRef.current) {
      pushNotificationService.setNavigationRef(navigationRef.current);
    }
  }, [navigationRef.current]);

  if (isLoading) {
    // If we haven't finished checking for the token yet
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0070f3" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator>
        {isAuthenticated ? (
          // User is signed in
          <>
            <Stack.Screen 
              name="Main" 
              component={MainTabs} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="JobDetail" 
              component={JobDetailScreen} 
              options={{ title: 'Job Details' }} 
            />
            <Stack.Screen 
              name="Apply" 
              component={ApplyScreen} 
              options={{ title: 'Apply for Job' }} 
            />
            <Stack.Screen 
              name="ResumeBuilder" 
              component={ResumeBuilderScreen} 
              options={{ title: 'Resume Builder' }} 
            />
            <Stack.Screen 
              name="JobAlerts" 
              component={JobAlertsScreen} 
              options={{ title: 'Job Alerts' }} 
            />
            <Stack.Screen 
              name="Notifications" 
              component={NotificationsScreen} 
              options={{ title: 'Notifications' }} 
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen} 
              options={{ title: 'Settings' }} 
            />
          </>
        ) : (
          // User is not signed in
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen} 
              options={{ title: 'Create Account' }} 
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
