import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from 'react-native-paper';

type ListItemProps = {
  title?: string;
  subtitle?: string;
  left?: (props: { color: string }) => React.ReactNode;
  right?: (props: { color: string }) => React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  children?: React.ReactNode;
};

export default function ListItem({
  title,
  subtitle,
  left,
  right,
  onPress,
  style,
  disabled = false,
  children,
}: ListItemProps) {
  const theme = useTheme();
  const color = theme.colors.onSurface;
  
  const content = children ? (
    <View style={[styles.container, style]}>{children}</View>
  ) : (
    <View style={[styles.container, style]}>
      {left && <View style={styles.left}>{left({ color })}</View>}
      <View style={styles.content}>
        <Text 
          style={[styles.title, { color }]} 
          numberOfLines={1} 
          ellipsizeMode="tail"
        >
          {title}
        </Text>
        {subtitle && (
          <Text 
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {subtitle}
          </Text>
        )}
      </View>
      {right && (
        <View style={styles.right}>
          {right({ color: theme.colors.onSurfaceVariant })}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity 
        onPress={onPress} 
        disabled={disabled}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    minHeight: 56,
  },
  left: {
    marginRight: 16,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  right: {
    marginLeft: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
});
