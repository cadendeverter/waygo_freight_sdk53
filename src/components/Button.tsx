import React, { forwardRef } from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style' | 'disabled'> {
  /**
   * The text to display inside the button
   */
  title: string;
  
  /**
   * The variant of the button
   * @default 'primary'
   */
  variant?: ButtonVariant;
  
  /**
   * The size of the button
   * @default 'medium'
   */
  size?: ButtonSize;
  
  /**
   * Whether the button is in a loading state
   * @default false
   */
  loading?: boolean;
  
  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Custom style for the button container
   */
  style?: StyleProp<ViewStyle>;
  
  /**
   * Custom style for the button text
   */
  textStyle?: StyleProp<TextStyle>;
  
  /**
   * Custom loading indicator color
   */
  loadingColor?: string;
  
  /**
   * Icon to display on the left side of the text
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Icon to display on the right side of the text
   */
  rightIcon?: React.ReactNode;
  
  /**
   * Whether to take up the full width of the container
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * Border radius of the button
   * @default 8
   */
  borderRadius?: number;
}

/**
 * A customizable button component that follows the app's design system.
 * Supports different variants, sizes, loading states, and icons.
 */
const Button = forwardRef<TouchableOpacity, ButtonProps>(({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  loadingColor,
  leftIcon,
  rightIcon,
  fullWidth = false,
  borderRadius = 8,
  onPress,
  ...rest
}, ref) => {
  const { theme } = useTheme();
  
  // Determine button styles based on variant and state
  const getButtonStyle = (): ViewStyle => {
    let buttonStyle: ViewStyle = {
      backgroundColor: theme.colors.primary,
      borderWidth: 1,
      borderColor: 'transparent',
      borderRadius,
      opacity: disabled ? 0.6 : 1,
    };
    
    // Apply variant styles
    switch (variant) {
      case 'secondary':
        buttonStyle.backgroundColor = theme.colors.secondary;
        break;
      case 'outline':
        buttonStyle.backgroundColor = 'transparent';
        buttonStyle.borderColor = theme.colors.primary;
        break;
      case 'text':
        buttonStyle.backgroundColor = 'transparent';
        buttonStyle.borderWidth = 0;
        break;
      case 'danger':
        buttonStyle.backgroundColor = theme.colors.error;
        break;
      default:
        // primary (default)
        buttonStyle.backgroundColor = theme.colors.primary;
    }
    
    // Apply size styles
    switch (size) {
      case 'small':
        buttonStyle.paddingHorizontal = 12;
        buttonStyle.paddingVertical = 6;
        break;
      case 'large':
        buttonStyle.paddingHorizontal = 24;
        buttonStyle.paddingVertical = 14;
        break;
      default:
        // medium (default)
        buttonStyle.paddingHorizontal = 16;
        buttonStyle.paddingVertical = 10;
    }
    
    // Apply full width if needed
    if (fullWidth) {
      buttonStyle.alignSelf = 'stretch';
      buttonStyle.width = '100%';
    }
    
    return buttonStyle;
  };
  
  // Determine text styles based on variant and state
  const getTextStyle = (): TextStyle => {
    let textStyle: TextStyle = {
      color: theme.colors.textOnPrimary,
      textAlign: 'center',
    };
    
    // Apply variant styles
    switch (variant) {
      case 'outline':
        textStyle.color = theme.colors.primary;
        break;
      case 'text':
        textStyle.color = theme.colors.primary;
        break;
      case 'danger':
        textStyle.color = theme.colors.textOnPrimary;
        break;
      default:
        // primary and secondary use default text color
        break;
    }
    
    // Apply size styles
    switch (size) {
      case 'small':
        textStyle.fontSize = 14;
        break;
      case 'large':
        textStyle.fontSize = 18;
        break;
      default:
        // medium (default)
        textStyle.fontSize = 16;
    }
    
    // Adjust for disabled state
    if (disabled) {
      textStyle.opacity = 0.7;
    }
    
    return textStyle;
  };
  
  // Determine loading indicator color based on variant
  const getLoadingColor = (): string => {
    if (loadingColor) return loadingColor;
    
    switch (variant) {
      case 'outline':
      case 'text':
        return theme.colors.primary;
      case 'danger':
        return theme.colors.textOnPrimary;
      default:
        return theme.colors.textOnPrimary;
    }
  };
  
  const buttonStyle = getButtonStyle();
  const textStyle = getTextStyle();
  
  return (
    <TouchableOpacity
      ref={ref}
      style={[styles.button, buttonStyle, style]}
      onPress={disabled || loading ? undefined : onPress}
      activeOpacity={0.7}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={getLoadingColor()} 
          style={styles.loadingIndicator}
        />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Text
            style={[
              styles.text,
              textStyle,
              (leftIcon || rightIcon) && styles.textWithIcon,
              textStyle,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
  textWithIcon: {
    marginHorizontal: 8,
  },
  leftIcon: {
    marginRight: 4,
  },
  rightIcon: {
    marginLeft: 4,
  },
  loadingIndicator: {
    margin: 2,
  },
});

export default Button;
