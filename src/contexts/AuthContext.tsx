import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { authService } from '../services/firebaseService';
import { UserProfile, Company } from '../../utils/types';

type AuthContextType = {
  user: UserProfile | null;
  company: Company | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
  resetError: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is logged in on app start
  useEffect(() => {
    // Defer auth state listener to ensure Firebase auth is fully initialized
    const timeoutId = setTimeout(() => {
      const unsubscribe = authService.authInstance.onAuthStateChanged(
        async (firebaseUser: FirebaseUser | null) => {
          try {
            if (firebaseUser) {
              // User is signed in
              const userProfile = await authService.getUserProfile(firebaseUser.uid);
              if (userProfile) {
                setUser(userProfile);
                
                // Load company data if available
                if (userProfile.companyId) {
                  try {
                    const companyData = await authService.getCompany(userProfile.companyId);
                    if (companyData) {
                      setCompany(companyData);
                    }
                  } catch (err) {
                    console.error('Error loading company data:', err);
                  }
                }
              }
            } else {
              // User is signed out
              setUser(null);
              setCompany(null);
            }
          } catch (err) {
            console.error('Error in auth state change:', err);
            setError('Failed to load user data');
          } finally {
            setIsLoading(false);
          }
        },
        (err: any) => {
          console.error('Auth state change error:', err);
          setError('Authentication error occurred');
          setIsLoading(false);
        }
      );

      // Cleanup subscription on unmount
      return () => {
        unsubscribe();
        clearTimeout(timeoutId);
      };
    }, 100);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.signIn(email, password);
      // onAuthStateChanged will handle the rest
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.signUp(email, password, userData);
      // onAuthStateChanged will handle the rest
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.message || 'Failed to create account');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.signOut();
      // onAuthStateChanged will handle the rest
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError(err.message || 'Failed to sign out');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      try {
        const userProfile = await authService.getUserProfile(currentUser.uid);
        if (userProfile) {
          setUser(userProfile);
          
          // Refresh company data if available
          if (userProfile.companyId) {
            try {
              const companyData = await authService.getCompany(userProfile.companyId);
              if (companyData) {
                setCompany(companyData);
              }
            } catch (err) {
              console.error('Error refreshing company data:', err);
            }
          }
        }
      } catch (err) {
        console.error('Error refreshing user data:', err);
      }
    }
  };

  const resetError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        isAuthenticated: !!user,
        isLoading,
        error,
        signIn,
        signUp,
        signOut,
        resetError,
        refreshUser,
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
