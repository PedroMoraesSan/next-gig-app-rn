import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { calendarService } from '../services/calendarService';
import Button from './Button';
import { errorTracking } from '../services/errorTracking';
import { useAnalytics } from '../hooks/useAnalytics';

interface InterviewSchedulerProps {
  visible: boolean;
  onClose: () => void;
  onSchedule: (eventId: string, startDate: Date, endDate: Date) => void;
  jobTitle: string;
  company: string;
}

const InterviewScheduler: React.FC<InterviewSchedulerProps> = ({
  visible,
  onClose,
  onSchedule,
  jobTitle,
  company
}) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 60 * 60 * 1000)); // 1 hour later
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [calendarPermission, setCalendarPermission] = useState<string | null>(null);
  
  const analytics = useAnalytics('InterviewScheduler');
  
  // Check calendar permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      const status = await calendarService.checkPermissionStatus();
      setCalendarPermission(status);
    };
    
    if (visible) {
      checkPermission();
    }
  }, [visible]);
  
  // Handle start date change
  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    
    if (selectedDate) {
      setStartDate(selectedDate);
      
      // Update end date to be 1 hour after start date
      const newEndDate = new Date(selectedDate.getTime() + 60 * 60 * 1000);
      setEndDate(newEndDate);
    }
  };
  
  // Handle end date change
  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    
    if (selectedDate) {
      // Ensure end date is after start date
      if (selectedDate <= startDate) {
        Alert.alert('Invalid Time', 'End time must be after start time');
        return;
      }
      
      setEndDate(selectedDate);
    }
  };
  
  // Handle request calendar permission
  const handleRequestPermission = async () => {
    try {
      const status = await calendarService.requestCalendarPermission();
      setCalendarPermission(status);
      
      // Track event
      analytics.trackEvent('calendar_permission_request', {
        status
      });
    } catch (error) {
      console.error('Error requesting calendar permission:', error);
      errorTracking.logError(error, {
        context: 'InterviewScheduler',
        action: 'handleRequestPermission'
      });
    }
  };
  
  // Handle schedule interview
  const handleScheduleInterview = async () => {
    try {
      setLoading(true);
      
      // Validate dates
      if (endDate <= startDate) {
        Alert.alert('Invalid Time', 'End time must be after start time');
        return;
      }
      
      // Create calendar event
      const eventId = await calendarService.createInterviewEvent(
        jobTitle,
        company,
        startDate,
        endDate,
        location,
        notes
      );
      
      if (eventId) {
        // Call onSchedule callback
        onSchedule(eventId, startDate, endDate);
        
        // Track event
        analytics.trackEvent('interview_scheduled', {
          jobTitle,
          company,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          hasLocation: !!location.trim(),
          hasNotes: !!notes.trim()
        });
        
        // Close modal
        onClose();
        
        // Show success message
        Alert.alert(
          'Interview Scheduled',
          'The interview has been added to your calendar with reminders.'
        );
      } else {
        throw new Error('Failed to create calendar event');
      }
    } catch (error) {
      console.error('Error scheduling interview:', error);
      errorTracking.logError(error, {
        context: 'InterviewScheduler',
        action: 'handleScheduleInterview',
        jobTitle,
        company
      });
      Alert.alert('Error', 'Failed to schedule interview. Please try again.');
    } finally {
      setLoading(false);
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
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black bg-opacity-50 justify-center items-center p-4">
        <View className="bg-white rounded-lg w-full max-w-md p-6">
          <Text className="text-2xl font-bold mb-4">Schedule Interview</Text>
          
          {calendarPermission === 'denied' ? (
            <View className="mb-6">
              <Text className="text-gray-700 mb-4">
                Calendar access is required to schedule interviews. Please grant calendar permission in your device settings.
              </Text>
              <Button
                title="Request Permission"
                onPress={handleRequestPermission}
                fullWidth={true}
              />
            </View>
          ) : (
            <ScrollView>
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-1">Job</Text>
                <Text className="text-gray-900">{jobTitle}</Text>
              </View>
              
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-1">Company</Text>
                <Text className="text-gray-900">{company}</Text>
              </View>
              
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-1">Date</Text>
                <TouchableOpacity
                  className="border border-gray-300 rounded-lg p-3"
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Text className="text-gray-900">{formatDate(startDate)}</Text>
                </TouchableOpacity>
                {showStartDatePicker && (
                  <DateTimePicker
                    value={startDate}
                    mode="date"
                    display="default"
                    onChange={handleStartDateChange}
                    minimumDate={new Date()}
                  />
                )}
              </View>
              
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-1">Start Time</Text>
                <TouchableOpacity
                  className="border border-gray-300 rounded-lg p-3"
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Text className="text-gray-900">{formatTime(startDate)}</Text>
                </TouchableOpacity>
                {showStartDatePicker && (
                  <DateTimePicker
                    value={startDate}
                    mode="time"
                    display="default"
                    onChange={handleStartDateChange}
                  />
                )}
              </View>
              
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-1">End Time</Text>
                <TouchableOpacity
                  className="border border-gray-300 rounded-lg p-3"
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text className="text-gray-900">{formatTime(endDate)}</Text>
                </TouchableOpacity>
                {showEndDatePicker && (
                  <DateTimePicker
                    value={endDate}
                    mode="time"
                    display="default"
                    onChange={handleEndDateChange}
                    minimumDate={startDate}
                  />
                )}
              </View>
              
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-1">Location (optional)</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-3"
                  placeholder="Enter interview location"
                  value={location}
                  onChangeText={setLocation}
                />
              </View>
              
              <View className="mb-6">
                <Text className="text-gray-700 font-semibold mb-1">Notes (optional)</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-3"
                  placeholder="Add any notes or preparation reminders"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                  style={{ height: 80, textAlignVertical: 'top' }}
                />
              </View>
              
              <View className="flex-row justify-end space-x-3">
                <Button
                  title="Cancel"
                  onPress={onClose}
                  variant="outline"
                  fullWidth={false}
                  disabled={loading}
                />
                <Button
                  title={loading ? "Scheduling..." : "Schedule"}
                  onPress={handleScheduleInterview}
                  fullWidth={false}
                  disabled={loading}
                />
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default InterviewScheduler;
