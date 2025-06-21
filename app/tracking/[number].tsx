import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';

export default function TrackingRedirectScreen() {
  const theme = useTheme();
  const { number } = useLocalSearchParams();

  useEffect(() => {
    // Redirect to the map screen with the tracking number
    if (number) {
      // Navigate to map with tracking number as a query parameter
      router.replace(`/(admin)/map?tracking=${number}`);
    } else {
      // Navigate to general map screen if no number provided
      router.replace('/(admin)/map');
    }
  }, [number]);

  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: theme.colors.background 
    }}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text variant="bodyMedium" style={{ marginTop: 16 }}>
        Redirecting to map...
      </Text>
    </View>
  );
}
