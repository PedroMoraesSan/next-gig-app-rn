import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

type JobCardProps = {
  job: {
    id: string;
    title: string;
    company: string;
    companyLogo: string;
    location: string;
    type: string;
    tags: string[];
    salary: string;
  };
  onSave?: () => void;
};

export default function JobCard({ job, onSave }: JobCardProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  return (
    <TouchableOpacity
      className="border border-gray-200 rounded-lg p-4 bg-white mb-3"
      onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Image 
            source={{ uri: job.companyLogo }} 
            className="w-12 h-12 rounded"
            style={{ width: 48, height: 48 }} // Fallback styling if className doesn't work
          />
          <View className="ml-3">
            <Text className="font-medium text-base">{job.title}</Text>
            <Text className="text-sm text-gray-500">{job.company}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onSave}>
          <Text className="text-2xl">♡</Text> {/* We'll replace with proper icon later */}
        </TouchableOpacity>
      </View>
      
      <View className="mt-4">
        <View className="flex-row items-center">
          <Text className="text-sm text-gray-500 mr-1">📍</Text> {/* We'll replace with proper icon later */}
          <Text className="text-sm text-gray-500">{job.location}</Text>
        </View>
        <View className="flex-row items-center mt-1">
          <Text className="text-sm text-gray-500 mr-1">💼</Text> {/* We'll replace with proper icon later */}
          <Text className="text-sm text-gray-500">{job.type}</Text>
        </View>
      </View>
      
      <View className="mt-4 flex-row flex-wrap">
        {job.tags.map((tag) => (
          <View key={tag} className="bg-gray-100 rounded px-2 py-1 mr-2 mb-2">
            <Text className="text-xs">{tag}</Text>
          </View>
        ))}
      </View>
      
      <View className="mt-4 flex-row justify-between items-center">
        <Text className="font-medium">{job.salary}</Text>
        <Text className="text-primary">View Details</Text>
      </View>
    </TouchableOpacity>
  );
}
