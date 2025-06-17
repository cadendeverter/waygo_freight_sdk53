import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getMessaging, isSupported } from 'firebase/messaging';
import { Platform } from 'react-native';

// Global type declarations for Firebase singleton
declare global {
  var firebaseApp: any;
  var firebaseAuth: any;
}

// Debug logging
const DEBUG_FIREBASE = true;

const log = (message: string, ...args: any[]) => {
  if (DEBUG_FIREBASE) {
    console.log(`[Firebase Config] ${message}`, ...args);
  }
};

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

log('Firebase config loaded:', {
  hasApiKey: !!firebaseConfig.apiKey,
  platform: Platform.OS,
  projectId: firebaseConfig.projectId
});

// Initialize Firebase services
let app: any;
let auth: any;
let db: any;
let storage: any;
let messaging: any | null = null;
let functions: any;

// Singleton pattern for Expo SDK 53 compatibility
if (!global.firebaseApp) {
  try {
    log('Initializing Firebase app...');
    app = initializeApp(firebaseConfig);
    global.firebaseApp = app;
    log('Firebase app initialized successfully');
  } catch (error: any) {
    if (error.code === 'app/duplicate-app') {
      app = getApp();
      global.firebaseApp = app;
      log('Using existing Firebase app');
    } else {
      throw error;
    }
  }
} else {
  app = global.firebaseApp;
  log('Using existing Firebase app from global');
}

// Initialize Auth with Expo SDK 53 compatible approach
if (!global.firebaseAuth) {
  try {
    log(`Initializing Firebase Auth for platform: ${Platform.OS}`);
    // Use simple getAuth for Expo SDK 53 - persistence issues will be handled differently
    auth = getAuth(app);
    global.firebaseAuth = auth;
    log('Firebase Auth initialized successfully');
  } catch (error: any) {
    log('Firebase Auth initialization failed:', error.message);
    throw error;
  }
} else {
  auth = global.firebaseAuth;
  log('Using existing Firebase Auth from global');
}

// Initialize other services
try {
  // Initialize Firestore
  log('Initializing Firestore...');
  db = getFirestore(app);
  log('Firestore initialized successfully');
  
  // Initialize Storage
  log('Initializing Storage...');
  storage = getStorage(app);
  log('Storage initialized successfully');
  
  // Initialize Functions
  log('Initializing Functions...');
  functions = getFunctions(app);
  log('Functions initialized successfully');
  
  // Initialize Messaging (web only)
  if (Platform.OS === 'web') {
    isSupported().then((supported) => {
      if (supported) {
        messaging = getMessaging(app);
        log('Messaging initialized successfully');
      }
    });
  }
  
  // Connect to emulators in development
  if (__DEV__) {
    const EMULATOR_HOST = 'localhost';
    
    try {
      connectAuthEmulator(auth, `http://${EMULATOR_HOST}:9099`, { disableWarnings: true });
      log('Connected to Auth emulator');
    } catch (e) {
      // Emulator already connected or not running
    }
    
    try {
      connectFirestoreEmulator(db, EMULATOR_HOST, 8080);
      log('Connected to Firestore emulator');
    } catch (e) {
      // Emulator already connected or not running
    }
    
    try {
      connectStorageEmulator(storage, EMULATOR_HOST, 9199);
      log('Connected to Storage emulator');
    } catch (e) {
      // Emulator already connected or not running
    }
    
    try {
      connectFunctionsEmulator(functions, EMULATOR_HOST, 5001);
      log('Connected to Functions emulator');
    } catch (e) {
      // Emulator already connected or not running
    }
  }
  
} catch (error: any) {
  log('Firebase initialization failed:', error);
  throw error;
}

// Export the configured Firebase services
export { app, auth, db, storage, messaging, functions };
export default app;
