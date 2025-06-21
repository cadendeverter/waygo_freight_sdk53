import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getMessaging } from 'firebase/messaging';
import { Platform } from 'react-native';

// Firebase config
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Auth
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

// Initialize Functions
const functions = getFunctions(app);

// Initialize Messaging (web only)
let messaging = null;
if (Platform.OS === 'web') {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.log('Messaging not supported in this environment');
  }
}

// Connect to emulators in development
if (__DEV__) {
  const EMULATOR_HOST = 'localhost';
  
  try {
    connectAuthEmulator(auth, `http://${EMULATOR_HOST}:9099`, { disableWarnings: true });
  } catch (e) {
    // Emulator already connected or not running
  }
  
  try {
    connectFirestoreEmulator(db, EMULATOR_HOST, 8080);
  } catch (e) {
    // Emulator already connected or not running
  }
  
  try {
    connectStorageEmulator(storage, EMULATOR_HOST, 9199);
  } catch (e) {
    // Emulator already connected or not running
  }
  
  try {
    connectFunctionsEmulator(functions, EMULATOR_HOST, 5001);
  } catch (e) {
    // Emulator already connected or not running
  }
}

export { auth, db, storage, functions, messaging };

// Safe database getter function
export const getDb = () => {
  if (!db) {
    throw new Error('Firebase Firestore is not initialized. Please check your Firebase configuration.');
  }
  return db;
};

// Check if Firebase is properly initialized
export const isFirebaseInitialized = () => {
  return !!db && !!auth;
};
