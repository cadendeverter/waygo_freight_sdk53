import { Platform } from 'react-native';

// Types for web fallback
export interface LocationObject {
  coords: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

export interface LocationPermissionResponse {
  status: 'granted' | 'denied' | 'undetermined';
  granted: boolean;
  canAskAgain: boolean;
  expires: 'never' | number;
}

// Platform-specific Location imports and fallbacks
let LocationModule: any = {
  requestForegroundPermissionsAsync: (): Promise<LocationPermissionResponse> => Promise.resolve({ 
    status: 'granted', 
    granted: true, 
    canAskAgain: false, 
    expires: 'never' 
  }),
  requestBackgroundPermissionsAsync: (): Promise<LocationPermissionResponse> => Promise.resolve({ 
    status: 'granted', 
    granted: true, 
    canAskAgain: false, 
    expires: 'never' 
  }),
  getCurrentPositionAsync: (): Promise<LocationObject> => Promise.resolve({
    coords: {
      latitude: 40.7128,
      longitude: -74.0060,
      altitude: 0,
      accuracy: 100,
      altitudeAccuracy: null,
      heading: 0,
      speed: 0,
    },
    timestamp: Date.now(),
  }),
  watchPositionAsync: () => Promise.resolve({
    remove: () => {},
  }),
  startLocationUpdatesAsync: () => Promise.resolve(),
  stopLocationUpdatesAsync: () => Promise.resolve(),
  hasStartedLocationUpdatesAsync: () => Promise.resolve(false),
  reverseGeocodeAsync: () => Promise.resolve([{
    city: 'New York',
    country: 'United States',
    district: null,
    isoCountryCode: 'US',
    name: 'New York',
    postalCode: '10001',
    region: 'NY',
    street: 'Broadway',
    streetNumber: '123',
    subregion: 'Manhattan',
    timezone: 'America/New_York',
  }]),
  geocodeAsync: () => Promise.resolve([{
    latitude: 40.7128,
    longitude: -74.0060,
  }]),
};

let LocationAccuracy = {
  Lowest: 1,
  Low: 2,
  Balanced: 3,
  High: 4,
  Highest: 5,
  BestForNavigation: 6,
};

// Legacy Accuracy export for backward compatibility
let Accuracy = LocationAccuracy;

let LocationActivityType = {
  Other: 1,
  AutomotiveNavigation: 2,
  Fitness: 3,
  OtherNavigation: 4,
  Airborne: 5,
};

if (Platform.OS !== 'web') {
  try {
    const location = require('expo-location');
    LocationModule = location;
    LocationAccuracy = location.LocationAccuracy || LocationAccuracy;
    Accuracy = location.Accuracy || location.LocationAccuracy || Accuracy;
    LocationActivityType = location.LocationActivityType || LocationActivityType;
  } catch (error) {
    console.warn('Expo Location not available on web');
  }
}

// Export individual methods for easier use
export const requestForegroundPermissionsAsync = LocationModule.requestForegroundPermissionsAsync;
export const requestBackgroundPermissionsAsync = LocationModule.requestBackgroundPermissionsAsync;
export const getCurrentPositionAsync = LocationModule.getCurrentPositionAsync;
export const watchPositionAsync = LocationModule.watchPositionAsync;
export const startLocationUpdatesAsync = LocationModule.startLocationUpdatesAsync;
export const stopLocationUpdatesAsync = LocationModule.stopLocationUpdatesAsync;
export const hasStartedLocationUpdatesAsync = LocationModule.hasStartedLocationUpdatesAsync;
export const reverseGeocodeAsync = LocationModule.reverseGeocodeAsync;
export const geocodeAsync = LocationModule.geocodeAsync;

export { LocationAccuracy, LocationActivityType, Accuracy };
export default LocationModule;
