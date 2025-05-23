import RNCalendarEvents from 'react-native-calendar-events';
import { Platform, Alert } from 'react-native';

// Interface for interview event data
export interface InterviewEvent {
  title: string;
  location?: string;
  notes?: string;
  startDate: Date;
  endDate: Date;
  company: string;
  jobTitle: string;
  applicationId?: string;
}

// Request calendar permissions
export const requestCalendarPermission = async (): Promise<boolean> => {
  try {
    const status = await RNCalendarEvents.requestPermissions();
    return status === 'authorized';
  } catch (error) {
    console.error('Error requesting calendar permission:', error);
    return false;
  }
};

// Check calendar permissions
export const checkCalendarPermission = async (): Promise<boolean> => {
  try {
    const status = await RNCalendarEvents.checkPermissions();
    return status === 'authorized';
  } catch (error) {
    console.error('Error checking calendar permission:', error);
    return false;
  }
};

// Get available calendars
export const getCalendars = async () => {
  try {
    const hasPermission = await checkCalendarPermission();
    if (!hasPermission) {
      const granted = await requestCalendarPermission();
      if (!granted) {
        throw new Error('Calendar permission denied');
      }
    }
    
    return await RNCalendarEvents.findCalendars();
  } catch (error) {
    console.error('Error getting calendars:', error);
    throw error;
  }
};

// Get default calendar ID
export const getDefaultCalendarId = async (): Promise<string> => {
  try {
    const calendars = await getCalendars();
    
    // Find default calendar
    let defaultCalendar;
    
    if (Platform.OS === 'ios') {
      // On iOS, find the default calendar
      defaultCalendar = calendars.find(calendar => calendar.allowsModifications && calendar.type === 'caldav');
      
      // If no default calendar found, use the first one that allows modifications
      if (!defaultCalendar) {
        defaultCalendar = calendars.find(calendar => calendar.allowsModifications);
      }
    } else {
      // On Android, find the default calendar
      defaultCalendar = calendars.find(calendar => calendar.isPrimary);
      
      // If no primary calendar found, use the first one
      if (!defaultCalendar) {
        defaultCalendar = calendars[0];
      }
    }
    
    if (!defaultCalendar) {
      throw new Error('No suitable calendar found');
    }
    
    return defaultCalendar.id;
  } catch (error) {
    console.error('Error getting default calendar:', error);
    throw error;
  }
};

// Add interview event to calendar
export const addInterviewToCalendar = async (interviewData: InterviewEvent): Promise<string> => {
  try {
    const hasPermission = await checkCalendarPermission();
    if (!hasPermission) {
      const granted = await requestCalendarPermission();
      if (!granted) {
        throw new Error('Calendar permission denied');
      }
    }
    
    const calendarId = await getDefaultCalendarId();
    
    // Format event details
    const eventDetails = {
      calendarId,
      title: interviewData.title,
      location: interviewData.location,
      notes: interviewData.notes || `Interview for ${interviewData.jobTitle} position at ${interviewData.company}`,
      startDate: interviewData.startDate.toISOString(),
      endDate: interviewData.endDate.toISOString(),
      alarms: [
        { date: -60 }, // Reminder 1 hour before
        { date: -24 * 60 } // Reminder 1 day before
      ]
    };
    
    // Create event
    const eventId = await RNCalendarEvents.saveEvent(eventDetails.title, eventDetails);
    return eventId;
  } catch (error) {
    console.error('Error adding interview to calendar:', error);
    throw error;
  }
};

// Update interview event in calendar
export const updateInterviewInCalendar = async (eventId: string, interviewData: InterviewEvent): Promise<string> => {
  try {
    const hasPermission = await checkCalendarPermission();
    if (!hasPermission) {
      throw new Error('Calendar permission denied');
    }
    
    // Format event details
    const eventDetails = {
      title: interviewData.title,
      location: interviewData.location,
      notes: interviewData.notes || `Interview for ${interviewData.jobTitle} position at ${interviewData.company}`,
      startDate: interviewData.startDate.toISOString(),
      endDate: interviewData.endDate.toISOString(),
      alarms: [
        { date: -60 }, // Reminder 1 hour before
        { date: -24 * 60 } // Reminder 1 day before
      ]
    };
    
    // Update event
    await RNCalendarEvents.saveEvent(eventDetails.title, {
      id: eventId,
      ...eventDetails
    });
    
    return eventId;
  } catch (error) {
    console.error('Error updating interview in calendar:', error);
    throw error;
  }
};

// Delete interview event from calendar
export const deleteInterviewFromCalendar = async (eventId: string): Promise<boolean> => {
  try {
    const hasPermission = await checkCalendarPermission();
    if (!hasPermission) {
      throw new Error('Calendar permission denied');
    }
    
    await RNCalendarEvents.removeEvent(eventId);
    return true;
  } catch (error) {
    console.error('Error deleting interview from calendar:', error);
    throw error;
  }
};

// Show calendar permission alert
export const showCalendarPermissionAlert = (): void => {
  Alert.alert(
    "Calendar Access Required",
    "To add interview events to your calendar, please grant calendar access in your device settings.",
    [
      { text: "OK" }
    ]
  );
};
