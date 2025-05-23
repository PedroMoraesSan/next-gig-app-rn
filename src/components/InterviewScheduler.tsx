import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  Platform, 
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Button from './Button';
import { 
  addInterviewToCalendar, 
  checkCalendarPermission, 
  requestCalendarPermission,
  showCalendarPermissionAlert,
  InterviewEvent
} from '../services/calendarService';

interface InterviewSchedulerProps {
  visible: boolean;
  onClose: () => void;
  onSchedule: (eventId: string, startDate: Date, endDate: Date) => void;
  jobTitle: string;
  company: string;
  applicationId?: string;
}

export default function InterviewScheduler({
  visible,
  onClose,
  onSchedule,
  jobTitle,
  company,
  applicationId
}: InterviewSchedulerProps) {
  const [title, setTitle] = useState(`Interview: ${jobTitle} at ${company}`);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().getTime() + 60 * 60 * 1000)); // 1 hour later
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(true);
  
  // Check calendar permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      setCheckingPermission(true);
      const permission = await checkCalendarPermission();
      setHasPermission(permission);
      setCheckingPermission(false);
    };
    
    if (visible) {
      checkPermission();
      // Reset form when modal opens
      setTitle(`Interview: ${jobTitle} at ${company}`);
      setLocation('');
      setNotes('');
      setStartDate(new Date());
      setEndDate(new Date(new Date().getTime() + 60 * 60 * 1000));
    }
  }, [visible, jobTitle, company]);
  
  // Request calendar permission
  const handleRequestPermission = async () => {
    const granted = await requestCalendarPermission();
    setHasPermission(granted);
    
    if (!granted) {
      showCalendarPermissionAlert();
    }
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Handle start date change
  const onStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
      
      // If end date is before start date, update end date
      if (endDate < selectedDate) {
        const newEndDate = new Date(selectedDate.getTime() + 60 * 60 * 1000); // 1 hour later
        setEndDate(newEndDate);
      }
    }
  };
  
  // Handle end date change
  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      // Ensure end date is after start date
      if (selectedDate > startDate) {
        setEndDate(selectedDate);
      } else {
        Alert.alert('Invalid Time', 'End time must be after start time');
      }
    }
  };
  
  // Handle schedule interview
  const handleScheduleInterview = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for the interview');
      return;
    }
    
    setLoading(true);
    try {
      // Create interview event data
      const interviewData: InterviewEvent = {
        title,
        location,
        notes,
        startDate,
        endDate,
        company,
        jobTitle,
        applicationId
      };
      
      // Add interview to calendar
      const eventId = await addInterviewToCalendar(interviewData);
      
      // Call onSchedule callback
      onSchedule(eventId, startDate, endDate);
      
      // Close modal
      onClose();
      
      // Show success message
      Alert.alert('Success', 'Interview scheduled and added to your calendar');
    } catch (error) {
      console.error('Error scheduling interview:', error);
      Alert.alert('Error', 'Failed to schedule interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black bg-opacity-50 justify-end">
        <View className="bg-white rounded-t-xl max-h-[90%]">
          <View className="p-4 border-b border-gray-200 flex-row justify-between items-center">
            <TouchableOpacity onPress={onClose}>
              <Text className="text-gray-500">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-bold">Schedule Interview</Text>
            <View style={{ width: 50 }} />
          </View>
          
          <ScrollView className="p-4">
            {checkingPermission ? (
              <ActivityIndicator size="small" color="#0070f3" style={{ marginVertical: 20 }} />
            ) : !hasPermission ? (
              <View className="items-center py-4">
                <Text className="text-center text-gray-600 mb-4">
                  Calendar access is required to schedule interviews
                </Text>
                <Button
                  title="Grant Calendar Access"
                  onPress={handleRequestPermission}
                  fullWidth={true}
                />
              </View>
            ) : (
              <>
                {/* Title */}
                <View className="mb-4">
                  <Text className="text-gray-600 mb-2">Title</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg p-3"
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Interview Title"
                  />
                </View>
                
                {/* Location */}
                <View className="mb-4">
                  <Text className="text-gray-600 mb-2">Location (Optional)</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg p-3"
                    value={location}
                    onChangeText={setLocation}
                    placeholder="Office address or video call link"
                  />
                </View>
                
                {/* Start Date/Time */}
                <View className="mb-4">
                  <Text className="text-gray-600 mb-2">Start Date & Time</Text>
                  <TouchableOpacity
                    className="border border-gray-300 rounded-lg p-3"
                    onPress={() => setShowStartDatePicker(true)}
                  >
                    <Text>{formatDate(startDate)} at {formatTime(startDate)}</Text>
                  </TouchableOpacity>
                  
                  {showStartDatePicker && (
                    <DateTimePicker
                      value={startDate}
                      mode="datetime"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={onStartDateChange}
                      minimumDate={new Date()}
                    />
                  )}
                </View>
                
                {/* End Date/Time */}
                <View className="mb-4">
                  <Text className="text-gray-600 mb-2">End Date & Time</Text>
                  <TouchableOpacity
                    className="border border-gray-300 rounded-lg p-3"
                    onPress={() => setShowEndDatePicker(true)}
                  >
                    <Text>{formatDate(endDate)} at {formatTime(endDate)}</Text>
                  </TouchableOpacity>
                  
                  {showEndDatePicker && (
                    <DateTimePicker
                      value={endDate}
                      mode="datetime"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={onEndDateChange}
                      minimumDate={startDate}
                    />
                  )}
                </View>
                
                {/* Notes */}
                <View className="mb-4">
                  <Text className="text-gray-600 mb-2">Notes (Optional)</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg p-3 min-h-[100px]"
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Add any notes or preparation details"
                    multiline
                    textAlignVertical="top"
                  />
                </View>
              </>
            )}
          </ScrollView>
          
          <View className="p-4 border-t border-gray-200">
            <Button
              title={loading ? "Scheduling..." : "Schedule Interview"}
              onPress={handleScheduleInterview}
              disabled={loading || !hasPermission}
              loading={loading}
              fullWidth={true}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
