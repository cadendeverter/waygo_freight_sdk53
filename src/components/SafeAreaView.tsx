import React, { ReactNode } from 'react';
import { 
  SafeAreaView as RNSafeAreaView, 
  StyleSheet, 
  ViewStyle, 
  StatusBar, 
  Platform,
  View,
  StyleProp,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

type SafeAreaViewProps = {
  /**
   * Children components to render inside the SafeAreaView
   */
  children: ReactNode;
  
  /**
   * Custom style for the SafeAreaView
   */
  style?: StyleProp<ViewStyle>;
  
  /**
   * Whether to apply safe area insets to the top of the view
   * @default true
   */
  topInset?: boolean;
  
  /**
   * Whether to apply safe area insets to the bottom of the view
   * @default true
   */
  bottomInset?: boolean;
  
  /**
   * Background color of the SafeAreaView
   * @default theme.colors.background
   */
  backgroundColor?: string;
  
  /**
   * Status bar style
   * @default 'dark-content' on iOS, 'light-content' on Android
   */
  statusBarStyle?: 'light-content' | 'dark-content' | 'default';
  
  /**
   * Background color of the status bar (Android only)
   */
  statusBarBackgroundColor?: string;
  
  /**
   * Whether the status bar is translucent (Android only)
   * @default true
   */
  statusBarTranslucent?: boolean;
  
  /**
   * Whether to show or hide the status bar
   * @default true
   */
  statusBarHidden?: boolean;
  
  /**
   * Animation effect for status bar changes
   * @default 'fade' on iOS, 'none' on Android
   */
  statusBarAnimation?: 'none' | 'fade' | 'slide';
};

/**
 * A SafeAreaView component that handles safe area insets for both iOS and Android.
 * It also provides a consistent way to manage the status bar appearance.
 */
const SafeAreaView: React.FC<SafeAreaViewProps> = ({
  children,
  style,
  topInset = true,
  bottomInset = true,
  backgroundColor,
  statusBarStyle = Platform.OS === 'ios' ? 'dark-content' : 'light-content',
  statusBarBackgroundColor,
  statusBarTranslucent = Platform.OS === 'android',
  statusBarHidden = false,
  statusBarAnimation = Platform.OS === 'ios' ? 'fade' : 'none',
}) => {
  const { theme } = useTheme();
  
  // Determine the background color to use
  const bgColor = backgroundColor || theme.colors.background;
  
  // Determine the status bar background color
  const statusBarBgColor = statusBarBackgroundColor || bgColor;
  
  // Determine the status bar style based on the background color
  const getStatusBarStyle = () => {
    if (statusBarStyle) return statusBarStyle;
    
    // Calculate the perceived brightness of the background color
    // to determine if we should use light or dark content
    if (statusBarBgColor) {
      const hex = statusBarBgColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      
      return brightness > 128 ? 'dark-content' : 'light-content';
    }
    
    return 'dark-content';
  };
  
  // Calculate the safe area styles
  const safeAreaStyles: ViewStyle = {
    flex: 1,
    backgroundColor: bgColor,
  };
  
  // Apply safe area insets based on platform
  if (Platform.OS === 'ios') {
    safeAreaStyles.paddingTop = topInset ? 0 : 0; // iOS handles this automatically with SafeAreaView
    safeAreaStyles.paddingBottom = bottomInset ? 0 : 0; // iOS handles this automatically with SafeAreaView
  } else {
    // For Android, we need to manually add padding for the status bar
    safeAreaStyles.paddingTop = topInset ? StatusBar.currentHeight : 0;
    
    // For Android, we need to add padding for the navigation bar if it's translucent
    if (statusBarTranslucent) {
      safeAreaStyles.paddingTop = topInset ? StatusBar.currentHeight : 0;
    }
  }
  
  return (
    <>
      <StatusBar
        barStyle={getStatusBarStyle()}
        backgroundColor={statusBarBgColor}
        translucent={statusBarTranslucent}
        hidden={statusBarHidden}
        animated={statusBarAnimation !== 'none'}
      />
      <RNSafeAreaView 
        style={[
          styles.safeArea, 
          safeAreaStyles,
          style,
        ]}
      >
        {children}
      </RNSafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});

export default SafeAreaView;
