import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { auth, getDb, isFirebaseInitialized } from '../firebase/config';
import { User } from '../types';
import { config, DEV_CREDENTIALS, shouldEnableFeature } from '../config/environment';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDevMode: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  loginDev: (role: keyof typeof DEV_CREDENTIALS) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to safely transform Firestore Timestamps
const transformTimestamp = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  return new Date();
};

// Create dev user profile
const createDevUserProfile = (role: keyof typeof DEV_CREDENTIALS): User => {
  const devCred = DEV_CREDENTIALS[role];
  return {
    id: `dev-${role}-${Date.now()}`,
    email: devCred.email,
    firstName: devCred.name.split(' ')[0],
    lastName: devCred.name.split(' ')[1] || '',
    appRole: devCred.role,
    phone: '555-0000',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    companyId: 'dev-company',
    permissions: getDefaultPermissions(devCred.role, devCred.isDevAdmin),
    isDevAdmin: devCred.isDevAdmin || false, // Track if this is a dev admin
  };
};

// Get default permissions based on role
const getDefaultPermissions = (role: string, isDevAdmin: boolean = false): string[] => {
  // Dev admins get ALL possible permissions for testing
  if (isDevAdmin && role === 'admin') {
    return [
      'all', // Global admin access
      // Feature-specific permissions
      'fleet_management', 'driver_interface', 'dispatch_routing', 
      'compliance_safety', 'warehouse_inventory', 'finance_billing',
      'customer_portal', 'analytics_reporting', 'admin_permissions', 
      'integrations', 'system_health', 'user_management',
      // CRUD permissions
      'create', 'read', 'update', 'delete',
      // Module permissions
      'loads', 'drivers', 'vehicles', 'dispatch', 'inventory', 
      'receiving', 'shipping', 'tracking', 'documents', 'messages',
      'billing', 'analytics', 'reports', 'settings', 'logs',
      // Dev-specific permissions
      'dev_tools', 'sample_data', 'debug_mode', 'test_features'
    ];
  }
  
  switch (role) {
    case 'admin':
      return [
        'all', 'fleet_management', 'driver_interface', 'dispatch_routing',
        'compliance_safety', 'warehouse_inventory', 'finance_billing',
        'customer_portal', 'analytics_reporting', 'admin_permissions',
        'integrations', 'system_health', 'user_management'
      ];
    case 'dispatcher':
      return ['loads', 'drivers', 'vehicles', 'dispatch', 'tracking', 'messages'];
    case 'driver':
      return ['loads', 'messages', 'documents', 'tracking', 'dvir'];
    case 'customer':
      return ['tracking', 'loads', 'documents', 'customer_portal'];
    case 'warehouse':
      return ['inventory', 'receiving', 'shipping', 'barcode_scanning'];
    default:
      return [];
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDevMode] = useState(config.environment === 'development');

  // Listen for auth state changes
  useEffect(() => {
    // In production mode, use Firebase auth
    if (config.environment === 'production') {
      if (!isFirebaseInitialized()) {
        console.warn('Firebase services not initialized yet, retrying...');
        // Retry after a short delay
        const retryTimer = setTimeout(() => {
          setIsLoading(false);
        }, 2000);
        return () => clearTimeout(retryTimer);
      }

      let unsubscribe: (() => void) | undefined;

      unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setFirebaseUser(fbUser);

        if (!fbUser) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        try {
          // Get user profile from Firestore using safe db getter
          const db = getDb();
          const userRef = doc(db, 'users', fbUser.uid);
          const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data();
              setUser({
                id: fbUser.uid,
                email: fbUser.email || '',
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                appRole: userData.appRole || 'customer',
                phone: userData.phone || '',
                createdAt: transformTimestamp(userData.createdAt),
                updatedAt: transformTimestamp(userData.updatedAt),
                isActive: userData.isActive ?? true,
                companyId: userData.companyId || '',
                permissions: userData.permissions || [],
              });
            } else {
              // User profile doesn't exist in Firestore
              setUser(null);
            }
            setIsLoading(false);
          });

          return () => unsubscribeUser();
        } catch (error) {
          console.error('Error accessing Firestore:', error);
          setUser(null);
          setIsLoading(false);
        }
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    } else {
      // In development mode, just set loading to false
      setIsLoading(false);
    }
  }, []);

  // Production login using Firebase
  const login = async (email: string, password: string): Promise<void> => {
    if (config.environment === 'production' && auth) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    } else {
      // Development mode - simple dev credentials
      if (email === 'cadendeverter' && password === 'Longdongsilver00') {
        // Create dev user profile for admin access
        const devUser = createDevUserProfile('admin');
        setUser(devUser);
        setFirebaseUser({
          uid: devUser.id,
          email: devUser.email,
          emailVerified: true,
        } as FirebaseUser);
        console.log(' Dev login successful for: cadendeverter (admin)');
      } else {
        throw new Error('Invalid dev credentials');
      }
    }
  };

  // Production register using Firebase
  const register = async (userData: any): Promise<void> => {
    if (config.environment === 'production' && auth) {
      try {
        await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      } catch (error) {
        console.error('Register error:', error);
        throw error;
      }
    } else {
      throw new Error('Production register not available in development mode');
    }
  };

  // Production reset password using Firebase
  const resetPassword = async (email: string): Promise<void> => {
    if (config.environment === 'production' && auth) {
      try {
        await sendPasswordResetEmail(auth, email);
      } catch (error) {
        console.error('Reset password error:', error);
        throw error;
      }
    } else {
      throw new Error('Production reset password not available in development mode');
    }
  };

  // Development login with mock data
  const loginDev = async (role: keyof typeof DEV_CREDENTIALS): Promise<void> => {
    if (!shouldEnableFeature('enableTestLogin')) {
      throw new Error('Dev login not available in production mode');
    }

    try {
      // Simulate async login delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const devUser = createDevUserProfile(role);
      setUser(devUser);
      setFirebaseUser(null); // No Firebase user in dev mode
      
      console.log(`Dev login successful as ${role}:`, devUser);
    } catch (error) {
      console.error('Dev login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      if (config.environment === 'production' && auth) {
        await signOut(auth);
      } else {
        // Dev mode logout
        setUser(null);
        setFirebaseUser(null);
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    isAuthenticated: !!user,
    isLoading,
    isDevMode,
    login,
    register,
    resetPassword,
    logout,
    loginDev,
  };

  return (
    <AuthContext.Provider value={value}>
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
