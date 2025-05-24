import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { contactService } from '../services/contactService';
import Button from '../components/Button';
import { errorTracking } from '../services/errorTracking';
import { useAnalytics } from '../hooks/useAnalytics';
import { RootStackParamList } from '../navigation';

type ContactSharingScreenRouteProp = RouteProp<RootStackParamList, 'ContactSharing'>;

const ContactSharingScreen = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
  
  const route = useRoute<ContactSharingScreenRouteProp>();
  const navigation = useNavigation();
  const analytics = useAnalytics('ContactSharing');
  
  const { jobId, jobTitle, company } = route.params;
  
  // Load contacts on mount
  useEffect(() => {
    const loadContacts = async () => {
      try {
        setLoading(true);
        
        // Check permission status
        const status = await contactService.checkPermissionStatus();
        setPermissionStatus(status);
        
        if (status === 'authorized') {
          // Get contacts
          const allContacts = await contactService.getContactsWithEmails();
          setContacts(allContacts);
          setFilteredContacts(allContacts);
          
          // Track event
          analytics.trackEvent('contacts_loaded', {
            count: allContacts.length
          });
        }
      } catch (error) {
        console.error('Error loading contacts:', error);
        errorTracking.logError(error, {
          context: 'ContactSharingScreen',
          action: 'loadContacts'
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadContacts();
  }, []);
  
  // Filter contacts when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredContacts(contacts);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = contacts.filter(contact => {
      const fullName = `${contact.givenName} ${contact.familyName}`.toLowerCase();
      return fullName.includes(query) || 
        (contact.company && contact.company.toLowerCase().includes(query));
    });
    
    setFilteredContacts(filtered);
  }, [searchQuery, contacts]);
  
  // Handle request permission
  const handleRequestPermission = async () => {
    try {
      const granted = await contactService.requestContactsPermission();
      setPermissionStatus(granted ? 'authorized' : 'denied');
      
      if (granted) {
        // Get contacts
        const allContacts = await contactService.getContactsWithEmails();
        setContacts(allContacts);
        setFilteredContacts(allContacts);
        
        // Track event
        analytics.trackEvent('contacts_permission_granted');
      } else {
        // Track event
        analytics.trackEvent('contacts_permission_denied');
      }
    } catch (error) {
      console.error('Error requesting contacts permission:', error);
      errorTracking.logError(error, {
        context: 'ContactSharingScreen',
        action: 'handleRequestPermission'
      });
    }
  };
  
  // Handle toggle contact selection
  const handleToggleContact = (contactId: string) => {
    setSelectedContacts(prev => {
      if (prev.includes(contactId)) {
        return prev.filter(id => id !== contactId);
      } else {
        return [...prev, contactId];
      }
    });
  };
  
  // Handle share job
  const handleShareJob = async () => {
    try {
      if (selectedContacts.length === 0) {
        Alert.alert('Error', 'Please select at least one contact');
        return;
      }
      
      setLoading(true);
      
      // In a real app, this would share the job with the selected contacts
      // For now, we'll just log it
      console.log(`Sharing job ${jobId} with ${selectedContacts.length} contacts`);
      
      // Track event
      analytics.trackEvent('job_shared_with_contacts', {
        jobId,
        jobTitle,
        company,
        contactCount: selectedContacts.length
      });
      
      // Show success message
      Alert.alert(
        'Job Shared',
        `Job opportunity shared with ${selectedContacts.length} contacts`,
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
    } catch (error) {
      console.error('Error sharing job:', error);
      errorTracking.logError(error, {
        context: 'ContactSharingScreen',
        action: 'handleShareJob',
        jobId,
        selectedContactsCount: selectedContacts.length
      });
      Alert.alert('Error', 'Failed to share job with contacts');
    } finally {
      setLoading(false);
    }
  };
  
  // Render contact item
  const renderContactItem = ({ item }: { item: any }) => {
    const isSelected = selectedContacts.includes(item.recordID);
    const hasEmail = item.emailAddresses && item.emailAddresses.length > 0;
    
    return (
      <TouchableOpacity
        className={`flex-row items-center p-3 border-b border-gray-200 ${isSelected ? 'bg-blue-50' : ''}`}
        onPress={() => handleToggleContact(item.recordID)}
        disabled={!hasEmail}
      >
        <View className={`w-10 h-10 rounded-full bg-gray-200 items-center justify-center mr-3 ${isSelected ? 'bg-blue-500' : ''}`}>
          <Text className={`text-lg ${isSelected ? 'text-white' : 'text-gray-700'}`}>
            {item.givenName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-medium">
            {item.givenName} {item.familyName}
          </Text>
          {item.company ? (
            <Text className="text-sm text-gray-600">{item.company}</Text>
          ) : null}
          {hasEmail ? (
            <Text className="text-sm text-gray-600">{item.emailAddresses[0].email}</Text>
          ) : (
            <Text className="text-sm text-red-500">No email address</Text>
          )}
        </View>
        {isSelected && (
          <View className="w-6 h-6 rounded-full bg-blue-500 items-center justify-center">
            <Text className="text-white">✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  if (permissionStatus !== 'authorized') {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center p-4">
        <Text className="text-5xl mb-4">👥</Text>
        <Text className="text-xl font-bold text-center mb-4">Contact Access Required</Text>
        <Text className="text-gray-600 text-center mb-6">
          To share job opportunities with your contacts, NextGig needs access to your contacts.
        </Text>
        <Button
          title="Grant Access"
          onPress={handleRequestPermission}
          fullWidth={true}
        />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-4 bg-white border-b border-gray-200">
        <Text className="text-xl font-bold mb-2">Share Job Opportunity</Text>
        <Text className="text-gray-700 mb-4">{jobTitle} at {company}</Text>
        
        <TextInput
          className="bg-gray-100 rounded-lg px-4 py-2"
          placeholder="Search contacts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0070f3" />
          <Text className="mt-4 text-gray-600">Loading contacts...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={filteredContacts}
            renderItem={renderContactItem}
            keyExtractor={item => item.recordID}
            ListEmptyComponent={() => (
              <View className="p-4 items-center">
                <Text className="text-gray-600">No contacts found</Text>
              </View>
            )}
          />
          
          <View className="p-4 bg-white border-t border-gray-200">
            <Button
              title={`Share with ${selectedContacts.length} contacts`}
              onPress={handleShareJob}
              disabled={selectedContacts.length === 0 || loading}
              fullWidth={true}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default ContactSharingScreen;
