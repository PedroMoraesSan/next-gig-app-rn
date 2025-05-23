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
  saved?: boolean;
};

export default function JobCard({ job, onSave, saved = false }: JobCardProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  // Default image if companyLogo is not available
  const defaultLogo = 'https://via.placeholder.com/100';
  
  return (
    <TouchableOpacity
      className="border border-gray-200 rounded-lg p-4 bg-white mb-3"
      onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <Image 
            source={{ uri: job.companyLogo || defaultLogo }} 
            className="w-12 h-12 rounded"
            style={{ width: 48, height: 48 }} // Fallback styling if className doesn't work
          />
          <View className="ml-3 flex-1">
            <Text className="font-medium text-base" numberOfLines={1}>{job.title}</Text>
            <Text className="text-sm text-gray-500" numberOfLines={1}>{job.company}</Text>
          </View>
        </View>
        {onSave && (
          <TouchableOpacity 
            onPress={onSave}
            className="ml-2 p-2"
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Text className="text-2xl">{saved ? '♥' : '♡'}</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View className="mt-4">
        <View className="flex-row items-center">
          <Text className="text-sm text-gray-500 mr-1">📍</Text>
          <Text className="text-sm text-gray-500" numberOfLines={1}>{job.location}</Text>
        </View>
        <View className="flex-row items-center mt-1">
          <Text className="text-sm text-gray-500 mr-1">💼</Text>
          <Text className="text-sm text-gray-500">{job.type}</Text>
        </View>
      </View>
      
      <View className="mt-4 flex-row flex-wrap">
        {job.tags && job.tags.slice(0, 3).map((tag) => (
          <View key={tag} className="bg-gray-100 rounded px-2 py-1 mr-2 mb-2">
            <Text className="text-xs">{tag}</Text>
          </View>
        ))}
        {job.tags && job.tags.length > 3 && (
          <View className="bg-gray-100 rounded px-2 py-1 mr-2 mb-2">
            <Text className="text-xs">+{job.tags.length - 3} more</Text>
          </View>
        )}
      </View>
      
      <View className="mt-4 flex-row justify-between items-center">
        <Text className="font-medium">{job.salary}</Text>
        <Text className="text-primary">View Details</Text>
      </View>
    </TouchableOpacity>
  );
}
