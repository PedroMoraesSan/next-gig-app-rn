import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TextInput, TouchableOpacity } from 'react-native';
import JobCard from '../components/JobCard';
import { mockJobs } from '../constants/mockData';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredJobs, setFilteredJobs] = useState(mockJobs);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredJobs(mockJobs);
      return;
    }
    
    const filtered = mockJobs.filter(job => 
      job.title.toLowerCase().includes(query.toLowerCase()) ||
      job.company.toLowerCase().includes(query.toLowerCase()) ||
      job.location.toLowerCase().includes(query.toLowerCase()) ||
      job.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    
    setFilteredJobs(filtered);
  };
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="p-4">
          <Text className="text-2xl font-bold text-gray-900">Search Jobs</Text>
          
          <View className="mt-4 mb-6">
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-2 bg-white"
              placeholder="Search by title, company, or skills..."
              value={searchQuery}
              onChangeText={handleSearch}
            />
            
            <View className="flex-row flex-wrap mt-3">
              <TouchableOpacity className="bg-gray-200 rounded-full px-3 py-1 mr-2 mb-2">
                <Text className="text-sm">Remote</Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-gray-200 rounded-full px-3 py-1 mr-2 mb-2">
                <Text className="text-sm">Full-time</Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-gray-200 rounded-full px-3 py-1 mr-2 mb-2">
                <Text className="text-sm">Contract</Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-gray-200 rounded-full px-3 py-1 mr-2 mb-2">
                <Text className="text-sm">Tech</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View>
            <Text className="text-lg font-semibold mb-3">Search Results</Text>
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))
            ) : (
              <View className="bg-white p-4 rounded-lg border border-gray-200">
                <Text className="text-center text-gray-500">No jobs found matching your search criteria</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
