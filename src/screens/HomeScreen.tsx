import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  SafeAreaView, 
  ActivityIndicator, 
  RefreshControl,
  TouchableOpacity,
  Alert,
  Image
} from 'react-native';
import { useQuery } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';
import JobCard from '../components/JobCard';
import Button from '../components/Button';
import { GET_FEATURED_JOBS, GET_RECENT_JOBS, GET_JOBS_BY_LOCATION } from '../graphql/queries/jobs';
import { SAVE_JOB } from '../graphql/mutations/jobs';
import { getCurrentLocation, checkLocationServices, showLocationServicesAlert } from '../services/locationService';
import { useMutationWithOfflineSupport } from '../hooks/useMutationWithOfflineSupport';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { errorTracking } from '../services/errorTracking';
import { useAnalytics } from '../hooks/useAnalytics';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  
  // Network status
  const { isOnline } = useNetworkStatus();
  
  // Analytics
  const analytics = useAnalytics('HomeScreen');
  
  // Save job mutation with offline support
  const [saveJob, { loading: saveLoading }] = useMutationWithOfflineSupport(
    SAVE_JOB,
    { entityType: 'savedJob' }
  );
  
  // Featured jobs query
  const { 
    loading: featuredLoading, 
    error: featuredError, 
    data: featuredData, 
    refetch: refetchFeatured 
  } = useQuery(GET_FEATURED_JOBS, {
    variables: { limit: 3 }
  });

  // Recent jobs query
  const { 
    loading: recentLoading, 
    error: recentError, 
    data: recentData, 
    refetch: refetchRecent, 
    fetchMore 
  } = useQuery(GET_RECENT_JOBS, {
    variables: { limit: 5 }
  });
  
  // Nearby jobs query
  const { 
    loading: nearbyLoading, 
    error: nearbyError, 
    data: nearbyData, 
    refetch: refetchNearby 
  } = useQuery(GET_JOBS_BY_LOCATION, {
    variables: { 
      location: userLocation?.city ? `%${userLocation.city}%` : '%', 
      limit: 3 
    },
    skip: !userLocation?.city
  });

  // Get user location
  const getUserLocation = async () => {
    setLocationLoading(true);
    try {
      // Check if location services are enabled
      const enabled = await checkLocationServices();
      if (!enabled) {
        showLocationServicesAlert();
        setLocationLoading(false);
        return;
      }
      
      // Get current location
      const location = await getCurrentLocation();
      setUserLocation(location);
      
      // Track location usage for analytics
      analytics.trackEvent('location_accessed', {
        city: location?.city,
        state: location?.state
      });
    } catch (error) {
      console.error('Error getting location:', error);
      errorTracking.logError(error, {
        context: 'HomeScreen',
        action: 'getUserLocation'
      });
    } finally {
      setLocationLoading(false);
    }
  };
  
  // Get location on component mount
  useEffect(() => {
    getUserLocation();
  }, []);

  // Refresh all data
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchFeatured(), 
        refetchRecent(),
        userLocation?.city ? refetchNearby() : Promise.resolve(),
        getUserLocation()
      ]);
      
      // Track refresh action
      analytics.trackEvent('refresh_home', {
        hasLocation: !!userLocation?.city
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      errorTracking.logError(error, {
        context: 'HomeScreen',
        action: 'onRefresh'
      });
    } finally {
      setRefreshing(false);
    }
  };
  
  // Load more jobs
  const loadMoreJobs = async () => {
    if (loadingMore || !recentData || !recentData.jobs || recentData.jobs.length < 5) return;
    
    setLoadingMore(true);
    try {
      await fetchMore({
        variables: {
          offset: recentData.jobs.length,
          limit: 5
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            jobs: [...prev.jobs, ...fetchMoreResult.jobs]
          };
        }
      });
      
      // Track load more action
      analytics.trackEvent('load_more_jobs', {
        currentCount: recentData.jobs.length
      });
    } catch (error) {
      console.error('Error loading more jobs:', error);
      errorTracking.logError(error, {
        context: 'HomeScreen',
        action: 'loadMoreJobs'
      });
    } finally {
      setLoadingMore(false);
    }
  };
  
  // Handle save job
  const handleSaveJob = async (jobId, jobTitle, company) => {
    try {
      await saveJob({ 
        variables: { jobId }
      });
      
      // Track job save
      analytics.trackJobSave(jobId, jobTitle, company);
    } catch (error) {
      // Don't show error if it's just queued for offline
      if (!error.message?.includes('Mutation queued for offline execution')) {
        console.error('Error saving job:', error);
        errorTracking.logError(error, {
          context: 'HomeScreen',
          action: 'handleSaveJob',
          jobId
        });
        Alert.alert('Error', 'Failed to save job. Please try again.');
      }
    }
  };

  // Use mock data if API isn't available yet or offline
  const useMockData = featuredError || recentError || nearbyError || !isOnline;
  const { mockJobs } = require('../constants/mockData');

  // Format jobs data
  const featuredJobs = useMockData ? mockJobs.slice(0, 3) : featuredData?.jobs || [];
  const recentJobs = useMockData ? mockJobs.slice(3) : recentData?.jobs || [];
  const nearbyJobs = useMockData ? mockJobs.slice(1, 4) : nearbyData?.jobs || [];

  const isLoading = (featuredLoading || recentLoading) && !refreshing;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <FlatList
        className="flex-1"
        ListHeaderComponent={() => (
          <View className="p-4">
            <Text className="text-2xl font-bold text-gray-900">Find Your Next Gig</Text>
            <Text className="text-gray-600 mt-1">Discover opportunities that match your skills</Text>
            
            {/* Location Section */}
            {userLocation?.city && (
              <View className="mt-4 flex-row items-center">
                <Text className="text-gray-600 mr-1">📍</Text>
                <Text className="text-gray-600">
                  {userLocation.city}{userLocation.state ? `, ${userLocation.state}` : ''}
                </Text>
                {locationLoading && (
                  <ActivityIndicator size="small" color="#0070f3" style={{ marginLeft: 8 }} />
                )}
              </View>
            )}
            
            {/* Nearby Jobs Section */}
            {userLocation?.city && (
              <View className="mt-6">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-lg font-semibold">Jobs Near You</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Search' as never)}>
                    <Text className="text-primary">See All</Text>
                  </TouchableOpacity>
                </View>
                
                {nearbyLoading && !refreshing ? (
                  <ActivityIndicator size="small" color="#0070f3" />
                ) : nearbyJobs.length > 0 ? (
                  nearbyJobs.map((job) => (
                    <JobCard 
                      key={job.id} 
                      job={job} 
                      onSave={() => handleSaveJob(job.id, job.title, job.company)}
                    />
                  ))
                ) : (
                  <View className="bg-white p-4 rounded-lg border border-gray-200">
                    <Text className="text-gray-500 text-center">No jobs found near you</Text>
                  </View>
                )}
              </View>
            )}
            
            {/* Featured Jobs Section */}
            <View className="mt-6">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-semibold">Recommended Jobs</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Search' as never)}>
                  <Text className="text-primary">See All</Text>
                </TouchableOpacity>
              </View>
              
              {isLoading ? (
                <ActivityIndicator size="small" color="#0070f3" />
              ) : featuredJobs.length > 0 ? (
                featuredJobs.map((job) => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    onSave={() => handleSaveJob(job.id, job.title, job.company)}
                  />
                ))
              ) : (
                <Text className="text-gray-500">No recommended jobs found</Text>
              )}
            </View>
            
            {/* Recent Jobs Section */}
            <View className="mt-6">
              <Text className="text-lg font-semibold mb-3">Recent Jobs</Text>
            </View>
          </View>
        )}
        data={recentJobs}
        renderItem={({ item }) => (
          <JobCard 
            job={item} 
            onSave={() => handleSaveJob(item.id, item.title, item.company)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMoreJobs}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => (
          loadingMore ? (
            <View className="py-4">
              <ActivityIndicator size="small" color="#0070f3" />
            </View>
          ) : null
        )}
        ListEmptyComponent={() => (
          !isLoading ? (
            <View className="p-4">
              <Text className="text-gray-500 text-center">No recent jobs found</Text>
            </View>
          ) : null
        )}
      />
    </SafeAreaView>
  );
}
