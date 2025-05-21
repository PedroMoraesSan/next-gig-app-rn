import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import JobCard from '../components/JobCard';
import { mockJobs } from '../constants/mockData';

export default function SavedScreen() {
  // In a real app, this would come from a database or API
  const [savedJobs, setSavedJobs] = useState(mockJobs.slice(0, 2));
  
  const handleRemoveSaved = (jobId: string) => {
    setSavedJobs(savedJobs.filter(job => job.id !== jobId));
  };
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="p-4">
          <Text className="text-2xl font-bold text-gray-900">Saved Jobs</Text>
          <Text className="text-gray-600 mt-1">Jobs you've bookmarked for later</Text>
          
          <View className="mt-6">
            {savedJobs.length > 0 ? (
              savedJobs.map((job) => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  onSave={() => handleRemoveSaved(job.id)}
                />
              ))
            ) : (
              <View className="bg-white p-6 rounded-lg border border-gray-200 items-center">
                <Text className="text-xl font-medium text-gray-800 mb-2">No saved jobs yet</Text>
                <Text className="text-center text-gray-500">
                  When you find jobs you're interested in, save them here for easy access
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
