export type UserRole = 'ADMIN_FREIGHT' | 'DISPATCHER' | 'DRIVER' | 'WAREHOUSE' | 'CUSTOMER';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  role: UserRole;
  companyId?: string;
  companyName?: string;
  isActive: boolean;
  createdAt: Date | FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue;
  updatedAt: Date | FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue;
  lastLoginAt?: Date | FirebaseFirestore.Timestamp;
  fcmTokens?: string[];
  metadata?: {
    [key: string]: any;
  };
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  company: Company | null;
}

export interface Company {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  dotNumber?: string;
  mcNumber?: string;
  logoUrl?: string;
  primaryContact: string;
  isActive: boolean;
  subscriptionPlan: 'free' | 'basic' | 'premium' | 'enterprise';
  subscriptionStatus: 'active' | 'trial' | 'past_due' | 'canceled';
  trialEndsAt?: Date | FirebaseFirestore.Timestamp;
  createdAt: Date | FirebaseFirestore.Timestamp;
  updatedAt: Date | FirebaseFirestore.Timestamp;
}

export interface UserSession {
  uid: string;
  email: string;
  role: UserRole;
  companyId?: string;
  companyName?: string;
  displayName: string;
  photoURL?: string;
  isAdmin: boolean;
  permissions: string[];
}
