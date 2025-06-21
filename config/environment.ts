// config/environment.ts
export interface AppConfig {
  environment: 'development' | 'production';
  enableSampleData: boolean;
  apiBaseUrl: string;
  firebaseConfig: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  features: {
    enableDebugMode: boolean;
    enableLogging: boolean;
    enableTestLogin: boolean;
    enableMockData: boolean;
  };
}

const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';

export const config: AppConfig = {
  environment: isDevelopment ? 'development' : 'production',
  enableSampleData: isDevelopment,
  apiBaseUrl: isDevelopment 
    ? 'http://localhost:3000/api' 
    : 'https://api.waygofreight.com',
  firebaseConfig: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
  },
  features: {
    enableDebugMode: isDevelopment,
    enableLogging: isDevelopment,
    enableTestLogin: isDevelopment,
    enableMockData: isDevelopment,
  },
};

// Dev login credentials for testing
export const DEV_CREDENTIALS = {
  // User's personal dev admin account with full access
  cadendeverter: {
    email: 'cadendeverter@waygofreight.dev',
    password: 'Longdongsilver00',
    role: 'admin' as const,
    name: 'Caden Deverter',
    isDevAdmin: true, // Special flag for dev admin with all permissions
  },
  admin: {
    email: 'admin@waygofreight.dev',
    password: 'WayGo2024!',
    role: 'admin' as const,
    name: 'Dev Admin',
    isDevAdmin: true,
  },
  dispatcher: {
    email: 'dispatcher@waygofreight.dev',
    password: 'WayGo2024!',
    role: 'dispatcher' as const,
    name: 'Dev Dispatcher',
    isDevAdmin: false,
  },
  driver: {
    email: 'driver@waygofreight.dev',
    password: 'WayGo2024!',
    role: 'driver' as const,
    name: 'Dev Driver',
    isDevAdmin: false,
  },
  customer: {
    email: 'customer@waygofreight.dev',
    password: 'WayGo2024!',
    role: 'customer' as const,
    name: 'Dev Customer',
    isDevAdmin: false,
  },
  warehouse: {
    email: 'warehouse@waygofreight.dev',
    password: 'WayGo2024!',
    role: 'warehouse' as const,
    name: 'Dev Warehouse',
    isDevAdmin: false,
  },
};

export const isDevMode = () => config.environment === 'development';
export const isProdMode = () => config.environment === 'production';
export const shouldUseSampleData = () => config.enableSampleData && isDevMode();
export const shouldEnableFeature = (feature: keyof AppConfig['features']) => config.features[feature];
