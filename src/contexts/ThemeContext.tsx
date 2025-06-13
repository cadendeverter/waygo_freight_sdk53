import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useColorScheme, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

type ThemeColors = {
  // Brand colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Background colors
  background: string;
  surface: string;
  surfaceVariant: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textOnPrimary: string;
  textOnSecondary: string;
  
  // Border colors
  border: string;
  borderLight: string;
  
  // Other
  backdrop: string;
  shadow: string;
  disabled: string;
  disabledText: string;
  placeholder: string;
  notification: string;
};

type Theme = {
  colors: ThemeColors;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
  typography: {
    h1: object;
    h2: object;
    h3: object;
    h4: object;
    h5: object;
    h6: object;
    subtitle1: object;
    subtitle2: object;
    body1: object;
    body2: object;
    button: object;
    caption: object;
    overline: object;
  };
  shadows: {
    sm: object;
    md: object;
    lg: object;
    xl: object;
  };
  animation: {
    fast: number;
    normal: number;
    slow: number;
  };
};

type ThemeContextType = {
  theme: Theme;
  themeMode: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
};

// Light theme colors
const lightColors: ThemeColors = {
  // Brand colors
  primary: '#1E88E5',
  primaryLight: '#6AB7FF',
  primaryDark: '#005CB2',
  secondary: '#FF7043',
  secondaryLight: '#FFA270',
  secondaryDark: '#C63F17',
  
  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Background colors
  background: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F5',
  
  // Text colors
  text: '#212121',
  textSecondary: '#757575',
  textTertiary: '#9E9E9E',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#000000',
  
  // Border colors
  border: '#E0E0E0',
  borderLight: '#EEEEEE',
  
  // Other
  backdrop: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.1)',
  disabled: '#BDBDBD',
  disabledText: '#9E9E9E',
  placeholder: '#9E9E9E',
  notification: '#FF5252',
};

// Dark theme colors
const darkColors: ThemeColors = {
  // Brand colors
  primary: '#2196F3',
  primaryLight: '#6EC6FF',
  primaryDark: '#0069C0',
  secondary: '#FF8A65',
  secondaryLight: '#FFBB93',
  secondaryDark: '#C75B39',
  
  // Status colors
  success: '#66BB6A',
  warning: '#FFA726',
  error: '#F44336',
  info: '#29B6F6',
  
  // Background colors
  background: '#121212',
  surface: '#1E1E1E',
  surfaceVariant: '#2D2D2D',
  
  // Text colors
  text: '#E0E0E0',
  textSecondary: '#A0A0A0',
  textTertiary: '#707070',
  textOnPrimary: '#000000',
  textOnSecondary: '#000000',
  
  // Border colors
  border: '#333333',
  borderLight: '#444444',
  
  // Other
  backdrop: 'rgba(0, 0, 0, 0.7)',
  shadow: 'rgba(0, 0, 0, 0.3)',
  disabled: '#555555',
  disabledText: '#707070',
  placeholder: '#707070',
  notification: '#FF6E6E',
};

// Common theme properties
const commonTheme = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    full: 1000, // For circular elements
  },
  typography: {
    h1: { fontSize: 32, fontWeight: 'bold', lineHeight: 40 },
    h2: { fontSize: 28, fontWeight: 'bold', lineHeight: 36 },
    h3: { fontSize: 24, fontWeight: '600', lineHeight: 32 },
    h4: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
    h5: { fontSize: 18, fontWeight: '600', lineHeight: 26 },
    h6: { fontSize: 16, fontWeight: '600', lineHeight: 24 },
    subtitle1: { fontSize: 16, fontWeight: '500', lineHeight: 24 },
    subtitle2: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
    body1: { fontSize: 16, lineHeight: 24 },
    body2: { fontSize: 14, lineHeight: 20 },
    button: { fontSize: 16, fontWeight: '500', textTransform: 'uppercase' },
    caption: { fontSize: 12, lineHeight: 16 },
    overline: { fontSize: 10, fontWeight: '500', letterSpacing: 1.5, textTransform: 'uppercase' },
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
};

// Create light and dark themes
const lightTheme: Theme = {
  ...commonTheme,
  colors: lightColors,
};

const darkTheme: Theme = {
  ...commonTheme,
  colors: darkColors,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@app_theme_mode';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isReady, setIsReady] = useState(false);

  // Load saved theme mode from storage
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          setThemeModeState(savedTheme as ThemeMode);
        }
      } catch (error) {
        console.error('Failed to load theme preference', error);
      } finally {
        setIsReady(true);
      }
    };

    loadThemePreference();
  }, []);

  // Save theme mode to storage
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to save theme preference', error);
    }
  }, []);

  // Toggle between light and dark theme
  const toggleTheme = useCallback(() => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  }, [themeMode]);

  // Determine which theme to use based on mode and system preference
  const isDark = themeMode === 'system' 
    ? systemColorScheme === 'dark' 
    : themeMode === 'dark';

  const theme = isDark ? darkTheme : lightTheme;

  // Don't render anything until theme is loaded to avoid flash of incorrect theme
  if (!isReady) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        isDark,
        toggleTheme,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Export theme types for use in styled components
export type { Theme, ThemeColors };
