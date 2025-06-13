import React, { ReactNode } from 'react';
import { Text as RNText, StyleSheet, TextStyle, TextProps as RNTextProps, StyleProp } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

type TextVariant = 
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'subtitle1' | 'subtitle2'
  | 'body1' | 'body2'
  | 'button' | 'caption' | 'overline';

type TextWeight = 'normal' | 'medium' | 'semiBold' | 'bold' | 'extraBold';

type TextAlign = 'auto' | 'left' | 'right' | 'center' | 'justify';

type TextTransform = 'none' | 'capitalize' | 'uppercase' | 'lowercase';

export interface TextProps extends RNTextProps {
  /**
   * The text to display
   */
  children: ReactNode;
  
  /**
   * The variant of the text (h1, h2, body1, etc.)
   * @default 'body1'
   */
  variant?: TextVariant;
  
  /**
   * The font weight of the text
   */
  weight?: TextWeight;
  
  /**
   * The color of the text
   * Can be a theme color key or a direct color value
   */
  color?: string;
  
  /**
   * The text alignment
   * @default 'auto'
   */
  align?: TextAlign;
  
  /**
   * Whether the text should be underlined
   * @default false
   */
  underline?: boolean;
  
  /**
   * Whether the text should be strikethrough
   * @default false
   */
  strikethrough?: boolean;
  
  /**
   * Whether the text should be italic
   * @default false
   */
  italic?: boolean;
  
  /**
   * Text transform
   * @default 'none'
   */
  transform?: TextTransform;
  
  /**
   * Line height (multiplier)
   */
  lineHeight?: number;
  
  /**
   * Letter spacing
   */
  letterSpacing?: number;
  
  /**
   * Number of lines before truncating with an ellipsis
   */
  numberOfLines?: number;
  
  /**
   * Whether the text should not be selectable
   * @default false
   */
  selectable?: boolean;
  
  /**
   * Custom style to apply to the text
   */
  style?: StyleProp<TextStyle>;
}

/**
 * A customizable Text component that provides consistent typography across the app.
 * It supports various text variants, weights, and styles while maintaining a consistent design system.
 */
const Text: React.FC<TextProps> = ({
  children,
  variant = 'body1',
  weight,
  color,
  align = 'auto',
  underline = false,
  strikethrough = false,
  italic = false,
  transform = 'none',
  lineHeight,
  letterSpacing,
  numberOfLines,
  selectable = false,
  style,
  ...rest
}) => {
  const { theme } = useTheme();
  
  // Get the base styles for the selected variant
  const variantStyles = theme.typography[variant] || {};
  
  // Determine the font family based on weight
  const getFontFamily = (): string => {
    if (italic) {
      switch (weight) {
        case 'medium':
          return 'System';
        case 'semiBold':
        case 'bold':
        case 'extraBold':
          return 'System';
        default:
          return 'System';
      }
    }
    
    switch (weight) {
      case 'medium':
        return 'System';
      case 'semiBold':
      case 'bold':
      case 'extraBold':
        return 'System';
      default:
        return 'System';
    }
  };
  
  // Determine the font weight based on the weight prop or variant
  const getFontWeight = (): TextStyle['fontWeight'] => {
    if (weight) {
      switch (weight) {
        case 'normal':
          return 'normal';
        case 'medium':
          return '500';
        case 'semiBold':
          return '600';
        case 'bold':
          return 'bold';
        case 'extraBold':
          return '800';
        default:
          return undefined;
      }
    }
    
    // Default font weight based on variant if weight is not provided
    if (variant.startsWith('h') || variant === 'button' || variant === 'subtitle1') {
      return '600'; // Semi-bold for headings and buttons
    }
    
    return undefined; // Let the variant style handle it
  };
  
  // Determine the text color
  const getTextColor = (): string => {
    if (color) {
      // Check if the color is a theme color (e.g., 'primary', 'text', 'error')
      return (theme.colors as any)[color] || color;
    }
    
    // Default colors based on variant
    switch (variant) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return theme.colors.text;
      case 'subtitle1':
      case 'subtitle2':
        return theme.colors.textSecondary;
      case 'button':
        return theme.colors.textOnPrimary;
      case 'caption':
      case 'overline':
        return theme.colors.textTertiary;
      default:
        return theme.colors.text;
    }
  };
  
  // Build the text styles
  const textStyles: TextStyle = {
    ...variantStyles,
    fontFamily: getFontFamily(),
    fontWeight: getFontWeight(),
    color: getTextColor(),
    textAlign: align,
    textDecorationLine: underline ? 'underline' : strikethrough ? 'line-through' : 'none',
    textTransform: transform,
    lineHeight: lineHeight ? lineHeight * (variantStyles.fontSize || 16) : undefined,
    letterSpacing,
    fontStyle: italic ? 'italic' : 'normal',
  };
  
  return (
    <RNText
      style={[styles.text, textStyles, style]}
      numberOfLines={numberOfLines}
      selectable={selectable}
      {...rest}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  text: {
    // Base text styles
  },
});

export default Text;
