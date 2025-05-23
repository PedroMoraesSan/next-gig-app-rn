import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  SafeAreaView, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  RefreshControl,
  Modal
} from 'react-native';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { GET_USER_PROFILE, GET_USER_APPLICATIONS } from '../graphql/queries/user';
import { UPDATE_APPLICATION_STATUS, DELETE_APPLICATION } from '../graphql/mutations/user';

// Application status options
const APPLICATION_STATUSES = [
  { value: 'submitted', label: 'Submitted', color: 'text-yellow-600' },
  { value: 'screening', label: 'Screening', color: 'text-blue-600' },
  { value: 'interview', label: 'Interview', color: 'text-green-600' },
  { value: 'offer', label: 'Offer', color: 'text-purple-600' },
  { value: 'accepted', label: 'Accepted', color: 'text-green-700' },
  { value: 'rejected', label: 'Rejected', color: 'text-red-600' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'text-gray-600' }
];

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, isAuthenticated, signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [applicationDetailModalVisible, setApplicationDetailModalVisible] = useState(false);
  
  // Query user profile
  const { 
    loading: profileLoading, 
    error: profileError, 
    data: profileData,
    refetch: refetchProfile 
  } = useQuery(GET_USER_PROFILE, {
    skip: !isAuthenticated,
    fetchPolicy: 'cache-and-network'
  });
  
  // Query user applications
  const { 
    loading: applicationsLoading, 
    error: applicationsError, 
    data: applicationsData,
    refetch: refetchApplications 
  } = useQuery(GET_USER_APPLICATIONS, {
    skip: !isAuthenticated,
    fetchPolicy: 'cache-and-network'
  });
  
  // Update application status mutation
  const [updateApplicationStatus, { loading: updateStatusLoading }] = useMutation(UPDATE_APPLICATION_STATUS);
  
  // Delete application mutation
  const [deleteApplication, { loading: deleteLoading }] = useMutation(DELETE_APPLICATION);
  
  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchProfile(), refetchApplications()]);
    } catch (e) {
      console.error('Error refreshing profile data', e);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Handle status update
  const handleStatusUpdate = async (status) => {
    if (!selectedApplication) return;
    
    try {
      await updateApplicationStatus({
        variables: {
          id: selectedApplication.id,
          status
        },
        update: (cache, { data }) => {
          // Update cache with new status
          const updatedApplication = data.update_applications_by_pk;
          
          const existingData = cache.readQuery({
            query: GET_USER_APPLICATIONS
          });
          
          if (existingData && existingData.applications) {
            cache.writeQuery({
              query: GET_USER_APPLICATIONS,
              data: {
                applications: existingData.applications.map(app => 
                  app.id === updatedApplication.id ? updatedApplication : app
                )
              }
            });
          }
        }
      });
      
      setStatusModalVisible(false);
      
      // If we're using mock data, update the selected application status
      if (useMockData) {
        setSelectedApplication({
          ...selectedApplication,
          status
        });
      }
    } catch (e) {
      console.error('Error updating application status', e);
      Alert.alert('Error', 'Failed to update application status');
    }
  };
  
  // Handle application deletion
  const handleDeleteApplication = async () => {
    if (!selectedApplication) return;
    
    Alert.alert(
      'Delete Application',
      'Are you sure you want to delete this application? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteApplication({
                variables: {
                  id: selectedApplication.id
                },
                update: (cache) => {
                  // Update cache to remove the deleted application
                  const existingData = cache.readQuery({
                    query: GET_USER_APPLICATIONS
                  });
                  
                  if (existingData && existingData.applications) {
                    cache.writeQuery({
                      query: GET_USER_APPLICATIONS,
                      data: {
                        applications: existingData.applications.filter(
                          app => app.id !== selectedApplication.id
                        )
                      }
                    });
                  }
                }
              });
              
              setApplicationDetailModalVisible(false);
              setSelectedApplication(null);
            } catch (e) {
              console.error('Error deleting application', e);
              Alert.alert('Error', 'Failed to delete application');
            }
          }
        }
      ]
    );
  };
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };
  
  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center p-4">
        <Text className="text-xl font-bold mb-4">Sign in to access your profile</Text>
        <Text className="text-gray-600 text-center mb-6">
          Create an account or sign in to view your profile, track applications, and more.
        </Text>
        <Button 
          title="Sign In" 
          onPress={() => navigation.navigate('Login' as never)} 
          fullWidth={true}
        />
      </SafeAreaView>
    );
  }
  
  const isLoading = (profileLoading || applicationsLoading) && !refreshing;
  
  // Use mock data if API isn't available yet
  const useMockData = profileError || applicationsError;
  
  // Mock user data - in a real app, this would come from authentication context
  const mockUser = {
    name: user?.name || 'Alex Johnson',
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
  
  // Mock applications data
  const mockApplications = [
    {
      id: "app1",
      status: "submitted",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      resume_url: "https://example.com/resume.pdf",
      cover_letter: "I am excited to apply for this position...",
      job: {
        id: "1",
        title: "Senior React Native Developer",
        company: "Tech Innovations",
        company_logo: "https://via.placeholder.com/100"
      }
    },
    {
      id: "app2",
      status: "interview",
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
      updated_at: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
      resume_url: "https://example.com/resume.pdf",
      cover_letter: "I believe my experience makes me a perfect fit...",
      job: {
        id: "3",
        title: "Full Stack Developer",
        company: "Global Tech",
        company_logo: "https://via.placeholder.com/100"
      }
    },
    {
      id: "app3",
      status: "rejected",
      created_at: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
      updated_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
      resume_url: "https://example.com/resume.pdf",
      cover_letter: null,
      job: {
        id: "5",
        title: "Product Manager",
        company: "Innovate Inc",
        company_logo: "https://via.placeholder.com/100"
      }
    }
  ];
  
  // Get applications data
  const applications = useMockData
    ? mockApplications
    : applicationsData?.applications || [];
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Get status color
  const getStatusColor = (status) => {
    const statusObj = APPLICATION_STATUSES.find(s => s.value === status);
    return statusObj ? statusObj.color : 'text-gray-600';
  };
  
  // Get status label
  const getStatusLabel = (status) => {
    const statusObj = APPLICATION_STATUSES.find(s => s.value === status);
    return statusObj ? statusObj.label : status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-4">
          {/* Profile Header */}
          <View className="bg-white p-4 rounded-lg border border-gray-200 items-center">
            <Image 
              source={{ uri: mockUser.avatar }} 
              className="w-24 h-24 rounded-full"
              style={{ width: 96, height: 96 }} // Fallback styling
            />
            <Text className="text-xl font-bold mt-2">{mockUser.name}</Text>
            <Text className="text-gray-600">{mockUser.title}</Text>
            <Text className="text-gray-500 mt-1">{mockUser.location}</Text>
            
            <View className="flex-row mt-4">
              <Button 
                title="Edit Profile" 
                variant="outline" 
                onPress={() => {}} 
              />
            </View>
          </View>
          
          {/* Applications */}
          <View className="bg-white p-4 rounded-lg border border-gray-200 mt-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-semibold">My Applications</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ResumeBuilder' as never)}>
                <Text className="text-primary">Resume Builder</Text>
              </TouchableOpacity>
            </View>
            
            {isLoading ? (
              <ActivityIndicator size="small" color="#0070f3" style={{ marginVertical: 20 }} />
            ) : applications.length > 0 ? (
              applications.map((application) => (
                <TouchableOpacity 
                  key={application.id} 
                  className="mb-3 pb-3 border-b border-gray-200"
                  onPress={() => {
                    setSelectedApplication(application);
                    setApplicationDetailModalVisible(true);
                  }}
                >
                  <View className="flex-row items-center">
                    {application.job.company_logo && (
                      <Image 
                        source={{ uri: application.job.company_logo }} 
                        className="w-10 h-10 rounded mr-3"
                        style={{ width: 40, height: 40 }} // Fallback styling
                      />
                    )}
                    <View className="flex-1">
                      <Text className="font-medium">{application.job.title}</Text>
                      <Text className="text-gray-600">{application.job.company}</Text>
                    </View>
                  </View>
                  
                  <View className="flex-row justify-between mt-2">
                    <Text className="text-gray-500">
                      Applied on {formatDate(application.created_at)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedApplication(application);
                        setStatusModalVisible(true);
                      }}
                    >
                      <Text className={`font-medium ${getStatusColor(application.status)}`}>
                        {getStatusLabel(application.status)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View className="py-4">
                <Text className="text-gray-500 text-center">No applications yet</Text>
                <TouchableOpacity 
                  className="mt-2" 
                  onPress={() => navigation.navigate('Main' as never)}
                >
                  <Text className="text-primary text-center">Browse Jobs</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          {/* About */}
          <View className="bg-white p-4 rounded-lg border border-gray-200 mt-4">
            <Text className="text-lg font-semibold mb-2">About</Text>
            <Text className="text-gray-700">{mockUser.about}</Text>
          </View>
          
          {/* Skills */}
          <View className="bg-white p-4 rounded-lg border border-gray-200 mt-4">
            <Text className="text-lg font-semibold mb-2">Skills</Text>
            <View className="flex-row flex-wrap">
              {mockUser.skills.map((skill, index) => (
                <View key={index} className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2">
                  <Text className="text-sm">{skill}</Text>
                </View>
              ))}
            </View>
          </View>
          
          {/* Experience */}
          <View className="bg-white p-4 rounded-lg border border-gray-200 mt-4">
            <Text className="text-lg font-semibold mb-2">Experience</Text>
            {mockUser.experience.map((exp) => (
              <View key={exp.id} className="mb-4">
                <Text className="font-medium">{exp.role}</Text>
                <Text className="text-gray-600">{exp.company}</Text>
                <Text className="text-gray-500 text-sm">{exp.duration}</Text>
                <Text className="text-gray-700 mt-1">{exp.description}</Text>
              </View>
            ))}
          </View>
          
          {/* Education */}
          <View className="bg-white p-4 rounded-lg border border-gray-200 mt-4">
            <Text className="text-lg font-semibold mb-2">Education</Text>
            {mockUser.education.map((edu) => (
              <View key={edu.id} className="mb-2">
                <Text className="font-medium">{edu.degree}</Text>
                <Text className="text-gray-600">{edu.institution}</Text>
                <Text className="text-gray-500 text-sm">{edu.year}</Text>
              </View>
            ))}
          </View>
          
          {/* Logout Button */}
          <View className="mt-8 mb-6">
            <Button 
              title="Sign Out" 
              onPress={handleSignOut} 
              variant="outline"
              fullWidth={true}
            />
          </View>
        </View>
      </ScrollView>
      
      {/* Application Status Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={statusModalVisible}
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-xl p-4">
            <Text className="text-lg font-bold text-center mb-4">Update Application Status</Text>
            
            <ScrollView className="max-h-80">
              {APPLICATION_STATUSES.map((status) => (
                <TouchableOpacity
                  key={status.value}
                  className="py-3 border-b border-gray-200"
                  onPress={() => handleStatusUpdate(status.value)}
                  disabled={updateStatusLoading}
                >
                  <Text className={`text-center ${status.color}`}>
                    {status.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              className="mt-4 py-3 bg-gray-100 rounded-lg"
              onPress={() => setStatusModalVisible(false)}
            >
              <Text className="text-center font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Application Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={applicationDetailModalVisible && selectedApplication !== null}
        onRequestClose={() => setApplicationDetailModalVisible(false)}
      >
        <View className="flex-1 bg-white">
          <SafeAreaView className="flex-1">
            <View className="p-4 border-b border-gray-200 flex-row justify-between items-center">
              <TouchableOpacity onPress={() => setApplicationDetailModalVisible(false)}>
                <Text className="text-gray-500">Close</Text>
              </TouchableOpacity>
              <Text className="text-lg font-bold">Application Details</Text>
              <TouchableOpacity onPress={handleDeleteApplication}>
                <Text className="text-red-500">Delete</Text>
              </TouchableOpacity>
            </View>
            
            {selectedApplication && (
              <ScrollView className="flex-1 p-4">
                {/* Job Details */}
                <View className="flex-row items-center mb-4">
                  {selectedApplication.job.company_logo && (
                    <Image 
                      source={{ uri: selectedApplication.job.company_logo }} 
                      className="w-16 h-16 rounded mr-4"
                      style={{ width: 64, height: 64 }} // Fallback styling
                    />
                  )}
                  <View className="flex-1">
                    <Text className="text-xl font-bold">{selectedApplication.job.title}</Text>
                    <Text className="text-gray-600 text-lg">{selectedApplication.job.company}</Text>
                  </View>
                </View>
                
                {/* Application Status */}
                <View className="bg-gray-50 p-4 rounded-lg mb-4">
                  <Text className="text-gray-600 mb-1">Status</Text>
                  <View className="flex-row justify-between items-center">
                    <Text className={`font-medium text-lg ${getStatusColor(selectedApplication.status)}`}>
                      {getStatusLabel(selectedApplication.status)}
                    </Text>
                    <TouchableOpacity
                      className="bg-white px-3 py-1 rounded-lg border border-gray-300"
                      onPress={() => setStatusModalVisible(true)}
                    >
                      <Text className="text-primary">Update</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Application Timeline */}
                <View className="mb-4">
                  <Text className="text-lg font-semibold mb-2">Timeline</Text>
                  <View className="flex-row mb-2">
                    <View className="w-3 h-3 rounded-full bg-green-500 mt-1.5 mr-2" />
                    <View>
                      <Text className="font-medium">Applied</Text>
                      <Text className="text-gray-500">{formatDate(selectedApplication.created_at)}</Text>
                    </View>
                  </View>
                  
                  <View className="flex-row">
                    <View className="w-3 h-3 rounded-full bg-blue-500 mt-1.5 mr-2" />
                    <View>
                      <Text className="font-medium">Last Updated</Text>
                      <Text className="text-gray-500">{formatDate(selectedApplication.updated_at)}</Text>
                    </View>
                  </View>
                </View>
                
                {/* Resume */}
                {selectedApplication.resume_url && (
                  <View className="mb-4">
                    <Text className="text-lg font-semibold mb-2">Resume</Text>
                    <TouchableOpacity className="bg-gray-50 p-3 rounded-lg flex-row items-center">
                      <Text className="text-gray-600 mr-2">📄</Text>
                      <Text className="text-primary flex-1" numberOfLines={1}>
                        {selectedApplication.resume_url}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                {/* Cover Letter */}
                {selectedApplication.cover_letter && (
                  <View className="mb-4">
                    <Text className="text-lg font-semibold mb-2">Cover Letter</Text>
                    <View className="bg-gray-50 p-3 rounded-lg">
                      <Text className="text-gray-700">{selectedApplication.cover_letter}</Text>
                    </View>
                  </View>
                )}
                
                {/* Actions */}
                <View className="mt-4">
                  <Button
                    title="View Job Details"
                    onPress={() => {
                      setApplicationDetailModalVisible(false);
                      navigation.navigate('JobDetail', { jobId: selectedApplication.job.id });
                    }}
                    fullWidth={true}
                  />
                </View>
              </ScrollView>
            )}
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
