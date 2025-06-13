import React, { useMemo } from 'react';
import { StyleProp, TextStyle, View, ViewStyle } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

type IconName = keyof typeof LucideIcons;
type IconSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

export interface IconProps {
  /**
   * The name of the icon to display
   * Must be a valid Lucide icon name (e.g., 'home', 'settings', 'user', etc.)
   */
  name: IconName | string;
  
  /**
   * The size of the icon
   * Can be a predefined size ('xxs', 'xs', 'sm', 'md', 'lg', 'xl')
   * or a custom size in pixels (number)
   * @default 'md'
   */
  size?: IconSize;
  
  /**
   * The color of the icon
   * Can be a theme color key or a direct color value
   * @default 'text'
   */
  color?: string;
  
  /**
   * Whether the icon should be filled
   * Only works with certain Lucide icons that support the 'fill' prop
   * @default false
   */
  filled?: boolean;
  
  /**
   * Custom style for the icon container
   */
  style?: StyleProp<ViewStyle>;
  
  /**
   * Custom style for the icon itself
   */
  iconStyle?: StyleProp<TextStyle>;
  
  /**
   * Whether the icon should be animated
   * @default false
   */
  animated?: boolean;
  
  /**
   * Animation duration in milliseconds
   * Only applies when animated is true
   * @default 300
   */
  animationDuration?: number;
  
  /**
   * Animation type
   * Only applies when animated is true
   * @default 'none'
   */
  animationType?: 'none' | 'pulse' | 'spin' | 'bounce' | 'shake';
  
  /**
   * Whether the icon should be mirrored (useful for RTL layouts)
   * @default false
   */
  mirrorRTL?: boolean;
  
  /**
   * Test ID for testing purposes
   */
  testID?: string;
  
  /**
   * Accessibility label for the icon
   * If not provided, the icon name will be used
   */
  accessibilityLabel?: string;
  
  /**
   * Whether the icon is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Opacity of the icon when disabled
   * @default 0.5
   */
  disabledOpacity?: number;
  
  /**
   * Callback function when the icon is pressed
   */
  onPress?: () => void;
  
  /**
   * Callback function when the icon is long pressed
   */
  onLongPress?: () => void;
  
  /**
   * Additional props to pass to the underlying icon component
   */
  [key: string]: any;
}

/**
 * A customizable Icon component that provides a consistent way to use icons throughout the app.
 * It supports Lucide icons by default and can be easily extended to support custom icon sets.
 */
const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  color = 'text',
  filled = false,
  style,
  iconStyle,
  animated = false,
  animationDuration = 300,
  animationType = 'none',
  mirrorRTL = false,
  testID,
  accessibilityLabel,
  disabled = false,
  disabledOpacity = 0.5,
  onPress,
  onLongPress,
  ...rest
}) => {
  const { theme, isRTL } = useTheme();
  
  // Get the icon component from Lucide
  const IconComponent = useMemo(() => {
    // Check if the icon exists in Lucide
    if (name in LucideIcons) {
      return LucideIcons[name as IconName];
    }
    
    // Return a default icon if the requested icon doesn't exist
    console.warn(`Icon "${name}" not found in Lucide icons. Using "HelpCircle" as fallback.`);
    return LucideIcons.HelpCircle;
  }, [name]);
  
  // Calculate the icon size
  const iconSize = useMemo(() => {
    if (typeof size === 'number') return size;
    
    switch (size) {
      case 'xxs': return 12;
      case 'xs': return 16;
      case 'sm': return 20;
      case 'md': return 24;
      case 'lg': return 32;
      case 'xl': return 40;
      default: return 24;
    }
  }, [size]);
  
  // Calculate the icon color
  const iconColor = useMemo(() => {
    if (!color) return theme.colors.text;
    
    // Check if the color is a theme color
    if (color in theme.colors) {
      return theme.colors[color as keyof typeof theme.colors];
    }
    
    // Return the color as is (e.g., '#FF0000', 'red', 'rgba(255, 0, 0, 0.5)')
    return color;
  }, [color, theme.colors]);
  
  // Handle RTL mirroring
  const rtlStyle = useMemo(() => {
    if (!mirrorRTL || !isRTL) return {};
    
    return {
      transform: [{ scaleX: -1 }],
    };
  }, [isRTL, mirrorRTL]);
  
  // Handle disabled state
  const disabledStyle = useMemo(() => ({
    opacity: disabled ? disabledOpacity : 1,
  }), [disabled, disabledOpacity]);
  
  // Handle animations
  const animationStyle = useMemo(() => {
    if (!animated) return {};
    
    switch (animationType) {
      case 'pulse':
        return {
          animation: `pulse ${animationDuration}ms infinite`,
        };
      case 'spin':
        return {
          animation: `spin ${animationDuration}ms linear infinite`,
        };
      case 'bounce':
        return {
          animation: `bounce ${animationDuration}ms infinite`,
        };
      case 'shake':
        return {
          animation: `shake ${animationDuration}ms infinite`,
        };
      default:
        return {};
    }
  }, [animated, animationType, animationDuration]);
  
  // Render the icon
  const iconElement = (
    <IconComponent
      size={iconSize}
      color={iconColor}
      fill={filled ? iconColor : 'none'}
      style={[
        {
          width: iconSize,
          height: iconSize,
        },
        rtlStyle,
        disabledStyle,
        animationStyle as any,
        iconStyle,
      ]}
      testID={testID}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel || name}
      accessibilityRole={onPress || onLongPress ? 'button' : 'image'}
      {...rest}
    />
  );
  
  // If the icon is pressable, wrap it in a TouchableOpacity
  if (onPress || onLongPress) {
    return (
      <View 
        style={[
          styles.container,
          style,
          disabled && styles.disabled,
        ]}
        pointerEvents={disabled ? 'none' : 'auto'}
      >
        <TouchableOpacity
          onPress={onPress}
          onLongPress={onLongPress}
          disabled={disabled}
          activeOpacity={0.7}
          hitSlop={8}
          style={styles.touchable}
        >
          {iconElement}
        </TouchableOpacity>
      </View>
    );
  }
  
  // Otherwise, just render the icon
  return (
    <View 
      style={[
        styles.container,
        style,
        disabled && styles.disabled,
      ]}
    >
      {iconElement}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchable: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  // Keyframes for animations
  '@keyframes spin': {
    from: { transform: [{ rotate: '0deg' }] },
    to: { transform: [{ rotate: '360deg' }] },
  },
  '@keyframes pulse': {
    '0%': { opacity: 1 },
    '50%': { opacity: 0.5 },
    '100%': { opacity: 1 },
  },
  '@keyframes bounce': {
    '0%, 100%': { transform: [{ translateY: 0 }] },
    '50%': { transform: [{ translateY: -4 }] },
  },
  '@keyframes shake': {
    '0%, 100%': { transform: [{ translateX: 0 }] },
    '25%': { transform: [{ translateX: -2 }] },
    '75%': { transform: [{ translateX: 2 }] },
  },
});

export default Icon;
