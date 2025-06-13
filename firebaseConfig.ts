// Firebase configuration
// This file is generated from environment variables for security

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const FIREBASE_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Environment check
export const IS_DEVELOPMENT = process.env.EXPO_PUBLIC_APP_ENV === 'development';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  COMPANIES: 'companies',
  SHIPMENTS: 'shipments',
  VEHICLES: 'vehicles',
  DRIVERS: 'drivers',
  EXPENSES: 'expenses',
  DOCUMENTS: 'documents',
  MAINTENANCE: 'maintenance',
  NOTIFICATIONS: 'notifications',
  SETTINGS: 'settings',
};

// Storage paths
export const STORAGE_PATHS = {
  USER_AVATARS: 'user-avatars',
  VEHICLE_IMAGES: 'vehicle-images',
  DOCUMENTS: 'documents',
  SHIPMENT_DOCS: 'shipment-docs',
  EXPENSE_RECEIPTS: 'expense-receipts',
};

// Default settings
export const DEFAULT_SETTINGS = {
  CURRENCY: 'USD',
  DISTANCE_UNIT: 'miles',
  WEIGHT_UNIT: 'lbs',
  DATE_FORMAT: 'MM/dd/yyyy',
  TIME_FORMAT: 'hh:mm a',
  TIMEZONE: 'America/Chicago',
};

// Default pagination
// ... rest of the file remains the same ...

export const PAGINATION_LIMIT = 20;

export default {
  FIREBASE_CONFIG,
  IS_DEVELOPMENT,
  COLLECTIONS,
  STORAGE_PATHS,
  DEFAULT_SETTINGS,
  PAGINATION_LIMIT,
};
