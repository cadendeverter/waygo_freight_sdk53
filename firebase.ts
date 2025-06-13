import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth,
  setPersistence,
  browserLocalPersistence,
  inMemoryPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { 
  getFirestore, 
  enableIndexedDbPersistence,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let app;
let auth;
let db;
let storage;

if (getApps().length === 0) {
  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    
    // Initialize Auth with persistence
    if (Platform.OS === 'web') {
      auth = initializeAuth(app, {
        persistence: [
          browserLocalPersistence,
          browserSessionPersistence,
          inMemoryPersistence
        ]
      });
    } else {
      auth = initializeAuth(app);
    }
    
    // Initialize Firestore with persistence
    if (Platform.OS === 'web') {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      });
    } else {
      db = getFirestore(app);
      // Enable offline persistence for mobile
      enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn("Multiple tabs open, persistence can only be enabled in one tab at a time.");
        } else if (err.code === 'unimplemented') {
          console.warn("The current browser does not support all of the features required to enable persistence");
        }
      });
    }
    
    // Initialize Storage
    storage = getStorage(app);
    
  } catch (error) {
    console.error("Firebase initialization error", error);
  }
} else {
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

// Export the Firebase services
export { app, auth, db, storage };

// Type definitions for our data models
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  role: 'admin' | 'dispatcher' | 'driver' | 'warehouse';
  companyId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  origin: {
    name: string;
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  destination: {
    name: string;
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  pickupDate: Date;
  deliveryDate?: Date;
  driverId?: string;
  dispatcherId: string;
  vehicleId?: string;
  documents?: Array<{
    name: string;
    url: string;
    type: string;
    uploadedAt: Date;
  }>;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  status: 'available' | 'in_use' | 'maintenance';
  currentDriverId?: string;
  lastInspectionDate?: Date;
  nextInspectionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Helper functions
export const formatDate = (date: Date | string): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: Date | string): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
