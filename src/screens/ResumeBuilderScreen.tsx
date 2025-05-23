import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useMutation } from '@apollo/client';
import Button from '../components/Button';
import { pickDocument, uploadResume } from '../services/fileUpload';
import { UPDATE_RESUME } from '../graphql/mutations/user';
import { useAuth } from '../context/AuthContext';

export default function ResumeBuilderScreen() {
  const { isAuthenticated } = useAuth();
  const [resumeUrl, setResumeUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const [updateResume, { loading }] = useMutation(UPDATE_RESUME);
  
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
  
  const handleSaveResume = async () => {
    if (!resumeUrl) {
      Alert.alert('Error', 'Please upload a resume first');
      return;
    }
    
    try {
      await updateResume({
        variables: { resumeUrl }
      });
      
      Alert.alert('Success', 'Resume saved successfully');
    } catch (error) {
      console.error('Error saving resume:', error);
      Alert.alert('Error', 'Failed to save resume. Please try again.');
    }
  };
  
  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center p-4">
        <Text className="text-xl font-bold mb-4">Sign in to build your resume</Text>
        <Text className="text-gray-600 text-center mb-6">
          Create an account or sign in to create and manage your resume.
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
      <ScrollView className="flex-1">
        <View className="p-4">
          <Text className="text-2xl font-bold text-gray-900">Resume Builder</Text>
          <Text className="text-gray-600 mt-1">Create and manage your professional resume</Text>
          
          <View className="bg-white p-4 rounded-lg border border-gray-200 mt-6">
            <Text className="text-lg font-semibold mb-4">Upload Resume</Text>
            
            <Text className="text-gray-600 mb-2">
              Upload your resume in PDF or DOCX format. This will be used when applying for jobs.
            </Text>
            
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
                <Text className="text-xs text-gray-500 mt-1" numberOfLines={1} ellipsizeMode="middle">
                  {resumeUrl}
                </Text>
              </View>
            ) : null}
          </View>
          
          <View className="mt-6">
            <Button
              title="Save Resume"
              onPress={handleSaveResume}
              disabled={!resumeUrl || loading}
              loading={loading}
              fullWidth={true}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
