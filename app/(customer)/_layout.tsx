import React from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '../../state/authContext';
import { Redirect } from 'expo-router';

export default function CustomerLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a loading component
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // In a real app, you'd check if user has customer role
  // For now, allow access for demo purposes

  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Customer Portal',
          headerShown: true
        }} 
      />
      <Stack.Screen 
        name="tracking/index" 
        options={{ 
          title: 'Track Shipments',
          headerShown: true
        }} 
      />
    </Stack>
  );
}
