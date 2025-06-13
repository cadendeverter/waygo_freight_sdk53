import React, { ReactNode } from 'react';
import { 
  View, 
  StyleSheet, 
  StyleProp, 
  ViewStyle, 
  TouchableOpacity, 
  TouchableOpacityProps,
  Platform,
  StatusBar,
  StatusBarStyle,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import { ArrowLeft, Menu, X, MoreVertical, ChevronLeft } from 'lucide-react-native';
import Text from './Text';

type HeaderVariant = 'default' | 'primary' | 'secondary' | 'transparent' | 'elevated';
type HeaderTitleAlign = 'left' | 'center' | 'right';
type HeaderAction = {
  icon: ReactNode;
  onPress: () => void;
  disabled?: boolean;
  color?: string;
  testID?: string;
};

export interface HeaderProps {
  /**
   * The title to display in the header
   */
  title?: string;
  
  /**
   * Custom title component to render instead of the title text
   * If provided, the title prop will be ignored
   */
  titleComponent?: ReactNode;
  
  /**
   * The variant of the header
   * @default 'default'
   */
  variant?: HeaderVariant;
  
  /**
   * Whether to show the back button
   * @default false
   */
  showBackButton?: boolean;
  
  /**
   * Custom back button press handler
   * If not provided, will use navigation.goBack()
   */
  onBackPress?: () => void;
  
  /**
   * Whether to show the menu button
   * @default false
   */
  showMenuButton?: boolean;
  
  /**
   * Menu button press handler
   */
  onMenuPress?: () => void;
  
  /**
   * Whether to show the close button (X)
   * @default false
   */
  showCloseButton?: boolean;
  
  /**
   * Close button press handler
   */
  onClosePress?: () => void;
  
  /**
   * Actions to display on the right side of the header
   */
  actions?: HeaderAction[];
  
  /**
   * Alignment of the title
   * @default 'center' on iOS, 'left' on Android
   */
  titleAlign?: HeaderTitleAlign;
  
  /**
   * Background color of the header
   * Overrides the default background color based on variant
   */
  backgroundColor?: string;
  
  /**
   * Color of the title and icons
   * Overrides the default color based on variant
   */
  color?: string;
  
  /**
   * Whether to apply safe area insets
   * @default true
   */
  safeArea?: boolean;
  
  /**
   * Custom style for the header container
   */
  style?: StyleProp<ViewStyle>;
  
  /**
   * Custom style for the header content
   */
  contentStyle?: StyleProp<ViewStyle>;
  
  /**
   * Status bar style
   * @default 'dark-content' for light theme, 'light-content' for dark theme
   */
  statusBarStyle?: StatusBarStyle;
  
  /**
   * Whether the status bar should be translucent
   * @default true on Android, false on iOS
   */
  statusBarTranslucent?: boolean;
  
  /**
   * Whether to show the status bar
   * @default true
   */
  statusBarHidden?: boolean;
  
  /**
   * Background color of the status bar
   * Only works on Android
   */
  statusBarBackgroundColor?: string;
  
  /**
   * Whether to show the border at the bottom of the header
   * @default true
   */
  border?: boolean;
  
  /**
   * Border color
   * Only applies if border is true
   */
  borderColor?: string;
  
  /**
   * Height of the header
   * @default 56
   */
  height?: number;
  
  /**
   * Whether to show the header shadow
   * @default true
   */
  shadow?: boolean;
  
  /**
   * Elevation level for Android shadow
   * @default 4
   */
  elevation?: number;
  
  /**
   * Test ID for testing purposes
   */
  testID?: string;
}

/**
 * A customizable Header component that can be used for navigation and page titles.
 * It supports different variants, actions, and customizations for both iOS and Android.
 */
const Header: React.FC<HeaderProps> = ({
  title,
  titleComponent,
  variant = 'default',
  showBackButton = false,
  onBackPress,
  showMenuButton = false,
  onMenuPress,
  showCloseButton = false,
  onClosePress,
  actions = [],
  titleAlign: titleAlignProp,
  backgroundColor: bgColorProp,
  color: colorProp,
  safeArea = true,
  style,
  contentStyle,
  statusBarStyle: statusBarStyleProp,
  statusBarTranslucent: statusBarTranslucentProp,
  statusBarHidden = false,
  statusBarBackgroundColor: statusBarBgColorProp,
  border = true,
  borderColor: borderColorProp,
  height = 56,
  shadow = true,
  elevation = 4,
  testID,
}) => {
  const { theme, colorScheme } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // Default title alignment based on platform
  const defaultTitleAlign = Platform.OS === 'ios' ? 'center' : 'left';
  const titleAlign = titleAlignProp || defaultTitleAlign;
  
  // Determine colors based on variant
  const getColors = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: theme.colors.primary,
          color: theme.colors.textOnPrimary,
          statusBarStyle: 'light-content' as StatusBarStyle,
        };
      case 'secondary':
        return {
          bg: theme.colors.secondary,
          color: theme.colors.textOnSecondary,
          statusBarStyle: 'light-content' as StatusBarStyle,
        };
      case 'transparent':
        return {
          bg: 'transparent',
          color: colorProp || theme.colors.primary,
          statusBarStyle: colorScheme === 'dark' ? 'light-content' : 'dark-content',
        };
      case 'elevated':
        return {
          bg: theme.colors.surface,
          color: theme.colors.text,
          statusBarStyle: colorScheme === 'dark' ? 'light-content' : 'dark-content',
        };
      default: // 'default'
        return {
          bg: theme.colors.background,
          color: theme.colors.text,
          statusBarStyle: colorScheme === 'dark' ? 'light-content' : 'dark-content',
        };
    }
  };
  
  const { bg, color, statusBarStyle: variantStatusBarStyle } = getColors();
  
  // Use provided colors or fall back to variant-based colors
  const backgroundColor = bgColorProp || bg;
  const textColor = colorProp || color;
  const statusBarStyle = statusBarStyleProp || variantStatusBarStyle;
  const statusBarTranslucent = statusBarTranslucentProp ?? Platform.OS === 'android';
  const statusBarBackgroundColor = statusBarBgColorProp || backgroundColor;
  const borderColor = borderColorProp || theme.colors.border;
  
  // Handle back button press
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };
  
  // Render the left section (back button, menu button, etc.)
  const renderLeftSection = () => {
    if (showBackButton) {
      return (
        <TouchableOpacity
          onPress={handleBackPress}
          style={[styles.button, styles.leftButton]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          testID="header-back-button"
        >
          <ChevronLeft size={24} color={textColor} />
        </TouchableOpacity>
      );
    }
    
    if (showMenuButton) {
      return (
        <TouchableOpacity
          onPress={onMenuPress}
          style={[styles.button, styles.leftButton]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          testID="header-menu-button"
        >
          <Menu size={24} color={textColor} />
        </TouchableOpacity>
      );
    }
    
    return <View style={styles.button} />;
  };
  
  // Render the right section (actions, close button, etc.)
  const renderRightSection = () => {
    if (showCloseButton) {
      return (
        <TouchableOpacity
          onPress={onClosePress}
          style={[styles.button, styles.rightButton]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          testID="header-close-button"
        >
          <X size={24} color={textColor} />
        </TouchableOpacity>
      );
    }
    
    if (actions.length > 0) {
      return (
        <View style={styles.actionsContainer}>
          {actions.map((action, index) => (
            <TouchableOpacity
              key={`action-${index}`}
              onPress={action.onPress}
              disabled={action.disabled}
              style={[
                styles.button,
                styles.actionButton,
                index > 0 && { marginLeft: 8 },
              ]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              testID={action.testID || `header-action-${index}`}
            >
              {React.cloneElement(action.icon as React.ReactElement, {
                color: action.color || textColor,
                size: 24,
              })}
            </TouchableOpacity>
          ))}
        </View>
      );
    }
    
    return <View style={styles.button} />;
  };
  
  // Render the title
  const renderTitle = () => {
    if (titleComponent) {
      return titleComponent;
    }
    
    if (title) {
      return (
        <Text 
          variant="h6" 
          weight="semiBold" 
          numberOfLines={1} 
          style={[
            styles.title,
            { color: textColor, textAlign: titleAlign },
            titleAlign === 'left' && styles.titleLeft,
            titleAlign === 'center' && styles.titleCenter,
            titleAlign === 'right' && styles.titleRight,
          ]}
        >
          {title}
        </Text>
      );
    }
    
    return null;
  };
  
  // Calculate header styles
  const headerStyle: ViewStyle = {
    backgroundColor,
    height: height + (safeArea ? insets.top : 0),
    paddingTop: safeArea ? insets.top : 0,
    borderBottomWidth: border ? StyleSheet.hairlineWidth : 0,
    borderBottomColor: border ? borderColor : 'transparent',
    ...(shadow && Platform.OS === 'android' ? { elevation } : {}),
    ...(shadow && Platform.OS === 'ios' ? theme.shadows.md : {}),
  };
  
  const contentContainerStyle = {
    height,
  };
  
  return (
    <>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={statusBarBackgroundColor}
        translucent={statusBarTranslucent}
        hidden={statusBarHidden}
      />
      <View 
        style={[styles.container, headerStyle, style]}
        testID={testID}
      >
        <View style={[styles.content, contentContainerStyle, contentStyle]}>
          {renderLeftSection()}
          <View style={styles.titleContainer}>
            {renderTitle()}
          </View>
          {renderRightSection()}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 100,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftButton: {
    marginRight: 8,
  },
  rightButton: {
    marginLeft: 8,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
  },
  titleLeft: {
    textAlign: 'left',
    marginLeft: 0,
  },
  titleCenter: {
    textAlign: 'center',
    marginHorizontal: 'auto',
  },
  titleRight: {
    textAlign: 'right',
    marginRight: 0,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Header;
