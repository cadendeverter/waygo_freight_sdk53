import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MD3LightTheme, MD3DarkTheme, Provider as PaperProvider, adaptNavigationTheme } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';

// Define your color palette (WayGo Freight specific)
const waygoColors = {
  primary: '#007AFF', // Blue (WayGo Primary) - iOS system blue
  secondary: '#5AC8FA', // Light Blue (Secondary)
  accent: '#007AFF', // Blue (Accent)
  
  // Semantic Colors
  success: '#10B981', // Green
  warning: '#F59E0B', // Amber
  error: '#EF4444',   // Red
  info: '#007AFF',    // Blue

  // Greyscale & UI - All white/light theme
  background: '#FFFFFF', // White (App Background)
  surface: '#FFFFFF',    // White (Card Backgrounds, Modals)
  onSurface: '#1F2937',  // Dark Gray (Text on Surface)
  
  text: '#111827',       // Primary Text (Dark Gray)
  textSecondary: '#4B5563', // Secondary Text (Medium Gray)
  placeholder: '#9CA3AF', // Placeholder Text (Lighter Gray)
  
  border: '#E5E7EB',     // Border Color (Light Gray)
  divider: '#F3F4F6',    // Divider Color (Very Light Gray)

  // Special cases
  disabled: '#9CA3AF',   // Disabled elements
  backdrop: 'rgba(0, 122, 255, 0.4)', // Blue backdrop
  
  // Navigation specific
  card: '#FFFFFF',       // Navigation card background - WHITE
  notification: '#007AFF', // Notification color - Blue
};

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

// Create light theme
const CombinedLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...LightTheme.colors,
    // Override specific Paper/Navigation colors to ensure white backgrounds
    primary: waygoColors.primary,
    secondary: waygoColors.secondary,
    tertiary: waygoColors.accent,
    surface: '#FFFFFF', // FORCE WHITE
    background: '#FFFFFF', // FORCE WHITE
    card: '#FFFFFF', // FORCE WHITE
    onSurface: waygoColors.text,
    onBackground: waygoColors.text,
    outline: waygoColors.border,
    surfaceVariant: '#FFFFFF', // FORCE WHITE
    onSurfaceVariant: waygoColors.textSecondary,
    elevation: {
      level0: '#FFFFFF', // FORCE WHITE
      level1: '#FFFFFF', // FORCE WHITE
      level2: '#FFFFFF', // FORCE WHITE
      level3: '#FFFFFF', // FORCE WHITE
      level4: '#FFFFFF', // FORCE WHITE
      level5: '#FFFFFF', // FORCE WHITE
    },
    // Include all waygo colors
    success: waygoColors.success,
    warning: waygoColors.warning,
    error: waygoColors.error,
    info: waygoColors.info,
    text: waygoColors.text,
    textSecondary: waygoColors.textSecondary,
    placeholder: waygoColors.placeholder,
    border: waygoColors.border,
    divider: waygoColors.divider,
    disabled: waygoColors.disabled,
    backdrop: waygoColors.backdrop,
    notification: waygoColors.notification,
    
    // Ensure all required Paper v5 keys are present
    successContainer: '#D1FAE5',
    onSuccessContainer: '#065F46',
    warningContainer: '#FEF3C7',
    onWarningContainer: '#92400E',
    errorContainer: '#FEE2E2',
    onErrorContainer: '#991B1B',
    infoContainer: '#E0E7FF',
    onInfoContainer: '#3730A3',
    scrim: '#000000',
  },
};

// Create dark theme (but force white backgrounds too for consistency)
const CombinedDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...DarkTheme.colors,
    // FORCE WHITE BACKGROUNDS EVEN IN DARK MODE
    primary: waygoColors.primary,
    secondary: waygoColors.secondary,
    tertiary: waygoColors.accent,
    surface: '#FFFFFF', // FORCE WHITE
    background: '#FFFFFF', // FORCE WHITE
    card: '#FFFFFF', // FORCE WHITE
    onSurface: waygoColors.text,
    onBackground: waygoColors.text,
    outline: waygoColors.border,
    surfaceVariant: '#FFFFFF', // FORCE WHITE
    onSurfaceVariant: waygoColors.textSecondary,
    elevation: {
      level0: '#FFFFFF', // FORCE WHITE
      level1: '#FFFFFF', // FORCE WHITE
      level2: '#FFFFFF', // FORCE WHITE
      level3: '#FFFFFF', // FORCE WHITE
      level4: '#FFFFFF', // FORCE WHITE
      level5: '#FFFFFF', // FORCE WHITE
    },
    // Include semantic colors
    success: waygoColors.success,
    warning: waygoColors.warning,
    error: waygoColors.error,
    info: waygoColors.info,
    textSecondary: '#9CA3AF',
    placeholder: '#6B7280',
    divider: '#374151',
    disabled: '#6B7280',
    backdrop: 'rgba(0, 122, 255, 0.4)',
    
    // Ensure all required Paper v5 keys are present
    successContainer: '#065F46',
    onSuccessContainer: '#D1FAE5',
    warningContainer: '#92400E',
    onWarningContainer: '#FEF3C7',
    errorContainer: '#991B1B',
    onErrorContainer: '#FEE2E2',
    infoContainer: '#3730A3',
    onInfoContainer: '#E0E7FF',
    scrim: '#000000',
  },
};

interface ThemeContextType {
  isDark: boolean;
  theme: typeof CombinedLightTheme;
  colors: typeof CombinedLightTheme.colors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  theme: CombinedLightTheme,
  colors: CombinedLightTheme.colors,
  toggleTheme: () => console.warn('ThemeProvider not found'),
});

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(false); // Force light mode always for white backgrounds

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Always use light theme to ensure white backgrounds
  const theme = CombinedLightTheme;

  return (
    <ThemeContext.Provider value={{ 
      isDark: false, // Always false to maintain white backgrounds
      theme, 
      colors: theme.colors, 
      toggleTheme 
    }}>
      <PaperProvider theme={theme}>
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
