import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useMutation, useQuery } from '@apollo/client';
import { RootStackParamList } from '../navigation';
import Button from '../components/Button';
import { GET_JOB_BY_ID } from '../graphql/queries/jobs';
import { APPLY_FOR_JOB } from '../graphql/mutations/jobs';
import { pickDocument, uploadResume } from '../services/fileUpload';
import { useAuth } from '../context/AuthContext';

type ApplyScreenRouteProp = RouteProp<RootStackParamList, 'Apply'>;

export default function ApplyScreen() {
  const route = useRoute<ApplyScreenRouteProp>();
  const navigation = useNavigation();
  const { jobId } = route.params;
  const { isAuthenticated } = useAuth();
  
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const { loading: jobLoading, error: jobError, data: jobData } = useQuery(GET_JOB_BY_ID, {
    variables: { id: jobId }
  });
  
  const [applyForJob, { loading: applyLoading }] = useMutation(APPLY_FOR_JOB);
  
  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center p-4">
        <Text className="text-xl font-bold mb-4">Sign in to apply</Text>
        <Text className="text-gray-600 text-center mb-6">
          Create an account or sign in to apply for jobs.
        </Text>
        <Button 
          title="Sign In" 
          onPress={() => {}} 
          fullWidth={true}
        />
      </SafeAreaView>
    );
  }
  
  if (jobLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#0070f3" />
      </SafeAreaView>
    );
  }
  
  if (jobError || !jobData?.jobs_by_pk) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text>Job not found or error loading: {jobError?.message}</Text>
      </SafeAreaView>
    );
  }
  
  const job = jobData.jobs_by_pk;
  
  const handlePickResume = async () => {
    try {
      setUploading(true);
      const file = await pickDocument();
      
      if (file) {
        const url = await uploadResume(file);
        setResumeUrl(url);
        Alert.alert('Success', 'Resume uploaded successfully');
      }
    } catch (error) {
      console.error('Error picking or uploading resume:', error);
      Alert.alert('Error', 'Failed to upload resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  const handleApply = async () => {
    if (!resumeUrl) {
      Alert.alert('Error', 'Please upload your resume');
      return;
    }
    
    try {
      await applyForJob({
        variables: {
          jobId,
          resumeUrl,
          coverLetter: coverLetter.trim() || null
        }
      });
      
      Alert.alert(
        'Application Submitted',
        'Your application has been submitted successfully!',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.navigate('Main')
          }
        ]
      );
    } catch (error) {
      console.error('Error applying for job:', error);
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    }
  };
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="p-4">
          <Text className="text-2xl font-bold text-gray-900">Apply for Job</Text>
          <Text className="text-gray-600 mt-1">{job.title} at {job.company}</Text>
          
          <View className="bg-white p-4 rounded-lg border border-gray-200 mt-6">
            <Text className="text-lg font-semibold mb-4">Upload Resume</Text>
            
            <Button
              title={uploading ? "Uploading..." : "Select Resume"}
              onPress={handlePickResume}
              disabled={uploading}
              loading={uploading}
              fullWidth={true}
            />
            
            {resumeUrl ? (
              <View className="mt-4 p-3 bg-gray-50 rounded-lg">
                <Text className="text-sm text-gray-600">Resume uploaded successfully</Text>
              </View>
            ) : null}
          </View>
          
          <View className="bg-white p-4 rounded-lg border border-gray-200 mt-4">
            <Text className="text-lg font-semibold mb-4">Cover Letter (Optional)</Text>
            
            <TextInput
              className="border border-gray-300 rounded-lg p-3 min-h-[150px]"
              placeholder="Write a cover letter to introduce yourself and explain why you're a good fit for this position..."
              value={coverLetter}
              onChangeText={setCoverLetter}
              multiline
              textAlignVertical="top"
            />
          </View>
          
          <View className="mt-6">
            <Button
              title="Submit Application"
              onPress={handleApply}
              disabled={!resumeUrl || applyLoading}
              loading={applyLoading}
              fullWidth={true}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
