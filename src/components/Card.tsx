import React, { ReactNode } from 'react';
import { 
  View, 
  StyleSheet, 
  StyleProp, 
  ViewStyle, 
  TouchableOpacity, 
  TouchableOpacityProps,
  ViewProps,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

type CardVariant = 'elevated' | 'outlined' | 'filled' | 'ghost';
type CardElevation = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface CardProps extends ViewProps {
  /**
   * The content of the card
   */
  children: ReactNode;
  
  /**
   * The variant of the card
   * @default 'elevated'
   */
  variant?: CardVariant;
  
  /**
   * The elevation level of the card (shadow)
   * Only applies when variant is 'elevated'
   * @default 'md'
   */
  elevation?: CardElevation;
  
  /**
   * Whether the card is pressable
   * @default false
   */
  pressable?: boolean;
  
  /**
   * Function to call when the card is pressed
   * Only used if pressable is true
   */
  onPress?: () => void;
  
  /**
   * Custom style for the card container
   */
  style?: StyleProp<ViewStyle>;
  
  /**
   * Custom style for the card content
   */
  contentStyle?: StyleProp<ViewStyle>;
  
  /**
   * Border radius of the card
   * @default 12
   */
  borderRadius?: number;
  
  /**
   * Background color of the card
   * Overrides the default background color based on variant
   */
  backgroundColor?: string;
  
  /**
   * Border color of the card
   * Only applies when variant is 'outlined'
   */
  borderColor?: string;
  
  /**
   * Border width of the card
   * Only applies when variant is 'outlined'
   * @default 1
   */
  borderWidth?: number;
  
  /**
   * Padding around the card content
   * @default 16
   */
  padding?: number;
  
  /**
   * Whether to show a loading state
   * @default false
   */
  loading?: boolean;
  
  /**
   * Custom loading component to render
   * If not provided, a default loading indicator will be shown
   */
  loadingComponent?: ReactNode;
}

/**
 * A customizable Card component that can be used to display content in a contained, elevated container.
 * It supports different variants, elevations, and can be made pressable.
 */
const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  elevation = 'md',
  pressable = false,
  onPress,
  style,
  contentStyle,
  borderRadius = 12,
  backgroundColor,
  borderColor,
  borderWidth = 1,
  padding = 16,
  loading = false,
  loadingComponent,
  ...rest
}) => {
  const { theme } = useTheme();
  
  // Determine the base styles based on the variant
  const getVariantStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius,
      overflow: 'hidden',
    };
    
    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          backgroundColor: backgroundColor || theme.colors.surface,
          ...theme.shadows[elevation === 'none' ? 'sm' : elevation],
        };
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: backgroundColor || theme.colors.surface,
          borderWidth,
          borderColor: borderColor || theme.colors.border,
        };
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: backgroundColor || theme.colors.surfaceVariant,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      default:
        return baseStyle;
    }
  };
  
  // Render the card content
  const renderContent = () => (
    <View
      style={[
        styles.content,
        { padding },
        contentStyle,
      ]}
    >
      {loading ? (
        loadingComponent || (
          <View style={styles.loadingContainer}>
            {/* You can replace this with your custom loading component */}
            <Text>Loading...</Text>
          </View>
        )
      ) : (
        children
      )}
    </View>
  );
  
  // If the card is pressable, wrap it in a TouchableOpacity
  if (pressable || onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[getVariantStyles(), style]}
        disabled={loading}
        {...rest as TouchableOpacityProps}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }
  
  // Otherwise, render as a regular View
  return (
    <View
      style={[getVariantStyles(), style]}
      {...rest}
    >
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
  },
});

export default Card;
