import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../../state/authContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function DispatcherLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated || user?.appRole !== 'dispatcher') return <Redirect href="/auth/login" />;

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Dashboard', headerShown: false }} />
      <Stack.Screen name="loads" options={{ title: 'Loads', headerShown: false }} />
      <Stack.Screen name="drivers" options={{ title: 'Drivers', headerShown: false }} />
    </Stack>
  );
}
