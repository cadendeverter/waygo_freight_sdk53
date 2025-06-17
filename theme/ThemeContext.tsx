import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MD3LightTheme, MD3DarkTheme, Provider as PaperProvider, adaptNavigationTheme } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';

// Define your color palette (WayGo Freight specific)
const waygoColors = {
  primary: '#1E3A8A', // Dark Blue (WayGo Blue)
  secondary: '#10B981', // Green (Accent)
  accent: '#F59E0B', // Amber (Secondary Accent)
  
  // Semantic Colors
  success: '#10B981', // Green
  warning: '#F59E0B', // Amber
  error: '#EF4444',   // Red
  info: '#3B82F6',    // Blue

  // Greyscale & UI
  background: '#F3F4F6', // Light Gray (App Background)
  surface: '#FFFFFF',    // White (Card Backgrounds, Modals)
  onSurface: '#1F2937',  // Dark Gray (Text on Surface)
  
  text: '#111827',       // Primary Text (Dark Gray)
  textSecondary: '#4B5563', // Secondary Text (Medium Gray)
  placeholder: '#9CA3AF', // Placeholder Text (Lighter Gray)
  
  border: '#D1D5DB',     // Border Color (Light Gray)
  divider: '#E5E7EB',    // Divider Color (Very Light Gray)

  // Special cases
  disabled: '#9CA3AF',   // Disabled elements
  backdrop: 'rgba(0, 0, 0, 0.4)', // Modal backdrop
};

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

// Create light theme
const CombinedLightTheme = {
  ...MD3LightTheme,
  isV3: true,
  colors: {
    ...MD3LightTheme.colors,
    ...LightTheme.colors,
    ...waygoColors,
    // Override specific Paper/Navigation colors if needed
    primary: waygoColors.primary,
    accent: waygoColors.accent,
    background: waygoColors.background,
    surface: waygoColors.surface,
    text: waygoColors.text,
    onSurface: waygoColors.onSurface,
    // Ensure all required Paper v5 keys are present
    surfaceVariant: '#E0E0E0', // Example, adjust as needed
    successContainer: '#D1FAE5',
    onSuccessContainer: '#065F46',
    onSurfaceVariant: '#424242',
    outline: waygoColors.border,
    elevation: {
      level0: 'transparent',
      level1: waygoColors.surface, 
      level2: waygoColors.surface, 
      level3: waygoColors.surface, 
      level4: waygoColors.surface, 
      level5: waygoColors.surface, 
    }
  },
};

// Create dark theme
const CombinedDarkTheme = {
  ...MD3DarkTheme,
  isV3: true,
  colors: {
    ...MD3DarkTheme.colors,
    ...DarkTheme.colors,
    ...waygoColors, // Start with base waygo colors
    // Override for dark mode
    primary: '#60A5FA', // Lighter Blue for dark mode
    secondary: '#34D399', // Lighter Green
    accent: '#FBBF24', // Lighter Amber
    background: '#1F2937', // Dark Gray Blue
    surface: '#374151',    // Slightly Lighter Dark Gray Blue
    onSurface: '#F3F4F6',  // Light Gray Text on Dark Surface
    text: '#E5E7EB',       // Primary Text (Light Gray)
    textSecondary: '#9CA3AF', // Secondary Text (Medium Gray)
    placeholder: '#6B7280', // Placeholder Text
    border: '#4B5563',     // Border Color
    divider: '#374151',    // Divider Color
    // Ensure all required Paper v5 keys are present
    surfaceVariant: '#424242', // Example, adjust as needed
    successContainer: '#065F46',
    onSuccessContainer: '#A7F3D0',
    onSurfaceVariant: '#BDBDBD',
    outline: waygoColors.border,
    elevation: {
      level0: 'transparent',
      level1: '#374151', 
      level2: '#374151', 
      level3: '#374151', 
      level4: '#374151', 
      level5: '#374151', 
    }
  },
};

interface ThemeContextType {
  isDark: boolean;
  theme: typeof CombinedLightTheme; // Use one of the themes as the shape
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  theme: CombinedLightTheme,
  toggleTheme: () => console.warn('ThemeProvider not found'),
});

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === 'dark');

  const theme = isDark ? CombinedDarkTheme : CombinedLightTheme;

  const toggleTheme = React.useCallback(() => {
    setIsDark(!isDark);
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, theme, toggleTheme }}>
      <PaperProvider theme={theme}>
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
