import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Switch, 
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_JOB_ALERT, DELETE_JOB_ALERT } from '../graphql/mutations/jobs';
import { GET_USER_JOB_ALERTS } from '../graphql/queries/user';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useMutationWithOfflineSupport } from '../hooks/useMutationWithOfflineSupport';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { errorTracking } from '../services/errorTracking';
import { validateData } from '../utils/dataValidation';
import { useAnalytics } from '../hooks/useAnalytics';

export default function JobAlertsScreen() {
  const { isAuthenticated } = useAuth();
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [isEnabled, setIsEnabled] = useState(true);
  
  // Network status
  const { isOnline } = useNetworkStatus();
  
  // Analytics
  const analytics = useAnalytics('JobAlerts');
  
  // Get user job alerts
  const { loading, data, refetch } = useQuery(GET_USER_JOB_ALERTS, {
    skip: !isAuthenticated
  });
  
  // Create job alert mutation with offline support
  const [createJobAlert, { loading: createLoading }] = useMutationWithOfflineSupport(
    CREATE_JOB_ALERT,
    { entityType: 'jobAlert' }
  );
  
  // Delete job alert mutation with offline support
  const [deleteJobAlert, { loading: deleteLoading }] = useMutationWithOfflineSupport(
    DELETE_JOB_ALERT,
    { entityType: 'jobAlert' }
  );
  
  // Handle create alert
  const handleCreateAlert = async () => {
    // Validate inputs
    const validationRules = {
      required: ['keywords'],
      minLength: {
        keywords: 2
      }
    };
    
    const validationResult = validateData(
      { keywords, location, jobType, frequency },
      validationRules
    );
    
    if (!validationResult.isValid) {
      Alert.alert('Validation Error', Object.values(validationResult.errors)[0]);
      return;
    }
    
    try {
      const keywordsArray = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
      
      await createJobAlert({
        variables: {
          keywords: keywordsArray,
          location: location.trim() || null,
          jobType: jobType.trim() || null,
          frequency
        }
      });
      
      // Clear form
      setKeywords('');
      setLocation('');
      setJobType('');
      
      // Refetch alerts if online
      if (isOnline) {
        refetch();
      }
      
      // Track job alert creation
      analytics.trackEvent('create_job_alert', {
        keywordsCount: keywordsArray.length,
        frequency,
        hasLocation: !!location.trim(),
        hasJobType: !!jobType.trim()
      });
      
      Alert.alert('Success', 'Job alert created successfully');
    } catch (error) {
      // Don't show error if it's just queued for offline
      if (!error.message?.includes('Mutation queued for offline execution')) {
        console.error('Error creating job alert:', error);
        errorTracking.logError(error, {
          context: 'JobAlertsScreen',
          action: 'handleCreateAlert'
        });
        Alert.alert('Error', 'Failed to create job alert');
      } else {
        Alert.alert('Success', 'Job alert will be created when you are back online');
      }
    }
  };
  
  // Handle delete alert
  const handleDeleteAlert = async (id: string) => {
    try {
      await deleteJobAlert({
        variables: { id }
      });
      
      // Refetch alerts if online
      if (isOnline) {
        refetch();
      }
      
      // Track delete event
      analytics.trackEvent('delete_job_alert', { alertId: id });
    } catch (error) {
      // Don't show error if it's just queued for offline
      if (!error.message?.includes('Mutation queued for offline execution')) {
        console.error('Error deleting job alert:', error);
        errorTracking.logError(error, {
          context: 'JobAlertsScreen',
          action: 'handleDeleteAlert',
          alertId: id
        });
        Alert.alert('Error', 'Failed to delete job alert');
      }
    }
  };
  
  // Confirm delete
  const confirmDelete = (id: string) => {
    Alert.alert(
      'Delete Alert',
      'Are you sure you want to delete this job alert?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => handleDeleteAlert(id), style: 'destructive' }
      ]
    );
  };
  
  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center p-4">
        <Text className="text-xl font-bold text-center mb-4">Sign In Required</Text>
        <Text className="text-gray-600 text-center mb-6">
          Please sign in to create and manage job alerts.
        </Text>
        <Button 
          title="Sign In" 
          onPress={() => {}} 
          fullWidth={true}
        />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold mb-6">Job Alerts</Text>
        
        <View className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <Text className="text-lg font-semibold mb-4">Create New Alert</Text>
          
          <Text className="text-sm font-medium mb-1">Keywords</Text>
          <TextInput
            className="border border-gray-300 rounded p-2 mb-3"
            placeholder="e.g. React, Developer, Remote"
            value={keywords}
            onChangeText={setKeywords}
          />
          
          <Text className="text-sm font-medium mb-1">Location (optional)</Text>
          <TextInput
            className="border border-gray-300 rounded p-2 mb-3"
            placeholder="e.g. San Francisco, Remote"
            value={location}
            onChangeText={setLocation}
          />
          
          <Text className="text-sm font-medium mb-1">Job Type (optional)</Text>
          <TextInput
            className="border border-gray-300 rounded p-2 mb-3"
            placeholder="e.g. Full-time, Contract"
            value={jobType}
            onChangeText={setJobType}
          />
          
          <Text className="text-sm font-medium mb-1">Frequency</Text>
          <View className="flex-row mb-3">
            {['daily', 'weekly', 'instant'].map((option) => (
              <TouchableOpacity
                key={option}
                className={`mr-2 px-3 py-1 rounded ${frequency === option ? 'bg-blue-500' : 'bg-gray-200'}`}
                onPress={() => setFrequency(option)}
              >
                <Text className={frequency === option ? 'text-white' : 'text-gray-700'}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-sm font-medium">Enable notifications</Text>
            <Switch
              value={isEnabled}
              onValueChange={setIsEnabled}
            />
          </View>
          
          <Button
            title={createLoading ? 'Creating...' : 'Create Alert'}
            onPress={handleCreateAlert}
            disabled={createLoading || !keywords.trim()}
            fullWidth={true}
          />
        </View>
        
        <Text className="text-lg font-semibold mb-2">Your Alerts</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#0070f3" />
        ) : data?.job_alerts?.length > 0 ? (
          data.job_alerts.map((alert: any) => (
            <View key={alert.id} className="bg-white p-4 rounded-lg border border-gray-200 mb-3">
              <View className="flex-row justify-between">
                <Text className="font-medium">{alert.keywords.join(', ')}</Text>
                <TouchableOpacity 
                  onPress={() => confirmDelete(alert.id)}
                  disabled={deleteLoading}
                >
                  <Text className="text-red-500">Delete</Text>
                </TouchableOpacity>
              </View>
              {alert.location && (
                <Text className="text-gray-600">Location: {alert.location}</Text>
              )}
              {alert.job_type && (
                <Text className="text-gray-600">Type: {alert.job_type}</Text>
              )}
              <Text className="text-gray-600">
                Frequency: {alert.frequency.charAt(0).toUpperCase() + alert.frequency.slice(1)}
              </Text>
            </View>
          ))
        ) : (
          <View className="bg-white p-4 rounded-lg border border-gray-200">
            <Text className="text-center text-gray-500">No job alerts yet</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
