import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

type ButtonProps = {
  mode?: 'contained' | 'outlined' | 'text';
  onPress: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
  compact?: boolean;
};

export default function Button({
  mode = 'contained',
  onPress,
  children,
  icon,
  style,
  labelStyle,
  disabled = false,
  loading = false,
  compact = false,
}: ButtonProps) {
  const theme = useTheme();
  
  const getButtonStyles = () => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      paddingVertical: compact ? 6 : 10,
      paddingHorizontal: compact ? 12 : 16,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: 64,
      opacity: disabled ? 0.5 : 1,
    };

    switch (mode) {
      case 'contained':
        return {
          ...baseStyle,
          backgroundColor: disabled ? theme.colors.surfaceDisabled : theme.colors.primary,
        };
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: disabled ? theme.colors.surfaceDisabled : theme.colors.outline,
        };
      case 'text':
      default:
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
    }
  };

  const getTextStyles = () => {
    const baseStyle: TextStyle = {
      fontSize: 14,
      fontWeight: '500',
      letterSpacing: 0.5,
      textAlign: 'center',
    };

    switch (mode) {
      case 'contained':
        return {
          ...baseStyle,
          color: theme.colors.onPrimary,
        };
      case 'outlined':
      case 'text':
      default:
        return {
          ...baseStyle,
          color: disabled ? theme.colors.onSurfaceDisabled : theme.colors.primary,
        };
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyles(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {icon && !loading && <View style={styles.iconContainer}>{icon}</View>}
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={mode === 'contained' ? theme.colors.onPrimary : theme.colors.primary} 
        />
      ) : (
        <Text style={[getTextStyles(), labelStyle]}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    marginRight: 8,
  },
});
