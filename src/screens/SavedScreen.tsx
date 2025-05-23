import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  SafeAreaView, 
  ActivityIndicator, 
  TouchableOpacity, 
  Alert,
  RefreshControl
} from 'react-native';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import JobCard from '../components/JobCard';
import Button from '../components/Button';
import { GET_USER_SAVED_JOBS } from '../graphql/queries/user';
import { UNSAVE_JOB } from '../graphql/mutations/jobs';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation';

type SavedScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SavedScreen() {
  const { isAuthenticated } = useAuth();
  const navigation = useNavigation<SavedScreenNavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  
  const { loading, error, data, refetch } = useQuery(GET_USER_SAVED_JOBS, {
    skip: !isAuthenticated,
    fetchPolicy: 'cache-and-network'
  });
  
  const [unsaveJob, { loading: unsaveLoading }] = useMutation(UNSAVE_JOB);
  
  const handleUnsave = async (jobId: string) => {
    try {
      Alert.alert(
        'Remove Saved Job',
        'Are you sure you want to remove this job from your saved list?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Remove',
            onPress: async () => {
              await unsaveJob({
                variables: { jobId },
                update: (cache) => {
                  // Update cache to remove the unsaved job
                  const existingData = cache.readQuery({
                    query: GET_USER_SAVED_JOBS
                  });
                  
                  if (existingData && existingData.saved_jobs) {
                    cache.writeQuery({
                      query: GET_USER_SAVED_JOBS,
                      data: {
                        saved_jobs: existingData.saved_jobs.filter(
                          (job: any) => job.job.id !== jobId
                        )
                      }
                    });
                  }
                }
              });
            }
          }
        ]
      );
    } catch (e) {
      console.error('Error removing saved job', e);
      Alert.alert('Error', 'Failed to remove job from saved list');
    }
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (e) {
      console.error('Error refreshing saved jobs', e);
    } finally {
      setRefreshing(false);
    }
  };
  
  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center p-4">
        <Text className="text-xl font-bold mb-4">Sign in to save jobs</Text>
        <Text className="text-gray-600 text-center mb-6">
          Create an account or sign in to save jobs you're interested in.
        </Text>
        <Button 
          title="Sign In" 
          onPress={() => navigation.navigate('Login')} 
          fullWidth={true}
        />
      </SafeAreaView>
    );
  }
  
  // Use mock data if API isn't available yet
  const useMockData = error;
  const { mockJobs } = require('../constants/mockData');
  
  // Format saved jobs data
  const formatSavedJobs = () => {
    if (useMockData) {
      // Return mock data for saved jobs
      return mockJobs.slice(0, 3).map(job => ({
        id: `saved-${job.id}`,
        created_at: new Date().toISOString(),
        job: {
          id: job.id,
          title: job.title,
          company: job.company,
          companyLogo: job.companyLogo,
          location: job.location,
          type: job.type,
          tags: job.tags,
          salary: job.salary,
          postedDate: job.postedDate
        }
      }));
    }
    
    return data?.saved_jobs || [];
  };
  
  const savedJobs = formatSavedJobs();
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4 flex-1">
        <Text className="text-2xl font-bold text-gray-900">Saved Jobs</Text>
        <Text className="text-gray-600 mt-1 mb-4">Jobs you've bookmarked for later</Text>
        
        {loading && !refreshing ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#0070f3" />
          </View>
        ) : savedJobs.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <View className="bg-white p-6 rounded-lg border border-gray-200 items-center w-full">
              <Text className="text-xl font-medium text-gray-800 mb-2">No saved jobs yet</Text>
              <Text className="text-center text-gray-500 mb-6">
                When you find jobs you're interested in, save them here for easy access
              </Text>
              <Button 
                title="Browse Jobs" 
                onPress={() => navigation.navigate('Main')}
                variant="outline"
              />
            </View>
          </View>
        ) : (
          <FlatList
            data={savedJobs}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <JobCard 
                job={{
                  id: item.job.id,
                  title: item.job.title,
                  company: item.job.company,
                  companyLogo: item.job.companyLogo || item.job.company_logo,
                  location: item.job.location,
                  type: item.job.type || item.job.job_type,
                  tags: item.job.tags || [],
                  salary: item.job.salary
                }}
                onSave={() => handleUnsave(item.job.id)}
                saved={true}
              />
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListFooterComponent={
              unsaveLoading ? (
                <ActivityIndicator size="small" color="#0070f3" style={{ marginVertical: 20 }} />
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
