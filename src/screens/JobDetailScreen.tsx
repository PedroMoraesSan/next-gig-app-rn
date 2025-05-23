import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  SafeAreaView, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Share,
  Linking
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useMutation, useQuery } from '@apollo/client';
import { RootStackParamList } from '../navigation';
import Button from '../components/Button';
import InterviewScheduler from '../components/InterviewScheduler';
import { GET_JOB_BY_ID } from '../graphql/queries/jobs';
import { SAVE_JOB, UNSAVE_JOB } from '../graphql/mutations/jobs';
import { CHECK_JOB_SAVED } from '../graphql/queries/user';
import { useAuth } from '../context/AuthContext';
import { useAnalytics } from '../hooks/useAnalytics';

type JobDetailScreenRouteProp = RouteProp<RootStackParamList, 'JobDetail'>;

export default function JobDetailScreen() {
  const route = useRoute<JobDetailScreenRouteProp>();
  const navigation = useNavigation();
  const { jobId } = route.params;
  const { isAuthenticated } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  
  // Analytics hook
  const analytics = useAnalytics('JobDetail', { jobId });
  
  // Get job details
  const { loading, error, data } = useQuery(GET_JOB_BY_ID, {
    variables: { id: jobId }
  });
  
  // Check if job is saved
  const { data: savedData, refetch: refetchSaved } = useQuery(CHECK_JOB_SAVED, {
    variables: { jobId },
    skip: !isAuthenticated
  });
  
  // Save job mutation
  const [saveJob, { loading: saveLoading }] = useMutation(SAVE_JOB);
  
  // Unsave job mutation
  const [unsaveJob, { loading: unsaveLoading }] = useMutation(UNSAVE_JOB);
  
  // Update saved status when data changes
  useEffect(() => {
    if (savedData && savedData.saved_jobs) {
      setIsSaved(savedData.saved_jobs.length > 0);
    }
  }, [savedData]);
  
  // Track job view
  useEffect(() => {
    if (data && data.jobs_by_pk) {
      const job = data.jobs_by_pk;
      analytics.trackJobView(job.id, job.title, job.company);
    }
  }, [data]);
  
  // Handle save/unsave job
  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to save jobs',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => navigation.navigate('Login' as never) }
        ]
      );
      return;
    }
    
    try {
      if (isSaved) {
        await unsaveJob({ variables: { jobId } });
        setIsSaved(false);
        
        // Track unsave job
        if (data && data.jobs_by_pk) {
          const job = data.jobs_by_pk;
          analytics.trackJobUnsave(job.id, job.title, job.company);
        }
      } else {
        await saveJob({ variables: { jobId } });
        setIsSaved(true);
        
        // Track save job
        if (data && data.jobs_by_pk) {
          const job = data.jobs_by_pk;
          analytics.trackJobSave(job.id, job.title, job.company);
        }
      }
    } catch (error) {
      console.error('Error toggling job save:', error);
      Alert.alert('Error', 'Failed to update saved status');
    }
  };
  
  // Handle apply
  const handleApply = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to apply for jobs',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => navigation.navigate('Login' as never) }
        ]
      );
      return;
    }
    
    navigation.navigate('Apply', { jobId });
    
    // Track job application
    if (data && data.jobs_by_pk) {
      const job = data.jobs_by_pk;
      analytics.trackJobApplication(job.id, job.title, job.company);
    }
  };
  
  // Handle share
  const handleShare = async () => {
    if (data && data.jobs_by_pk) {
      const job = data.jobs_by_pk;
      try {
        await Share.share({
          title: `${job.title} at ${job.company}`,
          message: `Check out this job: ${job.title} at ${job.company}. ${job.location}`,
          // In a real app, you would include a deep link URL here
        });
      } catch (error) {
        console.error('Error sharing job:', error);
      }
    }
  };
  
  // Handle schedule interview
  const handleScheduleInterview = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to schedule interviews',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => navigation.navigate('Login' as never) }
        ]
      );
      return;
    }
    
    setShowInterviewModal(true);
  };
  
  // Handle interview scheduled
  const handleInterviewScheduled = (eventId: string, startDate: Date, endDate: Date) => {
    // Track interview scheduling
    if (data && data.jobs_by_pk) {
      const job = data.jobs_by_pk;
      analytics.trackInterviewScheduling(job.id, job.title, job.company);
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#0070f3" />
      </SafeAreaView>
    );
  }
  
  if (error || !data?.jobs_by_pk) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center p-4">
        <Text className="text-xl font-bold text-center mb-4">Job Not Found</Text>
        <Text className="text-gray-600 text-center mb-6">
          The job you're looking for doesn't exist or has been removed.
        </Text>
        <Button 
          title="Browse Jobs" 
          onPress={() => navigation.navigate('Main' as never)} 
          fullWidth={true}
        />
      </SafeAreaView>
    );
  }
  
  const job = data.jobs_by_pk;
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="p-4">
          {/* Job Header */}
          <View className="bg-white p-4 rounded-lg border border-gray-200">
            <View className="flex-row items-center">
              {job.company_logo ? (
                <Image 
                  source={{ uri: job.company_logo }} 
                  className="w-16 h-16 rounded"
                  style={{ width: 64, height: 64 }} // Fallback styling
                />
              ) : (
                <View className="w-16 h-16 rounded bg-gray-200 items-center justify-center">
                  <Text className="text-2xl">{job.company.charAt(0)}</Text>
                </View>
              )}
              <View className="ml-4 flex-1">
                <Text className="text-xl font-bold">{job.title}</Text>
                <Text className="text-gray-600">{job.company}</Text>
                <Text className="text-gray-500 mt-1">{job.location}</Text>
              </View>
            </View>
            
            <View className="flex-row mt-4">
              <View className="bg-gray-100 rounded px-3 py-1 mr-2">
                <Text className="text-sm">{job.job_type}</Text>
              </View>
              <View className="bg-gray-100 rounded px-3 py-1">
                <Text className="text-sm">{formatDate(job.posted_date)}</Text>
              </View>
            </View>
            
            <View className="flex-row justify-between mt-4">
              <Button 
                title="Apply Now" 
                onPress={handleApply} 
                fullWidth={false}
              />
              <View className="flex-row">
                <TouchableOpacity 
                  className="bg-gray-100 rounded-full w-10 h-10 items-center justify-center mr-2"
                  onPress={handleToggleSave}
                  disabled={saveLoading || unsaveLoading}
                >
                  <Text className="text-xl">{isSaved ? '♥' : '♡'}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="bg-gray-100 rounded-full w-10 h-10 items-center justify-center"
                  onPress={handleShare}
                >
                  <Text className="text-xl">↗️</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          {/* Job Description */}
          <View className="bg-white p-4 rounded-lg border border-gray-200 mt-4">
            <Text className="text-lg font-semibold mb-2">Description</Text>
            <Text className="text-gray-700">{job.description}</Text>
          </View>
          
          {/* Job Requirements */}
          {job.requirements && (
            <View className="bg-white p-4 rounded-lg border border-gray-200 mt-4">
              <Text className="text-lg font-semibold mb-2">Requirements</Text>
              {Array.isArray(job.requirements) ? (
                job.requirements.map((req, index) => (
                  <View key={index} className="flex-row mb-2">
                    <Text className="mr-2">•</Text>
                    <Text className="text-gray-700 flex-1">{req}</Text>
                  </View>
                ))
              ) : (
                <Text className="text-gray-700">{job.requirements}</Text>
              )}
            </View>
          )}
          
          {/* Job Benefits */}
          {job.benefits && (
            <View className="bg-white p-4 rounded-lg border border-gray-200 mt-4">
              <Text className="text-lg font-semibold mb-2">Benefits</Text>
              {Array.isArray(job.benefits) ? (
                job.benefits.map((benefit, index) => (
                  <View key={index} className="flex-row mb-2">
                    <Text className="mr-2">•</Text>
                    <Text className="text-gray-700 flex-1">{benefit}</Text>
                  </View>
                ))
              ) : (
                <Text className="text-gray-700">{job.benefits}</Text>
              )}
            </View>
          )}
          
          {/* Salary */}
          {job.salary && (
            <View className="bg-white p-4 rounded-lg border border-gray-200 mt-4">
              <Text className="text-lg font-semibold mb-2">Salary</Text>
              <Text className="text-gray-700">{job.salary}</Text>
            </View>
          )}
          
          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <View className="bg-white p-4 rounded-lg border border-gray-200 mt-4">
              <Text className="text-lg font-semibold mb-2">Skills</Text>
              <View className="flex-row flex-wrap">
                {job.tags.map((tag, index) => (
                  <View key={index} className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2">
                    <Text className="text-sm">{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {/* Actions */}
          <View className="mt-6 space-y-3">
            <Button 
              title="Apply Now" 
              onPress={handleApply} 
              fullWidth={true}
            />
            <Button 
              title="Schedule Interview" 
              onPress={handleScheduleInterview} 
              variant="outline"
              fullWidth={true}
            />
          </View>
        </View>
      </ScrollView>
      
      {/* Interview Scheduler Modal */}
      <InterviewScheduler
        visible={showInterviewModal}
        onClose={() => setShowInterviewModal(false)}
        onSchedule={handleInterviewScheduled}
        jobTitle={job.title}
        company={job.company}
      />
    </SafeAreaView>
  );
}
