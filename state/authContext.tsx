import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config'; // Import auth from our config to ensure proper initialization
import { AppRole, UserProfile } from '../utils/types';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to safely transform Firestore Timestamps
const transformTimestamp = (timestamp: any): string => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  return new Date().toISOString();
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    // Ensure auth is initialized before setting up listeners
    if (!auth) {
      console.warn('Firebase Auth not initialized yet');
      return;
    }

    let unsubscribe: (() => void) | undefined;

    unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (!fbUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const userDocRef = doc(db, 'usersFreight', fbUser.uid);

      const unsubscribeProfile = onSnapshot(
        userDocRef,
        async (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            const profile: UserProfile = {
              uid: docSnap.id,
              email: userData.email,
              appRole: userData.appRole || 'UNKNOWN',
              displayName: userData.displayName || null,
              phone: userData.phone,
              companyId: userData.companyId,
              createdAt: transformTimestamp(userData.createdAt),
              updatedAt: userData.updatedAt ? transformTimestamp(userData.updatedAt) : undefined,
              fcmToken: userData.fcmToken,
              isAvailable: userData.isAvailable,
              assignedTruckId: userData.assignedTruckId,
              currentLocation: userData.currentLocation,
              currentLocationUpdatedAt: userData.currentLocationUpdatedAt ? transformTimestamp(userData.currentLocationUpdatedAt) : undefined,
              currentLoadId: userData.currentLoadId,
              lastSafetyTrainingCompletedDate: userData.lastSafetyTrainingCompletedDate ? transformTimestamp(userData.lastSafetyTrainingCompletedDate) : undefined,
              referralCode: userData.referralCode,
              referredBy: userData.referredBy,
              referralRewardApplied: userData.referralRewardApplied,
              subscriptionStatus: userData.subscriptionStatus,
              subscriptionTier: userData.subscriptionTier,
              stripeCustomerId: userData.stripeCustomerId,
            };
            setUser(profile);
          } else {
            console.warn(`No profile found for user ${fbUser.uid}. Forcing logout.`);
            await signOut(auth);
            setUser(null);
          }
          setIsLoading(false);
        },
        (error) => {
          console.error('Error listening to user profile:', error);
          setIsLoading(false);
          setUser(null);
        }
      );

      // cleanup profile listener when auth changes
      unsubscribe = () => {
        unsubscribeProfile();
        signOut(auth).catch(() => {});
      };
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      if (!auth) {
        throw new Error('Auth service not initialized');
      }
      await signInWithEmailAndPassword(auth, email, password);
      // The onAuthStateChanged listener will handle the rest
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      if (!auth) {
        throw new Error('Auth service not initialized');
      }
      await signOut(auth);
      // The onAuthStateChanged listener will handle the rest
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
