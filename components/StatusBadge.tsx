import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

type Status = 
  | 'PENDING_APPROVAL' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'ACTIVE' 
  | 'INACTIVE' 
  | 'COMPLETED' 
  | 'IN_PROGRESS' 
  | 'CANCELLED'
  | string;

type StatusBadgeProps = {
  status: Status;
  style?: ViewStyle;
};

export default function StatusBadge({ status, style }: StatusBadgeProps) {
  const theme = useTheme();
  
  const getStatusConfig = () => {
    switch (status) {
      case 'APPROVED':
      case 'ACTIVE':
      case 'COMPLETED':
        return {
          backgroundColor: theme.colors.successContainer,
          textColor: theme.colors.onSuccessContainer,
          label: status.replace('_', ' ')
        };
      case 'PENDING_APPROVAL':
      case 'IN_PROGRESS':
        return {
          backgroundColor: theme.colors.secondaryContainer,
          textColor: theme.colors.onSecondaryContainer,
          label: status.replace('_', ' ')
        };
      case 'REJECTED':
      case 'CANCELLED':
        return {
          backgroundColor: theme.colors.errorContainer,
          textColor: theme.colors.onErrorContainer,
          label: status.replace('_', ' ')
        };
      case 'INACTIVE':
        return {
          backgroundColor: theme.colors.surfaceVariant,
          textColor: theme.colors.onSurfaceVariant,
          label: status.replace('_', ' ')
        };
      default:
        return {
          backgroundColor: theme.colors.surfaceVariant,
          textColor: theme.colors.onSurfaceVariant,
          label: status
        };
    }
  };

  const { backgroundColor, textColor, label } = getStatusConfig();

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor,
          borderColor: textColor,
        },
        style
      ]}
    >
      <Text 
        style={[
          styles.text, 
          { color: textColor }
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});
