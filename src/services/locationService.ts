import Geolocation from '@react-native-community/geolocation';
import { Platform, PermissionsAndroid, Alert } from 'react-native';

// Interface for location data
export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
}

// Request location permissions for Android
const requestAndroidLocationPermission = async (): Promise<boolean> => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location Permission",
        message: "NextGig needs access to your location to find jobs near you.",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK"
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.error('Error requesting location permission:', err);
    return false;
  }
};

// Get current location
export const getCurrentLocation = (): Promise<LocationData> => {
  return new Promise(async (resolve, reject) => {
    // Check permissions on Android
    if (Platform.OS === 'android') {
      const hasPermission = await requestAndroidLocationPermission();
      if (!hasPermission) {
        reject(new Error('Location permission denied'));
        return;
      }
    }

    // Configure geolocation
    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: 'whenInUse',
    });

    // Get current position
    Geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Get city and state from coordinates using reverse geocoding
          const locationDetails = await reverseGeocode(latitude, longitude);
          
          resolve({
            latitude,
            longitude,
            ...locationDetails
          });
        } catch (error) {
          // If reverse geocoding fails, still return coordinates
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        }
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  });
};

// Reverse geocode coordinates to get city, state, country
const reverseGeocode = async (latitude: number, longitude: number): Promise<Partial<LocationData>> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding API error');
    }
    
    const data = await response.json();
    
    return {
      city: data.address.city || data.address.town || data.address.village || data.address.hamlet,
      state: data.address.state,
      country: data.address.country
    };
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return {};
  }
};

// Get distance between two coordinates in kilometers
export const getDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
};

// Convert degrees to radians
const deg2rad = (deg: number): number => {
  return deg * (Math.PI/180);
};

// Format distance for display
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${Math.round(distance)} km`;
};

// Check if location services are enabled
export const checkLocationServices = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    Geolocation.getCurrentPosition(
      () => resolve(true),
      () => resolve(false),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 10000 }
    );
  });
};

// Show location services alert
export const showLocationServicesAlert = (): void => {
  Alert.alert(
    "Location Services Disabled",
    "Please enable location services to find jobs near you.",
    [
      { text: "OK" }
    ]
  );
};

// Get nearby jobs based on user location
export const getNearbyJobs = async (
  latitude: number, 
  longitude: number, 
  radius: number = 50 // Default radius in kilometers
): Promise<any> => {
  // This would typically call your GraphQL API with location parameters
  // For now, we'll return a mock implementation
  
  // In a real implementation, you would:
  // 1. Call your GraphQL API with the location parameters
  // 2. Filter jobs based on distance
  // 3. Return the filtered jobs
  
  console.log(`Getting jobs near ${latitude}, ${longitude} within ${radius}km`);
  
  // Mock implementation - in a real app, replace with actual API call
  return {
    jobs: [
      {
        id: '1',
        title: 'Senior React Native Developer',
        company: 'Tech Innovations',
        location: 'Remote',
        distance: 0
      },
      {
        id: '2',
        title: 'UX/UI Designer',
        company: 'Creative Solutions',
        location: 'New York, NY',
        distance: 5.2
      }
    ]
  };
};
