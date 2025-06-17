import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  User as FirebaseUser,
  UserCredential,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  updateEmail as firebaseUpdateEmail,
  updatePassword as firebaseUpdatePassword,
  sendEmailVerification as firebaseSendEmailVerification,
  Auth,
  AuthError
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs, 
  Firestore,
  DocumentData,
  QueryDocumentSnapshot,
  DocumentSnapshot,
  DocumentReference,
  Query,
  QueryConstraint,
  QuerySnapshot
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, FirebaseStorage } from 'firebase/storage';
import { getFunctions, httpsCallable, Functions } from 'firebase/functions';


import { UserProfile, Company } from '../../utils/types';

// Shared Firebase instances
import { app, auth, db, storage, functions } from '../../firebase/config';

// Emulator helper (optional)
const connectToEmulators = () => {
  try {
    // Only import these in development
    const { connectAuthEmulator } = require('firebase/auth');
    const { connectFirestoreEmulator } = require('firebase/firestore');
    const { connectStorageEmulator } = require('firebase/storage');
    const { connectFunctionsEmulator } = require('firebase/functions');

    // Connect to emulators
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    connectFunctionsEmulator(functions, 'localhost', 5001);
    
    console.log('Connected to Firebase emulators');
  } catch (error) {
    console.warn('Could not connect to Firebase emulators:', error);
  }
};


// Auth Service
const authService = {
  // Auth instance for direct access
  authInstance: auth,

  // Sign in with email and password
  signIn: async (email: string, password: string): Promise<UserCredential> => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Sign in error:', error);
      throw mapAuthError(error as AuthError);
    }
  },

  // Sign up with email and password
  signUp: async (email: string, password: string, userData: Partial<UserProfile>): Promise<UserCredential> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      const userDoc = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDoc, {
        ...userData,
        email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      return userCredential;
    } catch (error) {
      console.error('Sign up error:', error);
      throw mapAuthError(error as AuthError);
    }
  },

  // Sign out
  signOut: async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  // Send password reset email
  sendPasswordResetEmail: async (email: string): Promise<void> => {
    try {
      await firebaseSendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset email error:', error);
      throw mapAuthError(error as AuthError);
    }
  },

  // Update user profile
  updateProfile: async (userId: string, data: Partial<UserProfile>): Promise<void> => {
    try {
      const userDoc = doc(db, 'users', userId);
      await updateDoc(userDoc, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  // Update email
  updateEmail: async (newEmail: string): Promise<void> => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user is signed in');
      
      await firebaseUpdateEmail(user, newEmail);
      
      // Update email in Firestore
      const userDoc = doc(db, 'users', user.uid);
      await updateDoc(userDoc, {
        email: newEmail,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Update email error:', error);
      throw mapAuthError(error as AuthError);
    }
  },

  // Update password
  updatePassword: async (newPassword: string): Promise<void> => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user is signed in');
      
      await firebaseUpdatePassword(user, newPassword);
    } catch (error) {
      console.error('Update password error:', error);
      throw mapAuthError(error as AuthError);
    }
  },

  // Send email verification
  sendEmailVerification: async (): Promise<void> => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user is signed in');
      
      await firebaseSendEmailVerification(user);
    } catch (error) {
      console.error('Send email verification error:', error);
      throw mapAuthError(error as AuthError);
    }
  },

  // Get current user
  getCurrentUser: (): FirebaseUser | null => {
    return auth.currentUser;
  },

  // Get user profile
  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return null;
      
      return {
        uid: userDoc.id,
        ...userDoc.data(),
      } as UserProfile;
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  },

  // Get company by ID
  getCompany: async (companyId: string): Promise<Company | null> => {
    try {
      const companyDoc = await getDoc(doc(db, 'companies', companyId));
      if (!companyDoc.exists()) return null;
      
      return {
        id: companyDoc.id,
        ...companyDoc.data(),
      } as Company;
    } catch (error) {
      console.error('Get company error:', error);
      throw error;
    }
  },
};

// Firestore Service
const firestoreService = {
  // Generic document operations
  getDocument: async <T>(collectionName: string, docId: string): Promise<T | null> => {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return null;
      
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as T;
    } catch (error) {
      console.error(`Error getting document ${docId} from ${collectionName}:`, error);
      throw error;
    }
  },

  setDocument: async <T>(
    collectionName: string, 
    docId: string, 
    data: Partial<T>,
    merge = true
  ): Promise<void> => {
    try {
      const docRef = doc(db, collectionName, docId);
      await setDoc(
        docRef,
        {
          ...data,
          updatedAt: new Date().toISOString(),
        },
        { merge }
      );
    } catch (error) {
      console.error(`Error setting document ${docId} in ${collectionName}:`, error);
      throw error;
    }
  },

  updateDocument: async <T>(
    collectionName: string, 
    docId: string, 
    data: Partial<T>
  ): Promise<void> => {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`Error updating document ${docId} in ${collectionName}:`, error);
      throw error;
    }
  },

  deleteDocument: async (collectionName: string, docId: string): Promise<void> => {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document ${docId} from ${collectionName}:`, error);
      throw error;
    }
  },

  // Query operations
  query: async <T>(
    collectionName: string,
    ...queryConstraints: QueryConstraint[]
  ): Promise<T[]> => {
    try {
      const q = query(collection(db, collectionName), ...queryConstraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (error) {
      console.error(`Error querying collection ${collectionName}:`, error);
      throw error;
    }
  },

  // Collection operations
  getCollection: async <T>(collectionName: string): Promise<T[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (error) {
      console.error(`Error getting collection ${collectionName}:`, error);
      throw error;
    }
  },
};

// Storage Service
const storageService = {
  // Upload file
  uploadFile: async (
    path: string, 
    file: Blob | Uint8Array | ArrayBuffer,
    metadata?: any
  ): Promise<string> => {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  // Get download URL
  getDownloadURL: async (path: string): Promise<string> => {
    try {
      const fileRef = ref(storage, path);
      return await getDownloadURL(fileRef);
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw error;
    }
  },

  // Delete file
  deleteFile: async (path: string): Promise<void> => {
    try {
      const fileRef = ref(storage, path);
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },
};

// Cloud Functions Service
const functionsService = {
  // Call a callable function
  call: async <T = any, R = any>(functionName: string, data?: T): Promise<R> => {
    try {
      const functionRef = httpsCallable<T, R>(functions, functionName);
      const result = await functionRef(data);
      return result.data;
    } catch (error) {
      console.error(`Error calling function ${functionName}:`, error);
      throw error;
    }
  },
};

// Helper function to map Firebase Auth errors to user-friendly messages
const mapAuthError = (error: AuthError): Error => {
  switch (error.code) {
    case 'auth/invalid-email':
      return new Error('The email address is not valid.');
    case 'auth/user-disabled':
      return new Error('This user account has been disabled.');
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return new Error('The email or password is incorrect.');
    case 'auth/email-already-in-use':
      return new Error('This email is already in use by another account.');
    case 'auth/operation-not-allowed':
      return new Error('This operation is not allowed.');
    case 'auth/weak-password':
      return new Error('The password is too weak.');
    case 'auth/too-many-requests':
      return new Error('Too many unsuccessful login attempts. Please try again later.');
    case 'auth/requires-recent-login':
      return new Error('Please sign in again to update your email or password.');
    default:
      return new Error(error.message || 'An error occurred during authentication.');
  }
};

export {
  auth as authInstance,
  db as firestore,
  storage,
  functions,
  authService,
  firestoreService,
  storageService,
  functionsService,
};
