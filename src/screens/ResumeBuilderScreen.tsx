import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet
} from 'react-native';
import { useMutation, useQuery } from '@apollo/client';
import { UPDATE_RESUME } from '../graphql/mutations/user';
import { GET_USER_PROFILE } from '../graphql/queries/user';
import { fileUpload } from '../services/fileUpload';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import DocumentPicker from 'react-native-document-picker';
import { useMutationWithOfflineSupport } from '../hooks/useMutationWithOfflineSupport';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { errorTracking } from '../services/errorTracking';
import { validateData } from '../utils/dataValidation';
import { useAnalytics } from '../hooks/useAnalytics';

export default function ResumeBuilderScreen() {
  const { isAuthenticated } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [summary, setSummary] = useState('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');
  const [skills, setSkills] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Network status
  const { isOnline } = useNetworkStatus();
  
  // Analytics
  const analytics = useAnalytics('ResumeBuilder');
  
  // Get user profile
  const { loading, data } = useQuery(GET_USER_PROFILE, {
    skip: !isAuthenticated
  });
  
  // Update resume mutation with offline support
  const [updateResume] = useMutationWithOfflineSupport(
    UPDATE_RESUME,
    { entityType: 'resume' }
  );
  
  // Set initial values from user profile
  useEffect(() => {
    if (data?.users?.[0]) {
      const user = data.users[0];
      setName(user.name || '');
      setEmail(user.email || '');
      
      if (user.profile) {
        setResumeUrl(user.profile.resume_url || '');
      }
    }
  }, [data]);
  
  // Handle generate resume
  const handleGenerateResume = async () => {
    if (!isAuthenticated) {
      Alert.alert('Error', 'Please sign in to generate a resume');
      return;
    }
    
    // Validate inputs
    const validationRules = {
      required: ['name', 'email'],
      format: {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      },
      minLength: {
        summary: 10
      }
    };
    
    const validationResult = validateData(
      { name, email, phone, summary },
      validationRules
    );
    
    if (!validationResult.isValid) {
      Alert.alert('Validation Error', Object.values(validationResult.errors)[0]);
      return;
    }
    
    setIsLoading(true);
    try {
      // In a real app, you would generate a PDF here
      // For now, we'll just create a mock PDF data
      const resumeData = {
        name,
        email,
        phone,
        summary,
        experience,
        education,
        skills
      };
      
      // Mock PDF generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock URL
      const mockResumeUrl = `https://storage.example.com/resumes/${name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`;
      
      // Update resume URL in database
      await updateResume({
        variables: {
          resumeUrl: mockResumeUrl
        }
      });
      
      setResumeUrl(mockResumeUrl);
      
      // Track resume generation
      analytics.trackEvent('generate_resume', {
        hasExperience: experience.length > 0,
        hasEducation: education.length > 0,
        hasSkills: skills.length > 0
      });
      
      Alert.alert('Success', 'Resume generated successfully!');
    } catch (error) {
      // Don't show error if it's just queued for offline
      if (!error.message?.includes('Mutation queued for offline execution')) {
        console.error('Error generating resume:', error);
        errorTracking.logError(error, {
          context: 'ResumeBuilderScreen',
          action: 'handleGenerateResume'
        });
        Alert.alert('Error', 'Failed to generate resume');
      } else {
        Alert.alert('Success', 'Resume will be generated when you are back online');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle upload resume
  const handleUploadResume = async () => {
    if (!isAuthenticated) {
      Alert.alert('Error', 'Please sign in to upload a resume');
      return;
    }
    
    if (!isOnline) {
      Alert.alert(
        'Offline Mode',
        'You need to be online to upload a resume. Please try again when you have an internet connection.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Pick a document
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });
      
      // In a real app, you would upload the file to storage
      // For now, we'll just use the URI as the resume URL
      const fileUri = result[0].uri;
      const fileName = result[0].name;
      const fileSize = result[0].size;
      
      // Mock upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock URL
      const mockResumeUrl = `https://storage.example.com/resumes/${fileName}`;
      
      // Update resume URL in database
      await updateResume({
        variables: {
          resumeUrl: mockResumeUrl
        }
      });
      
      setResumeUrl(mockResumeUrl);
      
      // Track resume upload
      analytics.trackEvent('upload_resume', {
        fileSize,
        fileType: result[0].type
      });
      
      Alert.alert('Success', 'Resume uploaded successfully!');
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        // User cancelled the picker
      } else {
        console.error('Error uploading resume:', error);
        errorTracking.logError(error, {
          context: 'ResumeBuilderScreen',
          action: 'handleUploadResume'
        });
        Alert.alert('Error', 'Failed to upload resume');
      }
    } finally {
      setIsUploading(false);
    }
  };
  
  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center p-4">
        <Text className="text-xl font-bold text-center mb-4">Sign In Required</Text>
        <Text className="text-gray-600 text-center mb-6">
          Please sign in to build or upload your resume.
        </Text>
        <Button 
          title="Sign In" 
          onPress={() => {}} 
          fullWidth={true}
        />
      </SafeAreaView>
    );
  }
  
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#0070f3" />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold mb-6">Resume Builder</Text>
        
        {resumeUrl ? (
          <View className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
            <Text className="text-lg font-semibold mb-2">Current Resume</Text>
            <Text className="text-blue-500 mb-4" numberOfLines={1}>{resumeUrl}</Text>
            <Button 
              title="Upload New Resume" 
              onPress={handleUploadResume}
              disabled={isUploading}
              variant="outline"
              fullWidth={true}
            />
          </View>
        ) : (
          <View className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
            <Text className="text-lg font-semibold mb-2">Upload Resume</Text>
            <Text className="text-gray-600 mb-4">
              Upload an existing resume or create a new one below.
            </Text>
            <Button 
              title={isUploading ? "Uploading..." : "Upload Resume"}
              onPress={handleUploadResume}
              disabled={isUploading}
              fullWidth={true}
            />
          </View>
        )}
        
        <View className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <Text className="text-lg font-semibold mb-4">Create New Resume</Text>
          
          <Text className="text-sm font-medium mb-1">Full Name</Text>
          <TextInput
            className="border border-gray-300 rounded p-2 mb-3"
            placeholder="John Doe"
            value={name}
            onChangeText={setName}
          />
          
          <Text className="text-sm font-medium mb-1">Email</Text>
          <TextInput
            className="border border-gray-300 rounded p-2 mb-3"
            placeholder="john@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          
          <Text className="text-sm font-medium mb-1">Phone</Text>
          <TextInput
            className="border border-gray-300 rounded p-2 mb-3"
            placeholder="(123) 456-7890"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          
          <Text className="text-sm font-medium mb-1">Professional Summary</Text>
          <TextInput
            className="border border-gray-300 rounded p-2 mb-3"
            placeholder="Brief summary of your professional background and goals"
            value={summary}
            onChangeText={setSummary}
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />
          
          <Text className="text-sm font-medium mb-1">Work Experience</Text>
          <TextInput
            className="border border-gray-300 rounded p-2 mb-3"
            placeholder="List your work experience"
            value={experience}
            onChangeText={setExperience}
            multiline
            numberOfLines={6}
            style={styles.textArea}
          />
          
          <Text className="text-sm font-medium mb-1">Education</Text>
          <TextInput
            className="border border-gray-300 rounded p-2 mb-3"
            placeholder="List your education"
            value={education}
            onChangeText={setEducation}
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />
          
          <Text className="text-sm font-medium mb-1">Skills</Text>
          <TextInput
            className="border border-gray-300 rounded p-2 mb-4"
            placeholder="List your skills (comma separated)"
            value={skills}
            onChangeText={setSkills}
            multiline
            numberOfLines={3}
            style={styles.textArea}
          />
          
          <Button
            title={isLoading ? "Generating..." : "Generate Resume"}
            onPress={handleGenerateResume}
            disabled={isLoading || !name || !email}
            fullWidth={true}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});
