import { Platform, PermissionsAndroid } from 'react-native';
import RNCalendarEvents from 'react-native-calendar-events';
import { errorTracking } from './errorTracking';

/**
 * Service for handling calendar integration
 */
class CalendarService {
  private isInitialized: boolean = false;
  
  /**
   * Initialize calendar service
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    try {
      // Request calendar permissions
      const authStatus = await this.requestCalendarPermission();
      this.isInitialized = authStatus === 'authorized';
      return this.isInitialized;
    } catch (error) {
      console.error('Error initializing calendar service:', error);
      errorTracking.logError(error, {
        context: 'CalendarService',
        action: 'initialize'
      });
      return false;
    }
  }
  
  /**
   * Request calendar permission
   */
  async requestCalendarPermission(): Promise<string> {
    try {
      // For Android, we need to request permissions manually
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_CALENDAR,
          {
            title: 'Calendar Permission',
            message: 'NextGig needs access to your calendar to schedule interviews and reminders.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK'
          }
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return 'authorized';
        } else {
          return 'denied';
        }
      }
      
      // For iOS, we use the calendar API
      const authStatus = await RNCalendarEvents.requestPermissions();
      return authStatus;
    } catch (error) {
      console.error('Error requesting calendar permission:', error);
      errorTracking.logError(error, {
        context: 'CalendarService',
        action: 'requestCalendarPermission'
      });
      return 'denied';
    }
  }
  
  /**
   * Check calendar permission status
   */
  async checkPermissionStatus(): Promise<string> {
    try {
      const authStatus = await RNCalendarEvents.checkPermissions();
      return authStatus;
    } catch (error) {
      console.error('Error checking calendar permission:', error);
      errorTracking.logError(error, {
        context: 'CalendarService',
        action: 'checkPermissionStatus'
      });
      return 'denied';
    }
  }
  
  /**
   * Get available calendars
   */
  async getCalendars(): Promise<any[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const calendars = await RNCalendarEvents.findCalendars();
      return calendars;
    } catch (error) {
      console.error('Error getting calendars:', error);
      errorTracking.logError(error, {
        context: 'CalendarService',
        action: 'getCalendars'
      });
      return [];
    }
  }
  
  /**
   * Create calendar event
   * @param title Event title
   * @param details Event details
   * @param startDate Start date
   * @param endDate End date
   * @param location Event location
   * @param notes Event notes
   * @param calendarId Calendar ID (optional)
   * @param alarms Event alarms (optional)
   */
  async createEvent(
    title: string,
    details: string,
    startDate: Date,
    endDate: Date,
    location?: string,
    notes?: string,
    calendarId?: string,
    alarms?: { date: number }[]
  ): Promise<string | null> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Calendar service not initialized');
        }
      }
      
      // Get default calendar if not specified
      if (!calendarId) {
        const calendars = await this.getCalendars();
        const defaultCalendar = calendars.find(cal => cal.isPrimary) || calendars[0];
        calendarId = defaultCalendar?.id;
      }
      
      // Default alarms if not specified (30 minutes before)
      if (!alarms) {
        alarms = [{ date: -30 }];
      }
      
      // Create event
      const eventId = await RNCalendarEvents.saveEvent(title, {
        calendarId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        description: details,
        location,
        notes,
        alarms
      });
      
      return eventId;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      errorTracking.logError(error, {
        context: 'CalendarService',
        action: 'createEvent',
        title,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      return null;
    }
  }
  
  /**
   * Create interview event
   * @param jobTitle Job title
   * @param company Company name
   * @param startDate Interview start date
   * @param endDate Interview end date
   * @param location Interview location
   * @param notes Interview notes
   */
  async createInterviewEvent(
    jobTitle: string,
    company: string,
    startDate: Date,
    endDate: Date,
    location?: string,
    notes?: string
  ): Promise<string | null> {
    const title = `Interview: ${jobTitle} at ${company}`;
    const details = `Job interview for ${jobTitle} position at ${company}`;
    
    // Add preparation reminder 1 day before
    const alarms = [
      { date: -30 }, // 30 minutes before
      { date: -60 * 24 } // 1 day before
    ];
    
    return this.createEvent(
      title,
      details,
      startDate,
      endDate,
      location,
      notes,
      undefined,
      alarms
    );
  }
  
  /**
   * Create application deadline reminder
   * @param jobTitle Job title
   * @param company Company name
   * @param deadline Application deadline
   */
  async createDeadlineReminder(
    jobTitle: string,
    company: string,
    deadline: Date
  ): Promise<string | null> {
    const title = `Deadline: ${jobTitle} at ${company}`;
    const details = `Application deadline for ${jobTitle} position at ${company}`;
    
    // Set end date to 30 minutes after start
    const endDate = new Date(deadline.getTime() + 30 * 60000);
    
    // Add reminders 1 day and 3 days before
    const alarms = [
      { date: 0 }, // At time of event
      { date: -60 * 24 }, // 1 day before
      { date: -60 * 24 * 3 } // 3 days before
    ];
    
    return this.createEvent(
      title,
      details,
      deadline,
      endDate,
      undefined,
      'Don\'t forget to submit your application!',
      undefined,
      alarms
    );
  }
  
  /**
   * Get events between dates
   * @param startDate Start date
   * @param endDate End date
   */
  async getEvents(startDate: Date, endDate: Date): Promise<any[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const events = await RNCalendarEvents.fetchAllEvents(
        startDate.toISOString(),
        endDate.toISOString()
      );
      
      return events;
    } catch (error) {
      console.error('Error getting events:', error);
      errorTracking.logError(error, {
        context: 'CalendarService',
        action: 'getEvents',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      return [];
    }
  }
  
  /**
   * Delete event
   * @param eventId Event ID
   */
  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      await RNCalendarEvents.removeEvent(eventId);
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      errorTracking.logError(error, {
        context: 'CalendarService',
        action: 'deleteEvent',
        eventId
      });
      return false;
    }
  }
}

export const calendarService = new CalendarService();
