import React from 'react';
import { View, Text, ScrollView, SafeAreaView, Image } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation';
import Button from '../components/Button';
import { mockJobs } from '../constants/mockData';

type JobDetailScreenRouteProp = RouteProp<RootStackParamList, 'JobDetail'>;

export default function JobDetailScreen() {
  const route = useRoute<JobDetailScreenRouteProp>();
  const { jobId } = route.params;
  
  // Find the job from mock data - in a real app, this would be an API call
  const job = mockJobs.find(j => j.id === jobId);
  
  if (!job) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text>Job not found</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="p-4">
          {/* Job Header */}
          <View className="bg-white p-4 rounded-lg border border-gray-200">
            <View className="flex-row items-center">
              <Image 
                source={{ uri: job.companyLogo }} 
                className="w-16 h-16 rounded"
                style={{ width: 64, height: 64 }} // Fallback styling
              />
              <View className="ml-3">
                <Text className="text-xl font-bold">{job.title}</Text>
                <Text className="text-gray-600">{job.company}</Text>
                <Text className="text-gray-500">{job.location}</Text>
              </View>
            </View>
            
            <View className="flex-row flex-wrap mt-4">
              <View className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2">
                <Text className="text-sm">{job.type}</Text>
              </View>
              <View className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2">
                <Text className="text-sm">Posted {job.postedDate}</Text>
              </View>
              <View className="bg-blue-100 rounded-full px-3 py-1 mr-2 mb-2">
                <Text className="text-sm text-blue-800">{job.salary}</Text>
              </View>
            </View>
          </View>
          
          {/* Job Description */}
          <View className="bg-white p-4 rounded-lg border border-gray-200 mt-4">
            <Text className="text-lg font-semibold mb-2">Job Description</Text>
            <Text className="text-gray-700">{job.description}</Text>
          </View>
          
          {/* Requirements */}
          <View className="bg-white p-4 rounded-lg border border-gray-200 mt-4">
            <Text className="text-lg font-semibold mb-2">Requirements</Text>
            {job.requirements.map((req, index) => (
              <View key={index} className="flex-row mb-2">
                <Text className="mr-2">•</Text>
                <Text className="text-gray-700 flex-1">{req}</Text>
              </View>
            ))}
          </View>
          
          {/* Skills */}
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
          
          {/* Apply Button */}
          <View className="mt-6 mb-6">
            <Button 
              title="Apply Now" 
              onPress={() => {}} 
              fullWidth={true}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
