import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  Modal,
  Platform
} from 'react-native';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { CREATE_JOB_ALERT, DELETE_JOB_ALERT } from '../graphql/mutations/jobs';

// Mock query for job alerts - replace with actual query when available
const GET_JOB_ALERTS = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetJobAlerts' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'job_alerts' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'keywords' } },
                { kind: 'Field', name: { kind: 'Name', value: 'location' } },
                { kind: 'Field', name: { kind: 'Name', value: 'job_type' } },
                { kind: 'Field', name: { kind: 'Name', value: 'frequency' } },
                { kind: 'Field', name: { kind: 'Name', value: 'created_at' } }
              ]
            }
          }
        ]
      }
    }
  ]
};

export default function JobAlertsScreen() {
  const { isAuthenticated } = useAuth();
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [remoteOnly, setRemoteOnly] = useState(false);
  
  // Query job alerts
  const { loading, error, data, refetch } = useQuery(GET_JOB_ALERTS, {
    skip: !isAuthenticated
  });
  
  // Create job alert mutation
  const [createJobAlert, { loading: createLoading }] = useMutation(CREATE_JOB_ALERT);
  
  // Delete job alert mutation
  const [deleteJobAlert, { loading: deleteLoading }] = useMutation(DELETE_JOB_ALERT);
  
  // Handle create job alert
  const handleCreateAlert = async () => {
    if (!keywords.trim()) {
      Alert.alert('Error', 'Please enter at least one keyword');
      return;
    }
    
    try {
      const keywordsArray = keywords.split(',').map(k => k.trim()).filter(k => k);
      
      await createJobAlert({
        variables: {
          keywords: keywordsArray,
          location: location.trim() || null,
          jobType: jobType.trim() || null,
          frequency
        },
        update: (cache, { data: { insert_job_alerts_one } }) => {
          // Update cache to include the new job alert
          const existingData = cache.readQuery({ query: GET_JOB_ALERTS });
          
          if (existingData && existingData.job_alerts) {
            cache.writeQuery({
              query: GET_JOB_ALERTS,
              data: {
                job_alerts: [...existingData.job_alerts, insert_job_alerts_one]
              }
            });
          }
        }
      });
      
      // Reset form and close modal
      setKeywords('');
      setLocation('');
      setJobType('');
      setFrequency('daily');
      setRemoteOnly(false);
      setModalVisible(false);
      
      Alert.alert('Success', 'Job alert created successfully');
    } catch (e) {
      console.error('Error creating job alert', e);
      Alert.alert('Error', 'Failed to create job alert');
    }
  };
  
  // Handle delete job alert
  const handleDeleteAlert = async (id: string) => {
    Alert.alert(
      'Delete Job Alert',
      'Are you sure you want to delete this job alert?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteJobAlert({
                variables: { id },
                update: (cache) => {
                  // Update cache to remove the deleted job alert
                  const existingData = cache.readQuery({ query: GET_JOB_ALERTS });
                  
                  if (existingData && existingData.job_alerts) {
                    cache.writeQuery({
                      query: GET_JOB_ALERTS,
                      data: {
                        job_alerts: existingData.job_alerts.filter(
                          (alert: any) => alert.id !== id
                        )
                      }
                    });
                  }
                }
              });
            } catch (e) {
              console.error('Error deleting job alert', e);
              Alert.alert('Error', 'Failed to delete job alert');
            }
          }
        }
      ]
    );
  };
  
  // Mock data for job alerts
  const mockJobAlerts = [
    {
      id: '1',
      keywords: ['React Native', 'Mobile Developer'],
      location: 'Remote',
      job_type: 'Full-time',
      frequency: 'daily',
      created_at: '2025-05-01T12:00:00Z'
    },
    {
      id: '2',
      keywords: ['UI/UX Designer'],
      location: 'New York, NY',
      job_type: 'Contract',
      frequency: 'weekly',
      created_at: '2025-05-10T12:00:00Z'
    }
  ];
  
  // Use mock data if API isn't available yet
  const useMockData = error || !data;
  const jobAlerts = useMockData ? mockJobAlerts : data?.job_alerts || [];
  
  // Format frequency for display
  const formatFrequency = (freq: string) => {
    switch (freq) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'biweekly':
        return 'Bi-weekly';
      case 'monthly':
        return 'Monthly';
      default:
        return freq;
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center p-4">
        <Text className="text-xl font-bold mb-4">Sign in to create job alerts</Text>
        <Text className="text-gray-600 text-center mb-6">
          Create an account or sign in to set up notifications for new job postings.
        </Text>
        <Button 
          title="Sign In" 
          onPress={() => navigation.navigate('Login' as never)} 
          fullWidth={true}
        />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="p-4">
          <Text className="text-2xl font-bold text-gray-900">Job Alerts</Text>
          <Text className="text-gray-600 mt-1 mb-4">Get notified when new jobs match your criteria</Text>
          
          <Button
            title="Create New Alert"
            onPress={() => setModalVisible(true)}
            fullWidth={true}
          />
          
          <View className="mt-6">
            <Text className="text-lg font-semibold mb-3">Your Alerts</Text>
            
            {loading && !useMockData ? (
              <ActivityIndicator size="large" color="#0070f3" />
            ) : jobAlerts.length === 0 ? (
              <View className="bg-white p-6 rounded-lg border border-gray-200 items-center">
                <Text className="text-xl font-medium text-gray-800 mb-2">No alerts yet</Text>
                <Text className="text-center text-gray-500">
                  Create job alerts to get notified when new jobs match your criteria
                </Text>
              </View>
            ) : (
              jobAlerts.map((alert) => (
                <View 
                  key={alert.id} 
                  className="bg-white p-4 rounded-lg border border-gray-200 mb-4"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="font-medium text-base">
                        {Array.isArray(alert.keywords) 
                          ? alert.keywords.join(', ') 
                          : alert.keywords}
                      </Text>
                      
                      {alert.location && (
                        <Text className="text-gray-600 mt-1">
                          📍 {alert.location}
                        </Text>
                      )}
                      
                      {alert.job_type && (
                        <Text className="text-gray-600 mt-1">
                          💼 {alert.job_type}
                        </Text>
                      )}
                      
                      <Text className="text-gray-500 mt-2 text-sm">
                        Frequency: {formatFrequency(alert.frequency)}
                      </Text>
                      
                      <Text className="text-gray-500 text-sm">
                        Created: {formatDate(alert.created_at)}
                      </Text>
                    </View>
                    
                    <TouchableOpacity
                      onPress={() => handleDeleteAlert(alert.id)}
                      className="p-2"
                      hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    >
                      <Text className="text-red-500">Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
      
      {/* Create Alert Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-white">
          <SafeAreaView className="flex-1">
            <View className="p-4 border-b border-gray-200 flex-row justify-between items-center">
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text className="text-gray-500">Cancel</Text>
              </TouchableOpacity>
              <Text className="text-lg font-bold">Create Job Alert</Text>
              <View style={{ width: 50 }} />
            </View>
            
            <ScrollView className="flex-1 p-4">
              {/* Keywords */}
              <View className="mb-4">
                <Text className="text-gray-600 mb-2">Keywords (comma separated) *</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-3"
                  placeholder="e.g. React Native, TypeScript"
                  value={keywords}
                  onChangeText={setKeywords}
                />
              </View>
              
              {/* Location */}
              <View className="mb-4">
                <Text className="text-gray-600 mb-2">Location (optional)</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-3"
                  placeholder="e.g. New York, Remote"
                  value={location}
                  onChangeText={setLocation}
                />
                
                {/* Remote Option */}
                <View className="flex-row items-center justify-between mt-3">
                  <Text className="text-base">Remote only</Text>
                  <Switch
                    value={remoteOnly}
                    onValueChange={(value) => {
                      setRemoteOnly(value);
                      if (value) {
                        setLocation('Remote');
                      } else if (location === 'Remote') {
                        setLocation('');
                      }
                    }}
                    trackColor={{ false: '#d1d5db', true: '#0070f3' }}
                    thumbColor={Platform.OS === 'ios' ? '#ffffff' : remoteOnly ? '#ffffff' : '#f4f3f4'}
                  />
                </View>
              </View>
              
              {/* Job Type */}
              <View className="mb-4">
                <Text className="text-gray-600 mb-2">Job Type (optional)</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-3"
                  placeholder="e.g. Full-time, Contract"
                  value={jobType}
                  onChangeText={setJobType}
                />
              </View>
              
              {/* Frequency */}
              <View className="mb-6">
                <Text className="text-gray-600 mb-2">Alert Frequency</Text>
                <View className="flex-row flex-wrap">
                  {['daily', 'weekly', 'biweekly', 'monthly'].map((freq) => (
                    <TouchableOpacity
                      key={freq}
                      className={`mr-2 mb-2 px-3 py-2 rounded-full ${
                        frequency === freq 
                          ? 'bg-primary' 
                          : 'bg-gray-100'
                      }`}
                      onPress={() => setFrequency(freq)}
                    >
                      <Text 
                        className={frequency === freq 
                          ? 'text-white' 
                          : 'text-gray-800'
                        }
                      >
                        {formatFrequency(freq)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
            
            <View className="p-4 border-t border-gray-200">
              <Button
                title="Create Alert"
                onPress={handleCreateAlert}
                loading={createLoading}
                disabled={!keywords.trim() || createLoading}
                fullWidth={true}
              />
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
