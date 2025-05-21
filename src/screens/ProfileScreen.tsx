import React from 'react';
import { View, Text, ScrollView, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import Button from '../components/Button';

export default function ProfileScreen() {
  // Mock user data - in a real app, this would come from authentication context
  const user = {
    name: 'Alex Johnson',
    title: 'Senior Software Engineer',
    location: 'San Francisco, CA',
    avatar: 'https://via.placeholder.com/150',
    about: 'Experienced software engineer with a passion for building user-friendly applications. Specialized in React Native and TypeScript development.',
    skills: ['React Native', 'TypeScript', 'GraphQL', 'Node.js', 'AWS'],
    experience: [
      {
        id: '1',
        role: 'Senior Software Engineer',
        company: 'Tech Innovations',
        duration: 'Jan 2023 - Present',
        description: 'Leading mobile app development using React Native'
      },
      {
        id: '2',
        role: 'Software Engineer',
        company: 'Digital Solutions',
        duration: 'Mar 2020 - Dec 2022',
        description: 'Developed web applications using React and Node.js'
      }
    ],
    education: [
      {
        id: '1',
        degree: 'M.S. Computer Science',
        institution: 'Stanford University',
        year: '2020'
      },
      {
        id: '2',
        degree: 'B.S. Computer Science',
        institution: 'University of California, Berkeley',
        year: '2018'
      }
    ]
  };
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="p-4">
          {/* Profile Header */}
          <View className="bg-white p-4 rounded-lg border border-gray-200 items-center">
            <Image 
              source={{ uri: user.avatar }} 
              className="w-24 h-24 rounded-full"
              style={{ width: 96, height: 96 }} // Fallback styling
            />
            <Text className="text-xl font-bold mt-2">{user.name}</Text>
            <Text className="text-gray-600">{user.title}</Text>
            <Text className="text-gray-500 mt-1">{user.location}</Text>
            
            <View className="flex-row mt-4">
              <Button 
                title="Edit Profile" 
                variant="outline" 
                onPress={() => {}} 
              />
            </View>
          </View>
          
          {/* About */}
          <View className="bg-white p-4 rounded-lg border border-gray-200 mt-4">
            <Text className="text-lg font-semibold mb-2">About</Text>
            <Text className="text-gray-700">{user.about}</Text>
          </View>
          
          {/* Skills */}
          <View className="bg-white p-4 rounded-lg border border-gray-200 mt-4">
            <Text className="text-lg font-semibold mb-2">Skills</Text>
            <View className="flex-row flex-wrap">
              {user.skills.map((skill, index) => (
                <View key={index} className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2">
                  <Text className="text-sm">{skill}</Text>
                </View>
              ))}
            </View>
          </View>
          
          {/* Experience */}
          <View className="bg-white p-4 rounded-lg border border-gray-200 mt-4">
            <Text className="text-lg font-semibold mb-2">Experience</Text>
            {user.experience.map((exp) => (
              <View key={exp.id} className="mb-4">
                <Text className="font-medium">{exp.role}</Text>
                <Text className="text-gray-600">{exp.company}</Text>
                <Text className="text-gray-500 text-sm">{exp.duration}</Text>
                <Text className="text-gray-700 mt-1">{exp.description}</Text>
              </View>
            ))}
          </View>
          
          {/* Education */}
          <View className="bg-white p-4 rounded-lg border border-gray-200 mt-4 mb-4">
            <Text className="text-lg font-semibold mb-2">Education</Text>
            {user.education.map((edu) => (
              <View key={edu.id} className="mb-2">
                <Text className="font-medium">{edu.degree}</Text>
                <Text className="text-gray-600">{edu.institution}</Text>
                <Text className="text-gray-500 text-sm">{edu.year}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
