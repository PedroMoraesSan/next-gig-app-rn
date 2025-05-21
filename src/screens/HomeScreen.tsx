import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import JobCard from '../components/JobCard';
import { mockJobs } from '../constants/mockData';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="p-4">
          <Text className="text-2xl font-bold text-gray-900">Find Your Next Gig</Text>
          <Text className="text-gray-600 mt-1">Discover opportunities that match your skills</Text>
          
          <View className="mt-6">
            <Text className="text-lg font-semibold mb-3">Recommended Jobs</Text>
            {mockJobs.slice(0, 3).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </View>
          
          <View className="mt-6">
            <Text className="text-lg font-semibold mb-3">Recent Jobs</Text>
            {mockJobs.slice(3, 5).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
