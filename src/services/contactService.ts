import { Platform, PermissionsAndroid } from 'react-native';
import Contacts from 'react-native-contacts';
import { errorTracking } from './errorTracking';
import { useAnalytics } from '../hooks/useAnalytics';

/**
 * Service for handling contact operations
 */
class ContactService {
  private isInitialized: boolean = false;
  
  /**
   * Initialize contact service
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    try {
      // Request contacts permission
      const permissionGranted = await this.requestContactsPermission();
      this.isInitialized = permissionGranted;
      return permissionGranted;
    } catch (error) {
      console.error('Error initializing contact service:', error);
      errorTracking.logError(error, {
        context: 'ContactService',
        action: 'initialize'
      });
      return false;
    }
  }
  
  /**
   * Request contacts permission
   */
  async requestContactsPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
          {
            title: 'Contacts Permission',
            message: 'NextGig needs access to your contacts to share job opportunities.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK'
          }
        );
        
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const permission = await Contacts.requestPermission();
        return permission === 'authorized';
      }
    } catch (error) {
      console.error('Error requesting contacts permission:', error);
      errorTracking.logError(error, {
        context: 'ContactService',
        action: 'requestContactsPermission'
      });
      return false;
    }
  }
  
  /**
   * Check contacts permission status
   */
  async checkPermissionStatus(): Promise<string> {
    try {
      return await Contacts.checkPermission();
    } catch (error) {
      console.error('Error checking contacts permission:', error);
      errorTracking.logError(error, {
        context: 'ContactService',
        action: 'checkPermissionStatus'
      });
      return 'denied';
    }
  }
  
  /**
   * Get all contacts
   */
  async getAllContacts(): Promise<any[]> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Contact service not initialized');
        }
      }
      
      const contacts = await Contacts.getAll();
      return contacts;
    } catch (error) {
      console.error('Error getting contacts:', error);
      errorTracking.logError(error, {
        context: 'ContactService',
        action: 'getAllContacts'
      });
      return [];
    }
  }
  
  /**
   * Get contacts with phone numbers
   */
  async getContactsWithPhoneNumbers(): Promise<any[]> {
    try {
      const contacts = await this.getAllContacts();
      return contacts.filter(contact => 
        contact.phoneNumbers && contact.phoneNumbers.length > 0
      );
    } catch (error) {
      console.error('Error getting contacts with phone numbers:', error);
      errorTracking.logError(error, {
        context: 'ContactService',
        action: 'getContactsWithPhoneNumbers'
      });
      return [];
    }
  }
  
  /**
   * Get contacts with emails
   */
  async getContactsWithEmails(): Promise<any[]> {
    try {
      const contacts = await this.getAllContacts();
      return contacts.filter(contact => 
        contact.emailAddresses && contact.emailAddresses.length > 0
      );
    } catch (error) {
      console.error('Error getting contacts with emails:', error);
      errorTracking.logError(error, {
        context: 'ContactService',
        action: 'getContactsWithEmails'
      });
      return [];
    }
  }
  
  /**
   * Search contacts
   */
  async searchContacts(searchString: string): Promise<any[]> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Contact service not initialized');
        }
      }
      
      const contacts = await Contacts.getContactsMatchingString(searchString);
      return contacts;
    } catch (error) {
      console.error('Error searching contacts:', error);
      errorTracking.logError(error, {
        context: 'ContactService',
        action: 'searchContacts',
        searchString
      });
      return [];
    }
  }
  
  /**
   * Create a new contact
   */
  async createContact(contact: any): Promise<any> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Contact service not initialized');
        }
      }
      
      const newContact = await Contacts.addContact(contact);
      return newContact;
    } catch (error) {
      console.error('Error creating contact:', error);
      errorTracking.logError(error, {
        context: 'ContactService',
        action: 'createContact'
      });
      throw error;
    }
  }
  
  /**
   * Create a contact from a job recruiter
   */
  async createRecruiterContact(
    firstName: string,
    lastName: string,
    company: string,
    jobTitle: string,
    phoneNumber?: string,
    email?: string
  ): Promise<any> {
    try {
      const contact = {
        givenName: firstName,
        familyName: lastName,
        company,
        jobTitle,
        phoneNumbers: phoneNumber ? [{
          label: 'work',
          number: phoneNumber
        }] : [],
        emailAddresses: email ? [{
          label: 'work',
          email: email
        }] : []
      };
      
      const newContact = await this.createContact(contact);
      return newContact;
    } catch (error) {
      console.error('Error creating recruiter contact:', error);
      errorTracking.logError(error, {
        context: 'ContactService',
        action: 'createRecruiterContact',
        firstName,
        lastName,
        company
      });
      throw error;
    }
  }
  
  /**
   * Share job via contact
   */
  async shareJobViaContact(
    contactId: string,
    jobId: string,
    jobTitle: string,
    company: string,
    jobUrl: string
  ): Promise<boolean> {
    try {
      // In a real app, this would send a message or email to the contact
      // For now, we'll just log it
      console.log(`Sharing job ${jobId} (${jobTitle} at ${company}) with contact ${contactId}`);
      
      // Track analytics
      const analytics = useAnalytics('ContactService');
      analytics.trackEvent('share_job_via_contact', {
        jobId,
        jobTitle,
        company
      });
      
      return true;
    } catch (error) {
      console.error('Error sharing job via contact:', error);
      errorTracking.logError(error, {
        context: 'ContactService',
        action: 'shareJobViaContact',
        contactId,
        jobId
      });
      return false;
    }
  }
}

export const contactService = new ContactService();
